// GyanBit Studio — Snake Game (small cells, proper speed)
export default `
// SNAKE — Classic Snake Game
// Controls: Arrow Keys / D-Pad  |  START to restart

// 32x16 grid with 4px cells = 128x64 exactly
const COLS = 32, ROWS = 16, CS = 4;
const HUD_H = 8; // top 8px for HUD
const PLAY_ROWS = 14; // rows below HUD (y=8 to y=63)

let snake, dir, nextDir, apple, score, speed, tick, alive;

function init() {
  snake = [{x:10,y:7},{x:9,y:7},{x:8,y:7},{x:7,y:7}];
  dir = {x:1,y:0};
  nextDir = {x:1,y:0};
  score = 0; speed = 8; tick = 0; alive = true;
  spawnApple();
}

function spawnApple() {
  let a;
  do { a = { x: bit.random(0,COLS-1), y: bit.random(1,ROWS-1) }; }
  while (snake.some(s => s.x===a.x && s.y===a.y));
  apple = a;
}

function tx(gx) { return gx * CS; }
function ty(gy) { return gy * CS; }

bit.onPress('up',    () => { if (dir.y === 0 && alive) nextDir = {x:0,y:-1}; });
bit.onPress('down',  () => { if (dir.y === 0 && alive) nextDir = {x:0,y:1};  });
bit.onPress('left',  () => { if (dir.x === 0 && alive) nextDir = {x:-1,y:0}; });
bit.onPress('right', () => { if (dir.x === 0 && alive) nextDir = {x:1,y:0};  });
bit.onPress('start', () => { if (!alive) init(); });

init();

bit.loop(() => {
  bit.clear();

  if (!alive) {
    bit.text(16, 16, 'GAME OVER');
    bit.text(16, 28, 'SC:' + score);
    bit.text(8,  42, 'PRESS START');
    return;
  }

  tick++;
  if (tick >= speed) {
    tick = 0;
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // Wall wrapping? No — collision kills
    if (head.x < 0 || head.x >= COLS || head.y < 1 || head.y >= ROWS) {
      alive = false; bit.beep(160, 300); return;
    }
    if (snake.some(s => s.x===head.x && s.y===head.y)) {
      alive = false; bit.beep(160, 300); return;
    }

    snake.unshift(head);
    if (head.x === apple.x && head.y === apple.y) {
      score++;
      bit.beep(900, 40);
      spawnApple();
      if (score % 5 === 0) speed = Math.max(2, speed - 1);
    } else {
      snake.pop();
    }
  }

  // HUD
  bit.line(0, 7, 127, 7);
  bit.text(0, 0, 'SNAKE');
  bit.text(90, 0, 'S:' + score);

  // Apple (blinks)
  if (Math.floor(bit.frame/10) % 2 === 0) {
    bit.fill(tx(apple.x)+1, ty(apple.y)+1, 2, 2);
  }

  // Snake — head is 3x3, body is 2x2
  for (let i = 0; i < snake.length; i++) {
    const s = snake[i];
    if (i === 0) {
      bit.fill(tx(s.x), ty(s.y), CS, CS); // full head
    } else {
      bit.fill(tx(s.x)+1, ty(s.y)+1, CS-2, CS-2); // small body
    }
  }
});
`;
