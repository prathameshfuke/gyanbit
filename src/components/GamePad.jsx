import React, { useCallback } from 'react';

const BUTTONS = [
  { id: 'up',    label: '▲', col: 2, row: 1, accent: 'var(--cyan)' },
  { id: 'left',  label: '◀', col: 1, row: 2, accent: 'var(--cyan)' },
  { id: 'down',  label: '▼', col: 2, row: 3, accent: 'var(--cyan)' },
  { id: 'right', label: '▶', col: 3, row: 2, accent: 'var(--cyan)' },
];

export default function GamePad({ runtimeRef, heldButtons }) {
  const makeHandlers = useCallback((btn) => ({
    onMouseDown: (e) => { e.preventDefault(); runtimeRef.current?.pressButton(btn); },
    onMouseUp:   () => runtimeRef.current?.releaseButton(btn),
    onTouchStart: (e) => { e.preventDefault(); runtimeRef.current?.pressButton(btn); },
    onTouchEnd:   () => runtimeRef.current?.releaseButton(btn),
  }), [runtimeRef]);

  const isHeld = (btn) => heldButtons && heldButtons.has(btn);

  return (
    <div className="gamepad-wrap">
      <div className="section-header">
        <span className="dot" style={{ background: 'var(--cyan)' }} />
        GAMEPAD — Keyboard: WASD=Move K=A L=B Enter=START
      </div>

      <div className="pad-area">
        {/* D-Pad */}
        <div className="dpad">
          {BUTTONS.map(b => (
            <button
              key={b.id}
              id={`pad-${b.id}`}
              className={`dpad-btn ${isHeld(b.id) ? 'held' : ''}`}
              style={{ gridColumn: b.col, gridRow: b.row, '--accent': b.accent }}
              {...makeHandlers(b.id)}
            >{b.label}</button>
          ))}
          <div className="dpad-center" style={{ gridColumn: 2, gridRow: 2 }} />
        </div>

        {/* Action buttons */}
        <div className="action-btns">
          <button
            id="pad-b"
            className={`action-btn btn-b ${isHeld('b') ? 'held' : ''}`}
            {...makeHandlers('b')}
          >B</button>
          <button
            id="pad-a"
            className={`action-btn btn-a ${isHeld('a') ? 'held' : ''}`}
            {...makeHandlers('a')}
          >A</button>
        </div>

        {/* Start */}
        <div className="meta-btns">
          <button
            id="pad-start"
            className={`start-btn ${isHeld('start') ? 'held' : ''}`}
            {...makeHandlers('start')}
          >START</button>
        </div>
      </div>

      {/* Held indicators */}
      <div className="held-row">
        {['up','down','left','right','a','b','start'].map(b => (
          <div key={b} className={`held-ind ${isHeld(b) ? 'active' : ''}`}
               style={{ '--c': b === 'a' ? 'var(--green)' : b === 'b' ? 'var(--red)' : 'var(--cyan)' }}>
            {b.toUpperCase()}
          </div>
        ))}
      </div>

      <style>{`
        .gamepad-wrap {
          background: var(--navy);
          border-top: 1px solid var(--border);
          flex-shrink: 0;
        }
        .pad-area {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          gap: 12px;
        }
        .dpad {
          display: grid;
          grid-template-columns: repeat(3, 32px);
          grid-template-rows: repeat(3, 32px);
          gap: 2px;
        }
        .dpad-btn {
          background: #0f1525;
          border: 1px solid var(--accent, var(--cyan));
          border-radius: 4px;
          color: var(--accent, var(--cyan));
          font-size: 14px;
          cursor: pointer;
          width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          transition: background 80ms, transform 80ms, box-shadow 80ms;
          user-select: none;
          -webkit-user-select: none;
        }
        .dpad-btn:active, .dpad-btn.held {
          background: rgba(0,255,255,0.15);
          transform: scale(0.9);
          box-shadow: 0 0 10px rgba(0,255,255,0.5);
        }
        .dpad-center {
          background: #0a1020;
          border-radius: 2px;
          border: 1px solid #1a2030;
        }

        .action-btns {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .action-btn {
          width: 44px; height: 44px;
          border-radius: 50%;
          border: none;
          font-family: var(--font-pixel);
          font-size: 7px;
          cursor: pointer;
          transition: transform 80ms, box-shadow 80ms;
          user-select: none;
          -webkit-user-select: none;
        }
        .btn-a {
          background: rgba(57,255,20,0.2);
          color: var(--green);
          box-shadow: 0 0 12px rgba(57,255,20,0.4), inset 0 0 8px rgba(57,255,20,0.1);
          border: 2px solid var(--green);
        }
        .btn-b {
          background: rgba(255,34,68,0.2);
          color: var(--red);
          box-shadow: 0 0 12px rgba(255,34,68,0.4), inset 0 0 8px rgba(255,34,68,0.1);
          border: 2px solid var(--red);
        }
        .action-btn:active, .action-btn.held {
          transform: scale(0.88);
          box-shadow: 0 0 20px currentColor !important;
        }

        .meta-btns { display: flex; gap: 6px; }
        .start-btn {
          background: #0f1525;
          border: 1px solid var(--text-dim);
          border-radius: 3px;
          color: var(--text-mid);
          font-family: var(--font-pixel);
          font-size: 6px;
          padding: 6px 10px;
          cursor: pointer;
          transition: background 80ms, transform 80ms;
          user-select: none;
          letter-spacing: 0.05em;
        }
        .start-btn:active, .start-btn.held {
          background: rgba(255,255,255,0.1);
          transform: scale(0.9);
        }

        .held-row {
          display: flex;
          gap: 4px;
          padding: 4px 16px 8px;
          justify-content: center;
        }
        .held-ind {
          font-family: var(--font-pixel);
          font-size: 6px;
          padding: 2px 4px;
          border: 1px solid var(--border);
          border-radius: 2px;
          color: var(--text-dim);
          transition: all 80ms;
          letter-spacing: 0.04em;
        }
        .held-ind.active {
          color: var(--c, var(--cyan));
          border-color: var(--c, var(--cyan));
          background: rgba(0,255,255,0.08);
          box-shadow: 0 0 6px var(--c, rgba(0,255,255,0.3));
        }
      `}</style>
    </div>
  );
}
