import sys
import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

state_additions = """
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [audioPreviewBlob, setAudioPreviewBlob] = useState<Blob | null>(null);
"""

# Insert state below `const audioChunksRef = useRef<Blob[]>([]);`
if "const [isRecordingPaused" not in code:
    code = code.replace("const audioChunksRef = useRef<Blob[]>([]);", "const audioChunksRef = useRef<Blob[]>([]);" + state_additions)


# Update icons: add Pause, Check, Play (if not there, but they are from lucide-react)
# Actually, Pause is not imported. Let's add it.
if "Pause," not in code:
    code = code.replace("import { Terminal, Send, Code, User, Power, UserPlus, ArrowLeft, Server, Paperclip, Mic, FileText, Image as ImageIcon, Play, Square, Eye, EyeOff, ShieldAlert, Flag, Gavel, Lightbulb, X, AlertTriangle, Trash2 }", "import { Terminal, Send, Code, User, Power, UserPlus, ArrowLeft, Server, Paperclip, Mic, FileText, Image as ImageIcon, Play, Square, Eye, EyeOff, ShieldAlert, Flag, Gavel, Lightbulb, X, AlertTriangle, Trash2, Pause, Check }")


# Now, update toggleRecording and cancelRecording
# Currently toggleRecording and cancelRecording logic:

old_recording_methods = r"""  const cancelRecording = \(\) => \{
    if \(isRecording\) \{
      if \(recordingInterval\.current\) clearInterval\(recordingInterval\.current\);
      setIsRecording\(false\);
      
      if \(mediaRecorderRef\.current && mediaRecorderRef\.current\.state !== 'inactive'\) \{
        mediaRecorderRef\.current\.onstop = null; // Prevent saving
        mediaRecorderRef\.current\.stop\(\);
        mediaRecorderRef\.current\.stream\.getTracks\(\)\.forEach\(track => track\.stop\(\)\);
      \}
    \}
  \};

  const toggleRecording = async \(\) => \{
    if \(isRecording\) \{
      if \(recordingInterval\.current\) clearInterval\(recordingInterval\.current\);
      setIsRecording\(false\);
      
      if \(mediaRecorderRef\.current && mediaRecorderRef\.current\.state !== 'inactive'\) \{
        mediaRecorderRef\.current\.stop\(\);
        mediaRecorderRef\.current\.stream\.getTracks\(\)\.forEach\(track => track\.stop\(\)\);
      \}
    \} else \{
      try \{
        const stream = await navigator\.mediaDevices\.getUserMedia\(\{ audio: true \}\);
        const mediaRecorder = new MediaRecorder\(stream\);
        mediaRecorderRef\.current = mediaRecorder;
        audioChunksRef\.current = \[\];
        
        mediaRecorder\.ondataavailable = \(e\) => \{
          if \(e\.data\.size > 0\) \{
            audioChunksRef\.current\.push\(e\.data\);
          \}
        \};
        
        mediaRecorder\.onstop = async \(\) => \{
          const audioBlob = new Blob\(audioChunksRef\.current, \{ type: 'audio/webm' \}\);
          const reader = new FileReader\(\);
          reader\.readAsDataURL\(audioBlob\);
          reader\.onloadend = async \(\) => \{
            const base64data = reader\.result;
            if \(currentUser\) \{
              const currentRecordingTime = recordingTime; // capture current state
              try \{
                await addDoc\(collection\(db, 'messages'\), \{
                  sender: currentUser\.username,
                  role: currentUser\.role,
                  text: '',
                  type: 'user',
                  attachment: \{
                    name: \`Audio_\$\{currentRecordingTime\}s\.webm\`,
                    fileType: 'audio',
                    url: base64data
                  \},
                  viewOnce: isViewOnce,
                  expired: false,
                  timestamp: serverTimestamp\(\)
                \}\);
                setIsViewOnce\(false\);
              \} catch \(err: any\) \{
                if \(err\.message\?\.includes\('exceeds the maximum allowed size'\)\) \{
                  alert\("O arquivo de áudio é muito grande para ser enviado\."\);
                \} else \{
                  console\.error\(err\);
                \}
              \}
            \}
          \};
        \};
        
        mediaRecorder\.start\(\);
        setIsRecording\(true\);
        setRecordingTime\(0\);
        recordingInterval\.current = setInterval\(\(\) => \{
          setRecordingTime\(\(prev\) => prev \+ 1\);
        \}, 1000\);
      \} catch \(err\) \{
        console\.error\('Error accessing microphone:', err\);
        alert\('Não foi possível acessar o microfone\.'\);
      \}
    \}
  \};"""

