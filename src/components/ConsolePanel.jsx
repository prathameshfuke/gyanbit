import React, { useRef, useEffect, useState } from 'react';

const MAX_LINES = 100;

function getLineColor(type) {
  return {
    error:  'var(--red)',
    warning:'var(--amber)',
    print:  'var(--cyan)',
    system: 'var(--green)',
  }[type] || '#aaaaaa';
}

export default function ConsolePanel({ lines, onClear }) {
  const listRef = useRef(null);

  // Auto-scroll on new lines
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [lines]);

  const now = new Date();
  const ts = (t) => {
    const d = new Date(t);
    const mm = String(d.getMinutes()).padStart(2,'0');
    const ss = String(d.getSeconds()).padStart(2,'0');
    return `${mm}:${ss}`;
  };

  return (
    <div className="console-panel neon-box">
      <div className="section-header" style={{ color: 'var(--green)' }}>
        <span className="dot" style={{ background: 'var(--green)' }} />
        CONSOLE
        <button className="pixel-btn clear-btn" onClick={onClear}
          style={{ color: 'var(--text-dim)', fontSize: '6px', marginLeft: 'auto', padding: '2px 6px' }}>
          CLR
        </button>
      </div>

      <div className="console-lines" ref={listRef}>
        {lines.length === 0 && (
          <div className="console-empty">Ready. Press RUN to execute.</div>
        )}
        {lines.map((line, i) => (
          <div
            key={i}
            className="console-line"
            style={{ color: getLineColor(line.type), animationDelay: '0ms' }}
          >
            <span className="con-ts">[{ts(line.t)}]</span>
            <span className="con-msg">{line.msg}</span>
          </div>
        ))}
      </div>

      <style>{`
        .console-panel {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
          background: #010101;
          overflow: hidden;
        }
        .console-lines {
          flex: 1;
          overflow-y: auto;
          padding: 6px 8px;
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .console-empty {
          font-family: var(--font-vt);
          font-size: 14px;
          color: var(--text-dim);
          padding: 8px 0;
        }
        .console-line {
          display: flex;
          gap: 8px;
          font-family: var(--font-vt);
          font-size: 14px;
          line-height: 1.4;
          animation: slideInLeft 0.15s ease-out both;
          word-break: break-all;
        }
        .con-ts {
          flex-shrink: 0;
          color: #334433;
          font-size: 12px;
        }
        .con-msg {
          flex: 1;
        }
        .clear-btn:hover {
          color: var(--red) !important;
        }
      `}</style>
    </div>
  );
}
