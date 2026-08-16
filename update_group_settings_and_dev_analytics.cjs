const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add Group Privacy Toggle in Group Settings Modal
const oldGroupInviteSection = `{/* Invite Link */}
                <div className="bg-black border border-emerald-900/60 p-3.5 rounded-sm shrink-0">`;

const newGroupInviteWithPrivacy = `{/* Group Privacy Setting (Open vs Private) */}
                {(groupSettingsTarget.owners.includes(currentUser?.username || '') || isAdmin) && (
                  <div className="bg-black border border-emerald-900/60 p-3.5 rounded-sm shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        {groupSettingsTarget.isPrivate ? (
                          <Lock className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Globe className="w-4 h-4 text-emerald-400" />
                        )}
                        <h3 className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
                          PRIVACIDADE DO GRUPO: {groupSettingsTarget.isPrivate ? 'PRIVADO 🔒' : 'ABERTO 🌐'}
                        </h3>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        {groupSettingsTarget.isPrivate 
                          ? 'Apenas membros convidados com link podem ver e interagir.' 
                          : 'Grupo aberto na comunidade com acesso aos tópicos livres.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleGroupPrivacy(groupSettingsTarget.id)}
                      className={\`px-3.5 py-2 rounded text-xs font-bold border flex items-center gap-1.5 transition-all self-start sm:self-auto shrink-0 \${
                        groupSettingsTarget.isPrivate
                          ? 'bg-amber-950/80 hover:bg-amber-900 text-amber-300 border-amber-600'
                          : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-600'
                      }\`}
                    >
                      {groupSettingsTarget.isPrivate ? (
                        <>
                          <Globe className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Mudar para Aberto 🌐</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Mudar para Privado 🔒</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Invite Link */}
                <div className="bg-black border border-emerald-900/60 p-3.5 rounded-sm shrink-0">`;

content = content.replace(oldGroupInviteSection, newGroupInviteWithPrivacy);

// 2. In Group Settings Modal Topics List, add Topic Privacy Toggle button
const oldTopicPills = `<span className="flex items-center gap-1">#{t} {(groupSettingsTarget.closedTopics || []).includes(t) && <Lock className="w-2.5 h-2.5 text-red-500/80" title="Tópico Fechado" />}</span>
                            {t.toLowerCase() !== 'geral' && (groupSettingsTarget.owners.includes(currentUser?.username || '') || isAdmin) && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    setEditingTopicName(t);
                                    setEditTopicValue(t);
                                  }}
                                  className="text-zinc-500 hover:text-emerald-400 p-0.5"
                                  title="Editar tópico"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleToggleTopicStatus(groupSettingsTarget.id, t)}
                                  className={\`p-0.5 \${(groupSettingsTarget.closedTopics || []).includes(t) ? 'text-red-400 hover:text-emerald-400' : 'text-emerald-600 hover:text-red-400'}\`}
                                  title={(groupSettingsTarget.closedTopics || []).includes(t) ? 'Abrir tópico' : 'Fechar tópico (Somente admins)'}
                                >
                                  {(groupSettingsTarget.closedTopics || []).includes(t) ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                </button>
                                <button
                                  onClick={() => handleRemoveTopicFromGroup(groupSettingsTarget.id, t)}
                                  className="text-zinc-500 hover:text-red-400 p-0.5"
                                  title="Remover tópico"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            )}`;

const newTopicPills = `<span className="flex items-center gap-1">
                              #{t}
                              {(groupSettingsTarget.privateTopics || []).includes(t) && (
                                <Lock className="w-2.5 h-2.5 text-amber-400" title="Tópico Privado (Apenas Admins)" />
                              )}
                              {(groupSettingsTarget.closedTopics || []).includes(t) && (
                                <Lock className="w-2.5 h-2.5 text-red-500/80" title="Tópico Fechado" />
                              )}
                            </span>
                            {t.toLowerCase() !== 'geral' && (groupSettingsTarget.owners.includes(currentUser?.username || '') || isAdmin) && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleToggleTopicPrivacy(groupSettingsTarget.id, t)}
                                  className={\`p-1 rounded text-[10px] font-bold flex items-center gap-0.5 transition-colors \${
                                    (groupSettingsTarget.privateTopics || []).includes(t)
                                      ? 'text-amber-400 hover:text-amber-300'
                                      : 'text-zinc-500 hover:text-amber-400'
                                  }\`}
                                  title={(groupSettingsTarget.privateTopics || []).includes(t) ? 'Tópico Privado (Clique para tornar aberto)' : 'Tópico Aberto (Clique para tornar privado)'}
                                >
                                  {(groupSettingsTarget.privateTopics || []).includes(t) ? <Lock className="w-3 h-3 text-amber-400" /> : <Globe className="w-3 h-3 text-emerald-400" />}
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingTopicName(t);
                                    setEditTopicValue(t);
                                  }}
                                  className="text-zinc-500 hover:text-emerald-400 p-0.5"
                                  title="Editar tópico"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleToggleTopicStatus(groupSettingsTarget.id, t)}
                                  className={\`p-0.5 \${(groupSettingsTarget.closedTopics || []).includes(t) ? 'text-red-400 hover:text-emerald-400' : 'text-emerald-600 hover:text-red-400'}\`}
                                  title={(groupSettingsTarget.closedTopics || []).includes(t) ? 'Abrir tópico' : 'Fechar tópico (Somente admins)'}
                                >
                                  {(groupSettingsTarget.closedTopics || []).includes(t) ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                </button>
                                <button
                                  onClick={() => handleRemoveTopicFromGroup(groupSettingsTarget.id, t)}
                                  className="text-zinc-500 hover:text-red-400 p-0.5"
                                  title="Remover tópico"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            )}`;

