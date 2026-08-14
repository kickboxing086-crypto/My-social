import re

with open('src/App.tsx', 'r', encoding='utf-8', errors='replace') as f:
    text = f.read()

# Dictionary of all double-encoded / corrupted string patterns to clean replacement
dictionary = {
    'INICIALIZANDO CONEXÃƒO SEGURA...': 'CONECTANDO...',
    'INICIALIZANDO CONEXÃO SEGURA...': 'CONECTANDO...',
    'NOTIFICAÃ‡Ã•ES ATIVADAS': 'NOTIFICAÇÕES ATIVADAS',
    'PERMISSÃƒO NEGADA': 'PERMISSÃO NEGADA',
    'VALIDAÃ‡ÃƒO DE SENHA': 'VALIDAÇÃO DE SENHA',
    'CONEXÃƒO FALHOU': 'CONEXÃO FALHOU',
    'FALHA DE AUTENTICAÃ‡ÃƒO': 'FALHA DE AUTENTICAÇÃO',
    'AÃ‡ÃƒO NEGADA': 'AÇÃO NEGADA',
    'AÃ‡ÃƒO CONCLUÍDA': 'AÇÃO CONCLUÍDA',
    'APELAÃ‡ÃƒO EM ANÁLISE': 'APELAÇÃO EM ANÁLISE',
    'APELAÃ‡ÃƒO REGISTRADA': 'APELAÇÃO REGISTRADA',
    'DENÃšNCIA ENVIADA': 'DENÚNCIA ENVIADA',
    'SUGESTÃƒO REGISTRADA': 'SUGESTÃO REGISTRADA',
    'APELAÃ‡ÃƒO': 'APELAÇÃO',
    'SUGESTÃƒO': 'SUGESTÃO',
    'DENÃšNCIA': 'DENÚNCIA',
    'CONFIRMAÃ‡ÃƒO': 'CONFIRMAÇÃO',
    ('CONFIRMAÃ‡ÃƒO EM 2 ETAPAS (AÃ‡ÃƒO IRREVERSÍVEL)'): 'CONFIRMAÇÃO EM 2 ETAPAS (AÇÃO IRREVERSÍVEL)',
    'JULGAMENTO DE APELAÃ‡ÃƒO DE USUÁRIO': 'JULGAMENTO DE APELAÇÃO DE USUÁRIO',
    'ACEITAR APELAÃ‡ÃƒO & DESBANIR USUÁRIO': 'ACEITAR APELAÇÃO & DESBANIR USUÁRIO',
    'USUÁRIO DE REDE (ÃšNICO)': 'USUÁRIO DE REDE (ÚNICO)',
    'Visualização Ãšnica (Visível para Administrador)': 'Visualização Única (Visível para Administrador)',
    'Visualização Ãšnica': 'Visualização Única',
    'VisualizaÃ§Ã£o Ãšnica': 'Visualização Única',
    'VisualizaÃ§Ã£o': 'Visualização',
    'VisÃ­vel': 'Visível',
    'Ã‰ expressamente': 'É expressamente',
    'nÂº 13.709/2018': 'nº 13.709/2018',
    'requisitar Ã  administração': 'requisitar à administração',
    'banimento Ã  conta': 'banimento à conta',
    'Ã ': 'à',
    'Ã‰': 'É',
    'Ã': 'Á', # Fallback general replacement logic handled below
}

# Apply explicit dictionary first
for k, v in dictionary.items():
    if k != 'Ã':
        text = text.replace(k, v)

# Fix lines with remaining Ã using iso-8859-1 -> utf-8 conversion where possible
lines = text.split('\n')
new_lines = []
for line in lines:
    if 'Ã' in line:
        try:
            converted = line.encode('iso-8859-1').decode('utf-8')
            new_lines.append(converted)
        except Exception:
            # If standard iso-8859-1 decode fails, replace known residual byte combos
            c_line = line.replace('Ã‡', 'Ç').replace('Ã§', 'ç').replace('Ãƒ', 'Ã').replace('Ã£', 'ã').replace('Ã•', 'Õ').replace('Ãµ', 'õ').replace('Ã‰', 'É').replace('Ã©', 'é').replace('Ã“', 'Ó').replace('Ã³', 'ó').replace('Ãš', 'Ú').replace('Ãº', 'ú').replace('Ã', 'Á').replace('Ã¡', 'á').replace('Ã­', 'í').replace('Âº', 'º')
            new_lines.append(c_line)
    else:
        new_lines.append(line)

text = '\n'.join(new_lines)

# 2. Update the isLoading block cleanly
loading_block_pattern = r'if\s*\(\s*isLoading\s*\)\s*\{\s*return\s*\(.*?\);\s*\}'

new_loading_block = """  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 font-mono relative overflow-hidden select-none">
        {/* Subtle retro scanline backdrop */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] opacity-40 z-10"></div>
        
        {/* Centered card container */}
        <div className="relative z-20 flex flex-col items-center justify-center text-center max-w-sm w-full mx-auto p-8 rounded-sm bg-zinc-950 border border-emerald-900/80 shadow-2xl backdrop-blur-md">
          <div className="relative mb-6 flex items-center justify-center">
            <Globe className="w-12 h-12 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full -z-10 animate-pulse"></div>
          </div>
          
          <div className="flex items-center justify-center gap-2.5 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
            <span className="text-emerald-400 font-extrabold text-lg tracking-widest uppercase">
              CONECTANDO...
            </span>
          </div>
          
          <p className="text-emerald-700 text-xs font-mono tracking-widest uppercase mt-1">
            MY SOCIAL • REDE MENSAGEIRA
          </p>
        </div>
      </div>
    );
  }"""

text = re.sub(loading_block_pattern, new_loading_block, text, flags=re.DOTALL)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Saved updated App.tsx!")
