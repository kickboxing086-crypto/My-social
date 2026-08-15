const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /if \(!confirm\("Tem certeza que deseja redefinir o link de convite deste grupo\? O link de convite anterior deixará de funcionar imediatamente, impedindo que novas pessoas o usem para entrar\."\)\) \{\n\s*return;\n\s*\}/g,
  `return setConfirmModalState({
      isOpen: true,
      title: 'REDEFINIR LINK',
      message: 'Tem certeza que deseja redefinir o link de convite deste grupo? O link anterior deixará de funcionar imediatamente.',
      isDestructive: true,
      confirmText: 'REDEFINIR',
      onConfirm: async () => {
        const newInviteCode = generateInviteCode();
        try {
          await updateDoc(doc(db, 'groups', targetGroupId), { inviteCode: newInviteCode });
          setGroups(prev => prev.map(g => g.id === targetGroupId ? { ...g, inviteCode: newInviteCode } : g));
          if (groupSettingsTarget && groupSettingsTarget.id === targetGroupId) {
            setGroupSettingsTarget({ ...groupSettingsTarget, inviteCode: newInviteCode });
          }
          showAlert('Link de convite redefinido com sucesso! O convite anterior foi desativado.', 'CONVITE ATUALIZADO', 'success');
        } catch (err) {
          console.error(err);
          showAlert('Erro ao redefinir link de convite.', 'ERRO', 'error');
        }
      }
    });`
);

code = code.replace(
  /if \(confirm\(`Remover \@\$\{memberUser\} do grupo\?`\)\) \{\n\s*const newMembers = groupSettingsTarget\.members\.filter\(m => m !== memberUser\);\n\s*const newOwners = groupSettingsTarget\.owners\.filter\(o => o !== memberUser\);\n\s*await updateDoc\(doc\(db, 'groups', groupSettingsTarget\.id\), \{ members: newMembers, owners: newOwners \}\);\n\s*setGroupSettingsTarget\(\{ \.\.\.groupSettingsTarget, members: newMembers, owners: newOwners \}\);\n\s*\}/g,
  `setConfirmModalState({
    isOpen: true,
    title: 'REMOVER MEMBRO',
    message: \`Remover @\${memberUser} do grupo?\`,
    isDestructive: true,
    confirmText: 'REMOVER',
    onConfirm: async () => {
      const newMembers = groupSettingsTarget.members.filter(m => m !== memberUser);
      const newOwners = groupSettingsTarget.owners.filter(o => o !== memberUser);
      await updateDoc(doc(db, 'groups', groupSettingsTarget.id), { members: newMembers, owners: newOwners });
      setGroupSettingsTarget({ ...groupSettingsTarget, members: newMembers, owners: newOwners });
    }
  });`
);

code = code.replace(
  /if \(confirm\('Tem certeza que deseja sair do grupo\?'\)\) \{\n\s*const newMembers = groupSettingsTarget\.members\.filter\(m => m !== currentUser\?\.username\);\n\s*await updateDoc\(doc\(db, 'groups', groupSettingsTarget\.id\), \{ members: newMembers \}\);\n\s*setGroupSettingsTarget\(null\);\n\s*setCurrentGroupId\(null\);\n\s*setShowGroupsMenu\(false\);\n\s*showAlert\('Você saiu do grupo\.', 'SUCESSO', 'info'\);\n\s*\}/g,
  `setConfirmModalState({
    isOpen: true,
    title: 'SAIR DO GRUPO',
    message: 'Tem certeza que deseja sair deste grupo?',
    isDestructive: true,
    confirmText: 'SAIR DO GRUPO',
    onConfirm: async () => {
      const newMembers = groupSettingsTarget.members.filter(m => m !== currentUser?.username);
      await updateDoc(doc(db, 'groups', groupSettingsTarget.id), { members: newMembers });
      setGroupSettingsTarget(null);
      setCurrentGroupId(null);
      setShowGroupsMenu(false);
      showAlert('Você saiu do grupo.', 'SUCESSO', 'info');
    }
  });`
);

code = code.replace(
  /if \(confirm\('Tem certeza que deseja sair deste grupo\?'\)\) \{\n\s*const currentGrp = groups\.find\(g => g\.id === currentGroupId\);\n\s*if \(currentGrp\) \{\n\s*const newMembers = currentGrp\.members\.filter\(m => m !== currentUser\?\.username\);\n\s*const newOwners = currentGrp\.owners\.filter\(o => o !== currentUser\?\.username\);\n\s*updateDoc\(doc\(db, 'groups', currentGrp\.id\), \{ members: newMembers, owners: newOwners \}\);\n\s*setCurrentGroupId\(null\);\n\s*showAlert\('Você saiu do grupo\.', 'SAÍDA DE GRUPO', 'info'\);\n\s*\}\n\s*\}/g,
  `setConfirmModalState({
    isOpen: true,
    title: 'SAIR DO GRUPO',
    message: 'Tem certeza que deseja sair deste grupo?',
    isDestructive: true,
    confirmText: 'SAIR DO GRUPO',
    onConfirm: async () => {
      const currentGrp = groups.find(g => g.id === currentGroupId);
      if (currentGrp) {
        const newMembers = currentGrp.members.filter(m => m !== currentUser?.username);
        const newOwners = currentGrp.owners.filter(o => o !== currentUser?.username);
        await updateDoc(doc(db, 'groups', currentGrp.id), { members: newMembers, owners: newOwners });
        setCurrentGroupId(null);
        showAlert('Você saiu do grupo.', 'SAÍDA DE GRUPO', 'info');
      }
    }
  });`
);

fs.writeFileSync('src/App.tsx', code);
