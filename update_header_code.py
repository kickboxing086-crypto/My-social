import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

start_marker = "{/* Active Location Banner (Top Header Notice) */}"
end_marker = "</header>"

start_idx = text.find(start_marker)
end_idx = text.find(end_marker, start_idx) + len(end_marker)

if start_idx != -1 and end_idx != -1:
    new_header = """{/* Unified & Organized Top Header */}
        <header className="bg-zinc-950 border-b border-emerald-900/60 px-3 py-2.5 flex items-center justify-between shrink-0 relative z-30 gap-2 font-mono">
          {/* Left Navigation & Active Location */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setShowGroupsMenu(true)}
              className="p-1.5 sm:px-2.5 bg-emerald-950/60 border border-emerald-800/80 rounded-sm hover:bg-emerald-900/60 transition-colors text-emerald-300 flex items-center gap-1.5 text-xs font-bold shrink-0"
              title="Menu de Comunidades"
            >
              <Menu className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Grupos</span>
            </button>

            <button
              onClick={() => setShowCreateGroupModal(true)}
              className="p-1.5 sm:px-2.5 bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-700/80 text-emerald-100 rounded-sm text-xs font-bold flex items-center gap-1 transition-colors shrink-0"
              title="Criar um Novo Grupo"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden md:inline">Criar Grupo</span>
            </button>

            <div className="h-5 w-px bg-emerald-900/80 hidden sm:block shrink-0"></div>

            {/* Organized Group / Location Banner Display */}
            {!currentGroupId ? (
              <div className="flex items-center gap-2 min-w-0 bg-emerald-950/40 border border-emerald-900/60 px-2.5 py-1 rounded-sm">
                <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs text-white tracking-wider uppercase truncate">CHAT GLOBAL</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                  </div>
                  <span className="text-[10px] text-emerald-500 font-mono hidden sm:inline truncate">Canal Principal de Comunicação</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 min-w-0 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-sm">
                <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[10px] text-emerald-500 uppercase font-bold hidden xs:inline shrink-0">GRUPO:</span>
                    <span className="font-extrabold text-xs text-emerald-200 tracking-wider truncate">
                      {groups.find(g => g.id === currentGroupId)?.name}
                    </span>
                  </div>
                  {groups.find(g => g.id === currentGroupId)?.description && (
                    <span className="text-[10px] text-emerald-500 font-mono hidden sm:inline truncate">
                      {groups.find(g => g.id === currentGroupId)?.description}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Controls & Administrative 3-Dots Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Search */}
            <div className="flex items-center relative">
              <AnimatePresence>
                {isSearching && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 'auto', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="overflow-hidden flex items-center bg-black border border-emerald-500/80 rounded-full px-2.5 py-1"
                  >
                    <Search className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mr-1.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar..."
                      className="bg-transparent border-none outline-none text-emerald-200 text-xs w-24 sm:w-40 placeholder-emerald-800"
                      autoFocus
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="text-emerald-600 hover:text-emerald-300 p-0.5 ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                onClick={() => {
                  setIsSearching(!isSearching);
                  if (isSearching) setSearchQuery('');
                }}
                className={`p-2 rounded-sm border transition-colors ${isSearching ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : 'text-emerald-400 bg-zinc-900 border-emerald-900/60 hover:bg-emerald-950/40'}`}
                title="Buscar mensagens"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Members Button */}
            <button
              onClick={() => setShowMembersModal(true)}
              className="px-2 py-1.5 text-emerald-300 bg-emerald-950/40 border border-emerald-800/80 rounded-sm hover:bg-emerald-900/50 transition-colors flex items-center gap-1 text-xs font-bold"
              title="Ver Membros da Comunidade"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Membros ({allMembers.length})</span>
            </button>

            {/* Push Notification Toggle */}
            <button
              onClick={requestPushPermission}
              className={`p-1.5 sm:px-2 sm:py-1 rounded-sm border transition-colors flex items-center gap-1 text-xs font-bold ${
                pushPermission === 'granted'
                  ? 'text-emerald-300 bg-emerald-950/50 border-emerald-700'
                  : 'text-amber-400 bg-amber-950/40 border-amber-800'
              }`}
              title={pushPermission === 'granted' ? 'Notificações de Push Ativadas' : 'Ativar Notificações Push'}
            >
              {pushPermission === 'granted' ? <Bell className="w-3.5 h-3.5 text-emerald-400" /> : <BellOff className="w-3.5 h-3.5 text-amber-400" />}
              <span className="hidden md:inline">{pushPermission === 'granted' ? 'Push ON' : 'Push OFF'}</span>
            </button>

            {/* User Profile Pill */}
            <div className="hidden md:flex items-center gap-1.5 bg-black px-2.5 py-1 rounded-sm border border-emerald-900/60 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
              <span className="text-emerald-100 font-bold truncate max-w-[100px]">{currentUser?.name}</span>
              <span className="text-emerald-500 font-mono border-l border-emerald-900/50 pl-1.5 text-[10px]">ID: {currentUser?.shortId || 'S/ID'}</span>
            </div>

            {/* 3-DOTS ADMINISTRATIVE & MANAGEMENT MENU BUTTON */}
            <div className="relative">
              <button
                onClick={() => setShowHeaderAdminMenu(!showHeaderAdminMenu)}
                className={`p-1.5 sm:px-2 sm:py-1 rounded-sm border transition-all flex items-center gap-1 text-xs font-bold ${
                  showHeaderAdminMenu
                    ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                    : 'bg-zinc-900 hover:bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
                }`}
                title="Menu de Funções Administrativas"
              >
                <MoreVertical className="w-4 h-4" />
                <span className="hidden xs:inline text-[11px]">AÇÕES</span>
              </button>

              {/* 3-DOTS POPUP DROPDOWN MENU */}
              <AnimatePresence>
                {showHeaderAdminMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-zinc-950 border border-emerald-800 rounded-md shadow-[0_0_30px_rgba(0,0,0,0.9)] z-50 p-1.5 font-mono text-xs space-y-1"
                  >
                    <div className="px-2 py-1.5 text-[10px] font-bold text-emerald-500 border-b border-emerald-900/60 uppercase tracking-wider flex items-center justify-between">
                      <span>PAINEL DE GERENCIAMENTO</span>
                      <Shield className="w-3 h-3 text-emerald-400" />
                    </div>

                    {/* Group Invite option */}
                    {currentGroupId && (
                      <button
                        onClick={() => {
                          setShowHeaderAdminMenu(false);
                          const currentGrp = groups.find(g => g.id === currentGroupId);
                          if (currentGrp) copyOrShareGroupLink(currentGrp);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded hover:bg-emerald-900/40 text-emerald-200 transition-colors flex items-center gap-2 font-bold"
                      >
                        <LinkIcon className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Convidar para o Grupo</span>
                      </button>
                    )}

                    {/* Group Settings option (Group Owners) */}
                    {currentGroupId && groups.find(g => g.id === currentGroupId)?.owners.includes(currentUser?.username || '') && (
                      <button
                        onClick={() => {
                          setShowHeaderAdminMenu(false);
                          setGroupSettingsTarget(groups.find(g => g.id === currentGroupId) || null);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded hover:bg-emerald-900/40 text-emerald-300 transition-colors flex items-center gap-2 font-bold"
                      >
                        <Users className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Gerenciar Grupo Atual</span>
                      </button>
                    )}

                    {/* System Admin Panel option */}
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setShowHeaderAdminMenu(false);
                          setView('admin');
                        }}
                        className="w-full text-left px-2.5 py-2 rounded hover:bg-fuchsia-950/60 text-fuchsia-300 transition-colors flex items-center gap-2 font-bold"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-fuchsia-400" />
                        <span>Painel de Administração Geral</span>
                      </button>
                    )}

                    {/* Appeal & Suggestions Modal option */}
                    <button
                      onClick={() => {
                        setShowHeaderAdminMenu(false);
                        setShowSuggestionModal(true);
                      }}
                      className="w-full text-left px-2.5 py-2 rounded hover:bg-blue-950/40 text-blue-300 transition-colors flex items-center gap-2 font-bold"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-blue-400" />
                      <span>Enviar Sugestão / Ideia</span>
                    </button>

                    {!isAdmin && (
                      <button
                        onClick={() => {
                          setShowHeaderAdminMenu(false);
                          setShowAppealModal(true);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded hover:bg-amber-950/40 text-amber-300 transition-colors flex items-center gap-2 font-bold"
                      >
                        <Flag className="w-3.5 h-3.5 text-amber-400" />
                        <span>Enviar Apelação ao Suporte</span>
                      </button>
                    )}

                    {/* Leave Group option */}
                    {currentGroupId && (
                      <button
                        onClick={() => {
                          setShowHeaderAdminMenu(false);
                          handleLeaveGroup(currentGroupId);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded hover:bg-amber-950/60 text-amber-400 transition-colors flex items-center gap-2 font-bold border-t border-emerald-900/40 mt-1"
                      >
                        <LogOut className="w-3.5 h-3.5 text-amber-400" />
                        <span>Sair do Grupo</span>
                      </button>
                    )}

                    {/* Logout option */}
                    <button
                      onClick={() => {
                        setShowHeaderAdminMenu(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-2.5 py-2 rounded hover:bg-red-950/60 text-red-400 transition-colors flex items-center gap-2 font-bold border-t border-zinc-800"
                    >
                      <Power className="w-3.5 h-3.5 text-red-400" />
                      <span>Desconectar / Sair</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>"""

    text = text[:start_idx] + new_header + text[end_idx:]

    with open('src/App.tsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Step 2: Unified Top Header with 3-Dots Admin Menu replaced successfully!")
else:
    print("Error: Could not locate header start/end markers.")
