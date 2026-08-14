with open('src/App.tsx', 'r') as f:
    content = f.read()

old_send = """  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !currentUser) return;

    if (currentUser.isBanned) {
      showAlert('Sua conta estÃ¡ BANIDA nesta comunidade. VocÃª estÃ¡ impedido de enviar qualquer tipo de mensagem.', 'CONTA BANIDA', 'warning');
      setShowAppealModal(true);
      return;
    }

    const textToSend = inputValue.trim();
    if (checkProfanity(textToSend)) {
      await executeAutoBan(textToSend);
      return;
    }

    await addDoc(collection(db, 'messages'), {
      sender: currentUser.username,
      role: currentUser.role,
      text: textToSend,
      type: 'user',
      viewOnce: isViewOnce,
      expired: false,
      groupId: currentGroupId || "global",
      timestamp: serverTimestamp()
    });
    
    setInputValue('');
    setIsViewOnce(false);"""

new_send = """  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !currentUser) return;

    if (currentUser.isBanned) {
      showAlert('Sua conta estÃ¡ BANIDA nesta comunidade. VocÃª estÃ¡ impedido de enviar qualquer tipo de mensagem.', 'CONTA BANIDA', 'warning');
      setShowAppealModal(true);
      return;
    }

    const textToSend = inputValue.trim();
    if (checkProfanity(textToSend)) {
      await executeAutoBan(textToSend);
      return;
    }
    
    if (editingMessageId) {
       const msgToEdit = messages.find(m => m.id === editingMessageId);
       if (msgToEdit && (msgToEdit.editCount || 0) < 2) {
           await updateDoc(doc(db, 'messages', editingMessageId), {
               text: textToSend,
               isEdited: true,
               editCount: (msgToEdit.editCount || 0) + 1
           });
       } else {
           showAlert('Esta mensagem não pode mais ser editada (limite de 2 vezes).', 'ERRO', 'error');
       }
       setEditingMessageId(null);
    } else {
      await addDoc(collection(db, 'messages'), {
        sender: currentUser.username,
        role: currentUser.role,
        text: textToSend,
        type: 'user',
        viewOnce: isViewOnce,
        expired: false,
        groupId: currentGroupId || "global",
        timestamp: serverTimestamp()
      });
    }
    
    setInputValue('');
    setIsViewOnce(false);"""

content = content.replace(old_send, new_send)
with open('src/App.tsx', 'w') as f:
    f.write(content)
