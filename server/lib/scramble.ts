export function generateScramble(length = 20) {
  const faces = ["U", "D", "L", "R", "F", "B"];
  const modifiers = ["", "'", "2"];
  const moves: string[] = [];
  let previousFace = "";

  for (let i = 0; i < length; i++) {
    let face = faces[Math.floor(Math.random() * faces.length)];
    while (face === previousFace) {
      face = faces[Math.floor(Math.random() * faces.length)];
    }
    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
    moves.push(face + modifier);
    previousFace = face;
  }

  return moves.join(" ");
}
