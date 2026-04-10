import React from 'react';

// Simple pixel icon renderer using inline SVG rects — reliable across all browsers
function PixelIcon({ pixels, size = 4 }) {
  // pixels = array of [col, row, color?]
  return (
    <svg width={10 * size} height={8 * size} style={{ display: 'block' }}>
      {pixels.map(([c, r, color = 'currentColor'], i) => (
        <rect key={i} x={c * size} y={r * size} width={size - 1} height={size - 1} fill={color} />
      ))}
    </svg>
  );
}

// Each game's pixel art icon: [col, row, optionalColor]
const ICONS = {
  snake: [
    [1,1],[2,1],[3,1],[4,1],[5,1],        // snake body horizontal
    [5,2],[5,3],[5,4],                      // snake turn down
    [4,4],[3,4],[2,4],[1,4],               // snake bottom
    [1,3],[1,2],                            // snake up
    [7,2,'#ff2244'],                        // apple
    [7,3,'#ff2244'],
  ],
  breakout: [
    [0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],  // brick row 1
    [0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1],  // brick row 2
    [0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[8,2],  // brick row 3
    [3,5,'#ffffff'],[4,5,'#ffffff'],        // ball
    [1,7],[2,7],[3,7],[4,7],[5,7],[6,7],   // paddle
  ],
  dodger: [
    [2,0],[3,0],                            // rock
    [5,1],[6,1],[7,1],
    [0,2],[1,2],
    [3,3],[4,3],[5,3],[6,3],
    [1,5],[2,5],                            // rock
    [4,6,'#39ff14'],[5,6,'#39ff14'],        // player
    [4,7,'#39ff14'],[5,7,'#39ff14'],
  ],
  maze: [
    // Simplified maze grid outline
    [0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],
    [0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],
    [8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,6],[8,7],
    [0,7],[1,7],[2,7],[3,7],[4,7],[5,7],[6,7],[7,7],
    // inner walls
    [2,2],[3,2],[4,2],
    [2,2],[2,3],[2,4],
    [4,4],[5,4],[6,4],
    [6,4],[6,5],[6,6],
    [1,1,'#39ff14'],  // player
    [7,6,'#ff00ff'], // exit
  ],
  pong: [
    [0,1],[0,2],[0,3],[0,4],[0,5],  // left paddle
    [8,2],[8,3],[8,4],              // right paddle
    [4,3,'#ffffff'],[5,3,'#ffffff'],// ball
    // dash center line
    [4,0,'#333344'],[4,2,'#333344'],[4,4,'#333344'],[4,6,'#333344'],
  ],
  flappy: [
    [1,3,'#ffcc00'],[2,3,'#ffcc00'],[3,3,'#ffcc00'], // bird body
    [4,3,'#ff5500'],[4,4,'#ff5500'], // beak
    [1,2,'#ffffff'], // wing
    // top pipe
    [6,0,'#33ff33'],[7,0,'#33ff33'],[8,0,'#33ff33'],
    [6,1,'#33ff33'],[7,1,'#33ff33'],[8,1,'#33ff33'],
    [6,2,'#33ff33'],[8,2,'#33ff33'],
    // bottom pipe
    [6,6,'#33ff33'],[7,6,'#33ff33'],[8,6,'#33ff33'],
    [6,7,'#33ff33'],[7,7,'#33ff33'],[8,7,'#33ff33'],
  ],
  space: [
    [4,7,'#39ff14'],[5,7,'#39ff14'],[6,7,'#39ff14'], // player base
    [5,6,'#39ff14'], // canon
    [1,1,'#ff2244'],[2,1,'#ff2244'],[3,1,'#ff2244'], // alien 1
    [2,2,'#ff2244'],
    [6,1,'#ff2244'],[7,1,'#ff2244'],[8,1,'#ff2244'], // alien 2
    [7,2,'#ff2244'],
    [5,4,'#ffffff'], // bullet
  ],
  doom: [
    [4,6,'#aaaaaa'],[5,6,'#aaaaaa'], // gun barrel
    [4,7,'#aaaaaa'],[5,7,'#aaaaaa'], // gun base
    [2,3,'#ff2244'],[3,3,'#ff2244'], // monster
    [2,4,'#ff2244'],[3,4,'#ff2244'], // monster
    [0,1,'#ffffff'],[0,2,'#ffffff'],[0,3,'#ffffff'],[0,4,'#ffffff'], // left wall
    [9,1,'#ffffff'],[9,2,'#ffffff'],[9,3,'#ffffff'],[9,4,'#ffffff'], // right wall
    [4,4,'#ffcc00'],[5,4,'#ffcc00'], // flash
  ],
};

const GAMES = [
  { id: 'snake',    name: 'SNAKE',    tagline: 'EAT · GROW · DIE',   accent: '#39ff14', file: 'snake'    },
  { id: 'breakout', name: 'BREAKOUT', tagline: 'SMASH THE BRICKS',   accent: '#00ffff', file: 'breakout' },
  { id: 'dodger',   name: 'DODGER',   tagline: 'DUCK THE ROCKS!',    accent: '#ffb700', file: 'dodger'   },
  { id: 'maze',     name: 'MAZE',     tagline: 'FIND THE EXIT',      accent: '#ff00ff', file: 'maze'     },
  { id: 'pong',     name: 'PONG',     tagline: 'BEAT THE AI!',       accent: '#ff6600', file: 'pong'     },
  { id: 'flappy',   name: 'FLAPPY',   tagline: 'FLAP TO SURVIVE',    accent: '#ffcc00', file: 'flappy'   },
  { id: 'space',    name: 'SPACE',    tagline: 'DEFEND EARTH',       accent: '#ff2244', file: 'space'    },
  { id: 'doom',     name: 'DOOM',     tagline: 'RIP AND TEAR',       accent: '#ff0033', file: 'doom'     },
];

export default function GameGallery({ onLoad, onNew }) {
  return (
    <div className="gallery-wrap">
      <div class="section-header" style={{ color: 'var(--amber)', fontSize: '9px', padding: '10px 12px' }}>
        <span className="dot" style={{ background: 'var(--amber)' }} />
        GAME GALLERY — Select a game to load
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