content = content.replace(oldTopicPills, newTopicPills);

// 3. In dev_analytics User Database Table, add "✉️ Credenciais para E-mail" button column
const oldUserTableHeader = `<th className="p-3">Ações / Status</th>`;
const newUserTableHeader = `<th className="p-3">Ações / Credenciais</th>`;

content = content.replace(oldUserTableHeader, newUserTableHeader);

const oldUserTableRowEnd = `<td className="p-3">
                              {user.isBanned ? (
                                <span className="text-red-400 font-bold text-[10px] bg-red-950/60 border border-red-800 px-2 py-0.5 rounded">
                                  BANIDO
                                </span>
                              ) : (
                                <span className="text-emerald-500 font-bold text-[10px] bg-emerald-950/40 border border-emerald-900/60 px-2 py-0.5 rounded">
                                  ATIVO
                                </span>
                              )}
                            </td>`;

const newUserTableRowEnd = `<td className="p-3">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEmailTemplateModalUser({
                                      name: user.name || '',
                                      username: user.username || '',
                                      password: user.password || '',
                                      role: user.role || 'Membro',
                                      email: user.email || '',
                                      contact: user.phone || ''
                                    });
                                  }}
                                  className="px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/80 rounded text-[11px] font-bold flex items-center gap-1 transition-colors shadow-sm"
                                  title="Copiar mensagem profissional com credenciais para enviar ao cliente"
                                >
                                  <Mail className="w-3 h-3 text-emerald-400" />
                                  <span>Copiar E-mail</span>
                                </button>
                                {user.isBanned ? (
                                  <span className="text-red-400 font-bold text-[10px] bg-red-950/60 border border-red-800 px-2 py-0.5 rounded">
                                    BANIDO
                                  </span>
                                ) : (
                                  <span className="text-emerald-500 font-bold text-[10px] bg-emerald-950/40 border border-emerald-900/60 px-2 py-0.5 rounded">
                                    ATIVO
                                  </span>
                                )}
                              </div>
                            </td>`;

content = content.replace(oldUserTableRowEnd, newUserTableRowEnd);

// 4. In dev_analytics Recovery Requests, add "✉️ Copiar E-mail" button to card actions
const oldRecoveryActions = `<div className="flex flex-wrap items-center gap-2 pt-2 border-t border-emerald-950">
                          {cleanPhone && (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/80 rounded text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                              <span>WhatsApp</span>
                            </a>
                          )}`;

const newRecoveryActions = `<div className="flex flex-wrap items-center gap-2 pt-2 border-t border-emerald-950">
                          <button
                            type="button"
                            onClick={() => {
                              // Find user in allMembers to get current password
                              const matchedUser = allMembers.find(m => m.username.toLowerCase() === req.username.toLowerCase());
                              setEmailTemplateModalUser({
                                name: req.name || matchedUser?.name || '',
                                username: req.username || '',
                                password: matchedUser?.password || 'Definida pelo Administrador',
                                role: matchedUser?.role || 'Membro',
                                email: req.email || '',
                                contact: req.contact || ''
                              });
                            }}
                            className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 rounded text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                          >
                            <Mail className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Mensagem de Credenciais</span>
                          </button>

                          {cleanPhone && (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/80 rounded text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                              <span>WhatsApp</span>
                            </a>
                          )}`;

content = content.replace(oldRecoveryActions, newRecoveryActions);

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('App.tsx part 3 updated successfully');
