const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. imports
code = code.replace(
  "import { Terminal, Send, Code, User, Power, UserPlus, ArrowLeft, Server, Paperclip, Mic, FileText, Image as ImageIcon, Play, Square, Eye, EyeOff, ShieldAlert, Flag, Gavel, Lightbulb, X, AlertTriangle } from 'lucide-react';",
  "import { Terminal, Send, Code, User, Power, UserPlus, ArrowLeft, Server, Paperclip, Mic, FileText, Image as ImageIcon, Play, Square, Eye, EyeOff, ShieldAlert, Flag, Gavel, Lightbulb, X, AlertTriangle, Trash2 } from 'lucide-react';"
);

code = code.replace(
  "import { collection, doc, setDoc, getDoc, updateDoc, onSnapshot, query, orderBy, addDoc, serverTimestamp, where, getDocs } from 'firebase/firestore';",
  "import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, addDoc, serverTimestamp, where, getDocs } from 'firebase/firestore';"
);

// 2. Message type
code = code.replace(
  "  timestamp?: any;\n};",
  "  timestamp?: any;\n  viewOnce?: boolean;\n  expired?: boolean;\n};"
);

// 3. state
code = code.replace(
  "const [inputValue, setInputValue] = useState('');",
  "const [inputValue, setInputValue] = useState('');\n  const [isViewOnce, setIsViewOnce] = useState(false);"
);

// 4. delete and view once functions
code = code.replace(
  "const handleLogin = async (e: React.FormEvent) => {",
  `const handleDeleteMessage = async (msgId: string) => {
    if (confirm('Apagar esta mensagem para todos?')) {
      await deleteDoc(doc(db, 'messages', msgId));
    }
  };

  const handleOpenViewOnce = async (msg: Message) => {
    // Only viewable once, so we expire it in the DB immediately.
    // It will remain visible only inside the current UI block until unmounted,
    // actually, let's just make it show inline but mark it expired in DB.
    // We can do this by setting a local state for currently viewing view-once messages.
    // But since it re-renders, if we mark it expired it will hide. 
    // We need local state: \`const [viewingHidden, setViewingHidden] = useState<Record<string, boolean>>({});\`
    // Wait, simpler: I'll just add the state at the top.
  };

  const handleLogin = async (e: React.FormEvent) => {`
);

// Fix state definition for viewingHidden
code = code.replace(
  "const [isViewOnce, setIsViewOnce] = useState(false);",
  "const [isViewOnce, setIsViewOnce] = useState(false);\n  const [viewingHidden, setViewingHidden] = useState<Record<string, boolean>>({});"
);

// update handleOpenViewOnce
code = code.replace(
  "const handleOpenViewOnce = async (msg: Message) => {",
  `const handleOpenViewOnce = async (msg: Message) => {
    setViewingHidden(prev => ({ ...prev, [msg.id]: true }));
    await updateDoc(doc(db, 'messages', msg.id), { expired: true });
  };`
);

// replace audio name and add viewOnce
code = code.replace(
  "name: \`Mensagem de Voz (\${currentRecordingTime}s)\`,",
  "name: 'Mensagem de Voz',"
);

// replace all addDoc calls for messages to include viewOnce and expired
code = code.replace(
  "timestamp: serverTimestamp()\n        });\n      } catch (err: any) {",
  "viewOnce: isViewOnce,\n          expired: false,\n          timestamp: serverTimestamp()\n        });\n        setIsViewOnce(false);\n      } catch (err: any) {"
);

code = code.replace(
  "timestamp: serverTimestamp()\n                });\n              } catch (e: any) {",
  "viewOnce: isViewOnce,\n                  expired: false,\n                  timestamp: serverTimestamp()\n                });\n                setIsViewOnce(false);\n              } catch (e: any) {"
);

code = code.replace(
  "type: 'user',\n      timestamp: serverTimestamp()\n    });\n    \n    setInputValue('');",
  "type: 'user',\n      viewOnce: isViewOnce,\n      expired: false,\n      timestamp: serverTimestamp()\n    });\n    \n    setInputValue('');\n    setIsViewOnce(false);"
);

// modify message render logic
// we need to replace the entire <div key={msg.id} ...> inside the messages.map
fs.writeFileSync('src/App.tsx', code);
