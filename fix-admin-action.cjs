const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /const handleAdminActionById = async \(actionType: 'ban' \| 'unban' \| 'makeAdmin' \| 'makeGeneralAdmin' \| 'removeAdmin', targetId: string\) => \{/g,
  `const handleAdminActionById = async (actionType: 'ban' | 'unban' | 'makeAdmin' | 'makeGeneralAdmin' | 'removeAdmin' | 'deleteAccount', targetId: string) => {`
);

fs.writeFileSync('src/App.tsx', code);
