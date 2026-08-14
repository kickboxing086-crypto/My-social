import re

with open('src/App.tsx', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

# 1. Clean up encoding corruptions
corruptions = [
    ('Visualização Á\x9anica', 'Visualização Única'),
    ('Visualização Ášnica', 'Visualização Única'),
    ('NOTIFICAÁ\x87Á\x95ES ATIVADAS', 'NOTIFICAÇÕES ATIVADAS'),
    ('PERMISSÁ\x83O NEGADA', 'PERMISSÃO NEGADA'),
    ('VALIDAÁ\x87Á\x83O DE SENHA', 'VALIDAÇÃO DE SENHA'),
    ('CONEXÁ\x83O FALHOU', 'CONEXÃO FALHOU'),
    ('AÁ\x87Á\x83O NEGADA', 'AÇÃO NEGADA'),
    ('APELAÁ\x87Á\x83O EM ANÁLISE', 'APELAÇÃO EM ANÁLISE'),
    ('APELAÁ\x87Á\x83O REGISTRADA', 'APELAÇÃO REGISTRADA'),
    ('DENÁ\x9aNCIA ENVIADA', 'DENÚNCIA ENVIADA'),
    ('SUGESTÁ\x83O REGISTRADA', 'SUGESTÃO REGISTRADA'),
    ('JULGAMENTO DE APELAÁ\x87Á\x83O', 'JULGAMENTO DE APELAÇÃO'),
    ('LIMITE DE EDIÇÁO', 'LIMITE DE EDIÇÃO'),
    ('Visualização Ášnica (Visível para Administrador)', 'Visualização Única (Visível para Administrador)'),
    ('Você enviou (Visualização Ášnica)', 'Você enviou (Visualização Única)'),
    ('Visualização Ášnica (Irá sumir ao fechar)', 'Visualização Única (Irá sumir ao fechar)'),
]

for old, new in corruptions:
    text = text.replace(old, new)

# Also check regex for any remaining Á\x9a or Ášnica
text = re.sub(r'Visualização\s+Á[\x80-\x9f\w]*nica', 'Visualização Única', text)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Corrupted strings cleaned up!")
