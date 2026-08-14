import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update lucide-react imports to include MoreVertical and MoreHorizontal
if 'MoreVertical' not in text:
    text = text.replace(
        "import { Globe, Menu, Crown,",
        "import { Globe, Menu, Crown, MoreVertical, MoreHorizontal,"
    )

# 2. Add state variables for open dropdown menus if not present
state_declarations = """  // Members & Admin Management States
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [openMemberMenuUsername, setOpenMemberMenuUsername] = useState<string | null>(null);
  const [openGroupMemberMenuUser, setOpenGroupMemberMenuUser] = useState<string | null>(null);
  const [showHeaderAdminMenu, setShowHeaderAdminMenu] = useState(false);
  const [showAdminIdActionMenu, setShowAdminIdActionMenu] = useState(false);
  const [openMessageMenuId, setOpenMessageMenuId] = useState<string | null>(null);"""

text = re.sub(
    r'  // Members & Admin Management States\s*const \[showMembersModal, setShowMembersModal\] = useState\(false\);',
    state_declarations,
    text
)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Step 1: Added imports and dropdown menu states successfully!")
