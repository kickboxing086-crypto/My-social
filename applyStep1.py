import sys

with open('src/App.tsx', 'r') as f:
    code = f.read()

# 1. Update lucide-react imports
old_imports = "import { Terminal, Search, Send, Code, User, Power, UserPlus, ArrowLeft, Server, Paperclip, Mic, FileText, Image as ImageIcon, Play, Square, Eye, EyeOff, ShieldAlert, Flag, Gavel, Lightbulb, X, AlertTriangle, Trash2, Pause, Check } from 'lucide-react';"
new_imports = "import { Terminal, Search, Send, Code, User, Power, UserPlus, ArrowLeft, Server, Paperclip, Mic, FileText, Image as ImageIcon, Play, Square, Eye, EyeOff, ShieldAlert, Flag, Gavel, Lightbulb, X, AlertTriangle, Trash2, Pause, Check, Users, Bell, BellOff, MessageSquare, Shield, ShieldCheck, UserX, UserCheck } from 'lucide-react';"

if old_imports in code:
    code = code.replace(old_imports, new_imports)

# 2. Update DevUser type
old_devuser = """type DevUser = {
  uid?: string;
  name: string;
  username: string;
  role: string;
  password?: string;
  isBanned?: boolean;
};"""

new_devuser = """type DevUser = {
  id?: string;
  uid?: string;
  name: string;
  username: string;
  role: string;
  password?: string;
  isBanned?: boolean;
  createdAt?: any;
};"""

code = code.replace(old_devuser, new_devuser)

# 3. Update Attachment type
old_attachment = """type Attachment = {
  name: string;
  fileType: 'image' | 'document' | 'audio';
  url?: string;
};"""

new_attachment = """type Attachment = {
  name: string;
  fileType: 'image' | 'document' | 'audio';
  url?: string;
  duration?: number;
};"""

code = code.replace(old_attachment, new_attachment)

# 4. Update Report & Suggestion types
old_report = """type Report = {
  id: string;
  type: 'profanity' | 'user';
  reportedUser: string;
  reportedBy: string;
  reason: string;
  timestamp: any;
};"""

new_report = """type Report = {
  id: string;
  type: 'profanity' | 'user';
  reportedUser: string;
  reportedBy: string;
  reason: string;
  timestamp: any;
  adminReply?: string;
  repliedAt?: any;
};"""

code = code.replace(old_report, new_report)

old_sug = """type Suggestion = {
  id: string;
  sender: string;
  text: string;
  timestamp: any;
};"""

new_sug = """type Suggestion = {
  id: string;
  sender: string;
  text: string;
  timestamp: any;
  adminReply?: string;
  repliedAt?: any;
};"""

code = code.replace(old_sug, new_sug)

# 5. Replace AudioPlayer with enhanced AudioPlayer
old_audioplayer = """const AudioPlayer = ({ src, name }: { src: string, name: string }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
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
      if (audioRef.current.duration) {
        setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
      }
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-1.5 w-full max-w-[280px] bg-emerald-950/50 border border-emerald-900/80 p-2.5 rounded-xl shadow-inner my-1">
      <div className="flex items-center gap-2.5">
        <button 
          type="button"
          onClick={togglePlay}
          className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black w-9 h-9 rounded-full flex items-center justify-center transition-transform shadow-md flex-shrink-0"
        >
          {isPlaying ? <Square className="w-3.5 h-3.5" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-emerald-100 text-xs font-bold truncate flex-1">{name}</span>
            <span className="text-emerald-400 text-[11px] font-mono font-semibold flex-shrink-0">
              {formatTime(currentTime)}
            </span>
          </div>
          <div className="h-1.5 bg-black/80 rounded-full overflow-hidden border border-emerald-900/50">
            <div 
              className="h-full bg-emerald-400 transition-all duration-100 ease-linear shadow-[0_0_8px_rgba(52,211,153,0.5)]" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
      <audio 
        ref={audioRef} 
        src={src} 
        onTimeUpdate={handleTimeUpdate} 
        onEnded={() => setIsPlaying(false)}
        className="hidden" 
      />
    </div>
  );
};"""

new_audioplayer = """const AudioPlayer = ({ src, name, durationSec }: { src: string, name: string, durationSec?: number }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState<number>(durationSec || 0);

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

  const handleLoadedMetadata = () => {
    if (audioRef.current && isFinite(audioRef.current.duration) && !isNaN(audioRef.current.duration) && audioRef.current.duration > 0) {
      setTotalDuration(audioRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const cur = audioRef.current.currentTime;
      setCurrentTime(cur);
      
      const dur = (isFinite(audioRef.current.duration) && !isNaN(audioRef.current.duration) && audioRef.current.duration > 0)
        ? audioRef.current.duration
        : totalDuration;

      if (dur > 0) {
        setTotalDuration(dur);
        setProgress((cur / dur) * 100);
      }
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time) || time < 0) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderTimerText = () => {
    if (isPlaying) {
      return `${formatTime(currentTime)} / ${formatTime(totalDuration || currentTime)}`;
    }
    return totalDuration > 0 ? formatTime(totalDuration) : (currentTime > 0 ? formatTime(currentTime) : "0:00");
  };

  return (
    <div className="flex flex-col gap-1.5 w-full max-w-[280px] bg-emerald-950/60 border border-emerald-900/90 p-2.5 rounded-xl shadow-inner my-1">
      <div className="flex items-center gap-2.5">
        <button 
          type="button"
          onClick={togglePlay}
          className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black w-9 h-9 rounded-full flex items-center justify-center transition-transform shadow-md flex-shrink-0"
        >
          {isPlaying ? <Square className="w-3.5 h-3.5" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-emerald-100 text-xs font-bold truncate flex-1">{name}</span>
            <span className="text-emerald-300 text-[11px] font-mono font-bold flex-shrink-0 bg-black/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
              {renderTimerText()}
            </span>
          </div>
          <div className="h-1.5 bg-black/80 rounded-full overflow-hidden border border-emerald-900/50 relative">
            <div 
              className="h-full bg-emerald-400 transition-all duration-100 ease-linear shadow-[0_0_8px_rgba(52,211,153,0.6)]" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
      <audio 
        ref={audioRef} 
        src={src} 
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate} 
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
          setProgress(0);
        }}
        className="hidden" 
      />
    </div>
  );
};"""

code = code.replace(old_audioplayer, new_audioplayer)

with open('src/App.tsx', 'w') as f:
    f.write(code)

print("Step 1 applied successfully!")
