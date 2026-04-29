const fs = require('fs');
const path = require('path');

const OLYMPOLE = path.resolve(
  __dirname,
  '..', '..', '..', '..', 'Projects', 'olympole', 'public'
);
const HERE = path.resolve(__dirname, '..', 'public');

const args = new Set(process.argv.slice(2));
const includeBackgrounds =
  args.has('--with-backgrounds') || process.env.COPY_BACKGROUNDS === '1';
const forceOverwrite =
  args.has('--force') || process.env.COPY_ASSETS_FORCE === '1';

const PAIRS = [
  ['images/brand', 'images/brand'],
  ['fonts', 'fonts'],
  ...(includeBackgrounds ? [['images/backgrounds', 'images/backgrounds']] : []),
];

function copyDir(srcDir, dstDir, options) {
  if (!fs.existsSync(srcDir)) {
    console.warn(`  [skip] source not found: ${srcDir}`);
    return;
  }

  fs.mkdirSync(dstDir, { recursive: true });
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile()) continue;

    const src = path.join(srcDir, entry.name);
    const dst = path.join(dstDir, entry.name);

    if (!options.forceOverwrite && fs.existsSync(dst)) {
      console.log(`  - skip existing ${entry.name}`);
      continue;
    }

    fs.copyFileSync(src, dst);
    console.log(`  + copied ${entry.name}`);
  }
}

console.log('\nAsset sync ?', HERE);
console.log('Source:', OLYMPOLE);
console.log('Mode:', forceOverwrite ? 'force overwrite' : 'safe (no overwrite)');
console.log(
  'Backgrounds:',
  includeBackgrounds ? 'included' : 'excluded (use --with-backgrounds to include)'
);

for (const [from, to] of PAIRS) {
  const srcDir = path.join(OLYMPOLE, from.replace(/\//g, path.sep));
  const dstDir = path.join(HERE, to.replace(/\//g, path.sep));
  console.log(`\n[${from}]`);
  copyDir(srcDir, dstDir, { forceOverwrite });
}

console.log('\nDone.\n');
