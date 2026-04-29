import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';

const src = 'D:/Programming/Web/Projects/olympole/public';
const dest = 'D:/Programming/Web/School/Clubs/En Passant/public';

const args = new Set(process.argv.slice(2));
const includeBackgrounds =
  args.has('--with-backgrounds') || process.env.COPY_BACKGROUNDS === '1';
const forceOverwrite =
  args.has('--force') || process.env.COPY_ASSETS_FORCE === '1';

const dirs = [
  ['images/brand', 'images/brand'],
  ['fonts', 'fonts'],
  ...(includeBackgrounds ? [['images/backgrounds', 'images/backgrounds']] : []),
];

for (const [from, to] of dirs) {
  const srcPath = join(src, from);
  const destPath = join(dest, to);
  mkdirSync(destPath, { recursive: true });

  for (const entry of readdirSync(srcPath, { withFileTypes: true })) {
    if (!entry.isFile()) continue;

    const fromFile = join(srcPath, entry.name);
    const toFile = join(destPath, entry.name);

    if (!forceOverwrite && existsSync(toFile)) {
      console.log(`Skipped existing: ${to}/${entry.name}`);
      continue;
    }

    copyFileSync(fromFile, toFile);
    console.log(`Copied: ${from}/${entry.name} -> ${to}/${entry.name}`);
  }
}

console.log('DONE');
