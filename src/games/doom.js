export default `
// DOOM — The Ultimate Port via JS-DOS
// ------------------------------------
// This script hooks into the GyanBit runtime to load a locally hosted
// version of the JS-DOS implementation of The Ultimate Doom!
// 
// Just hit RUN in the top toolbar to spawn the DOS layer. Enjoy!

bit.clear();
bit.text(10, 20, "INITIALIZING JS-DOS...");
bit.text(10, 40, "PLEASE STAND BY");

bit.loop(() => {
  // The React wrapper will detect this specific file is running
  // and natively overlay the JS-DOS DOOM iframe over the controls.
});
`;