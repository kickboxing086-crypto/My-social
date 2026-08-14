with open('src/App.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find("if (view === 'admin' && isAdmin) {")
if pos != -1:
    end_pos = text.find("// --- CHAT VIEW ---", pos)
    if end_pos != -1:
        old_admin_view = text[pos:end_pos]
        
        new_admin_view = """if (view === 'admin' && isAdmin) {
    const filteredReports = adminCaseFilter === 'my_cases' 
      ? reports.filter(r => r.assignedAdmin === currentUser?.username) 
      : reports;

    const filteredSuggestions = adminCaseFilter === 'my_cases' 
      ? suggestions.filter(s => s.assignedAdmin === currentUser?.username) 
      : suggestions;

    const filteredAppeals = adminCaseFilter === 'my_cases' 
      ? appeals.filter(a => a.assignedAdmin === currentUser?.username) 
      : appeals;

    return (
      <div className="min-h-[100dvh] bg-black text-emerald-400 font-mono flex flex-col items-center sm:p-4">
        <div className="w-full max-w-6xl h-[95vh] flex flex-col border border-emerald-900/50 bg-zinc-950 rounded-sm relative shadow-2xl">
          <header className="bg-zinc-900 border-b border-emerald-900/50 p-4 flex justify-between items-center shrink-0 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-fuchsia-500" />
              <div>
                <h1 className="font-bold tracking-wider text-emerald-300 text-sm sm:text-base">
                  {isGeneralAdmin ? 'PAINEL DE ADMINISTRAÇÃO GERAL' : 'CENTRAL DE MODERAÇÃO & ATENDIMENTO'}
                </h1>
                <div className="mt-1">
                  {renderRoleBadge(currentUser?.role, currentUser?.username)}
                </div>
              </div>
            </div>
            <button onClick={() => setView('chat')} className="flex items-center gap-2 text-emerald-400 hover:text-emerald-200 transition-colors text-xs font-bold bg-black px-4 py-2 border border-emerald-900/50 rounded-sm">
              <ArrowLeft className="w-4 h-4" />
              VOLTAR AO MY SOCIAL
            </button>
          </header>

          {/* Random Case Assignment Filter Bar */}
          <div className="bg-zinc-900/80 border-b border-emerald-900/50 p-3 px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Filtrar Sorteio:</span>
              <div className="flex items-center bg-black border border-emerald-900/80 rounded p-0.5">
                <button
                  onClick={() => setAdminCaseFilter('all')}
                  className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
                    adminCaseFilter === 'all'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  🌐 Todos os Casos ({reports.length + suggestions.length + appeals.length})
                </button>
                <button
                  onClick={() => setAdminCaseFilter('my_cases')}
                  className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
                    adminCaseFilter === 'my_cases'
                      ? 'bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-700 shadow-[0_0_10px_rgba(217,70,239,0.3)]'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  🎯 Meus Casos Atribuídos (@{currentUser?.username})
                </button>
              </div>
            </div>
            {!isGeneralAdmin && (
              <div className="text-[11px] text-amber-300/90 bg-amber-950/40 border border-amber-800/50 px-3 py-1 rounded">
                <strong>Perfil Administrador:</strong> Responsável por Denúncias, Sugestões e Banimentos.
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Reports Section */}
            <div className="bg-black border border-emerald-900/30 rounded-sm p-4 flex flex-col">
              <h2 className="text-lg font-bold text-red-400 border-b border-red-900/30 pb-2 mb-4 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  DENÚNCIAS & AUTO-MODERAÇÃO ({filteredReports.length})
                </span>
              </h2>
              <div className="space-y-4 overflow-y-auto pr-2 scrollbar-thin">
                {filteredReports.length === 0 ? (
                  <p className="text-zinc-600 text-sm italic">Nenhuma denúncia nesta visualização.</p>
                ) : (
                  filteredReports.map(rep => (
                    <div key={rep.id} className="bg-zinc-900/80 border border-red-900/30 p-3 rounded-sm flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex justify-between items-start mb-2 gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-sm ${
                              rep.type === 'profanity'
                                ? 'bg-red-950/80 border border-red-800 text-red-400'
                                : rep.type === 'auto_moderation'
                                ? 'bg-fuchsia-950/80 border border-fuchsia-800 text-fuchsia-300'
                                : 'bg-orange-950/80 border border-orange-800 text-orange-400'
                            }`}>
                              {rep.type === 'profanity' ? 'AUTO-BANIMENTO' : rep.type === 'auto_moderation' ? 'MODERAÇÃO AUTO' : 'DENÚNCIA'}
                            </span>
                            <span className="text-[10px] bg-indigo-950/80 text-indigo-300 border border-indigo-800/80 px-2 py-0.5 rounded font-mono font-bold">
                              🎯 Sorteado: @{rep.assignedAdmin || 'Geral'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {formatTimestamp(rep.timestamp) && (
                              <span className="text-[10px] text-zinc-500 font-mono">
                                {formatTimestamp(rep.timestamp)}
                              </span>
                            )}
                            <button
                              onClick={() => handleDeleteReport(rep)}
                              className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-950/50 border border-transparent hover:border-red-900/50 rounded transition-colors"
                              title="Excluir denúncia da lista"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-zinc-300 text-sm mb-1">
                          Alvo: <span className="text-white font-bold">@{rep.reportedUser}</span>
                        </p>
                        <p className="text-zinc-500 text-xs mb-2">Reportado por: @{rep.reportedBy}</p>
                        <div className="bg-black p-2.5 text-red-200 text-xs italic border-l-2 border-red-900/50 mb-2 rounded-sm break-words">
                          "{rep.reason}"
                        </div>

                        {/* Media Attachment Preview if captured by auto-moderation */}
                        {rep.attachmentUrl && (
                          <div className="mb-2 bg-black p-2 border border-emerald-900/50 rounded">
                            <span className="text-[10px] text-emerald-400 font-bold block mb-1">Anexo / Mídia Capturada:</span>
                            <img src={rep.attachmentUrl} alt="Mídia da Moderação" className="max-h-36 rounded border border-emerald-800 object-contain mx-auto bg-zinc-950" />
                          </div>
                        )}

                        {rep.adminReply && (
                          <div className="bg-fuchsia-950/40 p-2 text-fuchsia-200 text-xs border border-fuchsia-800/60 rounded mb-2">
                            <span className="font-bold text-fuchsia-400">Resposta enviada pelo Admin:</span> {rep.adminReply}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setAdminReplyTarget({ id: rep.id, type: 'report', user: rep.reportedBy, text: rep.reason })}
                        className="mt-2 w-full py-1.5 bg-fuchsia-950/80 hover:bg-fuchsia-900 text-fuchsia-300 border border-fuchsia-800 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        RESPONDER AUTOR DA DENÚNCIA
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Suggestions Section */}
            <div className="bg-black border border-emerald-900/30 rounded-sm p-4 flex flex-col">
              <h2 className="text-lg font-bold text-blue-400 border-b border-blue-900/30 pb-2 mb-4 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-blue-400" />
                  SUGESTÕES DA COMUNIDADE ({filteredSuggestions.length})
                </span>
              </h2>
              <div className="space-y-4 overflow-y-auto pr-2 scrollbar-thin">
                {filteredSuggestions.length === 0 ? (
                  <p className="text-zinc-600 text-sm italic">Nenhuma sugestão nesta visualização.</p>
                ) : (
                  filteredSuggestions.map(sug => (
                    <div key={sug.id} className="bg-zinc-900/80 border border-blue-900/20 p-3 rounded-sm flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex justify-between items-start mb-2 gap-2 flex-wrap">
                          <div>
                            <p className="text-blue-300 text-sm font-bold">
                              Enviado por: @{sug.sender}
                            </p>
                            <span className="text-[10px] bg-indigo-950/80 text-indigo-300 border border-indigo-800/80 px-2 py-0.5 rounded font-mono font-bold">
                              🎯 Sorteado: @{sug.assignedAdmin || 'Geral'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {formatTimestamp(sug.timestamp) && (
                              <span className="text-[10px] text-zinc-500 font-mono">
                                {formatTimestamp(sug.timestamp)}
                              </span>
                            )}
                            <button
                              onClick={() => handleDeleteSuggestion(sug)}
                              className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-950/50 border border-transparent hover:border-red-900/50 rounded transition-colors"
                              title="Excluir sugestão da lista"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="bg-black p-3 text-blue-100 text-sm border-l-2 border-blue-900/50 rounded-sm mb-2 break-words">
                          {sug.text}
                        </div>
                        {sug.adminReply && (
                          <div className="bg-fuchsia-950/40 p-2 text-fuchsia-200 text-xs border border-fuchsia-800/60 rounded mb-2">
                            <span className="font-bold text-fuchsia-400">Resposta enviada pelo Admin:</span> {sug.adminReply}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setAdminReplyTarget({ id: sug.id, type: 'suggestion', user: sug.sender, text: sug.text })}
                        className="mt-2 w-full py-1.5 bg-fuchsia-950/80 hover:bg-fuchsia-900 text-fuchsia-300 border border-fuchsia-800 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        RESPONDER SUGESTÃO
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Ban Appeals Section */}
            <div className="bg-black border border-amber-900/40 rounded-sm p-4 flex flex-col md:col-span-2">
              <div className="flex justify-between items-center border-b border-amber-900/30 pb-2 mb-4 flex-wrap gap-2">
                <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-amber-500" />
                  APELAÇÕES DE BANIMENTO ({filteredAppeals.filter(a => a.status === 'pending').length} pendentes)
                </h2>
              </div>
              <div className="space-y-4 overflow-y-auto pr-2 scrollbar-thin">
                {filteredAppeals.length === 0 ? (
                  <p className="text-zinc-600 text-sm italic">Nenhuma apelação nesta visualização.</p>
                ) : (
                  filteredAppeals.map(app => (
                    <div key={app.id} className="bg-zinc-900/80 border border-amber-900/30 p-3 rounded-sm flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex justify-between items-start mb-2 gap-2 flex-wrap">
                          <div>
                            <p className="text-amber-300 text-sm font-bold">
                              @{app.username} ({app.name})
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-zinc-500 font-mono">
                                Enviado: {formatTimestamp(app.timestamp)}
                              </span>
                              <span className="text-[10px] bg-indigo-950/80 text-indigo-300 border border-indigo-800/80 px-2 py-0.5 rounded font-mono font-bold">
                                🎯 Sorteado: @{app.assignedAdmin || 'Geral'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                              app.status === 'approved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                              app.status === 'rejected' ? 'bg-red-950 text-red-400 border border-red-800' :
                              'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                            }`}>
                              {app.status}
                            </span>
                            <button
                              onClick={() => handleDeleteAppeal(app)}
                              className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-950/50 border border-transparent hover:border-red-900/50 rounded transition-colors"
                              title="Remover apelação"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="bg-black p-2.5 text-amber-100 text-xs border-l-2 border-amber-700/80 rounded-sm mb-2 italic break-words">
                          "{app.reason}"
                        </div>
                        {app.adminReplyText && (
                          <div className="bg-fuchsia-950/40 p-2 text-fuchsia-200 text-xs border border-fuchsia-800/60 rounded mb-1">
                            <span className="font-bold text-fuchsia-400">Sua Resposta:</span> {app.adminReplyText}
                          </div>
                        )}
                        {app.adminReplyImage && (
                          <div className="mb-2">
                            <span className="text-[10px] text-fuchsia-400 font-bold block mb-1">Prova Anexada:</span>
                            <img src={app.adminReplyImage} alt="Prova do Admin" className="max-h-24 rounded border border-fuchsia-800 object-contain bg-black mx-auto" />
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setAppealReplyTarget(app);
                          setAppealReplyText(app.adminReplyText || '');
                          setAppealReplyImage(app.adminReplyImage || null);
                        }}
                        className="w-full py-1.5 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Gavel className="w-3.5 h-3.5" />
                        JULGAR / ENVIAR PROVAS CONCRETAS
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        {renderReportModal()}
        {renderSuggestionModal()}
        {showPolicy && renderPrivacyPolicy()}
        {renderDeleteModal()}
        {renderConfirmPurgeModal()}
        {renderAlertModal()}
        {renderGroupModals()}
        {renderMembersModal()}
        {renderAdminReplyModal()}
        {renderDeleteUserConfirmModal()}
        {renderMicPermissionModal()}
        {renderPushToast()}
        {renderAppealModal()}
        {renderAppealReplyModal()}
      </div>
    );
  }"""
        
        text = text[:pos] + new_admin_view + text[end_pos:]
        print("Updated Admin Panel view successfully!")
    else:
        print("Could not find CHAT VIEW marker.")
else:
    print("Could not find view === 'admin' marker.")

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Finished update_admin_dashboard.py.")
