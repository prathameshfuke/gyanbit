// GyanBit Studio — Breakout (tuned ball speed)
export default `
// BREAKOUT — Brick-breaking action
// Controls: Left / Right  |  START to restart

const BRK_COLS = 8, BRK_ROWS = 4;
const BW = 13, BH = 3;
const PAD_W = 20, PAD_H = 2;
const BALL_R = 1;

let bricks, ball, paddle, score, lives, state;

function mkBricks() {
  const b = [];
  for (let r = 0; r < BRK_ROWS; r++) {
    for (let c = 0; c < BRK_COLS; c++) {
      b.push({ x: 4 + c*(BW+1), y: 2 + r*(BH+2), alive: true });
    }
  }
  return b;
}

function init() {
  bricks = mkBricks();
  paddle = { x: 54, y: 60 };
  // Ball speed: 1.0px/frame at 30fps ensures steady, playable pacing for beginners
  ball = { x: 64, y: 50, vx: 1.0, vy: -1.2 };
  score = 0; lives = 3; state = 'play';
}

init();

bit.onHold('left',  () => { if (state==='play') paddle.x = Math.max(0, paddle.x-3); });
bit.onHold('right', () => { if (state==='play') paddle.x = Math.min(128-PAD_W, paddle.x+3); });
bit.onPress('a',    () => { if (state==='play') paddle.x = Math.min(128-PAD_W, paddle.x+8); });
bit.onPress('start',() => { if (state!=='play') init(); });

bit.loop(() => {
  bit.clear();

  if (state !== 'play') {
    const won = state==='win';
    bit.text(won?20:16, 16, won ? 'YOU WIN!' : 'GAME OVER');
    bit.text(20, 30, 'SC:' + score);
    bit.text(10, 46, 'PRESS START');
    return;
  }

  // Move ball
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Walls
  if (ball.x <= 1)   { ball.x=1;   ball.vx= Math.abs(ball.vx); bit.beep(300,15); }
  if (ball.x >= 126) { ball.x=126; ball.vx=-Math.abs(ball.vx); bit.beep(300,15); }
  if (ball.y <= 1)   { ball.y=1;   ball.vy= Math.abs(ball.vy); bit.beep(300,15); }

  const bx = Math.round(ball.x), by = Math.round(ball.y);

  // Paddle hit
  if (by >= paddle.y-1 && by <= paddle.y+PAD_H &&
      bx >= paddle.x-1 && bx <= paddle.x+PAD_W+1) {
    ball.vy = -Math.abs(ball.vy);
    const rel = (ball.x - (paddle.x + PAD_W/2)) / (PAD_W/2);
    ball.vx = rel * 3.0;
    if (Math.abs(ball.vx) < 0.5) ball.vx = ball.vx >= 0 ? 0.5 : -0.5;
    bit.beep(550,20);
  }

  // Fall below paddle
  if (ball.y > 66) {
    lives--;
    bit.beep(160, 350);
    if (lives <= 0) { state='over'; return; }
    ball = { x: paddle.x+PAD_W/2, y: 52, vx:1.0, vy:-1.2 };
  }

  // Brick hit
  for (const b of bricks) {
    if (!b.alive) continue;
    if (bx >= b.x-1 && bx <= b.x+BW+1 && by >= b.y-1 && by <= b.y+BH+1) {
      b.alive = false;
      ball.vy *= -1;
      score += 10;
      bit.beep(800, 20);
      break;
    }
  }

  if (bricks.every(b => !b.alive)) { state='win'; bit.beep(1200,600); return; }

  // Draw bricks — alternate row patterns for visual interest
  for (const b of bricks) {
    if (b.alive) bit.box(b.x, b.y, BW, BH);
  }

  // Ball — 3x3 square
  bit.fill(bx-1, by-1, 3, 3);

  // Paddle
  bit.fill(paddle.x, paddle.y, PAD_W, PAD_H);

  // HUD
  bit.text(0, 57, 'L:' + lives);
  bit.text(50, 57, 'SC:' + score);
});
`;
