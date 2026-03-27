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
# Clone the repo
git clone https://github.com/your-username/gyanbit-studio.git
cd gyanbit-studio

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open `http://localhost:5173` in your browser to see the landing page.

### 🔺 Deploying to Vercel (Production)

Because this repository contains the `gyanbit-studio` sub-folder, follow these exact steps to host your site for free on Vercel:

1. Go to [Vercel](https://vercel.com/) and click **Add New → Project**.
2. Import your `prathameshfuke/gyanbit` GitHub repository.
3. **CRITICAL STEP**: Click `Edit` next to **Root Directory** and select `gyanbit-studio`.
4. The remaining settings will auto-detect correctly:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy!**

Your entire Landing Page, Docs, and Web IDE will be live worldwide in under a minute!

---

## 📁 Project Structure

```
gyanbit-studio/
├── index.html          # Landing page
├── about.html          # About GyanBit
├── docs.html           # Documentation & User Manual
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
        ├── snake.js
        ├── pong.js
        ├── breakout.js
        ├── dodger.js
        ├── maze.js
        ├── flappy.js
        └── space.js
```

---

## 🎨 Design System

The entire app uses a consistent **16-bit retro** color palette:

| Token | Color | Usage |
|---|---|---|
| `--green` | `#34d399` | Success states, action buttons |
| `--cyan` | `#3b82f6` | Links, headings, Sega-blue accents |
| `--amber` | `#f59e0b` | Warnings, labels, highlight text |
| `--red` | `#ef4444` | Errors, destructive actions |
| `--bg` | `#faf8ef` | Page background (retro beige) |
| `--text` | `#1e293b` | Primary text (dark slate) |

**Fonts**: `Press Start 2P` (headings), `DotGothic16` (body), `VT323` (monospace/code)

---

## 🔌 Hardware Specs

| Component | Specification |
|---|---|
| MCU | RP2040 (Dual-core ARM Cortex-M0+, 133MHz) |
| Display | 1.3" SH1106 Monochrome OLED, 128×64px |
| Input | 4-way D-Pad + A, B, START buttons |
| Power | Rechargeable LiPo via USB-C |
| Shell | Sustainable bamboo-fiber enclosure |

---

## 📖 User Manual

### In the Box
- 1× GyanBit Mainboard (RP2040)
- 1× 1.3" Monochrome OLED Display (SH1106)
- 1× Custom D-Pad and Button Membrane Set
- 1× Reusable USB-C Data Cable
- 1× Recyclable Bamboo-Fiber Enclosure Shell

### Step-by-Step Usage
1. **Open the IDE** → Navigate to the website and click "Open Studio"
2. **Write your game** → Use the `bit.*` API in JavaScript
3. **Test in simulator** → Click ▶ RUN to see it on the virtual OLED
4. **Flash to hardware** → Connect via USB-C → click ⚡ FLASH

### `bit.*` API Quick Reference

| Function | Description |
|---|---|
| `bit.clear()` | Clear the screen |
| `bit.fill(x,y,w,h)` | Draw a filled rectangle |
| `bit.text(x,y,str)` | Render pixel text |
| `bit.line(x1,y1,x2,y2)` | Draw a line |
| `bit.circle(cx,cy,r)` | Draw a circle outline |
| `bit.isHeld('btn')` | Check if button is held |
| `bit.isPressed('btn')` | Check if button was just pressed this frame |
| `bit.loop(fn)` | Register the main game loop (~30fps) |
| `bit.beep(freq,ms)` | Play a square-wave beep |

---

## 🌱 Eco-Friendly Commitment

- **Bamboo shell**: 100% biodegradable at end of life
- **Kraft paper packaging**: Recycled materials, no plastic
- **PCB recycling**: Please dispose at designated e-waste centers

---

## 🇮🇳 Made in India

Built for curious minds by the GyanBit team.

---

## License

MIT © GyanBit
