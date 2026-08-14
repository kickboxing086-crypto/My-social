const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const inviteCode = `
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invite = params.get('invite');
    if (invite && currentUser) {
      setJoinLinkInput(invite);
      setShowJoinGroupModal(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [currentUser]);
`;

code = code.replace('const handleSendMessage = async', inviteCode + '\n  const handleSendMessage = async');
fs.writeFileSync('src/App.tsx', code);
