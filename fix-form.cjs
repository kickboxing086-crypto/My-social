const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `{(() => {
          const currentGroupObj = groups.find(g => g.id === currentGroupId);
          const isClosed = currentGroupObj?.closedTopics?.includes(currentTopic || 'Geral');
          const isGrpAdmin = currentGroupObj?.owners.includes(currentUser?.username || '') || isAdmin;
          
          if (isClosed && !isGrpAdmin) {
            return (
              <div className="flex justify-center items-center py-4 bg-black/40 border border-red-900/30 rounded-sm">
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-widest">
                  <Lock className="w-4 h-4" />
                  <span>Tópico fechado para novas mensagens</span>
                </div>
              </div>
            );
          }

          return (
            <form`;

code = code.replace(/<form onSubmit=\{handleSendMessage\} className="flex items-end gap-1 sm:gap-2 relative">/, replacement);

code = code.replace(/<Send className="w-4 h-4" \/>\n\s*<\/button>\n\s*<\/form>/, `<Send className="w-4 h-4" />\n            </button>\n          </form>\n          );\n        })()}`);

fs.writeFileSync('src/App.tsx', code);
