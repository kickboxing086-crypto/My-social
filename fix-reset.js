const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  `  const handleResetGroupInviteCode = async (targetGroupId: string) => {
    if (!confirm("Tem certeza que deseja redefinir o link de convite deste grupo? O link de convite anterior deixará de funcionar imediatamente, impedindo que novas pessoas o usem para entrar.")) {
      return;
    }
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
  };`,
  `  const handleResetGroupInviteCode = async (targetGroupId: string) => {
    setConfirmModalState({
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
    });
  };`
);
fs.writeFileSync('src/App.tsx', code);
