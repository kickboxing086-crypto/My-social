import sys

with open('src/App.tsx', 'r') as f:
    code = f.read()

# 1. Add motion/react import at top
if "from 'motion/react'" not in code:
    code = "import { motion, AnimatePresence } from 'motion/react';\n" + code

# 2. Add state for confirmDeleteId and customAlert inside App component
state_declarations = """
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [customAlert, setCustomAlert] = useState<{ title: string; message: string; type?: 'error' | 'success' | 'warning' | 'info' } | null>(null);

  const showAlert = (message: string, title: string = 'NOTIFICAÇÃO DO SISTEMA', type: 'error' | 'success' | 'warning' | 'info' = 'info') => {
    setCustomAlert({ title, message, type });
  };
"""

if "const [confirmDeleteId" not in code:
    code = code.replace("const [searchQuery, setSearchQuery] = useState('');", "const [searchQuery, setSearchQuery] = useState('');\n" + state_declarations)

# Replace alerts in code with showAlert
code = code.replace("alert('Esta conta foi banida do sistema HUD DEVS por violação das políticas.');", "showAlert('Esta conta foi banida do sistema HUD DEVS por violação das políticas.', 'ACESSO NEGADO', 'error');")
code = code.replace("alert('A senha deve ter no máximo 6 dígitos.');", "showAlert('A senha deve ter no máximo 6 dígitos.', 'VALIDAÇÃO DE SENHA', 'warning');")
code = code.replace("alert('O nome de usuário já está em uso.');", "showAlert('O nome de usuário já está em uso.', 'REGISTRO RECUSADO', 'warning');")
code = code.replace("alert('Erro ao registrar.');", "showAlert('Ocorreu um erro ao registrar sua conta. Tente novamente.', 'ERRO DE REGISTRO', 'error');")
code = code.replace("alert('Usuário não encontrado.');", "showAlert('Usuário não localizado no banco de dados.', 'FALHA DE AUTENTICAÇÃO', 'error');")
code = code.replace("alert('Senha incorreta.');", "showAlert('Senha incorreta. Verifique suas credenciais.', 'FALHA DE AUTENTICAÇÃO', 'error');")
code = code.replace("alert('Esta conta foi banida por violação das políticas.');", "showAlert('Esta conta foi permanentemente suspensa por violação das diretrizes.', 'CONTA BANIDA', 'error');")
code = code.replace("alert('Erro ao fazer login.');", "showAlert('Falha ao autenticar conexão com o servidor.', 'ERRO DE LOGIN', 'error');")
code = code.replace("alert('ALERTA DE SEGURANÇA: Você violou a política de comunicação (uso de linguajar proibido). Sua conta foi permanentemente banida.');", "showAlert('Você violou as diretrizes de comunicação. Sua conta foi permanentemente banida.', 'BANIMENTO AUTOMÁTICO', 'error');")
code = code.replace('alert("O arquivo é muito grande para ser enviado. O limite é de ~1MB.");', "showAlert('O arquivo excede o limite de tamanho permitido (~1MB).', 'TAMANHO EXCESSIVO', 'warning');")
code = code.replace("alert('Não foi possível acessar o microfone.');", "showAlert('Acesso ao microfone negado ou indisponível no navegador.', 'ERRO DE HARDWARE', 'error');")
code = code.replace("alert(`Denúncia contra ${reportTarget} enviada ao administrador.`);", "showAlert(`Denúncia contra ${reportTarget} registrada com sucesso.`, 'DENÚNCIA ENVIADA', 'success');")
code = code.replace("alert('Sugestão enviada com sucesso para a administração!');", "showAlert('Sua ideia foi transmitida com sucesso para a administração.', 'SUGESTÃO REGISTRADA', 'success');")

# 3. Update handleDeleteMessage
old_delete_fn = """  const handleDeleteMessage = async (msgId: string) => {
    if (confirm('Apagar esta mensagem para todos?')) {
      await deleteDoc(doc(db, 'messages', msgId));
    }
  };"""

new_delete_fn = """  const handleDeleteMessage = (msgId: string) => {
    setConfirmDeleteId(msgId);
  };

  const confirmDeleteAction = async () => {
    if (confirmDeleteId) {
      try {
        await deleteDoc(doc(db, 'messages', confirmDeleteId));
      } catch (err) {
        console.error(err);
      }
      setConfirmDeleteId(null);
    }
  };"""

code = code.replace(old_delete_fn, new_delete_fn)

