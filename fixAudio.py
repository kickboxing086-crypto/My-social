import sys

with open('src/App.tsx', 'r') as f:
    code = f.read()

# Replace any lingering <audio src=... controls />
import re
# We look for the div holding it and replace it.
old_audio = r'<div className="flex flex-col gap-1 w-full max-w-xs">\s*<span className="text-emerald-300 text-xs truncate max-w-full">\{msg\.attachment\.name\}</span>\s*<audio src=\{msg\.attachment\.url\} controls className="h-10 w-full" />\s*</div>'

new_audio = r'<AudioPlayer src={msg.attachment.url} name={msg.attachment.name} />'

code = re.sub(old_audio, new_audio, code)

with open('src/App.tsx', 'w') as f:
    f.write(code)
print("Replaced lingering audio controls")
