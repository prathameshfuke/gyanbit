/**
 * GyanBit Studio — Runtime Engine
 * Implements the full bit.* API for the browser simulator
 */

import { renderText } from './PixelFont.js';

export class GyanBitRuntime {
  constructor(onFrame, onPrint, onBeep) {
    // 128×64 monochrome pixel buffer (flat array)
    this._buf = new Uint8Array(128 * 64);
    this._onFrame = onFrame;   // callback(Uint8Array) → triggers canvas redraw
    this._onPrint = onPrint;   // callback(msg, type)
    this._onBeep  = onBeep;    // callback(freq, ms)

    this._heldButtons = new Set();
    this._justPressed = new Set();
    this._pressHandlers = {};
    this._holdHandlers  = {};
    this._loopFn = null;
    this._rafId  = null;
    this._running = false;
    this._lastTime = 0;
    this._frameCount = 0;
    this._fpsAccum = 0;
    this._fpsSamples = 0;
    this._measuredFps = 0;
    this._userCode = null;

    // Public constants
    this.W = 128;
    this.H = 64;
    this._audioCtx = null;

    // Expose as `bit`
    this.bit = this._buildApi();
  }

  // ── Build the public bit.* API ────────────────────────
  _buildApi() {
    const self = this;
    return {
      get W() { return 128; },
      get H() { return 64; },
      get frame() { return self._frameCount; },

      clear: () => self._buf.fill(0),

      dot: (x, y) => self._setPixel(x, y, 1),
      erase: (x, y) => self._setPixel(x, y, 0),

      get: (x, y) => {
        x = Math.round(x); y = Math.round(y);
        if (x < 0 || x >= 128 || y < 0 || y >= 64) return 0;
        return self._buf[y * 128 + x];
      },

      line: (x1, y1, x2, y2) => self._line(x1, y1, x2, y2),
      box:  (x, y, w, h) => self._box(x, y, w, h),
      fill: (x, y, w, h) => self._fill(x, y, w, h),
      circle: (cx, cy, r) => self._circle(cx, cy, r),
      fillCircle: (cx, cy, r) => self._fillCircle(cx, cy, r),

      text: (x, y, str) => renderText(self._buf, x, y, String(str), 1),
      bigText: (x, y, str) => renderText(self._buf, x, y, String(str), 2),

      invert: () => {
        for (let i = 0; i < self._buf.length; i++) self._buf[i] ^= 1;
      },

      scroll: (dx, dy) => self._scroll(dx, dy),

      onPress: (btn, fn) => {
        if (!self._pressHandlers[btn]) self._pressHandlers[btn] = [];
        self._pressHandlers[btn].push(fn);
      },
      onHold: (btn, fn) => {
        if (!self._holdHandlers[btn]) self._holdHandlers[btn] = [];
        self._holdHandlers[btn].push(fn);
      },
      isHeld: (btn) => self._heldButtons.has(btn),
      isPressed: (btn) => self._justPressed.has(btn),

      loop: (fn) => { self._loopFn = fn; },

      beep: (freq, ms) => self._beep(freq, ms),
      melody: (notes) => self._melody(notes),

      print: (...args) => {
        const msg = args.map(a => {
          if (typeof a === 'object') try { return JSON.stringify(a); } catch { return String(a); }
          return String(a);
        }).join(' ');
        self._onPrint(msg, 'print');
      },

      random: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    };
  }

