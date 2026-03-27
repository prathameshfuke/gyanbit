const fs = require('fs');

const files = ['index.html', 'about.html', 'docs.html', 'games.html', 'hardware.html'];

const inlineScript = `
  <script data-loader="injected">
    (function() {
      const loader = document.getElementById('retro-loader');
      if (loader) {
        let isHidden = false;
        const hideLoader = () => {
          if (isHidden) return;
          isHidden = true;
          loader.style.opacity = '0';
          setTimeout(() => loader.remove(), 800);
        };
        setTimeout(hideLoader, 500); // Wait 0.5s strictly then destroy
      }
    })();
  </script>`;

// Inject into all HTML files right below the retro-loader div
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (!content.includes('data-loader="injected"')) {
    // Replace the specific closing tag of the loader with itself + the script
    content = content.replace(/(<div id="retro-loader"[\s\S]*?<\/div>)/, '$1\n' + inlineScript);
    fs.writeFileSync(f, content);
    console.log(`Patched ${f}`);
  }
});

// Remove the old loader logic from script.js
let scriptJs = fs.readFileSync('script.js', 'utf8');
const oldLength = scriptJs.length;
scriptJs = scriptJs.replace(/\/\/ ── Retro Loader ──[\s\S]*?^$/m, '');
if (scriptJs.length < oldLength) {
  fs.writeFileSync('script.js', scriptJs);
  console.log('Removed old logic from script.js');
}
