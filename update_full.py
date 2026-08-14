import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# --- 1. Clean Mojibake encoding remnants ---
mojibake_map = [
    ('AÃ‡ÃƒO', 'AÇÃO'),
    ('PERMISSÃƒO', 'PERMISSÃO'),
    ('VALIDAÃ‡ÃƒO', 'VALIDAÇÃO'),
    ('USUÃ RIOS', 'USUÁRIOS'),
    ('CONCLUÃ DA', 'CONCLUÍDA'),
    ('REGISTRO NEGADO', 'REGISTRO NEGADO'),
    ('MÃ X', 'MÁX'),
    ('DÃ GITOS', 'DÍGITOS'),
    ('VocÃª', 'Você'),
    ('vocÃª', 'você'),
    ('estÃ¡', 'está'),
    ('nÃ£o', 'não'),
    ('invÃ¡lido', 'inválido'),
    ('usuÃ¡rio', 'usuário'),
    ('UsuÃ¡rio', 'Usuário'),
    ('LÃ­der', 'Líder'),
    ('ÃšNICO', 'ÚNICO'),
]

for bad, good in mojibake_map:
    text = text.replace(bad, good)

# --- 2. Update handleSendMessage for message editing ---
old_send_block = """  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !currentUser) return;

    if (currentUser.isBanned) {
      showAlert('Sua conta está BANIDA nesta comunidade. Você está impedido de enviar qualquer tipo de mensagem.', 'CONTA BANIDA', 'warning');
      setShowAppealModal(true);
      return;
    }

    const textToSend = inputValue.trim();
    if (checkProfanity(textToSend)) {
      await executeAutoBan(textToSend);
      return;
    }

    await addDoc(collection(db, 'messages'), {
      sender: currentUser.username,
      role: currentUser.role,
      text: textToSend,
      type: 'user',
      viewOnce: isViewOnce,
      expired: false,
      groupId: currentGroupId || "global",
      timestamp: serverTimestamp()
    });
    
    setInputValue('');
    setIsViewOnce(false);
  };"""

new_send_block = """  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !currentUser) return;

    if (currentUser.isBanned) {
      showAlert('Sua conta está BANIDA nesta comunidade. Você está impedido de enviar qualquer tipo de mensagem.', 'CONTA BANIDA', 'warning');
      setShowAppealModal(true);
      return;
    }

    const textToSend = inputValue.trim();
    if (checkProfanity(textToSend)) {
      await executeAutoBan(textToSend);
      return;
    }

    if (editingMessageId) {
      const msgToEdit = messages.find(m => m.id === editingMessageId);
      if (msgToEdit) {
        const currentCount = msgToEdit.editCount || 0;
        if (currentCount >= 2) {
          showAlert('Esta mensagem já foi editada 2 vezes (limite máximo atingido).', 'LIMITE DE EDIÇÃO', 'warning');
          setEditingMessageId(null);
          setInputValue('');
          return;
        }
        await updateDoc(doc(db, 'messages', editingMessageId), {
          text: textToSend,
          isEdited: true,
          editCount: currentCount + 1
        });
        showAlert('Mensagem editada com sucesso!', 'SUCESSO', 'success');
      }
      setEditingMessageId(null);
    } else {
      await addDoc(collection(db, 'messages'), {
        sender: currentUser.username,
        role: currentUser.role,
        text: textToSend,
        type: 'user',
        viewOnce: isViewOnce,
        expired: false,
        groupId: currentGroupId || "global",
        timestamp: serverTimestamp()
      });
    }
    
    setInputValue('');
    setIsViewOnce(false);
  };"""

if old_send_block in text:
    text = text.replace(old_send_block, new_send_block)
    print("Updated handleSendMessage!")

# --- 3. Update Group Header to include direct Copy / Share Link button for all members ---
old_group_header = """        {/* Group Info Header (if inside a group) */}
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
        )}"""

