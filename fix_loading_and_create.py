import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace loading screen
old_loading_pattern = r'if\s*\(isLoading\)\s*\{\s*return\s*\(\s*<div className="min-h-screen bg-zinc-950 flex items-center justify-center font-mono">\s*<div className="text-emerald-500 animate-pulse flex flex-col items-center">\s*<Globe className="w-8 h-8 mb-4" />\s*<span>INICIALIZANDO CONEXÃƒO SEGURA\.\.\.</span>\s*</div>\s*</div>\s*\);\s*\}'

new_loading_jsx = """if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] opacity-40 z-10"></div>
        <div className="relative z-20 flex flex-col items-center bg-zinc-950 border border-emerald-900/60 p-8 rounded-sm shadow-2xl max-w-sm w-full mx-4">
          <div className="relative mb-6">
            <Globe className="w-12 h-12 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full -z-10 animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
            <span className="text-emerald-400 font-bold text-base tracking-widest uppercase animate-pulse">
              CONECTANDO...
            </span>
          </div>
          <p className="text-emerald-700 text-xs font-mono text-center tracking-wider">
            MY SOCIAL • REDE MENSAGEIRA
          </p>
        </div>
      </div>
    );
  }"""

text = re.sub(old_loading_pattern, new_loading_jsx, text, flags=re.DOTALL)

# Replace handleCreateGroup
old_create_pattern = r'const handleCreateGroup = async \(e: React\.FormEvent\) => \{.*?\};\s*const handleJoinGroup'

new_create_fn = """const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      showAlert('Por favor, digite o nome do grupo.', 'CAMPO OBRIGATÓRIO', 'warning');
      return;
    }
    if (!currentUser) {
      showAlert('Você precisa estar conectado para criar um grupo.', 'ACESSO NEGADO', 'error');
      return;
    }

    const inviteCode = generateInviteCode();
    try {
      const docRef = await addDoc(collection(db, 'groups'), {
        name: newGroupName.trim(),
        description: newGroupDesc.trim(),
        inviteCode,
        createdBy: currentUser.username,
        owners: [currentUser.username],
        members: [currentUser.username],
        createdAt: serverTimestamp()
      });
      setShowCreateGroupModal(false);
      setNewGroupName('');
      setNewGroupDesc('');
      setCurrentGroupId(docRef.id);
      showAlert('Grupo criado com sucesso! Compartilhe o link de convite com seus amigos.', 'GRUPO CRIADO', 'success');
    } catch (err) {
      console.error('Erro ao criar grupo no Firestore:', err);
      showAlert('Erro ao criar grupo. Tente novamente.', 'ERRO', 'error');
    }
  };

  const handleJoinGroup"""

text = re.sub(old_create_pattern, new_create_fn, text, flags=re.DOTALL)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Applied loading screen and handleCreateGroup replacements!")
