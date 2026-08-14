import sys

with open('src/App.tsx', 'r') as f:
    code = f.read()

start_marker = "  const cancelRecording = () => {"
if start_marker not in code:
    print("Could not find start marker")
    sys.exit(1)

start_idx = code.find(start_marker)

end_marker = "  const formatTime = "
end_idx = code.find(end_marker, start_idx)


if end_idx == -1:
    print("Could not find end marker")
    sys.exit(1)

new_methods = """  const cancelRecording = () => {
    if (isRecording) {
      if (recordingInterval.current) clearInterval(recordingInterval.current);
      setIsRecording(false);
      setIsRecordingPaused(false);
      setAudioPreviewUrl(null);
      setAudioPreviewBlob(null);
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.onstop = null; // Prevent saving
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    }
  };
  
  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsRecordingPaused(true);
      if (recordingInterval.current) clearInterval(recordingInterval.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsRecordingPaused(false);
      recordingInterval.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopAndPreviewRecording = () => {
    if (isRecording) {
      if (recordingInterval.current) clearInterval(recordingInterval.current);
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(audioBlob);
          setAudioPreviewBlob(audioBlob);
          setAudioPreviewUrl(url);
          mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
        };
        mediaRecorderRef.current.stop();
      }
    }
  };

  const sendAudioPreview = async () => {
    if (audioPreviewBlob && currentUser) {
      const reader = new FileReader();
      reader.readAsDataURL(audioPreviewBlob);
      reader.onloadend = async () => {
        const base64data = reader.result;
        try {
          await addDoc(collection(db, 'messages'), {
            sender: currentUser.username,
            role: currentUser.role,
            text: '',
            type: 'user',
            attachment: {
              name: `Áudio gravado.webm`,
              fileType: 'audio',
              url: base64data
            },
            viewOnce: isViewOnce,
            expired: false,
            timestamp: serverTimestamp()
          });
          setIsViewOnce(false);
        } catch (err) {
          console.error(err);
        }
      };
    }
    
    // Clean up
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    setIsRecording(false);
    setIsRecordingPaused(false);
    setAudioPreviewUrl(null);
    setAudioPreviewBlob(null);
    setRecordingTime(0);
  };

  const toggleRecording = async () => {
    if (isRecording) {
      stopAndPreviewRecording();
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };
        
        mediaRecorder.start();
        setIsRecording(true);
        setIsRecordingPaused(false);
        setAudioPreviewUrl(null);
        setAudioPreviewBlob(null);
        setRecordingTime(0);
        recordingInterval.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
      } catch (err) {
        console.error('Error accessing microphone:', err);
        alert('Não foi possível acessar o microfone.');
      }
    }
  };

"""

new_code = code[:start_idx] + new_methods + code[end_idx:]

with open('src/App.tsx', 'w') as f:
    f.write(new_code)

print("Replaced properly!")

