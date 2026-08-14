import re

with open('src/App.tsx', 'r', encoding='utf-8', errors='replace') as f:
    text = f.read()

# 1. Clean up corrupted byte symbols
text = text.replace('â\x80¢', '•')
text = text.replace('â€¢', '•')
text = text.replace('â\x9a\xfe\x0f', '⚠️')
text = text.replace('â\x9aï¸', '⚠️')
text = text.replace('âš ï¸', '⚠️')

# 2. Replace getTargetUserById with case-insensitive search
old_get_target = r'const getTargetUserById = \(id: string\) => \{.*?\};'
new_get_target = """const getTargetUserById = (id: string) => {
    if (!id) return undefined;
    const cleanId = id.trim().toLowerCase();
    return allMembers.find(m => 
      (m.id && m.id === id.trim()) ||
      (m.shortId && m.shortId.toLowerCase() === cleanId) ||
      (m.username && m.username.toLowerCase() === cleanId)
    );
  };"""

text = re.sub(old_get_target, new_get_target, text, flags=re.DOTALL)

# 3. Replace handleAdminActionById with robust implementation + optimistic state updates
old_handle_admin_action = r'const handleAdminActionById = async \(actionType: \'ban\' \| \'unban\' \| \'makeAdmin\' \| \'removeAdmin\', targetId: string\) => \{.*?\};\s*const handleBanUser'

new_handle_admin_action = """const handleAdminActionById = async (actionType: 'ban' | 'unban' | 'makeAdmin' | 'removeAdmin', targetId: string) => {
    if (!isAdmin || !targetId.trim()) {
      if (!targetId.trim()) {
        showAlert('Por favor, informe o ID ou nome de usuário.', 'CAMPO VAZIO', 'warning');
      }
      return;
    }

    const targetUser = getTargetUserById(targetId.trim());
    if (!targetUser) {
      showAlert('Usuário não encontrado com este ID ou nome de usuário.', 'ERRO DE BUSCA', 'warning');
      return;
    }

    // Protection for SuperAdmin account
    if (targetUser.username.toLowerCase() === 'samuellsilvva02') {
      showAlert('A conta do Administrador Supremo é inviolável.', 'AÇÃO NEGADA', 'warning');
      return;
    }

    const isTargetAdmin = targetUser.role?.toLowerCase() === 'admin' || targetUser.role?.toLowerCase() === 'administrador';

    // Allow admins to manage non-superadmin users
    if (isTargetAdmin && !isSuperAdmin && targetUser.username.toLowerCase() !== currentUser?.username?.toLowerCase()) {
      showAlert('Apenas o Administrador Supremo pode gerenciar outros administradores.', 'PERMISSÃO NEGADA', 'error');
      return;
    }

    try {
      // Find document ID directly from targetUser or query Firestore
      let docId = targetUser.id;
      if (!docId) {
        const q = query(collection(db, 'users'), where('username', '==', targetUser.username.toLowerCase()));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          showAlert('Usuário não encontrado na base de dados.', 'ERRO', 'error');
          return;
        }
        docId = querySnapshot.docs[0].id;
      }

      const userDocRef = doc(db, 'users', docId);

      if (actionType === 'ban') {
        if (targetUser.isBanned) {
          showAlert('Usuário já está banido.', 'AVISO', 'info');
          return;
        }
        setBanReasonTarget(targetUser);
        setBanReasonInput('');
        return; // Opens ban reason modal
      } else if (actionType === 'unban') {
        await updateDoc(userDocRef, { isBanned: false, bannedAt: null, banReason: null });
        setAllMembers(prev => prev.map(m => m.username.toLowerCase() === targetUser.username.toLowerCase() ? { ...m, isBanned: false, banReason: undefined } : m));
        showAlert(`Usuário @${targetUser.username} desbanido com sucesso!`, 'AÇÃO CONCLUÍDA', 'success');
      } else if (actionType === 'makeAdmin') {
        await updateDoc(userDocRef, { role: 'admin' });
        setAllMembers(prev => prev.map(m => m.username.toLowerCase() === targetUser.username.toLowerCase() ? { ...m, role: 'admin' } : m));
        showAlert(`Usuário @${targetUser.username} promovido a Administrador!`, 'AÇÃO CONCLUÍDA', 'success');
      } else if (actionType === 'removeAdmin') {
        await updateDoc(userDocRef, { role: 'Membro' });
        setAllMembers(prev => prev.map(m => m.username.toLowerCase() === targetUser.username.toLowerCase() ? { ...m, role: 'Membro' } : m));
        showAlert(`Cargo de administrador removido de @${targetUser.username}.`, 'AÇÃO CONCLUÍDA', 'success');
      }
      setAdminActionId('');
    } catch (err) {
      console.error('Erro ao executar ação administrativa:', err);
      showAlert('Erro ao processar a ação no servidor. Tente novamente.', 'ERRO', 'error');
    }
  };

  const handleBanUser"""