  // ── Pixel helpers ─────────────────────────────────────
  _setPixel(x, y, v) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || x >= 128 || y < 0 || y >= 64) return;
    this._buf[y * 128 + x] = v;
  }

  _line(x1, y1, x2, y2) {
    let dx = Math.abs(x2 - x1), dy = Math.abs(y2 - y1);
    let sx = x1 < x2 ? 1 : -1, sy = y1 < y2 ? 1 : -1;
    let err = dx - dy, x = Math.round(x1), y = Math.round(y1);
    x2 = Math.round(x2); y2 = Math.round(y2);
    while (true) {
      this._setPixel(x, y, 1);
      if (x === x2 && y === y2) break;
      let e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x += sx; }
      if (e2 < dx)  { err += dx; y += sy; }
    }
  }

  _box(x, y, w, h) {
    x = Math.round(x); y = Math.round(y);
    this._line(x, y, x + w - 1, y);
    this._line(x, y + h - 1, x + w - 1, y + h - 1);
    this._line(x, y, x, y + h - 1);
    this._line(x + w - 1, y, x + w - 1, y + h - 1);
  }

  _fill(x, y, w, h) {
    x = Math.round(x); y = Math.round(y);
    w = Math.round(w); h = Math.round(h);
    for (let row = y; row < y + h; row++) {
      for (let col = x; col < x + w; col++) {
        this._setPixel(col, row, 1);
      }
    }
  }

  _circle(cx, cy, r) {
    cx = Math.round(cx); cy = Math.round(cy); r = Math.round(r);
    let x = 0, y = r, d = 3 - 2 * r;
    const plot = (px, py) => this._setPixel(px, py, 1);
    while (y >= x) {
      plot(cx+x,cy+y); plot(cx-x,cy+y); plot(cx+x,cy-y); plot(cx-x,cy-y);
      plot(cx+y,cy+x); plot(cx-y,cy+x); plot(cx+y,cy-x); plot(cx-y,cy-x);
      if (d < 0) d += 4*x+6; else { d += 4*(x-y)+10; y--; }
      x++;
    }
  }

  _fillCircle(cx, cy, r) {
    cx = Math.round(cx); cy = Math.round(cy); r = Math.round(r);
    for (let y = -r; y <= r; y++) {
      const w = Math.round(Math.sqrt(r * r - y * y));
      for (let x = -w; x <= w; x++) this._setPixel(cx + x, cy + y, 1);
    }
  }

  _scroll(dx, dy) {
    const nb = new Uint8Array(128 * 64);
    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 128; x++) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < 128 && ny >= 0 && ny < 64) {
          nb[ny * 128 + nx] = this._buf[y * 128 + x];
        }
      }
    }
    this._buf = nb;
  }

  // ── Audio ─────────────────────────────────────────────
  _ensureAudio() {
    if (!this._audioCtx) {
      try { this._audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch { this._audioCtx = null; }
    }
    return this._audioCtx;
  }

  _beep(freq, ms) {
    const ctx = this._ensureAudio();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.value = freq || 440;
      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (ms || 100) / 1000);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + (ms || 100) / 1000);
    } catch { /* ignore audio errors */ }
  }

  async _melody(notes) {
    for (const [freq, ms] of notes) {
      this._beep(freq, ms);
      await new Promise(r => setTimeout(r, ms + 20));
    }
  }

  // ── Button handling ───────────────────────────────────
  pressButton(btn) {
    if (this._heldButtons.has(btn)) return; // already held
    this._heldButtons.add(btn);
    this._justPressed.add(btn);
    (this._pressHandlers[btn] || []).forEach(fn => { try { fn(); } catch { } });
  }

  releaseButton(btn) {
    this._heldButtons.delete(btn);
  }

  // ── Run / stop ────────────────────────────────────────
  runCode(code) {
    this.stop();
    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function('bit', code);
      this._pressHandlers = {};
      this._holdHandlers  = {};
      this._loopFn = null;
      this._heldButtons.clear();
      this._justPressed.clear();
      this._buf.fill(0);
      fn(this.bit);
      this._running = true;
      this._frameCount = 0;
      this._lastTime = performance.now();
      this._tick();
      this._onPrint('Program started ▶', 'system');
    } catch (err) {
      this._onPrint(`Runtime error: ${err.message}`, 'error');
    }
  }

  stop() {
    this._running = false;
    if (this._rafId) { cancelAnimationFrame(this._rafId); this._rafId = null; }
    this._loopFn = null;
    this._onPrint && this._onPrint('Stopped ■', 'system');
  }

  reset() {
    this.stop();
    this._buf.fill(0);
    this._pressHandlers = {};
    this._holdHandlers  = {};
    this._heldButtons.clear();
    this._justPressed.clear();
    this._frameCount = 0;
    this._onFrame && this._onFrame(this._buf);
    this._onPrint && this._onPrint('Reset ↺', 'system');
  }

  getBuffer() { return this._buf; }
  getMeasuredFps() { return this._measuredFps; }
  isRunning() { return this._running; }

  // ── RAF tick at 30fps cap ─────────────────────────────
  _tick() {
    if (!this._running) return;
    const now = performance.now();
    const dt  = now - this._lastTime;
    if (dt >= 33.33) {      // ~30fps cap
      this._lastTime = now - (dt % 33.33);
      this._frameCount++;

      // Measure FPS
      this._fpsAccum += 1000 / dt;
      this._fpsSamples++;
      if (this._fpsSamples >= 10) {
        this._measuredFps = Math.round(this._fpsAccum / this._fpsSamples);
        this._fpsAccum = 0; this._fpsSamples = 0;
      }

      // Fire hold handlers for pressed buttons
      this._heldButtons.forEach(btn => {
        (this._holdHandlers[btn] || []).forEach(fn => { try { fn(); } catch { } });
      });

      // Run user loop
      if (this._loopFn) {
        try { this._loopFn(); } catch (err) {
          this._onPrint(`Loop error: ${err.message}`, 'error');
          this.stop();
          return;
        }
      }

      // Clear the single-frame press trackers
      this._justPressed.clear();

      // Push frame to screen
      this._onFrame(this._buf);
    }

    this._rafId = requestAnimationFrame(() => this._tick());
  }
}
