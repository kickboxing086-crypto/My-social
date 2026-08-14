import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

start_marker = "const renderMembersModal = () => {"
end_marker = "  const renderAdminReplyModal = () => ("

start_idx = text.find(start_marker)
end_idx = text.find(end_marker, start_idx)

print("start_idx:", start_idx, "end_idx:", end_idx)

if start_idx != -1 and end_idx != -1:
    new_modal = """const renderMembersModal = () => {
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
            onClick={() => { setShowMembersModal(false); setMemberSearchQuery(''); setOpenMemberMenuUsername(null); setShowAdminIdActionMenu(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-950 border border-emerald-900/80 p-4 sm:p-6 max-w-2xl w-full relative shadow-[0_0_50px_rgba(16,185,129,0.25)] rounded-md flex flex-col max-h-[85vh] font-mono"
            >
              <button
                onClick={() => { setShowMembersModal(false); setMemberSearchQuery(''); setOpenMemberMenuUsername(null); setShowAdminIdActionMenu(false); }}
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

              {/* Admin Control Panel By ID (Behind 3-Dots Menu) */}
              {isAdmin && (
                <div className="bg-zinc-900/80 border border-emerald-900/60 p-3 rounded-md mb-4 shrink-0 flex items-center gap-2 relative">
                  <input
                    type="text"
                    value={adminActionId}
                    onChange={(e) => setAdminActionId(e.target.value.toUpperCase())}
                    placeholder="Digite o ID ou @usuário (ex: A1B2C3)"
                    className="bg-black border border-emerald-900/60 text-emerald-300 px-3 py-1.5 text-xs rounded-sm focus:outline-none focus:border-emerald-500 font-mono flex-1 placeholder-zinc-600"
                  />

                  {/* 3-Dots Dropdown Trigger for Admin Action By ID */}
                  <div className="relative">
                    <button
                      onClick={() => setShowAdminIdActionMenu(!showAdminIdActionMenu)}
                      className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded text-xs font-bold flex items-center gap-1 transition-colors uppercase"
                      title="Ações do ID"
                    >
                      <MoreVertical className="w-4 h-4 text-emerald-400" />
                      <span>Ações ID</span>
                    </button>

                    {showAdminIdActionMenu && (
                      <div className="absolute right-0 top-full mt-1.5 w-48 bg-zinc-950 border border-emerald-800 rounded shadow-2xl p-1 z-50 space-y-1 font-mono text-xs">
                        <button
                          onClick={() => {
                            setShowAdminIdActionMenu(false);
                            handleAdminActionById('ban', adminActionId);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded hover:bg-amber-950/60 text-amber-300 flex items-center gap-2 font-bold"
                        >
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                          <span>Banir por ID</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowAdminIdActionMenu(false);
                            handleAdminActionById('unban', adminActionId);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded hover:bg-emerald-950/60 text-emerald-300 flex items-center gap-2 font-bold"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Desbanir por ID</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowAdminIdActionMenu(false);
                            handleAdminActionById('makeAdmin', adminActionId);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded hover:bg-fuchsia-950/60 text-fuchsia-300 flex items-center gap-2 font-bold"
                        >
                          <Crown className="w-3.5 h-3.5 text-fuchsia-400" />
                          <span>Tornar Admin</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowAdminIdActionMenu(false);
                            handleAdminActionById('removeAdmin', adminActionId);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded hover:bg-zinc-800 text-zinc-300 flex items-center gap-2 font-bold"
                        >
                          <UserX className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Remover Admin</span>
                        </button>
                      </div>
                    )}
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
                    const isMenuOpen = openMemberMenuUsername === member.username;

                    return (
                      <div
                        key={member.id || member.username}
                        className={`bg-black/80 border p-3 rounded-sm flex items-center justify-between gap-3 transition-all relative ${
                          member.isBanned
                            ? 'border-red-900/50 bg-red-950/10'
                            : isSuperAdminAccount
                            ? 'border-fuchsia-900/60 bg-fuchsia-950/10'
                            : isTargetAdmin
                            ? 'border-emerald-700/60 bg-emerald-950/20'
                            : 'border-emerald-900/40 hover:border-emerald-700/60'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
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
                          <div className="min-w-0 flex-1">
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
                                  ADMIN
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
                                <strong className="text-red-400">Motivo:</strong> {member.banReason}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Member 3-Dots Action Menu */}
                        <div className="relative shrink-0">
                          <button
                            onClick={() => setOpenMemberMenuUsername(isMenuOpen ? null : member.username)}
                            className="p-1.5 bg-zinc-900 hover:bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-sm transition-colors"
                            title="Opções do Membro"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Context Menu Popup */}
                          {isMenuOpen && (
                            <div className="absolute right-0 top-full mt-1 w-52 bg-zinc-950 border border-emerald-800 rounded shadow-2xl p-1.5 z-50 space-y-1 font-mono text-xs">
                              {isAdmin && !isSelf && !isSuperAdminAccount && (
                                <>
                                  <button
                                    onClick={() => {
                                      setOpenMemberMenuUsername(null);
                                      handleBanUser(member);
                                    }}
                                    className={`w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 font-bold ${
                                      member.isBanned
                                        ? 'hover:bg-emerald-950/60 text-emerald-300'
                                        : 'hover:bg-amber-950/60 text-amber-300'
                                    }`}
                                  >
                                    <ShieldAlert className="w-3.5 h-3.5" />
                                    <span>{member.isBanned ? 'Desbanir Usuário' : 'Banir Usuário'}</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setOpenMemberMenuUsername(null);
                                      handleAdminActionById(isTargetAdmin ? 'removeAdmin' : 'makeAdmin', member.id || member.shortId || member.username);
                                    }}
                                    className={`w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 font-bold ${
                                      isTargetAdmin
                                        ? 'hover:bg-zinc-800 text-zinc-300'
                                        : 'hover:bg-fuchsia-950/60 text-fuchsia-300'
                                    }`}
                                  >
                                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                                    <span>{isTargetAdmin ? 'Remover Admin' : 'Tornar Admin'}</span>
                                  </button>
                                </>
                              )}

                              <button
                                onClick={() => {
                                  setOpenMemberMenuUsername(null);
                                  navigator.clipboard.writeText(member.shortId || member.id || '');
                                  showAlert(`ID ${member.shortId} copiado para a área de transferência!`, 'COPIADO', 'info');
                                }}
                                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-emerald-950/40 text-emerald-300 flex items-center gap-2 font-bold"
                              >
                                <Copy className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Copiar ID (#{member.shortId || 'S/ID'})</span>
                              </button>

                              <button
                                onClick={() => {
                                  setOpenMemberMenuUsername(null);
                                  navigator.clipboard.writeText(`@${member.username}`);
                                  showAlert(`@${member.username} copiado!`, 'COPIADO', 'info');
                                }}
                                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-emerald-950/40 text-emerald-300 flex items-center gap-2 font-bold"
                              >
                                <User className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Copiar @{member.username}</span>
                              </button>
                            </div>
                          )}
                        </div>
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
  };\n\n  """

    text = text[:start_idx] + new_modal + text[end_idx:]

    with open('src/App.tsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Step 3: Members modal updated with 3-dots menus successfully!")
else:
    print("Error: Could not locate renderMembersModal start/end markers.")
