const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The methods to replace
const startMarker = '  const cancelRecording = () => {';
const endMarker = '  const toggleRecording = async () => {';

// Find where toggleRecording ends
// It ends just before: const onDrop = (e: React.DragEvent) => {
const afterToggle = '  const onDrop = ';

const startIdx = code.indexOf(startMarker);
const afterToggleIdx = code.indexOf(afterToggle);

if (startIdx !== -1 && afterToggleIdx !== -1) {
  // We need to find the exact end of toggleRecording. It ends with a `};` right before `const onDrop`.
  // Or we can just replace everything between startIdx and afterToggleIdx
  const oldMethodsBlock = code.substring(startIdx, afterToggleIdx);
  
  const newMethodsBlock = `  const cancelRecording = () => {
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
              name: \`Audio_\${recordingTime}s.webm\`,
              fileType: 'audio',
              url: base64data
            },
            viewOnce: isViewOnce,
            expired: false,
            timestamp: serverTimestamp()
          });
          setIsViewOnce(false);
        } catch (err) {
          if (err.message?.includes('exceeds the maximum allowed size')) {
            alert("O arquivo de áudio é muito grande para ser enviado.");
          } else {
            console.error(err);
          }
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

`;

  code = code.substring(0, startIdx) + newMethodsBlock + code.substring(afterToggleIdx);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Replaced methods block.");
} else {
  console.log("Could not find start or end index.");
}

