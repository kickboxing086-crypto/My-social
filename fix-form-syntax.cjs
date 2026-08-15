const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /return \(\n\s*<form\n\s*\{\/\* View Once Toggle \*\/\}/,
  `return (
            <form onSubmit={handleSendMessage} className="flex items-end gap-1 sm:gap-2 relative">
            {/* View Once Toggle */}`
);

fs.writeFileSync('src/App.tsx', code);
