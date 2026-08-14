with open('src/App.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace submitReport and submitSuggestion
old_submit_report = """const submitReport = async () => {
    if (!reportTarget || !reportReason.trim() || !currentUser) return;
    
    await addDoc(collection(db, 'reports'), {
      type: 'user',
      reportedUser: reportTarget,
      reportedBy: currentUser.username,
      reason: reportReason.trim(),
      groupId: currentGroupId || "global",
      topic: currentGroupId ? (currentTopic || 'Geral') : undefined,
      timestamp: serverTimestamp()
    });
    
    showAlert(`Denúncia contra ${reportTarget} registrada com sucesso.`, 'DENÚNCIA ENVIADA', 'success');
    setReportTarget(null);
    setReportReason('');
  };

  const submitSuggestion = async () => {
    if (!suggestionText.trim() || !currentUser) return;
    
    await addDoc(collection(db, 'suggestions'), {
      sender: currentUser.username,
      text: suggestionText.trim(),
      groupId: currentGroupId || "global",
      topic: currentGroupId ? (currentTopic || 'Geral') : undefined,
      timestamp: serverTimestamp()
    });
    
    showAlert('Sua ideia foi transmitida com sucesso para a administração.', 'SUGESTÃO REGISTRADA', 'success');
    setShowSuggestionModal(false);
    setSuggestionText('');
  };"""

new_submit_report = """const triggerAutoModerationReport = async (userToReport: string, reasonText: string, mediaUrl?: string) => {
    try {
      const assignedAdmin = getRandomAssignedAdmin(allMembers);
      await addDoc(collection(db, 'reports'), {
        type: 'auto_moderation',
        reportedUser: userToReport,
        reportedBy: 'SISTEMA AUTÔNOMO',
        reason: reasonText,
        assignedAdmin,
        attachmentUrl: mediaUrl || '',
        groupId: currentGroupId || "global",
        topic: currentGroupId ? (currentTopic || 'Geral') : undefined,
        timestamp: serverTimestamp()
      });
      if (assignedAdmin === currentUser?.username) {
        setPushToast({
          sender: 'MODERAÇÃO AUTOMÁTICA',
          text: `🚨 Novo conteúdo/mídia de @${userToReport} atribuído a você para análise!`
        });
      }
    } catch (e) {
      console.error('Erro ao registrar moderação automática:', e);
    }
  };

  const submitReport = async () => {
    if (!reportTarget || !reportReason.trim() || !currentUser) return;
    
    const assignedAdmin = getRandomAssignedAdmin(allMembers);
    await addDoc(collection(db, 'reports'), {
      type: 'user',
      reportedUser: reportTarget,
      reportedBy: currentUser.username,
      reason: reportReason.trim(),
      assignedAdmin,
      groupId: currentGroupId || "global",
      topic: currentGroupId ? (currentTopic || 'Geral') : undefined,
      timestamp: serverTimestamp()
    });
    
    showAlert(`Denúncia contra ${reportTarget} registrada com sucesso e sorteada para @${assignedAdmin}.`, 'DENÚNCIA ENVIADA', 'success');
    setReportTarget(null);
    setReportReason('');
  };

  const submitSuggestion = async () => {
    if (!suggestionText.trim() || !currentUser) return;
    
    const assignedAdmin = getRandomAssignedAdmin(allMembers);
    await addDoc(collection(db, 'suggestions'), {
      sender: currentUser.username,
      text: suggestionText.trim(),
      assignedAdmin,
      groupId: currentGroupId || "global",
      topic: currentGroupId ? (currentTopic || 'Geral') : undefined,
      timestamp: serverTimestamp()
    });
    
    showAlert(`Sua ideia foi registrada e sorteada para a análise do Administrador @${assignedAdmin}.`, 'SUGESTÃO REGISTRADA', 'success');
    setShowSuggestionModal(false);
    setSuggestionText('');
  };"""

if old_submit_report in text:
    text = text.replace(old_submit_report, new_submit_report)
    print("Replaced submitReport and submitSuggestion.")
else:
    print("Could not find exact submitReport match, checking regex or line match...")

# Replace executeAutoBan
old_autoban = """    await addDoc(collection(db, 'reports'), {
      type: 'profanity',
      reportedUser: currentUser.username,
      reportedBy: 'SISTEMA AUTÔNOMO',
      reason: autoReason,
      groupId: currentGroupId || "global",
      topic: currentGroupId ? (currentTopic || 'Geral') : undefined,
      timestamp: serverTimestamp()
    });"""

new_autoban = """    const assignedAdmin = getRandomAssignedAdmin(allMembers);
    await addDoc(collection(db, 'reports'), {
      type: 'profanity',
      reportedUser: currentUser.username,
      reportedBy: 'SISTEMA AUTÔNOMO',
      reason: autoReason,
      assignedAdmin,
      groupId: currentGroupId || "global",
      topic: currentGroupId ? (currentTopic || 'Geral') : undefined,
      timestamp: serverTimestamp()
    });"""

if old_autoban in text:
    text = text.replace(old_autoban, new_autoban)
    print("Replaced executeAutoBan report creation.")

# Replace appeal creation
old_appeal = """      await addDoc(collection(db, 'appeals'), {
        username: currentUser.username,
        name: currentUser.name,
        reason: appealText.trim(),
        groupId: currentGroupId || "global",
      topic: currentGroupId ? (currentTopic || 'Geral') : undefined,
      timestamp: serverTimestamp(),
        bannedAt: currentUser.bannedAt || serverTimestamp(),
        status: 'pending'
      });"""

new_appeal = """      const assignedAdmin = getRandomAssignedAdmin(allMembers);
      await addDoc(collection(db, 'appeals'), {
        username: currentUser.username,
        name: currentUser.name,
        reason: appealText.trim(),
        assignedAdmin,
        groupId: currentGroupId || "global",
        topic: currentGroupId ? (currentTopic || 'Geral') : undefined,
        timestamp: serverTimestamp(),
        bannedAt: currentUser.bannedAt || serverTimestamp(),
        status: 'pending'
      });"""

if old_appeal in text:
    text = text.replace(old_appeal, new_appeal)
    print("Replaced appeal creation.")

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Finished handlers update.")
