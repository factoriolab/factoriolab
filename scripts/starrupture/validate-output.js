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

let ok = true;
let issueCount = 0;

// Build item set and counts for duplicate detection
const items = new Set();
const itemCounts = {};
for (const it of d.items || []) {
  if (!it || !it.id) continue;
  items.add(it.id);
  itemCounts[it.id] = (itemCounts[it.id] || 0) + 1;
}
const icons = new Set((d.icons || []).map((i) => i.id));

// Duplicate item IDs
for (const [id, count] of Object.entries(itemCounts)) {
  if (count > 1) {
    console.log('Duplicate item id', id, count);
    ok = false;
    issueCount++;
  }
}

// Duplicate recipe IDs
const recipeCounts = {};
for (const r of d.recipes || []) {
  if (!r || !r.id) continue;
  recipeCounts[r.id] = (recipeCounts[r.id] || 0) + 1;
}
for (const [id, count] of Object.entries(recipeCounts)) {
  if (count > 1) {
    console.log('Duplicate recipe id', id, count);
    ok = false;
    issueCount++;
  }
}

// Check that recipe producers reference valid item IDs
for (const r of d.recipes || []) {
  for (const p of r.producers || []) {
    if (!items.has(p)) {
      console.log('Missing producer item', r.id, p);
      ok = false;
      issueCount++;
    }
  }
}

// Check that recipe inputs and outputs reference valid item IDs
for (const r of d.recipes || []) {
  for (const k of Object.keys(r.in || {})) {
    if (!items.has(k)) {
      console.log('Missing input item', r.id, k);
      ok = false;
      issueCount++;
    }
  }
  for (const k of Object.keys(r.out || {})) {
    if (!items.has(k)) {
      console.log('Missing output item', r.id, k);
      ok = false;
      issueCount++;
    }
  }
}

// Check that items reference valid icon IDs
for (const it of d.items || []) {
  if (!icons.has(it.icon)) {
    console.log('Missing icon for item', it.id, it.icon);
    ok = false;
    issueCount++;
  }
  if (it.icon === 'missing-icon') {
    console.log('Item uses fallback missing-icon:', it.id);
    ok = false;
    issueCount++;
  }
}

// Check categories referenced by items/recipes are present
const presentCategories = new Set((d.categories || []).map((c) => c.id));
const usedCategories = new Set();
for (const it of d.items || []) if (it && it.category) usedCategories.add(it.category);
for (const r of d.recipes || []) if (r && r.category) usedCategories.add(r.category);

const missingCategories = Array.from(usedCategories).filter((c) => !presentCategories.has(c));
if (missingCategories.length > 0) {
  console.log('Missing categories referenced by items/recipes:');
  for (const mc of missingCategories) console.log('  -', mc);
  ok = false;
  issueCount += missingCategories.length;
}

if (ok) {
  console.log('All references OK');
  process.exit(0);
} else {
  console.error(`Validation failed: ${issueCount} issues found`);
  process.exit(2);
}
