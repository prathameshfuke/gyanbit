export default `
// GYANBIT ARCADE MENU
// Controls:
// UP/DOWN: Navigate menu
// A: Select
// B: Back from game
// START: Wake from sleep

const STATE = {
  BOOT_ONE: 0,
  BOOT_TWO: 1,
  MENU: 2,
  NEW_SCREEN: 3,
  SLEEP_ANIM: 4,
  SLEEP: 5,
  SNAKE: 6,
  RACING: 7,
};

const FPS = 30;
const BOOT_ONE_FRAMES = 5 * FPS;
const BOOT_TWO_FRAMES = 2 * FPS;
const NEW_SCREEN_FRAMES = 5 * FPS;
const IDLE_TIMEOUT_FRAMES = 15 * FPS;

const menuItems = ['Snake', 'Racing', 'New Game'];
let state = STATE.BOOT_ONE;
let stateFrames = 0;
let menuIndex = 0;
let lastInputFrame = 0;

// ---- Snake mode ----
const SNAKE_CELL = 4;
const SNAKE_COLS = 32;
const SNAKE_ROWS = 16;
const SNAKE_FOOD_MIN_X = 1;
const SNAKE_FOOD_MAX_X = SNAKE_COLS - 2;
const SNAKE_FOOD_MIN_Y = 2;
const SNAKE_FOOD_MAX_Y = 13;
let snake = [];
let snakeDir = { x: 1, y: 0 };
let snakeNextDir = { x: 1, y: 0 };
let snakeFood = { x: 12, y: 8 };
let snakeTick = 0;
let snakeScore = 0;
let snakeDead = false;

// ---- Racing mode ----
let playerX = 60;
let roadOffset = 0;
let obstacles = [];
let raceScore = 0;
let raceOver = false;

function touch() {
  lastInputFrame = bit.frame;
}

function setState(nextState) {
  state = nextState;
  stateFrames = 0;
}

function rand(min, max) {
  return bit.random(min, max);
}

function spawnSnakeFood() {
  let f;
  do {
    f = {
      x: rand(SNAKE_FOOD_MIN_X, SNAKE_FOOD_MAX_X),
      y: rand(SNAKE_FOOD_MIN_Y, SNAKE_FOOD_MAX_Y)
    };
  } while (snake.some((s) => s.x === f.x && s.y === f.y));
  snakeFood = f;
}

function initSnake() {
  snake = [
    { x: 10, y: 7 },
    { x: 9, y: 7 },
    { x: 8, y: 7 },
  ];
  snakeDir = { x: 1, y: 0 };
  snakeNextDir = { x: 1, y: 0 };
  snakeTick = 0;
  snakeScore = 0;
  snakeDead = false;
  spawnSnakeFood();
}

function initRacing() {
  playerX = 60;
  roadOffset = 0;
  obstacles = [];
  raceScore = 0;
  raceOver = false;
}

function onMenuButton(btn) {
  if (btn === 'up') {
    menuIndex = (menuIndex + menuItems.length - 1) % menuItems.length;
    bit.beep(1200, 25);
  }
  if (btn === 'down') {
    menuIndex = (menuIndex + 1) % menuItems.length;
    bit.beep(1200, 25);
  }
  if (btn === 'a') {
    bit.beep(1500, 50);
    if (menuIndex === 0) {
      initSnake();
      setState(STATE.SNAKE);
    } else if (menuIndex === 1) {
      initRacing();
      setState(STATE.RACING);
    } else {
      setState(STATE.NEW_SCREEN);
    }
  }
}

function onSnakeButton(btn) {
  if (btn === 'b') {
    setState(STATE.MENU);
    return;
  }
  if (snakeDead && (btn === 'a' || btn === 'start')) {
    initSnake();
    bit.beep(1300, 40);
    return;
  }

  if (btn === 'up' && snakeDir.y === 0) snakeNextDir = { x: 0, y: -1 };
  if (btn === 'down' && snakeDir.y === 0) snakeNextDir = { x: 0, y: 1 };
  if (btn === 'left' && snakeDir.x === 0) snakeNextDir = { x: -1, y: 0 };
  if (btn === 'right' && snakeDir.x === 0) snakeNextDir = { x: 1, y: 0 };
}

function onRacingButton(btn) {
  if (btn === 'b') {
    setState(STATE.MENU);
    return;
  }
  if (raceOver && (btn === 'a' || btn === 'start')) {
    initRacing();
    bit.beep(1200, 45);
    return;
  }

  if (!raceOver && btn === 'left') {
    playerX -= 6;
    bit.beep(1200, 10);
  }
  if (!raceOver && btn === 'right') {
    playerX += 6;
    bit.beep(1200, 10);
  }
}

function onAnyButton(btn) {
  touch();

  if (state === STATE.SLEEP || state === STATE.SLEEP_ANIM) {
    bit.beep(1000, 40);
    setState(STATE.MENU);
    return;
  }

  if (btn === 'start' && (state === STATE.BOOT_ONE || state === STATE.BOOT_TWO)) {
    setState(STATE.MENU);
    return;
  }

  if (state === STATE.MENU) onMenuButton(btn);
  if (state === STATE.SNAKE) onSnakeButton(btn);
  if (state === STATE.RACING) onRacingButton(btn);
  if (state === STATE.NEW_SCREEN && (btn === 'b' || btn === 'start')) setState(STATE.MENU);
}

['up', 'down', 'left', 'right', 'a', 'b', 'start'].forEach((btn) => {
  bit.onPress(btn, () => onAnyButton(btn));
});

function drawBootOne() {
  bit.box(10, 12, 108, 40);
  bit.text(30, 20, 'Build It');
  bit.text(32, 32, 'Code It');
  bit.text(32, 44, 'Play It');
}

function drawBootTwo() {
  bit.fill(10, 20, 108, 20);
  for (let y = 0; y < 7; y++) {
    for (let x = 0; x < 35; x++) {
      if (bit.get(30 + x, 26 + y)) bit.erase(30 + x, 26 + y);
    }
  }
  bit.text(30, 26, 'GYANBIT');
}

function drawMenu() {
  bit.text(30, 0, 'GYANBIT');
  for (let i = 0; i < menuItems.length; i++) {
    const y = 18 + i * 14;
    if (i === menuIndex) {
      bit.fill(0, y - 2, 128, 12);
      for (let ty = 0; ty < 7; ty++) {
        for (let tx = 0; tx < 60; tx++) {
          if (bit.get(35 + tx, y + ty)) bit.erase(35 + tx, y + ty);
        }
      }
      bit.text(35, y, menuItems[i]);
    } else {
      bit.text(35, y, menuItems[i]);
    }
  }
  bit.text(0, 54, 'A:Play  B:Idle');
}

function drawNewGameScreen() {
  bit.text(34, 22, 'Code It');
  bit.text(34, 36, 'Play It');
}

function drawSleepAnim() {
  const stage = Math.min(5, Math.floor(stateFrames / 5));
  const eyeH = Math.max(1, 6 - stage);
  bit.fill(40, 20, 8, eyeH);
  bit.fill(80, 20, 8, eyeH);
  bit.text(60, 40, '-');
}

function drawSleep() {
  bit.text(40, 25, '-   -');
  bit.text(55, 40, '_');
  if (Math.floor(bit.frame / 20) % 2 === 0) {
    bit.text(18, 54, 'PRESS START');
  }
}

function updateSnake() {
  if (snakeDead) return;

  snakeTick++;
  if (snakeTick < 6) return;
  snakeTick = 0;

  snakeDir = snakeNextDir;
  const head = {
    x: snake[0].x + snakeDir.x,
    y: snake[0].y + snakeDir.y,
  };

  if (head.x < 0 || head.x >= SNAKE_COLS || head.y < 1 || head.y >= SNAKE_ROWS) {
    snakeDead = true;
    bit.beep(220, 250);
    return;
  }

  if (snake.some((s) => s.x === head.x && s.y === head.y)) {
    snakeDead = true;
    bit.beep(220, 250);
    return;
  }

  snake.unshift(head);

  if (head.x === snakeFood.x && head.y === snakeFood.y) {
    snakeScore += 1;
    bit.beep(900, 45);
    spawnSnakeFood();
  } else {
    snake.pop();
  }
}

function drawSnake() {
  bit.line(0, 7, 127, 7);
  bit.text(1, 0, 'SNAKE');
  bit.text(90, 0, 'S:' + String(snakeScore));

  const fx = snakeFood.x * SNAKE_CELL;
  const fy = snakeFood.y * SNAKE_CELL;
  bit.fill(fx + 1, fy + 1, 2, 2);

  for (let i = 0; i < snake.length; i++) {
    const s = snake[i];
    const x = s.x * SNAKE_CELL;
    const y = s.y * SNAKE_CELL;
    if (i === 0) {
      bit.fill(x, y, 4, 4);
    } else {
      bit.fill(x + 1, y + 1, 2, 2);
    }
  }

  if (snakeDead) {
    bit.fill(14, 18, 100, 28);
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 54; x++) {
        if (bit.get(37 + x, 24 + y)) bit.erase(37 + x, 24 + y);
      }
    }
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 48; x++) {
        if (bit.get(40 + x, 34 + y)) bit.erase(40 + x, 34 + y);
      }
    }
    bit.text(37, 24, 'GAME OVER');
    bit.text(40, 34, 'A:Retry');
    bit.text(40, 42, 'B:Menu');
  } else {
    bit.text(0, 56, 'B:Menu');
  }
}

function spawnObstacle() {
  const laneX = [30, 60, 90];
  const x = laneX[rand(0, laneX.length - 1)];
  obstacles.push({ x, y: 0 });
}

function updateRacing() {
  if (raceOver) return;

  if (playerX < 10) playerX = 10;
  if (playerX > 110) playerX = 110;

  roadOffset += 2;
  if (rand(0, 10) > 8) spawnObstacle();

  for (let i = 0; i < obstacles.length; i++) {
    const o = obstacles[i];
    o.y += 4;
    if (Math.abs(o.x - playerX) < 8 && Math.abs(o.y - 54) < 8) {
      raceOver = true;
      bit.beep(200, 320);
    }
  }

  obstacles = obstacles.filter((o) => o.y < 64);
  raceScore += 1;
}

function drawRoad() {
  bit.line(18, 0, 18, 63);
  bit.line(110, 0, 110, 63);
  for (let y = 0; y < 64; y += 10) {
    bit.fill(62, (y + roadOffset) % 64, 4, 6);
  }
}

function drawRacing() {
  drawRoad();
  bit.fill(playerX, 54, 8, 8);
  for (let i = 0; i < obstacles.length; i++) {
    const o = obstacles[i];
    bit.fill(o.x, o.y, 8, 8);
  }

  bit.text(0, 0, 'S:' + String(raceScore));

  if (raceOver) {
    bit.fill(16, 18, 96, 32);
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 54; x++) {
        if (bit.get(37 + x, 24 + y)) bit.erase(37 + x, 24 + y);
      }
    }
    bit.text(37, 24, 'GAME OVER');
    bit.text(32, 34, 'A:Restart');
    bit.text(40, 42, 'B:Menu');
  } else {
    bit.text(0, 56, 'B:Menu');
  }
}

bit.loop(() => {
  bit.clear();
  stateFrames += 1;

  if (state === STATE.BOOT_ONE) {
    drawBootOne();
    if (stateFrames >= BOOT_ONE_FRAMES) setState(STATE.BOOT_TWO);
    return;
  }

  if (state === STATE.BOOT_TWO) {
    drawBootTwo();
    if (stateFrames >= BOOT_TWO_FRAMES) {
      touch();
      setState(STATE.MENU);
    }
    return;
  }

  if (state === STATE.NEW_SCREEN) {
    drawNewGameScreen();
    if (stateFrames >= NEW_SCREEN_FRAMES) setState(STATE.MENU);
    return;
  }

  if (state === STATE.SLEEP_ANIM) {
    drawSleepAnim();
    if (stateFrames >= 30) setState(STATE.SLEEP);
    return;
  }

  if (state === STATE.SLEEP) {
    drawSleep();
    return;
  }

  if (state === STATE.SNAKE) {
    updateSnake();
    drawSnake();
    return;
  }

  if (state === STATE.RACING) {
    updateRacing();
    drawRacing();
    return;
  }

  drawMenu();
  if (bit.frame - lastInputFrame > IDLE_TIMEOUT_FRAMES) {
    setState(STATE.SLEEP_ANIM);
  }
});
`;