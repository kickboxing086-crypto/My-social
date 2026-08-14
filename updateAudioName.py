import sys

with open('src/App.tsx', 'r') as f:
    code = f.read()

code = code.replace("name: `Áudio gravado.webm`", "name: 'Mensagem de voz'")
code = code.replace("name={`Audio de ${formatTime(recordingTime)}`}", "name='Mensagem de voz'")

with open('src/App.tsx', 'w') as f:
    f.write(code)

print("Updated audio names!")
