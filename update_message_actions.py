import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Locate the delete button div start
start_str = "{(msg.sender === currentUser?.username || isAdmin) && ("
pos_start = text.find(start_str, text.find("// --- CHAT VIEW ---"))

# Locate report button and pin button
pos_pin_end = text.find("</button>", text.find("handleTogglePinMessage(msg.id", pos_start)) + len("</button>")
# If admin pin button exists after report button
if pos_pin_end < pos_start:
    pos_pin_end = text.find("</div>", text.find("handleDeleteMessage", pos_start)) + len("</div>")

print("pos_start:", pos_start, "pos_pin_end:", pos_pin_end)
print("Slice to replace:\n", text[pos_start:pos_pin_end])

