const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const modalStates = `
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [joinLinkInput, setJoinLinkInput] = useState('');
`;
code = code.replace('const [showJoinGroupModal, setShowJoinGroupModal] = useState(false);', 'const [showJoinGroupModal, setShowJoinGroupModal] = useState(false);\n' + modalStates);

const groupFunctions = `
  const generateInviteCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
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
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinLinkInput.trim() || !currentUser) return;
    
    // Extract code from link or just use code
    let code = joinLinkInput.trim();
    if (code.includes('invite=')) {
      code = code.split('invite=')[1];
    }

    try {
      const q = query(collection(db, 'groups'), where('inviteCode', '==', code));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        showAlert('Link de convite inválido ou grupo não encontrado.', 'ERRO', 'error');
        return;
      }
      
      const groupDoc = querySnapshot.docs[0];
      const groupData = groupDoc.data() as Group;
      
      if (groupData.members.includes(currentUser.username)) {
        showAlert('Você já é membro deste grupo.', 'AVISO', 'warning');
        setShowJoinGroupModal(false);
        setCurrentGroupId(groupDoc.id);
        return;
      }
      
      await updateDoc(doc(db, 'groups', groupDoc.id), {
        members: [...groupData.members, currentUser.username]
      });
      
      setShowJoinGroupModal(false);
      setJoinLinkInput('');
      setCurrentGroupId(groupDoc.id);
      showAlert('Você entrou no grupo com sucesso!', 'BEM-VINDO', 'success');
    } catch (e) {
      showAlert('Erro ao entrar no grupo.', 'ERRO', 'error');
    }
  };
`;
code = code.replace('const handleSendMessage = async (e: React.FormEvent) => {', groupFunctions + '\n  const handleSendMessage = async (e: React.FormEvent) => {');

