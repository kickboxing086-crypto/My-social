const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /isBanned\?: boolean;/,
  'isBanned?: boolean;\n  lastActive?: any;'
);

fs.writeFileSync('src/App.tsx', code);
