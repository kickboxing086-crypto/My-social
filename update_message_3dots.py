import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

start_str = "{(msg.sender === currentUser?.username || isAdmin) && ("
pos_start = text.find(start_str, text.find("// --- CHAT VIEW ---"))

pos_pin = text.find("handleTogglePinMessage(msg.id, !!msg.isPinned)", pos_start)
pos_pin_end = text.find("</button>", pos_pin) + len("</button>")

# Find where the user role and sender name are placed
new_message_header = """{/* 3-Dots Message Context Menu Button */}
                  <div className="absolute -top-2.5 right-2 z-10">
                    <button
                      onClick={() => setOpenMessageMenuId(openMessageMenuId === msg.id ? null : msg.id)}
                      className="bg-zinc-900/90 hover:bg-emerald-950 border border-emerald-800/80 text-emerald-400 p-1 rounded-full shadow-lg transition-colors opacity-90 hover:opacity-100"
                      title="Opções da Mensagem"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {/* Popover Dropdown Menu */}
                    {openMessageMenuId === msg.id && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-zinc-950 border border-emerald-800 rounded shadow-2xl p-1 z-50 space-y-1 font-mono text-xs">
                        {/* Edit Message option */}
                        {msg.sender === currentUser?.username && !msg.viewOnce && (
                          <button
                            onClick={() => {
                              setOpenMessageMenuId(null);
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
                            className="w-full text-left px-2.5 py-1.5 rounded hover:bg-emerald-950/60 text-emerald-300 flex items-center gap-2 font-bold"
                          >
                            <Code className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Editar Mensagem</span>
                          </button>
                        )}

                        {/* Toggle Pin option (Admin Only) */}
                        {isAdmin && (
                          <button
                            onClick={() => {
                              setOpenMessageMenuId(null);
                              handleTogglePinMessage(msg.id, !!msg.isPinned);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded hover:bg-emerald-950/60 text-emerald-300 flex items-center gap-2 font-bold"
                          >
                            {msg.isPinned ? <PinOff className="w-3.5 h-3.5 text-amber-400" /> : <Pin className="w-3.5 h-3.5 text-emerald-400" />}
                            <span>{msg.isPinned ? 'Desafixar Mensagem' : 'Fixar Mensagem'}</span>
                          </button>
                        )}

                        {/* Report option */}
                        {msg.sender !== currentUser?.username && (
                          <button
                            onClick={() => {
                              setOpenMessageMenuId(null);
                              setReportTarget(msg.sender);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded hover:bg-amber-950/60 text-amber-300 flex items-center gap-2 font-bold"
                          >
                            <Flag className="w-3.5 h-3.5 text-amber-400" />
                            <span>Denunciar Usuário</span>
                          </button>
                        )}

                        {/* Delete option */}
                        {(msg.sender === currentUser?.username || isAdmin) && (
                          <button
                            onClick={() => {
                              setOpenMessageMenuId(null);
                              handleDeleteMessage(msg.id);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded hover:bg-red-950/60 text-red-300 flex items-center gap-2 font-bold"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            <span>Apagar Mensagem</span>
                          </button>
                        )}

                        {/* Admin Purge option */}
                        {isAdmin && (
                          <button
                            onClick={() => {
                              setOpenMessageMenuId(null);
                              setConfirmPurgeId(msg.id);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded hover:bg-red-950/80 text-red-400 flex items-center gap-2 font-bold border-t border-red-900/40"
                          >
                            <Gavel className="w-3.5 h-3.5 text-red-500" />
                            <span>Expurgar do Banco</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2 mb-2 pr-6">
                    <span className="text-fuchsia-400 text-[10px] uppercase font-bold tracking-wider border border-fuchsia-900/50 bg-fuchsia-950/30 px-1.5 py-0.5 rounded-sm">
                      {msg.role}
                    </span>
                    <span className="text-emerald-400 text-xs font-bold">
                      {msg.sender}
                    </span>"""

text = text[:pos_start] + new_message_header + text[pos_pin_end:]

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Message 3-dots context menu added successfully!")
