// GyanBit Studio — F1 GRAND PRIX  (corrected monochrome rendering)
// Controls:
//   A (Z/K)       Accelerate
//   B (X/L)       Brake
//   UP (W)        NITRO
//   LEFT / RIGHT  Steer
//   START / Enter Start · Restart

export default `
// =============================================
//  F1 GRAND PRIX  —  Arcade Racer
// =============================================

const SW = 128, SH = 64;
const HORIZON = 24;     // where road starts (px from top)
const LOOK    = 36;     // draw-distance in segments
const SEG_CNT = 1000;   // total track segments
const MAX_SPD = 260;
const NITRO_SPD = 340;

// --- STATE ---
let px = 0;             // player X  (-1 left .. +1 right)
let pz = 0;             // player Z along track
let spd = 0;            // speed (world units/frame)
let gear = 1;
let nitro = 100;
let nitroOn = false;
let crashed = false, crashT = 0;
let raceOn = false, done = false;
let lap = 0, lapFr = 0, bestFr = 0, totalFr = 0;
let cd = 3, cdTmr = 0;
let pos = 8, score = 0;
let blink = 0;
let title = true;

// --- TRACK ---
let track = [];
function buildTrack() {
  track = [];
  const LAYOUT = [
    {c:0,   h:0},{c:3,   h:0},{c:5,  h:1.5},{c:0, h:3 },
    {c:-4,  h:1},{c:-6,  h:-2},{c:0, h:-3  },{c:3, h:0 },
    {c:1,   h:2},{c:0,   h:0},{c:-5, h:0   },{c:-2,h:-1},
    {c:6,   h:0},{c:0,   h:3},{c:-4, h:2   },{c:2, h:-2},
    {c:0,   h:0},{c:-1,  h:1}
  ];
  let wy = 0;
  for (let i = 0; i < SEG_CNT; i++) {
    const s = LAYOUT[Math.floor(i/70) % LAYOUT.length];
    wy += s.h * 12;
    track.push({ c: s.c, stripe: Math.floor(i/22)%2, wy });
  }
}
buildTrack();

// --- AI CARS ---
let opps = [];
function initOpps() {
  opps = [
    {x: 0.3, spd:269, z:  500},{x:-0.3, spd:265, z: 900},
    {x: 0.5, spd:260, z:1300},{x:-0.5, spd:257, z:1700},
    {x: 0.0, spd:253, z:2100},{x:-0.2, spd:249, z:2500},
    {x: 0.2, spd:245, z:2900},
  ];
}
initOpps();

// ============================================================
// ROAD RENDERER
// Strategy:
//   - Screen is already BLACK after bit.clear()
//   - Draw road as: LEFT edge line + RIGHT edge line + centre dashes
//   - Rumble strips = alternating filled block on the very edge
//   - Grass stripes = thin horizontal lines slightly to each side
//   This gives clear contrast: white lines on black
// ============================================================
function drawRoad() {
  const baseSeg = Math.floor(pz / 100);
  let cx_acc = 0, cy_acc = 0;
  let dcx = 0, dcy = 0;
  let prevL = -1, prevR = -1;

  for (let n = LOOK; n >= 1; n--) {
    const idx = (baseSeg + n) % SEG_CNT;
    const seg = track[idx];
    dcx += seg.c * 0.015;
    dcy += 0;
    cx_acc += dcx;

    // Map segment index n to screen-Y (far=top, near=bottom)
    const t  = (n - 1) / (LOOK - 1);          // 1=far, 0=near
    const sY = Math.round(HORIZON + (SH - 16 - HORIZON) * (1 - t));
    if (sY < HORIZON || sY >= SH - 15) continue;

    // Road width grows as n decreases (near = wider)
    const roadW = Math.round(4 + (1 - t) * 52);  // 4px..56px
    const cX    = Math.round(SW/2 - px * (1-t) * 44 + cx_acc * (1-t) * 6);

    const L = cX - roadW, R = cX + roadW;

    // == Draw road boundaries ==
    // Rumble strips (thick line every other stripe)
    if (seg.stripe === 0) {
      // left rumble
      const rl = Math.max(0, L-3);
      bit.fill(rl, sY, 3, 1);
      // right rumble
      const rr = Math.min(SW-3, R);
      bit.fill(rr, sY, 3, 1);
    }

    // Road edge lines
    if (L >= 0 && L < SW) bit.dot(L, sY);
    if (R >= 0 && R < SW) bit.dot(R, sY);

    // Fill road surface with thin horizontal lines every 2 pixels
    // (gives texture and shows the road without solid white)
    if (sY % 2 === 0) {
      for (let x = L+1; x < R; x++) bit.dot(x, sY);
    }

    // Centre dashes
    if (seg.stripe === 0) {
      const dw = Math.max(1, Math.round(roadW/10));
      for (let x = cX-dw; x <= cX+dw; x++) bit.erase(x, sY);
    }

    // Nitro boost lines (two extra lines inside road)
    if (nitroOn && n%5 < 2) {
      const lx = cX - Math.round(roadW*0.5);
      const rx = cX + Math.round(roadW*0.5);
      if(lx>L+2 && lx<SW) bit.dot(lx, sY);
      if(rx<R-2 && rx>=0) bit.dot(rx, sY);
    }
  }
}

// ============================================================
// OPPONENT CARS — draw as outline box (sides + top only)
// ============================================================
function drawOpps() {
  const baseSeg = Math.floor(pz / 100);
  opps.forEach(o => {
    const relZ = o.z - pz;
    if (relZ < 80 || relZ > LOOK * 100) return;
    const t = 1 - (relZ / (LOOK * 100));       // 0=far, 1=near
    const sY = Math.round(HORIZON + (SH - 16 - HORIZON) * t);
    const roadW  = Math.round(4 + t * 52);
    const cX     = Math.round(SW/2 + (o.x - px) * roadW * 0.85);
    const cw = Math.max(4, Math.round(t * 14));
    const ch = Math.max(3, Math.round(t * 8));
    const cx = cX - cw/2, cy = sY - ch;
    if (cx > SW || cx+cw < 0) return;
    bit.box(Math.round(cx), Math.round(cy), cw, ch);
    // Windscreen
    if (cw >= 6) {
      bit.fill(Math.round(cx+2), Math.round(cy+1), cw-4, 1);
    }
  });
}

// ============================================================
// PLAYER CAR — on-screen outline silhouette (bottom of screen)
// ============================================================
function drawPlayerCar() {
  const bob  = crashed ? ((Math.floor(crashT/2)%4)-2) : (bit.frame%8 < 4 ? 0 : 1);
  const lean = bit.isHeld('left') ? -3 : bit.isHeld('right') ? 3 : 0;
  const cx = SW/2 + lean + bob;
  const cy = SH - 17;          // top of car

  // Draw as outline + filled cockpit for contrast
  // Rear wing
  bit.fill(cx-7, cy,   14, 1);
  // Cockpit (filled white = visible)
  bit.fill(cx-3, cy+1, 6, 3);
  // Erase windscreen inside cockpit
  bit.erase(cx-1, cy+2); bit.erase(cx, cy+2); bit.erase(cx+1, cy+2);
  // Body sides outline
  bit.dot(cx-8, cy+1); bit.dot(cx+8, cy+1);
  bit.dot(cx-8, cy+2); bit.dot(cx+8, cy+2);
  bit.dot(cx-8, cy+3); bit.dot(cx+8, cy+3);
  // Lower body filled
  bit.fill(cx-8, cy+4, 17, 2);
  // Front wing
  bit.fill(cx-9, cy+7, 19, 1);
  // Wheels
  bit.fill(cx-11, cy+2, 3, 3);
  bit.fill(cx+9,  cy+2, 3, 3);
  bit.fill(cx-6,  cy+8, 4, 2);
  bit.fill(cx+3,  cy+8, 4, 2);
  // Exhaust flame (nitro)
  if (nitroOn && bit.frame%2===0) {
    bit.dot(cx-5, cy+10); bit.dot(cx-4, cy+11);
    bit.dot(cx+4, cy+10); bit.dot(cx+5, cy+11);
  }
  // Crash sparks
  if (crashed && bit.frame%2===0) {
    bit.dot(cx-10+(crashT%5), cy+2);
    bit.dot(cx+10-(crashT%4), cy+2);
    bit.dot(cx, cy-2);
    bit.dot(cx-2, cy-1); bit.dot(cx+2, cy-1);
  }
}

// ============================================================
// SKY — everything above HORIZON (screen is already cleared)
// ============================================================
function drawSky() {
  // Horizon dividing line
  bit.fill(0, HORIZON, SW, 1);

  // Stars
  const seed = Math.floor(pz / 100);
  for (let i = 0; i < 16; i++) {
    const sx = ((i*23 + seed*7)*53) % SW;
    const sy = ((i*17 + seed*3)*31) % (HORIZON - 2);
    if ((bit.frame + i*3)%5 !== 0) bit.dot(sx, sy);
  }

  // Sun
  const sunX = 80 - Math.floor(pz/700)%30;
  bit.fill(sunX,   4, 8, 4);
  bit.fill(sunX+1, 3, 6, 6);

  // Parallax mountains
  const mOff = Math.floor(pz/200) % 56;
  for (let m = 0; m < 4; m++) {
    const mx = ((m*40 - mOff + 280) % (SW+40)) - 20;
    for (let h = 0; h < 7; h++) {
      const mw = 14 - h*2;
      if (mw > 0) bit.fill(mx + 7 - mw/2, HORIZON - 9 + h, mw, 1);
    }
  }
}

// ============================================================
// DASHBOARD — text only, no fill background (screen is black)
// ============================================================
function drawDash() {
  const dy = SH - 13;
  // Separator line
  bit.fill(0, dy, SW, 1);
  // Speed
  bit.text(1,  dy+2, "S:");
  bit.text(13, dy+2, String(Math.floor(spd)));
  // Gear
  bit.text(37, dy+2, "G:" + String(gear));
  // RPM bar (thin, 3px tall)
  const rpb = Math.round((spd/MAX_SPD)*40);
  if (rpb > 0) bit.fill(55, dy+2, rpb, 3);
  // Nitro bar (below rpm)
  const nb2 = Math.round((nitro/100)*22);
  if (nb2 > 0) bit.fill(55, dy+7, nb2, 3);
  bit.text(55 + 22 + 2, dy+7, "N");
  // Lap
  bit.text(100, dy+2, "L" + String(lap+1) + "/3");
  const ls2 = Math.floor(lapFr/30);
  const timeStr = String(Math.floor(ls2/60)) + (ls2%60<10?":0":":") + String(ls2%60);
  bit.text(100, dy+8, timeStr);
}

// ============================================================
// HUD — top bar (text on cleared screen)
// ============================================================
function drawHUD() {
  bit.text(1, 1, "P" + String(pos));
  if (nitroOn) bit.text(44, 1, "NITRO");
  const sk = String(Math.floor(score/200));
  bit.text(SW - sk.length*6 - 1, 1, sk);
}

// ============================================================
// PHYSICS
// ============================================================
function updatePhysics() {
  const gSpd = [55,100,150,195,245,300];
  const gMin = [0,  38,  82,128,172,218];
  for (let g = 6; g >= 1; g--) {
    if (spd >= gMin[g-1]*0.88) { gear = g; break; }
  }

  nitroOn = bit.isHeld('up') && nitro > 2 && raceOn && !done;
  const offRoad = Math.abs(px) > 0.88;
  const seg = track[Math.floor(pz/100) % SEG_CNT];

  if (raceOn && !done) {
    const acc   = bit.isHeld('a') ? 9  : 0;
    const brk   = bit.isHeld('b') ? 16 : 0;
    const boost = nitroOn ? 13 : 0;
    spd += acc + boost - brk - 2;
    if (offRoad) spd -= 8;
    spd -= Math.abs(seg.c) * 0.07 * (spd/MAX_SPD);
  }

  const maxS = offRoad ? 45 : (nitroOn ? NITRO_SPD : MAX_SPD);
  if (spd < 0) spd = 0;
  if (spd > maxS) spd = maxS;

  if (nitroOn)  nitro = nitro > 0   ? nitro - 1.5 : 0;
  else          nitro = nitro < 100 ? nitro + 0.28 : 100;

  const st = 0.011 * (spd/100 + 0.3);
  if (bit.isHeld('left')  && raceOn) px -= st;
  if (bit.isHeld('right') && raceOn) px += st;
  if (raceOn && spd > 0) px -= seg.c * 0.7 * (spd/MAX_SPD) * 0.001;

  if (px < -1.3) px = -1.3;
  if (px >  1.3) px =  1.3;

  if (Math.abs(px) > 1.15 && spd > 60 && !crashed) {
    crashed = true; crashT = 40;
    spd *= 0.35;
    bit.beep(180, 380);
  }
  if (crashed) { crashT--; if (crashT <= 0) crashed = false; }

  pz += spd * 0.5;
  if (pz >= SEG_CNT * 100) {
    pz = 0;
    if (bestFr === 0 || lapFr < bestFr) bestFr = lapFr;
    lapFr = 0; lap++;
    if (lap >= 3) { done = true; bit.beep(1500,400); }
    else bit.beep(1100, 150);
  }
}

// ============================================================
// OPPONENTS LOGIC
// ============================================================
function updateOpps() {
  opps.forEach(o => {
    if (!done && raceOn) {
      const seg = track[Math.floor(o.z/100) % SEG_CNT];
      o.z += o.spd * (1 - Math.abs(seg.c)*0.01) / 60;
      if (o.z >= SEG_CNT * 100) o.z = 0;
    }
  });
  let ahead = 0;
  opps.forEach(o => { if (o.z > pz) ahead++; });
  pos = ahead + 1;
  score += Math.round(spd / 9);
}

// ============================================================
// COUNTDOWN
// ============================================================
function updateCD() {
  if (cd >= 0) {
    cdTmr++;
    if (cdTmr >= 55) {
      cdTmr = 0; cd--;
      if (cd > 0)  bit.beep(600, 100);
      else if(cd===0) bit.beep(900, 100);
      else { bit.beep(1300, 220); raceOn = true; }
    }
  }
}
function drawCD() {
  const cx = 54, cy = SH/2 - 8;
  if (cd > 0) {
    bit.box(cx, cy, 20, 16);
    bit.text(cx+7, cy+5, String(cd));
  } else if (cd === 0) {
    bit.box(cx-4, cy, 28, 16);
    bit.text(cx, cy+5, " GO!");
  }
}

// ============================================================
// TITLE SCREEN
// ============================================================
function drawTitle() {
  bit.clear();
  // Perspective road
  for (let y = HORIZON+2; y < SH-2; y++) {
    const t2 = (y - HORIZON) / (SH - 2 - HORIZON);
    const rw = Math.round(t2 * 54);
    const cx2 = SW/2;
    // Road edges
    if (cx2-rw >= 0) bit.dot(cx2-rw, y);
    if (cx2+rw < SW) bit.dot(cx2+rw, y);
    // Fill road texture every other row
    if (y%2===0) for(let x=cx2-rw+1;x<cx2+rw;x++) bit.dot(x,y);
    // Centre dashes
    if (Math.floor((y+bit.frame)/5)%2===0) {
      bit.erase(cx2-1, y); bit.erase(cx2, y); bit.erase(cx2+1, y);
    }
  }
  // Horizon
  bit.fill(0, HORIZON, SW, 1);
  // Title box
  bit.box(6, 3, SW-12, 19);
  bit.text(14, 7,  "F1 GRAND PRIX");
  bit.text(20, 15, "ARCADE RACER");
  // Controls
  bit.text(3, 28, "A=ACCEL  B=BRAKE");
  bit.text(3, 36, "UP=NITRO L/R=STEER");
  // Blink
  blink++;
  if (Math.floor(blink/22)%2 === 0) {
    bit.text(16, 48, "PRESS A OR START");
  }
}

// ============================================================
// FINISH SCREEN
// ============================================================
function drawFinish() {
  const totS  = Math.floor(totalFr/30);
  const totM  = Math.floor(totS/60);
  const totSec= totS%60;
  const tStr  = String(totM) + (totSec<10?":0":":") + String(totSec);
  const bS    = Math.floor(bestFr/30);
  const bStr  = String(Math.floor(bS/60)) + (bS%60<10?":0":":") + String(bS%60);

  bit.box(8, 8, SW-16, 48);
  bit.text(14, 12, "RACE COMPLETE!");
  bit.text(14, 21, "POSITION: P"+String(pos));
  bit.text(14, 29, "TOTAL:  " + tStr);
  bit.text(14, 37, "BEST L: " + bStr);
  blink++;
  if (Math.floor(blink/24)%2 === 0) bit.text(14, 46, "START=RESTART");
}

// ============================================================
// RESET
// ============================================================
function resetAll() {
  px=0; pz=0; spd=0; gear=1;
  nitro=100; nitroOn=false; crashed=false; crashT=0;
  raceOn=false; done=false; cd=3; cdTmr=0;
  lap=0; lapFr=0; bestFr=0; totalFr=0;
  pos=8; score=0; blink=0;
  buildTrack(); initOpps();
}

// ============================================================
// BUTTON HANDLERS
// ============================================================
bit.onPress('start', () => {
  if (title) { title=false; resetAll(); return; }
  if (done)  { resetAll(); return; }
});
bit.onPress('a', () => {
  if (title) { title=false; resetAll(); }
});

// ============================================================
// MAIN LOOP
// ============================================================
bit.loop(() => {
  if (title) { drawTitle(); return; }

  if (!done) {
    updatePhysics();
    updateCD();
    lapFr++; totalFr++;
  }
  updateOpps();

  bit.clear();
  drawSky();
  drawRoad();
  drawOpps();
  drawPlayerCar();
  drawHUD();
  drawDash();

  if (!raceOn && !done) drawCD();
  if (done) drawFinish();
});
`;
