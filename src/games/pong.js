// GyanBit Studio — Pong (tuned ball speed)
export default `
// PONG — Single player vs AI
// Controls: Up / Down arrows  |  START to restart

const PAD_H = 12, PAD_W = 3;
const WIN = 7;

let ball, pY, aY, pSc, aSc, state, speed;

function init() {
  // Start slow, increase over time
  speed = 1;
  ball = { x:64, y:32, vx:1.5, vy:1.0 };
  pY=26; aY=26; pSc=0; aSc=0; state='play';
}

init();

bit.onHold('up',    () => { if(state==='play') pY=Math.max(9,pY-2); });
bit.onHold('down',  () => { if(state==='play') pY=Math.min(62-PAD_H,pY+2); });
bit.onPress('start',() => { if(state!=='play') init(); });

bit.loop(() => {
  bit.clear();

  if (state !== 'play') {
    const won = state==='pwin';
    bit.text(won?20:20, 16, won?'YOU WIN!':'AI WINS!');
    bit.text(24, 30, pSc+' : '+aSc);
    bit.text(10, 46, 'PRESS START');
    return;
  }

  // Gradually increase ball speed over time (cap at 2.5)
  const spd = Math.min(2.5, 1.2 + bit.frame * 0.001);

  ball.x += ball.vx * spd;
  ball.y += ball.vy * spd;

  // Top/bottom walls (play area y=9..63)
  if (ball.y <= 9)  { ball.y=9;  ball.vy= Math.abs(ball.vy); bit.beep(350,15); }
  if (ball.y >= 62) { ball.y=62; ball.vy=-Math.abs(ball.vy); bit.beep(350,15); }

  const bx=Math.round(ball.x), by=Math.round(ball.y);

  // AI paddle — tracks with slight lag
  const aiCenter = aY + PAD_H/2;
  if (ball.y > aiCenter+2) aY=Math.min(62-PAD_H, aY+1.2);
  if (ball.y < aiCenter-2) aY=Math.max(9,        aY-1.2);

  // Player paddle (x=5..8)
  if (bx<=8 && bx>=4 && by>=pY && by<=pY+PAD_H) {
    ball.vx = Math.abs(ball.vx);
    // Add angle based on hit position
    const rel = (ball.y-(pY+PAD_H/2))/(PAD_H/2);
    ball.vy = rel * 1.2;
    if (Math.abs(ball.vy) < 0.3) ball.vy = ball.vy>=0?0.3:-0.3;
    bit.beep(600,20);
  }

  // AI paddle (x=120..124)
  if (bx>=119 && bx<=124 && by>=aY && by<=aY+PAD_H) {
    ball.vx = -Math.abs(ball.vx);
    bit.beep(600,20);
  }

  // Scoring
  if (ball.x < 2) {
    aSc++; bit.beep(160,300);
    ball={x:64,y:32,vx:-1.5,vy:0.8};
    if (aSc>=WIN) { state='awin'; return; }
  }
  if (ball.x > 126) {
    pSc++; bit.beep(880,300);
    ball={x:64,y:32,vx:1.5,vy:-0.8};
    if (pSc>=WIN) { state='pwin'; return; }
  }

  // Draw field
  bit.line(0,8,127,8);
  for (let y=10; y<64; y+=5) bit.line(63,y,63,y+2); // dashes

  // Score HUD
  bit.text(22, 1, String(pSc));
  bit.text(60, 1, ':');
  bit.text(72, 1, String(aSc));

  // Paddles
  bit.fill(5, Math.round(pY), PAD_W, PAD_H);
  bit.fill(120, Math.round(aY), PAD_W, PAD_H);

  // Ball (2x2)
  bit.fill(bx-1, by-1, 2, 2);
});
`;
