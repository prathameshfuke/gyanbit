export default `
// @dos-folder: mario
// MARIO BROTHERS VGA — Retro Classic via JS-DOS
// ----------------------------------------------
// Loading the 1990 MS-DOS remake of Mario Bros.
// 
// Controls:
// - D-Pad (WASD/Arrows): Move Mario
// - A Button (K): Jump
// - B Button (L): Fire / Action
// - START (Enter): Start / Menu
//
// Just hit RUN in the top toolbar to play!

bit.clear();
bit.text(10, 20, "INITIALIZING MARIO...");
bit.text(10, 40, "STAND BY...");

bit.loop(() => {
  // Overlaid by JS-DOS Engine
});
`;
