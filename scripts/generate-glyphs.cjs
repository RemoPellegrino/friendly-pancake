const fs = require('node:fs');
const opentype = require('opentype.js');
const font = opentype.parse(fs.readFileSync('node_modules/@vexflow-fonts/bravura/bravura.otf').buffer);
const codes = { treble: 0xe050, bass: 0xe062, restWhole: 0xe4e3, restHalf: 0xe4e4, restQuarter: 0xe4e5, restEighth: 0xe4e6 };
const paths = Object.fromEntries(Object.entries(codes).map(([name, code]) => [name, font.charToGlyph(String.fromCodePoint(code)).getPath(0, 0, 72).toPathData(3)]));
fs.writeFileSync('src/glyphs.ts', '// Generated from Bravura (SIL OFL). Run node scripts/generate-glyphs.cjs.\nexport const glyphs = ' + JSON.stringify(paths, null, 2) + ' as const;\n');

