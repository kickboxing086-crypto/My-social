import sys

with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

new_block = """              {msg.type === 'user' && (
                <div className={`flex flex-col border p-3 rounded-sm w-fit max-w-[88%] sm:max-w-[80%] relative group mt-2 ${msg.sender === currentUser?.username ? 'bg-emerald-900/20 border-emerald-800/50 self-end ml-auto' : 'bg-black/40 border-emerald-900/20'}`}>
                  
                  {/* Delete Button */}
                  {(msg.sender === currentUser?.username || isAdmin) && (
                    <button 
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="absolute -top-3 -right-2 sm:-right-3 bg-red-900 border border-red-700 text-red-200 p-1.5 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-red-800 z-10 shadow-lg"
                      title="Apagar mensagem"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-fuchsia-400 text-[10px] uppercase font-bold tracking-wider border border-fuchsia-900/50 bg-fuchsia-950/30 px-1.5 py-0.5 rounded-sm">
                      {msg.role}
                    </span>
                    <span className="text-emerald-400 text-xs font-bold">
                      {msg.sender}
                    </span>
                    
                    {/* Report Button */}
                    {msg.sender !== currentUser?.username && (
                      <button 
                        onClick={() => setReportTarget(msg.sender)}
                        className="ml-2 text-zinc-500 hover:text-red-400 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1"
                        title="Denunciar Usuário"
                      >
                        <Flag className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  
                  {msg.viewOnce ? (
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
                  ) : (
                    <>
                      {msg.text && (
                        <span className="text-emerald-100 text-sm break-words leading-relaxed">
                          {msg.text}
                        </span>
                      )}
                      {msg.attachment && (
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
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-emerald-950/50 rounded-sm">
                                {msg.attachment.fileType === 'audio' && <Play className="w-4 h-4 text-emerald-400" />}
                                {msg.attachment.fileType === 'image' && <ImageIcon className="w-4 h-4 text-blue-400" />}
                                {msg.attachment.fileType === 'document' && <FileText className="w-4 h-4 text-zinc-400" />}
                              </div>
                              {msg.attachment.url ? (
                                <a href={msg.attachment.url} download={msg.attachment.name} className="text-emerald-300 text-xs truncate max-w-[200px] hover:underline cursor-pointer">
                                  {msg.attachment.name}
                                </a>
                              ) : (
                                <span className="text-emerald-300 text-xs truncate max-w-[200px]">
                                  {msg.attachment.name} (antigo, não pode ser aberto)
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}\n"""

# Replace lines 852 to 911 (index 852 to 911)
lines[852:912] = [new_block]

with open('src/App.tsx', 'w') as f:
    f.writelines(lines)

print('Success')
