import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

start_marker = "{/* Member Actions */}"
end_marker = "</div>\n                        </div>\n                      );\n                    })"

# Let's find the exact text between start_marker and the end of the button container
start_idx = text.find(start_marker)
end_idx = text.find("</div>", text.find("Remover", start_idx)) + len("</div>")

print("start_idx:", start_idx, "end_idx:", end_idx)
print("Old code slice:", text[start_idx:end_idx])

new_actions = """{/* Member 3-Dots Action Menu */}
                          {groupSettingsTarget.owners.includes(currentUser?.username || '') && !isSelf && (
                            <div className="relative shrink-0">
                              <button
                                onClick={() => setOpenGroupMemberMenuUser(openGroupMemberMenuUser === memberUser ? null : memberUser)}
                                className="p-1.5 bg-zinc-900 hover:bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-sm transition-colors"
                                title="Opções do Membro do Grupo"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {/* Dropdown Menu */}
                              {openGroupMemberMenuUser === memberUser && (
                                <div className="absolute right-0 top-full mt-1 w-48 bg-zinc-950 border border-emerald-800 rounded shadow-2xl p-1 z-50 space-y-1 font-mono text-xs">
                                  <button
                                    onClick={async () => {
                                      setOpenGroupMemberMenuUser(null);
                                      const newOwners = isGroupOwner
                                        ? groupSettingsTarget.owners.filter(o => o !== memberUser)
                                        : [...groupSettingsTarget.owners, memberUser];
                                      await updateDoc(doc(db, 'groups', groupSettingsTarget.id), { owners: newOwners });
                                      setGroupSettingsTarget({ ...groupSettingsTarget, owners: newOwners });
                                    }}
                                    className={`w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 font-bold ${
                                      isGroupOwner
                                        ? 'hover:bg-amber-950/60 text-amber-300'
                                        : 'hover:bg-emerald-950/60 text-emerald-300'
                                    }`}
                                  >
                                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                                    <span>{isGroupOwner ? 'Remover Líder' : 'Tornar Líder'}</span>
                                  </button>

                                  <button
                                    onClick={async () => {
                                      setOpenGroupMemberMenuUser(null);
                                      if (confirm(`Remover @${memberUser} do grupo?`)) {
                                        const newMembers = groupSettingsTarget.members.filter(m => m !== memberUser);
                                        const newOwners = groupSettingsTarget.owners.filter(o => o !== memberUser);
                                        await updateDoc(doc(db, 'groups', groupSettingsTarget.id), { members: newMembers, owners: newOwners });
                                        setGroupSettingsTarget({ ...groupSettingsTarget, members: newMembers, owners: newOwners });
                                      }
                                    }}
                                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-red-950/60 text-red-300 flex items-center gap-2 font-bold"
                                  >
                                    <UserX className="w-3.5 h-3.5 text-red-400" />
                                    <span>Remover do Grupo</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setOpenGroupMemberMenuUser(null);
                                      navigator.clipboard.writeText(`@${memberUser}`);
                                      showAlert(`@${memberUser} copiado!`, 'COPIADO', 'info');
                                    }}
                                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-emerald-950/40 text-emerald-300 flex items-center gap-2 font-bold"
                                  >
                                    <User className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Copiar @{memberUser}</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}"""

text = text[:start_idx] + new_actions + text[end_idx:]

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Group Settings member actions updated with 3-dots menu successfully!")
