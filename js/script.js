const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const ground = new Image();
ground.src = "img/ground.png";

const soundImg = new Image();
soundImg.src = "img/mute_sound.png";
const soundImgX = 550;
const soundImgY = 43;

const playPauseImg = new Image();
playPauseImg.src = "img/pause.png";
const playPauseImgX = 510;
const playPauseImgY = 47;

const collisionSound = document.getElementById("collisionSound");
const eatSound = document.getElementById("eatSound");
const moveSound = document.getElementById("moveSound");
const levelDiv = document.getElementById("level");

let box = 32;
let score = 0;
let headColor = "#00ff00"; // Default head color
let bodyColor = "#ff0000"; // Default body color
let foodImageSrc = "img/food.png"; // Default food image
let isGameStarted = false;
let isSoundEnabled = false;
let isPauseEnabled = false;
let difficulty = "easy";
let obstacle = [];
let currentSpeed = 125;

let food = {
  x: Math.floor((Math.random() * 17 + 1)) * box,
  y: Math.floor((Math.random() * 15 + 3)) * box,
};

let snake = [];
snake[0] = {
  x: 9 * box,
  y: 10 * box,
};

let foodImg = new Image(); // Добавлено изображение для еды
foodImg.src = foodImageSrc;

let game; // Объявление переменной для интервала

document.addEventListener("keydown", direction);

document.addEventListener("keydown", toggleSoundOnKeyPress);

canvas.addEventListener("click", function(event) {
  const clickX = event.clientX - canvas.getBoundingClientRect().left;
  const clickY = event.clientY - canvas.getBoundingClientRect().top;

  // Проверяем, что клик был в пределах координат изображения звука
  if (
    clickX >= soundImgX &&
    clickX <= soundImgX + soundImg.width &&
    clickY >= soundImgY &&
    clickY <= soundImgY + soundImg.height
  ) {
    toggleSound();
  }
  if (
    clickX >= playPauseImgX &&
    clickX <= playPauseImgX + playPauseImg.width &&
    clickY >= playPauseImgY &&
    clickY <= playPauseImgY + playPauseImg.height
  ){
    pausePlay();
  }
});
function toggleSoundOnKeyPress(event) {
  if (event.keyCode === 77) {
    toggleSound();
  }
  if (event.keyCode === 27) {
    pausePlay();
  }
}

levelDiv.addEventListener("change", function(event) {
  const selectedDifficulty = event.target.value;
  
  setDifficulty(selectedDifficulty);
});

function setDifficulty(level) {
  difficulty = level;
  // Очистка массива препятствий
  obstacle = [];
  if (difficulty === "easy") {
    currentSpeed = 125;
  } else if (difficulty === "normal") {
    currentSpeed = 100;
    createObstacles(7);
  } else if (difficulty === "hard") {
    currentSpeed = 70;
  }
  console.log(currentSpeed);
}

function createObstacles(count) {
  for (let i = 0; i < count; i++) {
    let obstacleX, obstacleY;
    do {
      obstacleX = Math.floor(Math.random() * 17 + 1) * box;
      obstacleY = Math.floor(Math.random() * 15 + 3) * box;
    } while (
      (obstacleX === food.x && obstacleY === food.y) || // Убедиться, что препятствие не находится на месте еды
      (obstacleX === snake[0].x && obstacleY === snake[0].y) // Убедиться, что препятствие не находится на месте змейки
    );
    obstacle.push({ x: obstacleX, y: obstacleY });
  }
}

function isFoodUnderObstacle() {
  for (let i = 0; i < obstacle.length; i++) {
    if (food.x === obstacle[i].x && food.y === obstacle[i].y) {
      return true;
    }
  }
  return false;
}

function generateFoodCoordinates() {
  let foodX, foodY;
  do {
    foodX = Math.floor((Math.random() * 17 + 1)) * box;
    foodY = Math.floor((Math.random() * 15 + 3)) * box;
  } while (isFoodUnderObstacle(foodX, foodY));
  return { x: foodX, y: foodY };
}

let dir;

function direction(event) {
  if (!isGameStarted) return;
  moveSound.pause();
  moveSound.currentTime = 0;
  
  // Сохраняем текущее направление
  const prevDir = dir;

  if (event.keyCode == 37 && dir != "right") {
    dir = "left";
  } else if (event.keyCode == 38 && dir != "down") {
    dir = "up";
  } else if (event.keyCode == 39 && dir != "left") {
    dir = "right";
  } else if (event.keyCode == 40 && dir != "up") {
    dir = "down";
  }

  // Если направление изменилось, проигрываем звук
  if (dir !== prevDir && isSoundEnabled && !isPauseEnabled) {
    moveSound.play();
  }
}

