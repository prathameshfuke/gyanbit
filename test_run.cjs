const fs = require('fs');
const content = fs.readFileSync('d:/gyanbit/src/games/doom.js', 'utf8');
const code = content.slice(content.indexOf('`') + 1, content.lastIndexOf('`'));

// Mock bit API
let screenOn = 0;
const bit = {
  clear: () => {},
  isHeld: () => false,
  fill: () => { screenOn++; },
  beep: () => {},
  onPress: () => {},
  loop: (fn) => {
    // Run the loop for a few frames
    for(let i=0; i<30; i++) {
        fn();
    }
  }
};

new Function('bit', code)(bit);

console.log('Pixels drawn:', screenOn);
