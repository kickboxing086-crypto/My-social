const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const section4 = `
              {/* SEÇÃO 4 */}
              <div className="bg-black/60 p-3.5 rounded border border-zinc-800/80 space-y-2">
                <h3 className="text-emerald-400 font-bold text-xs uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  4. GRUPOS E COMUNIDADES
                </h3>
                <p className="text-zinc-300 text-[11px]">
                  O MY SOCIAL permite a criação de grupos com links de convite. As regras globais aplicam-se a <strong>TODOS OS GRUPOS</strong> criados dentro da plataforma.
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-zinc-400 text-[11px]">
                  <li>
                    <strong className="text-zinc-200">Responsabilidade do Líder 👑:</strong> Os Líderes e Administradores de grupos são co-responsáveis pelo conteúdo compartilhado em suas comunidades e devem reportar abusos.
                  </li>
                  <li>
                    <strong className="text-zinc-200">Chat Global:</strong> O Chat Global permanece sendo um espaço aberto a todos e segue rigorosamente a política de moderação ativa.
                  </li>
                </ul>
              </div>
`;

code = code.replace('            </div>\n\n            <div className="flex justify-end p-4 border-t border-emerald-900/50 bg-zinc-950">', section4 + '\n            </div>\n\n            <div className="flex justify-end p-4 border-t border-emerald-900/50 bg-zinc-950">');
fs.writeFileSync('src/App.tsx', code);
