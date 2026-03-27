// ── GyanBit BYTE Bot — Vercel Serverless API Proxy ──
// Securely proxies chat requests to Google Gemini API.
// The API key is NEVER exposed to the browser.

const GEMINI_MODEL = 'gemini-2.0-flash';

// ── Rate Limiter (in-memory, per-instance) ─────────────
const rateLimitMap = new Map();
const RATE_LIMIT = 20;       // max requests
const RATE_WINDOW = 60_000;  // per 60 seconds

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.windowStart > RATE_WINDOW) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 });
    return false;
  }
  entry.count++;
  if (entry.count > RATE_LIMIT) return true;
  return false;
}

// ── Content Filter ─────────────────────────────────────
const BLOCKED_PATTERNS = [
  /\b(hack|exploit|inject|phish|malware|virus)\b/i,
  /\b(password|credit.?card|social.?security|ssn)\b/i,
];

function isContentSafe(text) {
  return !BLOCKED_PATTERNS.some(p => p.test(text));
}

// ── GyanBit System Context ─────────────────────────────
const SYSTEM_PROMPT = `You are BYTE 🤖, the friendly AI coding buddy for GyanBit — an 8-bit DIY game console made in India for students aged 12–17.

PERSONALITY:
- You are enthusiastic, encouraging, and patient
- You speak like a cool older sibling who loves retro games
- Keep responses SHORT (max 150 words) and use emojis sparingly
- If a kid is stuck, give hints before full solutions
- Always stay on topic: GyanBit, coding, games, hardware

GYANBIT OVERVIEW:
- GyanBit is a DIY 8-bit handheld game console kit
- Students write JavaScript in a browser-based IDE called "GyanBit Studio"
- Games run on a 128×64 OLED simulator in the browser
- One-click FLASH converts JS to MicroPython and sends it to real hardware via USB-C WebSerial
- The console uses an RP2040 MCU (dual-core ARM Cortex-M0+ at 133MHz)
- Display: 1.3" SH1106 OLED (monochrome, 128×64 pixels)
- Input: 4-way D-Pad + A, B, START buttons
- Audio: Piezo buzzer via PWM
- Power: USB-C or LiPo battery
- Cost: ~₹970 total BOM

bit.* API REFERENCE (this is what kids use to code games):
- bit.clear() — Clears the entire 128×64 screen
- bit.fill(x, y, w, h) — Draws a filled rectangle at (x,y) with width w and height h
- bit.rect(x, y, w, h) — Draws an outline rectangle
- bit.circle(cx, cy, r) — Draws an outline circle centered at (cx,cy) with radius r
- bit.fillCircle(cx, cy, r) — Draws a filled circle
- bit.line(x1, y1, x2, y2) — Draws a line between two points
- bit.pixel(x, y) — Sets a single pixel
- bit.text(x, y, string) — Renders pixel text at the given position
- bit.isHeld('button') — Returns true if button is currently held down. Buttons: 'up', 'down', 'left', 'right', 'a', 'b', 'start'
- bit.isPressed('button') — Returns true only on the frame the button was first pressed
- bit.loop(fn) — Registers the main game loop function (runs at ~30fps)
- bit.beep(frequency, durationMs) — Plays a square-wave beep
- bit.frame — Read-only number, the current frame count since game started

GAME DEVELOPMENT WORKFLOW:
1. Open GyanBit Studio at gyanbit.vercel.app/studio.html
2. Write JavaScript code using the bit.* API
3. Click RUN (▶) to simulate on the OLED display in the browser
4. Use the on-screen D-Pad or keyboard (WASD/Arrow keys, Z=A, X=B, Enter=START) to play
5. When ready, connect the console via USB-C
6. Click FLASH (⚡) to auto-convert to MicroPython and send to hardware
7. The game runs on the real console!

BUILT-IN GAMES (7 total):
Snake, Breakout, Pong, Dodger, Maze, Space Invaders, Flappy Bird

HARDWARE PINOUT:
- OLED SDA: GP16 (I2C0), OLED SCL: GP17 (I2C0)
- Audio: GP20 (PWM)
- Button UP: GP2, DOWN: GP3, LEFT: GP4, RIGHT: GP5
- Button A: GP6, Button B: GP8, START: GP9

RULES:
1. ONLY answer questions about GyanBit, coding, JavaScript, game development, and the hardware
2. If asked about unrelated topics, politely redirect: "I'm BYTE, your GyanBit coding buddy! I can help you with game coding, the bit.* API, or hardware questions. What would you like to build? 🎮"
3. NEVER share API keys, passwords, or personal data
4. NEVER generate code that accesses the filesystem, network, or anything outside the bit.* API
5. When showing code, always use the bit.* API syntax
6. If a kid seems frustrated, be extra encouraging
7. Code examples should be SHORT and runnable in GyanBit Studio`;

// ── Main Handler ───────────────────────────────────────
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── Security: Rate Limit ──
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
                || req.headers['x-real-ip']
                || req.connection?.remoteAddress
                || 'unknown';

  if (isRateLimited(clientIp)) {
    return res.status(429).json({
      error: 'Whoa, slow down! 🐢 BYTE needs a breather. Try again in a minute!',
    });
  }

  // ── Security: Validate Input ──
  const { message, history } = req.body || {};

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (message.length > 500) {
    return res.status(400).json({
      error: 'Message too long! Keep it under 500 characters so BYTE can help you faster 🚀',
    });
  }

  if (!isContentSafe(message)) {
    return res.status(400).json({
      error: "Let's stick to coding and games! 🎮 Ask me about the bit.* API or how to build a game!",
    });
  }

  // ── Security: API Key Check ──
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY environment variable is not set');
    return res.status(500).json({
      error: 'BYTE is sleeping 😴 The server is not configured yet. Ask your teacher to set up the API key!',
    });
  }

  // ── Build conversation ──
  const contents = [];

  // Add conversation history (max last 10 turns)
  if (Array.isArray(history)) {
    const trimmedHistory = history.slice(-10);
    for (const turn of trimmedHistory) {
      if (turn.role && turn.text) {
        contents.push({
          role: turn.role === 'user' ? 'user' : 'model',
          parts: [{ text: turn.text.slice(0, 500) }],
        });
      }
    }
  }

  // Add current message
  contents.push({
    role: 'user',
    parts: [{ text: message }],
  });

  // ── Call Gemini API ──
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 512,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_LOW_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', response.status, errText);
      return res.status(502).json({
        error: 'BYTE hit a glitch 🐛 Try again in a moment!',
      });
    }

    const data = await response.json();
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text
      || "Hmm, BYTE is thinking too hard 🤔 Try asking in a different way!";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('BYTE Bot error:', err);
    return res.status(500).json({
      error: 'BYTE crashed! 💥 Try again in a few seconds.',
    });
  }
}
