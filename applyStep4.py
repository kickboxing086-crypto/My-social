import sys

with open('src/App.tsx', 'r') as f:
    code = f.read()

admin_actions = """
  // Administrative Action: Ban / Unban User
  const handleBanUser = async (member: DevUser) => {
    if (!isAdmin) return;
    if (member.username === 'Samuel123' || member.username === 'samuellsilvva02') {
      showAlert('Não é possível banir a conta de Administrador Supremo.', 'AÇÃO NEGADA', 'warning');
      return;
    }

    try {
      const q = query(collection(db, 'users'), where('username', '==', member.username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDocRef = doc(db, 'users', querySnapshot.docs[0].id);
        const newBannedState = !member.isBanned;
        await updateDoc(userDocRef, { isBanned: newBannedState });
        
        await addSystemMessage(`[AÇÃO ADMIN] O usuário ${member.name} (@${member.username}) foi ${newBannedState ? 'BANIDO' : 'DESBANIDO'} por ${currentUser?.name}.`);
        showAlert(`Usuário @${member.username} ${newBannedState ? 'banido' : 'desbanido'} com sucesso.`, 'BANIMENTO ATUALIZADO', 'success');
      }
    } catch (err) {
      console.error(err);
      showAlert('Erro ao alterar status de banimento do usuário.', 'ERRO', 'error');
    }
  };

  // Execute Permanent Account Deletion & Message Purge
  const executeDeleteUserAccount = async () => {
    if (!userToDeleteConfirm || !isAdmin) return;
    const targetUser = userToDeleteConfirm;

    try {
      // 1. Delete user from 'users' collection
      const qUser = query(collection(db, 'users'), where('username', '==', targetUser.username));
      const userSnap = await getDocs(qUser);
      userSnap.forEach(async (docSnap) => {
        await deleteDoc(doc(db, 'users', docSnap.id));
      });

      // 2. Delete all messages sent by this user
      const qMsgs = query(collection(db, 'messages'), where('sender', '==', targetUser.username));
      const msgsSnap = await getDocs(qMsgs);
      msgsSnap.forEach(async (docSnap) => {
        await deleteDoc(doc(db, 'messages', docSnap.id));
      });

      await addSystemMessage(`[AÇÃO ADMIN] A conta do usuário ${targetUser.name} (@${targetUser.username}) foi EXCLUÍDA PERMANENTEMENTE e todas as suas mensagens foram purgadas.`);
      showAlert(`Conta de @${targetUser.username} e suas mensagens foram permanentemente apagadas!`, 'CONTA EXCLUÍDA', 'success');
      setUserToDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      showAlert('Erro ao excluir conta permanentemente.', 'ERRO', 'error');
    }
  };

  // Submit Admin Reply to Report or Suggestion
  const handleAdminReply = async () => {
    if (!adminReplyTarget || !adminReplyText.trim() || !currentUser) return;

    try {
      const collectionName = adminReplyTarget.type === 'report' ? 'reports' : 'suggestions';
      const docRef = doc(db, collectionName, adminReplyTarget.id);

      await updateDoc(docRef, {
        adminReply: adminReplyText.trim(),
        repliedAt: serverTimestamp()
      });

      // Send System Message to notify target user & team
      await addDoc(collection(db, 'messages'), {
        sender: 'RESPOSTA DO ADMIN',
        text: `[RESPOSTA OFICIAL PARA @${adminReplyTarget.user}] (${adminReplyTarget.type === 'report' ? 'Denúncia' : 'Sugestão'}):\\n${adminReplyText.trim()}`,
        type: 'system',
        timestamp: serverTimestamp()
      });

      showAlert(`Resposta transmitida com sucesso para @${adminReplyTarget.user}!`, 'RESPOSTA ENVIADA', 'success');
      setAdminReplyTarget(null);
      setAdminReplyText('');
    } catch (err) {
      console.error(err);
      showAlert('Erro ao enviar resposta do admin.', 'ERRO', 'error');
    }
  };

  // Animated Microphone Permission Tester
  const requestMicPermissionWithAnimation = async () => {
    setShowMicPermissionModal(true);
    setMicTestActive(false);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicTestActive(true);
      playHUDChime();

      // Audio Level Meter Simulation
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 64;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setMicAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
      };

      const interval = setInterval(updateLevel, 100);
      
      setTimeout(() => {
        clearInterval(interval);
        stream.getTracks().forEach(t => t.stop());
        audioCtx.close();
      }, 5000);
    } catch (err) {
      setMicTestActive(false);
      showAlert('Não foi possível obter permissão de acesso ao microfone no dispositivo.', 'ACESSO NEGADO', 'error');
    }
  };
"""

code = code.replace("const submitReport = async () => {", admin_actions + "\n  const submitReport = async () => {")

with open('src/App.tsx', 'w') as f:
    f.write(code)

print("Step 4 applied successfully!")
