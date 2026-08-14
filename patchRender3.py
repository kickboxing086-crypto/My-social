import sys

with open('src/App.tsx', 'r') as f:
    code = f.read()

# Replace the view once block
old_view_once = """                  {msg.viewOnce ? (
                    msg.expired && !viewingHidden[msg.id] ? (
                      <div className="flex items-center gap-2 text-zinc-500 italic text-sm py-2">
                        <EyeOff className="w-4 h-4" />
                        Mensagem expirada
                      </div>
                    ) : (msg.sender === currentUser?.username) ? (
                      <div className="flex items-center gap-2 text-emerald-400/70 italic text-sm py-2">
                        <Eye className="w-4 h-4" />
                        Mensagem de visualização única enviada
                      </div>
                    ) : !viewingHidden[msg.id] ? (
                      <button 
                        onClick={() => handleOpenViewOnce(msg)}
                        className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 bg-emerald-950/50 p-2 rounded-sm border border-emerald-900/50 transition-colors w-full justify-center text-sm my-2"
                      >
                        <Eye className="w-4 h-4" />
                        Tocar para visualizar
                      </button>
                    ) : (
                      <div className="animate-in fade-in zoom-in duration-300 relative">
                        <div className="flex items-center gap-2 text-amber-500 text-xs font-bold mb-2 uppercase tracking-wider">
                          <AlertTriangle className="w-3 h-3" />
                          Visualização Única (irá sumir ao recarregar)
                        </div>
                        {msg.text && (
                          <span className="text-emerald-100 text-sm break-words leading-relaxed">
                            {msg.text}
                          </span>
                        )}
                        {msg.attachment && (
                          <div className={`mt-2 bg-black/60 border border-emerald-900/50 p-2 rounded-sm flex flex-col gap-2 ${!msg.text ? 'mt-0' : ''}`}>
                            {msg.attachment.fileType === 'image' && msg.attachment.url ? (
                              <img src={msg.attachment.url} alt="Anexo" className="max-h-48 max-w-full rounded-sm border border-emerald-800/30 object-contain" />
                            ) : msg.attachment.fileType === 'audio' && msg.attachment.url ? (
                              <div className="flex flex-col gap-1 w-full max-w-xs">
                                <span className="text-emerald-300 text-xs truncate max-w-full">{msg.attachment.name}</span>
                                <audio src={msg.attachment.url} controls className="h-10 w-full" />
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    )
                  ) : ("""

new_view_once = """                  {msg.viewOnce ? (
                    msg.expired && !viewingHidden[msg.id] ? (
                      <div className="flex items-center gap-2 text-zinc-500 italic text-sm py-2">
                        <EyeOff className="w-4 h-4" />
                        Mensagem expirada
                      </div>
                    ) : (msg.sender === currentUser?.username) ? (
                      <div className="animate-in fade-in zoom-in duration-300 relative bg-emerald-950/20 p-2 rounded-sm border border-emerald-900/30">
                        <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-bold mb-1 uppercase tracking-wider">
                          <Eye className="w-3 h-3" />
                          Você enviou (Visualização Única)
                        </div>
                        {msg.text && (
                          <span className="text-emerald-100 text-sm break-words leading-relaxed">
                            {msg.text}
                          </span>
                        )}
                        {msg.attachment && (
                          <div className={`mt-2 bg-black/60 border border-emerald-900/50 p-2 rounded-sm flex flex-col gap-2 ${!msg.text ? 'mt-0' : ''}`}>
                            {msg.attachment.fileType === 'image' && msg.attachment.url ? (
                              <img src={msg.attachment.url} alt="Anexo" className="max-h-48 max-w-full rounded-sm border border-emerald-800/30 object-contain" />
                            ) : msg.attachment.fileType === 'audio' && msg.attachment.url ? (
                              <AudioPlayer src={msg.attachment.url} name={msg.attachment.name} />
                            ) : null}
                          </div>
                        )}
                      </div>
                    ) : !viewingHidden[msg.id] ? (
                      <button 
                        onClick={() => handleOpenViewOnce(msg)}
                        className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 bg-emerald-950/50 p-2 rounded-sm border border-emerald-900/50 transition-colors w-full justify-center text-sm my-2 shadow-lg shadow-emerald-900/20 hover:bg-emerald-900/50"
                      >
                        <Eye className="w-4 h-4" />
                        Tocar para visualizar
                      </button>
                    ) : (
                      <div className="animate-in fade-in zoom-in duration-300 relative bg-black/60 p-2 rounded-sm border border-amber-900/30 shadow-inner">
                        <div className="flex items-center gap-2 text-amber-500 text-[10px] font-bold mb-2 uppercase tracking-wider">
                          <AlertTriangle className="w-3 h-3" />
                          Visualização Única (Irá sumir ao fechar)
                        </div>
                        {msg.text && (
                          <span className="text-emerald-100 text-sm break-words leading-relaxed">
                            {msg.text}
                          </span>
                        )}
                        {msg.attachment && (
                          <div className={`mt-2 bg-black/60 border border-emerald-900/50 p-2 rounded-sm flex flex-col gap-2 ${!msg.text ? 'mt-0' : ''}`}>
                            {msg.attachment.fileType === 'image' && msg.attachment.url ? (
                              <img src={msg.attachment.url} alt="Anexo" className="max-h-48 max-w-full rounded-sm border border-emerald-800/30 object-contain" />
                            ) : msg.attachment.fileType === 'audio' && msg.attachment.url ? (
                              <AudioPlayer src={msg.attachment.url} name={msg.attachment.name} />
                            ) : null}
                          </div>
                        )}
                      </div>
                    )
                  ) : ("""

code = code.replace(old_view_once, new_view_once)


old_normal_attachment = """                        {msg.attachment && (
                          <div className={`mt-2 bg-black/60 border border-emerald-900/50 p-2 rounded-sm flex flex-col gap-2 ${!msg.text ? 'mt-0' : ''}`}>
                            {msg.attachment.fileType === 'image' && msg.attachment.url ? (
                              <a href={msg.attachment.url} target="_blank" rel="noreferrer" title="Abrir imagem inteira">
                                <img src={msg.attachment.url} alt="Anexo" className="max-h-48 max-w-full rounded-sm border border-emerald-800/30 object-contain hover:opacity-80 transition-opacity" />
                              </a>
                            ) : msg.attachment.fileType === 'audio' && msg.attachment.url ? (
                              <div className="flex flex-col gap-1 w-full max-w-xs">
                                <span className="text-emerald-300 text-xs truncate max-w-full">{msg.attachment.name}</span>
                                <audio src={msg.attachment.url} controls className="h-10 w-full" />
                              </div>
                            ) : ("""

new_normal_attachment = """                        {msg.attachment && (
                          <div className={`mt-2 bg-black/60 border border-emerald-900/50 p-2 rounded-sm flex flex-col gap-2 ${!msg.text ? 'mt-0' : ''}`}>
                            {msg.attachment.fileType === 'image' && msg.attachment.url ? (
                              <a href={msg.attachment.url} target="_blank" rel="noreferrer" title="Abrir imagem inteira">
                                <img src={msg.attachment.url} alt="Anexo" className="max-h-48 max-w-full rounded-sm border border-emerald-800/30 object-contain hover:opacity-80 transition-opacity" />
                              </a>
                            ) : msg.attachment.fileType === 'audio' && msg.attachment.url ? (
                              <AudioPlayer src={msg.attachment.url} name={msg.attachment.name} />
                            ) : ("""

code = code.replace(old_normal_attachment, new_normal_attachment)

with open('src/App.tsx', 'w') as f:
    f.write(code)

print("patched")
