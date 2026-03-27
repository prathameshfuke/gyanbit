import React, { useState } from 'react';

const API = [
  { cat: 'DISPLAY', color: 'var(--green)', items: [
    { fn: 'bit.clear()',              desc: 'Erase all pixels' },
    { fn: 'bit.dot(x, y)',            desc: 'Light a single pixel' },
    { fn: 'bit.erase(x, y)',          desc: 'Turn off a pixel' },
    { fn: 'bit.get(x, y)',            desc: 'Read pixel → 0 or 1' },
    { fn: 'bit.line(x1,y1,x2,y2)',   desc: 'Bresenham line' },
    { fn: 'bit.box(x, y, w, h)',      desc: 'Hollow rectangle' },
    { fn: 'bit.fill(x, y, w, h)',     desc: 'Filled rectangle' },
    { fn: 'bit.circle(cx, cy, r)',    desc: 'Circle outline' },
    { fn: 'bit.fillCircle(cx,cy,r)', desc: 'Filled circle' },
    { fn: 'bit.text(x, y, str)',      desc: '5×7 bitmap text' },
    { fn: 'bit.bigText(x, y, str)',   desc: '10×14 scaled text' },
    { fn: 'bit.invert()',             desc: 'Invert all pixels' },
    { fn: 'bit.scroll(dx, dy)',       desc: 'Scroll pixel buffer' },
  ]},
  { cat: 'INPUT', color: 'var(--cyan)', items: [
    { fn: 'bit.onPress(btn, fn)',     desc: 'Fire fn once on press' },
    { fn: 'bit.onHold(btn, fn)',      desc: 'Fire fn every frame while held' },
    { fn: 'bit.isHeld(btn)',          desc: 'Returns true if button held' },
  ]},
  { cat: 'TIMING', color: 'var(--amber)', items: [
    { fn: 'bit.loop(fn)',             desc: 'Run fn at 30fps' },
    { fn: 'bit.frame',               desc: 'Current frame count' },
  ]},
  { cat: 'AUDIO', color: 'var(--magenta)', items: [
    { fn: 'bit.beep(freq, ms)',       desc: 'Square wave beep' },
    { fn: 'bit.melody(notes)',        desc: 'Play [[freq,ms], ...] array' },
  ]},
  { cat: 'UTILS', color: 'var(--text-mid)', items: [
    { fn: 'bit.print(...args)',       desc: 'Log to console' },
    { fn: 'bit.random(min, max)',     desc: 'Random integer inclusive' },
    { fn: 'bit.W, bit.H',            desc: 'Screen size (128, 64)' },
  ]},
];

const BTNS = '"up" "down" "left" "right" "a" "b" "start"';

export default function ApiDocs() {
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState(null);

  return (
    <div className="apidocs-wrap">
      <button
        className="section-header api-toggle"
        onClick={() => setOpen(v => !v)}
        style={{ width:'100%', cursor:'pointer', background:'none', border:'none', color:'var(--cyan)', textAlign:'left' }}
      >
        <span className="dot" style={{ background: 'var(--cyan)' }} />
        API REFERENCE
        <span style={{ marginLeft: 'auto' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="api-body">
          <div className="api-cats">
            {API.map(g => (
              <button
                key={g.cat}
                className={`cat-btn pixel-btn ${cat === g.cat ? 'active' : ''}`}
                style={{ color: g.color, borderColor: cat === g.cat ? g.color : 'transparent', fontSize: '6px' }}
                onClick={() => setCat(cat === g.cat ? null : g.cat)}
              >{g.cat}</button>
            ))}
          </div>

          {API.filter(g => !cat || g.cat === cat).map(group => (
            <div key={group.cat} className="api-group">
              <div className="api-group-head" style={{ color: group.color }}>{group.cat}</div>
              {group.items.map(item => (
                <div key={item.fn} className="api-item">
                  <code className="api-fn" style={{ color: group.color }}>{item.fn}</code>
                  <span className="api-desc">{item.desc}</span>
                </div>
              ))}
            </div>
          ))}

          <div className="api-note">
            Buttons: {BTNS}
          </div>
        </div>
      )}

      <style>{`
        .apidocs-wrap { border-top: 1px solid var(--border); flex-shrink: 0; }
        .api-body { padding: 6px 10px; max-height: 220px; overflow-y: auto; }
        .api-cats { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 6px; }
        .cat-btn { padding: 2px 6px !important; border-radius: 3px !important; }
        .api-group { margin-bottom: 8px; }
        .api-group-head {
          font-family: var(--font-pixel); font-size: 6px; letter-spacing: 0.1em;
          margin-bottom: 3px; text-transform: uppercase;
        }
        .api-item { display: flex; gap: 8px; align-items: baseline; padding: 1px 0; }
        .api-fn {
          font-family: var(--font-code); font-size: 11px; font-weight: 600;
          min-width: 160px; flex-shrink: 0; word-break: break-all;
        }
        .api-desc { font-family: var(--font-vt); font-size: 13px; color: var(--text-mid); }
        .api-note {
          font-family: var(--font-vt); font-size: 11px; color: var(--text-dim);
          border-top: 1px solid var(--border); padding-top: 5px; margin-top: 4px;
        }
      `}</style>
    </div>
  );
}
