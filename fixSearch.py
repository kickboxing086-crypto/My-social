import sys

with open('src/App.tsx', 'r') as f:
    code = f.read()

bad_block = """  const filteredMessages = messages.filter(msg => {
    if (!searchQuery.trim()) return true;
    return msg.text?.toLowerCase().includes(searchQuery.toLowerCase()) || 
           msg.sender?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           msg.attachment?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });
"""

code = code.replace(bad_block, "")

# We need to insert it inside `App` before the last return.
# Let's find `  if (view === 'chat') {` or the main chat return.
# Wait, let's just put it at the top of App! Wait, no, we need `messages` and `searchQuery` state.
# Let's put it right after `const [searchQuery, setSearchQuery] = useState('');` and other states.
# Actually, it's a computed value. So anywhere in `App` is fine.

app_block = """
  const filteredMessages = messages.filter(msg => {
    if (!searchQuery.trim()) return true;
    return msg.text?.toLowerCase().includes(searchQuery.toLowerCase()) || 
           msg.sender?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           msg.attachment?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });
"""

# Let's find `const formatTime = (seconds: number) => {` inside App, which is at the end of functions.
# Or just after `const submitReport = ...`
code = code.replace("  const submitReport = async () => {", app_block + "\n  const submitReport = async () => {")

with open('src/App.tsx', 'w') as f:
    f.write(code)

print("Fixed search logic placement")