function initializeCanvasAndFood() {
  const ground = new Image();
  ground.src = "img/ground.png";
  ground.onload = function () {
    drawGame();
  };
}

// Вызываем функцию инициализации сразу после загрузки страницы
window.onload = function () {
  initializeCanvasAndFood();
  updateScoreboard(); // Загрузка таблицы рекордов при загрузке страницы
};

document.getElementById("headColor").addEventListener("input", function () {
  headColor = this.value;
  initializeCanvasAndFood();
});

document.getElementById("foodImage").addEventListener("change", function () {
  foodImageSrc = this.value; // Обновляем значение еды при изменении в выпадающем списке
  foodImg.src = foodImageSrc; // Обновляем изображение еды
  foodImg.onload = function () {
    initializeCanvasAndFood();
  };
});

function eatTail(head, arr) {
  for (let i = 0; i < arr.length; i++) {
    if (head.x == arr[i].x && head.y == arr[i].y) clearInterval(game);
  }
}

function drawGame() {
  ctx.drawImage(ground, 0, 0);
  
  ctx.drawImage(soundImg, soundImgX, soundImgY, 32, 32);

  ctx.drawImage(playPauseImg, playPauseImgX, playPauseImgY, 24, 24);

  ctx.drawImage(foodImg, food.x, food.y);

  ctx.fillStyle = "gray"; // Цвет статических препятствий
  obstacle.forEach((obs) => {
    ctx.fillRect(obs.x, obs.y, box, box);
  });

  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i == 0 ? headColor : bodyColor;
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }

  ctx.fillStyle = "black";
  ctx.font = "50px Arial";
  ctx.fillText(score, box * 8.75, box * 1.9);

  if (isPauseEnabled) {
    return;
  }

  let snakeX = snake[0].x;
  let snakeY = snake[0].y;

  if (snakeX == food.x && snakeY == food.y) {
    score++;
    food = generateFoodCoordinates();
    if (difficulty === "hard") {
      // Генерируем новые препятствия
      obstacle = [];
      createObstacles(Math.floor(Math.random() * 4) + 2);
    }
    if (isSoundEnabled){eatSound.play();}
  } else {
    snake.pop();
  }

  // Проверка на столкновение с самой собой
  for (let i = 1; i < snake.length; i++) {
    if (snakeX == snake[i].x && snakeY == snake[i].y) {
      if (isSoundEnabled){collisionSound.play();}
      clearInterval(game);
      restartGame(); // Вызов функции рестарта
      return;
    }
  }

  // Проверка столкновения головы змеи с препятствиями
  for (let i = 0; i < obstacle.length; i++) {
    if (snakeX === obstacle[i].x && snakeY === obstacle[i].y) {
      if (isSoundEnabled){collisionSound.play();}
      clearInterval(game);
      restartGame(); // Завершение игры
      return;
    }
  }

  if (
    snakeX < box ||
    snakeX > box * 17 ||
    snakeY < 3 * box ||
    snakeY > box * 17
  ) {
    if (isSoundEnabled){collisionSound.play();}
    clearInterval(game);
    restartGame(); // Вызов функции рестарта
    return;
  }

  if (dir == "left") snakeX -= box;
  if (dir == "right") snakeX += box;
  if (dir == "up") snakeY -= box;
  if (dir == "down") snakeY += box;

  let newHead = {
    x: snakeX,
    y: snakeY,
  };

  // Проверка на выход за границы поля
  if (snakeX < 0) snakeX = box * 17;
  if (snakeX > box * 17) snakeX = 0;
  if (snakeY < 3 * box) snakeY = box * 17;
  if (snakeY > box * 17) snakeY = 3 * box;

  snake.unshift(newHead);
}

function restartGame() {
  if (difficulty === "hard"){
    obstacle = [];
  }
  saveScore(document.getElementById("playerName").value, score);
  const restartConfirm = confirm(
    "Игра окончена. Ваш счет: " + score + "\nЖелаете начать заново?"
  );
  if (restartConfirm) {
    score = 0;
    snake = [];
    snake[0] = {
      x: 9 * box,
      y: 10 * box,
    };

    dir = undefined;

    food = generateFoodCoordinates();

    document.removeEventListener("keydown", direction);

    drawGame();

    clearInterval(game);

    document.addEventListener("keydown", direction);

    game = setInterval(drawGame, currentSpeed);
  } else {
    resetGame();
  }
}

