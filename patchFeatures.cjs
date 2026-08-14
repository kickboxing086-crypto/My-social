const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add AudioPlayer component
const audioPlayerCode = `
const AudioPlayer = ({ src, name }: { src: string, name: string }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && isFinite(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return \`\${minutes}:\${seconds.toString().padStart(2, '0')}\`;
  };

  return (
    <div className="flex flex-col gap-2 w-full min-w-[200px] sm:min-w-[260px] bg-emerald-950/40 border border-emerald-900/60 p-3 rounded-2xl shadow-inner mt-1 mb-1">
      <div className="flex items-center gap-3">
        <button 
          onClick={togglePlay}
          className="bg-emerald-500 hover:bg-emerald-400 text-black w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-105 shadow-md flex-shrink-0"
        >
          {isPlaying ? <Square className="w-3.5 h-3.5" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-emerald-100 text-xs font-bold truncate max-w-[130px]">{name}</span>
            <span className="text-emerald-500/80 text-[10px] font-mono tracking-wider">
              {formatTime(currentTime)}
            </span>
          </div>
          <div className="h-1.5 bg-black/60 rounded-full overflow-hidden border border-emerald-900/30">
            <div 
              className="h-full bg-emerald-400 transition-all duration-100 ease-linear shadow-[0_0_8px_rgba(52,211,153,0.5)]" 
              style={{ width: \`\${progress}%\` }}
            />
          </div>
        </div>
      </div>
      <audio 
        ref={audioRef} 
        src={src} 
        onTimeUpdate={handleTimeUpdate} 
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        className="hidden" 
      />
    </div>
  );
};
`;

if (!code.includes('const AudioPlayer')) {
  code = code.replace(
    'const App = () => {',
    audioPlayerCode + '\nconst App = () => {'
  );
}

// Add cancel recording logic
const cancelRecordingCode = `
  const cancelRecording = () => {
    if (isRecording) {
      if (recordingInterval.current) clearInterval(recordingInterval.current);
      setIsRecording(false);
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.onstop = null; // Prevent saving
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    }
  };
`;

if (!code.includes('const cancelRecording')) {
  code = code.replace(
    'const toggleRecording = async () => {',
    cancelRecordingCode + '\n  const toggleRecording = async () => {'
  );
}

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx basic features injected.');
