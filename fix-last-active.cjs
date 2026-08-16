const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const effect = `  useEffect(() => {
    if (!currentUser || currentUser.username === 'Ssilva_7') return;
    
    const updateActive = async () => {
      try {
        if (currentUser.uid) {
          await updateDoc(doc(db, 'users', currentUser.uid), { lastActive: serverTimestamp() });
        }
      } catch (err) {}
    };
    
    updateActive(); // immediate
    const interval = setInterval(updateActive, 60000); // every minute
    return () => clearInterval(interval);
  }, [currentUser]);`;

code = code.replace(/  \/\/ Listener for all registered group members\n  useEffect\(\(\) => \{/, effect + '\n\n  // Listener for all registered group members\n  useEffect(() => {');

fs.writeFileSync('src/App.tsx', code);
