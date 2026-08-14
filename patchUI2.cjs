const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldRecordingHTML = `{isRecording ? (
              <div className="flex-1 bg-black border border-red-800 text-red-400 px-4 py-3 flex items-center">
                Gravando... {formatTime(recordingTime)}
              </div>
            ) : (`;

const newRecordingHTML = `{isRecording ? (
              <div className="flex-1 bg-black border border-red-800 text-red-400 px-4 py-2 flex items-center justify-between">
                <span className="text-sm font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  Gravando {formatTime(recordingTime)}
                </span>
                <button 
                  type="button"
                  onClick={cancelRecording}
                  className="text-red-500 hover:text-red-300 transition-colors p-2 bg-red-950/30 rounded-full border border-red-900/50"
                  title="Cancelar gravação"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (`;

code = code.replace(oldRecordingHTML, newRecordingHTML);
fs.writeFileSync('src/App.tsx', code);
console.log('Recording UI patched.');
