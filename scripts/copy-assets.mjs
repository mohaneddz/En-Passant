import { cpSync, mkdirSync } from 'fs';
import { join } from 'path';

const src = 'D:/Programming/Web/Projects/olympole/public';
const dest = 'D:/Programming/Web/School/Clubs/En Passant/public';

const dirs = [
  ['images/brand', 'images/brand'],
  ['images/backgrounds', 'images/backgrounds'],
  ['fonts', 'fonts'],
];

for (const [from, to] of dirs) {
  const srcPath = join(src, from);
  const destPath = join(dest, to);
  mkdirSync(destPath, { recursive: true });
  cpSync(srcPath, destPath, { recursive: true });
  console.log(`Copied ${from} -> ${to}`);
}

console.log('DONE');
