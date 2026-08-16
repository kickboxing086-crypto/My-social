const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /useState\<'login' \| 'register' \| 'chat' \| 'admin' \| 'dev_analytics'\>/,
  "useState<'login' | 'register' | 'chat' | 'admin' | 'dev_analytics' | 'recover_password'>"
);

fs.writeFileSync('src/App.tsx', code);