text = re.sub(old_handle_admin_action, new_handle_admin_action, text, flags=re.DOTALL)

# 4. Update renderMembersModal implementation
old_render_members = r'renderMembersModal = \(\) => \{.*?\};\s*const renderAdminReplyModal'

new_render_members = """renderMembersModal = () => {
    const filteredMembers = allMembers.filter(m =>
      (m.name || '').toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      (m.username || '').toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      (m.role || '').toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      (m.shortId || '').toLowerCase().includes(memberSearchQuery.toLowerCase())
    );

    return (
      <AnimatePresence>
        {showMembersModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4"
            onClick={() => { setShowMembersModal(false); setMemberSearchQuery(''); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-950 border border-emerald-900/80 p-4 sm:p-6 max-w-2xl w-full relative shadow-[0_0_50px_rgba(16,185,129,0.25)] rounded-md flex flex-col max-h-[85vh]"
            >
              <button
                onClick={() => { setShowMembersModal(false); setMemberSearchQuery(''); }}
                className="absolute top-4 right-4 text-zinc-500 hover:text-emerald-400 p-1"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4 shrink-0">
                <div className="p-2.5 bg-emerald-950/80 border border-emerald-800/80 rounded-full text-emerald-400">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-emerald-400 tracking-wider flex items-center gap-2">
                    USUÁRIOS DA COMUNIDADE ({allMembers.length})
                  </h2>
                  <p className="text-emerald-700 text-xs font-mono">
                    Membros registrados no Chat Global e Comunidades
                  </p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative mb-4 shrink-0">
                <Search className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                  placeholder="Buscar por nome, @usuário, cargo ou ID..."
                  className="w-full bg-black border border-emerald-900/60 text-emerald-200 pl-9 pr-4 py-2 text-xs rounded-sm focus:outline-none focus:border-emerald-500 placeholder-zinc-600"
                />
              </div>

              {/* Admin Control Panel By ID */}
              {isAdmin && (
                <div className="bg-zinc-900/80 border border-emerald-900/60 p-3 rounded-md mb-4 shrink-0 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                  <input
                    type="text"
                    value={adminActionId}
                    onChange={(e) => setAdminActionId(e.target.value.toUpperCase())}
                    placeholder="Digite o ID ou @usuário (ex: A1B2C3)"
                    className="bg-black border border-emerald-900/60 text-emerald-300 px-3 py-1.5 text-xs rounded-sm focus:outline-none focus:border-emerald-500 font-mono flex-1 w-full sm:w-auto placeholder-zinc-600"
                  />
                  <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                    <button
                      onClick={() => handleAdminActionById('ban', adminActionId)}
                      className="px-2.5 py-1.5 bg-red-950 text-red-300 border border-red-900 rounded text-[10px] font-bold shrink-0 hover:bg-red-900 transition-colors uppercase"
                    >
                      BANIR
                    </button>
                    <button
                      onClick={() => handleAdminActionById('unban', adminActionId)}
                      className="px-2.5 py-1.5 bg-emerald-950 text-emerald-300 border border-emerald-900 rounded text-[10px] font-bold shrink-0 hover:bg-emerald-900 transition-colors uppercase"
                    >
                      DESBANIR
                    </button>
                    <button
                      onClick={() => handleAdminActionById('makeAdmin', adminActionId)}
                      className="px-2.5 py-1.5 bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-900 rounded text-[10px] font-bold shrink-0 hover:bg-fuchsia-900 transition-colors uppercase"
                    >
                      TORNAR ADMIN
                    </button>
                    <button
                      onClick={() => handleAdminActionById('removeAdmin', adminActionId)}
                      className="px-2.5 py-1.5 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded text-[10px] font-bold shrink-0 hover:bg-zinc-700 transition-colors uppercase"
                    >
                      REMOVER ADMIN
                    </button>
                  </div>
                </div>
              )}

              {/* Members List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-emerald-900">
                {filteredMembers.length === 0 ? (
                  <p className="text-zinc-600 text-center py-8 text-xs font-mono">Nenhum membro encontrado.</p>
                ) : (
                  filteredMembers.map((member) => {
                    const isSelf = member.username.toLowerCase() === currentUser?.username?.toLowerCase();
                    const isSuperAdminAccount = member.username.toLowerCase() === 'samuellsilvva02';
                    const isTargetAdmin = member.role?.toLowerCase() === 'admin' || member.role?.toLowerCase() === 'administrador';

                    return (
                      <div
                        key={member.id || member.username}
                        className={`bg-black/80 border p-3 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                          member.isBanned
                            ? 'border-red-900/50 bg-red-950/10'
                            : isSuperAdminAccount
                            ? 'border-fuchsia-900/60 bg-fuchsia-950/10'
                            : isTargetAdmin
                            ? 'border-emerald-700/60 bg-emerald-950/20'
                            : 'border-emerald-900/40 hover:border-emerald-700/60'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                            member.isBanned
                              ? 'bg-red-950 text-red-400 border border-red-800'
                              : isSuperAdminAccount
                              ? 'bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-800'
                              : isTargetAdmin
                              ? 'bg-emerald-900 text-emerald-300 border border-emerald-700'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}>
                            {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-white font-bold text-xs truncate">{member.name}</span>
                              <span className="text-emerald-500/80 text-[11px] font-mono">@{member.username}</span>
                              {isSelf && (
                                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                  VOCÊ
                                </span>
                              )}
                              {isTargetAdmin && (
                                <span className="bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-800 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                  <Crown className="w-2.5 h-2.5 text-amber-400" /> ADMIN
                                </span>
                              )}
                              {member.isBanned && (
                                <span className="bg-red-950 text-red-400 border border-red-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                  BANIDO
                                </span>
                              )}
                            </div>
                            <p className="text-emerald-400/80 text-[11px] font-mono uppercase tracking-wider mt-0.5">
                              {member.role || 'Membro'} • ID: {member.shortId || 'Sem ID'}
                            </p>
                            {member.isBanned && member.banReason && (
                              <p className="text-red-300 text-[10px] font-mono mt-1 bg-red-950/40 p-1.5 rounded border border-red-900/50 break-words">
                                <strong className="text-red-400">Motivo do Banimento:</strong> {member.banReason}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Admin Moderation Actions */}
                        {isAdmin && !isSelf && !isSuperAdminAccount && (
                          <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                            <button
                              onClick={() => handleBanUser(member)}
                              className={`px-2.5 py-1 text-[11px] font-bold rounded border transition-colors flex items-center gap-1 ${
                                member.isBanned
                                  ? 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border-emerald-700'
                                  : 'bg-amber-950 hover:bg-amber-900 text-amber-300 border-amber-800'
                              }`}
                            >
                              <ShieldAlert className="w-3 h-3" />
                              {member.isBanned ? 'DESBANIR' : 'BANIR'}
                            </button>

                            {/* Make Admin / Remove Admin Button */}
                            <button
                              onClick={() => {
                                handleAdminActionById(isTargetAdmin ? 'removeAdmin' : 'makeAdmin', member.id || member.shortId || member.username);
                              }}
                              className={`px-2.5 py-1 text-[11px] font-bold rounded border transition-colors flex items-center gap-1 ${
                                isTargetAdmin
                                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-600'
                                  : 'bg-fuchsia-950 hover:bg-fuchsia-900 text-fuchsia-300 border-fuchsia-800'
                              }`}
                              title={isTargetAdmin ? 'Remover cargo de Administrador' : 'Tornar Administrador'}
                            >
                              <Crown className="w-3 h-3 text-amber-400" />
                              {isTargetAdmin ? 'REMOVER ADMIN' : 'TORNAR ADMIN'}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const renderAdminReplyModal"""

text = re.sub(old_render_members, new_render_members, text, flags=re.DOTALL)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated members modal and admin actions script successfully!")
