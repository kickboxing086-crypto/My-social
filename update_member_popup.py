with open('src/App.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

old_popup = """                                  <button
                                    onClick={() => {
                                      setOpenMemberMenuUsername(null);
                                      handleAdminActionById(isTargetAdmin ? 'removeAdmin' : 'makeAdmin', member.id || member.shortId || member.username);
                                    }}
                                    className={`w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 font-bold ${
                                      isTargetAdmin
                                        ? 'hover:bg-zinc-800 text-zinc-300'
                                        : 'hover:bg-fuchsia-950/60 text-fuchsia-300'
                                    }`}
                                  >
                                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                                    <span>{isTargetAdmin ? 'Remover Admin' : 'Tornar Admin'}</span>
                                  </button>"""

new_popup = """                                  {isGeneralAdmin && (
                                    <>
                                      <button
                                        onClick={() => {
                                          setOpenMemberMenuUsername(null);
                                          handleAdminActionById('makeAdmin', member.id || member.shortId || member.username);
                                        }}
                                        className="w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 font-bold hover:bg-red-950/60 text-red-300"
                                      >
                                        <Shield className="w-3.5 h-3.5 text-red-400" />
                                        <span>Tornar Administrador</span>
                                      </button>
                                      <button
                                        onClick={() => {
                                          setOpenMemberMenuUsername(null);
                                          handleAdminActionById('makeGeneralAdmin', member.id || member.shortId || member.username);
                                        }}
                                        className="w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 font-bold hover:bg-fuchsia-950/60 text-fuchsia-300"
                                      >
                                        <Crown className="w-3.5 h-3.5 text-fuchsia-400" />
                                        <span>Tornar Administrador Geral</span>
                                      </button>
                                      {isTargetAdmin && (
                                        <button
                                          onClick={() => {
                                            setOpenMemberMenuUsername(null);
                                            handleAdminActionById('removeAdmin', member.id || member.shortId || member.username);
                                          }}
                                          className="w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 font-bold hover:bg-zinc-800 text-zinc-300"
                                        >
                                          <UserX className="w-3.5 h-3.5 text-zinc-400" />
                                          <span>Remover Cargo Admin</span>
                                        </button>
                                      )}
                                    </>
                                  )}"""

if old_popup in text:
    text = text.replace(old_popup, new_popup)
    print("Replaced member popup menu.")
else:
    print("Could not find old_popup match.")

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Finished update_member_popup.py.")
