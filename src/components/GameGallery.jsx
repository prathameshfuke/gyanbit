import React from 'react';

function PixelIcon({ pixels, size = 4 }) {
  return (
    <svg width={10 * size} height={8 * size} style={{ display: 'block' }}>
      {pixels.map(([c, r, color = 'currentColor'], i) => (
        <rect key={i} x={c * size} y={r * size} width={size - 1} height={size - 1} fill={color} />
      ))}
    </svg>
  );
}

const ICONS = {
  arcade_menu: [
    [1, 1], [2, 1], [3, 1], [6, 1], [7, 1], [8, 1],
    [1, 2], [3, 2], [6, 2], [8, 2],
    [1, 3], [2, 3], [3, 3], [6, 3], [7, 3], [8, 3],
    [1, 5, '#39ff14'], [2, 5, '#39ff14'], [3, 5, '#39ff14'],
    [6, 5, '#ff7a00'], [7, 5, '#ff7a00'], [8, 5, '#ff7a00'],
    [4, 7, '#ffffff'], [5, 7, '#ffffff'],
  ],
  racing: [
    [4, 0, '#ffffff'], [5, 0, '#ffffff'],
    [3, 1], [4, 1], [5, 1], [6, 1],
    [3, 2], [6, 2],
    [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3],
    [2, 4], [7, 4],
    [3, 5], [4, 5], [5, 5], [6, 5],
    [3, 6], [6, 6],
    [2, 7], [3, 7], [6, 7], [7, 7],
  ],
};

const GAMES = [
  {
    id: 'arcade_menu',
    name: 'GYANBIT MENU',
    tagline: 'BOOT + MENU + MINI GAMES',
    accent: '#39ff14',
    file: 'arcade_menu'
  },
  {
    id: 'racing',
    name: 'RACING CLASSIC',
    tagline: 'DODGE TRAFFIC · SURVIVE',
    accent: '#ff7a00',
    file: 'racing'
  },
];

export default function GameGallery({ onLoad, onNew }) {
  return (
    <div className="gallery-wrap">
      <div className="section-header" style={{ color: 'var(--amber)', fontSize: '9px', padding: '10px 12px' }}>
        <span className="dot" style={{ background: 'var(--amber)' }} />
        GAME GALLERY - Select a game to load
      </div>

      <div className="cards-row">
        {/* New Project Card */}
        <div 
          className="game-card btn-new-card" 
          onClick={onNew}
          style={{ 
            '--accent': 'var(--cyan)', 
            '--shadow': 'rgba(0, 255, 255, 0.3)',
            '--bg': 'rgba(0, 255, 255, 0.05)'
          }}
        >
          <div className="card-icon-wrap" style={{ background: 'var(--cyan)', color: '#000' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          <div className="card-info">
            <div className="card-name" style={{ color: 'var(--cyan)' }}>NEW PROJECT</div>
            <div className="card-tag">EMPTY CANVAS</div>
          </div>
          <button className="card-load-btn pixel-btn" style={{ color: 'var(--cyan)', borderColor: 'var(--cyan)' }}>START</button>
        </div>

        {GAMES.map(g => (
          <div
            key={g.id}
            className="game-card"
            style={{ 
              '--accent': g.accent, 
              '--shadow': g.accent + '55',
              '--bg': g.accent + '22' // slight tint of the accent color for card bg
            }}
          >
            <div className="card-icon-wrap" style={{ background: g.accent, color: '#000' }}>
              <PixelIcon pixels={ICONS[g.id]} size={4} />
            </div>

            <div className="card-info">
              <div className="card-name" style={{ color: g.accent }}>{g.name}</div>
              <div className="card-tag">{g.tagline}</div>
            </div>

            <button
              id={`load-${g.id}`}
              className="card-load-btn pixel-btn"
              style={{ color: g.accent, borderColor: g.accent }}
              onClick={() => onLoad(g.file)}
            >LOAD</button>
          </div>
        ))}
      </div>

      <style>{`
        .gallery-wrap {
          background: #060610;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }
        .cards-row {
          display: flex;
          gap: 6px;
          padding: 8px 10px;
          overflow-x: auto;
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }
        .game-card {
          flex-shrink: 0;
          width: 140px;
          border: 2px solid var(--accent);
          border-radius: 6px;
          background: var(--bg);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 10px 8px 8px;
          cursor: pointer;
          transition: transform 200ms cubic-bezier(.34,1.56,.64,1), box-shadow 200ms;
          box-shadow: 0 0 12px rgba(0,0,0,0.5) inset;
        }
        .game-card:hover {
          transform: scale(1.05) translateY(-3px);
          box-shadow: 0 6px 22px var(--shadow), 0 0 0 2px var(--accent);
        }
        .card-icon-wrap {
          width: 100%;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 6px;
          border-radius: 4px;
          border: 2px solid rgba(0,0,0,0.5);
          box-shadow: inset 0 0 10px rgba(0,0,0,0.3);
        }
        .card-info { text-align: center; width: 100%; }
        .card-name {
          font-family: var(--font-pixel);
          font-size: 8px;
          letter-spacing: 0.05em;
          margin-bottom: 2px;
        }
        .card-tag {
          font-family: var(--font-vt);
          font-size: 15px;
          color: var(--text-mid);
          line-height: 1.2;
        }
        .card-load-btn {
          font-size: 8px !important;
          padding: 6px 10px !important;
          width: 100%;
          justify-content: center;
          box-shadow: 4px 4px 0 var(--shadow);
        }
        .card-load-btn:hover {
          background: rgba(255,255,255,0.06);
          box-shadow: 0 0 16px var(--shadow);
        }
      `}</style>
    </div>
  );
}
