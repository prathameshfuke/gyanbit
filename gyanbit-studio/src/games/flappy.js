export default `/* 
  FLAPPY BIRD
  FLAPPY BIRD
  Classic gravity-based obstacle survival.
  Press A (Z key) to flap wings and navigate between pipes.
  Grid: 128x64 pixels.
*/

let state = 'start'; // 'start', 'play', 'gameover'
let score = 0;
let highScore = 0;

let birdY = 32;
let birdVy = 0;
let gravity = 0.4;
let flap = -3;

let pipes = [];
let pipeSpeed = 2;
let pipeWidth = 10;
let gapSize = 24;

bit.loop(() => {
  bit.clear();
  
  // Background scroll effect (optional, keep it simple for now)
  
  if (state === 'start') {
    bit.text(28, 20, 'FLAPPY BIRD');
    bit.text(14, 40, 'PRESS [A] TO START');
    
    if (bit.isPressed('a')) {
      state = 'play';
      resetGame();
      bit.beep(400, 100);
    }
  } 
  else if (state === 'play') {
    // Bird physics
    birdVy += gravity;
    birdY += birdVy;
    
    // Flap
    if (bit.isPressed('a')) {
      birdVy = flap;
      bit.beep(600, 50);
    }
    
    // Pipe logic
    if (bit.frame % 45 === 0) {
      // Spawn new pipe
      let gapTop = bit.random(10, 64 - gapSize - 10);
      pipes.push({ x: 128, gapTop: gapTop });
    }
    
    for (let i = 0; i < pipes.length; i++) {
      let p = pipes[i];
      p.x -= pipeSpeed;
      
      // Draw top pipe
      bit.fill(p.x, 0, pipeWidth, p.gapTop);
      // Draw bottom pipe
      bit.fill(p.x, p.gapTop + gapSize, pipeWidth, 64 - (p.gapTop + gapSize));
      
      // Collision detection
      let birdBox = { x: 30, y: Math.floor(birdY), w: 6, h: 4 };
      if (birdBox.x + birdBox.w > p.x && birdBox.x < p.x + pipeWidth) {
        if (birdBox.y < p.gapTop || birdBox.y + birdBox.h > p.gapTop + gapSize) {
          die();
        }
      }
      
      // Scoring
      if (p.x === 30) {
        score++;
        bit.beep(800, 50);
      }
    }
    
    // Remove off-screen pipes
    if (pipes.length > 0 && pipes[0].x < -pipeWidth) {
      pipes.shift();
    }
    
    // Floor/Ceiling collision
    if (birdY > 64 || birdY < 0) {
      die();
    }
    
    // Draw bird
    bit.fill(30, Math.floor(birdY), 6, 4);
    
    // Draw score
    bit.text(2, 2, score.toString());
  } 
  else if (state === 'gameover') {
    bit.text(32, 20, 'GAME OVER');
    bit.text(32, 35, 'SCORE: ' + score);
    if (score > highScore) highScore = score;
    bit.text(24, 50, 'HIGH: ' + highScore);
    
    if (bit.isPressed('a')) {
      state = 'start';
    }
  }
});

function resetGame() {
  birdY = 32;
  birdVy = 0;
  pipes = [];
  score = 0;
}

function die() {
  state = 'gameover';
  bit.beep(150, 400);
}
`;
