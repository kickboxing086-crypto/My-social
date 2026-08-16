const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /const \[view, setView\] = useState\<'login' \| 'register' \| 'chat' \| 'admin'\>\('login'\);/,
  `const [view, setView] = useState<'login' | 'register' | 'chat' | 'admin' | 'dev_analytics'>('login');`
);

code = code.replace(
  /const handleLogin = async \(e: React\.FormEvent\) => \{\n\s*e\.preventDefault\(\);\n\s*try \{/,
  `const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUsername === 'Ssilva_7' && loginPassword === '072131') {
      setCurrentUser({
        username: 'Ssilva_7',
        name: 'Dev Analytics Admin',
        role: 'Monitor',
        shortId: 'DEV-000',
        isBanned: false
      });
      setView('dev_analytics');
      showAlert('Dashboard Analítico Ativado. Acesso exclusivo de visualização do sistema.', 'SISTEMA DE MONITORAMENTO', 'success');
      return;
    }
    
    try {`
);

fs.writeFileSync('src/App.tsx', code);