new_recording_methods = """  const cancelRecording = () => {
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
              name: `Audio_${recordingTime}s.webm`,
              fileType: 'audio',
              url: base64data
            },
            viewOnce: isViewOnce,
            expired: false,
            timestamp: serverTimestamp()
          });
          setIsViewOnce(false);
        } catch (err: any) {
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
  };"""

code = re.sub(old_recording_methods, new_recording_methods, code, count=1)


# Update the Recording UI
old_ui = r"""            \{isRecording \? \(
              <div className="flex-1 bg-black border border-red-800 text-red-400 px-4 py-2 flex items-center justify-between">
                <span className="text-sm font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  Gravando \{formatTime\(recordingTime\)\}
                </span>
                <button 
                  type="button"
                  onClick=\{cancelRecording\}
                  className="text-red-500 hover:text-red-300 transition-colors p-2 bg-red-950/30 rounded-full border border-red-900/50"
                  title="Cancelar gravação"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            \) : \("""

new_ui = """            {isRecording ? (
              audioPreviewUrl ? (
                <div className="flex-1 flex flex-col sm:flex-row items-center gap-2 bg-black border border-emerald-800/50 p-2 rounded-sm w-full">
                  <div className="flex-1 w-full min-w-[200px]">
                    <AudioPlayer src={audioPreviewUrl} name={`Audio de ${formatTime(recordingTime)}`} />
                  </div>
                  <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={cancelRecording}
                      className="text-red-500 hover:text-red-300 p-2 bg-red-950/30 rounded-full border border-red-900/50 transition-colors flex-shrink-0"
                      title="Descartar gravação"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={sendAudioPreview}
                      className="text-emerald-950 bg-emerald-500 hover:bg-emerald-400 p-2 rounded-full transition-transform hover:scale-105 flex-shrink-0"
                      title="Enviar áudio"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 bg-black border border-red-800 text-red-400 px-4 py-2 flex items-center justify-between rounded-sm">
                  <span className="text-sm font-bold flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full bg-red-500 ${isRecordingPaused ? 'opacity-50' : 'animate-pulse'}`}></span>
                    {isRecordingPaused ? 'Pausado' : 'Gravando'} {formatTime(recordingTime)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={isRecordingPaused ? resumeRecording : pauseRecording}
                      className="text-amber-500 hover:text-amber-300 p-2 bg-amber-950/30 rounded-full border border-amber-900/50 transition-colors"
                      title={isRecordingPaused ? "Retomar" : "Pausar"}
                    >
                      {isRecordingPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    </button>
                    <button 
                      type="button"
                      onClick={stopAndPreviewRecording}
                      className="text-emerald-500 hover:text-emerald-300 p-2 bg-emerald-950/30 rounded-full border border-emerald-900/50 transition-colors"
                      title="Parar e ouvir"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button 
                      type="button"
                      onClick={cancelRecording}
                      className="text-red-500 hover:text-red-300 transition-colors p-2 bg-red-950/30 rounded-full border border-red-900/50"
                      title="Cancelar gravação"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            ) : ("""

code = re.sub(old_ui, new_ui, code, count=1)

with open('src/App.tsx', 'w') as f:
    f.write(code)

print("Patched recording features")

