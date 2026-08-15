const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /import \{ Globe, Briefcase/g,
  `import { Globe, Briefcase, Lock, Unlock`
);

fs.writeFileSync('src/App.tsx', code);
