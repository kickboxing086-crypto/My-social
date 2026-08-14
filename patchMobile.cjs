const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Main container mobile fixes
code = code.replace(
  '<div className="min-h-screen bg-black text-emerald-400 font-mono flex flex-col items-center p-2 sm:p-4">',
  '<div className="min-h-[100dvh] bg-black text-emerald-400 font-mono flex flex-col items-center sm:p-4">'
);

code = code.replace(
  '<div className="w-full max-w-5xl h-[95vh] flex flex-col border border-emerald-900/50 bg-zinc-950 rounded-sm relative overflow-hidden shadow-2xl">',
  '<div className="w-full max-w-5xl h-[100dvh] sm:h-[95vh] flex flex-col sm:border border-emerald-900/50 bg-zinc-950 sm:rounded-sm relative overflow-hidden sm:shadow-2xl">'
);

// 2. Message max-width for mobile and safe padding
code = code.replace(
  'max-w-[80%] relative group',
  'max-w-[88%] sm:max-w-[80%] relative group mt-2'
);

// 3. Trash button visibility on mobile
code = code.replace(
  'className="absolute -top-3 -right-3 bg-red-900/80 text-red-300 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-800 z-10"',
  'className="absolute -top-3 -right-2 sm:-right-3 bg-red-900 border border-red-700 text-red-200 p-1.5 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-red-800 z-10 shadow-lg"'
);

// 4. Report button visibility on mobile
code = code.replace(
  'className="ml-2 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"',
  'className="ml-2 text-zinc-500 hover:text-red-400 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1"'
);

// 5. Bottom bar spacing for mobile keyboards
code = code.replace(
  '<div className="p-3 bg-zinc-900 border-t border-emerald-900/50 shrink-0 relative z-20">',
  '<div className="p-2 sm:p-3 pb-4 sm:pb-3 bg-zinc-900 border-t border-emerald-900/50 shrink-0 relative z-20">'
);

// 6. Make input buttons slightly larger for touch
code = code.replace(
  'className={`px-3 bg-black border transition-colors rounded-sm flex items-center justify-center ${isViewOnce ? \'border-amber-700 text-amber-500 hover:bg-amber-900/30\' : \'border-emerald-800 text-emerald-500 hover:text-emerald-300 hover:bg-emerald-900/30\'}`}',
  'className={`px-4 sm:px-3 bg-black border transition-colors rounded-sm flex items-center justify-center ${isViewOnce ? \'border-amber-700 text-amber-500 hover:bg-amber-900/30\' : \'border-emerald-800 text-emerald-500 hover:text-emerald-300 hover:bg-emerald-900/30\'}`}'
);

code = code.replace(
  'className="px-3 bg-black border border-emerald-800 text-emerald-500 hover:text-emerald-300 hover:bg-emerald-900/30 transition-colors rounded-sm flex items-center justify-center"',
  'className="px-4 sm:px-3 bg-black border border-emerald-800 text-emerald-500 hover:text-emerald-300 hover:bg-emerald-900/30 transition-colors rounded-sm flex items-center justify-center"'
);

code = code.replace(
  'className="bg-emerald-900/50 hover:bg-emerald-800 text-emerald-300 border border-emerald-700 px-6 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center rounded-sm"',
  'className="bg-emerald-900/50 hover:bg-emerald-800 text-emerald-300 border border-emerald-700 px-5 sm:px-6 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center rounded-sm"'
);

fs.writeFileSync('src/App.tsx', code);
console.log("Mobile optimizations applied.");
