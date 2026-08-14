import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add Briefcase to lucide-react imports if not present
if 'Briefcase,' not in text and 'Briefcase ' not in text:
    text = text.replace("import { motion, AnimatePresence } from 'motion/react';", "import { motion, AnimatePresence } from 'motion/react';")
    text = text.replace("import { Globe,", "import { Globe, Briefcase,")

# 2. Add state variables for edit role modal
state_marker = "const [showPolicy, setShowPolicy] = useState(false);"
new_states = """const [showPolicy, setShowPolicy] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [editRoleValue, setEditRoleValue] = useState('');"""

text = text.replace(state_marker, new_states)

# 3. Update registration role section in JSX
old_reg_role_block = """              <div>
                <label className="block text-emerald-700 text-xs mb-1 font-bold">CARGO / PROFISSÃO</label>
                <p className="text-[11px] text-zinc-400 mb-2 font-mono">
                  Selecione sua ocupação principal ou digite uma especialidade personalizada:
                </p>
                <select
                  onChange={(e) => {
                    if (e.target.value && e.target.value !== 'custom') {
                      setRegRole(e.target.value);
                    } else if (e.target.value === 'custom') {
                      setRegRole('');
                    }
                  }}
                  className="w-full bg-black border border-emerald-900/80 text-emerald-300 px-3 py-2 text-xs rounded-sm mb-2 focus:outline-none focus:border-emerald-500 font-sans"
                >
                  <option value="">-- Selecione uma opção sugestiva --</option>
                  <option value="Desenvolvedor(a) Fullstack">💻 Desenvolvedor(a) Fullstack</option>
                  <option value="Desenvolvedor(a) Frontend">💻 Desenvolvedor(a) Frontend</option>
                  <option value="Desenvolvedor(a) Backend">💻 Desenvolvedor(a) Backend</option>
                  <option value="Desenvolvedor(a) Mobile">📱 Desenvolvedor(a) Mobile (iOS/Android)</option>
                  <option value="Engenheiro(a) de Software">⚙️ Engenheiro(a) de Software</option>
                  <option value="Designer UI/UX">🎨 UI/UX Designer / Product Designer</option>
                  <option value="Analista de QA / Testador(a)">🧪 Analista de QA / Testador(a)</option>
                  <option value="Gerente de Projetos / PO">📊 Gerente de Projetos / Product Owner</option>
                  <option value="DevOps / Infraestrutura">☁️ DevOps / Engenheiro(a) de Cloud</option>
                  <option value="Cientista de Dados / IA">🤖 Cientista de Dados / Especialista em IA</option>
                  <option value="Estudante de Tecnologia">🎓 Estudante / Aprendiz de Tecnologia</option>
                  <option value="custom">✏️ Outra Profissão (Digitar manualmente abaixo)</option>
                </select>
                <input
                  type="text"
                  required
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  placeholder="Ou digite sua profissão / especialidade exata..."
                  className="w-full bg-zinc-900/50 border border-emerald-900/50 text-emerald-300 px-4 py-2 text-xs focus:outline-none focus:border-emerald-500 transition-colors rounded-sm"
                />
              </div>"""

new_reg_role_block = """              <div>
                <label className="block text-emerald-700 text-xs mb-1 font-bold">CARGO / PROFISSÃO (OPCIONAL)</label>

                <p className="text-[11px] text-zinc-400 mb-2 font-mono">
                  Selecione uma opção sugestiva ou digite livremente sua profissão (opcional):
                </p>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="w-full bg-black border border-emerald-900/80 text-emerald-300 px-3 py-2 text-xs rounded-sm mb-2 focus:outline-none focus:border-emerald-500 font-sans"
                >
                  <option value="">-- Selecione uma opção sugestiva (Opcional) --</option>
                  <option value="Desenvolvedor(a) Fullstack">💻 Desenvolvedor(a) Fullstack</option>
                  <option value="Desenvolvedor(a) Frontend">💻 Desenvolvedor(a) Frontend</option>
                  <option value="Desenvolvedor(a) Backend">💻 Desenvolvedor(a) Backend</option>
                  <option value="Desenvolvedor(a) Mobile">📱 Desenvolvedor(a) Mobile (iOS/Android)</option>
                  <option value="Engenheiro(a) de Software">⚙️ Engenheiro(a) de Software</option>
                  <option value="Designer UI/UX">🎨 UI/UX Designer / Product Designer</option>
                  <option value="Analista de QA / Testador(a)">🧪 Analista de QA / Testador(a)</option>
                  <option value="Gerente de Projetos / PO">📊 Gerente de Projetos / Product Owner</option>
                  <option value="DevOps / Infraestrutura">☁️ DevOps / Engenheiro(a) de Cloud</option>
                  <option value="Cientista de Dados / IA">🤖 Cientista de Dados / Especialista em IA</option>
                  <option value="Estudante de Tecnologia">🎓 Estudante / Aprendiz de Tecnologia</option>
                </select>
                <input
                  type="text"
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  placeholder="Ou digite livremente sua profissão / especialidade (Opcional)..."
                  className="w-full bg-zinc-900/50 border border-emerald-900/50 text-emerald-300 px-4 py-2 text-xs focus:outline-none focus:border-emerald-500 transition-colors rounded-sm"
                />
              </div>"""

if old_reg_role_block in text:
    text = text.replace(old_reg_role_block, new_reg_role_block)
    print("Registration role block updated!")
