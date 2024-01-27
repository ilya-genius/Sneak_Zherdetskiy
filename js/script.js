const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const ground = new Image();
ground.src = "img/ground.png";

const foodImg = new Image();
foodImg.src = "img/food.png";

let box = 32;

let score = 0;

let food = {
  x: Math.floor((Math.random() * 17 + 1)) * box,
  y: Math.floor((Math.random() * 15 + 3)) * box,
};

let snake = [];
snake[0] = {
  x: 9 * box,
  y: 10 * box
};

let game; // Объявление переменной для интервала

document.addEventListener("keydown", direction);

let dir;

function direction(event) {
  if (event.keyCode == 37 && dir != "right")
    dir = "left";
  else if (event.keyCode == 38 && dir != "down")
    dir = "up";
  else if (event.keyCode == 39 && dir != "left")
    dir = "right";
  else if (event.keyCode == 40 && dir != "up")
    dir = "down";
}

function eatTail(head, arr) {
  for (let i = 0; i < arr.length; i++) {
    if (head.x == arr[i].x && head.y == arr[i].y)
      clearInterval(game);
  }
}

function drawGame() {
  ctx.drawImage(ground, 0, 0);

  ctx.drawImage(foodImg, food.x, food.y);

  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i == 0 ? "green" : "yellow";
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
  } else {
    snake.pop();
  }

  // Проверка на столкновение с самой собой
  for (let i = 1; i < snake.length; i++) {
    if (snakeX == snake[i].x && snakeY == snake[i].y) {
      clearInterval(game);
      alert("Игра окончена. Ваш счет: " + score);
      restartGame(); // Вызов функции рестарта
      return; // Добавленный код для предотвращения дальнейших операций при завершении игры
    }
  }

  if (snakeX < box || snakeX > box * 17 || snakeY < 3 * box || snakeY > box * 17) {
    clearInterval(game);
    alert("Игра окончена. Ваш счет: " + score);
    restartGame(); // Вызов функции рестарта
    return; // Добавленный код для предотвращения дальнейших операций при завершении игры
  }

  if (dir == "left") snakeX -= box;
  if (dir == "right") snakeX += box;
  if (dir == "up") snakeY -= box;
  if (dir == "down") snakeY += box;

  let newHead = {
    x: snakeX,
    y: snakeY
  };

  // Проверка на выход за границы поля
  if (snakeX < 0) snakeX = box * 17;
  if (snakeX > box * 17) snakeX = 0;
  if (snakeY < 3 * box) snakeY = box * 17;
  if (snakeY > box * 17) snakeY = 3 * box;

  snake.unshift(newHead);
}

function restartGame() {
  const userWantsRestart = confirm("Хотите начать заново?");
  if (userWantsRestart) {
    // Сброс переменных
    score = 0;
    snake = [];
    snake[0] = {
      x: 9 * box,
      y: 10 * box
    };

    dir = undefined;

    food = {
      x: Math.floor((Math.random() * 17 + 1)) * box,
      y: Math.floor((Math.random() * 15 + 3)) * box,
    };

    // Очистка обработчиков событий
    document.removeEventListener("keydown", direction);

    // Рисование змеи после сброса
    drawGame();

    // Сброс интервала
    clearInterval(game);

    // Перезапуск обработчика событий клавиш
    document.addEventListener("keydown", direction);

    // Запуск новой игры
    game = setInterval(drawGame, 100);
  }
}

// Рисование змеи в начале
drawGame();

// Запуск игры
game = setInterval(drawGame, 100);
