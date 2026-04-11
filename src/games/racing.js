export default `
// RACING CLASSIC
// Controls:
// LEFT/RIGHT: steer
// A: restart after crash
// B: exit to standby screen

let playerX = 60;
let roadOffset = 0;
let obstacles = [];
let score = 0;
let gameOver = false;
let exited = false;
let spawnCooldown = 0;

function resetGame() {
  playerX = 60;
  roadOffset = 0;
  obstacles = [];
  score = 0;
  gameOver = false;
  exited = false;
  spawnCooldown = 0;
}

function spawnObstacle() {
  const lane = [30, 60, 90];
  const x = lane[bit.random(0, lane.length - 1)];
  obstacles.push({ x, y: -8 });
}

bit.onPress('b', () => {
  if (!exited) {
    bit.beep(800, 50);
    exited = true;
  }
});

bit.onPress('a', () => {
  if (gameOver || exited) {
    bit.beep(1200, 50);
    resetGame();
  }
});

bit.onPress('left', () => {
  if (!gameOver && !exited) bit.beep(1200, 10);
});

bit.onPress('right', () => {
  if (!gameOver && !exited) bit.beep(1200, 10);
});

function updatePlayer() {
  if (bit.isHeld('left')) playerX -= 3;
  if (bit.isHeld('right')) playerX += 3;

  if (playerX < 10) playerX = 10;
  if (playerX > 110) playerX = 110;
}

function updateObstacles() {
  for (let i = 0; i < obstacles.length; i++) {
    obstacles[i].y += 4;

    const ox = obstacles[i].x;
    const oy = obstacles[i].y;
    const overlapX = Math.abs(ox - playerX) < 8;
    const overlapY = Math.abs(oy - 54) < 8;

    if (overlapX && overlapY) {
      gameOver = true;
      bit.beep(200, 300);
    }
  }

  obstacles = obstacles.filter((o) => o.y < 64);
}

function drawRoad() {
  bit.line(18, 0, 18, 63);
  bit.line(110, 0, 110, 63);

  for (let y = 0; y < 64; y += 10) {
    bit.fill(62, (y + roadOffset) % 64, 4, 6);
  }
}

function drawPlayer() {
  bit.fill(playerX, 54, 8, 8);
}

function drawObstacles() {
  for (let i = 0; i < obstacles.length; i++) {
    const o = obstacles[i];
    bit.fill(o.x, o.y, 8, 8);
  }
}

function drawGameOver() {
  bit.fill(12, 16, 104, 36);

  const title = 'GAME OVER';
  const scoreText = 'SCORE:' + String(score);

  for (let y = 0; y < 7; y++) {
    for (let x = 0; x < 54; x++) {
      if (bit.get(37 + x, 22 + y)) bit.erase(37 + x, 22 + y);
    }
  }
  for (let y = 0; y < 7; y++) {
    for (let x = 0; x < 60; x++) {
      if (bit.get(31 + x, 32 + y)) bit.erase(31 + x, 32 + y);
    }
  }

  bit.text(37, 22, title);
  bit.text(31, 32, scoreText);
  bit.text(26, 42, 'A=RESTART');
}

function drawExited() {
  bit.text(36, 22, 'EXITED');
  bit.text(20, 36, 'LOAD MENU GAME');
  bit.text(26, 50, 'A=RESTART');
}

resetGame();

bit.loop(() => {
  bit.clear();

  if (exited) {
    drawExited();
    return;
  }

  if (gameOver) {
    drawGameOver();
    return;
  }

  updatePlayer();

  roadOffset += 2;

  if (spawnCooldown <= 0) {
    if (bit.random(0, 10) > 7) {
      spawnObstacle();
      spawnCooldown = bit.random(4, 9);
    }
  } else {
    spawnCooldown -= 1;
  }

  updateObstacles();

  score += 1;

  drawRoad();
  drawPlayer();
  drawObstacles();
  bit.text(0, 0, 'S:' + String(score));
  bit.text(0, 56, 'B:EXIT');
});
`;