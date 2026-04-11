import React, { useState, useEffect, useRef, useCallback } from 'react';
import Toolbar from './components/Toolbar.jsx';
import CodeEditor from './components/CodeEditor.jsx';
import OLEDScreen from './components/OLEDScreen.jsx';
import GamePad from './components/GamePad.jsx';
import ConsolePanel from './components/ConsolePanel.jsx';
import GameGallery from './components/GameGallery.jsx';
import PinMap from './components/PinMap.jsx';
import ApiDocs from './components/ApiDocs.jsx';
import { GyanBitRuntime } from './runtime/GyanBitRuntime.js';
import { generateMicroPython } from './runtime/MicroPythonGen.js';
import { BOOT_CODE } from './assets/bootscreen.js';

// Game source imports
import snakeCode      from './games/snake.js';
import breakoutCode   from './games/breakout.js';
import dodgerCode     from './games/dodger.js';
import mazeCode       from './games/maze.js';
import pongCode       from './games/pong.js';
import flappyCode     from './games/flappy.js';
import spaceCode      from './games/space.js';
import marioCode      from './games/mario.js';
import f1Code         from './games/f1racing.js';
import arcadeMenuCode from './games/arcade_menu.js';
import racingCode     from './games/racing.js';

const GAME_MAP = {
  snake: snakeCode,
  breakout: breakoutCode,
  dodger: dodgerCode,
  maze: mazeCode,
  pong: pongCode,
  flappy: flappyCode,
  space: spaceCode,
  mario: marioCode,
  f1: f1Code,
  arcade_menu: arcadeMenuCode,
  racing: racingCode
};
const MAX_CONSOLE = 100;
const INITIAL_CODE = `// Welcome to GyanBit Studio!
// Write your game using the bit.* API
// Press RUN to simulate on the OLED display

bit.loop(() => {
  bit.clear();
  // Bouncing ball demo
  const t = bit.frame / 30;
  const bx = Math.round(64 + 50 * Math.sin(t * 1.3));
  const by = Math.round(32 + 20 * Math.sin(t * 2.1));
  bit.fillCircle(bx, by, 4);
  bit.text(0, 0, 'GYANBIT');
  bit.text(60, 56, String(bit.frame));
});
`;

function addLog(prev, msg, type = 'system') {
  const entry = { msg, type, t: Date.now() };
  return prev.length >= MAX_CONSOLE ? [...prev.slice(1), entry] : [...prev, entry];
}