const groupModals = `
  const renderGroupModals = () => {
    return (
      <AnimatePresence>
        {showCreateGroupModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-zinc-950 border border-emerald-900/50 p-6 rounded-sm w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2"><Users className="w-5 h-5" /> Criar Novo Grupo</h2>
                <button onClick={() => setShowCreateGroupModal(false)} className="text-emerald-700 hover:text-emerald-400"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-emerald-600 text-xs font-bold mb-2">NOME DO GRUPO</label>
                  <input type="text" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} className="w-full bg-black border border-emerald-900/50 p-3 text-emerald-400 focus:outline-none focus:border-emerald-500 rounded-sm" placeholder="Ex: Desenvolvedores Elite" required />
                </div>
                <div>
                  <label className="block text-emerald-600 text-xs font-bold mb-2">DESCRIÇÃO</label>
                  <input type="text" value={newGroupDesc} onChange={(e) => setNewGroupDesc(e.target.value)} className="w-full bg-black border border-emerald-900/50 p-3 text-emerald-400 focus:outline-none focus:border-emerald-500 rounded-sm" placeholder="Sobre o que é este grupo?" />
                </div>
                <button type="submit" className="w-full bg-emerald-900 hover:bg-emerald-800 text-emerald-100 p-3 rounded-sm font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Criar Grupo
                </button>
              </form>
            </motion.div>
          </div>
        )}
        
        {showJoinGroupModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-zinc-950 border border-emerald-900/50 p-6 rounded-sm w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2"><LinkIcon className="w-5 h-5" /> Entrar em um Grupo</h2>
                <button onClick={() => setShowJoinGroupModal(false)} className="text-emerald-700 hover:text-emerald-400"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleJoinGroup} className="space-y-4">
                <div>
                  <label className="block text-emerald-600 text-xs font-bold mb-2">LINK OU CÓDIGO DE CONVITE</label>
                  <input type="text" value={joinLinkInput} onChange={(e) => setJoinLinkInput(e.target.value)} className="w-full bg-black border border-emerald-900/50 p-3 text-emerald-400 focus:outline-none focus:border-emerald-500 rounded-sm" placeholder="Cole o link de convite aqui..." required />
                </div>
                <button type="submit" className="w-full bg-emerald-900 hover:bg-emerald-800 text-emerald-100 p-3 rounded-sm font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" /> Entrar
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {groupSettingsTarget && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-zinc-950 border border-emerald-900/50 p-6 rounded-sm w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2"><Users className="w-5 h-5" /> Gerenciar Grupo</h2>
                <button onClick={() => setGroupSettingsTarget(null)} className="text-emerald-700 hover:text-emerald-400"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-6">
                <div className="bg-black border border-emerald-900/40 p-4 rounded-sm">
                  <h3 className="text-emerald-600 text-xs font-bold mb-2">LINK DE CONVITE</h3>
                  <div className="flex items-center gap-2">
                    <input type="text" readOnly value={\`\${window.location.origin}?invite=\${groupSettingsTarget.inviteCode}\`} className="w-full bg-zinc-900 border border-emerald-900/50 p-2 text-emerald-300 text-xs focus:outline-none rounded-sm font-mono" />
                    <button onClick={() => { navigator.clipboard.writeText(\`\${window.location.origin}?invite=\${groupSettingsTarget.inviteCode}\`); showAlert('Link copiado!', 'SUCESSO', 'success'); }} className="bg-emerald-900 hover:bg-emerald-800 text-emerald-100 p-2 rounded-sm shrink-0" title="Copiar Link">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-emerald-600 text-xs font-bold mb-3 flex items-center justify-between">
                    MEMBROS ({groupSettingsTarget.members.length})
                  </h3>
                  <div className="max-h-[200px] overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-emerald-900 pr-2">
                    {groupSettingsTarget.members.map(memberUser => (
                      <div key={memberUser} className="bg-black border border-emerald-900/30 p-2 rounded-sm flex items-center justify-between">
                        <span className="text-emerald-300 text-sm font-bold flex items-center gap-1">
                          @{memberUser} {groupSettingsTarget.owners.includes(memberUser) && <Crown className="w-3 h-3 text-amber-400" title="Líder do Grupo" />}
                        </span>
                        {memberUser !== currentUser?.username && groupSettingsTarget.owners.includes(currentUser?.username || '') && (
                          <div className="flex gap-2">
                            <button 
                              onClick={async () => {
                                const isOwner = groupSettingsTarget.owners.includes(memberUser);
                                const newOwners = isOwner 
                                  ? groupSettingsTarget.owners.filter(o => o !== memberUser)
                                  : [...groupSettingsTarget.owners, memberUser];
                                await updateDoc(doc(db, 'groups', groupSettingsTarget.id), { owners: newOwners });
                                setGroupSettingsTarget({ ...groupSettingsTarget, owners: newOwners });
                              }}
                              className={\`text-[10px] px-2 py-1 rounded-sm border \${groupSettingsTarget.owners.includes(memberUser) ? 'bg-amber-950/40 border-amber-900/50 text-amber-400' : 'bg-emerald-950/40 border-emerald-900/50 text-emerald-400'}\`}
                            >
                              {groupSettingsTarget.owners.includes(memberUser) ? 'Remover Líder' : 'Tornar Líder'}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-emerald-900/30">
                  <button 
                    onClick={async () => {
                      if (confirm('Tem certeza que deseja sair do grupo?')) {
                        const newMembers = groupSettingsTarget.members.filter(m => m !== currentUser?.username);
                        await updateDoc(doc(db, 'groups', groupSettingsTarget.id), { members: newMembers });
                        setGroupSettingsTarget(null);
                        setCurrentGroupId(null);
                        showAlert('Você saiu do grupo.', 'SUCESSO', 'info');
                      }
                    }}
                    className="w-full bg-red-950 border border-red-900 text-red-400 p-3 rounded-sm font-bold text-xs uppercase hover:bg-red-900 transition-colors flex justify-center items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Sair do Grupo
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  };
`;
code = code.replace('{renderMembersModal()}', '{renderGroupModals()}\n        {renderMembersModal()}');

fs.writeFileSync('src/App.tsx', code);
