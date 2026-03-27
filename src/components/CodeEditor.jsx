import React, { useRef, useEffect, useMemo } from 'react';

// Syntax highlight rules (regex → CSS color)
const RULES = [
  // Comments first
  { re: /(\/\/[^\n]*)/g, cls: 'tok-comment' },
  // Strings
  { re: /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, cls: 'tok-string' },
  // bit.* API calls
  { re: /\bbit\.\w+/g, cls: 'tok-api' },
  // Keywords
  { re: /\b(let|const|var|if|else|for|while|function|return|Math|new|true|false|null|undefined|of|in|break|continue|class|this|import|export|default)\b/g, cls: 'tok-keyword' },
  // Numbers
  { re: /\b(\d+\.?\d*)\b/g, cls: 'tok-number' },
];

function highlightCode(code) {
  // We mark regions so they don't overlap
  const chars = Array.from(code).map(c => ({ c, cls: '' }));

  for (const { re, cls } of RULES) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(code)) !== null) {
      for (let i = m.index; i < m.index + m[0].length; i++) {
        if (!chars[i].cls) chars[i].cls = cls;
      }
    }
  }

  // Group consecutive same-class chars into spans
  let html = '';
  let i = 0;
  while (i < chars.length) {
    const cls = chars[i].cls;
    let j = i;
    while (j < chars.length && chars[j].cls === cls) j++;
    const text = chars.slice(i, j).map(c => c.c).join('');
    const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    if (cls) {
      html += `<span class="${cls}">${escaped}</span>`;
    } else {
      html += escaped;
    }
    i = j;
  }
  return html;
}

export default function CodeEditor({ code, onChange }) {
  const textareaRef = useRef(null);
  const preRef      = useRef(null);
  const lineNumRef  = useRef(null);
  const syncScroll  = () => {
    if (preRef.current && textareaRef.current) {
      preRef.current.scrollTop  = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
    if (lineNumRef.current && textareaRef.current) {
      lineNumRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const highlighted = useMemo(() => highlightCode(code), [code]);
  const lineCount = (code.match(/\n/g) || []).length + 1;

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.target;
      const start = ta.selectionStart;
      const end   = ta.selectionEnd;
      const newVal = ta.value.slice(0, start) + '  ' + ta.value.slice(end);
      onChange(newVal);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  };

  return (
    <div className="editor-shell">
      {/* Line numbers */}
      <div className="line-numbers" ref={lineNumRef}>
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i} className="line-num">{i + 1}</div>
        ))}
      </div>

      {/* Highlight layer + transparent textarea */}
      <div className="editor-body">
        <pre
          ref={preRef}
          className="highlight-layer"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: highlighted + '\n' }}
        />
        <textarea
          ref={textareaRef}
          id="code-textarea"
          className="code-textarea"
          value={code}
          onChange={e => onChange(e.target.value)}
          onScroll={syncScroll}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>

      <style>{`
        .editor-shell {
          display: flex;
          flex: 1;
          overflow: hidden;
          background: var(--dark);
          font-family: var(--font-code);
          font-size: 13px;
          line-height: 1.6;
          position: relative;
        }
        .editor-shell::after {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            rgba(0,0,0,0.06) 0px,
            rgba(0,0,0,0.06) 1px,
            transparent 1px,
            transparent 3px
          );
          pointer-events: none;
          z-index: 1;
        }

        .line-numbers {
          width: 46px;
          flex-shrink: 0;
          overflow: hidden;
          background: #030306;
          border-right: 1px solid var(--border);
          padding: 10px 0;
          user-select: none;
        }
        .line-num {
          font-family: var(--font-code);
          font-size: 12px;
          color: var(--text-dim);
          text-align: right;
          padding: 0 8px;
          line-height: 1.6;
        }

        .editor-body {
          flex: 1;
          position: relative;
          overflow: hidden;
        }

        .highlight-layer,
        .code-textarea {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          padding: 10px 12px;
          margin: 0;
          border: none;
          outline: none;
          resize: none;
          font-family: var(--font-code);
          font-size: 13px;
          line-height: 1.6;
          tab-size: 2;
          white-space: pre;
          word-wrap: normal;
          overflow: auto;
        }

        .highlight-layer {
          background: transparent;
          color: #aaaaaa;
          pointer-events: none;
          user-select: none;
          z-index: 1;
        }

        .code-textarea {
          background: transparent;
          color: transparent;
          caret-color: var(--green);
          z-index: 2;
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }
        .code-textarea::selection {
          background: rgba(0, 255, 255, 0.15);
        }

        /* Syntax colors */
        .tok-keyword { color: var(--amber);   }
        .tok-string  { color: var(--cyan);    }
        .tok-number  { color: var(--magenta); }
        .tok-comment { color: #445544; font-style: italic; }
        .tok-api     { color: var(--green); font-weight: 600; }
      `}</style>
    </div>
  );
}
