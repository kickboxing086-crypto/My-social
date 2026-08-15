const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<>(\s*)<span>#\{t\}<\/span>(\s*)\{t\.toLowerCase\(\) !== 'geral' && \(groupSettingsTarget\.owners\.includes\(currentUser\?\.username \|\| ''\) \|\| isAdmin\) && \(/g,
  `<>
                            <span className="flex items-center gap-1">#{t} {(groupSettingsTarget.closedTopics || []).includes(t) && <Lock className="w-2.5 h-2.5 text-red-500/80" title="Tópico Fechado" />}</span>
                            {t.toLowerCase() !== 'geral' && (groupSettingsTarget.owners.includes(currentUser?.username || '') || isAdmin) && (`
);

code = code.replace(
  /<button\n\s*onClick=\{\(\) => handleRemoveTopicFromGroup\(groupSettingsTarget\.id, t\)\}\n\s*className="text-zinc-500 hover:text-red-400 p-0\.5"\n\s*title="Remover tópico"\n\s*>\n\s*<X className="w-3 h-3" \/>\n\s*<\/button>/g,
  `<button
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
                                </button>`
);

fs.writeFileSync('src/App.tsx', code);
