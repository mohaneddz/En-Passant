/**
 * copy-assets.cjs
 * Copies brand / background / font files from the Olympole project into this
 * project's public/ folder so the app has all the real visual assets.
 *
 * Run automatically via the "predev" / "prebuild" npm lifecycle hooks.
 */

const fs   = require('fs');
const path = require('path');

// ── Absolute source (Olympole) ──────────────────────────────────────────────
const OLYMPOLE = path.resolve(
  __dirname,
  '..', '..', '..', '..', 'Projects', 'olympole', 'public'
);

// ── Absolute destination (this project) ────────────────────────────────────
const HERE = path.resolve(__dirname, '..', 'public');

// ── What to copy: [srcSubDir, dstSubDir] ───────────────────────────────────
const PAIRS = [
  ['images/brand',       'images/brand'],
  ['images/backgrounds', 'images/backgrounds'],
  ['fonts',              'fonts'],
];

// ── Helpers ─────────────────────────────────────────────────────────────────
function copyDir(srcDir, dstDir) {
  if (!fs.existsSync(srcDir)) {
    console.warn(`  [skip] source not found: ${srcDir}`);
    return;
  }
  fs.mkdirSync(dstDir, { recursive: true });
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile()) continue;           // skip sub-directories
    const src = path.join(srcDir, entry.name);
    const dst = path.join(dstDir, entry.name);
    fs.copyFileSync(src, dst);
    console.log(`  ✓  ${entry.name}`);
  }
}

// ── Main ────────────────────────────────────────────────────────────────────
console.log('\n🎨  Copying Olympole assets →', HERE);
console.log('   Source:', OLYMPOLE, '\n');

for (const [from, to] of PAIRS) {
  const srcDir = path.join(OLYMPOLE, from.replace(/\//g, path.sep));
  const dstDir = path.join(HERE,     to.replace(/\//g, path.sep));
  console.log(`📁  ${from}`);
  copyDir(srcDir, dstDir);
}

console.log('\n✅  Done.\n');
