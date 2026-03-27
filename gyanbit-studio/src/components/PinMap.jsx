import React, { useState } from 'react';

const PINS = [
  { pin: 'GP16', func: 'SDA (OLED)', color: 'var(--cyan)' },
  { pin: 'GP17', func: 'SCL (OLED)', color: 'var(--cyan)' },
  { pin: 'GP15', func: 'PWM Audio → PAM8403', color: 'var(--amber)' },
  { pin: 'GP2',  func: 'Button UP',    color: 'var(--green)' },
  { pin: 'GP3',  func: 'Button DOWN',  color: 'var(--green)' },
  { pin: 'GP4',  func: 'Button LEFT',  color: 'var(--green)' },
  { pin: 'GP5',  func: 'Button RIGHT', color: 'var(--green)' },
  { pin: 'GP6',  func: 'Button A',     color: 'var(--green)' },
  { pin: 'GP7',  func: 'Button B',     color: 'var(--green)' },
  { pin: 'VBUS', func: 'USB 5V → TP4056', color: 'var(--red)' },
  { pin: 'GND',  func: 'Ground',       color: 'var(--text-dim)' },
  { pin: '3V3',  func: 'MCU 3.3V rail', color: 'var(--magenta)' },
];

export default function PinMap() {
  const [open, setOpen] = useState(false);
  return (
    <div className="pinmap-wrap">
      <button
        className="section-header pinmap-toggle"
        onClick={() => setOpen(v => !v)}
        style={{ width: '100%', cursor: 'pointer', background: 'none', border: 'none', color: 'var(--amber)', textAlign:'left' }}
      >
        <span className="dot" style={{ background: 'var(--amber)' }} />
        PIN MAP — GyanBit Hardware
        <span style={{ marginLeft: 'auto' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="pin-table">
          {PINS.map(p => (
            <div key={p.pin} className="pin-row">
              <div className="pin-badge" style={{ color: p.color, borderColor: p.color }}>{p.pin}</div>
              <div className="pin-func">{p.func}</div>
            </div>
          ))}
          <div className="hw-note">
            🔌 Pico → micro-USB &nbsp;|&nbsp; OLED I2C 0x3C &nbsp;|&nbsp; Buttons: PULL_UP (pressed=LOW)
          </div>
        </div>
      )}
      <style>{`
        .pinmap-wrap { border-top: 1px solid var(--border); flex-shrink: 0; }
        .pinmap-toggle { gap: 6px; }
        .pin-table { padding: 6px 10px; display: flex; flex-direction: column; gap: 3px; }
        .pin-row { display: flex; align-items: center; gap: 8px; }
        .pin-badge {
          font-family: var(--font-pixel); font-size: 6px; letter-spacing: 0.06em;
          border: 1px solid; border-radius: 2px; padding: 2px 5px;
          min-width: 42px; text-align: center; flex-shrink: 0;
        }
        .pin-func { font-family: var(--font-vt); font-size: 13px; color: var(--text-mid); }
        .hw-note {
          font-family: var(--font-vt); font-size: 11px; color: var(--text-dim);
          margin-top: 4px; border-top: 1px solid var(--border); padding-top: 4px;
        }
      `}</style>
    </div>
  );
}
