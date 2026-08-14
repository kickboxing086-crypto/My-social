import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update Types (Report, Suggestion, Appeal)
old_types = """type Report = {
  id: string;
  type: 'profanity' | 'user';
  reportedUser: string;
  reportedBy: string;
  reason: string;
  timestamp: any;
  adminReply?: string;
  repliedAt?: any;
};

type Suggestion = {
  id: string;
  sender: string;
  text: string;
  timestamp: any;
  adminReply?: string;
  repliedAt?: any;
};

type Appeal = {
  id: string;
  username: string;
  name: string;
  reason: string;
  timestamp: any;
  bannedAt?: any;
  status: 'pending' | 'approved' | 'rejected';
  adminReplyText?: string;
  adminReplyImage?: string;
  repliedAt?: any;
};"""

new_types = """type Report = {
  id: string;
  type: 'profanity' | 'user' | 'auto_moderation';
  reportedUser: string;
  reportedBy: string;
  reason: string;
  timestamp: any;
  adminReply?: string;
  repliedAt?: any;
  assignedAdmin?: string;
  groupId?: string;
  topic?: string;
  attachmentUrl?: string;
};

type Suggestion = {
  id: string;
  sender: string;
  text: string;
  timestamp: any;
  adminReply?: string;
  repliedAt?: any;
  assignedAdmin?: string;
  groupId?: string;
  topic?: string;
};

type Appeal = {
  id: string;
  username: string;
  name: string;
  reason: string;
  timestamp: any;
  bannedAt?: any;
  status: 'pending' | 'approved' | 'rejected';
  adminReplyText?: string;
  adminReplyImage?: string;
  repliedAt?: any;
  assignedAdmin?: string;
  groupId?: string;
  topic?: string;
};"""

if old_types in text:
    text = text.replace(old_types, new_types)
    print("Updated types successfully.")
else:
    print("Could not find exact old_types match, checking fallback...")

# 2. Update PROFANITY_LIST
old_profanity = "const PROFANITY_LIST = ['merda', 'porra', 'caralho', 'fdp', 'puta', 'cuzão', 'idiota', 'lixo', 'bosta'];"
new_profanity = "const PROFANITY_LIST = ['merda', 'porra', 'caralho', 'fdp', 'puta', 'cuzão', 'idiota', 'lixo', 'bosta', 'pau', 'vagina', 'buceta', 'piru', 'viado', 'corno', 'arrombado', 'desgraçado', 'otário', 'slut', 'fuck', 'sexo', 'porno', 'pornô', 'nude', 'nudes', 'estupro', 'pedofilia', 'nazista', 'matar', 'assassino'];"

if old_profanity in text:
    text = text.replace(old_profanity, new_profanity)
    print("Updated PROFANITY_LIST.")

# 3. Update isAdmin / isGeneralAdmin and add getRandomAssignedAdmin + renderRoleBadge
old_is_admin = """  const isAdmin = !!(
    currentUser?.username?.toLowerCase() === 'samuellsilvva02' ||
    currentUser?.role?.toLowerCase() === 'admin' ||
    currentUser?.role?.toLowerCase() === 'administrador'
  );"""

new_is_admin = """  const isGeneralAdmin = !!(
    currentUser?.role?.toLowerCase() === 'administrador geral' ||
    currentUser?.username?.toLowerCase() === 'samuellsilvva02'
  );

  const isAdmin = isGeneralAdmin || !!(
    currentUser?.role?.toLowerCase() === 'administrador' ||
    currentUser?.role?.toLowerCase() === 'admin'
  );

  const [adminCaseFilter, setAdminCaseFilter] = useState<'all' | 'my_cases'>('all');

  const getRandomAssignedAdmin = (membersList: DevUser[]): string => {
    const adminPool = membersList.filter(m => {
      const r = (m.role || '').toLowerCase();
      const u = (m.username || '').toLowerCase();
      return r === 'administrador geral' || r === 'administrador' || r === 'admin' || u === 'samuellsilvva02';
    });
    if (adminPool.length > 0) {
      const randomIndex = Math.floor(Math.random() * adminPool.length);
      return adminPool[randomIndex].username;
    }
    return currentUser?.username || 'samuellsilvva02';
  };

  const renderRoleBadge = (roleStr?: string, usernameStr?: string) => {
    const r = (roleStr || '').toLowerCase();
    const u = (usernameStr || '').toLowerCase();
    const isGenAdmin = r === 'administrador geral' || u === 'samuellsilvva02';
    const isStdAdmin = !isGenAdmin && (r === 'administrador' || r === 'admin');

    if (isGenAdmin) {
      return (
        <span className="bg-gradient-to-r from-fuchsia-950 via-purple-900 to-indigo-950 border border-fuchsia-500 text-fuchsia-200 shadow-[0_0_12px_rgba(217,70,239,0.5)] font-black tracking-wider uppercase px-2 py-0.5 rounded text-[9px] sm:text-[10px] flex items-center gap-1 shrink-0">
          <Crown className="w-3 h-3 text-fuchsia-400 shrink-0" />
          <ShieldCheck className="w-3 h-3 text-fuchsia-400 shrink-0" />
          <span>ADMINISTRADOR GERAL</span>
        </span>
      );
    } else if (isStdAdmin) {
      return (
        <span className="bg-red-950/90 border border-red-700/80 text-red-300 font-bold tracking-wider uppercase px-2 py-0.5 rounded text-[9px] sm:text-[10px] flex items-center gap-1 shrink-0">
          <Shield className="w-3 h-3 text-red-400 shrink-0" />
          <span>ADMINISTRADOR</span>
        </span>
      );
    }
    return (
      <span className="bg-zinc-900 border border-zinc-800 text-zinc-400 font-medium px-2 py-0.5 rounded text-[9px] sm:text-[10px]">
        {roleStr || 'Membro'}
      </span>
    );
  };"""

if old_is_admin in text:
    text = text.replace(old_is_admin, new_is_admin)
    print("Updated isAdmin and added helpers.")

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Finished initial script.")
