const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /const isSelected = \(currentTopic \|\| 'Geral'\) === tName;\n\s*return \(/g,
  `const isSelected = (currentTopic || 'Geral') === tName;
                  const isClosed = (group.closedTopics || []).includes(tName);
                  return (`
);

code = code.replace(
  /<span className="flex items-center gap-2">\n\s*<Hash className=\{`w-3\.5 h-3\.5 \$\{isSelected \? 'text-emerald-400 animate-pulse' : 'text-emerald-600'\}`\} \/>\n\s*#\{tName\}\n\s*<\/span>/g,
  `<span className="flex items-center gap-2">
                        <Hash className={\`w-3.5 h-3.5 \${isSelected ? 'text-emerald-400 animate-pulse' : 'text-emerald-600'}\`} />
                        #{tName}
                        {isClosed && <Lock className="w-3 h-3 text-red-400/80 ml-1" title="Tópico Fechado" />}
                      </span>`
);

fs.writeFileSync('src/App.tsx', code);
