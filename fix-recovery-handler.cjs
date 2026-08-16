const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const recoveryHandler = `  const handleRecoverPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'password_recovery_requests'), {
        name: recName,
        username: recUsername,
        desiredPassword: recPassword,
        contact: recContact,
        email: recEmail,
        createdAt: serverTimestamp(),
        status: 'pending'
      });
      showAlert('Sua solicitação foi recebida com sucesso. Em breve, entraremos em contato.', 'SOLICITAÇÃO RECEBIDA', 'success');
      setView('login');
      setRecName('');
      setRecUsername('');
      setRecPassword('');
      setRecContact('');
      setRecEmail('');
    } catch (err) {
      console.error(err);
      showAlert('Erro ao enviar solicitação.', 'ERRO', 'error');
    }
  };
`;

code = code.replace(
  /const handleRegister = async \(e: React\.FormEvent\) => \{/,
  recoveryHandler + '\n  const handleRegister = async (e: React.FormEvent) => {'
);

fs.writeFileSync('src/App.tsx', code);
