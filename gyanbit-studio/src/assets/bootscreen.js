/**
 * GyanBit Studio — Boot Screen
 * Animated boot sequence pixel art using the bit API
 */

export const BOOT_CODE = `
// GyanBit boot animation
let frame = 0;
const logo = [
  [0,1,1,0, 0,1,1,1,0],
  [1,0,0,0, 1,0,0,0,1],
  [1,0,1,1, 1,1,1,0,0],
  [1,0,0,1, 1,0,0,0,1],
  [0,1,1,0, 0,1,1,1,0],
];
const taglines = ['LOADING...', 'GYANBIT STUDIO', 'READY!'];
let phase = 0, tagIdx = 0, charIdx = 0, pauseFrames = 0;

bit.loop(() => {
  bit.clear();
  // Draw stylized GB logo at center-ish
  const sx = 44, sy = 10, scale = 4;
  for (let r = 0; r < logo.length; r++) {
    for (let c = 0; c < logo[r].length; c++) {
      if (logo[r][c]) bit.fill(sx + c*scale, sy + r*scale, scale-1, scale-1);
    }
  }
  // Tagline typewriter
  if (tagIdx < taglines.length) {
    const t = taglines[tagIdx].slice(0, charIdx);
    const tx = Math.floor((128 - t.length * 6) / 2);
    bit.text(tx, 50, t);
    if (frame % 3 === 0) {
      if (charIdx < taglines[tagIdx].length) charIdx++;
      else {
        pauseFrames++;
        if (pauseFrames > 20) { tagIdx++; charIdx=0; pauseFrames=0; }
      }
    }
  } else {
    bit.text(30, 50, 'PRESS START');
    if (Math.floor(frame/15) % 2 === 0) bit.fill(25,48,77,10);
  }
  frame++;
});
`;
