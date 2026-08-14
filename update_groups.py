import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update Create Group Modal labels & texts
old_modal_title = '<h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2"><Users className="w-5 h-5" /> Criar Novo Grupo</h2>'
new_modal_title = '<h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2"><Users className="w-5 h-5 text-emerald-400" /> Criar Novo Grupo / Comunidade</h2>'
text = text.replace(old_modal_title, new_modal_title)

text = text.replace('DESCRIÃ‡ÃƒO', 'DESCRIÇÃO')
text = text.replace('CÃ“DIGO DE CONVITE', 'CÓDIGO DE CONVITE')

# 2. Add "+ Criar Grupo" button to the main top header bar next to Menu / MY SOCIAL
old_header_left = """          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setShowGroupsMenu(true)} className="p-1.5 bg-emerald-950/50 border border-emerald-900/50 rounded-sm hover:bg-emerald-900/50 transition-colors text-emerald-400">
              <Menu className="w-4 h-4" />
            </button>
            <Globe className="w-5 h-5 text-emerald-500" />
            <h1 className="font-bold tracking-wider text-emerald-400 text-sm sm:text-base">MY SOCIAL</h1>
          </div>"""

new_header_left = """          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setShowGroupsMenu(true)} className="p-1.5 bg-emerald-950/50 border border-emerald-900/50 rounded-sm hover:bg-emerald-900/50 transition-colors text-emerald-400 flex items-center gap-1.5" title="Menu de Comunidades">
              <Menu className="w-4 h-4" />
              <span className="text-xs font-bold hidden sm:inline">Grupos</span>
            </button>
            <button
              onClick={() => setShowCreateGroupModal(true)}
              className="bg-emerald-900 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/80 px-2.5 py-1 rounded-sm text-xs font-bold flex items-center gap-1 transition-colors shadow-sm"
              title="Criar um Novo Grupo"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden xs:inline">Criar Grupo</span>
            </button>
            <Globe className="w-5 h-5 text-emerald-500 hidden md:inline ml-1" />
            <h1 className="font-bold tracking-wider text-emerald-400 text-sm sm:text-base hidden md:inline">MY SOCIAL</h1>
          </div>"""

if old_header_left in text:
    text = text.replace(old_header_left, new_header_left)
    print("Updated main header left controls with Criar Grupo button!")

# 3. Update Groups Drawer header & footer to prominently display "Criar Novo Grupo"
old_meus_grupos_hdr = """                <div className="pt-2 pb-1 text-[10px] uppercase tracking-widest text-emerald-700 font-bold flex justify-between items-center">
                  <span>Meus Grupos</span>
                  <button onClick={() => { setShowGroupsMenu(false); setShowCreateGroupModal(true); }} className="bg-emerald-950/50 p-1 rounded-sm text-emerald-400 hover:bg-emerald-900/50" title="Criar Grupo">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>"""

new_meus_grupos_hdr = """                <div className="pt-3 pb-1 text-[10px] uppercase tracking-widest text-emerald-500 font-bold flex justify-between items-center border-t border-emerald-900/30 mt-2">
                  <span>Meus Grupos ({groups.filter(g => g.members.includes(currentUser?.username || '')).length})</span>
                  <button onClick={() => { setShowGroupsMenu(false); setShowCreateGroupModal(true); }} className="bg-emerald-900/80 border border-emerald-700 px-2 py-0.5 rounded-sm text-emerald-200 hover:bg-emerald-800 text-[10px] font-bold flex items-center gap-1 transition-colors" title="Criar Grupo">
                    <Plus className="w-3 h-3" />
                    <span>Novo Grupo</span>
                  </button>
                </div>"""

if old_meus_grupos_hdr in text:
    text = text.replace(old_meus_grupos_hdr, new_meus_grupos_hdr)
    print("Updated Meus Grupos drawer section header!")

old_drawer_footer = """              <div className="p-3 border-t border-emerald-900/50 bg-zinc-950">
                <button 
                  onClick={() => { setShowGroupsMenu(false); setShowJoinGroupModal(true); }}
                  className="w-full bg-emerald-950 border border-emerald-800 text-emerald-400 p-2 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-900 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Entrar em um Grupo
                </button>
              </div>"""

new_drawer_footer = """              <div className="p-3 border-t border-emerald-900/50 bg-zinc-950 flex flex-col gap-2">
                <button 
                  onClick={() => { setShowGroupsMenu(false); setShowCreateGroupModal(true); }}
                  className="w-full bg-emerald-900 hover:bg-emerald-800 border border-emerald-700 text-emerald-100 p-2.5 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                  <Plus className="w-4 h-4 text-emerald-300" /> Criar Novo Grupo
                </button>
                <button 
                  onClick={() => { setShowGroupsMenu(false); setShowJoinGroupModal(true); }}
                  className="w-full bg-black hover:bg-zinc-900 border border-emerald-900/80 text-emerald-400 p-2 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                >
                  <LinkIcon className="w-4 h-4 text-emerald-500" /> Entrar com Convite
                </button>
              </div>"""

if old_drawer_footer in text:
    text = text.replace(old_drawer_footer, new_drawer_footer)
    print("Updated drawer footer with Criar Novo Grupo and Entrar com Convite!")

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Applied group creation UI updates!")
