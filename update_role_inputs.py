import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Registration form role block
reg_pos = text.find('SUA PROFISS')
if reg_pos == -1:
    reg_pos = text.find('Selecione sua ocupação')

reg_block_start = text.rfind('<div>', 0, reg_pos)
reg_block_end = text.find('</div>', text.find('placeholder="Ou digite', reg_pos)) + len('</div>')

print("=== REGISTRATION BLOCK TO REPLACE ===")
print(text[reg_block_start:reg_block_end])

new_reg_block = """<div>
                <label className="block text-emerald-400 text-xs mb-1 font-bold uppercase tracking-wider">
                  CARGO / FUNÇÃO (OPCIONAL)
                </label>
                <p className="text-[11px] text-zinc-400 mb-2 font-mono">
                  Digite seu cargo, função ou área de atuação (opcional):
                </p>
                <input
                  type="text"
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  placeholder="Ex: Engenheiro, Designer, QA, Analista... (Opcional)"
                  className="w-full bg-zinc-900/50 border border-emerald-900/50 text-emerald-300 px-4 py-2 text-xs focus:outline-none focus:border-emerald-500 transition-colors rounded-sm"
                />
              </div>"""

text = text[:reg_block_start] + new_reg_block + text[reg_block_end:]

# 2. Edit role modal block
modal_pos = text.find('showEditRoleModal && (')
modal_end = text.find(')}', text.find('setShowEditRoleModal(false)', modal_pos + 500)) + len(')}')

print("=== EDIT MODAL TO REPLACE ===")
print(text[modal_pos:modal_end])

new_modal_block = """showEditRoleModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-[100] backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-zinc-950 border border-emerald-800 p-5 sm:p-6 rounded-md w-full max-w-md shadow-2xl relative"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Briefcase className="w-4 h-4" />
                <span>ALTERAR CARGO / FUNÇÃO</span>
              </div>
              <button
                onClick={() => setShowEditRoleModal(false)}
                className="text-zinc-500 hover:text-emerald-400 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-zinc-400 text-xs mb-4">
              Digite seu cargo, função ou especialidade (opcional). Se deixar em branco, será definido como <strong className="text-emerald-300">Membro</strong>.
            </p>

            <div className="space-y-3">
              <label className="block text-emerald-500 text-xs font-bold uppercase tracking-wider">
                Cargo / Função
              </label>

              <input
                type="text"
                value={editRoleValue}
                onChange={(e) => setEditRoleValue(e.target.value)}
                placeholder="Ex: Engenheiro, Designer, QA, Analista... (Opcional)"
                className="w-full bg-zinc-900/80 border border-emerald-900 text-emerald-200 px-3.5 py-2.5 text-xs rounded focus:outline-none focus:border-emerald-500"
              />

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditRoleModal(false)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded text-xs font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!currentUser) return;
                    const finalRole = editRoleValue.trim() || 'Membro';
                    try {
                      const q = query(collection(db, 'users'), where('username', '==', currentUser.username));
                      const querySnapshot = await getDocs(q);
                      if (!querySnapshot.empty) {
                        const uDoc = querySnapshot.docs[0];
                        await updateDoc(doc(db, 'users', uDoc.id), { role: finalRole });
                      }
                      const updatedUser = { ...currentUser, role: finalRole };
                      setCurrentUser(updatedUser);
                      localStorage.setItem('hud_devs_active_user', currentUser.username);
                      setAllMembers(prev => prev.map(m => m.username.toLowerCase() === currentUser.username.toLowerCase() ? { ...m, role: finalRole } : m));
                      setShowEditRoleModal(false);
                      showAlert(`Seu cargo/função foi atualizado para "${finalRole}"!`, 'ATUALIZADO', 'success');
                    } catch (err) {
                      console.error(err);
                      showAlert('Erro ao atualizar cargo/função.', 'ERRO', 'error');
                    }
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-bold transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )"""

text = text[:modal_pos] + new_modal_block + text[modal_end:]

# 3. Rename header menu text
text = text.replace('<span>Alterar Minha Profissão</span>', '<span>Alterar Cargo / Função</span>')

# 4. Rename profile pill title
text = text.replace('title="Clique para alterar sua profissão / cargo (opcional)"', 'title="Clique para alterar seu cargo / função (opcional)"')

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated role inputs and labels successfully!")
