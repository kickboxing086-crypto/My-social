const fs = require('fs');
let base64Data = fs.readFileSync('src/assets/logo.ts', 'utf8').trim();

if (base64Data.startsWith('data:image/png;base64,')) {
  base64Data = base64Data.replace('data:image/png;base64,', '');
}

const buffer = Buffer.from(base64Data, 'base64');
fs.writeFileSync('public/logo.png', buffer);
fs.writeFileSync('public/icon-192.png', buffer);
fs.writeFileSync('public/icon-512.png', buffer);
console.log('Saved PNG files');
