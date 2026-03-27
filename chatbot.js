// ── BYTE Bot — Retro Chat Widget for GyanBit ──────────
// Self-contained, no dependencies. Injected on every page.
// Supports: Groq (free, fast) and Gemini (Google) APIs.

(function () {
  'use strict';

  const MAX_HISTORY = 20;
  const STORAGE_KEY = 'gyanbit-byte-chat';
  const KEY_STORAGE = 'gyanbit-byte-apikey';
  const PROVIDER_STORAGE = 'gyanbit-byte-provider';

  // ── Provider configs ──
  const PROVIDERS = {
    groq: {
      name: 'Groq (Free)',
      model: 'llama-3.1-8b-instant',
      url: 'https://api.groq.com/openai/v1/chat/completions',
      getKey: 'https://console.groq.com/keys',
      placeholder: 'Paste your Groq API key (gsk_...)',
    },
    gemini: {
      name: 'Google Gemini',
      model: 'gemini-2.0-flash',
      url: 'https://generativelanguage.googleapis.com/v1beta/models/',
      getKey: 'https://aistudio.google.com/apikey',
      placeholder: 'Paste your Gemini API key (AIza...)',
    },
  };

  // ── State ──
  let isOpen = false;
  let isLoading = false;
  let settingsOpen = false;
  let messages = loadMessages();

  // ── System Prompt ─────
  const SYSTEM_PROMPT = `You are BYTE 🤖, the friendly AI coding buddy for GyanBit — an 8-bit DIY game console made in India for students aged 12–17.

PERSONALITY:
- You are enthusiastic, encouraging, and patient
- You speak like a cool older sibling who loves retro games
- Keep responses SHORT (max 150 words) and use emojis sparingly
- If a kid is stuck, give hints before full solutions
- Always stay on topic: GyanBit, coding, games, hardware

GYANBIT OVERVIEW:
- GyanBit is a DIY 8-bit handheld game console kit
- Students write JavaScript in "GyanBit Studio" IDE (browser-based)
- Games run on a 128×64 OLED simulator in the browser
- Flash converts JS to MicroPython and sends to hardware via USB-C WebSerial
- RP2040 MCU (dual-core ARM Cortex-M0+ at 133MHz)
- Display: 1.3" SH1106 OLED (128×64), Input: D-Pad + A, B, START
- Audio: Piezo buzzer, Power: USB-C or LiPo, Cost: ~₹970

bit.* API REFERENCE:
- bit.clear() — Clears the 128×64 screen
- bit.fill(x, y, w, h) — Filled rectangle
- bit.rect(x, y, w, h) — Outline rectangle
- bit.circle(cx, cy, r) — Outline circle
- bit.fillCircle(cx, cy, r) — Filled circle
- bit.line(x1, y1, x2, y2) — Line between two points
- bit.pixel(x, y) — Set single pixel
- bit.text(x, y, string) — Pixel text
- bit.isHeld('button') — true if held. Buttons: up/down/left/right/a/b/start
- bit.isPressed('button') — true only on first press frame
- bit.loop(fn) — Main game loop (~30fps)
- bit.beep(freq, ms) — Square-wave beep
- bit.frame — Current frame count

RULES:
1. ONLY answer about GyanBit, coding, JavaScript, games, hardware
2. If off-topic, redirect politely to coding
3. NEVER share API keys or personal data
4. Keep code examples short and using bit.* API`;

  // ── Provider ──
  function getProvider() {
    try { return localStorage.getItem(PROVIDER_STORAGE) || 'groq'; }
    catch { return 'groq'; }
  }

  function setProvider(p) {
    try { localStorage.setItem(PROVIDER_STORAGE, p); }
    catch { /* ignore */ }
  }

  // ── API Key ──
  function getApiKey() {
    try { return localStorage.getItem(KEY_STORAGE) || ''; }
    catch { return ''; }
  }

  function setApiKey(key) {
    try { localStorage.setItem(KEY_STORAGE, key); }
    catch { /* ignore */ }
  }

  // ── Persistence ──
  function loadMessages() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  function saveMessages() {
    try {
      const trimmed = messages.slice(-MAX_HISTORY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch { /* quota exceeded */ }
  }

  // ── Stop event propagation on chatbot inputs ─────────
  function trapEvents(el) {
    ['keydown', 'keyup', 'keypress'].forEach((evt) => {
      el.addEventListener(evt, (e) => e.stopPropagation());
    });
  }

  // ── DOM Creation ─────────────────────────────────────
  function createWidget() {
    const fab = document.createElement('button');
    fab.id = 'byte-bot-fab';
    fab.className = 'chatbot-fab';
    fab.setAttribute('aria-label', 'Open BYTE Bot chat');
    fab.innerHTML = `<span class="chatbot-fab-icon">🤖</span><span class="chatbot-fab-pulse"></span>`;
    fab.addEventListener('click', toggleChat);

    const panel = document.createElement('div');
    panel.id = 'byte-bot-panel';
    panel.className = 'chatbot-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'BYTE Bot Chat');

    const currentProvider = getProvider();
    const providerConfig = PROVIDERS[currentProvider];

    panel.innerHTML = `
      <div class="chatbot-header">
        <span class="chatbot-header-icon">🤖</span>
        <div class="chatbot-header-text">
          <strong>BYTE Bot</strong>
          <small>Your Coding Buddy</small>
        </div>
        <button class="chatbot-settings-btn" aria-label="Settings" id="byte-bot-settings-btn" title="API Key Settings">⚙️</button>
        <button class="chatbot-close" aria-label="Close chat" id="byte-bot-close">✕</button>
      </div>
      <div class="chatbot-settings" id="byte-bot-settings" style="display:none;">
        <div class="chatbot-settings-inner">
          <label class="chatbot-settings-label">🧠 AI Provider</label>
          <select id="byte-bot-provider" class="chatbot-input chatbot-select">
            <option value="groq" ${currentProvider === 'groq' ? 'selected' : ''}>Groq (Free & Fast — Recommended)</option>
            <option value="gemini" ${currentProvider === 'gemini' ? 'selected' : ''}>Google Gemini</option>
          </select>
          <label class="chatbot-settings-label">🔑 API Key</label>
          <p class="chatbot-settings-hint" id="byte-bot-key-hint">
            Get a free key from <a href="${providerConfig.getKey}" target="_blank" rel="noopener" id="byte-bot-key-link">${currentProvider === 'groq' ? 'Groq Console' : 'Google AI Studio'}</a>
          </p>
          <div class="chatbot-settings-row">
            <input type="password" id="byte-bot-apikey" class="chatbot-input chatbot-apikey-input"
                   placeholder="${providerConfig.placeholder}"
                   autocomplete="off" />
            <button id="byte-bot-save-key" class="chatbot-send chatbot-save-key">💾</button>
          </div>
          <button id="byte-bot-clear-chat" class="chatbot-clear-btn">🗑️ Clear Chat History</button>
        </div>
      </div>
      <div class="chatbot-messages" id="byte-bot-messages"></div>
      <div class="chatbot-input-row">
        <input type="text" id="byte-bot-input" class="chatbot-input"
               placeholder="Ask about the bit.* API..."
               maxlength="500"
               autocomplete="off" />
        <button id="byte-bot-send" class="chatbot-send" aria-label="Send message">▶</button>
      </div>
    `;

    // Stop panel keyboard events from reaching the IDE
    panel.addEventListener('keydown', (e) => e.stopPropagation());
    panel.addEventListener('keyup', (e) => e.stopPropagation());
    panel.addEventListener('keypress', (e) => e.stopPropagation());

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    // Trap events on inputs
    const chatInput = document.getElementById('byte-bot-input');
    const apiKeyInput = document.getElementById('byte-bot-apikey');
    trapEvents(chatInput);
    trapEvents(apiKeyInput);

    // Pre-fill saved key
    const savedKey = getApiKey();
    if (savedKey) apiKeyInput.value = savedKey;

    // ── Events ──
    document.getElementById('byte-bot-close').addEventListener('click', toggleChat);
    document.getElementById('byte-bot-send').addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Settings toggle
    document.getElementById('byte-bot-settings-btn').addEventListener('click', toggleSettings);

    // Provider change
    document.getElementById('byte-bot-provider').addEventListener('change', (e) => {
      const prov = e.target.value;
      setProvider(prov);
      const config = PROVIDERS[prov];
      document.getElementById('byte-bot-key-link').href = config.getKey;
      document.getElementById('byte-bot-key-link').textContent = prov === 'groq' ? 'Groq Console' : 'Google AI Studio';
      document.getElementById('byte-bot-apikey').placeholder = config.placeholder;
      // Clear key when switching
      document.getElementById('byte-bot-apikey').value = '';
      setApiKey('');
      showToast(`Switched to ${config.name}! Paste your new key.`);
    });

    // Save API key
    document.getElementById('byte-bot-save-key').addEventListener('click', () => {
      const key = document.getElementById('byte-bot-apikey').value.trim();
      setApiKey(key);
      showToast(key ? 'API key saved! 🔑 Try chatting now!' : 'API key cleared.');
      toggleSettings();
    });

    // Clear chat
    document.getElementById('byte-bot-clear-chat').addEventListener('click', () => {
      messages = [];
      saveMessages();
      messages.push({
        role: 'bot',
        text: "Chat cleared! 🧹 I'm BYTE 🤖 — ready to help you code! What would you like to build? 🎮",
      });
      saveMessages();
      renderMessages();
      showToast('Chat history cleared! 🧹');
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) toggleChat();
    });

    renderMessages();

    // Auto-greet
    if (messages.length === 0) {
      messages.push({
        role: 'bot',
        text: "Hi! I'm BYTE 🤖 Your GyanBit coding buddy!\n\nAsk me anything about:\n• The bit.* API\n• Making games\n• Hardware setup\n• Debugging your code\n\n⚙️ Tip: Click the gear icon to set up your free API key!\n\nWhat would you like to build today? 🎮",
      });
      saveMessages();
      renderMessages();
    }

    initDraggable(panel);
  }

  // ── Draggable logic ──────────────────────────────
  function initDraggable(panel) {
    const header = panel.querySelector('.chatbot-header');
    let isDragging = false;
    let offsetX, offsetY;

    header.addEventListener('mousedown', (e) => {
      // Don't drag if clicking buttons
      if (e.target.closest('button')) return;
      
      isDragging = true;
      panel.classList.add('chatbot-panel--dragging');
      
      const rect = panel.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      
      header.style.cursor = 'grabbing';
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      let x = e.clientX - offsetX;
      let y = e.clientY - offsetY;

      // Keep within bounds
      const padding = 10;
      x = Math.max(padding, Math.min(x, window.innerWidth - panel.offsetWidth - padding));
      y = Math.max(padding, Math.min(y, window.innerHeight - panel.offsetHeight - padding));

      panel.style.right = 'auto'; // Disable default right positioning
      panel.style.left = `${x}px`;
      panel.style.top = `${y}px`;
      panel.style.bottom = 'auto';
    });

    document.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      panel.classList.remove('chatbot-panel--dragging');
      header.style.cursor = 'grab';
    });

    // Mobile touch support
    header.addEventListener('touchstart', (e) => {
      if (e.target.closest('button')) return;
      isDragging = true;
      panel.classList.add('chatbot-panel--dragging');
      const touch = e.touches[0];
      const rect = panel.getBoundingClientRect();
      offsetX = touch.clientX - rect.left;
      offsetY = touch.clientY - rect.top;
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      let x = touch.clientX - offsetX;
      let y = touch.clientY - offsetY;
      const padding = 5;
      x = Math.max(padding, Math.min(x, window.innerWidth - panel.offsetWidth - padding));
      y = Math.max(padding, Math.min(y, window.innerHeight - panel.offsetHeight - padding));
      panel.style.right = 'auto';
      panel.style.left = `${x}px`;
      panel.style.top = `${y}px`;
      panel.style.bottom = 'auto';
      e.preventDefault();
    }, { passive: false });

    document.addEventListener('touchend', () => {
      isDragging = false;
      panel.classList.remove('chatbot-panel--dragging');
    });
  }

  // ── Toast ────────────────────────────────────────────
  function showToast(text) {
    const existing = document.getElementById('byte-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'byte-toast';
    toast.className = 'chatbot-toast';
    toast.textContent = text;
    document.getElementById('byte-bot-panel').appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }

  // ── Toggle ───────────────────────────────────────────
  function toggleChat() {
    isOpen = !isOpen;
    const panel = document.getElementById('byte-bot-panel');
    const fab = document.getElementById('byte-bot-fab');
    if (isOpen) {
      panel.classList.add('chatbot-panel--open');
      fab.classList.add('chatbot-fab--hidden');
      if (settingsOpen) toggleSettings();
      setTimeout(() => document.getElementById('byte-bot-input').focus(), 300);
      scrollToBottom();
    } else {
      panel.classList.remove('chatbot-panel--open');
      fab.classList.remove('chatbot-fab--hidden');
    }
  }

  function toggleSettings() {
    settingsOpen = !settingsOpen;
    document.getElementById('byte-bot-settings').style.display = settingsOpen ? 'block' : 'none';
  }

  // ── Render Messages ──────────────────────────────────
  function renderMessages() {
    const container = document.getElementById('byte-bot-messages');
    if (!container) return;
    container.innerHTML = messages
      .map((msg) => {
        const cls = msg.role === 'user' ? 'chatbot-msg--user' : 'chatbot-msg--bot';
        const label = msg.role === 'user' ? 'You' : '🤖 BYTE';
        const safeText = escapeHtml(msg.text).replace(/\n/g, '<br>');
        const formatted = safeText.replace(/`([^`]+)`/g, '<code>$1</code>');
        return `<div class="chatbot-msg ${cls}">
          <div class="chatbot-msg-label">${label}</div>
          <div class="chatbot-msg-body">${formatted}</div>
        </div>`;
      })
      .join('');
    scrollToBottom();
  }

  function scrollToBottom() {
    const c = document.getElementById('byte-bot-messages');
    if (c) requestAnimationFrame(() => { c.scrollTop = c.scrollHeight; });
  }

  function escapeHtml(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
  }

  // ── Typing indicator ────────────────────────────────
  function showTyping() {
    const container = document.getElementById('byte-bot-messages');
    if (!container) return;
    const dot = document.createElement('div');
    dot.className = 'chatbot-msg chatbot-msg--bot chatbot-typing';
    dot.id = 'byte-typing';
    dot.innerHTML = `<div class="chatbot-msg-label">🤖 BYTE</div>
      <div class="chatbot-msg-body chatbot-dots"><span></span><span></span><span></span></div>`;
    container.appendChild(dot);
    scrollToBottom();
  }

  function hideTyping() {
    const el = document.getElementById('byte-typing');
    if (el) el.remove();
  }

  // ── Call Groq API (OpenAI-compatible) ────────────────
  async function callGroq(text, history) {
    const apiKey = getApiKey();
    if (!apiKey) {
      return { ok: false, error: 'No API key! ⚙️ Click the gear icon → Get a free key from Groq Console → Paste & Save!' };
    }

    const chatMessages = [{ role: 'system', content: SYSTEM_PROMPT }];
    for (const turn of history) {
      chatMessages.push({
        role: turn.role === 'user' ? 'user' : 'assistant',
        content: turn.text.slice(0, 500),
      });
    }
    chatMessages.push({ role: 'user', content: text });

    const res = await fetch(PROVIDERS.groq.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: PROVIDERS.groq.model,
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 512,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[BYTE Bot] Groq Error:', res.status, errText);
      if (res.status === 401) {
        return { ok: false, error: 'Invalid API key! ⚙️ Check your Groq key in Settings.' };
      }
      if (res.status === 429) {
        return { ok: false, error: 'Rate limited ⏳ Wait a moment and try again.' };
      }
      try {
        const errObj = JSON.parse(errText);
        return { ok: false, error: `Error: ${errObj?.error?.message || errText.slice(0, 150)}` };
      } catch {
        return { ok: false, error: `Error (${res.status}): ${errText.slice(0, 150)}` };
      }
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content
      || "Hmm, BYTE is thinking too hard 🤔 Try again!";
    return { ok: true, reply };
  }

  // ── Call Gemini API ──────────────────────────────────
  async function callGemini(text, history) {
    const apiKey = getApiKey();
    if (!apiKey) {
      return { ok: false, error: 'No API key! ⚙️ Click the gear icon to add your Gemini API key.' };
    }

    const contents = [];
    for (const turn of history) {
      contents.push({
        role: turn.role === 'user' ? 'user' : 'model',
        parts: [{ text: turn.text.slice(0, 500) }],
      });
    }
    contents.push({ role: 'user', parts: [{ text }] });

    const url = `${PROVIDERS.gemini.url}${PROVIDERS.gemini.model}:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[BYTE Bot] Gemini Error:', res.status, errText);
      try {
        const errObj = JSON.parse(errText);
        return { ok: false, error: `Gemini error: ${errObj?.error?.message?.slice(0, 150) || errText.slice(0, 150)}` };
      } catch {
        return { ok: false, error: `Gemini error (${res.status}): ${errText.slice(0, 150)}` };
      }
    }

    const data = await res.json();
    if (data?.candidates?.[0]?.finishReason === 'SAFETY') {
      return { ok: true, reply: "Let's focus on GyanBit coding! 🎮 Try asking about the bit.* API." };
    }
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text
      || "Hmm, BYTE is thinking too hard 🤔 Try again!";
    return { ok: true, reply };
  }

  // ── Send Message ─────────────────────────────────────
  async function sendMessage() {
    if (isLoading) return;
    const input = document.getElementById('byte-bot-input');
    const text = input.value.trim();
    if (!text) return;

    messages.push({ role: 'user', text });
    saveMessages();
    renderMessages();
    input.value = '';
    input.focus();

    const history = messages
      .filter((m) => m.role === 'user' || m.role === 'bot')
      .slice(-10)
      .map((m) => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text }));
    history.pop();

    isLoading = true;
    showTyping();

    const provider = getProvider();
    const apiKey = getApiKey();

    try {
      let result;
      if (apiKey) {
        result = provider === 'groq'
          ? await callGroq(text, history)
          : await callGemini(text, history);
      } else {
        result = {
          ok: false,
          error: 'No API key set! ⚙️ Click the gear icon → pick a provider → paste your free key → 💾 Save!',
        };
      }
      hideTyping();
      messages.push({ role: 'bot', text: result.ok ? result.reply : result.error });
    } catch (err) {
      hideTyping();
      console.error('[BYTE Bot]', err);
      messages.push({
        role: 'bot',
        text: "Can't reach the AI service 📡 Check your internet and try again!",
      });
    }

    isLoading = false;
    saveMessages();
    renderMessages();
  }

  // ── Init ─────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget, { once: true });
  } else {
    createWidget();
  }
})();