export default function App() {
  const [code, setCode] = useState(INITIAL_CODE);
  const [running, setRunning] = useState(false);
  const [connected, setConnected] = useState(false);
  const [logs, setLogs] = useState([{ msg: 'GyanBit Studio ready ▶', type: 'system', t: Date.now() }]);
  const [fps, setFps] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const [heldButtons, setHeldButtons] = useState(new Set());
  const runtimeRef = useRef(null);
  const serialRef  = useRef(null);
  const fpsTimerRef = useRef(null);

  const appendLog = useCallback((msg, type) => {
    setLogs(prev => addLog(prev, msg, type));
  }, []);

  // Create runtime once
  useEffect(() => {
    const rt = new GyanBitRuntime(
      () => { /* buffer rendered by OLEDScreen via polling */ },
      (msg, type) => appendLog(msg, type),
      () => { /* audio handled inside runtime */ }
    );
    runtimeRef.current = rt;
    // Show boot screen on first load
    rt.runCode(BOOT_CODE);
    setRunning(true);
    return () => rt.stop();
  }, [appendLog]);

  // Poll FPS from runtime
  useEffect(() => {
    fpsTimerRef.current = setInterval(() => {
      const rt = runtimeRef.current;
      if (rt) {
        setFps(rt.getMeasuredFps());
        setFrameCount(rt.bit.frame);
        // Sync held buttons for GamePad display
        setHeldButtons(new Set(rt._heldButtons));
      }
    }, 200);
    return () => clearInterval(fpsTimerRef.current);
  }, []);

  // Keyboard → runtime buttons
  useEffect(() => {
    const KEY_MAP = {
      ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
      z: 'a', Z: 'a', x: 'b', X: 'b', Enter: 'start', ' ': 'start',
      w: 'up', s: 'down', a: 'left', d: 'right',
      W: 'up', S: 'down', A: 'left', D: 'right',
      k: 'a', K: 'a', l: 'b', L: 'b'
    };
    const onKeyDown = (e) => {
      // Don't intercept if focus is on the editor or any input
      const isTyping = e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT';
      
      // Don't intercept if Ctrl, Alt, or Meta keys are pressed (for standard shortcuts)
      const hasModifier = e.ctrlKey || e.metaKey || e.altKey;

      if (e.key === 'F5') { e.preventDefault(); handleRun(); return; }
      if (e.key === 'F8') { e.preventDefault(); handleStop(); return; }

      // Game pad controls mapping
      const btn = KEY_MAP[e.key];
      if (btn && !isTyping && !hasModifier) {
        e.preventDefault();
        runtimeRef.current?.pressButton(btn);
      }
    };
    const onKeyUp = (e) => {
      const btn = KEY_MAP[e.key];
      if (btn) runtimeRef.current?.releaseButton(btn);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup',   onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup',   onKeyUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Actions ────────────────────────────────────────────
  const handleRun = useCallback(() => {
    const rt = runtimeRef.current;
    if (!rt) return;
    rt.runCode(code);
    setRunning(true);
    appendLog('▶ Running user code', 'system');
  }, [code, appendLog]);

  const handleStop = useCallback(() => {
    runtimeRef.current?.stop();
    setRunning(false);
  }, []);

  const handleReset = useCallback(() => {
    runtimeRef.current?.reset();
    setRunning(false);
    appendLog('↺ Reset', 'system');
  }, [appendLog]);

  const handleConnect = useCallback(async () => {
    if (!('serial' in navigator)) {
      appendLog('WebSerial not supported. Use Chrome/Edge.', 'error');
      return;
    }
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });
      serialRef.current = port;
      setConnected(true);
      appendLog('🔌 Pico connected via WebSerial', 'system');
    } catch (err) {
      appendLog(`Connect failed: ${err.message}`, 'error');
    }
  }, [appendLog]);

  const handleFlash = useCallback(async () => {
    if (!serialRef.current || !connected) {
      appendLog('Not connected. Click CONNECT first.', 'warning');
      return;
    }
    try {
      const py = generateMicroPython(code);
      const writer = serialRef.current.writable.getWriter();
      const enc = new TextEncoder();
      // Enter paste mode
      await writer.write(enc.encode('\x05'));
      await new Promise(r => setTimeout(r, 300));
      await writer.write(enc.encode(py));
      await writer.write(enc.encode('\x04'));
      writer.releaseLock();
      appendLog('⚡ Flashed to Pico!', 'system');
    } catch (err) {
      appendLog(`Flash failed: ${err.message}`, 'error');
    }
  }, [connected, code, appendLog]);

  const handleDownload = useCallback(() => {
    const py = generateMicroPython(code);
    const blob = new Blob([py], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'gyanbit_game.py';
    a.click();
    URL.revokeObjectURL(url);
    appendLog('↓ Downloaded gyanbit_game.py', 'system');
  }, [code, appendLog]);

  const handleLoadGame = useCallback((gameId) => {
    const src = GAME_MAP[gameId];
    if (!src) return;
    setCode(src);
    appendLog(`Loaded game: ${gameId}`, 'system');
  }, [appendLog]);

  const handleNewGame = useCallback(() => {
    if (window.confirm('Start a new project? This will clear your current code.')) {
      setCode(INITIAL_CODE);
      appendLog('✚ New project started', 'system');
      runtimeRef.current?.stop();
      setRunning(false);
    }
  }, [appendLog]);

  const handleClearConsole = useCallback(() => setLogs([]), []);

  return (
    <div className="app-shell">
      <Toolbar
        onRun={handleRun}
        onStop={handleStop}
        onReset={handleReset}
        onConnect={handleConnect}
        onFlash={handleFlash}
        onDownload={handleDownload}
        onNew={handleNewGame}
        fps={fps}
        frameCount={frameCount}
        running={running}
        connected={connected}
      />

      <div className="main-area">
        {/* ── LEFT: Gallery + Editor ─────────────────── */}
        <div className="left-panel">
          <GameGallery onLoad={handleLoadGame} onNew={handleNewGame} />
          <div className="editor-outer neon-box scanlines" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div className="section-header" style={{ color: 'var(--amber)' }}>
              <span className="dot" style={{ background: 'var(--amber)' }} />
              CODE EDITOR — JavaScript (bit.* API)
            </div>
            <CodeEditor code={code} onChange={setCode} />
          </div>
          <ConsolePanel lines={logs} onClear={handleClearConsole} />
        </div>

        {/* ── RIGHT: OLED + Pad + Ref ────────────────── */}
        <div className="right-panel">
          <OLEDScreen runtimeRef={runtimeRef} running={running} code={code} onStop={handleStop} />
          <GamePad runtimeRef={runtimeRef} heldButtons={heldButtons} />
          <div className="sidebar-ref" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            <PinMap />
            <ApiDocs />
          </div>
        </div>
      </div>

      <style>{`
        .editor-outer { background: var(--dark); }
        .sidebar-ref {
          background: var(--navy);
          border-top: 1px solid var(--border);
        }
        .console-panel { max-height: 160px; }
      `}</style>
    </div>
  );
}
