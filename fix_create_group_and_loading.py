import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update Loading Animation Screen
old_loading = """  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center font-mono">
        <div className="text-emerald-500 animate-pulse flex flex-col items-center">
          <Globe className="w-8 h-8 mb-4" />
          <span>INICIALIZANDO CONEXÃƒO SEGURA...</span>
        </div>
      </div>
    );
  }"""

new_loading = """  if (isLoading) {
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

if old_loading in text:
    text = text.replace(old_loading, new_loading)
    print("1. Updated loading screen animation to 'CONECTANDO...'!")

# 2. Add {renderGroupModals()} to the bottom of CHAT VIEW
old_chat_modals_end = """      {renderAlertModal()}
      {renderMembersModal()}"""

new_chat_modals_end = """      {renderAlertModal()}
      {renderGroupModals()}
      {renderMembersModal()}"""

if old_chat_modals_end in text:
    text = text.replace(old_chat_modals_end, new_chat_modals_end)
    print("2. Added {renderGroupModals()} to Chat View modals list!")

# 3. Clean up Mojibake in renderGroupModals
text = text.replace('DESCRIÃ‡ÃƒO', 'DESCRIÇÃO')
text = text.replace('CÃ“DIGO DE CONVITE', 'CÓDIGO DE CONVITE')
text = text.replace('CÃ³digo', 'Código')

# 4. Enhance handleCreateGroup logic
old_handle_create = """  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !currentUser) return;

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
      showAlert('Grupo criado com sucesso! Compartilhe o link de convite.', 'GRUPO CRIADO', 'success');
    } catch (e) {
      showAlert('Erro ao criar grupo.', 'ERRO', 'error');
    }
  };"""

new_handle_create = """  const handleCreateGroup = async (e: React.FormEvent) => {
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
  };"""

if old_handle_create in text:
    text = text.replace(old_handle_create, new_handle_create)
    print("3. Updated handleCreateGroup with better error handling!")

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Finished applying all fixes!")