else:
    print("WARNING: Registration role block not found directly, performing regex replacement...")
    text = re.sub(
        r'<label className="block text-emerald-700 text-xs mb-1 font-bold">CARGO / PROFISSÃO</label>.*?<input.*?type="text".*?required.*?/>\s*</div>',
        new_reg_role_block,
        text,
        flags=re.DOTALL
    )

# 4. Ensure handleRegister defaults role to 'Membro' if empty
text = text.replace("role: regRole,", "role: regRole.trim() || 'Membro',")

# 5. Add 'Alterar Minha Profissão' to showHeaderAdminMenu
admin_menu_target = "<span>Painel de Administração Geral</span>\n                      </button>\n                    )}"
new_admin_menu_entry = """<span>Painel de Administração Geral</span>
                      </button>
                    )}

                    {/* Alterar Profissão option */}
                    <button
                      onClick={() => {
                        setShowHeaderAdminMenu(false);
                        setEditRoleValue(currentUser?.role || '');
                        setShowEditRoleModal(true);
                      }}
                      className="w-full text-left px-2.5 py-2 rounded hover:bg-emerald-900/40 text-emerald-200 transition-colors flex items-center gap-2 font-bold"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Alterar Minha Profissão</span>
                    </button>"""

text = text.replace(admin_menu_target, new_admin_menu_entry)

# 6. Make User Profile Pill clickable
old_profile_pill = """            {/* User Profile Pill */}
            <div className="hidden md:flex items-center gap-1.5 bg-black px-2.5 py-1 rounded-sm border border-emerald-900/60 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
              <span className="text-emerald-100 font-bold truncate max-w-[100px]">{currentUser?.name}</span>
              <span className="text-emerald-500 font-mono border-l border-emerald-900/50 pl-1.5 text-[10px]">ID: {currentUser?.shortId || 'S/ID'}</span>
            </div>"""

new_profile_pill = """            {/* User Profile Pill */}
            <button
              onClick={() => {
                setEditRoleValue(currentUser?.role || '');
                setShowEditRoleModal(true);
              }}
              className="hidden md:flex items-center gap-1.5 bg-black px-2.5 py-1 rounded-sm border border-emerald-900/60 text-xs hover:border-emerald-700 transition-colors cursor-pointer text-left"
              title="Clique para alterar sua profissão / cargo (opcional)"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
              <span className="text-emerald-100 font-bold truncate max-w-[100px]">{currentUser?.name}</span>
              <span className="text-emerald-400 font-mono border-l border-emerald-900/50 pl-1.5 text-[10px] truncate max-w-[120px]">
                {currentUser?.role || 'Membro'}
              </span>
            </button>"""

text = text.replace(old_profile_pill, new_profile_pill)

# 7. Add EditRoleModal before end of App component JSX
edit_role_modal_jsx = """
      {/* Edit Role Modal */}
      {showEditRoleModal && (
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
                <span>ALTERAR CARGO / PROFISSÃO</span>
              </div>
              <button
                onClick={() => setShowEditRoleModal(false)}
                className="text-zinc-500 hover:text-emerald-400 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-zinc-400 text-xs mb-4">
              Digite livremente sua profissão ou especialidade (opcional). Se deixar em branco, seu cargo será definido como <strong className="text-emerald-300">Membro</strong>.
            </p>

            <div className="space-y-3">
              <label className="block text-emerald-500 text-xs font-bold uppercase tracking-wider">
                Profissão / Especialidade
              </label>

              <select
                value={editRoleValue}
                onChange={(e) => setEditRoleValue(e.target.value)}
                className="w-full bg-black border border-emerald-900/80 text-emerald-300 px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-emerald-500 font-sans"
              >
                <option value="">-- Selecione uma opção sugestiva (Opcional) --</option>
                <option value="Desenvolvedor(a) Fullstack">💻 Desenvolvedor(a) Fullstack</option>
                <option value="Desenvolvedor(a) Frontend">💻 Desenvolvedor(a) Frontend</option>
                <option value="Desenvolvedor(a) Backend">💻 Desenvolvedor(a) Backend</option>
                <option value="Desenvolvedor(a) Mobile">📱 Desenvolvedor(a) Mobile (iOS/Android)</option>
                <option value="Engenheiro(a) de Software">⚙️ Engenheiro(a) de Software</option>
                <option value="Designer UI/UX">🎨 UI/UX Designer / Product Designer</option>
                <option value="Analista de QA / Testador(a)">🧪 Analista de QA / Testador(a)</option>
                <option value="Gerente de Projetos / PO">📊 Gerente de Projetos / Product Owner</option>
                <option value="DevOps / Infraestrutura">☁️ DevOps / Engenheiro(a) de Cloud</option>
                <option value="Cientista de Dados / IA">🤖 Cientista de Dados / Especialista em IA</option>
                <option value="Estudante de Tecnologia">🎓 Estudante / Aprendiz de Tecnologia</option>
              </select>

              <input
                type="text"
                value={editRoleValue}
                onChange={(e) => setEditRoleValue(e.target.value)}
                placeholder="Ou digite livremente sua profissão (Opcional)..."
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
                      showAlert(`Sua profissão foi atualizada para "${finalRole}"!`, 'PROFISSAO ATUALIZADA', 'success');
                    } catch (err) {
                      console.error(err);
                      showAlert('Erro ao atualizar profissão.', 'ERRO', 'error');
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
      )}
"""

policy_modal_pos = text.find('{showPolicy && (')
if policy_modal_pos != -1:
    text = text[:policy_modal_pos] + edit_role_modal_jsx + "\n\n      " + text[policy_modal_pos:]
    print("EditRoleModal added before showPolicy!")

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("All updates applied successfully!")