new_group_header = """        {/* Group Info Header (if inside a group) */}
        {currentGroupId && (
          <div className="bg-emerald-950/30 border-b border-emerald-900/30 p-2 px-4 flex items-center justify-between text-xs shrink-0 relative z-10">
            <div className="flex items-center gap-2 text-emerald-400 min-w-0">
              <Users className="w-4 h-4 shrink-0" />
              <span className="font-bold truncate">{groups.find(g => g.id === currentGroupId)?.name}</span>
              <span className="opacity-60 hidden sm:inline truncate">- {groups.find(g => g.id === currentGroupId)?.description}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  const currentGrp = groups.find(g => g.id === currentGroupId);
                  if (currentGrp) copyOrShareGroupLink(currentGrp);
                }}
                className="bg-emerald-900/80 border border-emerald-700/80 px-2 py-1 rounded-sm text-emerald-200 hover:bg-emerald-800 transition-colors flex items-center gap-1 font-bold"
                title="Compartilhar Link do Grupo"
              >
                <LinkIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Convidar</span>
              </button>
              {groups.find(g => g.id === currentGroupId)?.owners.includes(currentUser?.username || '') && (
                <button 
                  onClick={() => setGroupSettingsTarget(groups.find(g => g.id === currentGroupId) || null)}
                  className="bg-emerald-950 border border-emerald-800 px-2 py-1 rounded-sm text-emerald-300 hover:bg-emerald-900 transition-colors flex items-center gap-1 font-bold"
                >
                  <Crown className="w-3 h-3 text-amber-400" />
                  Gerenciar
                </button>
              )}
            </div>
          </div>
        )}"""

if old_group_header in text:
    text = text.replace(old_group_header, new_group_header)
    print("Updated Group Header!")

# --- 4. Update Group Settings Modal Link Box ---
old_group_link_box = """                  <h3 className="text-emerald-600 text-xs font-bold mb-2">LINK DE CONVITE</h3>
                  <div className="flex items-center gap-2">
                    <input type="text" readOnly value={`${window.location.origin}?invite=${groupSettingsTarget.inviteCode}`} className="w-full bg-zinc-900 border border-emerald-900/50 p-2 text-emerald-300 text-xs focus:outline-none rounded-sm font-mono" />
                    <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}?invite=${groupSettingsTarget.inviteCode}`); showAlert('Link copiado!', 'SUCESSO', 'success'); }} className="bg-emerald-900 hover:bg-emerald-800 text-emerald-100 p-2 rounded-sm shrink-0" title="Copiar Link">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>"""

new_group_link_box = """                  <h3 className="text-emerald-400 text-xs font-bold mb-2 uppercase tracking-wider">LINK DE CONVITE DO GRUPO</h3>
                  <div className="flex items-center gap-2">
                    <input type="text" readOnly value={`${window.location.origin}${window.location.pathname}?invite=${groupSettingsTarget.inviteCode}`} className="w-full bg-black border border-emerald-900/80 p-2 text-emerald-300 text-xs focus:outline-none rounded-sm font-mono" />
                    <button onClick={() => copyOrShareGroupLink(groupSettingsTarget)} className="bg-emerald-800 hover:bg-emerald-700 text-emerald-100 px-3 py-2 rounded-sm shrink-0 flex items-center gap-1.5 text-xs font-bold transition-colors" title="Compartilhar ou Copiar Link">
                      <LinkIcon className="w-4 h-4" />
                      <span>Compartilhar</span>
                    </button>
                  </div>"""

if old_group_link_box in text:
    text = text.replace(old_group_link_box, new_group_link_box)
    print("Updated Group Settings Link Box!")

# --- 5. Update Registration Role / Occupation Selection ---
old_reg_role_field = """              <div>
                <label className="block text-emerald-700 text-xs mb-1 font-bold">CARGO / ESPECIALIDADE</label>
                <input
                  type="text"
                  required
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  placeholder="Ex: Backend, QA, UI/UX"
                  className="w-full bg-zinc-900/50 border border-emerald-900/50 text-emerald-300 px-4 py-2 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>"""