function resetGame() {
  const instructionsList = document.querySelector("#instructions ul");
  const itemsToRemove = instructionsList.querySelectorAll("li:nth-last-child(-n+2)");
  itemsToRemove.forEach(item => {
    instructionsList.removeChild(item);
  });
  isGameStarted = false;
  document.getElementById("menu").style.display = "block";
  score = 0;
  snake = [];
  snake[0] = {
    x: 9 * box,
    y: 10 * box,
  };

  dir = undefined;

  food = generateFoodCoordinates();

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  initializeCanvasAndFood();
  drawGame();
  game = setInterval(drawGame, currentSpeed);
}

function startGame() {
  const playerName = document.getElementById("playerName").value;
  if (!playerName) {
    alert("Пожалуйста, введите ваше имя.");
    return;
  }

  const instructionsList = document.querySelector("#instructions ul");
  const playerNameItem = document.createElement("li");
  playerNameItem.innerHTML = `<strong>Никнейм:</strong> ${playerName}`;
  instructionsList.appendChild(playerNameItem);

  diffic_ru = "Легкий";
  if (difficulty === "easy"){
    diffic_ru = "Легкий";
  }
  else if (difficulty === "normal"){
    diffic_ru = "Нормальный";
  }
  else{
    diffic_ru = "Сложный";
  }
  const difficultyItem = document.createElement("li");
  difficultyItem.innerHTML = `<strong>Уровень сложности:</strong> ${diffic_ru}`;
  instructionsList.appendChild(difficultyItem);

  isGameStarted = true;
  bodyColor = document.getElementById("bodyColor").value;

  const foodImageSelect = document.getElementById("foodImage");
  const selectedFoodImage =
    foodImageSelect.options[foodImageSelect.selectedIndex].value;

  foodImageSrc = selectedFoodImage;
  const img = new Image();
  img.onload = function () {
    ctx.clearRect(food.x, food.y, box, box);
    ctx.drawImage(img, food.x, food.y, box, box);
    initializeGame();
  };
  img.src = foodImageSrc;
}

function initializeGame() {
  document.getElementById("menu").style.display = "none";
  document.getElementById("game").style.display = "block";
  clearInterval(game);
  document.removeEventListener("keydown", direction);
  drawGame();
  document.addEventListener("keydown", direction);
  game = setInterval(drawGame, currentSpeed);
}

function toggleSound() {
  if (isSoundEnabled) {
      soundImg.src = "img/mute_sound.png";
  } else {
    soundImg.src = "img/sound.png";
  }
  
  isSoundEnabled = !isSoundEnabled;
}

function pausePlay(){
  if (isPauseEnabled){
    playPauseImg.src = "img/pause.png";
  } else{
    playPauseImg.src = "img/play.png";
  }

  isPauseEnabled = !isPauseEnabled;
}

function updateScoreboard() {
  const recordsTable = document.getElementById("records-table");
  recordsTable.innerHTML = ""; // Очищаем предыдущие записи

  const scores = JSON.parse(localStorage.getItem("snakeScores")) || [];

  scores.forEach((record, index) => {
    const row = recordsTable.insertRow();
    const cell1 = row.insertCell(0);
    const cell2 = row.insertCell(1);
    const cell3 = row.insertCell(2);
    const cell4 = row.insertCell(3);

    cell1.textContent = `${index + 1}`;
    cell2.textContent = record.name;
    cell3.textContent = ""; // Добавление точек между Никнеймом и Счетом
    cell4.textContent = record.score;
  });
}

function saveScore(playerName, score) {
  const scores = JSON.parse(localStorage.getItem("snakeScores")) || [];

  const existingScoreIndex = scores.findIndex(
    (record) => record.name === playerName
  );

  if (existingScoreIndex !== -1) {
    if (score > scores[existingScoreIndex].score) {
      scores[existingScoreIndex].score = score;
    }
  } else {
    scores.push({ name: playerName, score: score });
  }

  scores.sort((a, b) => b.score - a.score);
  scores.splice(5);

  localStorage.setItem("snakeScores", JSON.stringify(scores));

  updateScoreboard();
}

// Рисование змеи в начале
drawGame();

// Запуск игры
game = setInterval(drawGame, currentSpeed);
