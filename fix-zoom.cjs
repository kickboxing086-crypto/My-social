const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

code = code.replace(/html\s*\{\s*zoom:\s*90%;\s*\}/g, '');
code = code.replace(/html\s*\{\s*zoom:\s*90%;\s*\}/g, '');

fs.writeFileSync('src/index.css', code);
