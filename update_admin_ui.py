import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update message role badge
old_msg_role = """                    <span className="text-fuchsia-400 text-[10px] uppercase font-bold tracking-wider border border-fuchsia-900/50 bg-fuchsia-950/30 px-1.5 py-0.5 rounded-sm">
                      {msg.role}
                    </span>"""

new_msg_role = """                    {renderRoleBadge(msg.role, msg.sender)}"""

if old_msg_role in text:
    text = text.replace(old_msg_role, new_msg_role)
    print("Updated message role badge.")

# 2. Update Header current user role badge
old_header_role = """{currentUser?.role || 'Membro'}"""
new_header_role = """{renderRoleBadge(currentUser?.role, currentUser?.username)}"""

# We'll replace it specifically where it's wrapped in span or text
text = text.replace("""<span className="text-zinc-400 font-mono">
                {currentUser?.role || 'Membro'}
              </span>""", render_role_header := """{renderRoleBadge(currentUser?.role, currentUser?.username)}""")

# 3. Update Member ID Actions dropdown inside renderMembersModal
old_id_menu = """                        <button
                          onClick={() => {
                            setShowAdminIdActionMenu(false);
                            handleAdminActionById('makeAdmin', adminActionId);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded hover:bg-fuchsia-950/60 text-fuchsia-300 flex items-center gap-2 font-bold"
                        >
                          <Crown className="w-3.5 h-3.5 text-fuchsia-400" />
                          <span>Tornar Admin</span>
                        </button>"""

new_id_menu = """                        {isGeneralAdmin && (
                          <>
                            <button
                              onClick={() => {
                                setShowAdminIdActionMenu(false);
                                handleAdminActionById('makeAdmin', adminActionId);
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-red-950/60 text-red-300 flex items-center gap-2 font-bold"
                            >
                              <Shield className="w-3.5 h-3.5 text-red-400" />
                              <span>Tornar Administrador</span>
                            </button>
                            <button
                              onClick={() => {
                                setShowAdminIdActionMenu(false);
                                handleAdminActionById('makeGeneralAdmin', adminActionId);
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-fuchsia-950/60 text-fuchsia-300 flex items-center gap-2 font-bold"
                            >
                              <Crown className="w-3.5 h-3.5 text-fuchsia-400" />
                              <span>Tornar Administrador Geral</span>
                            </button>
                          </>
                        )}"""

if old_id_menu in text:
    text = text.replace(old_id_menu, new_id_menu)
    print("Updated ID Actions menu dropdown.")

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Finished update_admin_ui.py step 1.")
