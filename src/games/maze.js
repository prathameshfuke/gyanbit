// GyanBit Studio — Maze Game (rewritten for reliability)
export default `
// MAZE — Navigate through a generated maze
// Controls: Arrow Keys / D-Pad  |  START = new maze

// 16x8 grid, 8x8px per cell = exactly 128x64
const COLS = 16, ROWS = 8, CS = 8;

// Wall bit flags per cell
const N = 1, E = 2, S = 4, W = 8;
const OPPOSITE = { N: S, S: N, E: W, W: E };
const DIR_DELTA = { N:{dc:0,dr:-1}, E:{dc:1,dr:0}, S:{dc:0,dr:1}, W:{dc:-1,dr:0} };
const DIRS = ['N','E','S','W'];

let grid, playerC, playerR, won, blink;

function idx(c, r) { return r * COLS + c; }

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = bit.random(0, i);
    const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
}

function carve(c, r) {
  const order = shuffle([...DIRS]);
  for (const dir of order) {
    const {dc, dr} = DIR_DELTA[dir];
    const nc = c + dc, nr = r + dr;
    if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) continue;
    if (grid[idx(nc,nr)] !== 0b1111) continue; // already visited
    grid[idx(c,r)]  &= ~eval(dir);         // remove wall from current
    grid[idx(nc,nr)] &= ~eval(OPPOSITE[dir]); // remove wall from neighbor
    carve(nc, nr);
  }
}

function buildMaze() {
  grid = new Array(COLS * ROWS).fill(0b1111);
  // Use iterative DFS to avoid call stack limits
  const visited = new Array(COLS * ROWS).fill(false);
  const stack = [{c:0, r:0}];
  visited[0] = true;
  while (stack.length > 0) {
    const {c, r} = stack[stack.length - 1];
    const neighbors = shuffle([...DIRS])
      .map(d => ({ d, nc: c + DIR_DELTA[d].dc, nr: r + DIR_DELTA[d].dr }))
      .filter(({nc,nr}) => nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS && !visited[idx(nc,nr)]);
    if (neighbors.length === 0) {
      stack.pop();
    } else {
      const {d, nc, nr} = neighbors[0];
      // Remove wall between current and neighbor
      const wallBit = {N:1, E:2, S:4, W:8};
      const oppBit  = {N:4, E:8, S:1, W:2};
      grid[idx(c,r)]   &= ~wallBit[d];
      grid[idx(nc,nr)] &= ~oppBit[d];
      visited[idx(nc,nr)] = true;
      stack.push({c:nc, r:nr});
    }
  }
}

function canGo(c, r, dir) {
  const wallBit = {N:1, E:2, S:4, W:8};
  return !(grid[idx(c,r)] & wallBit[dir]);
}

function reset() {
  buildMaze();
  playerC = 0; playerR = 0;
  won = false; blink = 0;
}

reset();

bit.onPress('up',    () => { if (!won && canGo(playerC,playerR,'N')) { playerR--; bit.beep(700,15); }});
bit.onPress('down',  () => { if (!won && canGo(playerC,playerR,'S')) { playerR++; bit.beep(700,15); }});
bit.onPress('left',  () => { if (!won && canGo(playerC,playerR,'W')) { playerC--; bit.beep(700,15); }});
bit.onPress('right', () => { if (!won && canGo(playerC,playerR,'E')) { playerC++; bit.beep(700,15); }});
bit.onPress('start', () => reset());

bit.loop(() => {
  bit.clear();

  if (won) {
    bit.text(8,  20, 'ESCAPED!');
    bit.text(4,  36, 'START=NEW');
    return;
  }

  // Check win at bottom-right
  if (playerC === COLS-1 && playerR === ROWS-1) {
    won = true;
    bit.beep(1047, 100);
    return;
  }

  blink++;

  // Draw maze walls
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = grid[idx(c, r)];
      const x = c * CS, y = r * CS;
      if (cell & 1) bit.line(x, y, x+CS-1, y);           // N
      if (cell & 2) bit.line(x+CS-1, y, x+CS-1, y+CS-1); // E
      if (cell & 4) bit.line(x, y+CS-1, x+CS-1, y+CS-1); // S
      if (cell & 8) bit.line(x, y, x, y+CS-1);            // W
    }
  }

  // Player = filled 4x4 square centered in cell
  bit.fill(playerC*CS + 2, playerR*CS + 2, 4, 4);

  // Exit = bottom-right cell blinks
  if (Math.floor(blink/8) % 2 === 0) {
    const ex = (COLS-1)*CS, ey = (ROWS-1)*CS;
    bit.fill(ex+3, ey+3, 2, 2);
  }

  // "M" indicator top-right
  bit.text(110, 0, 'MAZE');
});
`;
