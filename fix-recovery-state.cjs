const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const recoveryStates = `  const [recName, setRecName] = useState('');
  const [recUsername, setRecUsername] = useState('');
  const [recPassword, setRecPassword] = useState('');
  const [recContact, setRecContact] = useState('');
  const [recEmail, setRecEmail] = useState('');`;

code = code.replace(
  /const \[regPassword, setRegPassword\] = useState\(''\);/,
  "const [regPassword, setRegPassword] = useState('');\n" + recoveryStates
);

fs.writeFileSync('src/App.tsx', code);
