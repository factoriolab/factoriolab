const fs = require('fs');
const path = require('path');

function usage() {
  console.log('Usage: node validate-output.js path/to/data.json');
  process.exit(1);
}

// Parse CLI args
const argv = process.argv.slice(2);
if (argv.length < 1 || argv[0] === '--help' || argv[0] === '-h') {
  usage();
}
let dataPath = argv[0];

dataPath = path.resolve(process.cwd(), dataPath);
if (!fs.existsSync(dataPath)) {
  console.error(`Error: data file not found at ${dataPath}`);
  process.exit(1);
}

let d;
try {
  d = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
} catch (err) {
  console.error(`Error parsing JSON at ${dataPath}: ${(err && err.message) || err}`);
  process.exit(1);
}

console.log(`Validating data file: ${dataPath}`);

const items = new Set((d.items || []).map((i) => i.id));
const icons = new Set((d.icons || []).map((i) => i.id));
let ok = true;
let missingCount = 0;

for (const r of d.recipes || []) {
  for (const k of Object.keys(r.in || {})) {
    if (!items.has(k)) {
      console.log('Missing input item', r.id, k);
      ok = false;
      missingCount++;
    }
  }
  for (const k of Object.keys(r.out || {})) {
    if (!items.has(k)) {
      console.log('Missing output item', r.id, k);
      ok = false;
      missingCount++;
    }
  }
}
for (const it of d.items || []) {
  if (!icons.has(it.icon)) {
    console.log('Missing icon for item', it.id, it.icon);
    ok = false;
    missingCount++;
  }
  if (it.icon === 'missing-icon') {
    console.log('Item uses fallback missing-icon:', it.id);
    ok = false;
    missingCount++;
  }
}

if (ok) {
  console.log('All references OK');
  process.exit(0);
} else {
  console.error(`Validation failed: ${missingCount} issues found`);
  process.exit(2);
}
