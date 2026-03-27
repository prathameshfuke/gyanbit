# 🎮 GyanBit — DIY Educational Game Console

<p align="center">
  <strong>Code games in your browser. Flash them to real hardware. Learn by playing.</strong>
</p>

---

## What is GyanBit?

GyanBit is an open-source, DIY handheld game console designed for Indian students aged 12–17. It combines a browser-based IDE (GyanBit Studio) with custom RP2040-powered hardware, allowing students to write games in JavaScript and instantly play them on a physical 128×64 OLED screen.

**No drivers. No toolchains. No setup.** Just open the browser and start making games.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🖥️ **Browser IDE** | Full code editor with syntax highlighting, OLED simulator, and on-screen gamepad |
| 🎮 **7 Built-in Games** | Snake, Pong, Breakout, Dodger, Maze, Flappy Bird, Space Invaders |
| 📖 **4-Part Tutorial** | Step-by-step guide to building your first maze game from scratch |
| ⚡ **One-Click Flash** | Auto-translates JavaScript → MicroPython and flashes via USB-C |
| 📱 **Retro 16-bit Design** | Press Start 2P typography, pixel art, chunky borders |
| ♻️ **Eco-Friendly** | Bamboo-fiber enclosure, recycled kraft paper packaging |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and **npm**
- A modern browser (Chrome, Edge, Firefox)

### Run Locally

```bash
git clone https://github.com/prathameshfuke/gyanbit.git
cd gyanbit
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### 🔺 Deploy to Vercel

1. Go to [vercel.com](https://vercel.com/) → **Add New → Project**
2. Import `prathameshfuke/gyanbit`
3. Settings auto-detect:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy** — done!

> No need to change the Root Directory. Everything builds from the repo root.

---

## 📁 Project Structure

```
gyanbit/
├── index.html          # Landing page
├── about.html          # About GyanBit
├── docs.html           # Documentation, Tutorials, Flowcharts & User Manual
├── games.html          # Game library showcase
├── hardware.html       # Hardware specs
├── studio.html         # The IDE (React app entry)
├── style.css           # Global retro stylesheet
├── script.js           # Landing page animations
├── vite.config.js      # Multi-page Vite config
├── public/images/      # Logo & hero images
└── src/
    ├── App.jsx              # IDE root component
    ├── main.jsx             # React entry point
    ├── components/
    │   ├── Toolbar.jsx      # IDE toolbar (Run/Stop/Reset/Flash/Home)
    │   ├── CodeEditor.jsx   # Syntax-highlighted editor
    │   ├── OLEDScreen.jsx   # 128×64 OLED simulator canvas
    │   ├── GamePad.jsx      # On-screen D-Pad + A/B/Start
    │   ├── GameGallery.jsx  # Colorful game card carousel
    │   ├── ConsolePanel.jsx # Debug log output
    │   ├── ApiDocs.jsx      # Inline API reference
    │   └── PinMap.jsx       # Hardware pin diagram
    ├── runtime/
    │   ├── GyanBitRuntime.js    # Core bit.* API engine
    │   ├── PixelFont.js         # 5×7 bitmap font renderer
    │   └── MicroPythonGen.js    # JS → MicroPython transpiler
    └── games/
        ├── snake.js    ├── pong.js
        ├── breakout.js ├── dodger.js
        ├── maze.js     ├── flappy.js
        └── space.js
```

---

## 🎨 Design System

| Token | Color | Usage |
|---|---|---|
| `--green` | `#34d399` | Success, action buttons |
| `--cyan` | `#3b82f6` | Links, Sega-blue accents |
| `--amber` | `#f59e0b` | Warnings, highlights |
| `--red` | `#ef4444` | Errors, destructive |
| `--bg` | `#faf8ef` | Retro beige background |
| `--text` | `#1e293b` | Dark slate text |

**Fonts**: `Press Start 2P` · `DotGothic16` · `VT323`

---

## 🔌 Hardware

| Component | Spec |
|---|---|
| MCU | RP2040 (Dual-core ARM Cortex-M0+, 133MHz) |
| Display | 1.3" SH1106 Monochrome OLED, 128×64px |
| Input | D-Pad + A, B, START |
| Power | LiPo via USB-C |
| Shell | Bamboo-fiber (biodegradable) |

---

## 📖 `bit.*` API

| Function | Description |
|---|---|
| `bit.clear()` | Clear screen |
| `bit.fill(x,y,w,h)` | Filled rectangle |
| `bit.text(x,y,str)` | Pixel text |
| `bit.line(x1,y1,x2,y2)` | Draw line |
| `bit.circle(cx,cy,r)` | Circle outline |
| `bit.isHeld('btn')` | Button held check |
| `bit.isPressed('btn')` | Single-frame press check |
| `bit.loop(fn)` | Game loop (~30fps) |
| `bit.beep(freq,ms)` | Square-wave beep |

---

## 🇮🇳 Made in India

Built for curious minds by the GyanBit team.

**License**: MIT © GyanBit
