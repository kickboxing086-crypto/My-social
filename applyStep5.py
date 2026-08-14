import sys

with open('src/App.tsx', 'r') as f:
    code = f.read()

modals_jsx = """
  // 1. Members Group Modal
  const renderMembersModal = () => {
    const filteredMembers = allMembers.filter(m => 
      !memberSearchQuery || 
      m.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) || 
      m.username.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(memberSearchQuery.toLowerCase())
    );

    return (
      <AnimatePresence>
        {showMembersModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4" 
            onClick={() => setShowMembersModal(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 15 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 15 }} 
              transition={{ type: "spring", stiffness: 350, damping: 25 }} 
              onClick={(e) => e.stopPropagation()} 
              className="bg-zinc-950 border border-emerald-900/80 p-4 sm:p-6 max-w-2xl w-full h-[85vh] flex flex-col relative shadow-[0_0_50px_rgba(16,185,129,0.25)] rounded-md overflow-hidden font-mono"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-emerald-900/50 mb-4 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-950/80 border border-emerald-800 rounded-full text-emerald-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-emerald-400 tracking-wider uppercase">Membros do Grupo ({allMembers.length})</h2>
                    <p className="text-[10px] text-emerald-700 tracking-widest uppercase">Rede Devs HUD Cadastrados</p>
                  </div>
                </div>
                <button onClick={() => setShowMembersModal(false)} className="text-zinc-500 hover:text-emerald-400 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="mb-4 relative shrink-0">
                <Search className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                  placeholder="Buscar membro por nome, usuário ou cargo..."
                  className="w-full bg-black border border-emerald-900/60 text-emerald-200 pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-emerald-500 rounded-sm"
                />
              </div>

              {/* Members List */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 scrollbar-thin scrollbar-thumb-emerald-900">
                {filteredMembers.length === 0 ? (
                  <div className="text-center py-8 text-zinc-600 text-xs">Nenhum membro encontrado.</div>
                ) : (
                  filteredMembers.map((member) => {
                    const isMemberAdmin = member.username === 'Samuel123' || member.username === 'samuellsilvva02' || member.role?.toLowerCase().includes('admin');
                    const isMe = member.username === currentUser?.username;

                    return (
                      <div 
                        key={member.id || member.username} 
                        className={`p-3 rounded-sm border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          member.isBanned ? 'bg-red-950/20 border-red-900/50' : 
                          isMemberAdmin ? 'bg-fuchsia-950/20 border-fuchsia-900/40' : 
                          'bg-zinc-900/80 border-emerald-900/30'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border ${
                            member.isBanned ? 'bg-red-950 text-red-400 border-red-800' :
                            isMemberAdmin ? 'bg-fuchsia-950 text-fuchsia-300 border-fuchsia-800' :
                            'bg-emerald-950 text-emerald-300 border-emerald-800'
                          }`}>
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-100 text-sm font-bold truncate">{member.name}</span>
                              <span className="text-emerald-600 text-xs truncate">@{member.username}</span>
                              {isMe && <span className="text-[10px] bg-emerald-900/50 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-700">VOCÊ</span>}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-[10px] uppercase font-semibold ${isMemberAdmin ? 'text-fuchsia-400' : 'text-emerald-400'}`}>
                                {member.role || 'Desenvolvedor'}
                              </span>
                              {member.isBanned && (
                                <span className="text-[10px] bg-red-950 text-red-400 border border-red-800 px-1.5 py-0.2 rounded font-bold">
                                  BANIDO
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Admin Action Buttons */}
                        {isAdmin && !isMe && (
                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                            <button
                              onClick={() => handleBanUser(member)}
                              className={`px-2.5 py-1 text-[11px] font-bold rounded border transition-colors flex items-center gap-1 ${
                                member.isBanned 
                                  ? 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border-emerald-800' 
                                  : 'bg-amber-950/60 hover:bg-amber-900 text-amber-300 border-amber-800'
                              }`}
                              title={member.isBanned ? "Desbanir Usuário" : "Banir Usuário"}
                            >
                              {member.isBanned ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                              <span>{member.isBanned ? 'Desbanir' : 'Banir'}</span>
                            </button>

                            <button
                              onClick={() => setUserToDeleteConfirm(member)}
                              className="px-2.5 py-1 text-[11px] font-bold bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800 rounded transition-colors flex items-center gap-1"
                              title="Excluir Conta Permanentemente"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Apagar</span>
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

  // 2. Admin Reply Modal
  const renderAdminReplyModal = () => (
    <AnimatePresence>
      {adminReplyTarget && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 font-mono" 
          onClick={() => setAdminReplyTarget(null)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.88, y: 15 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.88, y: 15 }} 
            transition={{ type: "spring", stiffness: 350, damping: 25 }} 
            onClick={(e) => e.stopPropagation()} 
            className="bg-zinc-950 border border-fuchsia-900/80 p-6 max-w-md w-full relative shadow-[0_0_50px_rgba(217,70,239,0.25)] rounded-md"
          >
            <button onClick={() => setAdminReplyTarget(null)} className="absolute top-4 right-4 text-zinc-500 hover:text-fuchsia-400">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-6 h-6 text-fuchsia-400" />
              <h2 className="text-base font-bold text-fuchsia-300 uppercase tracking-wider">
                RESPONDER {adminReplyTarget.type === 'report' ? 'DENÚNCIA' : 'SUGESTÃO'}
              </h2>
            </div>

            <div className="bg-black/60 p-3 rounded border border-fuchsia-900/30 text-xs mb-4">
              <span className="text-fuchsia-400 font-bold">Destinatário:</span> @{adminReplyTarget.user}
              <div className="text-zinc-400 mt-1 italic">"{adminReplyTarget.text}"</div>
            </div>

            <textarea
              value={adminReplyText}
              onChange={(e) => setAdminReplyText(e.target.value)}
              placeholder="Escreva sua resposta oficial do administrador..."
              className="w-full bg-black border border-fuchsia-900/50 text-fuchsia-100 p-3 mb-4 h-28 resize-none focus:outline-none focus:border-fuchsia-400 rounded text-sm"
            />

            <button 
              onClick={handleAdminReply}
              disabled={!adminReplyText.trim()}
              className="w-full py-2.5 bg-fuchsia-950 hover:bg-fuchsia-900 text-fuchsia-200 border border-fuchsia-700 font-bold transition-all disabled:opacity-50 rounded text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(217,70,239,0.3)]"
            >
              <Send className="w-4 h-4" />
              TRANSMITIR RESPOSTA OFICIAL
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // 3. Confirm Delete Account Modal
  const renderDeleteUserConfirmModal = () => (
    <AnimatePresence>
      {userToDeleteConfirm && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 font-mono" 
          onClick={() => setUserToDeleteConfirm(null)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.85, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.85, y: 20 }} 
            transition={{ type: "spring", stiffness: 350, damping: 25 }} 
            onClick={(e) => e.stopPropagation()} 
            className="bg-zinc-950 border border-red-900/80 p-6 max-w-md w-full relative shadow-[0_0_50px_rgba(239,68,68,0.3)] rounded-md overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 animate-pulse" />
            
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-950/80 border border-red-800 rounded-full text-red-500">
                <Trash2 className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-red-400 tracking-wider uppercase">EXCLUIR CONTA PERMANENTEMENTE</h3>
                <p className="text-red-900/90 text-[10px] uppercase tracking-widest">Ação Irreversível de Administrador</p>
              </div>
            </div>

            <p className="text-zinc-300 text-sm mb-6 leading-relaxed bg-black/60 p-3 rounded border border-red-900/40">
              Tem certeza que deseja apagar permanentemente a conta de <strong className="text-white">{userToDeleteConfirm.name} (@{userToDeleteConfirm.username})</strong>? Todas as suas mensagens no histórico do chat serão purgadas do banco de dados!
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setUserToDeleteConfirm(null)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded text-xs font-bold transition-all"
              >
                CANCELAR
              </button>
              <button
                onClick={executeDeleteUserAccount}
                className="px-5 py-2 bg-red-950 hover:bg-red-900 text-red-100 border border-red-700 rounded text-xs font-bold transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.4)]"
              >
                <Trash2 className="w-4 h-4" />
                EXCLUIR AGORA
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // 4. Cyber Microphone Permission Tester Modal
  const renderMicPermissionModal = () => (
    <AnimatePresence>
      {showMicPermissionModal && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 font-mono" 
          onClick={() => setShowMicPermissionModal(false)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.88, y: 15 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.88, y: 15 }} 
            transition={{ type: "spring", stiffness: 350, damping: 25 }} 
            onClick={(e) => e.stopPropagation()} 
            className="bg-zinc-950 border border-emerald-500/80 p-6 max-w-md w-full relative shadow-[0_0_60px_rgba(16,185,129,0.3)] rounded-md overflow-hidden text-center"
          >
            <button onClick={() => setShowMicPermissionModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-emerald-400">
              <X className="w-5 h-5" />
            </button>

            {/* Radar Animation */}
            <div className="relative w-24 h-24 mx-auto mb-5 flex items-center justify-center">
              <motion.div 
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.8, 0.3] }} 
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} 
                className="absolute inset-0 rounded-full border-2 border-emerald-500/50 bg-emerald-950/20" 
              />
              <motion.div 
                animate={{ scale: [1, 1.8, 1], opacity: [0.1, 0.4, 0.1] }} 
                transition={{ duration: 2, repeat: Infinity, delay: 0.5, ease: "easeInOut" }} 
                className="absolute inset-0 rounded-full border border-emerald-400/30" 
              />
              <div className="relative z-10 p-4 bg-black border border-emerald-500/80 rounded-full text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                <Mic className="w-8 h-8" />
              </div>
            </div>

            <h3 className="text-lg font-extrabold text-emerald-400 tracking-wider mb-2 uppercase">PERMISSÃO DE MICROFONE HUD</h3>
            <p className="text-zinc-400 text-xs mb-6 leading-relaxed bg-black/50 p-3 rounded border border-emerald-900/40">
              {micTestActive 
                ? "Microfone ativado! Fale algo para testar o nível de captação abaixo:" 
                : "Aperte o botão abaixo para conceder ou testar a captação de áudio do seu microfone com resposta em tempo real."}
            </p>

            {/* Sound Wave Meter */}
            {micTestActive && (
              <div className="mb-6 bg-black p-3 rounded border border-emerald-900/80">
                <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold mb-1.5">
                  <span>Nível de Captação</span>
                  <span>{micAudioLevel}%</span>
                </div>
                <div className="h-2 bg-zinc-900 rounded-full overflow-hidden border border-emerald-900">
                  <div 
                    className="h-full bg-emerald-400 transition-all duration-75 ease-out shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                    style={{ width: `${micAudioLevel}%` }}
                  />
                </div>
              </div>
            )}

            <button
              onClick={requestMicPermissionWithAnimation}
              className="w-full py-3 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-600 font-bold transition-all rounded text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              <Mic className="w-4 h-4" />
              {micTestActive ? "RETESTAR MICROFONE" : "PERMITIR E TESTAR AGORA"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // 5. In-App Floating Push Notification Toast
  const renderPushToast = () => (
    <AnimatePresence>
      {pushToast && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          onClick={() => setPushToast(null)}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] bg-zinc-950 border border-emerald-500/80 p-3 rounded-md shadow-[0_0_30px_rgba(16,185,129,0.3)] cursor-pointer font-mono"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-950 border border-emerald-700 rounded-full text-emerald-400 shrink-0 animate-bounce">
              <Bell className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-emerald-400 text-xs font-bold truncate">@{pushToast.sender}</div>
              <div className="text-emerald-100/90 text-xs truncate">{pushToast.text}</div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setPushToast(null); }} className="text-zinc-500 hover:text-emerald-400 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
"""

# Insert modals before return statement
code = code.replace("  // --- VIEWS ---", modals_jsx + "\n  // --- VIEWS ---")

with open('src/App.tsx', 'w') as f:
    f.write(code)

print("Step 5 applied successfully!")
