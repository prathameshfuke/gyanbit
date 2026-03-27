export default `/* 
  SPACE INVADERS
  SPACE INVADERS
  Defend earth from the descending alien fleet! 
  Shoot projectiles and clear the screen before they reach you.
  Grid: 128x64 pixels.
*/

let state = 'start';
let score = 0;

let px = 60; // player X
let py = 58; // player Y
let pW = 8;
let pH = 4;

let bullets = [];
let aliens = [];
let alienDir = 1;
let alienSpeedX = 0.5;
let alienSpeedY = 4;
let alienTicks = 0;

bit.loop(() => {
  bit.clear();
  
  if (state === 'start') {
    bit.text(18, 20, 'SPACE INVADERS');
    bit.text(14, 40, 'PRESS [A] TO START');
    if (bit.isPressed('a')) {
      resetGame();
      state = 'play';
      bit.beep(400, 100);
    }
  }
  else if (state === 'play') {
    
    // Player movement
    if (bit.isHeld('left')) px -= 2;
    if (bit.isHeld('right')) px += 2;
    if (px < 0) px = 0;
    if (px > 128 - pW) px = 128 - pW;
    
    // Shooting
    if (bit.isPressed('a')) {
      // Limit on-screen bullets
      if (bullets.length < 3) {
        bullets.push({ x: px + 3, y: py - 2 });
        bit.beep(600, 30);
      }
    }
    
    // Move bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
      bullets[i].y -= 4;
      bit.fill(bullets[i].x, bullets[i].y, 2, 3);
      
      // Remove off-screen bullets
      if (bullets[i].y < 0) {
        bullets.splice(i, 1);
        continue;
      }
      
      // Bullet vs Alien collision
      let hit = false;
      for (let j = aliens.length - 1; j >= 0; j--) {
        let a = aliens[j];
        if (bullets[i] && 
            bullets[i].x < a.x + 6 && bullets[i].x + 2 > a.x &&
            bullets[i].y < a.y + 4 && bullets[i].y + 3 > a.y) {
          
          aliens.splice(j, 1); // Kill alien
          bullets.splice(i, 1); // Kill bullet
          score += 10;
          bit.beep(300, 30);
          hit = true;
          break;
        }
      }
    }
    
    // Move aliens
    alienTicks++;
    let hitEdge = false;
    if (alienTicks % 2 === 0) {
      for (let a of aliens) {
        a.x += alienDir;
        if (a.x < 2 || a.x > 120) hitEdge = true;
      }
      if (hitEdge) {
        alienDir *= -1;
        for (let a of aliens) {
          a.y += alienSpeedY;
          if (a.y > py - 4) {
             state = 'gameover';
             bit.beep(100, 500);
          }
        }
      }
    }
    
    // Draw aliens
    for (let a of aliens) {
      if (bit.frame % 20 < 10) {
         // Anim 1
         bit.fill(a.x, a.y, 6, 4);
      } else {
         // Anim 2
         bit.fill(a.x+1, a.y, 4, 4);
      }
    }
    
    // Draw player
    bit.fill(px, py, pW, pH);
    bit.fill(px + 3, py - 2, 2, 2); // canon
    
    // Draw score
    bit.text(2, 2, score.toString());
    
    // Win condition?
    if (aliens.length === 0) {
       bit.text(32, 25, 'YOU WIN!');
       if (bit.isPressed('a')) state = 'start';
    }
  }
  else if (state === 'gameover') {
    bit.text(32, 20, 'GAME OVER');
    bit.text(32, 35, 'SCORE: ' + score);
    if (bit.isPressed('a')) state = 'start';
  }
});

function resetGame() {
  score = 0;
  bullets = [];
  aliens = [];
  px = 60;
  
  // Spawn alien grid
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 8; c++) {
      aliens.push({
        x: 10 + c * 12,
        y: 10 + r * 10
      });
    }
  }
}
`;
