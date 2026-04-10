const fs = require('fs');
const content = fs.readFileSync('d:/gyanbit/src/games/doom.js', 'utf8');
const code = content.slice(content.indexOf('`') + 1, content.lastIndexOf('`'));
try {
  new Function('bit', code);
  console.log('OK, syntax is perfectly fine');
} catch (e) {
  console.error('Error in code parsing:', e);
}
