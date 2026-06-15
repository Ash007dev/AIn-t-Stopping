const fs = require('fs');
const path = require('path');

const dirs = ['app', 'components'];

const replacements = [
  // Backgrounds
  { from: /bg-white/g, to: 'bg-[#1A1A1A]' },
  { from: /bg-\[#F0F2F2\]/g, to: 'bg-bg-primary' },
  { from: /bg-\[#F7F7F7\]/g, to: 'bg-[#161616]' },

  // Borders
  { from: /border-\[#D5D9D9\]/g, to: 'border-[#2A2A2A]' },
  { from: /border-\[#FF9900\]/g, to: 'border-[#E8170A]' },

  // Text colors
  { from: /text-\[#0F1111\]/g, to: 'text-white' },
  { from: /text-\[#565959\]/g, to: 'text-[#A0A0A0]' },
  { from: /text-\[#8C9296\]/g, to: 'text-[#666666]' },
  { from: /text-\[#FF9900\]/g, to: 'text-[#E8170A]' },
  { from: /text-\[#007185\]/g, to: 'text-[#E8170A]' },
  { from: /text-\[#CC0C39\]/g, to: 'text-[#E8170A]' },

  // Buttons & Highlights (Amazon Orange / Yellow to Premium Red)
  { from: /bg-\[#FF9900\]/g, to: 'bg-[#E8170A]' },
  { from: /hover:bg-\[#E47911\]/g, to: 'hover:bg-[#CC1408]' },
  { from: /bg-\[#FFD814\]/g, to: 'bg-[#E8170A]' },
  { from: /hover:bg-\[#F7CA00\]/g, to: 'hover:bg-[#CC1408]' },
  { from: /hover:border-\[#FF9900\]/g, to: 'hover:border-[#E8170A]' },
  { from: /ring-\[#FF9900\]/g, to: 'ring-[#E8170A]' },
  { from: /bg-\[#FFD100\]/g, to: 'bg-[#1A1A1A]' }, // ETA badge
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Skip the files we already carefully manually migrated so we don't double replace
      if (fullPath.includes('app\\page.tsx') || fullPath.includes('app/page.tsx')) continue;
      if (fullPath.includes('app\\cart\\page.tsx') || fullPath.includes('app/cart/page.tsx')) continue;
      if (fullPath.includes('components\\Navbar.tsx') || fullPath.includes('components/Navbar.tsx')) continue;
      if (fullPath.includes('components\\ProductCard.tsx') || fullPath.includes('components/ProductCard.tsx')) continue;

      for (const r of replacements) {
        if (content.match(r.from)) {
          content = content.replace(r.from, r.to);
          changed = true;
        }
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated: ' + fullPath);
      }
    }
  }
}

for (const dir of dirs) {
  processDirectory(path.join(__dirname, dir));
}
console.log("Done applying theme across all files.");
