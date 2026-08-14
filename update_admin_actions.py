with open('src/App.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace handleAdminActionById definition
old_action_fn = """  const handleAdminActionById = async (actionType: 'ban' | 'unban' | 'makeAdmin' | 'removeAdmin', targetId: string) => {"""

new_action_fn = """  const handleAdminActionById = async (actionType: 'ban' | 'unban' | 'makeAdmin' | 'makeGeneralAdmin' | 'removeAdmin', targetId: string) => {"""

if old_action_fn in text:
    text = text.replace(old_action_fn, new_action_fn)
    print("Updated handleAdminActionById signature.")

# Replace action handling inside handleAdminActionById
old_action_body = """      } else if (actionType === 'makeAdmin') {
        await updateDoc(userDocRef, { role: 'admin' });
        setAllMembers(prev => prev.map(m => m.username.toLowerCase() === targetUser.username.toLowerCase() ? { ...m, role: 'admin' } : m));
        showAlert(`Usuário @${targetUser.username} promovido a Administrador!`, 'AÇÃO CONCLUÍDA', 'success');
      } else if (actionType === 'removeAdmin') {
        await updateDoc(userDocRef, { role: 'Membro' });
        setAllMembers(prev => prev.map(m => m.username.toLowerCase() === targetUser.username.toLowerCase() ? { ...m, role: 'Membro' } : m));
        showAlert(`Cargo de administrador removido de @${targetUser.username}.`, 'AÇÃO CONCLUÍDA', 'success');
      }"""

new_action_body = """      } else if (actionType === 'makeAdmin') {
        if (!isGeneralAdmin) {
          showAlert('Apenas o Administrador Geral pode promover usuários a Administrador.', 'PERMISSÃO NEGADA', 'error');
          return;
        }
        await updateDoc(userDocRef, { role: 'Administrador' });
        setAllMembers(prev => prev.map(m => m.username.toLowerCase() === targetUser.username.toLowerCase() ? { ...m, role: 'Administrador' } : m));
        showAlert(`Usuário @${targetUser.username} promovido a Administrador!`, 'AÇÃO CONCLUÍDA', 'success');
      } else if (actionType === 'makeGeneralAdmin') {
        if (!isGeneralAdmin) {
          showAlert('Apenas o Administrador Geral pode promover usuários a Administrador Geral.', 'PERMISSÃO NEGADA', 'error');
          return;
        }
        await updateDoc(userDocRef, { role: 'Administrador Geral' });
        setAllMembers(prev => prev.map(m => m.username.toLowerCase() === targetUser.username.toLowerCase() ? { ...m, role: 'Administrador Geral' } : m));
        showAlert(`Usuário @${targetUser.username} promovido a Administrador Geral!`, 'AÇÃO CONCLUÍDA', 'success');
      } else if (actionType === 'removeAdmin') {
        if (!isGeneralAdmin) {
          showAlert('Apenas o Administrador Geral pode remover cargos de administradores.', 'PERMISSÃO NEGADA', 'error');
          return;
        }
        await updateDoc(userDocRef, { role: 'Membro' });
        setAllMembers(prev => prev.map(m => m.username.toLowerCase() === targetUser.username.toLowerCase() ? { ...m, role: 'Membro' } : m));
        showAlert(`Cargo de administrador removido de @${targetUser.username}.`, 'AÇÃO CONCLUÍDA', 'success');
      }"""

if old_action_body in text:
    text = text.replace(old_action_body, new_action_body)
    print("Updated handleAdminActionById body.")

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Finished admin actions update.")