new_reg_role_field = """              <div>
                <label className="block text-emerald-400 text-xs mb-1 font-bold uppercase tracking-wider">
                  SUA PROFISSÃO / CARGO / ÁREA DE ATUAÇÃO
                </label>
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

if old_reg_role_field in text:
    text = text.replace(old_reg_role_field, new_reg_role_field)
    print("Updated Registration Role Selection!")

# --- 6. Add Edit Cancel Banner above chat input form ---
old_form_start = """          <form onSubmit={handleSendMessage} className="flex items-end gap-1.5 sm:gap-2 relative">"""

new_form_start = """          {editingMessageId && (
            <div className="bg-amber-950/90 border border-amber-800/90 p-2 px-3 rounded-t-sm flex items-center justify-between text-xs text-amber-200 mb-1">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-bold">Editando mensagem (máximo 2 edições permitidas)</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingMessageId(null);
                  setInputValue('');
                }}
                className="text-amber-400 hover:text-amber-100 font-bold underline text-xs"
              >
                Cancelar
              </button>
            </div>
          )}
          <form onSubmit={handleSendMessage} className="flex items-end gap-1.5 sm:gap-2 relative">"""

if old_form_start in text:
    text = text.replace(old_form_start, new_form_start)
    print("Added Edit Cancel Banner!")

# --- 7. Add Edit Button & (editada) indicator on Message card ---
old_delete_btn = """                  {(msg.sender === currentUser?.username || isAdmin) && (
                    <button 
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="absolute -top-3 -right-2 sm:-right-3 bg-red-900 border border-red-700 text-red-200 p-1.5 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-red-800 z-10 shadow-lg"
                      title="Apagar mensagem"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}"""

new_delete_btn = """                  {(msg.sender === currentUser?.username || isAdmin) && (
                    <div className="absolute -top-3 -right-2 sm:-right-3 flex items-center gap-1 z-10">
                      {msg.sender === currentUser?.username && !msg.viewOnce && (
                        <button
                          onClick={() => {
                            const editCount = msg.editCount || 0;
                            if (editCount >= 2) {
                              showAlert('Esta mensagem já foi editada 2 vezes (limite máximo atingido).', 'LIMITE DE EDIÇÃO', 'warning');
                              return;
                            }
                            setEditingMessageId(msg.id);
                            setInputValue(msg.text || '');
                            if (textareaRef.current) {
                              textareaRef.current.focus();
                            }
                          }}
                          className="bg-zinc-900 border border-emerald-700 text-emerald-300 p-1.5 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-emerald-900 shadow-lg"
                          title={`Editar mensagem (${2 - (msg.editCount || 0)} edições restantes)`}
                        >
                          <Code className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="bg-red-900 border border-red-700 text-red-200 p-1.5 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-red-800 shadow-lg"
                        title="Apagar mensagem"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}"""

if old_delete_btn in text:
    text = text.replace(old_delete_btn, new_delete_btn)
    print("Added Edit Button on message card!")

# Render (editada) indicator next to message text
old_msg_text = """                        {msg.text && (
                          <span className="text-emerald-100 text-sm break-words leading-relaxed whitespace-pre-wrap">
                            {msg.text}
                          </span>
                        )}"""

new_msg_text = """                        {msg.text && (
                          <div className="flex items-baseline flex-wrap gap-1">
                            <span className="text-emerald-100 text-sm break-words leading-relaxed whitespace-pre-wrap">
                              {msg.text}
                            </span>
                            {msg.isEdited && (
                              <span className="text-[10px] text-zinc-400 italic">
                                (editada{msg.editCount ? ` ${msg.editCount}x` : ''})
                              </span>
                            )}
                          </div>
                        )}"""

if old_msg_text in text:
    text = text.replace(old_msg_text, new_msg_text)
    print("Added (editada) tag on message text!")

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Finished applying all updates to App.tsx!")
