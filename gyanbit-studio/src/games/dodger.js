// GyanBit Studio — Dodger Game (fixed for 128x64)
export default `
// DODGER — Avoid falling rocks!
// Controls: Left / Right  |  START to restart

const PLAYER_W = 7, PLAYER_H = 5;
const ROCK_W = 5, ROCK_H = 4;
const MAX_ROCKS = 4;

let player, rocks, score, speed, alive, hiScore, spawnCd;

function init(keepHi) {
  player = { x: 60, y: 56 };
  rocks = [];
  score = 0; speed = 1.0; alive = true; spawnCd = 0;
  if (!keepHi) hiScore = 0;
}

function collides(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx+bw && ax+aw > bx && ay < by+bh && ay+ah > by;
}

init(false);

bit.onHold('left',  () => { if (alive) player.x = Math.max(0, player.x - 2); });
bit.onHold('right', () => { if (alive) player.x = Math.min(128 - PLAYER_W, player.x + 2); });
bit.onPress('start', () => { if (!alive) init(true); });

bit.loop(() => {
  bit.clear();

  if (!alive) {
    bit.text(14, 10, 'GAME OVER');
    bit.text(8,  24, 'SCORE ' + score);
    bit.text(8,  38, 'BEST  ' + hiScore);
    bit.text(4,  52, 'START AGAIN');
    return;
  }

  score++;
  if (score > hiScore) hiScore = score;
  // Increase speed every 200 frames
  if (score % 200 === 0) speed = Math.min(3.5, speed + 0.25);

  // Spawn rock
  spawnCd--;
  const spawnRate = Math.max(12, 35 - Math.floor(score / 150));
  if (spawnCd <= 0 && rocks.length < MAX_ROCKS) {
    rocks.push({ x: bit.random(0, 122), y: -ROCK_H, vy: speed + Math.random() * 0.6 });
    spawnCd = spawnRate;
  }

  // Update rocks
  for (let i = rocks.length - 1; i >= 0; i--) {
    rocks[i].y += rocks[i].vy;
    if (rocks[i].y > 68) { rocks.splice(i, 1); continue; }
    if (collides(player.x, player.y, PLAYER_W, PLAYER_H,
                 rocks[i].x, Math.round(rocks[i].y), ROCK_W, ROCK_H)) {
      alive = false;
      bit.beep(120, 400);
      return;
    }
  }

  // Draw player (arrow / ship shape)
  bit.fill(player.x + 2, player.y, 3, 2);
  bit.fill(player.x,     player.y + 2, PLAYER_W, 3);

  // Draw rocks
  for (const r of rocks) {
    const ry = Math.round(r.y);
    bit.box(r.x, ry, ROCK_W, ROCK_H);
    bit.dot(r.x + 2, ry + 1);
  }

  // HUD at top
  bit.text(0, 0, 'SCORE:' + score);
  bit.text(80, 0, 'B:' + hiScore);
  // Ground line
  bit.line(0, 63, 127, 63);
});
`;
