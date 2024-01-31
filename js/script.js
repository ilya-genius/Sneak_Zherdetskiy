const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const ground = new Image();
ground.src = "img/ground.png";

const soundImg = new Image();
soundImg.src = "img/mute_sound.png";
const soundImgX = 550
const soundImgY = 43

const collisionSound = document.getElementById("collisionSound");
const eatSound = document.getElementById("eatSound");
const moveSound = document.getElementById("moveSound");

let box = 32;
let score = 0;
let headColor = "#00ff00"; // Default head color
let bodyColor = "#ff0000"; // Default body color
let foodImageSrc = "img/food.png"; // Default food image
let isGameStarted = false;
let isSoundEnabled = false;

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
});
function toggleSoundOnKeyPress(event) {
  if (event.keyCode === 77) {
    toggleSound();
  }
}

let dir;

function direction(event) {
  if (!isGameStarted) return;
  moveSound.pause()
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
  if (dir !== prevDir && isSoundEnabled) {
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

  ctx.drawImage(foodImg, food.x, food.y);

  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i == 0 ? headColor : bodyColor;
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }

  ctx.fillStyle = "black";
  ctx.font = "50px Arial";
  ctx.fillText(score, box * 8.75, box * 1.9);

  let snakeX = snake[0].x;
  let snakeY = snake[0].y;

  if (snakeX == food.x && snakeY == food.y) {
    score++;
    food = {
      x: Math.floor((Math.random() * 17 + 1)) * box,
      y: Math.floor((Math.random() * 15 + 3)) * box,
    };
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

    food = {
      x: Math.floor((Math.random() * 17 + 1)) * box,
      y: Math.floor((Math.random() * 15 + 3)) * box,
    };

    document.removeEventListener("keydown", direction);

    drawGame();

    clearInterval(game);

    document.addEventListener("keydown", direction);

    game = setInterval(drawGame, 100);
  } else {
    resetGame();
  }
}

function resetGame() {
  isGameStarted = false;
  document.getElementById("menu").style.display = "block";
  score = 0;
  snake = [];
  snake[0] = {
    x: 9 * box,
    y: 10 * box,
  };

  dir = undefined;

  food = {
    x: Math.floor((Math.random() * 17 + 1)) * box,
    y: Math.floor((Math.random() * 15 + 3)) * box,
  };

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  initializeCanvasAndFood();
  drawGame();
  game = setInterval(drawGame, 100);
}

function startGame() {
  const playerName = document.getElementById("playerName").value;
  if (!playerName) {
    alert("Пожалуйста, введите ваше имя.");
    return;
  }
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
  game = setInterval(drawGame, 100);
}

function toggleSound() {
  if (isSoundEnabled) {
      soundImg.src = "img/mute_sound.png"
  } else {
    soundImg.src = "img/sound.png"
  }
  
  isSoundEnabled = !isSoundEnabled;
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
game = setInterval(drawGame, 100);
