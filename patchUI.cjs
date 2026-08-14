const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldMessageHTML = `{msg.type === 'user' && (
                <div className="flex flex-col bg-black/40 border border-emerald-900/20 p-3 rounded-sm w-fit max-w-[80%] relative">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-fuchsia-400 text-[10px] uppercase font-bold tracking-wider border border-fuchsia-900/50 bg-fuchsia-950/30 px-1.5 py-0.5 rounded-sm">
                      {msg.role}
                    </span>
                    <span className="text-emerald-400 text-xs font-bold">
                      {msg.sender}
                    </span>
                    
                    {/* Report Button (hidden unless hovered, not shown for own messages or admin) */}
                    {msg.sender !== currentUser?.username && (
                      <button 
                        onClick={() => setReportTarget(msg.sender)}
                        className="ml-2 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Denunciar Usuário"
                      >
                        <Flag className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  
                  {msg.text && (
                    <p className="text-emerald-100/90 text-sm break-words whitespace-pre-wrap">{msg.text}</p>
                  )}

                  {msg.attachment && (
                    <div className={\`mt-2 bg-black/60 border border-emerald-900/50 p-2 rounded-sm flex flex-col gap-2 \${!msg.text ? 'mt-0' : ''}\`}>
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
                </div>
              )}`;

const newMessageHTML = `{msg.type === 'user' && (
                <div className={\`flex flex-col border p-3 rounded-sm w-fit max-w-[80%] relative group \${msg.sender === currentUser?.username ? 'bg-emerald-900/20 border-emerald-800/50 self-end ml-auto' : 'bg-black/40 border-emerald-900/20'}\`}>
                  
                  {/* Delete Button */}
                  {(msg.sender === currentUser?.username || currentUser?.username === 'Samuel123') && (
                    <button 
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="absolute -top-3 -right-3 bg-red-900/80 text-red-300 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-800 z-10"
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
                        className="ml-2 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
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
                          <p className="text-emerald-100/90 text-sm break-words whitespace-pre-wrap">{msg.text}</p>
                        )}
                        {msg.attachment && (
                          <div className={\`mt-2 bg-black/60 border border-emerald-900/50 p-2 rounded-sm flex flex-col gap-2 \${!msg.text ? 'mt-0' : ''}\`}>
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
                        <p className="text-emerald-100/90 text-sm break-words whitespace-pre-wrap">{msg.text}</p>
                      )}

                      {msg.attachment && (
                        <div className={\`mt-2 bg-black/60 border border-emerald-900/50 p-2 rounded-sm flex flex-col gap-2 \${!msg.text ? 'mt-0' : ''}\`}>
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
              )}`;

code = code.replace(oldMessageHTML, newMessageHTML);


const oldInputBar = `<button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 bg-black border border-emerald-800 text-emerald-500 hover:text-emerald-300 hover:bg-emerald-900/30 transition-colors rounded-sm flex items-center justify-center"
              title="Anexar Arquivo"
            >
              <Paperclip className="w-4 h-4" />
            </button>`;

const newInputBar = `<button
              type="button"
              onClick={() => setIsViewOnce(!isViewOnce)}
              className={\`px-3 bg-black border transition-colors rounded-sm flex items-center justify-center \${isViewOnce ? 'border-amber-700 text-amber-500 hover:bg-amber-900/30' : 'border-emerald-800 text-emerald-500 hover:text-emerald-300 hover:bg-emerald-900/30'}\`}
              title="Mensagem de Visualização Única"
            >
              {isViewOnce ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 bg-black border border-emerald-800 text-emerald-500 hover:text-emerald-300 hover:bg-emerald-900/30 transition-colors rounded-sm flex items-center justify-center"
              title="Anexar Arquivo"
            >
              <Paperclip className="w-4 h-4" />
            </button>`;

code = code.replace(oldInputBar, newInputBar);

fs.writeFileSync('src/App.tsx', code);
