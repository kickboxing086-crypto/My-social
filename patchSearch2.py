import sys

with open('src/App.tsx', 'r') as f:
    code = f.read()

# Replace messages.map with filtered logic inline or create filteredMessages before return
filter_logic = """
  const filteredMessages = messages.filter(msg => {
    if (!searchQuery.trim()) return true;
    return msg.text?.toLowerCase().includes(searchQuery.toLowerCase()) || 
           msg.sender?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           msg.attachment?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });
"""

# inject right before `return (` of the main view? No, there are early returns for login, register, admin.
# Let's inject it inside the chat view block.
# the chat view starts with `<header className="bg-zinc-900 border-b border-emerald-900/50 p-3 flex flex-wrap gap-4 items-center justify-between shrink-0 relative z-20">`
# Let's inject the search UI in the header and change `messages.map` to `filteredMessages.map`.
# Wait, I can just define filteredMessages before the return. No, App.tsx has multiple early returns:
# if (view === 'login') return ...
# if (view === 'register') return ...
# if (view === 'admin') return ...
# The rest is chat. So I can define it right before the final `return (`.

find_return = "  return ("
if filter_logic not in code:
    code = code.replace(find_return, filter_logic + "\n  return (", 1)

code = code.replace("messages.map((msg) =>", "filteredMessages.map((msg) =>")

# Now inject the search UI in the header.
# We have a `<div className="flex items-center gap-4">` in the header.
# Let's add the search toggle and input in there.

old_header = """          <div className="flex items-center gap-4">
            <button onClick={() => setShowSuggestionModal(true)} className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-xs bg-blue-950/30 px-2 py-1 border border-blue-900/50 rounded-sm transition-colors">
              <Lightbulb className="w-3 h-3" />
              <span className="hidden sm:inline">Enviar Sugestão</span>
            </button>"""

new_header = """          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`flex items-center overflow-hidden transition-all duration-500 ease-out ${isSearching ? 'w-48 sm:w-64 opacity-100 px-2 bg-black border border-emerald-500/50 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'w-0 opacity-0 border-transparent'}`}>
                <Search className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar no chat..."
                  className="bg-transparent border-none outline-none text-emerald-300 text-sm w-full py-1.5 px-2 placeholder-emerald-800"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-emerald-600 hover:text-emerald-400 p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <button 
                onClick={() => {
                  setIsSearching(!isSearching);
                  if (isSearching) setSearchQuery('');
                }} 
                className={`p-2 rounded-full transition-all duration-300 ${isSearching ? 'bg-emerald-900/50 text-emerald-400' : 'text-emerald-600 hover:text-emerald-400 hover:bg-emerald-950/30'}`}
                title="Buscar mensagens"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
            <button onClick={() => setShowSuggestionModal(true)} className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-xs bg-blue-950/30 px-2 py-1 border border-blue-900/50 rounded-sm transition-colors">
              <Lightbulb className="w-3 h-3" />
              <span className="hidden sm:inline">Enviar Sugestão</span>
            </button>"""

code = code.replace(old_header, new_header)

with open('src/App.tsx', 'w') as f:
    f.write(code)
print("Added search UI")
