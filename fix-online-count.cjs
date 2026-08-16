const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const onlineCountLogic = `
  const onlineUsersCount = allMembers.filter(m => {
    if (!m.lastActive) return false;
    const lastActiveTime = m.lastActive.toDate ? m.lastActive.toDate().getTime() : new Date(m.lastActive).getTime();
    return (Date.now() - lastActiveTime) < 300000; // 5 minutes
  }).length;
`;

code = code.replace(/  const isGeneralAdmin = !!\(/, onlineCountLogic + '\n  const isGeneralAdmin = !!(');

fs.writeFileSync('src/App.tsx', code);
