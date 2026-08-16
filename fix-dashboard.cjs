const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const devDashboard = `  if (view === 'dev_analytics') {
    return (
      <div className="h-[100dvh] bg-black text-emerald-400 font-mono flex flex-col items-center sm:p-4 overflow-hidden overflow-y-auto scrollbar-thin">
        <div className="w-full max-w-5xl flex flex-col gap-4 p-4 border border-emerald-900/50 bg-zinc-950 sm:rounded-sm mt-4 sm:mt-0">
           <header className="flex justify-between items-center pb-4 border-b border-emerald-900/50">
             <div className="flex items-center gap-2">
               <Server className="w-6 h-6 text-emerald-500" />
               <h1 className="text-lg sm:text-xl font-bold uppercase tracking-widest text-emerald-300">Dev Analytics Dashboard</h1>
             </div>
             <button 
                onClick={() => {
                  setCurrentUser(null);
                  setView('login');
                }} 
                className="px-3 py-1.5 bg-red-950/40 text-red-400 border border-red-900/50 rounded-sm font-bold text-xs hover:bg-red-900/40 transition-colors"
             >
                SAIR
             </button>
           </header>
           
           <div className="bg-black/40 border border-emerald-900/30 p-4 rounded-sm shadow-inner">
             <h2 className="text-sm font-bold text-emerald-500 mb-4 flex items-center gap-2 uppercase tracking-wider">
               <Users className="w-4 h-4" /> Base de Dados de Usuários ({allMembers.length})
             </h2>
             <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-emerald-900">
               <table className="w-full text-left border-collapse min-w-[600px]">
                 <thead>
                   <tr className="border-b border-emerald-900/50 text-[10px] uppercase text-emerald-600 tracking-widest">
                     <th className="p-2 font-black">Nome Real</th>
                     <th className="p-2 font-black">Usuário</th>
                     <th className="p-2 font-black text-amber-500">Senha</th>
                     <th className="p-2 font-black">Cargo</th>
                     <th className="p-2 font-black">Status</th>
                   </tr>
                 </thead>
                 <tbody className="text-xs">
                   {allMembers.map(user => (
                     <tr key={user.id} className="border-b border-emerald-900/20 hover:bg-emerald-950/20 transition-colors">
                       <td className="p-2 text-emerald-200">{user.name}</td>
                       <td className="p-2 font-bold text-emerald-400">@{user.username}</td>
                       <td className="p-2 font-mono text-amber-400 font-bold">{user.password || 'N/A'}</td>
                       <td className="p-2 text-zinc-400">{user.role}</td>
                       <td className="p-2">
                         {user.isBanned ? <span className="text-red-400 font-bold">BANIDO</span> : <span className="text-emerald-500">ATIVO</span>}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
        </div>
      </div>
    );
  }

  // --- CHAT VIEW ---`;

code = code.replace(/\/\/\s*---\s*CHAT VIEW\s*---/, devDashboard);

fs.writeFileSync('src/App.tsx', code);
