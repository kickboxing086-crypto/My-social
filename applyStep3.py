import sys

with open('src/App.tsx', 'r') as f:
    code = f.read()

# Insert new state variables inside App()
new_states = """  // Members & Admin Management States
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [allMembers, setAllMembers] = useState<DevUser[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [userToDeleteConfirm, setUserToDeleteConfirm] = useState<DevUser | null>(null);

  // Admin Reply States for Reports & Suggestions
  const [adminReplyTarget, setAdminReplyTarget] = useState<{ id: string; type: 'report' | 'suggestion'; user: string; text: string } | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');

  // Push Notifications State
  const [pushPermission, setPushPermission] = useState<NotificationPermission>(typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default');
  const [pushToast, setPushToast] = useState<{ sender: string; text: string } | null>(null);
  const prevMsgCountRef = useRef<number>(0);

  // Animated Mic Permission Modal State
  const [showMicPermissionModal, setShowMicPermissionModal] = useState(false);
  const [micTestActive, setMicTestActive] = useState(false);
  const [micAudioLevel, setMicAudioLevel] = useState(0);
"""

if "const [showMembersModal, setShowMembersModal] =" not in code:
    code = code.replace("const [isLoading, setIsLoading] = useState(true);", "const [isLoading, setIsLoading] = useState(true);\n" + new_states)

# Add listener for all members
members_effect = """  // Listener for all registered group members
  useEffect(() => {
    if (currentUser) {
      const qMembers = query(collection(db, 'users'), orderBy('name', 'asc'));
      const unsubMembers = onSnapshot(qMembers, (snapshot) => {
        const membersList: DevUser[] = [];
        snapshot.forEach((docSnap) => {
          membersList.push({ id: docSnap.id, ...docSnap.data() } as DevUser);
        });
        setAllMembers(membersList);
      });
      return () => unsubMembers();
    }
  }, [currentUser]);

  // Request Browser Push Notification Permission
  const requestPushPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      setPushPermission(perm);
      if (perm === 'granted') {
        showAlert('Notificações de push ativadas com sucesso! Você receberá alertas diretamente no seu dispositivo.', 'NOTIFICAÇÕES ATIVADAS', 'success');
        playHUDChime();
      } else if (perm === 'denied') {
        showAlert('As notificações foram bloqueadas no navegador. Para reativar, ajuste as permissões do site.', 'PERMISSÃO NEGADA', 'warning');
      }
    } else {
      showAlert('Seu navegador não possui suporte a notificações push nativas.', 'INDISPONÍVEL', 'warning');
    }
  };

  // Push notification trigger on new incoming messages
  useEffect(() => {
    if (messages.length > prevMsgCountRef.current && prevMsgCountRef.current > 0) {
      const latestMsg = messages[messages.length - 1];
      if (latestMsg && latestMsg.sender !== currentUser?.username && latestMsg.type !== 'system') {
        // Play HUD Chime audio sound
        playHUDChime();

        // Display in-app floating push toast
        setPushToast({
          sender: latestMsg.sender,
          text: latestMsg.text || (latestMsg.attachment ? `[${latestMsg.attachment.fileType.toUpperCase()}] ${latestMsg.attachment.name}` : 'Nova mensagem')
        });

        // Trigger native device browser notification if background/permitted
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification(`HUD DEVS - @${latestMsg.sender}`, {
              body: latestMsg.text || (latestMsg.attachment ? `Enviou um anexo: ${latestMsg.attachment.name}` : 'Enviou uma nova transmissão'),
              icon: '/favicon.ico'
            });
          } catch (e) {
            console.error('Push notification error:', e);
          }
        }
      }
    }
    prevMsgCountRef.current = messages.length;
  }, [messages, currentUser]);
"""

if "const requestPushPermission =" not in code:
    code = code.replace("return () => unsubscribeMessages();", "return () => unsubscribeMessages();\n  }, [view, currentUser]);\n" + members_effect)

with open('src/App.tsx', 'w') as f:
    f.write(code)

print("Step 3 applied successfully!")
