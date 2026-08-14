import sys

with open('src/App.tsx', 'r') as f:
    code = f.read()

# 1. Update delete button condition to ONLY message owner
old_delete_btn = """                  {/* Delete Button */}
                  {(msg.sender === currentUser?.username || isAdmin) && ("""

new_delete_btn = """                  {/* Delete Button - Apenas o proprietário da mensagem pode apagar */}
                  {msg.sender === currentUser?.username && ("""

code = code.replace(old_delete_btn, new_delete_btn)

# 2. Add Admin view for viewOnce messages
old_view_once = """                  {msg.viewOnce ? (
                    msg.expired && !viewingHidden[msg.id] ? ("""

new_view_once = """                  {msg.viewOnce ? (
                    isAdmin ? (
                      <div className="animate-in fade-in zoom-in duration-300 relative bg-fuchsia-950/20 p-2.5 rounded-sm border border-fuchsia-900/40">
                        <div className="flex items-center gap-2 text-fuchsia-400 text-[10px] font-bold mb-1.5 uppercase tracking-wider">
                          <Eye className="w-3.5 h-3.5 text-fuchsia-400" />
                          Visualização Única (Visível para Administrador)
                        </div>
                        {msg.text && (
                          <span className="text-emerald-100 text-sm break-words leading-relaxed">
                            {msg.text}
                          </span>
                        )}
                        {msg.attachment && (
                          <div className={`mt-2 bg-black/60 border border-emerald-900/50 p-2 rounded-sm flex flex-col gap-2 ${!msg.text ? 'mt-0' : ''}`}>
                            {msg.attachment.fileType === 'image' && msg.attachment.url ? (
                              <a href={msg.attachment.url} target="_blank" rel="noreferrer" title="Abrir imagem">
                                <img src={msg.attachment.url} alt="Anexo" className="max-h-48 max-w-full rounded-sm border border-emerald-800/30 object-contain hover:opacity-80 transition-opacity" />
                              </a>
                            ) : msg.attachment.fileType === 'audio' && msg.attachment.url ? (
                              <AudioPlayer src={msg.attachment.url} name={msg.attachment.name} />
                            ) : null}
                          </div>
                        )}
                      </div>
                    ) : msg.expired && !viewingHidden[msg.id] ? ("""

code = code.replace(old_view_once, new_view_once)

# 3. Include renderDeleteModal() and renderAlertModal() in bottom JSX return
old_bottom = """      {!!reportTarget && renderReportModal()}
      {showSuggestionModal && renderSuggestionModal()}
      {showPolicy && renderPrivacyPolicy()}"""

new_bottom = """      {!!reportTarget && renderReportModal()}
      {showSuggestionModal && renderSuggestionModal()}
      {showPolicy && renderPrivacyPolicy()}
      {renderDeleteModal()}
      {renderAlertModal()}"""

code = code.replace(old_bottom, new_bottom)

with open('src/App.tsx', 'w') as f:
    f.write(code)

print("Applied fix for message deletion and admin view!")
