const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Insert drawer
const drawerCode = `
        {/* Groups Drawer */}
        <AnimatePresence>
          {showGroupsMenu && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 bottom-0 w-[280px] bg-black border-r border-emerald-900/50 z-50 flex flex-col shadow-2xl"
            >
              <div className="p-4 border-b border-emerald-900/50 flex justify-between items-center bg-zinc-950">
                <h2 className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Comunidades
                </h2>
                <button onClick={() => setShowGroupsMenu(false)} className="text-emerald-600 hover:text-emerald-300">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-emerald-900">
                <button 
                  onClick={() => { setCurrentGroupId(null); setShowGroupsMenu(false); }}
                  className={\`w-full text-left p-3 rounded-sm border flex items-center gap-3 transition-colors \${!currentGroupId ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300' : 'bg-black border-emerald-900/30 text-emerald-600 hover:bg-emerald-950/30'}\`}
                >
                  <Globe className="w-5 h-5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate">Chat Global</div>
                    <div className="text-[10px] uppercase opacity-70">Canal Principal</div>
                  </div>
                </button>
                
                <div className="pt-2 pb-1 text-[10px] uppercase tracking-widest text-emerald-700 font-bold flex justify-between items-center">
                  <span>Meus Grupos</span>
                  <button onClick={() => { setShowGroupsMenu(false); setShowCreateGroupModal(true); }} className="bg-emerald-950/50 p-1 rounded-sm text-emerald-400 hover:bg-emerald-900/50" title="Criar Grupo">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {groups.filter(g => g.members.includes(currentUser?.username || '')).map(group => (
                  <button 
                    key={group.id}
                    onClick={() => { setCurrentGroupId(group.id); setShowGroupsMenu(false); }}
                    className={\`w-full text-left p-3 rounded-sm border flex items-center gap-3 transition-colors \${currentGroupId === group.id ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300' : 'bg-black border-emerald-900/30 text-emerald-600 hover:bg-emerald-950/30'}\`}
                  >
                    <Users className="w-5 h-5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate flex items-center gap-1">
                        {group.name} {group.owners.includes(currentUser?.username || '') && <Crown className="w-3 h-3 text-amber-400" title="Líder do Grupo" />}
                      </div>
                      <div className="text-[10px] opacity-70 truncate">{group.members.length} membros</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-3 border-t border-emerald-900/50 bg-zinc-950">
                <button 
                  onClick={() => { setShowGroupsMenu(false); setShowJoinGroupModal(true); }}
                  className="w-full bg-emerald-950 border border-emerald-800 text-emerald-400 p-2 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-900 transition-colors"
                >
                  <LinkIcon className="w-4 h-4" /> Entrar com Link
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Group Info Header (if inside a group) */}
        {currentGroupId && (
          <div className="bg-emerald-950/30 border-b border-emerald-900/30 p-2 px-4 flex items-center justify-between text-xs shrink-0 relative z-10">
            <div className="flex items-center gap-2 text-emerald-400">
              <Users className="w-4 h-4" />
              <span className="font-bold">{groups.find(g => g.id === currentGroupId)?.name}</span>
              <span className="opacity-60 hidden sm:inline">- {groups.find(g => g.id === currentGroupId)?.description}</span>
            </div>
            {groups.find(g => g.id === currentGroupId)?.owners.includes(currentUser?.username || '') && (
              <button 
                onClick={() => setGroupSettingsTarget(groups.find(g => g.id === currentGroupId) || null)}
                className="bg-emerald-950 border border-emerald-800 px-2 py-1 rounded-sm text-emerald-300 hover:bg-emerald-900 transition-colors flex items-center gap-1"
              >
                <Crown className="w-3 h-3 text-amber-400" />
                Gerenciar
              </button>
            )}
          </div>
        )}
`;

code = code.replace('<div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-30 z-10"></div>', '<div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-30 z-10"></div>\n' + drawerCode);
fs.writeFileSync('src/App.tsx', code);
