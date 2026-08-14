import sys

with open('src/App.tsx', 'r') as f:
    code = f.read()

state_additions = """
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
"""

if "const [searchQuery" not in code:
    code = code.replace("  const [view, setView]", state_additions + "\n  const [view, setView]")
    
# also we need to add Search in imports
if "Search," not in code:
    code = code.replace("import { Terminal", "import { Terminal, Search")

# also filteredMessages was placed wrong? 
# The regex replaced `  return (` which is probably the first `return (` in `AudioPlayer`!
# Ah! I replaced `return (`. `AudioPlayer` has a `return (`. That's why it failed with "Cannot find name 'messages'" in `AudioPlayer`!

with open('src/App.tsx', 'w') as f:
    f.write(code)

print("Added state")