# 4. Create Luxury Modals methods
modal_renderers = """
  const renderDeleteModal = () => (
    <AnimatePresence>
      {confirmDeleteId && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setConfirmDeleteId(null)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-950 border border-red-900/60 p-6 max-w-md w-full relative shadow-[0_0_50px_rgba(239,68,68,0.25)] rounded-md overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 animate-pulse" />
            
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-950/80 border border-red-800 rounded-full text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                <Trash2 className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-red-400 tracking-wider">CONFIRMAR EXCLUSÃO</h3>
                <p className="text-red-900/90 text-[10px] uppercase font-mono tracking-widest">Protocolo de Segurança</p>
              </div>
            </div>

            <p className="text-zinc-300 text-sm mb-6 leading-relaxed bg-black/50 p-3 rounded border border-red-900/30">
              Deseja realmente apagar esta mensagem permanentemente para todos os membros no chat?
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-sm text-xs font-bold transition-all"
              >
                CANCELAR
              </button>
              <button
                onClick={confirmDeleteAction}
                className="px-5 py-2 bg-red-950 hover:bg-red-900 text-red-200 border border-red-700 rounded-sm text-xs font-bold transition-all hover:scale-105 shadow-[0_0_15px_rgba(220,38,38,0.4)] flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                APAGAR PARA TODOS
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderAlertModal = () => (
    <AnimatePresence>
      {customAlert && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setCustomAlert(null)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className={`bg-zinc-950 p-6 max-w-md w-full relative rounded-md overflow-hidden border shadow-2xl ${
              customAlert.type === 'error' ? 'border-red-900/80 shadow-[0_0_40px_rgba(220,38,38,0.25)]' :
              customAlert.type === 'warning' ? 'border-amber-900/80 shadow-[0_0_40px_rgba(245,158,11,0.25)]' :
              customAlert.type === 'success' ? 'border-emerald-900/80 shadow-[0_0_40px_rgba(16,185,129,0.25)]' :
              'border-blue-900/80 shadow-[0_0_40px_rgba(59,130,246,0.25)]'
            }`}
          >
            <div className={`absolute top-0 left-0 w-full h-1 ${
              customAlert.type === 'error' ? 'bg-red-500' :
              customAlert.type === 'warning' ? 'bg-amber-500' :
              customAlert.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
            }`} />

            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2.5 rounded-full border ${
                customAlert.type === 'error' ? 'bg-red-950/80 border-red-800 text-red-400' :
                customAlert.type === 'warning' ? 'bg-amber-950/80 border-amber-800 text-amber-400' :
                customAlert.type === 'success' ? 'bg-emerald-950/80 border-emerald-800 text-emerald-400' :
                'bg-blue-950/80 border-blue-800 text-blue-400'
              }`}>
                {customAlert.type === 'error' && <AlertTriangle className="w-5 h-5" />}
                {customAlert.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                {customAlert.type === 'success' && <Check className="w-5 h-5" />}
                {(!customAlert.type || customAlert.type === 'info') && <ShieldAlert className="w-5 h-5" />}
              </div>
              <div>
                <h3 className={`text-base font-extrabold tracking-wider uppercase ${
                  customAlert.type === 'error' ? 'text-red-400' :
                  customAlert.type === 'warning' ? 'text-amber-400' :
                  customAlert.type === 'success' ? 'text-emerald-400' : 'text-blue-400'
                }`}>
                  {customAlert.title}
                </h3>
              </div>
            </div>

            <p className="text-zinc-300 text-sm mb-6 leading-relaxed bg-black/60 p-3 rounded border border-zinc-800/80 font-sans">
              {customAlert.message}
            </p>

            <button
              onClick={() => setCustomAlert(null)}
              className={`w-full py-2.5 rounded-sm text-xs font-bold transition-all uppercase tracking-widest ${
                customAlert.type === 'error' ? 'bg-red-950 hover:bg-red-900 text-red-200 border border-red-800' :
                customAlert.type === 'warning' ? 'bg-amber-950 hover:bg-amber-900 text-amber-200 border border-amber-800' :
                customAlert.type === 'success' ? 'bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-800' :
                'bg-blue-950 hover:bg-blue-900 text-blue-200 border border-blue-800'
              }`}
            >
              ENTENDIDO
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
"""

if "const renderDeleteModal =" not in code:
    code = code.replace("  // --- MODALS ---", "  // --- MODALS ---\n" + modal_renderers)

# Replace Privacy, Report, Suggestion render functions with Motion wrappers
# Let's check renderPrivacyPolicy
code = code.replace('<div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">', '<AnimatePresence><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowPolicy(false)}><motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: "spring", stiffness: 350, damping: 25 }} onClick={(e) => e.stopPropagation()} className="bg-zinc-950 border border-emerald-900/60 p-6 max-w-lg w-full relative shadow-[0_0_50px_rgba(16,185,129,0.2)] rounded-md">')

# Modify closing div for Policy
# Wait, let's keep renderPrivacyPolicy, renderReportModal, renderSuggestionModal wrapped cleanly using Python replacement

with open('src/App.tsx', 'w') as f:
    f.write(code)

print("Applied initial python patch")
