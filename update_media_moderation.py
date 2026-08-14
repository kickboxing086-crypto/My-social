with open('src/App.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Update image upload
old_img_block = """              await addDoc(collection(db, 'messages'), {
                sender: currentUser.username,
                role: currentUser.role,
                text: 'Arquivo anexado:',
                type: 'user',
                attachment: {
                  name: file.name.replace(/\.[^/.]+$/, "") + ".jpg",
                  fileType,
                  url: compressedBase64
                },
                viewOnce: isViewOnce,
                expired: false,
                groupId: currentGroupId || "global",
      topic: currentGroupId ? (currentTopic || 'Geral') : undefined,
      timestamp: serverTimestamp()
              });
              setIsViewOnce(false);"""

new_img_block = """              await addDoc(collection(db, 'messages'), {
                sender: currentUser.username,
                role: currentUser.role,
                text: 'Arquivo anexado:',
                type: 'user',
                attachment: {
                  name: file.name.replace(/\.[^/.]+$/, "") + ".jpg",
                  fileType,
                  url: compressedBase64
                },
                viewOnce: isViewOnce,
                expired: false,
                groupId: currentGroupId || "global",
                topic: currentGroupId ? (currentTopic || 'Geral') : undefined,
                timestamp: serverTimestamp()
              });
              await triggerAutoModerationReport(currentUser.username, `[MODERAÇÃO AUTOMÁTICA DE MÍDIA] Mídia de imagem postada: "${file.name}"`, compressedBase64);
              setIsViewOnce(false);"""

if old_img_block in text:
    text = text.replace(old_img_block, new_img_block)
    print("Updated image upload auto-moderation trigger.")

# Update document upload
old_doc_block = """          await addDoc(collection(db, 'messages'), {
            sender: currentUser.username,
            role: currentUser.role,
            text: 'Documento anexado:',
            type: 'user',
            attachment: {
              name: file.name,
              fileType: 'document',
              url: base64Url
            },
            viewOnce: isViewOnce,
            expired: false,
            groupId: currentGroupId || "global",
      topic: currentGroupId ? (currentTopic || 'Geral') : undefined,
      timestamp: serverTimestamp()
          });
          setIsViewOnce(false);"""

new_doc_block = """          await addDoc(collection(db, 'messages'), {
            sender: currentUser.username,
            role: currentUser.role,
            text: 'Documento anexado:',
            type: 'user',
            attachment: {
              name: file.name,
              fileType: 'document',
              url: base64Url
            },
            viewOnce: isViewOnce,
            expired: false,
            groupId: currentGroupId || "global",
            topic: currentGroupId ? (currentTopic || 'Geral') : undefined,
            timestamp: serverTimestamp()
          });
          await triggerAutoModerationReport(currentUser.username, `[MODERAÇÃO AUTOMÁTICA DE DOCUMENTO] Arquivo anexado no chat: "${file.name}"`, base64Url);
          setIsViewOnce(false);"""

if old_doc_block in text:
    text = text.replace(old_doc_block, new_doc_block)
    print("Updated document upload auto-moderation trigger.")

# Update audio recording
old_audio_block = """          await addDoc(collection(db, 'messages'), {
            sender: currentUser.username,
            role: currentUser.role,
            text: '',
            type: 'user',
            attachment: {
              name: `Mensagem de voz (${recordingTime}s)`,
              fileType: 'audio',
              url: base64data,
              duration: recordingTime
            },
            viewOnce: isViewOnce,
            expired: false,
            groupId: currentGroupId || "global",
      topic: currentGroupId ? (currentTopic || 'Geral') : undefined,
      timestamp: serverTimestamp()
          });
          setIsViewOnce(false);"""

new_audio_block = """          await addDoc(collection(db, 'messages'), {
            sender: currentUser.username,
            role: currentUser.role,
            text: '',
            type: 'user',
            attachment: {
              name: `Mensagem de voz (${recordingTime}s)`,
              fileType: 'audio',
              url: base64data,
              duration: recordingTime
            },
            viewOnce: isViewOnce,
            expired: false,
            groupId: currentGroupId || "global",
            topic: currentGroupId ? (currentTopic || 'Geral') : undefined,
            timestamp: serverTimestamp()
          });
          await triggerAutoModerationReport(currentUser.username, `[MODERAÇÃO AUTOMÁTICA DE ÁUDIO] Mensagem de voz enviada (${recordingTime}s)`);
          setIsViewOnce(false);"""

if old_audio_block in text:
    text = text.replace(old_audio_block, new_audio_block)
    print("Updated audio upload auto-moderation trigger.")

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Finished update_media_moderation.py.")
