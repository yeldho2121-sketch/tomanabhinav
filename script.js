const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const startButton = document.getElementById("startButton");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let apple = { x: 0, y: 0 };
let score = 0;
let bestScore = Number(localStorage.getItem("snake-best") || 0);
let running = false;
let paused = false;
let gameOver = false;
let tickId = null;

function updateScore() {
  scoreEl.textContent = score;
  bestEl.textContent = bestScore;
}

function showOverlay(title, text, buttonText) {
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  startButton.textContent = buttonText;
  overlay.style.display = "flex";
}

function hideOverlay() {
  overlay.style.display = "none";
}

function randomApple() {
  let newApple;
  do {
    newApple = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };
  } while (snake.some((segment) => segment.x === newApple.x && segment.y === newApple.y));
  return newApple;
}

function drawBoard() {
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(148, 163, 184, 0.15)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= tileCount; i += 1) {
    ctx.beginPath();
    ctx.moveTo(i * gridSize, 0);
    ctx.lineTo(i * gridSize, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * gridSize);
    ctx.lineTo(canvas.width, i * gridSize);
    ctx.stroke();
  }
}

function drawSnake() {
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? "#22c55e" : "#4ade80";
    ctx.fillRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2);
  });
}

function drawApple() {
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(apple.x * gridSize + gridSize / 2, apple.y * gridSize + gridSize / 2, gridSize / 2.2, 0, Math.PI * 2);
  ctx.fill();
}

function draw() {
  drawBoard();
  drawApple();
  drawSnake();
}

function resetGame() {
  snake = [{ x: 10, y: 10 }];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  gameOver = false;
  paused = false;
  updateScore();
  apple = randomApple();
  draw();
}

function startGame() {
  if (tickId) {
    clearInterval(tickId);
  }
  resetGame();
  running = true;
  hideOverlay();
  tickId = setInterval(gameLoop, 120);
}

function pauseGame() {
  if (!running || gameOver) return;
  paused = true;
  showOverlay("Paused", "Press resume or hit space to continue.", "Resume");
}

function resumeGame() {
  if (!running || gameOver) return;
  paused = false;
  hideOverlay();
}

function endGame() {
  running = false;
  gameOver = true;
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("snake-best", bestScore);
    updateScore();
  }
  showOverlay("Game Over", `You scored ${score}. Press play to try again.`, "Play Again");
}

function collision(head) {
  const outOfBounds = head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount;
  const body = snake.slice(0, -1);
  const hitSelf = body.some((segment) => segment.x === head.x && segment.y === head.y);
  return outOfBounds || hitSelf;
}

function gameLoop() {
  if (!running || paused) return;

  direction = nextDirection;
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  if (collision(head)) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === apple.x && head.y === apple.y) {
    score += 1;
    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem("snake-best", bestScore);
    }
    updateScore();
    apple = randomApple();
  } else {
    snake.pop();
  }

  draw();
}

function handleDirection(key) {
  if (key === "ArrowUp" || key === "w") {
    if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
  } else if (key === "ArrowDown" || key === "s") {
    if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
  } else if (key === "ArrowLeft" || key === "a") {
    if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
  } else if (key === "ArrowRight" || key === "d") {
    if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
  }
}

document.addEventListener("keydown", (event) => {
  const key = event.key;
  const lowered = key.toLowerCase();

  if (lowered === " ") {
    event.preventDefault();
    if (!running || gameOver) {
      startGame();
    } else if (paused) {
      resumeGame();
    } else {
      pauseGame();
    }
    return;
  }

  if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(lowered)) {
    event.preventDefault();
    handleDirection(key);
  }
});

startButton.addEventListener("click", () => {
  if (!running || gameOver) {
    startGame();
  } else if (paused) {
    resumeGame();
  } else {
    pauseGame();
  }
});

updateScore();
draw();
showOverlay("Snake Game", "Eat apples, grow longer, and avoid crashing.", "Start Game");
