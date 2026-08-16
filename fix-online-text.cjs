const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<span className="w-1\.5 h-1\.5 rounded-full bg-emerald-500 animate-pulse"><\/span>\n\s*ONLINE/g,
  '<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>\n                  {onlineUsersCount} ONLINE'
);

fs.writeFileSync('src/App.tsx', code);
