import sys

with open('src/App.tsx', 'r') as f:
    code = f.read()

# 1. Update AudioPlayer call sites to include durationSec
old_ap_call1 = "<AudioPlayer src={msg.attachment.url} name={msg.attachment.name} />"
new_ap_call1 = "<AudioPlayer src={msg.attachment.url} name={msg.attachment.name} durationSec={msg.attachment.duration} />"

code = code.replace(old_ap_call1, new_ap_call1)

# 2. Update sendAudioPreview to save attachment duration: recordingTime
old_send_audio = """            attachment: {
              name: 'Mensagem de voz',
              fileType: 'audio',
              url: base64data
            },"""

new_send_audio = """            attachment: {
              name: `Mensagem de voz (${recordingTime}s)`,
              fileType: 'audio',
              url: base64data,
              duration: recordingTime
            },"""

code = code.replace(old_send_audio, new_send_audio)

# 3. Add audio chime synth & Web push notification helpers before App component
audio_helpers = """
// HUD Sound Synth for Notifications & Mic Test
const playHUDChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15); // A6
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) {
    // Audio context fallback
  }
};
"""

if "const playHUDChime =" not in code:
    code = code.replace("export default function App() {", audio_helpers + "\nexport default function App() {")

with open('src/App.tsx', 'w') as f:
    f.write(code)

print("Step 2 applied successfully!")
