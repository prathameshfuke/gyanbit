import React, { useState, useEffect, useRef } from 'react';

const FULL_NAME = 'GyanBit Studio';

export default function Toolbar({ onRun, onStop, onReset, onConnect, onFlash, onDownload, fps, frameCount, running, connected }) {
  const [displayed, setDisplayed] = useState('');
  const [doneTyping, setDoneTyping] = useState(false);
  const idxRef = useRef(0);

  // Typewriter effect on mount
  useEffect(() => {
    const t = setInterval(() => {
      idxRef.current++;
      setDisplayed(FULL_NAME.slice(0, idxRef.current));
      if (idxRef.current >= FULL_NAME.length) {
        clearInterval(t);
        setDoneTyping(true);
      }
    }, 90);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="toolbar">
      <div className="toolbar-logo">
        <span className="logo-icon">▶</span>
        <span className="logo-text glow-green">{displayed}</span>
        {!doneTyping && <span className="cursor-blink" />}
      </div>

      <div className="toolbar-btns">
        <button
          className="pixel-btn btn-home"
          onClick={() => window.location.href = '/'}
          title="Return to Home"
        >🏠 HOME</button>
        
        <div className="toolbar-divider" />
        <button
          id="btn-run"
          className="pixel-btn btn-run"
          onClick={onRun}
          disabled={running}
          title="Run (F5)"
        >▶ RUN</button>

        <button
          id="btn-stop"
          className="pixel-btn btn-stop"
          onClick={onStop}
          disabled={!running}
          title="Stop (F8)"
        >■ STOP</button>

        <button
          id="btn-reset"
          className="pixel-btn btn-reset"
          onClick={onReset}
          title="Reset"
        >↺ RESET</button>

        <div className="toolbar-divider" />

        <button
          id="btn-connect"
          className={`pixel-btn btn-connect ${connected ? 'connected' : ''}`}
          onClick={onConnect}
          title="Connect Pico via WebSerial"
        >
          <span className={`status-dot ${connected ? 'on' : 'off'}`} />
          {connected ? 'LINKED' : 'CONNECT'}
        </button>

        <button
          id="btn-flash"
          className="pixel-btn btn-flash"
          onClick={onFlash}
          title="Flash to device"
        >⚡ FLASH</button>

        <button
          id="btn-download"
          className="pixel-btn btn-download"
          onClick={onDownload}
          title="Download .py file"
        >↓ .PY</button>
      </div>

      <div className="toolbar-stats">
        <div className="stat-item">
          <span className="stat-label">FPS</span>
          <span className="stat-value" style={{ color: fps < 20 ? 'var(--red)' : 'var(--green)' }}>
            {running ? fps : '--'}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">FRAME</span>
          <span className="stat-value">{frameCount}</span>
        </div>
        <div className={`conn-indicator ${connected ? 'conn-on' : 'conn-off'}`}>
          <span className="conn-dot" />
          <span>{connected ? 'PICO OK' : 'NO HW'}</span>
        </div>
      </div>

      <style>{`
        .toolbar {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 10px 16px;
          background: #07070f;
          border-bottom: 2px solid var(--border);
          position: relative;
          z-index: 10;
          flex-shrink: 0;
        }
        .toolbar::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--cyan), transparent);
          opacity: 0.4;
        }
        .toolbar-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 200px;
          flex-shrink: 0;
        }
        .logo-icon {
          color: var(--green);
          font-size: 18px;
          filter: drop-shadow(0 0 6px var(--green));
          animation: pulse 2s ease-in-out infinite;
        }
        .logo-text {
          font-family: var(--font-pixel);
          font-size: 14px;
          color: var(--green);
          letter-spacing: 0.05em;
        }
        .toolbar-btns {
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;
          justify-content: flex-start;
          margin-left: 20px;
        }
        .toolbar-divider {
          width: 1px;
          height: 28px;
          background: var(--border);
          margin: 0 4px;
        }
        .btn-home  { background: var(--dark); color: var(--text); border-color: var(--border); box-shadow: none; }
        .btn-home:hover { background: var(--border); }
        .btn-run   { background: var(--green); color: var(--dark); border-color: var(--green); }
        .btn-stop  { background: var(--red); color: white; border-color: var(--red); }
        .btn-reset { color: var(--amber); }
        .btn-connect { color: var(--cyan); }
        .btn-connect.connected { background: var(--green); color: var(--dark); border-color: var(--green); }
        .btn-flash { background: var(--magenta); color: white; border-color: var(--magenta); }
        .btn-download { color: var(--amber); }

        .pixel-btn {
           font-size: 9px !important;
           padding: 10px 18px !important;
        }

        .pixel-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
          transform: none !important;
        }

        .status-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          display: inline-block;
          flex-shrink: 0;
        }
        .status-dot.on  { background: var(--green); box-shadow: 0 0 6px var(--green); }
        .status-dot.off { background: var(--red);   box-shadow: 0 0 4px var(--red); }

        .toolbar-stats {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
          min-width: 180px;
          justify-content: flex-end;
        }
        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1px;
        }
        .stat-label {
          font-family: var(--font-pixel);
          font-size: 8px;
          color: var(--text-dim);
          letter-spacing: 0.1em;
        }
        .stat-value {
          font-family: var(--font-vt);
          font-size: 20px;
          color: var(--cyan);
          line-height: 1;
        }
        .conn-indicator {
          display: flex;
          align-items: center;
          gap: 5px;
          font-family: var(--font-pixel);
          font-size: 6px;
          letter-spacing: 0.06em;
        }
        .conn-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
          animation: pulse 1.5s ease-in-out infinite;
        }
        .conn-on  { color: var(--green); }
        .conn-on  .conn-dot { background: var(--green); box-shadow: 0 0 8px var(--green); }
        .conn-off { color: var(--text-dim); }
        .conn-off .conn-dot { background: var(--text-dim); }
      `}</style>
    </header>
  );
}
