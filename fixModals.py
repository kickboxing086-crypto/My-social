with open('src/App.tsx', 'r') as f:
    code = f.read()

# Replace Privacy Policy function
privacy_code = """  const renderPrivacyPolicy = () => (
    <AnimatePresence>
      {showPolicy && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4" 
          onClick={() => setShowPolicy(false)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.88, y: 15 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.88, y: 15 }} 
            transition={{ type: "spring", stiffness: 350, damping: 25 }} 
            onClick={(e) => e.stopPropagation()} 
            className="bg-zinc-950 border border-emerald-900/60 p-6 max-w-lg w-full relative shadow-[0_0_50px_rgba(16,185,129,0.2)] rounded-md"
          >
            <button onClick={() => setShowPolicy(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-emerald-400">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <ShieldAlert className="w-6 h-6 text-emerald-500" />
              <h2 className="text-xl font-bold text-emerald-400">Políticas de Privacidade & Conduta</h2>
            </div>
            <div className="space-y-4 text-emerald-100/70 text-sm h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-emerald-900">
              <p>Bem-vindo ao HUD DEVS. Ao utilizar nossa rede, você concorda com os seguintes termos:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Armazenamento de Dados:</strong> Seus dados de perfil, anexos e mensagens são armazenados de forma segura em nuvem para fins de sincronização entre dispositivos.</li>
                <li><strong>Tolerância Zero para Palavrões:</strong> O sistema possui um filtro autônomo. O uso de palavras de baixo calão resultará em banimento imediato e irreversível da sua conta.</li>
                <li><strong>Denúncias:</strong> Você pode reportar comportamentos inadequados de outros usuários. Todas as denúncias são encaminhadas diretamente para a administração global (Samuel123).</li>
                <li><strong>Finalidade:</strong> Esta rede é estritamente profissional. Mantenha o decoro e foque no desenvolvimento.</li>
              </ul>
            </div>
            <button onClick={() => setShowPolicy(false)} className="mt-6 w-full py-2 bg-emerald-900/40 hover:bg-emerald-800 text-emerald-300 border border-emerald-700 font-bold transition-colors">
              EU COMPREENDO
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );"""

report_code = """  const renderReportModal = () => (
    <AnimatePresence>
      {!!reportTarget && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4" 
          onClick={() => { setReportTarget(null); setReportReason(''); }}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.88, y: 15 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.88, y: 15 }} 
            transition={{ type: "spring", stiffness: 350, damping: 25 }} 
            onClick={(e) => e.stopPropagation()} 
            className="bg-zinc-950 border border-red-900/60 p-6 max-w-md w-full relative shadow-[0_0_50px_rgba(239,68,68,0.2)] rounded-md"
          >
            <button onClick={() => { setReportTarget(null); setReportReason(''); }} className="absolute top-4 right-4 text-zinc-500 hover:text-red-400">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <Flag className="w-6 h-6 text-red-500" />
              <h2 className="text-lg font-bold text-red-400">Denunciar Usuário</h2>
            </div>
            <p className="text-zinc-400 text-sm mb-4">
              Reportando o usuário <strong className="text-white">[{reportTarget}]</strong>. Descreva o motivo abaixo:
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              maxLength={120}
              placeholder="Motivo (máx. 120 caracteres)"
              className="w-full bg-black border border-red-900/30 text-red-100 p-3 mb-2 h-24 resize-none focus:outline-none focus:border-red-500 rounded"
            />
            <div className="text-right text-xs text-red-900/50 mb-4">{reportReason.length}/120</div>
            
            <button 
              onClick={submitReport}
              disabled={!reportReason.trim()}
              className="w-full py-2 bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 font-bold transition-colors disabled:opacity-50 rounded"
            >
              ENVIAR DENÚNCIA
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );"""

suggestion_code = """  const renderSuggestionModal = () => (
    <AnimatePresence>
      {showSuggestionModal && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4" 
          onClick={() => { setShowSuggestionModal(false); setSuggestionText(''); }}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.88, y: 15 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.88, y: 15 }} 
            transition={{ type: "spring", stiffness: 350, damping: 25 }} 
            onClick={(e) => e.stopPropagation()} 
            className="bg-zinc-950 border border-blue-900/60 p-6 max-w-md w-full relative shadow-[0_0_50px_rgba(59,130,246,0.2)] rounded-md"
          >
            <button onClick={() => { setShowSuggestionModal(false); setSuggestionText(''); }} className="absolute top-4 right-4 text-zinc-500 hover:text-blue-400">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="w-6 h-6 text-blue-500" />
              <h2 className="text-lg font-bold text-blue-400">Enviar Sugestão</h2>
            </div>
            <p className="text-zinc-400 text-sm mb-4">
              Tem alguma ideia de melhoria para o HUD DEVS? Envie diretamente para a administração.
            </p>
            <textarea
              value={suggestionText}
              onChange={(e) => setSuggestionText(e.target.value)}
              placeholder="Descreva sua sugestão..."
              className="w-full bg-black border border-blue-900/30 text-blue-100 p-3 mb-4 h-32 resize-none focus:outline-none focus:border-blue-500 rounded"
            />
            <button 
              onClick={submitSuggestion}
              disabled={!suggestionText.trim()}
              className="w-full py-2 bg-blue-950/60 hover:bg-blue-900 text-blue-300 border border-blue-800 font-bold transition-colors disabled:opacity-50 rounded"
            >
              TRANSMITIR IDEIA
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );"""

# Replace in code from 'const renderPrivacyPolicy' to '// --- VIEWS ---'
start_idx = code.find('const renderPrivacyPolicy = () => (')
end_idx = code.find('// --- VIEWS ---')

if start_idx != -1 and end_idx != -1:
    code = code[:start_idx] + privacy_code + "\n\n" + report_code + "\n\n" + suggestion_code + "\n\n" + code[end_idx:]

with open('src/App.tsx', 'w') as f:
    f.write(code)

print("Cleaned up modals in App.tsx")
