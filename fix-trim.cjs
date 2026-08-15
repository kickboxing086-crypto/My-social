const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
  /deleteGroupConfirmationText\.toLowerCase\(\) !== 'apagar'/g,
  /deleteGroupConfirmationText.trim().toLowerCase() !== 'apagar'/g.source.replace(/\\/g, '')
);
fs.writeFileSync('src/App.tsx', code);
