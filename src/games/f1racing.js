// GyanBit Studio — RETRO F1 RACING
// Classic arcade-style pseudo-3D racer inspired by OutRun, Pole Position, and Top Gear
//
// Controls:
// - LEFT/RIGHT: Steer
// - A Button (Z/K): Accelerate
// - B Button (X/L): Brake
// - START: Restart / Continue

export default `
// ============================================
// RETRO F1 RACING - Classic Arcade Racer
// ============================================

// --- CONSTANTS ---
const SCREEN_W = 128;
const SCREEN_H = 64;
const ROAD_W = 2000;           // Road width in world units
const SEGMENT_LENGTH = 100;    // Length of each road segment
const DRAW_DISTANCE = 40;      // How many segments ahead to draw
const FIELD_OF_VIEW = 100;   // Camera FOV
const CAMERA_HEIGHT = 1000;  // Camera height
const MAX_SPEED = 280;         // Top speed
const ACCEL = 8;               // Acceleration
const BREAKING = 16;           // Braking power
const DECEL = 2;               // Natural deceleration
const OFF_ROAD_DECEL = 8;      // Deceleration when off-road
const OFF_ROAD_MAX_SPEED = 60; // Max speed off-road
const CENTRIFUGAL = 0.8;       // How much curves push you outward

// --- TRACK DATA ---
const TRACK_LENGTH = 1200;     // Total track segments

// --- GAME STATE ---
let playerX = 0;              // -1 (left) to 1 (right)
let playerY = 0;              // For jump effects
let playerZ = 0;              // Position along track
let speed = 0;                // Current speed
let gear = 1;                 // Current gear (1-6)
let rpm = 0;                  // Engine RPM
let score = 0;                // Total score
let lap = 0;                  // Current lap
let lapTime = 0;              // Current lap time (frames)
let bestLap = 0;              // Best lap time
let totalTime = 0;            // Total race time
let position = 8;             // Starting position (8th out of 12)
let raceStarted = false;
let raceFinished = false;
let countdown = 3;            // 3-2-1-GO countdown
let countdownTimer = 0;

// Opponents
const OPPONENTS = [
  { name: "PROST", color: 1, offset: 0.5, speed: 265, skill: 0.95, x: 0.3 },
  { name: "SENNA", color: 1, offset: 0.3, speed: 270, skill: 0.98, x: -0.3 },
  { name: "PATRE", color: 1, offset: 0.7, speed: 260, skill: 0.92, x: 0.5 },
  { name: "BERGE", color: 1, offset: 0.2, speed: 262, skill: 0.93, x: -0.5 },
  { name: "MANSE", color: 1, offset: 0.6, speed: 258, skill: 0.90, x: 0.0 },
  { name: "ANDRE", color: 1, offset: 0.4, speed: 255, skill: 0.88, x: -0.2 },
  { name: "WARWI", color: 1, offset: 0.8, speed: 252, skill: 0.87, x: 0.2 },
  { name: "ALESI", color: 1, offset: 0.1, speed: 250, skill: 0.85, x: -0.4 },
  { name: "PIQUE", color: 1, offset: 0.9, speed: 248, skill: 0.84, x: 0.4 },
  { name: "BRUND", color: 1, offset: 0.5, speed: 245, skill: 0.82, x: 0.0 },
  { name: "COMAS", color: 1, offset: 0.3, speed: 242, skill: 0.80, x: -0.1 },
];

// Generate track
let track = [];
function generateTrack() {
  track = [];
  for (let i = 0; i < TRACK_LENGTH; i++) {
    let curve = 0;
    let hill = 0;
    let palette = Math.floor(i / 50) % 2;

    const section = Math.floor(i / 100);
    switch (section % 12) {
      case 0: curve = 2; break;
      case 1: curve = 3; break;
      case 2: curve = -2; break;
      case 3: curve = 0; hill = 2; break;
      case 4: curve = -4; break;
      case 5: curve = 0; hill = -2; break;
      case 6: curve = 1; break;
      case 7: curve = -3; hill = 1; break;
      case 8: curve = 2; break;
      case 9: curve = 0; break;
      case 10: curve = -2; hill = -1; break;
      case 11: curve = 4; break;
    }

    track.push({ curve, hill, palette, y: 0 });
  }

  let y = 0;
  for (let i = 0; i < track.length; i++) {
    track[i].y = y;
    y += track[i].hill * 20;
  }
}

// --- DRAWING FUNCTIONS ---

function drawBackground(camZ) {
  // Sky
  bit.fill(0, 0, SCREEN_W, SCREEN_H / 2);

  // Sun
  bit.fill(95, 8, 10, 4);
  bit.fill(97, 6, 6, 8);

  // Mountains (parallax)
  const offset = Math.floor(camZ / 300) % 40;
  for (let i = 0; i < 4; i++) {
    const mx = i * 40 - offset;
    // Mountain shape
    for (let h = 0; h < 8; h++) {
      const w = 16 - h * 2;
      bit.fill(mx + 8 - w/2 + h, 20 - h, w, 1);
    }
  }
}

function drawRoad() {
  const baseSegment = Math.floor(playerZ / SEGMENT_LENGTH);

  let dx = 0;
  let x = 0;
  let dy = 0;
  let y = 0;

  // Draw from far to near
  for (let n = DRAW_DISTANCE; n > 0; n--) {
    const segmentIdx = (baseSegment + n) % track.length;
    const segment = track[segmentIdx];

    dx += segment.curve * 0.02;
    dy += segment.hill * 0.1;
    x += dx;
    y += dy;

    const scale = FIELD_OF_VIEW / (n * SEGMENT_LENGTH);
    const screenY = SCREEN_H / 2 + Math.round(scale * (y + 500 - CAMERA_HEIGHT));
    const roadWidth = Math.round(scale * ROAD_W * 0.5);
    const centerX = SCREEN_W / 2 + Math.round(scale * (x - playerX * ROAD_W));

    if (screenY < 0 || screenY >= SCREEN_H) continue;

    // Road surface
    const left = centerX - roadWidth;
    const right = centerX + roadWidth;
    bit.fill(left, screenY, right - left, 1);

    // Center line
    if (n % 4 < 2) {
      const lineW = Math.max(1, Math.round(roadWidth / 16));
      bit.fill(centerX - lineW/2, screenY, lineW, 1);
    }

    // Side markers
    if (n % 2 === 0) {
      bit.fill(left - 2, screenY, 2, 1);
      bit.fill(right, screenY, 2, 1);
    }
  }
}

function drawCar(screenX, screenY, scale, isPlayer) {
  const width = Math.round(16 * scale);
  const height = Math.round(10 * scale);
  const x = screenX - width / 2;
  const y = screenY - height;

  if (isPlayer) {
    // Player car
    bit.fill(x + 2, y + 3, width - 4, height - 6);
    bit.fill(x + 4, y, width - 8, 3);
    bit.fill(x, y + 6, width, 2);
    bit.fill(x - 1, y + 2, 2, 4);
    bit.fill(x + width - 1, y + 2, 2, 4);
    bit.fill(x + width/2 - 1, y + 4, 2, 2);
  } else {
    // AI car
    bit.fill(x + 2, y + 2, width - 4, height - 4);
    bit.fill(x + 4, y, width - 8, 2);
    bit.fill(x - 1, y + 2, 2, 3);
    bit.fill(x + width - 1, y + 2, 2, 3);
  }
}

function drawOpponents() {
  for (let opp of OPPONENTS) {
    const oppZ = opp.offset * SEGMENT_LENGTH + Math.floor(bit.frame * opp.speed / 60);
    const relZ = oppZ - playerZ;

    if (relZ > 100 && relZ < DRAW_DISTANCE * SEGMENT_LENGTH) {
      const scale = FIELD_OF_VIEW / relZ;
      const screenX = SCREEN_W / 2 + Math.round(scale * opp.x * ROAD_W);
      const screenY = SCREEN_H / 2 + Math.round(scale * 500);
      drawCar(screenX, screenY, scale * 0.5, false);
    }
  }
}

function drawPlayerCar() {
  const screenX = SCREEN_W / 2;
  const screenY = SCREEN_H - 20;
  const bob = Math.floor(bit.frame / 4) % 2;
  drawCar(screenX + bob, screenY - bob, 1.0, true);
}

function drawDashboard() {
  const dashY = SCREEN_H - 14;
  bit.fill(0, dashY, SCREEN_W, 14);

  // Speedometer
  bit.text(2, dashY + 2, "SPD");
  bit.text(2, dashY + 8, String(Math.floor(speed)));

  // RPM bar
  bit.text(35, dashY + 2, "RPM");
  const rpmBar = Math.floor(rpm / 800);
  bit.fill(35, dashY + 8, rpmBar, 4);

  // Gear
  bit.text(65, dashY + 2, "G");
  bit.text(65, dashY + 8, String(gear));

  // Lap time
  const timeStr = formatTime(lapTime);
  bit.text(80, dashY + 2, "LAP");
  bit.text(80, dashY + 8, timeStr);
}

function drawHUD() {
  const posStr = "P" + position;
  bit.text(0, 0, posStr);

  const lapStr = "L" + (lap + 1) + "/3";
  bit.text(SCREEN_W - 24, 0, lapStr);

  bit.text(50, 0, String(score));
}

function formatTime(frames) {
  const totalSeconds = Math.floor(frames / 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hundredths = Math.floor((frames % 60) / 0.6);
  return String(minutes) + ":" +
         (seconds < 10 ? "0" : "") + String(seconds) +
         "." + (hundredths < 10 ? "0" : "") + String(hundredths);
}

function drawCountdown() {
  const centerX = SCREEN_W / 2 - 8;
  const centerY = SCREEN_H / 2 - 8;

  if (countdown > 0) {
    bit.fill(centerX - 4, centerY - 4, 24, 16);
    bit.text(centerX, centerY, String(countdown));
  } else if (countdown === 0) {
    bit.fill(centerX - 8, centerY - 4, 32, 16);
    bit.text(centerX - 4, centerY, "GO!");
  }
}

// --- GAME LOGIC ---

function updatePhysics() {
  const gearMaxSpeed = [60, 100, 145, 185, 235, 280];
  const gearMinSpeed = [0, 40, 80, 120, 160, 210];

  // Update gear
  for (let g = 6; g >= 1; g--) {
    if (speed >= gearMinSpeed[g-1] * 0.9) {
      gear = g;
      break;
    }
  }

  // Calculate RPM
  const gearRatio = gearMaxSpeed[gear-1] / 280;
  rpm = Math.min(8000, Math.floor((speed / gearMaxSpeed[gear-1]) * 7000) + 1000);

  const isOffRoad = Math.abs(playerX) > 0.8;
  const segment = track[Math.floor(playerZ / SEGMENT_LENGTH) % track.length];

  let accel = bit.button('a') ? ACCEL : 0;
  let brake = bit.button('b') ? BREAKING : 0;

  if (raceStarted && !raceFinished) {
    speed += accel;
    speed -= brake;
    speed -= DECEL;

    if (isOffRoad) {
      speed -= OFF_ROAD_DECEL;
    }

    // Curve resistance
    speed -= Math.abs(segment.curve) * 0.1 * (speed / MAX_SPEED);
  }

  const maxAllowed = isOffRoad ? OFF_ROAD_MAX_SPEED : MAX_SPEED;
  speed = Math.max(0, Math.min(speed, maxAllowed));

  // Steering
  const steerAmount = 0.015 * (speed / 100 + 0.3);
  if (bit.button('left') && raceStarted) {
    playerX -= steerAmount;
  }
  if (bit.button('right') && raceStarted) {
    playerX += steerAmount;
  }

  // Curve push
  if (raceStarted && speed > 0) {
    const curveForce = segment.curve * CENTRIFUGAL * (speed / MAX_SPEED) * 0.001;
    playerX -= curveForce;
  }

  playerX = Math.max(-1.2, Math.min(1.2, playerX));
  playerZ += speed * 0.5;

  // Lap handling
  if (playerZ >= TRACK_LENGTH * SEGMENT_LENGTH) {
    playerZ = 0;
    lap++;

    if (bestLap === 0 || lapTime < bestLap) {
      bestLap = lapTime;
    }
    lapTime = 0;

    if (lap >= 3) {
      raceFinished = true;
    }
  }
}

function updateCountdown() {
  if (countdown > -1) {
    countdownTimer++;
    if (countdownTimer >= 60) {
      countdownTimer = 0;
      countdown--;
      if (countdown >= 0) {
        bit.beep(800, 100);
      } else {
        bit.beep(1200, 200);
        raceStarted = true;
      }
    }
  }
}

function updateOpponents() {
  for (let i = 0; i < OPPONENTS.length; i++) {
    const opp = OPPONENTS[i];
    const segment = track[Math.floor(bit.frame / 10) % track.length];
    const speedMod = 1 - Math.abs(segment.curve) * 0.02;
    opp.offset += (opp.speed * speedMod - speed) * 0.001;
  }

  let ahead = 0;
  for (let opp of OPPONENTS) {
    if (opp.offset > 0 && opp.offset < 0.5) {
      ahead++;
    }
  }
  position = ahead + 1;
}

// --- INITIALIZATION ---
generateTrack();

// --- BUTTON HANDLERS ---
bit.onPress('start', () => {
  if (raceFinished) {
    playerZ = 0;
    playerX = 0;
    speed = 0;
    lap = 0;
    lapTime = 0;
    score = 0;
    position = 8;
    raceStarted = false;
    raceFinished = false;
    countdown = 3;
    countdownTimer = 0;
    generateTrack();
  }
});

// --- MAIN LOOP ---
bit.loop(() => {
  if (!raceFinished) {
    updatePhysics();
    updateCountdown();
    lapTime++;
    totalTime++;
  }
  updateOpponents();

  score += Math.floor(speed / 10);

  bit.clear();

  drawBackground(playerZ);
  drawRoad();
  drawOpponents();
  drawPlayerCar();
  drawHUD();
  drawDashboard();

  if (!raceStarted && !raceFinished) {
    drawCountdown();
  }

  if (raceFinished) {
    bit.fill(20, 20, 88, 24);
    bit.text(30, 26, "FINISHED!");
    bit.text(25, 34, "POS: " + position);
    bit.text(25, 42, "TIME: " + formatTime(totalTime));
    bit.text(15, 52, "START=RESTART");
  }
});
`;
