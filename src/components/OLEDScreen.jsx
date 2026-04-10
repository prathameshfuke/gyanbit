import React, { useRef, useEffect, useCallback } from 'react';

const SCALE = 4;
const W = 128, H = 64;
const CANVAS_W = W * SCALE;  // 512px
const CANVAS_H = H * SCALE;  // 256px

export default function OLEDScreen({ runtimeRef, running, code }) {
  const canvasRef = useRef(null);

  // Draw pixel buffer to canvas — called every RAF frame
  const renderBuffer = useCallback((buf) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Dark OLED background
    ctx.fillStyle = '#080808';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Faint pixel grid (disabled for cleaner look or very faint)
    ctx.strokeStyle = '#181818';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= CANVAS_W; x += SCALE) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); ctx.stroke();
    }
    for (let y = 0; y <= CANVAS_H; y += SCALE) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); ctx.stroke();
    }

    // Lit pixels with soft bloom
    ctx.shadowColor = 'rgba(255,255,255,0.4)';
    ctx.shadowBlur = 4;
    ctx.fillStyle = '#ffffff';
    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        if (buf[py * W + px]) {
          ctx.fillRect(px * SCALE + 1, py * SCALE + 1, SCALE - 1, SCALE - 1);
        }
      }
    }
    ctx.shadowBlur = 0;

    // Scanlines
    ctx.fillStyle = 'rgba(0,0,0,0.10)';
    for (let row = 0; row < CANVAS_H; row += 2) {
      ctx.fillRect(0, row, CANVAS_W, 1);
    }
  }, []);

  // RAF polling loop — reads runtime buffer every frame
  useEffect(() => {
    let rafId;
    const empty = new Uint8Array(W * H); // all zeros

    const loop = () => {
      const rt = runtimeRef.current;
      renderBuffer(rt ? rt.getBuffer() : empty);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [runtimeRef, renderBuffer]);

  // CRT turn-on effect when running starts
  const prevRunning = useRef(false);
  useEffect(() => {
    if (running && !prevRunning.current) {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.style.animation = 'none';
        void canvas.offsetWidth;
        canvas.style.animation = 'crtOn 0.45s ease-out forwards';
      }
    }
    prevRunning.current = running;
  }, [running]);

  return (
    <div className="oled-mockup">
      <div className="device-frame">
        <div className="device-top">
          <div className="device-label glow-green">GyanBit</div>
          <div className="screw-row">
            <div className="screw" /><div className="screw" />
          </div>
        </div>

        <div className="screen-zone">
          <div className="speaker-grille">
            {Array.from({length: 24}).map((_, i) => (
              <div key={i} className="grille-dot" />
            ))}
          </div>

          <div className="canvas-wrapper">
            <canvas
              ref={canvasRef}
              id="oled-canvas"
              width={CANVAS_W}
              height={CANVAS_H}
              style={{ display: 'block', imageRendering: 'pixelated', width: '100%', height: 'auto' }}
            />
            {running && code && code.includes('INITIALIZING JS-DOS') && (
              <iframe 
                id="doom-iframe"
                src="/doom/index.html" 
                title="DOOM DOS"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  zIndex: 10,
                  background: '#000'
                }}
              />
            )}
          </div>
        </div>

        <div className="device-bottom-row">
          <div className="screw" /><div className="screw" />
        </div>

        <div className="device-labels-row">
          <span className="pcb-label">128×64 OLED</span>
          <span className="pcb-label">I2C GP16/17</span>
          <span className="pcb-label">RP2040</span>
          <span className="pcb-label">3.7V Li-Ion</span>
        </div>

        <div className="pcb-strip">
          <span>SDA</span><span>SCL</span><span>PWR</span><span>GND</span>
          <span>GP2</span><span>GP7</span><span>PWM</span><span>USB</span>
        </div>
      </div>

      <style>{`
        .oled-mockup {
          flex: 1;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 10px 8px 6px;
          background: var(--navy);
          overflow: hidden;
        }
        .device-frame {
          background: #0d0f14;
          border: 2px solid #1e2535;
          border-radius: 10px;
          padding: 10px 12px 8px;
          box-shadow: 0 0 0 1px #0a0f1a, 0 4px 24px rgba(0,0,0,0.7),
            inset 0 1px 0 rgba(255,255,255,0.04);
          width: 100%;
          max-width: 540px;
          box-sizing: border-box;
        }
        .device-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .device-label {
          font-family: var(--font-pixel);
          font-size: 7px;
          color: var(--green);
          letter-spacing: 0.12em;
        }
        .screw-row, .device-bottom-row {
          display: flex;
          justify-content: space-between;
        }
        .device-bottom-row { margin-top: 6px; }
        .screw {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #161c26;
          border: 1px solid #2a3040;
          box-shadow: inset 0 1px 2px rgba(0,0,0,0.8);
        }
        .screen-zone {
          display: flex;
          align-items: center;
          gap: 6px;
          width: 100%;
        }
        .canvas-wrapper {
          flex: 1;
          min-width: 0;
        }
        .speaker-grille {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 3px;
          padding: 4px;
          align-self: center;
        }
        .grille-dot {
          width: 3px; height: 3px;
          border-radius: 50%;
          background: #0a1020;
          box-shadow: inset 0 1px 1px rgba(0,0,0,0.9);
        }
        .canvas-wrapper {
          border: 3px solid #081015;
          border-radius: 3px;
          overflow: hidden;
          box-shadow: 0 0 0 1px #040809,
            0 0 30px rgba(57,255,20,0.06),
            inset 0 0 30px rgba(0,10,0,0.6);
          position: relative;
        }
        .canvas-wrapper::after {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            rgba(0,0,0,0.09) 0px,
            rgba(0,0,0,0.09) 1px,
            transparent 1px,
            transparent 3px
          );
          pointer-events: none;
        }
        .device-labels-row {
          display: flex;
          justify-content: space-between;
          margin-top: 4px;
          padding-top: 4px;
          border-top: 1px solid #1a2030;
        }
        .pcb-label {
          font-family: var(--font-vt);
          font-size: 11px;
          color: #2a3545;
        }
        .pcb-strip {
          display: flex;
          justify-content: space-between;
          margin-top: 5px;
          padding: 3px 6px;
          background: #050e03;
          border-radius: 2px;
          border: 1px solid #0d1a08;
        }
        .pcb-strip span {
          font-family: var(--font-vt);
          font-size: 10px;
          color: #1e3a12;
          letter-spacing: 0.06em;
        }
        #oled-canvas { animation: crtOn 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
}
