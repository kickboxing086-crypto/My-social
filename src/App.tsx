import { motion, AnimatePresence } from 'motion/react';
import React from "react";
import { Globe, Briefcase, Menu, Crown, MoreVertical, MoreHorizontal, Copy, Link as LinkIcon, Plus, LogOut, Pin, PinOff, Search, Send, Code, User, Power, UserPlus, ArrowLeft, Server, Paperclip, Mic, FileText, Image as ImageIcon, Play, Square, Eye, EyeOff, ShieldAlert, Flag, Gavel, Lightbulb, X, AlertTriangle, Trash2, Pause, Check, Users, Bell, BellOff, MessageSquare, Shield, ShieldCheck, UserX, UserCheck, CheckCircle, Clock, Hash, Edit2, Download, Smartphone, Target } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, addDoc, serverTimestamp, where, getDocs, getDocsFromCache } from 'firebase/firestore';

type DevUser = {
  id?: string;
  uid?: string;
  shortId?: string;
  name: string;
  username: string;
  role: string;
  password?: string;
  isBanned?: boolean;
  bannedAt?: any;
  banReason?: string;
  createdAt?: any;
};

type Attachment = {
  name: string;
  fileType: 'image' | 'document' | 'audio';
  url?: string;
  duration?: number;
};

type Group = {
  id: string;
  name: string;
  description: string;
  inviteCode: string;
  owners: string[];
  members: string[];
  topics?: string[];
  nameEditCount?: number;
  createdAt: any;
};

type Message = {
  id: string;
  sender: string;
  role?: string;
  text: string;
  type: 'system' | 'user' | 'bot';
  attachment?: Attachment;
  timestamp?: any;
  viewOnce?: boolean;
  expired?: boolean;
  isDeleted?: boolean;
  isPinned?: boolean;
  groupId?: string;
  topic?: string;
  isEdited?: boolean;
  editCount?: number;
  deletedAt?: any;
};

type Report = {
  id: string;
  type: 'profanity' | 'user' | 'auto_moderation';
  reportedUser: string;
  reportedBy: string;
  reason: string;
  timestamp: any;
  adminReply?: string;
  repliedAt?: any;
  assignedAdmin?: string;
  assignedAt?: any;
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
  assignedAt?: any;
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
  assignedAt?: any;
  groupId?: string;
  topic?: string;
};

// Simple illustrative profanity list
const PROFANITY_LIST = ['merda', 'porra', 'caralho', 'fdp', 'puta', 'cuzão', 'idiota', 'lixo', 'bosta', 'pau', 'vagina', 'buceta', 'piru', 'viado', 'corno', 'arrombado', 'desgraçado', 'otário', 'slut', 'fuck', 'sexo', 'porno', 'pornô', 'nude', 'nudes', 'estupro', 'pedofilia', 'nazista', 'matar', 'assassino'];


const AudioPlayer = ({ src, name, durationSec }: { src: string, name: string, durationSec?: number }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState<number>(durationSec || 0);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && isFinite(audioRef.current.duration) && !isNaN(audioRef.current.duration) && audioRef.current.duration > 0) {
      setTotalDuration(audioRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const cur = audioRef.current.currentTime;
      setCurrentTime(cur);
      
      const dur = (isFinite(audioRef.current.duration) && !isNaN(audioRef.current.duration) && audioRef.current.duration > 0)
        ? audioRef.current.duration
        : totalDuration;

      if (dur > 0) {
        setTotalDuration(dur);
        setProgress((cur / dur) * 100);
      }
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time) || time < 0) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderTimerText = () => {
    if (isPlaying) {
      return `${formatTime(currentTime)} / ${formatTime(totalDuration || currentTime)}`;
    }
    return totalDuration > 0 ? formatTime(totalDuration) : (currentTime > 0 ? formatTime(currentTime) : "0:00");
  };

  return (
    <div className="flex flex-col gap-1.5 w-full max-w-[280px] bg-emerald-950/60 border border-emerald-900/90 p-2.5 rounded-xl shadow-inner my-1">
      <div className="flex items-center gap-2.5">
        <button 
          type="button"
          onClick={togglePlay}
          className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black w-9 h-9 rounded-full flex items-center justify-center transition-transform shadow-md flex-shrink-0"
        >
          {isPlaying ? <Square className="w-3.5 h-3.5" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-emerald-100 text-xs font-bold truncate flex-1">{name}</span>
            <span className="text-emerald-300 text-[11px] font-mono font-bold flex-shrink-0 bg-black/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
              {renderTimerText()}
            </span>
          </div>
          <div className="h-1.5 bg-black/80 rounded-full overflow-hidden border border-emerald-900/50 relative">
            <div 
              className="h-full bg-emerald-400 transition-all duration-100 ease-linear shadow-[0_0_8px_rgba(52,211,153,0.6)]" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
      <audio 
        ref={audioRef} 
        src={src} 
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate} 
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
          setProgress(0);
        }}
        className="hidden" 
      />
    </div>
  );
};


// My social Sound Synth for Notifications & Mic Test
const playHUDChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15); // A6
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) {
    // Audio context fallback
  }
};

const triggerSafeDownload = (url: string, filename: string) => {
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Download error:', err);
  }
};

const formatTimestamp = (ts: any) => {
  if (!ts) return '';
  try {
    let date: Date;
    if (ts?.toDate) {
      date = ts.toDate();
    } else if (ts?.seconds) {
      date = new Date(ts.seconds * 1000);
    } else {
      date = new Date(ts);
    }
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return '';
  }
};

export default function App() {

  const [searchQuery, setSearchQuery] = useState('');

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmPurgeId, setConfirmPurgeId] = useState<string | null>(null);
  const [customAlert, setCustomAlert] = useState<{ title: string; message: string; type?: 'error' | 'success' | 'warning' | 'info' } | null>(null);

  const showAlert = (message: string, title: string = 'NOTIFICAÇÃO DO SISTEMA', type: 'error' | 'success' | 'warning' | 'info' = 'info') => {
    setCustomAlert({ title, message, type });
  };

  const [isSearching, setIsSearching] = useState(false);

  const [view, setView] = useState<'login' | 'register' | 'chat' | 'admin'>('login');
  
  const [currentUser, setCurrentUser] = useState<DevUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [showGroupsMenu, setShowGroupsMenu] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showJoinGroupModal, setShowJoinGroupModal] = useState(false);

  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [joinLinkInput, setJoinLinkInput] = useState('');

  const [groupSettingsTarget, setGroupSettingsTarget] = useState<Group | null>(null);
  const [currentTopic, setCurrentTopic] = useState<string>('Geral');
  const [showGroupTopicsModal, setShowGroupTopicsModal] = useState<boolean>(false);
  const [showAddTopicModal, setShowAddTopicModal] = useState<boolean>(false);
  const [newTopicName, setNewTopicName] = useState<string>('');
  const [editGroupNameInput, setEditGroupNameInput] = useState<string>('');
  const [editingTopicName, setEditingTopicName] = useState<string | null>(null);
  const [editTopicValue, setEditTopicValue] = useState<string>('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState<boolean>(false);
  const [stagedAttachment, setStagedAttachment] = useState<{
    name: string;
    fileType: 'image' | 'document';
    url: string;
  } | null>(null);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);
  const [lightboxImageName, setLightboxImageName] = useState<string>('');

  useEffect(() => {
    if (groupSettingsTarget) {
      setEditGroupNameInput(groupSettingsTarget.name);
    }
  }, [groupSettingsTarget]);
  const [inputValue, setInputValue] = useState('');
  const [isViewOnce, setIsViewOnce] = useState(false);
  const [viewingHidden, setViewingHidden] = useState<Record<string, boolean>>({});
  
  // Audio Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [audioPreviewBlob, setAudioPreviewBlob] = useState<Blob | null>(null);

  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Form States
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Modals & Panels
  const [showPolicy, setShowPolicy] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [editRoleValue, setEditRoleValue] = useState('');
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [suggestionText, setSuggestionText] = useState('');
  
  const [reportTarget, setReportTarget] = useState<string | null>(null); // username of target
  const [reportReason, setReportReason] = useState('');

  // Admin States
  const [reports, setReports] = useState<Report[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [appeals, setAppeals] = useState<Appeal[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  // Members & Admin Management States
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [openMemberMenuUsername, setOpenMemberMenuUsername] = useState<string | null>(null);
  const [openGroupMemberMenuUser, setOpenGroupMemberMenuUser] = useState<string | null>(null);
  const [showHeaderAdminMenu, setShowHeaderAdminMenu] = useState(false);
  const [showAdminIdActionMenu, setShowAdminIdActionMenu] = useState(false);
  const [openMessageMenuId, setOpenMessageMenuId] = useState<string | null>(null);
  const [allMembers, setAllMembers] = useState<DevUser[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [adminActionId, setAdminActionId] = useState('');
  const [userToDeleteConfirm, setUserToDeleteConfirm] = useState<DevUser | null>(null);
  const [userToRemoveFromGroup, setUserToRemoveFromGroup] = useState<DevUser | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // 2-Step Item Deletion Modal State (Appeals, Suggestions, Reports)
  const [itemToDeleteConfirm, setItemToDeleteConfirm] = useState<{
    id: string;
    type: 'report' | 'suggestion' | 'appeal';
    title: string;
    author: string;
    snippet: string;
  } | null>(null);

  // Ban Reason Modal States
  const [banReasonTarget, setBanReasonTarget] = useState<DevUser | null>(null);
  const [banReasonInput, setBanReasonInput] = useState('');

  // Appeal Modal & Admin Appeal Reply States
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealText, setAppealText] = useState('');
  const [appealReplyTarget, setAppealReplyTarget] = useState<Appeal | null>(null);
  const [appealReplyText, setAppealReplyText] = useState('');
  const [appealReplyImage, setAppealReplyImage] = useState<string | null>(null);
  const appealImageInputRef = useRef<HTMLInputElement>(null);

  // Admin Reply States for Reports & Suggestions
  const [adminReplyTarget, setAdminReplyTarget] = useState<{ id: string; type: 'report' | 'suggestion'; user: string; text: string } | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const prevReportsCount = useRef<number>(0);
  const prevSuggestionsCount = useRef<number>(0);

  // Push Notifications State
  const [pushPermission, setPushPermission] = useState<NotificationPermission>(typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default');
  const [pushToast, setPushToast] = useState<{ sender: string; text: string } | null>(null);
  const prevMsgCountRef = useRef<number>(0);

  // Animated Mic Permission Modal State
  const [showMicPermissionModal, setShowMicPermissionModal] = useState(false);
  const [micTestActive, setMicTestActive] = useState(false);
  const [micAudioLevel, setMicAudioLevel] = useState(0);


  const isGeneralAdmin = !!(
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
  };

  // MIGRATION: Ensure all existing users have a shortId
  useEffect(() => {
    if (!isAdmin || allMembers.length === 0) return;

    const generateShortId = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    allMembers.forEach(async (member) => {
      if (!member.shortId && member.id) {
        try {
          await updateDoc(doc(db, 'users', member.id), {
            shortId: generateShortId()
          });
        } catch (err) {
          console.error("Migration error assigning shortId to user:", member.username, err);
        }
      }
    });
  }, [allMembers, isAdmin]);

  const isSuperAdmin = currentUser?.username?.toLowerCase() === 'samuellsilvva02';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkAndPurgeExpiredBans = async () => {
    try {
      const qBanned = query(collection(db, 'users'), where('isBanned', '==', true));
      const bannedSnap = await getDocs(qBanned);
      const now = Date.now();
      const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

      for (const userDoc of bannedSnap.docs) {
        const userData = { id: userDoc.id, ...userDoc.data() } as DevUser;
        const bannedAt = userData.bannedAt;
        
        let bannedTime = 0;
        if (bannedAt?.toDate) bannedTime = bannedAt.toDate().getTime();
        else if (bannedAt?.seconds) bannedTime = bannedAt.seconds * 1000;
        else if (bannedAt) bannedTime = new Date(bannedAt).getTime();

        if (bannedTime > 0 && (now - bannedTime > SEVEN_DAYS_MS)) {
          // Check if appeal exists
          const qAppeal = query(collection(db, 'appeals'), where('username', '==', userData.username));
          const appealSnap = await getDocs(qAppeal);
          
          let hasActiveAppeal = false;
          appealSnap.forEach((aDoc) => {
            const aData = aDoc.data();
            if (aData.status === 'pending' || aData.status === 'approved') {
              hasActiveAppeal = true;
            }
          });

          if (!hasActiveAppeal || appealSnap.empty) {
            // Auto purge user account and messages
            await deleteDoc(doc(db, 'users', userDoc.id));

            const qMsgs = query(collection(db, 'messages'), where('sender', '==', userData.username));
            const msgsSnap = await getDocs(qMsgs);
            for (const mDoc of msgsSnap.docs) {
              await deleteDoc(doc(db, 'messages', mDoc.id));
            }

            for (const aDoc of appealSnap.docs) {
              await deleteDoc(doc(db, 'appeals', aDoc.id));
            }
          }
        }
      }
    } catch (e) {
      console.error('Error in checkAndPurgeExpiredBans:', e);
    }
  };

  useEffect(() => {
    const checkLocalAuth = async () => {
      // Run ban purging in the background to ensure startup is never blocked
      checkAndPurgeExpiredBans().catch(err => {
        console.error("Error purging bans in background:", err);
      });

      const savedUsername = localStorage.getItem('hud_devs_active_user');
      if (savedUsername) {
        try {
          const q = query(collection(db, 'users'), where('username', '==', savedUsername));
          
          let querySnapshot;
          const fetchPromise = getDocs(q);
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 1200));

          try {
            querySnapshot = (await Promise.race([fetchPromise, timeoutPromise])) as any;
          } catch (err) {
            console.warn("Firestore fetch timed out or failed, falling back to local persistent cache:", err);
            try {
              querySnapshot = await getDocsFromCache(q);
            } catch (cacheErr) {
              console.error("Local persistent cache fetch failed as well:", cacheErr);
              throw cacheErr;
            }
          }

          if (querySnapshot && !querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            const userData = { uid: docSnap.id, ...docSnap.data() } as DevUser;
            
            if (userData.isBanned) {
              setCurrentUser(userData);
              setView('chat');
              showAlert('Sua conta está BANIDA nesta comunidade. Você possui até 7 dias para transmitir uma apelação ao Administrador.', 'CONTA BANIDA', 'warning');
            } else {
              setCurrentUser(userData);
              setView('chat');
            }
          } else {
            localStorage.removeItem('hud_devs_active_user');
            setCurrentUser(null);
            setView('login');
          }
        } catch (e) {
          console.error("Error checking session, resetting:", e);
          setCurrentUser(null);
          setView('login');
        }
      } else {
        setCurrentUser(null);
        setView('login');
      }
      setIsLoading(false);
    };

    checkLocalAuth();
  }, []);

  // Listener for Ban Appeals
  useEffect(() => {
    if (currentUser) {
      const qAppeals = query(collection(db, 'appeals'), orderBy('timestamp', 'desc'));
      const unsubAppeals = onSnapshot(qAppeals, (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appeal));
        setAppeals(docs);
      });
      return () => unsubAppeals();
    }
  }, [currentUser]);

  // Listeners for Data
  useEffect(() => {
    if (view === 'chat' && currentUser) {
      const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
      const qGroups = query(collection(db, "groups"));
      const unsubscribeGroups = onSnapshot(qGroups, (snapshot) => {
        const gs: Group[] = [];
        snapshot.forEach((doc) => gs.push({ id: doc.id, ...doc.data() } as Group));
        setGroups(gs);
      });
      const unsubscribeMessages = onSnapshot(q, (snapshot) => {
        const msgs: Message[] = [];
        snapshot.forEach((doc) => {
          msgs.push({ id: doc.id, ...doc.data() } as Message);
        });
        setMessages(msgs);
      });
      return () => { unsubscribeMessages(); unsubscribeGroups(); };
    }
  }, [view, currentUser]);
  // Listener for all registered group members
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
        // Play My social Chime audio sound
        playHUDChime();

        // Display in-app floating push toast
        setPushToast({
          sender: latestMsg.sender,
          text: latestMsg.text || (latestMsg.attachment ? `[${latestMsg.attachment.fileType.toUpperCase()}] ${latestMsg.attachment.name}` : 'Nova mensagem')
        });

        // Trigger native device browser notification if background/permitted
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try {
            const title = `My social - @${latestMsg.sender}`;
            const options = {
              body: latestMsg.text || (latestMsg.attachment ? `Enviou um anexo: ${latestMsg.attachment.name}` : 'Enviou uma nova transmissão'),
              icon: '/icon-192.png',
              badge: '/icon-192.png',
              tag: 'new-message',
              vibrate: [100, 50, 100],
              data: { url: '/' }
            };

            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.ready.then((reg) => {
                reg.showNotification(title, options);
              }).catch(() => {
                new Notification(title, options);
              });
            } else {
              new Notification(title, options);
            }
          } catch (e) {
            console.error('Push notification error:', e);
          }
        }
      }
    }
    prevMsgCountRef.current = messages.length;
  }, [messages, currentUser]);

  useEffect(() => {
    if (currentUser && isAdmin) {
      const qReports = query(collection(db, 'reports'), orderBy('timestamp', 'desc'));
      const unsubReports = onSnapshot(qReports, (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report));
        if (prevReportsCount.current > 0 && docs.length > prevReportsCount.current) {
          const newRep = docs[0];
          playHUDChime();
          setPushToast({
            sender: 'NOVA DENÚNCIA',
            text: `@${newRep.reportedBy} denunciou @${newRep.reportedUser}`
          });
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              const title = 'My social - Nova Denúncia';
              const options = {
                body: `@${newRep.reportedBy} denunciou @${newRep.reportedUser}: "${newRep.reason}"`,
                icon: '/icon-192.png',
                badge: '/icon-192.png',
                tag: 'report',
                vibrate: [200, 100, 200],
                data: { url: '/' }
              };

              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then((reg) => {
                  reg.showNotification(title, options);
                }).catch(() => {
                  new Notification(title, options);
                });
              } else {
                new Notification(title, options);
              }
            } catch (e) {}
          }
        }
        prevReportsCount.current = docs.length;
        setReports(docs);
      });

      const qSuggestions = query(collection(db, 'suggestions'), orderBy('timestamp', 'desc'));
      const unsubSuggestions = onSnapshot(qSuggestions, (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Suggestion));
        if (prevSuggestionsCount.current > 0 && docs.length > prevSuggestionsCount.current) {
          const newSug = docs[0];
          playHUDChime();
          setPushToast({
            sender: 'NOVA SUGESTÃO',
            text: `@${newSug.sender} enviou uma sugestão`
          });
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              const title = 'My social - Nova Sugestão';
              const options = {
                body: `@${newSug.sender} enviou: "${newSug.text}"`,
                icon: '/icon-192.png',
                badge: '/icon-192.png',
                tag: 'suggestion',
                vibrate: [100, 50, 100],
                data: { url: '/' }
              };

              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then((reg) => {
                  reg.showNotification(title, options);
                }).catch(() => {
                  new Notification(title, options);
                });
              } else {
                new Notification(title, options);
              }
            } catch (e) {}
          }
        }
        prevSuggestionsCount.current = docs.length;
        setSuggestions(docs);
      });

      return () => { unsubReports(); unsubSuggestions(); };
    }
  }, [currentUser, isAdmin]);

  // Periodic report and appeal escalation (checks every 30 seconds for items pending action for over 30 minutes)
  useEffect(() => {
    if (!isAdmin || allMembers.length === 0) return;

    const interval = setInterval(() => {
      if (reports.length > 0) checkAndEscalateReports(reports, allMembers);
      if (appeals.length > 0) checkAndEscalateAppeals(appeals, allMembers);
      if (suggestions.length > 0) checkAndEscalateSuggestions(suggestions, allMembers);
    }, 30000); // Check every 30 seconds

    // Run once initially as well
    if (reports.length > 0) checkAndEscalateReports(reports, allMembers);
    if (appeals.length > 0) checkAndEscalateAppeals(appeals, allMembers);
    if (suggestions.length > 0) checkAndEscalateSuggestions(suggestions, allMembers);

    return () => clearInterval(interval);
  }, [reports, appeals, suggestions, allMembers, isAdmin]);

  // Capture the PWA install event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If already running standalone (already installed)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallBtn(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      showAlert('Abra o My social em seu navegador (Chrome/Safari) para instalar o aplicativo nativo.', 'COMO INSTALAR', 'info');
      return;
    }
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA installation outcome: ${outcome}`);
      setDeferredPrompt(null);
      setShowInstallBtn(false);
    } catch (err) {
      console.error('Error triggering PWA install:', err);
    }
  };

  const addSystemMessage = async (text: string) => {
    await addDoc(collection(db, 'messages'), {
      sender: 'SISTEMA',
      text,
      type: 'system',
      groupId: currentGroupId || "global",
      topic: currentGroupId ? (currentTopic || 'Geral') : 'Geral',
      timestamp: serverTimestamp()
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword.length > 6) {
      showAlert('A senha deve ter no máximo 6 dígitos.', 'VALIDAÇÃO DE SENHA', 'warning');
      return;
    }
    
    const cleanUsername = regUsername.trim().toLowerCase();
    
    if (cleanUsername === 'samuellsilvva02') {
      showAlert('Este nome de usuário é reservado do sistema.', 'REGISTRO NEGADO', 'error');
      return;
    }

    if (regPassword === '072131') {
      showAlert('Esta senha é reservada do sistema.', 'REGISTRO NEGADO', 'error');
      return;
    }
    
    try {
      const q = query(collection(db, 'users'), where('username', '==', cleanUsername));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        showAlert('O nome de usuário já está em uso.', 'REGISTRO RECUSADO', 'warning');
        return;
      }
      
      const generateShortId = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      };
      
      const newUser: DevUser = {
        name: regName,
        username: cleanUsername,
        role: regRole.trim() || 'Membro',
        password: regPassword,
        shortId: generateShortId(),
        isBanned: false
      };
      
      const docRef = await addDoc(collection(db, 'users'), newUser);
      await updateDoc(docRef, { uid: docRef.id });
      
      localStorage.setItem('hud_devs_active_user', cleanUsername);
      setCurrentUser({ uid: docRef.id, ...newUser });
      setView('chat');
    } catch (error: any) {
      console.error(error);
      showAlert('Ocorreu um erro ao registrar sua conta. Tente novamente.', 'ERRO DE REGISTRO', 'error');
    }
  };

  const handleDeleteMessage = (msgId: string) => {
    const msg = messages.find(m => m.id === msgId);
    if (msg) {
      const msgTime = msg.timestamp ? (typeof msg.timestamp.toMillis === 'function' ? msg.timestamp.toMillis() : new Date(msg.timestamp).getTime()) : Date.now();
      const isWithin15Min = (Date.now() - msgTime) <= 15 * 60 * 1000;
      if (!isAdmin && msg.sender === currentUser?.username && !isWithin15Min) {
        showAlert('As mensagens só podem ser apagadas para todos dentro de 15 minutos após o envio.', 'PRAZO DE EXCLUSÃO EXPIRADO', 'warning');
        return;
      }
    }
    setConfirmDeleteId(msgId);
  };

  const handleTogglePinMessage = async (msgId: string, currentPinStatus: boolean) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, 'messages', msgId), {
        isPinned: !currentPinStatus
      });
    } catch (err) {
      console.error(err);
      showAlert('Erro ao fixar/desafixar mensagem.', 'ERRO', 'error');
    }
  };

  const confirmDeleteAction = async () => {
    if (confirmDeleteId) {
      try {
        await updateDoc(doc(db, 'messages', confirmDeleteId), {
          isDeleted: true,
          deletedAt: serverTimestamp()
        });
        showAlert('A mensagem foi removida da conversa pública.', 'MENSAGEM APAGADA', 'info');
      } catch (err) {
        console.error(err);
        showAlert('Erro ao apagar mensagem.', 'ERRO', 'error');
      }
      setConfirmDeleteId(null);
    }
  };

  const confirmPurgeAction = async () => {
    if (confirmPurgeId) {
      try {
        await deleteDoc(doc(db, 'messages', confirmPurgeId));
        showAlert('A mensagem e seu registro foram purgados permanentemente do banco de dados.', 'MENSAGEM PURGADA', 'success');
      } catch (err) {
        console.error(err);
        showAlert('Erro ao purgar mensagem do banco de dados.', 'ERRO', 'error');
      }
      setConfirmPurgeId(null);
    }
  };

  const handleOpenViewOnce = async (msg: Message) => {
    setViewingHidden(prev => ({ ...prev, [msg.id]: true }));
    await updateDoc(doc(db, 'messages', msg.id), { expired: true });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cleanUsername = loginUsername.trim().toLowerCase();
      const q = query(collection(db, 'users'), where('username', '==', cleanUsername));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        showAlert('Esta credencial não existe. Crie uma nova credencial usando a aba de registro.', 'CONEXÃO FALHOU', 'error');
        return;
      }
      
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data() as DevUser;
      
      if (userData.password !== loginPassword) {
        showAlert('Senha incorreta. Verifique suas credenciais.', 'FALHA DE AUTENTICAÇÃO', 'error');
        return;
      }
      
      if (userData.isBanned) {
        localStorage.setItem('hud_devs_active_user', cleanUsername);
        setCurrentUser({ uid: userDoc.id, ...userData });
        setView('chat');
        showAlert('Sua conta está BANIDA nesta comunidade. Você possui até 7 dias para transmitir uma apelação ao Administrador.', 'CONTA BANIDA', 'warning');
        return;
      }
      
      localStorage.setItem('hud_devs_active_user', cleanUsername);
      setCurrentUser({ uid: userDoc.id, ...userData });
      setView('chat');
    } catch (error) {
      console.error(error);
      showAlert('Falha ao autenticar conexão com o servidor.', 'ERRO DE LOGIN', 'error');
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('hud_devs_active_user');
    setCurrentUser(null);
    setView('login');
  };

  const checkProfanity = (text: string) => {
    const lower = text.toLowerCase();
    return PROFANITY_LIST.some(word => lower.includes(word));
  };

  const executeAutoBan = async (text: string) => {
    if (!currentUser?.uid) return;
    
    const autoReason = `Banimento automático por uso de linguagem imprópria na mensagem: "${text}"`;

    // 1. Update user flag, bannedAt timestamp, and banReason
    await updateDoc(doc(db, 'users', currentUser.uid), { 
      isBanned: true,
      bannedAt: serverTimestamp(),
      banReason: autoReason
    });
    
    // 2. Create report
    const assignedAdmin = getRandomAssignedAdmin(allMembers);
    await addDoc(collection(db, 'reports'), {
      type: 'profanity',
      reportedUser: currentUser.username,
      reportedBy: 'SISTEMA AUTÔNOMO',
      reason: autoReason,
      assignedAdmin,
      groupId: currentGroupId || "global",
      topic: currentGroupId ? (currentTopic || 'Geral') : 'Geral',
      timestamp: serverTimestamp(),
      assignedAt: serverTimestamp()
    });

    // 3. Update current user state without logging out
    setCurrentUser(prev => prev ? { ...prev, isBanned: true, bannedAt: new Date(), banReason: autoReason } : null);
    showAlert('Você violou as diretrizes de comunicação e sua conta foi BANIDA. Você tem até 7 dias para enviar uma apelação ao Administrador.', 'BANIMENTO EXECUTADO', 'error');
  };

  
  const generateInviteCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  

  const handleDeleteGroup = async (groupToDelete: Group) => {
    if (!confirm(`ATENÇÃO: Deseja realmente APAGAR permanentemente o grupo "${groupToDelete.name}"? Esta ação é irreversível e excluirá todas as mensagens e dados do grupo.`)) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'groups', groupToDelete.id));

      const qMsgs = query(collection(db, 'messages'), where('groupId', '==', groupToDelete.id));
      const snap = await getDocs(qMsgs);
      const deletePromises = snap.docs.map(mDoc => deleteDoc(doc(db, 'messages', mDoc.id)));
      await Promise.all(deletePromises);

      setGroupSettingsTarget(null);
      setCurrentGroupId(null);
      setCurrentTopic('Geral');
      setShowGroupsMenu(false);
      showAlert(`Grupo "${groupToDelete.name}" apagado com sucesso!`, 'GRUPO EXCLUÍDO', 'success');
    } catch (err) {
      console.error(err);
      showAlert('Erro ao apagar grupo.', 'ERRO', 'error');
    }
  };

  const handleRenameGroup = async () => {
    if (!groupSettingsTarget) return;
    const newName = editGroupNameInput.trim();
    if (!newName) {
      showAlert('Por favor, digite o novo nome do grupo.', 'CAMPO OBRIGATÓRIO', 'warning');
      return;
    }
    if (newName === groupSettingsTarget.name) {
      showAlert('O novo nome é igual ao nome atual do grupo.', 'NENHUMA ALTERAÇÃO', 'info');
      return;
    }
    const currentCount = groupSettingsTarget.nameEditCount || 0;
    if (currentCount >= 2) {
      showAlert('Este grupo já atingiu o limite de 2 alterações do nome.', 'LIMITE ATINGIDO', 'error');
      return;
    }

    const newCount = currentCount + 1;
    try {
      await updateDoc(doc(db, 'groups', groupSettingsTarget.id), {
        name: newName,
        nameEditCount: newCount
      });

      const updatedObj = {
        ...groupSettingsTarget,
        name: newName,
        nameEditCount: newCount
      };
      setGroupSettingsTarget(updatedObj);
      setGroups(prev => prev.map(g => g.id === groupSettingsTarget.id ? updatedObj : g));
      showAlert(`Nome do grupo alterado para "${newName}"! Edições restantes: ${2 - newCount}/2`, 'SUCESSO', 'success');
    } catch (err) {
      console.error(err);
      showAlert('Erro ao renomear grupo.', 'ERRO', 'error');
    }
  };

  const handleAddTopicToGroup = async (targetGroupId: string, topicName: string) => {
    const cleanTopic = topicName.trim().replace(/^#+/, '');
    if (!cleanTopic) {
      showAlert('Por favor, digite o nome do tópico.', 'CAMPO OBRIGATÓRIO', 'warning');
      return;
    }

    const groupObj = groups.find(g => g.id === targetGroupId);
    if (!groupObj) return;

    // Apenas Administradores do Grupo podem gerenciar tópicos
    const isGrpAdmin = groupObj.owners.includes(currentUser?.username || '') || isGeneralAdmin;
    if (!isGrpAdmin) {
      showAlert('Apenas administradores do grupo podem criar tópicos.', 'ACESSO NEGADO', 'error');
      return;
    }

    const currentTopics = groupObj.topics || ['Geral'];
    if (currentTopics.some(t => t.toLowerCase() === cleanTopic.toLowerCase())) {
      showAlert(`O tópico #${cleanTopic} já existe neste grupo.`, 'TÓPICO EXISTENTE', 'warning');
      return;
    }

    const newTopics = [...currentTopics, cleanTopic];
    try {
      await updateDoc(doc(db, 'groups', targetGroupId), { topics: newTopics });
      setGroups(prev => prev.map(g => g.id === targetGroupId ? { ...g, topics: newTopics } : g));
      if (groupSettingsTarget && groupSettingsTarget.id === targetGroupId) {
        setGroupSettingsTarget({ ...groupSettingsTarget, topics: newTopics });
      }
      setCurrentTopic(cleanTopic);
      setShowAddTopicModal(false);
      setNewTopicName('');
      showAlert(`Tópico #${cleanTopic} criado com sucesso!`, 'SUCESSO', 'success');
    } catch (err) {
      console.error(err);
      showAlert('Erro ao adicionar tópico.', 'ERRO', 'error');
    }
  };

  const handleRemoveTopicFromGroup = async (targetGroupId: string, topicToRemove: string) => {
    if (topicToRemove.toLowerCase() === 'geral') {
      showAlert('O tópico #Geral é o tópico principal e não pode ser removido.', 'AÇÃO NEGADA', 'warning');
      return;
    }

    const groupObj = groups.find(g => g.id === targetGroupId);
    if (!groupObj) return;

    // Apenas Administradores do Grupo podem gerenciar tópicos
    const isGrpAdmin = groupObj.owners.includes(currentUser?.username || '') || isGeneralAdmin;
    if (!isGrpAdmin) {
      showAlert('Apenas administradores do grupo podem remover tópicos.', 'ACESSO NEGADO', 'error');
      return;
    }

    const confirmation = window.prompt(`Para remover o tópico #${topicToRemove}, digite APAGAR abaixo:`);
    if (confirmation !== 'APAGAR') {
      if (confirmation !== null) showAlert('Confirmação inválida. Digite APAGAR exatamente.', 'ERRO', 'error');
      return;
    }

    const newTopics = (groupObj.topics || ['Geral']).filter(t => t !== topicToRemove);
    try {
      await updateDoc(doc(db, 'groups', targetGroupId), { topics: newTopics });
      setGroups(prev => prev.map(g => g.id === targetGroupId ? { ...g, topics: newTopics } : g));
      if (groupSettingsTarget && groupSettingsTarget.id === targetGroupId) {
        setGroupSettingsTarget({ ...groupSettingsTarget, topics: newTopics });
      }
      if (currentTopic === topicToRemove) {
        setCurrentTopic('Geral');
      }
      showAlert(`Tópico #${topicToRemove} removido com sucesso.`, 'TÓPICO REMOVIDO', 'info');
    } catch (err) {
      console.error(err);
      showAlert('Erro ao remover tópico.', 'ERRO', 'error');
    }
  };

  const ADMIN_TASK_DEADLINE_MINUTES = 30; // 30 minutes

  const checkAndEscalateReports = async (reportsToProcess: Report[], membersList: DevUser[]) => {
    const now = Date.now();
    for (const rep of reportsToProcess) {
      if (rep.adminReply) continue; // Already resolved
      
      // Determine the assignment time
      let assignedTimeMs = now;
      if (rep.assignedAt) {
        assignedTimeMs = typeof rep.assignedAt.toMillis === 'function' 
          ? rep.assignedAt.toMillis() 
          : (typeof rep.assignedAt === 'number' ? rep.assignedAt : new Date(rep.assignedAt).getTime());
      } else if (rep.timestamp) {
        assignedTimeMs = typeof rep.timestamp.toMillis === 'function' 
          ? rep.timestamp.toMillis() 
          : (typeof rep.timestamp === 'number' ? rep.timestamp : new Date(rep.timestamp).getTime());
      } else {
        continue; // No timestamp available yet
      }

      const elapsedMinutes = (now - assignedTimeMs) / (1000 * 60);
      if (elapsedMinutes >= ADMIN_TASK_DEADLINE_MINUTES) {
        // Find other admins excluding the currently assigned one
        const adminPool = membersList.filter(m => {
          const r = (m.role || '').toLowerCase();
          const u = (m.username || '').toLowerCase();
          const isAdminRole = r === 'administrador geral' || r === 'administrador' || r === 'admin' || u === 'samuellsilvva02';
          return isAdminRole && m.username !== rep.assignedAdmin;
        });

        if (adminPool.length > 0) {
          const randomIndex = Math.floor(Math.random() * adminPool.length);
          const newAdmin = adminPool[randomIndex].username;
          
          console.log(`Report ${rep.id} escalated from @${rep.assignedAdmin} to @${newAdmin} after ${Math.round(elapsedMinutes)} minutes.`);
          
          try {
            await updateDoc(doc(db, 'reports', rep.id), {
              assignedAdmin: newAdmin,
              assignedAt: serverTimestamp()
            });
          } catch (err) {
            console.error("Failed to escalate report:", err);
          }
        }
      }
    }
  };

  const checkAndEscalateAppeals = async (appealsToProcess: Appeal[], membersList: DevUser[]) => {
    const now = Date.now();
    for (const app of appealsToProcess) {
      if (app.status !== 'pending') continue; // Already resolved
      if (app.adminReplyText) continue; // Already replied
      
      // Determine the assignment time
      let assignedTimeMs = now;
      if (app.assignedAt) {
        assignedTimeMs = typeof app.assignedAt.toMillis === 'function' 
          ? app.assignedAt.toMillis() 
          : (typeof app.assignedAt === 'number' ? app.assignedAt : new Date(app.assignedAt).getTime());
      } else if (app.timestamp) {
        assignedTimeMs = typeof app.timestamp.toMillis === 'function' 
          ? app.timestamp.toMillis() 
          : (typeof app.timestamp === 'number' ? app.timestamp : new Date(app.timestamp).getTime());
      } else {
        continue; // No timestamp available yet
      }

      const elapsedMinutes = (now - assignedTimeMs) / (1000 * 60);
      if (elapsedMinutes >= ADMIN_TASK_DEADLINE_MINUTES) {
        // Find other admins excluding the currently assigned one
        const adminPool = membersList.filter(m => {
          const r = (m.role || '').toLowerCase();
          const u = (m.username || '').toLowerCase();
          const isAdminRole = r === 'administrador geral' || r === 'administrador' || r === 'admin' || u === 'samuellsilvva02';
          return isAdminRole && m.username !== app.assignedAdmin;
        });

        if (adminPool.length > 0) {
          const randomIndex = Math.floor(Math.random() * adminPool.length);
          const newAdmin = adminPool[randomIndex].username;
          
          console.log(`Appeal ${app.id} escalated from @${app.assignedAdmin} to @${newAdmin} after ${Math.round(elapsedMinutes)} minutes.`);
          
          try {
            await updateDoc(doc(db, 'appeals', app.id), {
              assignedAdmin: newAdmin,
              assignedAt: serverTimestamp()
            });
          } catch (err) {
            console.error("Failed to escalate appeal:", err);
          }
        }
      }
    }
  };

  const checkAndEscalateSuggestions = async (suggestionsToProcess: Suggestion[], membersList: DevUser[]) => {
    const now = Date.now();
    for (const sug of suggestionsToProcess) {
      if (sug.adminReply) continue; // Already resolved
      
      // Determine the assignment time
      let assignedTimeMs = now;
      if (sug.assignedAt) {
        assignedTimeMs = typeof sug.assignedAt.toMillis === 'function' 
          ? sug.assignedAt.toMillis() 
          : (typeof sug.assignedAt === 'number' ? sug.assignedAt : new Date(sug.assignedAt).getTime());
      } else if (sug.timestamp) {
        assignedTimeMs = typeof sug.timestamp.toMillis === 'function' 
          ? sug.timestamp.toMillis() 
          : (typeof sug.timestamp === 'number' ? sug.timestamp : new Date(sug.timestamp).getTime());
      } else {
        continue; // No timestamp available yet
      }

      const elapsedMinutes = (now - assignedTimeMs) / (1000 * 60);
      if (elapsedMinutes >= ADMIN_TASK_DEADLINE_MINUTES) {
        const adminPool = membersList.filter(m => {
          const r = (m.role || '').toLowerCase();
          const u = (m.username || '').toLowerCase();
          const isAdminRole = r === 'administrador geral' || r === 'administrador' || r === 'admin' || u === 'samuellsilvva02';
          return isAdminRole && m.username !== sug.assignedAdmin;
        });

        if (adminPool.length > 0) {
          const randomIndex = Math.floor(Math.random() * adminPool.length);
          const newAdmin = adminPool[randomIndex].username;
          
          console.log(`Suggestion ${sug.id} escalated from @${sug.assignedAdmin} to @${newAdmin} after ${Math.round(elapsedMinutes)} minutes.`);
          
          try {
            await updateDoc(doc(db, 'suggestions', sug.id), {
              assignedAdmin: newAdmin,
              assignedAt: serverTimestamp()
            });
          } catch (err) {
            console.error("Failed to escalate suggestion:", err);
          }
        }
      }
    }
  };

  const handleEditTopicInGroup = async (targetGroupId: string, oldTopicName: string, newTopicName: string) => {
    if (oldTopicName.toLowerCase() === 'geral') {
      showAlert('O tópico #Geral é o tópico principal e não pode ser editado.', 'AÇÃO NEGADA', 'warning');
      return;
    }

    const groupObj = groups.find(g => g.id === targetGroupId);
    if (!groupObj) return;

    // Apenas Administradores do Grupo podem gerenciar tópicos
    const isGrpAdmin = groupObj.owners.includes(currentUser?.username || '') || isGeneralAdmin;
    if (!isGrpAdmin) {
      showAlert('Apenas administradores do grupo podem editar tópicos.', 'ACESSO NEGADO', 'error');
      return;
    }

    const cleanTopic = newTopicName.trim().replace(/^#+/, '');
    if (!cleanTopic) {
      showAlert('Por favor, digite o novo nome do tópico.', 'CAMPO OBRIGATÓRIO', 'warning');
      return;
    }

    if (cleanTopic.toLowerCase() === oldTopicName.toLowerCase()) {
      return; // No actual change
    }

    const currentTopics = groupObj.topics || ['Geral'];
    if (currentTopics.some(t => t.toLowerCase() === cleanTopic.toLowerCase() && t.toLowerCase() !== oldTopicName.toLowerCase())) {
      showAlert(`O tópico #${cleanTopic} já existe neste grupo.`, 'TÓPICO EXISTENTE', 'warning');
      return;
    }

    const newTopics = currentTopics.map(t => t === oldTopicName ? cleanTopic : t);
    try {
      // 1. Update group topics in Firestore
      await updateDoc(doc(db, 'groups', targetGroupId), { topics: newTopics });
      
      // 2. Update state
      setGroups(prev => prev.map(g => g.id === targetGroupId ? { ...g, topics: newTopics } : g));
      if (groupSettingsTarget && groupSettingsTarget.id === targetGroupId) {
        setGroupSettingsTarget({ ...groupSettingsTarget, topics: newTopics });
      }
      if (currentTopic === oldTopicName) {
        setCurrentTopic(cleanTopic);
      }

      // 3. Update existing messages in that group & old topic
      const qMsgs = query(collection(db, 'messages'), where('groupId', '==', targetGroupId), where('topic', '==', oldTopicName));
      const snapshot = await getDocs(qMsgs);
      snapshot.forEach(async (msgDoc) => {
        try {
          await updateDoc(doc(db, 'messages', msgDoc.id), { topic: cleanTopic });
        } catch (msgErr) {
          console.error("Error updating message topic:", msgErr);
        }
      });

      showAlert(`Tópico #${oldTopicName} renomeado para #${cleanTopic} com sucesso!`, 'SUCESSO', 'success');
    } catch (err) {
      console.error(err);
      showAlert('Erro ao editar tópico.', 'ERRO', 'error');
    }
  };

  const handleResetGroupInviteCode = async (targetGroupId: string) => {
    if (!confirm("Tem certeza que deseja redefinir o link de convite deste grupo? O link de convite anterior deixará de funcionar imediatamente, impedindo que novas pessoas o usem para entrar.")) {
      return;
    }

    const newInviteCode = generateInviteCode();
    try {
      await updateDoc(doc(db, 'groups', targetGroupId), { inviteCode: newInviteCode });
      
      setGroups(prev => prev.map(g => g.id === targetGroupId ? { ...g, inviteCode: newInviteCode } : g));
      if (groupSettingsTarget && groupSettingsTarget.id === targetGroupId) {
        setGroupSettingsTarget({ ...groupSettingsTarget, inviteCode: newInviteCode });
      }
      
      showAlert('Link de convite redefinido com sucesso! O convite anterior foi desativado.', 'CONVITE ATUALIZADO', 'success');
    } catch (err) {
      console.error(err);
      showAlert('Erro ao redefinir convite.', 'ERRO', 'error');
    }
  };

  const copyOrShareGroupLink = async (group: Group) => {
    const inviteUrl = `${window.location.origin}${window.location.pathname}?invite=${group.inviteCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Convite para o grupo ${group.name} - My social`,
          text: `Entre no grupo "${group.name}" no My social:`,
          url: inviteUrl,
        });
        return;
      } catch (err) {
        // Fallback to clipboard if share was cancelled or failed
      }
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(inviteUrl);
        showAlert('Link do grupo copiado para a área de transferência!', 'SUCESSO', 'success');
      } else {
        window.prompt('Copie o link de convite do grupo:', inviteUrl);
      }
    } catch (err) {
      window.prompt('Copie o link de convite do grupo:', inviteUrl);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      showAlert('Por favor, digite o nome do grupo.', 'CAMPO OBRIGATÓRIO', 'warning');
      return;
    }
    if (!currentUser) {
      showAlert('Você precisa estar conectado para criar um grupo.', 'ACESSO NEGADO', 'error');
      return;
    }

    const inviteCode = generateInviteCode();
    try {
      const docRef = await addDoc(collection(db, 'groups'), {
        name: newGroupName.trim(),
        description: newGroupDesc.trim(),
        inviteCode,
        createdBy: currentUser.username,
        owners: [currentUser.username],
        members: [currentUser.username],
        topics: ['Geral'],
        nameEditCount: 0,
        createdAt: serverTimestamp()
      });
      setShowCreateGroupModal(false);
      setNewGroupName('');
      setNewGroupDesc('');
      setCurrentGroupId(docRef.id);
      setCurrentTopic('Geral');
      showAlert('Grupo criado com sucesso! Compartilhe o link de convite com seus amigos.', 'GRUPO CRIADO', 'success');
    } catch (err) {
      console.error('Erro ao criar grupo no Firestore:', err);
      showAlert('Erro ao criar grupo. Tente novamente.', 'ERRO', 'error');
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinLinkInput.trim() || !currentUser) return;
    
    // Extract code from link or just use code
    let code = joinLinkInput.trim();
    if (code.includes('invite=')) {
      code = code.split('invite=')[1];
    }

    try {
      const q = query(collection(db, 'groups'), where('inviteCode', '==', code));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        showAlert('Link de convite inválido ou grupo não encontrado.', 'ERRO', 'error');
        return;
      }
      
      const groupDoc = querySnapshot.docs[0];
      const groupData = groupDoc.data() as Group;
      
      if (groupData.members.includes(currentUser.username)) {
        showAlert('Você já é membro deste grupo.', 'AVISO', 'warning');
        setShowJoinGroupModal(false);
        setCurrentGroupId(groupDoc.id);
        return;
      }
      
      await updateDoc(doc(db, 'groups', groupDoc.id), {
        members: [...groupData.members, currentUser.username]
      });
      
      setShowJoinGroupModal(false);
      setJoinLinkInput('');
      setCurrentGroupId(groupDoc.id);
      showAlert('Você entrou no grupo com sucesso!', 'BEM-VINDO', 'success');
    } catch (e) {
      showAlert('Erro ao entrar no grupo.', 'ERRO', 'error');
    }
  };

  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invite = params.get('invite');
    if (invite && currentUser) {
      setJoinLinkInput(invite);
      setShowJoinGroupModal(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!userToDeleteConfirm && !userToRemoveFromGroup && !itemToDeleteConfirm && !banReasonTarget) {
      setDeleteConfirmText('');
    }
  }, [userToDeleteConfirm, userToRemoveFromGroup, itemToDeleteConfirm, banReasonTarget]);

  // Auto-expand textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, window.matchMedia('(max-width: 640px)').matches ? 150 : 250);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [inputValue]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputValue.trim() && !stagedAttachment) || !currentUser) return;

    if (currentUser.isBanned) {
      showAlert('Sua conta está BANIDA nesta comunidade. Você está impedido de enviar qualquer tipo de mensagem.', 'CONTA BANIDA', 'warning');
      setShowAppealModal(true);
      return;
    }

    const textToSend = inputValue.trim();

    try {
      if (editingMessageId) {
        // Edit existing message in place
        const originalMsg = messages.find(m => m.id === editingMessageId);
        const currentEditCount = originalMsg?.editCount || 0;

        await updateDoc(doc(db, 'messages', editingMessageId), {
          text: textToSend,
          isEdited: true,
          editCount: currentEditCount + 1,
          editedAt: serverTimestamp()
        });

        showAlert('Mensagem editada com sucesso.', 'MENSAGEM ATUALIZADA', 'success');
        setEditingMessageId(null);
        setInputValue('');
        setStagedAttachment(null);
        setIsViewOnce(false);
        if (textareaRef.current) textareaRef.current.style.height = '40px';
        return;
      }

      const messageData: any = {
        sender: currentUser.username,
        role: currentUser.role,
        type: 'user',
        viewOnce: isViewOnce,
        expired: false,
        groupId: currentGroupId || "global",
        topic: currentGroupId ? (currentTopic || 'Geral') : 'Geral',
        timestamp: serverTimestamp()
      };

      if (stagedAttachment) {
        messageData.attachment = {
          name: stagedAttachment.name,
          fileType: stagedAttachment.fileType,
          url: stagedAttachment.url
        };
        messageData.text = textToSend || "Arquivo anexado:";
      } else {
        messageData.text = textToSend;
      }

      await addDoc(collection(db, 'messages'), messageData);

      if (stagedAttachment && stagedAttachment.fileType === 'image') {
        await triggerAutoModerationReport(
          currentUser.username,
          `[MODERAÇÃO AUTOMÁTICA DE MÍDIA] Mídia de imagem postada: "${stagedAttachment.name}"${textToSend ? ` com a legenda: "${textToSend}"` : ''}`,
          stagedAttachment.url
        );
      }

      setInputValue('');
      setStagedAttachment(null);
      setIsViewOnce(false);
      if (textareaRef.current) textareaRef.current.style.height = '40px';
    } catch (err: any) {
      if (err.message?.includes('exceeds the maximum allowed size')) {
        showAlert('O arquivo excede o limite de tamanho permitido (~1MB).', 'TAMANHO EXCESSIVO', 'warning');
      } else {
        console.error(err);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    if (currentUser.isBanned) {
      showAlert('Sua conta está BANIDA nesta comunidade. Você está impedido de anexar arquivos.', 'CONTA BANIDA', 'warning');
      setShowAppealModal(true);
      return;
    }

    const isImage = file.type.startsWith('image/');
    const fileType = isImage ? 'image' : 'document';
    
    if (isImage) {
      const imgReader = new FileReader();
      imgReader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const maxDim = 1200;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
            
            setStagedAttachment({
              name: file.name.replace(/\.[^/.]+$/, "") + ".jpg",
              fileType: 'image',
              url: compressedBase64
            });
          }
        };
      };
      imgReader.readAsDataURL(file);
    } else {
      if (file.size > 1024 * 1024) {
        showAlert('Documentos não podem exceder o limite de 1MB.', 'TAMANHO EXCESSIVO', 'warning');
        e.target.value = '';
        return;
      }
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Url = event.target?.result as string;
        
        setStagedAttachment({
          name: file.name,
          fileType: 'document',
          url: base64Url
        });
      };
      reader.readAsDataURL(file);
    }
    
    e.target.value = '';
  };

  
  const cancelRecording = () => {
    if (isRecording) {
      if (recordingInterval.current) clearInterval(recordingInterval.current);
      setIsRecording(false);
      setIsRecordingPaused(false);
      setAudioPreviewUrl(null);
      setAudioPreviewBlob(null);
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.onstop = null; // Prevent saving
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    }
  };
  
  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsRecordingPaused(true);
      if (recordingInterval.current) clearInterval(recordingInterval.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsRecordingPaused(false);
      recordingInterval.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopAndPreviewRecording = () => {
    if (isRecording) {
      if (recordingInterval.current) clearInterval(recordingInterval.current);
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(audioBlob);
          setAudioPreviewBlob(audioBlob);
          setAudioPreviewUrl(url);
          mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
        };
        mediaRecorderRef.current.stop();
      }
    }
  };

  const sendAudioPreview = async () => {
    if (currentUser?.isBanned) {
      showAlert('Sua conta está BANIDA nesta comunidade. Você está impedido de enviar mensagens de áudio.', 'CONTA BANIDA', 'warning');
      setShowAppealModal(true);
      return;
    }

    if (audioPreviewBlob && currentUser) {
      const reader = new FileReader();
      reader.readAsDataURL(audioPreviewBlob);
      reader.onloadend = async () => {
        const base64data = reader.result;
        try {
          await addDoc(collection(db, 'messages'), {
            sender: currentUser.username,
            role: currentUser.role,
            text: '',
            type: 'user',
            attachment: {
              name: `Mensagem de voz (${recordingTime}s)`,
              fileType: 'audio',
              url: base64data,
              duration: recordingTime
            },
            viewOnce: isViewOnce,
            expired: false,
            groupId: currentGroupId || "global",
            topic: currentGroupId ? (currentTopic || 'Geral') : 'Geral',
            timestamp: serverTimestamp()
          });
          await triggerAutoModerationReport(currentUser.username, `[MODERAÇÃO AUTOMÁTICA DE ÁUDIO] Mensagem de voz enviada (${recordingTime}s)`);
          setIsViewOnce(false);
        } catch (err) {
          console.error(err);
        }
      };
    }
    
    // Clean up
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    setIsRecording(false);
    setIsRecordingPaused(false);
    setAudioPreviewUrl(null);
    setAudioPreviewBlob(null);
    setRecordingTime(0);
  };

  const toggleRecording = async () => {
    if (currentUser?.isBanned) {
      showAlert('Sua conta está BANIDA nesta comunidade. Você está impedido de gravar áudios.', 'CONTA BANIDA', 'warning');
      setShowAppealModal(true);
      return;
    }

    if (isRecording) {
      stopAndPreviewRecording();
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };
        
        mediaRecorder.start();
        setIsRecording(true);
        setIsRecordingPaused(false);
        setAudioPreviewUrl(null);
        setAudioPreviewBlob(null);
        setRecordingTime(0);
        recordingInterval.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
      } catch (err) {
        console.error('Error accessing microphone:', err);
        showAlert('Acesso ao microfone negado ou indisponível no navegador.', 'ERRO DE HARDWARE', 'error');
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };


  const filteredMessages = messages.filter(msg => {
    // If deleted, only show to Admin
    if (msg.isDeleted && !isAdmin) return false;

    if (!currentGroupId) {
      if (msg.groupId && msg.groupId !== "global") return false;
    } else {
      if (msg.groupId !== currentGroupId) return false;
      const msgTopic = msg.topic || 'Geral';
      if (msgTopic !== (currentTopic || 'Geral')) return false;
    }
    if (!searchQuery.trim()) return true;
    return msg.text?.toLowerCase().includes(searchQuery.toLowerCase()) || 
           msg.sender?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           msg.attachment?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  
  // Administrative Action: Ban / Unban User
  const getTargetUserById = (id: string) => {
    if (!id) return undefined;
    const cleanId = id.trim().toLowerCase();
    return allMembers.find(m => 
      (m.id && m.id === id.trim()) ||
      (m.shortId && m.shortId.toLowerCase() === cleanId) ||
      (m.username && m.username.toLowerCase() === cleanId)
    );
  };

  const handleAdminActionById = async (actionType: 'ban' | 'unban' | 'makeAdmin' | 'makeGeneralAdmin' | 'removeAdmin', targetId: string) => {
    if (!isAdmin || !targetId.trim()) {
      if (!targetId.trim()) {
        showAlert('Por favor, informe o ID ou nome de usuário.', 'CAMPO VAZIO', 'warning');
      }
      return;
    }

    const targetUser = getTargetUserById(targetId.trim());
    if (!targetUser) {
      showAlert('Usuário não encontrado com este ID ou nome de usuário.', 'ERRO DE BUSCA', 'warning');
      return;
    }

    // Protection for SuperAdmin account
    if (targetUser.username.toLowerCase() === 'samuellsilvva02') {
      showAlert('A conta do Administrador Supremo é inviolável.', 'AÇÃO NEGADA', 'warning');
      return;
    }

    const isTargetGeneralAdmin = targetUser.role?.toLowerCase() === 'administrador geral' || targetUser.username.toLowerCase() === 'samuellsilvva02';
    const isTargetStandardAdmin = !isTargetGeneralAdmin && (targetUser.role?.toLowerCase() === 'admin' || targetUser.role?.toLowerCase() === 'administrador');
    const isTargetAnyAdmin = isTargetGeneralAdmin || isTargetStandardAdmin;

    // Proteção de Hierarquia
    if (isTargetAnyAdmin && targetUser.username.toLowerCase() !== currentUser?.username?.toLowerCase()) {
      if (isTargetGeneralAdmin && !isSuperAdmin) {
        showAlert('Apenas o Administrador Supremo pode gerenciar outros administradores gerais.', 'PERMISSÃO NEGADA', 'error');
        return;
      }
      if (isTargetStandardAdmin && !isGeneralAdmin) {
        showAlert('Apenas o Administrador Geral ou Supremo pode gerenciar administradores.', 'PERMISSÃO NEGADA', 'error');
        return;
      }
    }

    try {
      // Find document ID directly from targetUser or query Firestore
      let docId = targetUser.id;
      if (!docId) {
        const q = query(collection(db, 'users'), where('username', '==', targetUser.username.toLowerCase()));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          showAlert('Usuário não encontrado na base de dados.', 'ERRO', 'error');
          return;
        }
        docId = querySnapshot.docs[0].id;
      }

      const userDocRef = doc(db, 'users', docId);

      if (actionType === 'ban') {
        if (targetUser.isBanned) {
          showAlert('Usuário já está banido.', 'AVISO', 'info');
          return;
        }
        setBanReasonTarget(targetUser);
        setBanReasonInput('');
        return; // Opens ban reason modal
      } else if (actionType === 'unban') {
        await updateDoc(userDocRef, { isBanned: false, bannedAt: null, banReason: null });
        setAllMembers(prev => prev.map(m => m.username.toLowerCase() === targetUser.username.toLowerCase() ? { ...m, isBanned: false, banReason: undefined } : m));
        showAlert(`Usuário @${targetUser.username} desbanido com sucesso!`, 'AÇÃO CONCLUÍDA', 'success');
      } else if (actionType === 'makeAdmin') {
        if (!isGeneralAdmin) {
          showAlert('Apenas o Administrador Geral pode promover usuários a Administrador.', 'PERMISSÃO NEGADA', 'error');
          return;
        }
        await updateDoc(userDocRef, { role: 'Administrador' });
        setAllMembers(prev => prev.map(m => m.username.toLowerCase() === targetUser.username.toLowerCase() ? { ...m, role: 'Administrador' } : m));
        showAlert(`Usuário @${targetUser.username} promovido a Administrador!`, 'AÇÃO CONCLUÍDA', 'success');
      } else if (actionType === 'makeGeneralAdmin') {
        if (!isGeneralAdmin) {
          showAlert('Apenas o Administrador Geral pode promover usuários a Administrador Geral.', 'PERMISSÃO NEGADA', 'error');
          return;
        }
        await updateDoc(userDocRef, { role: 'Administrador Geral' });
        setAllMembers(prev => prev.map(m => m.username.toLowerCase() === targetUser.username.toLowerCase() ? { ...m, role: 'Administrador Geral' } : m));
        showAlert(`Usuário @${targetUser.username} promovido a Administrador Geral!`, 'AÇÃO CONCLUÍDA', 'success');
      } else if (actionType === 'removeAdmin') {
        if (!isGeneralAdmin) {
          showAlert('Apenas o Administrador Geral pode remover cargos de administradores.', 'PERMISSÃO NEGADA', 'error');
          return;
        }
        await updateDoc(userDocRef, { role: 'Membro' });
        setAllMembers(prev => prev.map(m => m.username.toLowerCase() === targetUser.username.toLowerCase() ? { ...m, role: 'Membro' } : m));
        showAlert(`Cargo de administrador removido de @${targetUser.username}.`, 'AÇÃO CONCLUÍDA', 'success');
      }
      setAdminActionId('');
    } catch (err) {
      console.error('Erro ao executar ação administrativa:', err);
      showAlert('Erro ao processar a ação no servidor. Tente novamente.', 'ERRO', 'error');
    }
  };

  const handleBanUser = async (member: DevUser) => {
    if (!isAdmin) return;
    if (member.username === 'Samuel123' || member.username === 'samuellsilvva02') {
      showAlert('Não é possível banir a conta de Administrador Supremo.', 'AÇÃO NEGADA', 'warning');
      return;
    }

    if (member.isBanned) {
      try {
        const q = query(collection(db, 'users'), where('username', '==', member.username));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userDocRef = doc(db, 'users', querySnapshot.docs[0].id);
          await updateDoc(userDocRef, { 
            isBanned: false,
            bannedAt: null,
            banReason: null
          });
          
          showAlert(`Usuário @${member.username} desbanido com sucesso.`, 'USUÁRIO DESBANIDO', 'success');
        }
      } catch (err) {
        console.error(err);
        showAlert('Erro ao desbanir usuário.', 'ERRO', 'error');
      }
    } else {
      setBanReasonTarget(member);
      setBanReasonInput('');
    }
  };

  const handleRemoveFromGroupAction = async () => {
    if (!userToRemoveFromGroup || !currentGroupId) return;
    try {
      const groupRef = doc(db, 'groups', currentGroupId);
      const groupSnap = await getDoc(groupRef);
      if (groupSnap.exists()) {
        const groupData = groupSnap.data() as Group;
        const newMembers = (groupData.members || []).filter(m => m !== userToRemoveFromGroup.username);
        const newOwners = (groupData.owners || []).filter(m => m !== userToRemoveFromGroup.username);
        
        await updateDoc(groupRef, {
          members: newMembers,
          owners: newOwners
        });
        
        showAlert(`O usuário @${userToRemoveFromGroup.username} foi removido do grupo com sucesso.`, 'MEMBRO REMOVIDO', 'success');
      }
      setUserToRemoveFromGroup(null);
    } catch (err) {
      console.error(err);
      showAlert('Erro ao remover membro do grupo.', 'ERRO', 'error');
    }
  };

  const confirmBanWithReason = async () => {
    if (!banReasonTarget || !isAdmin) return;
    if (!banReasonInput.trim()) {
      showAlert('Por favor, informe o motivo do banimento para prosseguir.', 'CAMPO OBRIGATÓRIO', 'warning');
      return;
    }

    const reasonText = banReasonInput.trim();

    try {
      const q = query(collection(db, 'users'), where('username', '==', banReasonTarget.username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDocRef = doc(db, 'users', querySnapshot.docs[0].id);
        await updateDoc(userDocRef, { 
          isBanned: true,
          bannedAt: serverTimestamp(),
          banReason: reasonText
        });
        
        await addDoc(collection(db, 'reports'), {
          type: 'ban',
          reportedUser: banReasonTarget.username,
          reportedBy: currentUser?.username || 'ADMIN',
          reason: `Banimento manual: "${reasonText}"`,
          groupId: currentGroupId || "global",
      topic: currentGroupId ? (currentTopic || 'Geral') : 'Geral',
      timestamp: serverTimestamp()
        });

        showAlert(`Usuário @${banReasonTarget.username} foi banido com sucesso.`, 'USUÁRIO BANIDO', 'success');
        setBanReasonTarget(null);
        setBanReasonInput('');
      }
    } catch (err) {
      console.error(err);
      showAlert('Erro ao banir usuário.', 'ERRO', 'error');
    }
  };

  // Appeal Submission Handler for Banned User
  const submitAppeal = async () => {
    if (!appealText.trim() || !currentUser) return;

    try {
      const existingApp = appeals.find(a => a.username === currentUser.username);
      if (existingApp && existingApp.status === 'pending') {
        showAlert('Você já possui uma apelação em análise pelo Administrador.', 'APELAÇÃO EM ANÁLISE', 'warning');
        return;
      }

      const assignedAdmin = getRandomAssignedAdmin(allMembers);
      await addDoc(collection(db, 'appeals'), {
        username: currentUser.username,
        name: currentUser.name,
        reason: appealText.trim(),
        assignedAdmin,
        groupId: currentGroupId || "global",
        topic: currentGroupId ? (currentTopic || 'Geral') : 'Geral',
        timestamp: serverTimestamp(),
        bannedAt: currentUser.bannedAt || serverTimestamp(),
        status: 'pending'
      });

      showAlert('Sua apelação foi enviada para o administrador e será analisado o caso.', 'APELAÇÃO REGISTRADA', 'success');
      setAppealText('');
      setShowAppealModal(false);
    } catch (err) {
      console.error(err);
      showAlert('Erro ao transmitir apelação.', 'ERRO', 'error');
    }
  };

  // Image Upload Handler for Admin Appeal Proof
  const handleAppealImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showAlert('Selecione um arquivo de imagem válido (PNG, JPG, WEBP).', 'FORMATO INVÁLIDO', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAppealReplyImage(base64);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Admin Appeal Resolution Handler
  const handleAppealResolution = async (appealItem: Appeal, action: 'approved' | 'rejected' | 'reply_only') => {
    if (!isAdmin) return;

    try {
      const appealRef = doc(db, 'appeals', appealItem.id);

      if (action === 'approved') {
        // Unban user in users collection
        const qU = query(collection(db, 'users'), where('username', '==', appealItem.username));
        const uSnap = await getDocs(qU);
        for (const uDoc of uSnap.docs) {
          await updateDoc(doc(db, 'users', uDoc.id), {
            isBanned: false,
            bannedAt: null
          });
        }

        await updateDoc(appealRef, {
          status: 'approved',
          adminReplyText: appealReplyText.trim() || 'Apelação aprovada pelo Administrador.',
          adminReplyImage: appealReplyImage || null,
          repliedAt: serverTimestamp()
        });

        showAlert(`Apelação aceita! O usuário @${appealItem.username} foi desbanido com sucesso.`, 'USUÁRIO DESBANIDO', 'success');
        setAppealReplyTarget(null);
        setAppealReplyText('');
        setAppealReplyImage(null);
      } else if (action === 'rejected') {
        // Mark as rejected and delete user account and messages
        await updateDoc(appealRef, {
          status: 'rejected',
          adminReplyText: appealReplyText.trim() || 'Apelação rejeitada.',
          adminReplyImage: appealReplyImage || null,
          repliedAt: serverTimestamp()
        });

        const qU = query(collection(db, 'users'), where('username', '==', appealItem.username));
        const uSnap = await getDocs(qU);
        for (const uDoc of uSnap.docs) {
          await deleteDoc(doc(db, 'users', uDoc.id));
        }

        const qMsgs = query(collection(db, 'messages'), where('sender', '==', appealItem.username));
        const msgsSnap = await getDocs(qMsgs);
        for (const mDoc of msgsSnap.docs) {
          await deleteDoc(doc(db, 'messages', mDoc.id));
        }

        showAlert(`Apelação de @${appealItem.username} foi rejeitada e a conta foi excluída.`, 'CONTA EXCLUÍDA', 'info');
        setAppealReplyTarget(null);
        setAppealReplyText('');
        setAppealReplyImage(null);
      } else {
        // Just send reply with proof while keeping status
        await updateDoc(appealRef, {
          adminReplyText: appealReplyText.trim(),
          adminReplyImage: appealReplyImage || null,
          repliedAt: serverTimestamp()
        });

        showAlert(`Resposta e provas gravadas com sucesso para a apelação de @${appealItem.username}!`, 'RESPOSTA REGISTRADA', 'success');
        setAppealReplyTarget(null);
        setAppealReplyText('');
        setAppealReplyImage(null);
      }
    } catch (err) {
      console.error(err);
      showAlert('Erro ao processar apelação.', 'ERRO', 'error');
    }
  };

  // 2-Step Item Deletion Execution Handler (Appeals, Suggestions, Reports)
  const executeDeleteItemTarget = async () => {
    if (!itemToDeleteConfirm) return;
    const { id, type } = itemToDeleteConfirm;

    if (!isAdmin) {
      showAlert('Apenas administradores possuem privilégios para excluir registros.', 'ACESSO NEGADO', 'error');
      setItemToDeleteConfirm(null);
      return;
    }

    try {
      if (type === 'report') {
        await deleteDoc(doc(db, 'reports', id));
        showAlert('Denúncia removida permanentemente.', 'ITEM EXCLUÍDO', 'success');
      } else if (type === 'suggestion') {
        await deleteDoc(doc(db, 'suggestions', id));
        showAlert('Sugestão removida permanentemente.', 'ITEM EXCLUÍDO', 'success');
      } else if (type === 'appeal') {
        await deleteDoc(doc(db, 'appeals', id));
        showAlert('Apelação removida permanentemente.', 'ITEM EXCLUÍDO', 'success');
      }
      setItemToDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      showAlert('Erro ao remover registro do banco de dados: ' + (err instanceof Error ? err.message : String(err)), 'ERRO', 'error');
    }
  };

  const handleDeleteAppeal = (appealItem: Appeal) => {
    setItemToDeleteConfirm({
      id: appealItem.id,
      type: 'appeal',
      title: 'EXCLUIR APELAÇÃO DE BANIMENTO',
      author: `Usuário: @${appealItem.username} (${appealItem.name})`,
      snippet: appealItem.reason
    });
  };

  const handleDeleteReport = (rep: Report) => {
    setItemToDeleteConfirm({
      id: rep.id,
      type: 'report',
      title: 'EXCLUIR REGISTRO DE DENÚNCIA',
      author: `Alvo: @${rep.reportedUser} | Denunciante: @${rep.reportedBy}`,
      snippet: rep.reason
    });
  };

  const handleDeleteSuggestion = (sug: Suggestion) => {
    setItemToDeleteConfirm({
      id: sug.id,
      type: 'suggestion',
      title: 'EXCLUIR SUGESTÃO DO TIME',
      author: `Enviado por: @${sug.sender}`,
      snippet: sug.text
    });
  };

  // Execute Permanent Account Deletion & Message Purge
  const executeDeleteUserAccount = async () => {
    if (!userToDeleteConfirm || !isAdmin) return;
    const targetUser = userToDeleteConfirm;

    try {
      // 1. Delete user from 'users' collection
      const qUser = query(collection(db, 'users'), where('username', '==', targetUser.username));
      const userSnap = await getDocs(qUser);
      userSnap.forEach(async (docSnap) => {
        await deleteDoc(doc(db, 'users', docSnap.id));
      });

      // 2. Delete all messages sent by this user
      const qMsgs = query(collection(db, 'messages'), where('sender', '==', targetUser.username));
      const msgsSnap = await getDocs(qMsgs);
      msgsSnap.forEach(async (docSnap) => {
        await deleteDoc(doc(db, 'messages', docSnap.id));
      });

      showAlert(`Conta de @${targetUser.username} e suas mensagens foram permanentemente apagadas!`, 'CONTA EXCLUÍDA', 'success');
      setUserToDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      showAlert('Erro ao excluir conta permanentemente.', 'ERRO', 'error');
    }
  };

  // Submit Admin Reply to Report or Suggestion (Stored privately in Admin Panel)
  const handleAdminReply = async () => {
    if (!adminReplyTarget || !adminReplyText.trim() || !currentUser) return;

    try {
      const collectionName = adminReplyTarget.type === 'report' ? 'reports' : 'suggestions';
      const docRef = doc(db, collectionName, adminReplyTarget.id);

      await updateDoc(docRef, {
        adminReply: adminReplyText.trim(),
        repliedAt: serverTimestamp()
      });

      showAlert(`Resposta gravada com sucesso para a demanda de @${adminReplyTarget.user}!`, 'RESPOSTA REGISTRADA', 'success');
      setAdminReplyTarget(null);
      setAdminReplyText('');
    } catch (err) {
      console.error(err);
      showAlert('Erro ao enviar resposta do admin.', 'ERRO', 'error');
    }
  };



  // Animated Microphone Permission Tester
  const requestMicPermissionWithAnimation = async () => {
    setShowMicPermissionModal(true);
    setMicTestActive(false);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicTestActive(true);
      playHUDChime();

      // Audio Level Meter Simulation
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 64;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setMicAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
      };

      const interval = setInterval(updateLevel, 100);
      
      setTimeout(() => {
        clearInterval(interval);
        stream.getTracks().forEach(t => t.stop());
        audioCtx.close();
      }, 5000);
    } catch (err) {
      setMicTestActive(false);
      showAlert('Não foi possível obter permissão de acesso ao microfone no dispositivo.', 'ACESSO NEGADO', 'error');
    }
  };

  const triggerAutoModerationReport = async (userToReport: string, reasonText: string, mediaUrl?: string) => {
    // Auto-moderation disabled by request.
  };

  const submitReport = async () => {
    if (!reportTarget || !reportReason.trim() || !currentUser) return;
    
    const assignedAdmin = getRandomAssignedAdmin(allMembers);
    await addDoc(collection(db, 'reports'), {
      type: 'user',
      reportedUser: reportTarget,
      reportedBy: currentUser.username,
      reason: reportReason.trim(),
      assignedAdmin,
      groupId: currentGroupId || "global",
      topic: currentGroupId ? (currentTopic || 'Geral') : 'Geral',
      timestamp: serverTimestamp(),
      assignedAt: serverTimestamp()
    });
    
    showAlert(`Denúncia contra ${reportTarget} registrada com sucesso.`, 'DENÚNCIA ENVIADA', 'success');
    setReportTarget(null);
    setReportReason('');
  };

  const submitSuggestion = async () => {
    if (!suggestionText.trim() || !currentUser) return;
    
    const assignedAdmin = getRandomAssignedAdmin(allMembers);
    await addDoc(collection(db, 'suggestions'), {
      sender: currentUser.username,
      text: suggestionText.trim(),
      assignedAdmin,
      groupId: currentGroupId || "global",
      topic: currentGroupId ? (currentTopic || 'Geral') : 'Geral',
      timestamp: serverTimestamp()
    });
    
    showAlert(`Sua ideia foi registrada com sucesso para a análise da Administração.`, 'SUGESTÃO REGISTRADA', 'success');
    setShowSuggestionModal(false);
    setSuggestionText('');
  };

    if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 font-mono relative overflow-hidden select-none">
        {/* Subtle retro scanline backdrop */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] opacity-40 z-10"></div>
        
        {/* Centered card container */}
        <div className="relative z-20 flex flex-col items-center justify-center text-center max-w-sm w-full mx-auto p-8 rounded-sm bg-zinc-950 border border-emerald-900/80 shadow-2xl backdrop-blur-md">
          <div className="relative mb-6 flex items-center justify-center">
            <Globe className="w-12 h-12 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full -z-10 animate-pulse"></div>
          </div>
          
          <div className="flex items-center justify-center gap-2.5 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
            <span className="text-emerald-400 font-extrabold text-lg tracking-widest uppercase">
              CONECTANDO...
            </span>
          </div>
          
          <p className="text-emerald-700 text-xs font-mono tracking-widest uppercase mt-1">
            MY SOCIAL • REDE MENSAGEIRA
          </p>
        </div>
      </div>
    );
  }

  // --- MODALS ---

  const renderDeleteModal = () => (
    <AnimatePresence>
      {confirmDeleteId && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setConfirmDeleteId(null)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-950 border border-red-900/60 p-6 max-w-md w-full relative shadow-[0_0_50px_rgba(239,68,68,0.25)] rounded-md overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 animate-pulse" />
            
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-950/80 border border-red-800 rounded-full text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                <Trash2 className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-red-400 tracking-wider">CONFIRMAR EXCLUSÃO</h3>
                <p className="text-red-900/90 text-[10px] uppercase font-mono tracking-widest">Protocolo de Segurança</p>
              </div>
            </div>

            <p className="text-zinc-300 text-sm mb-6 leading-relaxed bg-black/50 p-3 rounded border border-red-900/30">
              Deseja realmente apagar esta mensagem permanentemente para todos os membros no chat?
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-sm text-xs font-bold transition-all"
              >
                CANCELAR
              </button>
              <button
                onClick={confirmDeleteAction}
                className="px-5 py-2 bg-red-950 hover:bg-red-900 text-red-200 border border-red-700 rounded-sm text-xs font-bold transition-all hover:scale-105 shadow-[0_0_15px_rgba(220,38,38,0.4)] flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                APAGAR PARA TODOS
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderConfirmPurgeModal = () => (
    <AnimatePresence>
      {confirmPurgeId && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setConfirmPurgeId(null)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-950 border border-red-900/80 p-6 max-w-md w-full relative shadow-[0_0_60px_rgba(239,68,68,0.35)] rounded-md overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 animate-pulse" />
            
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-950/80 border border-red-800 rounded-full text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                <Trash2 className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-red-400 tracking-wider">CONFIRMAR EXPURGO</h3>
                <p className="text-red-900/90 text-[10px] uppercase font-mono tracking-widest">Ação Crítica de Moderação</p>
              </div>
            </div>

            <p className="text-zinc-300 text-sm mb-6 leading-relaxed bg-black/60 p-4 rounded border border-red-900/40 font-mono text-center">
              ⚠️ <strong>ATENÇÃO (2ª ETAPA DE CONFIRMAÇÃO):</strong>
              <br /><br />
              Deseja realmente expurgar definitivamente esta mensagem do banco de dados (Firestore)? Esta ação é completamente irreversível e apagará qualquer vestígio ou anexo desta mensagem para sempre.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmPurgeId(null)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-sm text-xs font-bold transition-all"
              >
                CANCELAR
              </button>
              <button
                onClick={confirmPurgeAction}
                className="px-5 py-2 bg-red-950 hover:bg-red-900 text-red-200 border border-red-700 rounded-sm text-xs font-bold transition-all hover:scale-105 shadow-[0_0_15px_rgba(220,38,38,0.4)] flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                EXPURGAR DEFINITIVAMENTE
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderAlertModal = () => (
    <AnimatePresence>
      
      {/* Modal para Adicionar Novo Tópico no Grupo */}
      {showAddTopicModal && currentGroupId && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-[100] backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-zinc-950 border border-emerald-800 p-5 sm:p-6 rounded-md w-full max-w-md shadow-2xl relative"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Hash className="w-4 h-4" />
                <span>NOVO TÓPICO DO GRUPO</span>
              </div>
              <button
                onClick={() => setShowAddTopicModal(false)}
                className="text-zinc-500 hover:text-emerald-400 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-zinc-400 text-xs mb-4">
              Adicione um novo tópico ou assunto para categorizar o conteúdo deste grupo (ex: <strong className="text-emerald-300">Avisos, Projetos, Dúvidas</strong>).
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddTopicToGroup(currentGroupId, newTopicName);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-emerald-500 text-xs font-bold uppercase tracking-wider mb-1 font-mono">
                  Nome do Tópico
                </label>
                <input
                  type="text"
                  required
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  placeholder="Ex: Avisos, Regras, Projetos..."
                  maxLength={25}
                  className="w-full bg-zinc-900/80 border border-emerald-900 text-emerald-200 px-3.5 py-2.5 text-xs rounded focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTopicModal(false)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded text-xs font-bold transition-colors font-mono"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-bold transition-colors font-mono"
                >
                  Criar Tópico
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {customAlert && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setCustomAlert(null)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className={`bg-zinc-950 p-6 max-w-md w-full relative rounded-md overflow-hidden border shadow-2xl ${
              customAlert.type === 'error' ? 'border-red-900/80 shadow-[0_0_40px_rgba(220,38,38,0.25)]' :
              customAlert.type === 'warning' ? 'border-amber-900/80 shadow-[0_0_40px_rgba(245,158,11,0.25)]' :
              customAlert.type === 'success' ? 'border-emerald-900/80 shadow-[0_0_40px_rgba(16,185,129,0.25)]' :
              'border-blue-900/80 shadow-[0_0_40px_rgba(59,130,246,0.25)]'
            }`}
          >
            <div className={`absolute top-0 left-0 w-full h-1 ${
              customAlert.type === 'error' ? 'bg-red-500' :
              customAlert.type === 'warning' ? 'bg-amber-500' :
              customAlert.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
            }`} />

            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2.5 rounded-full border ${
                customAlert.type === 'error' ? 'bg-red-950/80 border-red-800 text-red-400' :
                customAlert.type === 'warning' ? 'bg-amber-950/80 border-amber-800 text-amber-400' :
                customAlert.type === 'success' ? 'bg-emerald-950/80 border-emerald-800 text-emerald-400' :
                'bg-blue-950/80 border-blue-800 text-blue-400'
              }`}>
                {customAlert.type === 'error' && <AlertTriangle className="w-5 h-5" />}
                {customAlert.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                {customAlert.type === 'success' && <Check className="w-5 h-5" />}
                {(!customAlert.type || customAlert.type === 'info') && <ShieldAlert className="w-5 h-5" />}
              </div>
              <div>
                <h3 className={`text-base font-extrabold tracking-wider uppercase ${
                  customAlert.type === 'error' ? 'text-red-400' :
                  customAlert.type === 'warning' ? 'text-amber-400' :
                  customAlert.type === 'success' ? 'text-emerald-400' : 'text-blue-400'
                }`}>
                  {customAlert.title}
                </h3>
              </div>
            </div>

            <p className="text-zinc-300 text-sm mb-6 leading-relaxed bg-black/60 p-3 rounded border border-zinc-800/80 font-sans">
              {customAlert.message}
            </p>

            <button
              onClick={() => setCustomAlert(null)}
              className={`w-full py-2.5 rounded-sm text-xs font-bold transition-all uppercase tracking-widest ${
                customAlert.type === 'error' ? 'bg-red-950 hover:bg-red-900 text-red-200 border border-red-800' :
                customAlert.type === 'warning' ? 'bg-amber-950 hover:bg-amber-900 text-amber-200 border border-amber-800' :
                customAlert.type === 'success' ? 'bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-800' :
                'bg-blue-950 hover:bg-blue-900 text-blue-200 border border-blue-800'
              }`}
            >
              ENTENDIDO
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderLightboxModal = () => {
    if (!lightboxImageUrl) return null;
    return (
      <AnimatePresence>
        <div className="fixed inset-0 bg-black/95 z-[999] flex flex-col items-center justify-center p-4 backdrop-blur-sm">
          <div className="absolute top-4 right-4 flex items-center gap-3 z-[1000]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerSafeDownload(lightboxImageUrl, lightboxImageName);
              }}
              className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 text-xs font-mono font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer focus:outline-none"
            >
              <Download className="w-3.5 h-3.5" />
              Baixar Arquivo
            </button>
            <button
              onClick={() => setLightboxImageUrl(null)}
              className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded transition-colors cursor-pointer focus:outline-none"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div
            onClick={() => setLightboxImageUrl(null)}
            className="w-full h-full flex flex-col items-center justify-center cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl max-h-[80vh] flex flex-col items-center justify-center relative p-2"
            >
              <img
                src={lightboxImageUrl}
                alt={lightboxImageName}
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[75vh] object-contain rounded border border-emerald-900/50 shadow-2xl bg-zinc-950/40"
              />
              <p className="mt-3 text-zinc-400 text-xs font-mono truncate max-w-lg">
                {lightboxImageName}
              </p>
            </motion.div>
          </div>
        </div>
      </AnimatePresence>
    );
  };

  const renderGroupTopicsModal = () => {
    const group = groups.find(g => g.id === currentGroupId);
    if (!group || !showGroupTopicsModal) return null;
    const topicsList = group.topics || ['Geral'];

    return (
      <AnimatePresence>
        {showGroupTopicsModal && (
          <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-[99] backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-emerald-800 p-5 sm:p-6 rounded-md w-full max-w-md shadow-2xl relative font-mono text-xs"
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-emerald-900/40">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Hash className="w-4 h-4 text-emerald-400" />
                  <span>TÓPICOS DO GRUPO</span>
                </div>
                <button
                  onClick={() => setShowGroupTopicsModal(false)}
                  className="text-zinc-500 hover:text-emerald-400 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-zinc-400 text-[11px] mb-4">
                Grupo: <strong className="text-emerald-300">{group.name}</strong>. Selecione um tópico para filtrar as conversas ou crie um novo tópico abaixo.
              </p>

              {/* Lista de Tópicos */}
              <div className="space-y-1.5 max-h-60 overflow-y-auto mb-5 pr-1 scrollbar-thin scrollbar-thumb-emerald-900">
                {topicsList.map(tName => {
                  const isSelected = (currentTopic || 'Geral') === tName;
                  return (
                    <button
                      key={tName}
                      onClick={() => {
                        setCurrentTopic(tName);
                        setShowGroupTopicsModal(false);
                      }}
                      className={`w-full text-left p-3 rounded border transition-all flex items-center justify-between font-bold ${
                        isSelected
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                          : 'bg-zinc-900/60 border-emerald-900/30 text-emerald-500 hover:bg-emerald-950/20 hover:border-emerald-800/50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Hash className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400 animate-pulse' : 'text-emerald-600'}`} />
                        #{tName}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] bg-emerald-500 text-black px-1.5 py-0.5 rounded font-black uppercase tracking-wider scale-90">
                          Ativo
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Opção Criar Tópico - Apenas Administradores do Grupo */}
              {((group as any).owner === currentUser?.username || isGeneralAdmin) && (
                <div className="pt-4 border-t border-emerald-900/40">
                  <h4 className="text-emerald-400 font-bold mb-2 uppercase tracking-wider text-[10px]">
                    Criar Novo Tópico
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTopicName}
                      onChange={(e) => setNewTopicName(e.target.value)}
                      placeholder="Nome do tópico (ex: Projetos)..."
                      maxLength={25}
                      className="flex-1 bg-zinc-900 border border-emerald-900 text-emerald-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-emerald-500 font-mono"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newTopicName.trim()) {
                            handleAddTopicToGroup(group.id, newTopicName);
                            setNewTopicName('');
                          }
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (newTopicName.trim()) {
                          handleAddTopicToGroup(group.id, newTopicName);
                          setNewTopicName('');
                        } else {
                          showAlert('Por favor, digite um nome válido para o tópico.', 'CAMPO VAZIO', 'warning');
                        }
                      }}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-bold transition-colors shrink-0"
                    >
                      Criar Tópico
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  };

    const renderPrivacyPolicy = () => (
    <AnimatePresence>
      
      {/* Edit Role Modal */}
      {showEditRoleModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-[100] backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-zinc-950 border border-emerald-800 p-5 sm:p-6 rounded-md w-full max-w-md shadow-2xl relative"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Briefcase className="w-4 h-4" />
                <span>ALTERAR CARGO / FUNÇÃO</span>
              </div>
              <button
                onClick={() => setShowEditRoleModal(false)}
                className="text-zinc-500 hover:text-emerald-400 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-zinc-400 text-xs mb-4">
              Digite seu cargo, função ou especialidade (opcional). Se deixar em branco, será definido como <strong className="text-emerald-300">Membro</strong>.
            </p>

            <div className="space-y-3">
              <label className="block text-emerald-500 text-xs font-bold uppercase tracking-wider">
                Cargo / Função
              </label>

              <input
                type="text"
                value={editRoleValue}
                onChange={(e) => setEditRoleValue(e.target.value)}
                placeholder="Ex: Engenheiro, Designer, QA, Analista... (Opcional)"
                className="w-full bg-zinc-900/80 border border-emerald-900 text-emerald-200 px-3.5 py-2.5 text-xs rounded focus:outline-none focus:border-emerald-500"
              />

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditRoleModal(false)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded text-xs font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!currentUser) return;
                    const finalRole = editRoleValue.trim() || 'Membro';
                    try {
                      const q = query(collection(db, 'users'), where('username', '==', currentUser.username));
                      const querySnapshot = await getDocs(q);
                      if (!querySnapshot.empty) {
                        const uDoc = querySnapshot.docs[0];
                        await updateDoc(doc(db, 'users', uDoc.id), { role: finalRole });
                      }
                      const updatedUser = { ...currentUser, role: finalRole };
                      setCurrentUser(updatedUser);
                      localStorage.setItem('hud_devs_active_user', currentUser.username);
                      setAllMembers(prev => prev.map(m => m.username.toLowerCase() === currentUser.username.toLowerCase() ? { ...m, role: finalRole } : m));
                      setShowEditRoleModal(false);
                      showAlert(`Seu cargo/função foi atualizado para "${finalRole}"!`, 'ATUALIZADO', 'success');
                    } catch (err) {
                      console.error(err);
                      showAlert('Erro ao atualizar cargo/função.', 'ERRO', 'error');
                    }
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-bold transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showPolicy && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 font-mono" 
          onClick={() => setShowPolicy(false)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.88, y: 15 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.88, y: 15 }} 
            transition={{ type: "spring", stiffness: 350, damping: 25 }} 
            onClick={(e) => e.stopPropagation()} 
            className="bg-zinc-950 border border-emerald-900/80 p-5 sm:p-6 max-w-2xl w-full relative shadow-[0_0_50px_rgba(16,185,129,0.25)] rounded-md flex flex-col max-h-[90vh]"
          >
            <button onClick={() => setShowPolicy(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-emerald-400 p-1">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4 shrink-0">
              <div className="p-2.5 bg-emerald-950 border border-emerald-800 rounded-full text-emerald-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-emerald-400 tracking-wider uppercase">Políticas de Privacidade & Diretrizes de Banimento</h2>
                <p className="text-[10px] text-emerald-700 uppercase tracking-widest">Protocolo Geral de Conduta do My social</p>
              </div>
            </div>

            <div className="space-y-4 text-zinc-300 text-xs overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-emerald-900/60 leading-relaxed shrink-1">
              
              <div className="bg-emerald-950/30 p-3 rounded border border-emerald-900/50 text-emerald-200 text-[11px]">
                <strong>AVISO IMPORTANTE AOS USUÁRIOS:</strong> O acesso e uso da rede My social exigem conformidade irrestrita com estas diretrizes. O desconhecimento ou violação destas normas não isenta nenhum usuário das penalidades e banimentos previstos.
              </div>

              {/* SEÇÃO 1 */}
              <div className="bg-black/60 p-3.5 rounded border border-zinc-800/80 space-y-2">
                <h3 className="text-emerald-400 font-bold text-xs uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  1. APLICAÇÃO DO BANIMENTO DE CONTA
                </h3>
                <p className="text-zinc-300 text-[11px]">
                  O <strong className="text-red-400">BANIMENTO DA CONTA</strong> é aplicado sumariamente quando um usuário exibe, envia, compartilha ou transmite qualquer conteúdo, mensagem, anexo ou comportamento que <strong>não esteja em conformidade com as diretrizes da comunidade</strong>.
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-zinc-400 text-[11px]">
                  <li>
                    <strong className="text-zinc-200">Exibição de Conteúdo Inadequado:</strong> Á expressamente proibido enviar imagens, áudios, textos ou links que contenham pornografia, violência, assédio, discriminação, discurso de ódio ou ilegalidades.
                  </li>
                  <li>
                    <strong className="text-zinc-200">Linguagem Imprópria & Palavrões:</strong> A rede possui um sistema autônomo de moderação com inteligência atenta. O envio de palavrões ou ofensas resulta em banimento autônomo imediato.
                  </li>
                  <li>
                    <strong className="text-zinc-200">Moderação Manual por Administradores:</strong> A Administração Global reserva-se o direito de banir manualmente qualquer usuário identificado violando as regras ou perturbando a ordem do sistema.
                  </li>
                </ul>
              </div>

              {/* SEÇÃO 2 */}
              <div className="bg-black/60 p-3.5 rounded border border-zinc-800/80 space-y-2">
                <h3 className="text-amber-400 font-bold text-xs uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  2. MOTIVO REGISTRADO & TRANSPARÊNCIA
                </h3>
                <p className="text-zinc-300 text-[11px]">
                  Para evitar controvérsias e garantir clareza absoluta, <strong>todas as ações de banimento possuem registro obrigatório do motivo específico no banco de dados</strong>.
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-zinc-400 text-[11px]">
                  <li>O motivo exato do banimento é disponibilizado diretamente na tela do usuário suspenso.</li>
                  <li>Todos os registros de denúncias e banimentos ficam arquivados para auditoria da administração.</li>
                </ul>
              </div>

              {/* SEÇÃO 3 */}
              <div className="bg-black/60 p-3.5 rounded border border-zinc-800/80 space-y-2">
                <h3 className="text-blue-400 font-bold text-xs uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  3. RECURSOS E PRAZO DE APELAÇÃO (7 DIAS)
                </h3>
                <p className="text-zinc-300 text-[11px]">
                  Usuários com contas banidas possuem o direito legítimo de contestação sob as seguintes regras irrenunciáveis:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-zinc-400 text-[11px]">
                  <li>
                    <strong className="text-zinc-200">Prazo de 7 Dias:</strong> O recurso/apelação deve ser submetido no prazo impreterível de até 7 (sete) dias corridos a partir da data de aplicação da sanção.
                  </li>
                  <li>
                    <strong className="text-zinc-200">Texto de Apelação até 5000 Caracteres:</strong> O usuário pode redigir uma defesa detalhada contendo até 5000 caracteres no formulário de apelação do sistema.
                  </li>
                  <li>
                    <strong className="text-zinc-200">Decisão Soberana da Administração:</strong> O pedido será analisado pela administração e o julgamento (aprovação ou rejeição) é definitivo.
                  </li>
                </ul>
              </div>

              {/* SEÇÃO 4 */}
              <div className="bg-black/60 p-3.5 rounded border border-zinc-800/80 space-y-2">
                <h3 className="text-emerald-400 font-bold text-xs uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  4. PRIVACIDADE E ARMAZENAMENTO DE DADOS
                </h3>
                <p className="text-zinc-300 text-[11px]">
                  Para prestação e segurança dos serviços, dados de perfil, logs de comunicação, anexos e relatórios de segurança são sincronizados em nuvem via infraestrutura protegida (Firestore). Nossas ferramentas contam com verificação de segurança em 2 etapas para exclusão de registros e proteção de integridade.
                </p>
              </div>

              {/* SEÇÃO 5 */}
              <div className="bg-black/60 p-3.5 rounded border border-zinc-800/80 space-y-2">
                <h3 className="text-teal-400 font-bold text-xs uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                  5. CONFORMIDADE COM A LGPD (LEI GERAL DE PROTEÇÃO DE DADOS)
                </h3>
                <p className="text-zinc-300 text-[11px]">
                  Em conformidade estrita com a <strong>LGPD (Lei Geral de Proteção de Dados - Lei nº 13.709/2018)</strong>, declaramos de forma irrevogável que <strong>nenhum dado pessoal, de registro ou de identificação dos usuários é compartilhado com terceiros</strong>. Todos os dados sincronizados (como apelido, mensagens e anexos) destinam-se única e exclusivamente ao funcionamento operacional seguro da plataforma interna de desenvolvimento e são arquivados sob padrões rígidos de criptografia e segurança em nuvem. Cada desenvolvedor possui o direito absoluto de requisitar à administração a remoção imediata e definitiva de todos os seus dados e registros de atividade do sistema.
                </p>
              </div>

            </div>

            <button 
              onClick={() => setShowPolicy(false)} 
              className="mt-4 w-full py-2.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-700 font-extrabold transition-all text-xs tracking-wider uppercase rounded shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              LI E ACEITO TODAS AS DIRETRIZES
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderReportModal = () => (
    <AnimatePresence>
      {!!reportTarget && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4" 
          onClick={() => { setReportTarget(null); setReportReason(''); }}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.88, y: 15 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.88, y: 15 }} 
            transition={{ type: "spring", stiffness: 350, damping: 25 }} 
            onClick={(e) => e.stopPropagation()} 
            className="bg-zinc-950 border border-red-900/60 p-4 sm:p-6 max-w-md w-full relative shadow-[0_0_50px_rgba(239,68,68,0.2)] rounded-md"
          >
            <button onClick={() => { setReportTarget(null); setReportReason(''); }} className="absolute top-4 right-4 text-zinc-500 hover:text-red-400">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <Flag className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
              <h2 className="text-base sm:text-lg font-bold text-red-400">Denunciar Usuário</h2>
            </div>
            <p className="text-zinc-400 text-sm mb-4">
              Reportando o usuário <strong className="text-white">[{reportTarget}]</strong>. Descreva o motivo abaixo:
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              maxLength={5000}
              placeholder="Descreva detalhadamente o motivo da denúncia (até 5000 caracteres)..."
              className="w-full bg-black border border-red-900/40 text-red-100 p-3 mb-2 h-36 resize-none focus:outline-none focus:border-red-500 rounded text-xs font-mono"
            />
            <div className="flex justify-between items-center text-xs font-mono mb-4 bg-black/60 p-2 rounded border border-red-900/40">
              <span className="text-red-400 font-bold"></span>
              <span className="text-red-300 font-extrabold bg-red-950 px-2.5 py-0.5 rounded border border-red-800">
                
              </span>
            </div>
            
            <button 
              onClick={submitReport}
              disabled={!reportReason.trim()}
              className="w-full py-2 bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 font-bold transition-colors disabled:opacity-50 rounded"
            >
              ENVIAR DENÚNCIA
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderSuggestionModal = () => (
    <AnimatePresence>
      {showSuggestionModal && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4" 
          onClick={() => { setShowSuggestionModal(false); setSuggestionText(''); }}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.88, y: 15 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.88, y: 15 }} 
            transition={{ type: "spring", stiffness: 350, damping: 25 }} 
            onClick={(e) => e.stopPropagation()} 
            className="bg-zinc-950 border border-blue-900/60 p-4 sm:p-6 max-w-md w-full relative shadow-[0_0_50px_rgba(59,130,246,0.2)] rounded-md"
          >
            <button onClick={() => { setShowSuggestionModal(false); setSuggestionText(''); }} className="absolute top-4 right-4 text-zinc-500 hover:text-blue-400">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
              <h2 className="text-base sm:text-lg font-bold text-blue-400">Enviar Sugestão</h2>
            </div>
            <p className="text-zinc-400 text-sm mb-4">
              Tem alguma ideia de melhoria para o My social? Envie diretamente para a administração.
            </p>
            <textarea
              value={suggestionText}
              onChange={(e) => setSuggestionText(e.target.value)}
              maxLength={5000}
              placeholder="Descreva sua sugestão em detalhes (até 5000 caracteres)..."
              className="w-full bg-black border border-blue-900/40 text-blue-100 p-3 mb-2 h-36 resize-none focus:outline-none focus:border-blue-500 rounded text-xs font-mono"
            />
            <div className="flex justify-between items-center text-xs font-mono mb-4 bg-black/60 p-2 rounded border border-blue-900/40">
              <span className="text-blue-400 font-bold"></span>
              <span className="text-blue-300 font-extrabold bg-blue-950 px-2.5 py-0.5 rounded border border-blue-800">
                
              </span>
            </div>
            <button 
              onClick={submitSuggestion}
              disabled={!suggestionText.trim()}
              className="w-full py-2 bg-blue-950/60 hover:bg-blue-900 text-blue-300 border border-blue-800 font-bold transition-colors disabled:opacity-50 rounded"
            >
              TRANSMITIR IDEIA
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  
  const renderGroupModals = () => {
    return (
      <AnimatePresence>
        {showCreateGroupModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-zinc-950 border border-emerald-900/50 p-4 sm:p-6 rounded-sm w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-emerald-400 flex items-center gap-2"><Users className="w-5 h-5 text-emerald-400" /> Criar Novo Grupo</h2>
                <button onClick={() => setShowCreateGroupModal(false)} className="text-emerald-700 hover:text-emerald-400"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-emerald-600 text-xs font-bold mb-2">NOME DO GRUPO</label>
                  <input type="text" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} className="w-full bg-black border border-emerald-900/50 p-3 text-emerald-400 focus:outline-none focus:border-emerald-500 rounded-sm" placeholder="Ex: Desenvolvedores Elite" required />
                </div>
                <div>
                  <label className="block text-emerald-600 text-xs font-bold mb-2">DESCRIÇÃO</label>
                  <input type="text" value={newGroupDesc} onChange={(e) => setNewGroupDesc(e.target.value)} className="w-full bg-black border border-emerald-900/50 p-3 text-emerald-400 focus:outline-none focus:border-emerald-500 rounded-sm" placeholder="Sobre o que é este grupo?" />
                </div>
                <button type="submit" className="w-full bg-emerald-900 hover:bg-emerald-800 text-emerald-100 p-3 rounded-sm font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Criar Grupo
                </button>
              </form>
            </motion.div>
          </div>
        )}
        
        {showJoinGroupModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-zinc-950 border border-emerald-900/50 p-4 sm:p-6 rounded-sm w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-emerald-400 flex items-center gap-2"><LinkIcon className="w-5 h-5" /> Entrar em um Grupo</h2>
                <button onClick={() => setShowJoinGroupModal(false)} className="text-emerald-700 hover:text-emerald-400"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleJoinGroup} className="space-y-4">
                <div>
                  <label className="block text-emerald-600 text-xs font-bold mb-2">LINK OU CÓDIGO DE CONVITE</label>
                  <input type="text" value={joinLinkInput} onChange={(e) => setJoinLinkInput(e.target.value)} className="w-full bg-black border border-emerald-900/50 p-3 text-emerald-400 focus:outline-none focus:border-emerald-500 rounded-sm" placeholder="Cole o link de convite aqui..." required />
                </div>
                <button type="submit" className="w-full bg-emerald-900 hover:bg-emerald-800 text-emerald-100 p-3 rounded-sm font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" /> Entrar
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {groupSettingsTarget && (
          <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-3 sm:p-4 z-[100] backdrop-blur-md">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-zinc-950 border border-emerald-900/80 p-5 sm:p-6 rounded-md w-full max-w-xl shadow-2xl relative max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center mb-5 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-950 border border-emerald-800 rounded-full text-emerald-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-emerald-400 uppercase tracking-wider">Gerenciar Grupo</h2>
                    <p className="text-emerald-700 text-xs font-mono">{groupSettingsTarget.name}</p>
                  </div>
                </div>
                <button onClick={() => setGroupSettingsTarget(null)} className="text-zinc-500 hover:text-emerald-400 p-1"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-5 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-emerald-900 flex-1">
                {/* Invite Link */}
                <div className="bg-black border border-emerald-900/60 p-3.5 rounded-sm shrink-0">
                  <h3 className="text-emerald-500 text-xs font-bold mb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-emerald-400" /> LINK DE CONVITE DO GRUPO
                  </h3>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input type="text" readOnly value={`${window.location.origin}${window.location.pathname}?invite=${groupSettingsTarget.inviteCode}`} className="w-full bg-zinc-950 border border-emerald-900/80 p-2 text-emerald-300 text-xs focus:outline-none rounded-sm font-mono" />
                    <div className="flex gap-2">
                      <button onClick={() => copyOrShareGroupLink(groupSettingsTarget)} className="bg-emerald-900 hover:bg-emerald-800 text-emerald-100 px-3 py-2 rounded-sm shrink-0 flex items-center gap-1.5 text-xs font-bold transition-colors border border-emerald-700/80" title="Compartilhar ou Copiar Link">
                        <LinkIcon className="w-4 h-4" />
                        <span>Copiar</span>
                      </button>
                      {(groupSettingsTarget.owners.includes(currentUser?.username || '') || isAdmin) && (
                        <button onClick={() => handleResetGroupInviteCode(groupSettingsTarget.id)} className="bg-red-950/60 hover:bg-red-900 text-red-300 px-3 py-2 rounded-sm shrink-0 flex items-center gap-1.5 text-xs font-bold transition-colors border border-red-900" title="Redefinir link de convite">
                          <X className="w-4 h-4" />
                          <span>Redefinir</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit Group Name Section (Owners / Admins) */}
                {(groupSettingsTarget.owners.includes(currentUser?.username || '') || isAdmin) && (
                  <div className="bg-black border border-emerald-900/60 p-3.5 rounded-sm shrink-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Edit2 className="w-3.5 h-3.5 text-emerald-400" /> RENOMEAR GRUPO
                      </h3>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        (groupSettingsTarget.nameEditCount || 0) >= 2
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}>
                        Edições do Nome: {groupSettingsTarget.nameEditCount || 0}/2
                      </span>
                    </div>

                    {(groupSettingsTarget.nameEditCount || 0) < 2 ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editGroupNameInput}
                            onChange={(e) => setEditGroupNameInput(e.target.value)}
                            placeholder="Novo nome do grupo..."
                            maxLength={40}
                            className="w-full bg-zinc-950 border border-emerald-900/80 p-2 text-emerald-200 text-xs focus:outline-none focus:border-emerald-500 rounded-sm font-mono"
                          />
                          <button
                            onClick={handleRenameGroup}
                            className="bg-emerald-800 hover:bg-emerald-700 text-white px-3 py-2 text-xs font-bold rounded-sm shrink-0 transition-colors border border-emerald-600"
                          >
                            Salvar
                          </button>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-mono">
                          Você pode alterar o nome do grupo no máximo 2 vezes. Edições restantes: {2 - (groupSettingsTarget.nameEditCount || 0)}.
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-red-400 font-mono bg-red-950/30 p-2 rounded border border-red-900/40">
                        ⚠️ O limite de 2 alterações de nome para este grupo já foi atingido.
                      </p>
                    )}
                  </div>
                )}

                {/* Group Topics Section */}
                <div className="bg-black border border-emerald-900/60 p-3.5 rounded-sm shrink-0 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-emerald-400" /> TÓPICOS DO GRUPO ({(groupSettingsTarget.topics || ['Geral']).length})
                    </h3>
                    <button
                      onClick={() => {
                        setNewTopicName('');
                        setShowAddTopicModal(true);
                      }}
                      className="bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-emerald-400" />
                      <span>Adicionar Tópico</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(groupSettingsTarget.topics || ['Geral']).map(t => (
                      <div
                        key={t}
                        className="bg-zinc-900 border border-emerald-900/80 text-emerald-300 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-mono animate-fade-in"
                      >
                        {editingTopicName === t ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={editTopicValue}
                              onChange={(e) => setEditTopicValue(e.target.value)}
                              className="bg-black text-emerald-300 font-mono text-xs px-1.5 py-0.5 border border-emerald-850 rounded focus:outline-none w-24"
                              autoFocus
                            />
                            <button
                              onClick={() => {
                                handleEditTopicInGroup(groupSettingsTarget.id, t, editTopicValue);
                                setEditingTopicName(null);
                              }}
                              className="text-emerald-400 hover:text-emerald-200 p-0.5"
                              title="Salvar"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setEditingTopicName(null)}
                              className="text-zinc-500 hover:text-zinc-300 p-0.5"
                              title="Cancelar"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span>#{t}</span>
                            {t.toLowerCase() !== 'geral' && (groupSettingsTarget.owners.includes(currentUser?.username || '') || isAdmin) && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    setEditingTopicName(t);
                                    setEditTopicValue(t);
                                  }}
                                  className="text-zinc-500 hover:text-emerald-400 p-0.5"
                                  title="Editar tópico"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleRemoveTopicFromGroup(groupSettingsTarget.id, t)}
                                  className="text-zinc-500 hover:text-red-400 p-0.5"
                                  title="Remover tópico"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Members List Profile Style */}
                <div>
                  <h3 className="text-emerald-400 text-xs font-bold mb-3 flex items-center justify-between uppercase tracking-wider">
                    MEMBROS DO GRUPO ({groupSettingsTarget.members.length})
                  </h3>
                  <div className="space-y-2.5">
                    {groupSettingsTarget.members.map(memberUser => {
                      const memberObj = allMembers.find(m => m.username.toLowerCase() === memberUser.toLowerCase());
                      const memberName = memberObj?.name || memberUser;
                      const memberRole = memberObj?.role || 'Membro';
                      const memberShortId = memberObj?.shortId || 'S/ID';
                      const isGroupOwner = groupSettingsTarget.owners.includes(memberUser);
                      const isSelf = memberUser.toLowerCase() === currentUser?.username?.toLowerCase();

                      return (
                        <div key={memberUser} className="bg-black/90 border border-emerald-900/50 p-3 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-700/60 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border ${
                              isGroupOwner
                                ? 'bg-amber-950 text-amber-300 border-amber-700 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                                : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            }`}>
                              {memberName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-white font-bold text-xs truncate">{memberName}</span>
                                <span className="text-emerald-500/80 text-[11px] font-mono">@{memberUser}</span>
                                {isSelf && (
                                  <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                                    VOCÊ
                                  </span>
                                )}
                                {isGroupOwner && (
                                  <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                                    LÍDER DO GRUPO
                                  </span>
                                )}
                              </div>
                              <p className="text-emerald-400/80 text-[11px] font-mono uppercase tracking-wider mt-0.5">
                                {memberRole} • ID: {memberShortId}
                              </p>
                            </div>
                          </div>

                          {/* Member 3-Dots Action Menu */}
                          {groupSettingsTarget.owners.includes(currentUser?.username || '') && !isSelf && (
                            <div className="relative shrink-0">
                              <button
                                onClick={() => setOpenGroupMemberMenuUser(openGroupMemberMenuUser === memberUser ? null : memberUser)}
                                className="p-1.5 bg-zinc-900 hover:bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-sm transition-colors"
                                title="Opções do Membro do Grupo"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {/* Dropdown Menu */}
                              {openGroupMemberMenuUser === memberUser && (
                                <div className="absolute right-0 top-full mt-1 w-48 bg-zinc-950 border border-emerald-800 rounded shadow-2xl p-1 z-50 space-y-1 font-mono text-xs">
                                  <button
                                    onClick={async () => {
                                      setOpenGroupMemberMenuUser(null);
                                      const newOwners = isGroupOwner
                                        ? groupSettingsTarget.owners.filter(o => o !== memberUser)
                                        : [...groupSettingsTarget.owners, memberUser];
                                      await updateDoc(doc(db, 'groups', groupSettingsTarget.id), { owners: newOwners });
                                      setGroupSettingsTarget({ ...groupSettingsTarget, owners: newOwners });
                                    }}
                                    className={`w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 font-bold ${
                                      isGroupOwner
                                        ? 'hover:bg-amber-950/60 text-amber-300'
                                        : 'hover:bg-emerald-950/60 text-emerald-300'
                                    }`}
                                  >
                                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                                    <span>{isGroupOwner ? 'Remover Líder' : 'Tornar Líder'}</span>
                                  </button>

                                  <button
                                    onClick={async () => {
                                      setOpenGroupMemberMenuUser(null);
                                      if (confirm(`Remover @${memberUser} do grupo?`)) {
                                        const newMembers = groupSettingsTarget.members.filter(m => m !== memberUser);
                                        const newOwners = groupSettingsTarget.owners.filter(o => o !== memberUser);
                                        await updateDoc(doc(db, 'groups', groupSettingsTarget.id), { members: newMembers, owners: newOwners });
                                        setGroupSettingsTarget({ ...groupSettingsTarget, members: newMembers, owners: newOwners });
                                      }
                                    }}
                                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-red-950/60 text-red-300 flex items-center gap-2 font-bold"
                                  >
                                    <UserX className="w-3.5 h-3.5 text-red-400" />
                                    <span>Remover do Grupo</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setOpenGroupMemberMenuUser(null);
                                      navigator.clipboard.writeText(`@${memberUser}`);
                                      showAlert(`@${memberUser} copiado!`, 'COPIADO', 'info');
                                    }}
                                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-emerald-950/40 text-emerald-300 flex items-center gap-2 font-bold"
                                  >
                                    <User className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Copiar @{memberUser}</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Exit & Delete Group Buttons */}
              <div className="pt-4 border-t border-emerald-900/40 shrink-0 mt-4 space-y-2">
                {(groupSettingsTarget.owners.includes(currentUser?.username || '') || isAdmin) && (
                  <button
                    onClick={() => handleDeleteGroup(groupSettingsTarget)}
                    className="w-full bg-red-950/90 border border-red-700/80 text-red-200 hover:bg-red-900 p-2.5 text-xs font-bold rounded transition-colors uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                    <span>APAGAR GRUPO (DEFINITIVO)</span>
                  </button>
                )}

                <button
                  onClick={async () => {
                    if (confirm('Tem certeza que deseja sair do grupo?')) {
                      const newMembers = groupSettingsTarget.members.filter(m => m !== currentUser?.username);
                      await updateDoc(doc(db, 'groups', groupSettingsTarget.id), { members: newMembers });
                      setGroupSettingsTarget(null);
                      setCurrentGroupId(null);
                      setShowGroupsMenu(false);
                      showAlert('Você saiu do grupo.', 'SUCESSO', 'info');
                    }
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 p-2.5 text-xs font-bold rounded transition-colors uppercase tracking-wider"
                >
                  SAIR DO GRUPO
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  };

  const renderMembersModal = () => {
    const currentGrp = currentGroupId ? groups.find(g => g.id === currentGroupId) : null;
    const groupMembersOnly = currentGroupId && currentGrp 
      ? allMembers.filter(m => (currentGrp.members || []).includes(m.username))
      : allMembers;

    const filteredMembers = groupMembersOnly.filter(m =>
      (m.name || '').toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      (m.username || '').toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      (m.role || '').toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      (m.shortId || '').toLowerCase().includes(memberSearchQuery.toLowerCase())
    );

    return (
      <AnimatePresence>
        {showMembersModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4"
            onClick={() => { setShowMembersModal(false); setMemberSearchQuery(''); setOpenMemberMenuUsername(null); setShowAdminIdActionMenu(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-950 border border-emerald-900/80 p-4 sm:p-6 max-w-2xl w-full relative shadow-[0_0_50px_rgba(16,185,129,0.25)] rounded-md flex flex-col max-h-[85vh] font-mono"
            >
              <button
                onClick={() => { setShowMembersModal(false); setMemberSearchQuery(''); setOpenMemberMenuUsername(null); setShowAdminIdActionMenu(false); }}
                className="absolute top-4 right-4 text-zinc-500 hover:text-emerald-400 p-1"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4 shrink-0">
                <div className="p-2.5 bg-emerald-950/80 border border-emerald-800/80 rounded-full text-emerald-400">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-emerald-400 tracking-wider flex items-center gap-2 uppercase">
                    {currentGroupId ? `MEMBROS DO GRUPO (${groupMembersOnly.length})` : `USUÁRIOS DA COMUNIDADE (${allMembers.length})`}
                  </h2>
                  <p className="text-emerald-700 text-xs font-mono">
                    {currentGroupId ? 'Lista de membros que fazem parte deste grupo' : 'Membros registrados no Chat Global e Comunidades'}
                  </p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative mb-4 shrink-0">
                <Search className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                  placeholder="Buscar por nome, @usuário, cargo ou ID..."
                  className="w-full bg-black border border-emerald-900/60 text-emerald-200 pl-9 pr-4 py-2 text-xs rounded-sm focus:outline-none focus:border-emerald-500 placeholder-zinc-600"
                />
              </div>

              {/* Admin Control Panel By ID (Behind 3-Dots Menu) */}
              {isAdmin && (
                <div className="bg-zinc-900/80 border border-emerald-900/60 p-3 rounded-md mb-4 shrink-0 flex items-center gap-2 relative">
                  <input
                    type="text"
                    value={adminActionId}
                    onChange={(e) => setAdminActionId(e.target.value.toUpperCase())}
                    placeholder="Digite o ID ou @usuário (ex: A1B2C3)"
                    className="bg-black border border-emerald-900/60 text-emerald-300 px-3 py-1.5 text-xs rounded-sm focus:outline-none focus:border-emerald-500 font-mono flex-1 placeholder-zinc-600"
                  />

                  {/* 3-Dots Dropdown Trigger for Admin Action By ID */}
                  <div className="relative">
                    <button
                      onClick={() => setShowAdminIdActionMenu(!showAdminIdActionMenu)}
                      className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded text-xs font-bold flex items-center gap-1 transition-colors uppercase"
                      title="Ações do ID"
                    >
                      <MoreVertical className="w-4 h-4 text-emerald-400" />
                      <span>Ações ID</span>
                    </button>

                    {showAdminIdActionMenu && (
                      <div className="absolute right-0 top-full mt-1.5 w-48 bg-zinc-950 border border-emerald-800 rounded shadow-2xl p-1 z-50 space-y-1 font-mono text-xs">
                        <button
                          onClick={() => {
                            setShowAdminIdActionMenu(false);
                            handleAdminActionById('ban', adminActionId);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded hover:bg-amber-950/60 text-amber-300 flex items-center gap-2 font-bold"
                        >
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                          <span>Banir por ID</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowAdminIdActionMenu(false);
                            handleAdminActionById('unban', adminActionId);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded hover:bg-emerald-950/60 text-emerald-300 flex items-center gap-2 font-bold"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Desbanir por ID</span>
                        </button>
                        {isGeneralAdmin && (
                          <>
                            <button
                              onClick={() => {
                                setShowAdminIdActionMenu(false);
                                handleAdminActionById('makeAdmin', adminActionId);
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-red-950/60 text-red-300 flex items-center gap-2 font-bold"
                            >
                              <Shield className="w-3.5 h-3.5 text-red-400" />
                              <span>Tornar Administrador</span>
                            </button>
                            <button
                              onClick={() => {
                                setShowAdminIdActionMenu(false);
                                handleAdminActionById('makeGeneralAdmin', adminActionId);
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-fuchsia-950/60 text-fuchsia-300 flex items-center gap-2 font-bold"
                            >
                              <Crown className="w-3.5 h-3.5 text-fuchsia-400" />
                              <span>Tornar Administrador Geral</span>
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setShowAdminIdActionMenu(false);
                            handleAdminActionById('removeAdmin', adminActionId);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded hover:bg-zinc-800 text-zinc-300 flex items-center gap-2 font-bold"
                        >
                          <UserX className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Remover Admin</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Members List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-emerald-900">
                {filteredMembers.length === 0 ? (
                  <p className="text-zinc-600 text-center py-8 text-xs font-mono">Nenhum membro encontrado.</p>
                ) : (
                  filteredMembers.map((member) => {
                    const isSelf = member.username.toLowerCase() === currentUser?.username?.toLowerCase();
                    const isSuperAdminAccount = member.username.toLowerCase() === 'samuellsilvva02';
                    const isTargetGeneralAdmin = member.role?.toLowerCase() === 'administrador geral' || isSuperAdminAccount;
                    const isTargetStandardAdmin = !isTargetGeneralAdmin && (member.role?.toLowerCase() === 'admin' || member.role?.toLowerCase() === 'administrador');
                    const isMenuOpen = openMemberMenuUsername === member.username;

                    return (
                      <div
                        key={member.id || member.username}
                        className={`bg-black/80 border p-3 rounded-sm flex items-center justify-between gap-3 transition-all relative ${
                          member.isBanned
                            ? 'border-red-900/50 bg-red-950/10'
                            : isTargetGeneralAdmin
                            ? 'border-fuchsia-700/60 bg-fuchsia-950/20'
                            : isTargetStandardAdmin
                            ? 'border-red-700/60 bg-red-950/20'
                            : 'border-emerald-900/40 hover:border-emerald-700/60'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                            member.isBanned
                              ? 'bg-red-950 text-red-400 border border-red-800'
                              : isTargetGeneralAdmin
                              ? 'bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-800'
                              : isTargetStandardAdmin
                              ? 'bg-red-900 text-red-300 border border-red-700'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}>
                            {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-white font-bold text-xs truncate">{member.name}</span>
                              <span className="text-emerald-500/80 text-[11px] font-mono">@{member.username}</span>
                              {isSelf && (
                                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                  VOCÊ
                                </span>
                              )}
                              {isTargetGeneralAdmin && (
                                <span className="bg-gradient-to-r from-fuchsia-900 to-purple-900 text-fuchsia-100 border border-fuchsia-500 text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-[0_0_10px_rgba(217,70,239,0.3)]">
                                  GERAL
                                </span>
                              )}
                              {isTargetStandardAdmin && (
                                <span className="bg-red-950 text-red-300 border border-red-800 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                  ADMIN
                                </span>
                              )}
                              {member.isBanned && (
                                <span className="bg-red-950 text-red-400 border border-red-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                  BANIDO
                                </span>
                              )}
                            </div>
                            <p className="text-emerald-400/80 text-[11px] font-mono uppercase tracking-wider mt-0.5">
                              {member.role || 'Membro'} • ID: {member.shortId || 'Sem ID'}
                            </p>
                            {member.isBanned && member.banReason && (
                              <p className="text-red-300 text-[10px] font-mono mt-1 bg-red-950/40 p-1.5 rounded border border-red-900/50 break-words">
                                <strong className="text-red-400">Motivo:</strong> {member.banReason}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Member 3-Dots Action Menu */}
                        <div className="relative shrink-0">
                          <button
                            onClick={() => setOpenMemberMenuUsername(isMenuOpen ? null : member.username)}
                            className="p-1.5 bg-zinc-900 hover:bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-sm transition-colors"
                            title="Opções do Membro"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Context Menu Popup */}
                          {isMenuOpen && (
                            <div className="absolute right-0 top-full mt-1 w-52 bg-zinc-950 border border-emerald-800 rounded shadow-2xl p-1.5 z-50 space-y-1 font-mono text-xs">
                              {isAdmin && !isSelf && !isSuperAdminAccount && (
                                <>
                                  <button
                                    onClick={() => {
                                      setOpenMemberMenuUsername(null);
                                      handleBanUser(member);
                                    }}
                                    className={`w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 font-bold ${
                                      member.isBanned
                                        ? 'hover:bg-emerald-950/60 text-emerald-300'
                                        : 'hover:bg-amber-950/60 text-amber-300'
                                    }`}
                                  >
                                    <ShieldAlert className="w-3.5 h-3.5" />
                                    <span>{member.isBanned ? 'Desbanir Usuário' : 'Banir Usuário'}</span>
                                  </button>

                                  {isGeneralAdmin && (
                                    <>
                                      {!isTargetStandardAdmin && (
                                        <button
                                          onClick={() => {
                                            setOpenMemberMenuUsername(null);
                                            handleAdminActionById('makeAdmin', member.id || member.shortId || member.username);
                                          }}
                                          className="w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 font-bold hover:bg-red-950/60 text-red-300"
                                        >
                                          <Shield className="w-3.5 h-3.5 text-red-400" />
                                          <span>Tornar Administrador</span>
                                        </button>
                                      )}
                                      {!isTargetGeneralAdmin && (
                                        <button
                                          onClick={() => {
                                            setOpenMemberMenuUsername(null);
                                            handleAdminActionById('makeGeneralAdmin', member.id || member.shortId || member.username);
                                          }}
                                          className="w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 font-bold hover:bg-fuchsia-950/60 text-fuchsia-300"
                                        >
                                          <Crown className="w-3.5 h-3.5 text-fuchsia-400" />
                                          <span>Tornar Administrador Geral</span>
                                        </button>
                                      )}
                                      {(isTargetStandardAdmin || (isTargetGeneralAdmin && isSuperAdmin)) && (
                                        <button
                                          onClick={() => {
                                            setOpenMemberMenuUsername(null);
                                            handleAdminActionById('removeAdmin', member.id || member.shortId || member.username);
                                          }}
                                          className="w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 font-bold hover:bg-zinc-800 text-zinc-300"
                                        >
                                          <UserX className="w-3.5 h-3.5 text-zinc-400" />
                                          <span>Remover Cargo Admin</span>
                                        </button>
                                      )}
                                    </>
                                  )}
                                </>
                              )}

                              {currentGroupId && (currentGrp?.owners.includes(currentUser?.username || '') || isAdmin) && !isSelf && (
                                <button
                                  onClick={() => {
                                    setOpenMemberMenuUsername(null);
                                    setUserToRemoveFromGroup(member);
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-red-950/60 text-red-300 flex items-center gap-2 font-bold"
                                >
                                  <UserX className="w-3.5 h-3.5 text-red-400" />
                                  <span>Remover do Grupo</span>
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  setOpenMemberMenuUsername(null);
                                  navigator.clipboard.writeText(member.shortId || member.id || '');
                                  showAlert(`ID ${member.shortId} copiado para a área de transferência!`, 'COPIADO', 'info');
                                }}
                                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-emerald-950/40 text-emerald-300 flex items-center gap-2 font-bold"
                              >
                                <Copy className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Copiar ID (#{member.shortId || 'S/ID'})</span>
                              </button>

                              <button
                                onClick={() => {
                                  setOpenMemberMenuUsername(null);
                                  navigator.clipboard.writeText(`@${member.username}`);
                                  showAlert(`@${member.username} copiado!`, 'COPIADO', 'info');
                                }}
                                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-emerald-950/40 text-emerald-300 flex items-center gap-2 font-bold"
                              >
                                <User className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Copiar @{member.username}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

    const renderAdminReplyModal = () => (
    <AnimatePresence>
      {adminReplyTarget && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => { setAdminReplyTarget(null); setAdminReplyText(''); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-950 border border-fuchsia-900/80 p-6 max-w-md w-full relative shadow-[0_0_50px_rgba(217,70,239,0.25)] rounded-md"
          >
            <button
              onClick={() => { setAdminReplyTarget(null); setAdminReplyText(''); }}
              className="absolute top-4 right-4 text-zinc-500 hover:text-fuchsia-400"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-6 h-6 text-fuchsia-500" />
              <h2 className="text-lg font-bold text-fuchsia-400">Responder {adminReplyTarget.type === 'report' ? 'Denúncia' : 'Sugestão'}</h2>
            </div>
            <div className="bg-black/70 p-3 rounded border border-fuchsia-950 text-xs text-zinc-300 mb-4">
              <span className="text-fuchsia-400 font-bold">Autor:</span> @{adminReplyTarget.user}<br />
              <span className="text-fuchsia-400 font-bold">Conteúdo:</span> "{adminReplyTarget.text}"
            </div>
            <textarea
              value={adminReplyText}
              onChange={(e) => setAdminReplyText(e.target.value)}
              maxLength={5000}
              placeholder="Escreva a resposta oficial do Administrador (até 5000 caracteres)..."
              className="w-full bg-black border border-fuchsia-900/40 text-fuchsia-100 p-3 mb-2 h-28 resize-none focus:outline-none focus:border-fuchsia-500 rounded text-xs"
            />
            <div className="flex justify-between items-center text-xs font-mono mb-4 bg-black/60 p-2 rounded border border-fuchsia-900/40">
              <span className="text-fuchsia-400 font-bold"></span>
              <span className="text-fuchsia-300 font-extrabold bg-fuchsia-950 px-2.5 py-0.5 rounded border border-fuchsia-800">
                
              </span>
            </div>
            <button
              onClick={handleAdminReply}
              disabled={!adminReplyText.trim()}
              className="w-full py-2.5 bg-fuchsia-950 hover:bg-fuchsia-900 text-fuchsia-200 border border-fuchsia-700 font-bold text-xs transition-colors disabled:opacity-50 rounded flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              TRANSMITIR RESPOSTA OFICIAL
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderDeleteUserConfirmModal = () => (
    <AnimatePresence>
      {userToDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setUserToDeleteConfirm(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-950 border border-red-900/80 p-6 max-w-md w-full relative shadow-[0_0_50px_rgba(239,68,68,0.3)] rounded-md overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-red-600 animate-pulse" />
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-950/80 border border-red-800 rounded-full text-red-500">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-red-400 tracking-wider">EXCLUIR CONTA PERMANENTEMENTE</h3>
                <p className="text-red-800 text-[10px] font-mono uppercase tracking-widest">Ação Irreversível de Moderação</p>
              </div>
            </div>

            <p className="text-zinc-300 text-xs mb-6 leading-relaxed bg-black/60 p-3 rounded border border-red-900/40 font-mono">
              Tem certeza que deseja apagar permanentemente o usuário <strong className="text-white">@{userToDeleteConfirm.username}</strong> ({userToDeleteConfirm.name})?
              <br /><br />
              <span className="text-red-400 font-bold">â ï¸ Esta ação irá expurgar a credencial do usuário e TODAS as suas mensagens no chat!</span>
            </p>

            <div className="mb-6">
              <label className="block text-[10px] text-red-500 font-bold mb-1 uppercase tracking-widest">
                Para confirmar a exclusão, digite APAGAR abaixo:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Digite APAGAR..."
                className="w-full bg-black border border-red-900/60 text-red-100 px-3 py-2 text-xs rounded focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setUserToDeleteConfirm(null)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-sm text-xs font-bold transition-all"
              >
                CANCELAR
              </button>
              <button
                onClick={executeDeleteUserAccount}
                disabled={deleteConfirmText !== 'APAGAR'}
                className="px-5 py-2 bg-red-950 hover:bg-red-900 text-red-200 border border-red-700 rounded-sm text-xs font-bold transition-all hover:scale-105 shadow-[0_0_15px_rgba(220,38,38,0.4)] flex items-center gap-2 disabled:opacity-40 disabled:hover:scale-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
                EXCLUIR DEFINITIVAMENTE
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderMicPermissionModal = () => (
    <AnimatePresence>
      {showMicPermissionModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setShowMicPermissionModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-950 border border-emerald-900/80 p-6 max-w-md w-full relative shadow-[0_0_50px_rgba(16,185,129,0.25)] rounded-md overflow-hidden text-center"
          >
            <button
              onClick={() => setShowMicPermissionModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-emerald-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center justify-center my-4">
              <div className="relative w-24 h-24 flex items-center justify-center mb-4">
                <motion.div
                  animate={micTestActive ? { scale: [1, 1.4, 1], opacity: [0.3, 0.8, 0.3] } : {}}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 border-2 border-emerald-500/40 rounded-full"
                />
                <motion.div
                  animate={micTestActive ? { scale: [1, 1.8, 1], opacity: [0.1, 0.5, 0.1] } : {}}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
                  className="absolute inset-0 border border-emerald-400/20 rounded-full"
                />
                <div className={`p-5 rounded-full border relative z-10 transition-colors ${
                  micTestActive ? 'bg-emerald-950 text-emerald-400 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                }`}>
                  <Mic className="w-8 h-8" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-emerald-400 tracking-wider mb-1">
                {micTestActive ? 'MICROFONE ATIVO E OPERACIONAL' : 'DIAGNÓSTICO DE MICROFONE'}
              </h3>
              <p className="text-emerald-700 text-xs font-mono mb-4">
                {micTestActive ? 'Sinal capturado com sucesso pelo My social' : 'Aguardando teste de sinal...'}
              </p>

              {/* VU Meter Visualizer */}
              <div className="w-full bg-black border border-emerald-900/60 h-4 rounded-full overflow-hidden p-0.5 mb-4">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-amber-400 transition-all duration-75 rounded-full"
                  style={{ width: `${micAudioLevel}%` }}
                />
              </div>

              <p className="text-zinc-400 text-xs leading-relaxed mb-6 font-mono bg-black/60 p-3 rounded border border-emerald-900/30">
                Fale no microfone para testar o nível de áudio em tempo real antes de enviar mensagens de voz no chat.
              </p>

              <button
                onClick={() => setShowMicPermissionModal(false)}
                className="w-full py-2.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-700 font-bold text-xs rounded transition-colors"
              >
                CONCLUIR TESTE
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderAppealModal = () => {
    const userAppeal = appeals.find(a => a.username === currentUser?.username);
    
    let daysRemaining = 7;
    if (currentUser?.bannedAt) {
      let bTime = 0;
      if (currentUser.bannedAt.toDate) bTime = currentUser.bannedAt.toDate().getTime();
      else if (currentUser.bannedAt.seconds) bTime = currentUser.bannedAt.seconds * 1000;
      else bTime = new Date(currentUser.bannedAt).getTime();
      if (bTime > 0) {
        const diffMs = Date.now() - bTime;
        daysRemaining = Math.max(0, 7 - Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      }
    }

    return (
      <AnimatePresence>
        {showAppealModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowAppealModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-950 border border-amber-800 p-4 sm:p-6 max-w-lg w-full rounded shadow-[0_0_50px_rgba(245,158,11,0.25)] relative text-mono max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setShowAppealModal(false)} 
                className="absolute top-4 right-4 text-zinc-500 hover:text-amber-400"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 sm:p-2.5 bg-amber-950/80 border border-amber-800 rounded-full text-amber-500">
                  <Gavel className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold text-amber-400 tracking-wider uppercase">Apelação de Banimento</h2>
                  <p className="text-[10px] sm:text-[11px] text-amber-600 font-mono flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    EXCLUSÃO EM: <strong className="text-amber-300 font-bold">{daysRemaining} DIA(S)</strong>
                  </p>
                </div>
              </div>

              {currentUser?.banReason && (
                <div className="bg-red-950/40 p-3.5 rounded border border-red-800/80 mb-4 text-xs font-mono">
                  <div className="flex items-center gap-2 font-bold text-red-400 mb-1.5">
                    <ShieldAlert className="w-4 h-4 text-red-500" />
                    MOTIVO DO BANIMENTO (REGISTRADO PELO ADMIN):
                  </div>
                  <p className="bg-black/80 p-2.5 rounded border border-red-900/60 leading-relaxed text-red-100 whitespace-pre-wrap">
                    "{currentUser.banReason}"
                  </p>
                </div>
              )}

              {userAppeal ? (
                <div className="space-y-4">
                  <div className="bg-black/80 p-3.5 rounded border border-amber-900/60">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-zinc-400 font-bold">STATUS DA APELAÇÃO:</span>
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wider ${
                        userAppeal.status === 'approved' 
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-700' 
                          : userAppeal.status === 'rejected' 
                          ? 'bg-red-950 text-red-400 border border-red-700' 
                          : 'bg-amber-950 text-amber-400 border border-amber-700 animate-pulse'
                      }`}>
                        {userAppeal.status === 'approved' ? 'APROVADA (DESBANIDO)' : userAppeal.status === 'rejected' ? 'REJEITADA' : 'EM ANÁLISE'}
                      </span>
                    </div>
                    <p className="text-zinc-300 text-xs italic bg-zinc-900 p-2.5 rounded border border-zinc-800 font-mono">
                      "{userAppeal.reason}"
                    </p>
                  </div>

                  {userAppeal.adminReplyText || userAppeal.adminReplyImage ? (
                    <div className="bg-fuchsia-950/40 p-4 rounded border border-fuchsia-800/80 space-y-3">
                      <div className="flex items-center gap-2 text-fuchsia-400 text-xs font-bold border-b border-fuchsia-900/60 pb-2">
                        <ShieldAlert className="w-4 h-4" />
                        RESPOSTA & PROVAS DO ADMINISTRADOR
                      </div>

                      {userAppeal.adminReplyText && (
                        <p className="text-fuchsia-100 text-xs leading-relaxed bg-black/70 p-3 rounded border border-fuchsia-950 font-mono">
                          {userAppeal.adminReplyText}
                        </p>
                      )}

                      {userAppeal.adminReplyImage && (
                        <div>
                          <p className="text-[11px] text-fuchsia-300 font-bold mb-1.5">PROVA CONCRETA APRESENTADA PELO ADMIN:</p>
                          <button 
                            type="button"
                            onClick={() => {
                              setLightboxImageUrl(userAppeal.adminReplyImage);
                              setLightboxImageName('Prova concreta do Admin.jpg');
                            }}
                            className="block w-full focus:outline-none cursor-zoom-in"
                            title="Clique para expandir imagem em tela cheia"
                          >
                            <img 
                              src={userAppeal.adminReplyImage} 
                              alt="Prova concreta do Admin" 
                              className="max-h-60 rounded border border-fuchsia-700 object-contain hover:opacity-90 transition-opacity bg-black mx-auto"
                            />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-amber-950/30 p-3.5 rounded border border-amber-800/50 text-xs text-amber-300 flex items-center gap-2.5 font-mono">
                      <Clock className="w-4 h-4 shrink-0 animate-spin text-amber-400" />
                      <span>Sua apelação foi transmitida para o administrador e será analisado o caso. Verifique aqui periodicamente.</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-zinc-300 bg-black/60 p-3.5 rounded border border-amber-900/40 leading-relaxed font-mono">
                    Sua conta está suspensa nesta comunidade. Você tem até <strong className="text-amber-400">7 dias</strong> a partir da data de banimento para submeter um recurso explicativo ao administrador. Se o prazo expirar sem apelação, sua conta e suas mensagens serão excluídas do sistema.
                  </p>

                  <textarea
                    value={appealText}
                    onChange={(e) => setAppealText(e.target.value)}
                    maxLength={5000}
                    placeholder="Escreva sua justificativa e pedido de desbanimento (até 5000 caracteres)..."
                    className="w-full bg-black border border-amber-900/60 text-amber-100 p-3 h-32 resize-none focus:outline-none focus:border-amber-500 rounded text-xs font-mono"
                  />
                  <div className="flex justify-between items-center text-xs font-mono mb-2 bg-black/60 p-2 rounded border border-amber-900/40">
                    <span className="text-amber-400 font-bold"></span>
                    <span className="text-amber-300 font-extrabold bg-amber-950 px-2.5 py-0.5 rounded border border-amber-800">
                      
                    </span>
                  </div>

                  <button
                    onClick={submitAppeal}
                    disabled={!appealText.trim()}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-all rounded disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:scale-[1.02]"
                  >
                    <Send className="w-4 h-4" />
                    TRANSMITIR APELAÇÃO AO ADMINISTRADOR
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const renderRemoveFromGroupModal = () => (
    <AnimatePresence>
      {userToRemoveFromGroup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-[70] flex items-center justify-center p-4 font-mono"
          onClick={() => setUserToRemoveFromGroup(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-950 border border-red-900/80 p-4 sm:p-6 max-w-md w-full relative shadow-[0_0_60px_rgba(220,38,38,0.3)] rounded-md"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 animate-pulse" />
            <div className="flex items-center gap-3 sm:gap-4 mb-6">
              <div className="p-2 sm:p-3 bg-red-950 border border-red-800 rounded-full text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]">
                <UserX className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-red-500 tracking-wider uppercase">Remover do Grupo</h2>
                <p className="text-[9px] sm:text-[10px] text-red-900/80 uppercase font-bold tracking-widest">Expulsão de Membro</p>
              </div>
            </div>

            <div className="bg-black/60 p-4 rounded border border-red-900/40 mb-4 text-sm">
              <p className="text-zinc-300 mb-3">
                Você está prestes a remover o usuário <span className="text-red-400 font-bold">@{userToRemoveFromGroup.username}</span> deste grupo.
              </p>
              <p className="text-zinc-400 text-xs italic bg-red-950/20 p-2.5 rounded border border-red-900/20 leading-relaxed">
                Esta ação removerá o acesso imediato do membro a todas as mensagens e tópicos exclusivos deste grupo. Para retornar, ele precisará de um novo convite válido.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-[10px] text-red-500 font-bold mb-1 uppercase tracking-widest">
                Para confirmar, digite APAGAR abaixo:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Digite APAGAR..."
                className="w-full bg-black border border-red-900/60 text-red-100 px-3 py-2 text-xs rounded focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setUserToRemoveFromGroup(null)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-sm text-xs font-bold transition-all"
              >
                CANCELAR
              </button>
              <button
                onClick={handleRemoveFromGroupAction}
                disabled={deleteConfirmText !== 'APAGAR'}
                className="px-5 py-2 bg-red-950 hover:bg-red-900 text-red-100 border border-red-700 rounded-sm text-xs font-bold transition-all hover:scale-105 shadow-[0_0_20px_rgba(220,38,38,0.3)] flex items-center gap-2 disabled:opacity-40 disabled:hover:scale-100"
              >
                <Check className="w-4 h-4" />
                CONFIRMAR REMOÇÃO
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderAppealReplyModal = () => (
    <AnimatePresence>
      {appealReplyTarget && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setAppealReplyTarget(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-950 border border-amber-800 p-6 max-w-lg w-full rounded shadow-[0_0_50px_rgba(245,158,11,0.25)] relative text-mono max-h-[90vh] overflow-y-auto"
          >
            <button 
              onClick={() => setAppealReplyTarget(null)} 
              className="absolute top-4 right-4 text-zinc-500 hover:text-amber-400"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-amber-950/80 border border-amber-800 rounded-full text-amber-500">
                <Gavel className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-amber-400 tracking-wider">JULGAMENTO DE APELAÇÃO DE USUÁRIO</h2>
                <p className="text-[10px] text-zinc-400 font-mono">ANÁLISE DE RECURSO & ENVIO DE PROVAS CONCRETAS</p>
              </div>
            </div>

            <div className="bg-black/80 p-3.5 rounded border border-amber-900/60 text-xs text-zinc-300 mb-4 space-y-1.5 font-mono">
              <div><span className="text-amber-400 font-bold">Usuário:</span> @{appealReplyTarget.username} ({appealReplyTarget.name})</div>
              <div><span className="text-amber-400 font-bold">Data da Apelação:</span> {formatTimestamp(appealReplyTarget.timestamp)}</div>
              <div>
                <span className="text-amber-400 font-bold">Justificativa do Usuário:</span>
                <p className="text-zinc-200 italic mt-1 bg-zinc-900 p-2.5 rounded border border-zinc-800">
                  "{appealReplyTarget.reason}"
                </p>
              </div>
            </div>

            {/* Admin Reply Text */}
            <div className="mb-4">
              <label className="block text-amber-400 text-xs font-bold mb-1">
                RESPOSTA OFICIAL DO ADMINISTRADOR:
              </label>
              <textarea
                value={appealReplyText}
                onChange={(e) => setAppealReplyText(e.target.value)}
                maxLength={5000}
                placeholder="Escreva a resposta do julgamento ao usuário (até 5000 caracteres)..."
                className="w-full bg-black border border-amber-900/60 text-amber-100 p-3 h-24 resize-none focus:outline-none focus:border-amber-500 rounded text-xs font-mono"
              />
              <div className="flex justify-between items-center text-xs font-mono mt-1 bg-black/60 p-2 rounded border border-amber-900/40">
                <span className="text-amber-400 font-bold"></span>
                <span className="text-amber-300 font-extrabold bg-amber-950 px-2.5 py-0.5 rounded border border-amber-800">
                  
                </span>
              </div>
            </div>

            {/* Image Attachment for Concrete Proofs */}
            <div className="mb-6">
              <label className="block text-amber-400 text-xs font-bold mb-1">
                PROVA CONCRETA (FOTO / PRINT DE EVIDÊNCIA):
              </label>
              <input 
                type="file" 
                ref={appealImageInputRef} 
                onChange={handleAppealImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
              {appealReplyImage ? (
                <div className="relative bg-black p-2 border border-amber-800/80 rounded group">
                  <img src={appealReplyImage} alt="Prova concreta" className="max-h-40 mx-auto rounded object-contain" />
                  <button
                    onClick={() => setAppealReplyImage(null)}
                    className="absolute top-2 right-2 bg-red-900/90 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                    title="Remover foto de prova"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => appealImageInputRef.current?.click()}
                  className="w-full py-3 bg-black hover:bg-zinc-900 border border-dashed border-amber-800/80 rounded text-xs text-amber-400 font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <ImageIcon className="w-4 h-4 text-amber-500" />
                  ANEXAR FOTO DE PROVA CONCRETA
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => handleAppealResolution(appealReplyTarget, 'approved')}
                className="w-full py-2.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-700 font-bold text-xs transition-all rounded flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              >
                <Check className="w-4 h-4" />
                ACEITAR APELAÁÁO & DESBANIR USUÁRIO
              </button>

              <button
                onClick={() => handleAppealResolution(appealReplyTarget, 'reply_only')}
                disabled={!appealReplyText.trim() && !appealReplyImage}
                className="w-full py-2.5 bg-amber-950 hover:bg-amber-900 text-amber-200 border border-amber-700 font-bold text-xs transition-all disabled:opacity-50 rounded flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
              >
                <Send className="w-4 h-4" />
                ENVIAR RESPOSTA & PROVAS (MANTER BANIDO)
              </button>

              <button
                onClick={() => handleAppealResolution(appealReplyTarget, 'rejected')}
                className="w-full py-2.5 bg-red-950 hover:bg-red-900 text-red-200 border border-red-700 font-bold text-xs transition-all rounded flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
              >
                <Trash2 className="w-4 h-4" />
                REJEITAR APELAÇÃO & PURGAR CONTA AGORA
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderBanReasonModal = () => (
    <AnimatePresence>
      {!!banReasonTarget && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => { setBanReasonTarget(null); setBanReasonInput(''); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-950 border border-amber-900/80 p-6 max-w-lg w-full relative shadow-[0_0_50px_rgba(245,158,11,0.25)] rounded-md font-mono"
          >
            <button 
              onClick={() => { setBanReasonTarget(null); setBanReasonInput(''); }} 
              className="absolute top-4 right-4 text-zinc-500 hover:text-amber-400"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-amber-950/80 border border-amber-800 rounded-full text-amber-500">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-amber-400 tracking-wider">BANIR USUÁRIO DO SISTEMA</h2>
                <p className="text-[10px] text-amber-700 uppercase tracking-widest">Protocolo de Moderação</p>
              </div>
            </div>

            <p className="text-zinc-300 text-xs mb-4 leading-relaxed bg-black/60 p-3 rounded border border-amber-900/40">
              Você está prestes a aplicar um banimento à conta de <strong className="text-amber-300">@{banReasonTarget.username}</strong> ({banReasonTarget.name}). Especifique abaixo o motivo do banimento (até 5000 caracteres):
            </p>

            <textarea
              value={banReasonInput}
              onChange={(e) => setBanReasonInput(e.target.value)}
              maxLength={5000}
              placeholder="Digite detalhadamente o motivo do banimento (até 5000 caracteres)..."
              className="w-full bg-black border border-amber-900/60 text-amber-100 p-3 mb-2 h-36 resize-none focus:outline-none focus:border-amber-500 rounded text-xs font-mono"
            />
            <div className="flex justify-between items-center text-xs font-mono mb-4 bg-black/60 p-2 rounded border border-amber-900/40">
              <span className="text-amber-400 font-bold"></span>
              <span className="text-amber-300 font-extrabold bg-amber-950 px-2.5 py-0.5 rounded border border-amber-800">
                
              </span>
            </div>
            
            <div className="mb-4">
              <label className="block text-[10px] text-amber-500 font-bold mb-1 uppercase tracking-widest">
                Para confirmar o banimento, digite APAGAR abaixo:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Digite APAGAR..."
                className="w-full bg-black border border-amber-900/60 text-amber-100 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => { setBanReasonTarget(null); setBanReasonInput(''); }}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded text-xs font-bold transition-all"
              >
                CANCELAR
              </button>
              <button 
                onClick={confirmBanWithReason}
                disabled={!banReasonInput.trim() || deleteConfirmText !== 'APAGAR'}
                className="px-5 py-2 bg-amber-950 hover:bg-amber-900 text-amber-200 border border-amber-700 font-bold transition-all disabled:opacity-50 rounded text-xs shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                CONFIRMAR BANIMENTO
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderItemDeleteConfirmModal = () => (
    <AnimatePresence>
      {itemToDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 font-mono"
          onClick={() => setItemToDeleteConfirm(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-950 border border-red-900/80 p-6 max-w-lg w-full relative shadow-[0_0_50px_rgba(239,68,68,0.25)] rounded-md"
          >
            <button 
              onClick={() => setItemToDeleteConfirm(null)} 
              className="absolute top-4 right-4 text-zinc-500 hover:text-red-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-red-950/80 border border-red-800 rounded-full text-red-500">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-red-400 tracking-wider">
                  {itemToDeleteConfirm.title}
                </h2>
                <p className="text-[10px] text-red-700 uppercase tracking-widest">
                  CONFIRMAÁÁO EM 2 ETAPAS (AÁÁO IRREVERSÍVEL)
                </p>
              </div>
            </div>

            {/* Step 1 Box */}
            <div className="bg-black/80 p-3.5 rounded border border-red-900/50 mb-3 space-y-1 text-xs">
              <div className="flex items-center gap-2 text-red-400 font-bold mb-1">
                <span className="px-1.5 py-0.5 bg-red-950 border border-red-800 text-[10px] rounded">ETAPA 1</span>
                Identificação do Registro Solicitado
              </div>
              <p className="text-zinc-300 font-bold">{itemToDeleteConfirm.author}</p>
              <p className="text-zinc-400 italic text-[11px] bg-zinc-900/90 p-2 rounded border border-zinc-800 mt-1 break-words">
                "{itemToDeleteConfirm.snippet}"
              </p>
            </div>

            {/* Step 2 Box */}
            <div className="bg-red-950/30 p-3.5 rounded border border-red-800/80 mb-5 text-xs text-red-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-red-400">
                <span className="px-1.5 py-0.5 bg-red-900 border border-red-700 text-[10px] rounded text-white">ETAPA 2</span>
                Confirmação Definitiva
              </div>
              <p className="leading-relaxed text-[11px]">
                Tem certeza de que deseja apagar permanentemente este registro da base de dados do Firestore? Nenhuma apelação, denúncia ou sugestão excluída poderá ser recuperada posteriormente.
              </p>
            </div>

            {/* Confirmação Safeguard */}
            <div className="mb-6">
              <label className="block text-[10px] text-red-500 font-bold mb-1 uppercase tracking-widest">
                Para confirmar a exclusão, digite APAGAR abaixo:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Digite APAGAR..."
                className="w-full bg-black border border-red-900/60 text-red-100 px-3 py-2 text-xs rounded focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setItemToDeleteConfirm(null)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded text-xs font-bold transition-all"
              >
                CANCELAR E MANTER
              </button>
              <button
                onClick={executeDeleteItemTarget}
                disabled={deleteConfirmText !== 'APAGAR'}
                className="px-5 py-2 bg-red-950 hover:bg-red-900 text-red-200 border border-red-700 font-bold transition-all rounded text-xs shadow-[0_0_15px_rgba(239,68,68,0.3)] flex items-center gap-2 disabled:opacity-40"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                SIM, CONFIRMAR EXCLUSÃO
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderPushToast = () => (
    <AnimatePresence>
      {pushToast && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          className="fixed top-4 right-4 z-50 max-w-sm w-full bg-zinc-950 border border-emerald-800/80 p-3.5 rounded shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-start gap-3 cursor-pointer"
          onClick={() => setPushToast(null)}
        >
          <div className="p-2 bg-emerald-950 border border-emerald-700 rounded text-emerald-400 shrink-0">
            <Bell className="w-4 h-4 animate-bounce" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-emerald-400 font-bold text-xs truncate">@{pushToast.sender}</span>
              <span className="text-[10px] text-emerald-700 font-mono uppercase">AGORA</span>
            </div>
            <p className="text-zinc-300 text-xs truncate font-mono">{pushToast.text}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setPushToast(null); }}
            className="text-zinc-500 hover:text-emerald-400 shrink-0 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );

// --- VIEWS ---

  if (view === 'login' || view === 'register') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 font-mono">
        <div className="w-full max-w-md bg-black border border-emerald-900/50 p-8 shadow-2xl relative overflow-hidden rounded-sm">
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-20"></div>
          
          <div className="flex flex-col items-center mb-8 relative z-10">
            <div className="bg-emerald-950/30 p-4 rounded-full border border-emerald-800/50 mb-4">
              <Globe className="w-10 h-10 text-emerald-500" />
            </div>
            <h1 className="text-3xl font-black text-emerald-400 tracking-widest text-center">My social</h1>
            <p className="text-emerald-700 text-xs mt-2 text-center tracking-widest">
              Sua Sociedade Digital.
            </p>
          </div>

          {view === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4 relative z-10">
              <div>
                <label className="block text-emerald-700 text-xs mb-1 font-bold">USUÁRIO</label>
                <div className="relative">
                  <User className="w-4 h-4 text-emerald-700 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-emerald-900/50 text-emerald-300 pl-10 pr-4 py-2 focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="dev_ninja"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-emerald-700 text-xs mb-1 font-bold">SENHA SEGURA</label>
                <div className="relative">
                  <Code className="w-4 h-4 text-emerald-700 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    maxLength={6}
                    className="w-full bg-zinc-900/50 border border-emerald-900/50 text-emerald-300 pl-10 pr-10 py-2 focus:outline-none focus:border-emerald-500 transition-colors tracking-widest"
                    placeholder="******"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-700 hover:text-emerald-400 focus:outline-none"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" className="w-full bg-emerald-900/40 hover:bg-emerald-800 text-emerald-300 border border-emerald-700 py-3 font-bold tracking-widest transition-colors mt-6 flex items-center justify-center gap-2">
                <Power className="w-4 h-4" />
                CONECTAR
              </button>

              <div className="text-center mt-6 flex flex-col gap-2">
                <button type="button" onClick={() => { setView('register'); setShowPolicy(true); }} className="text-emerald-600 hover:text-emerald-400 text-sm transition-colors">
                  Solicitar novo acesso (Registro)
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4 relative z-10">
              <div>
                <label className="block text-emerald-700 text-xs mb-1 font-bold">NOME REAL</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-emerald-900/50 text-emerald-300 px-4 py-2 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-emerald-700 text-xs mb-1 font-bold">USUÁRIO DE REDE (ÁNICO)</label>
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-emerald-900/50 text-emerald-300 px-4 py-2 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-emerald-400 text-xs mb-1 font-bold uppercase tracking-wider">
                  CARGO / FUNÇÃO (OPCIONAL)
                </label>
                <p className="text-[11px] text-zinc-400 mb-2 font-mono">
                  Digite seu cargo, função ou área de atuação (opcional):
                </p>
                <input
                  type="text"
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  placeholder="Ex: Engenheiro, Designer, QA, Analista... (Opcional)"
                  className="w-full bg-zinc-900/50 border border-emerald-900/50 text-emerald-300 px-4 py-2 text-xs focus:outline-none focus:border-emerald-500 transition-colors rounded-sm"
                />
              </div>

              <div>
                <label className="block text-emerald-700 text-xs mb-1 font-bold">SENHA DE ACESSO (MÁX 6 DÍGITOS)</label>
                <div className="relative">
                  <input
                    type={showRegPassword ? "text" : "password"}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    maxLength={6}
                    className="w-full bg-zinc-900/50 border border-emerald-900/50 text-emerald-300 pl-4 pr-10 py-2 focus:outline-none focus:border-emerald-500 transition-colors tracking-widest"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-700 hover:text-emerald-400 focus:outline-none"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" className="w-full bg-emerald-900/40 hover:bg-emerald-800 text-emerald-300 border border-emerald-700 py-3 font-bold tracking-widest transition-colors mt-6 flex items-center justify-center gap-2">
                <UserPlus className="w-4 h-4" />
                CRIAR CREDENCIAL
              </button>

              <div className="text-center mt-6">
                <button type="button" onClick={() => setView('login')} className="text-emerald-600 hover:text-emerald-400 text-sm transition-colors flex items-center justify-center gap-2 w-full">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar ao Login
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 pt-4 border-t border-emerald-900/30 text-center relative z-10">
            <button onClick={() => setShowPolicy(true)} className="text-emerald-800 hover:text-emerald-500 text-[10px] uppercase tracking-wider underline">
              Ler Políticas de Privacidade & Regras
            </button>
          </div>
        </div>

        {showPolicy && renderPrivacyPolicy()}
      </div>
    );
  }

  // --- ADMIN DASHBOARD ---
  if (view === 'admin' && isAdmin) {
    const filteredReports = reports.filter(r => r.assignedAdmin === currentUser?.username);
    const filteredSuggestions = suggestions.filter(s => s.assignedAdmin === currentUser?.username);
    const filteredAppeals = appeals.filter(a => a.assignedAdmin === currentUser?.username);

    return (
      <div className="min-h-[100dvh] bg-black text-emerald-400 font-mono flex flex-col items-center sm:p-4">
        <div className="w-full max-w-6xl h-[95vh] flex flex-col border border-emerald-900/50 bg-zinc-950 rounded-sm relative shadow-2xl">
          <header className="bg-zinc-900 border-b border-emerald-900/50 p-4 flex justify-between items-center shrink-0 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-fuchsia-500" />
              <div>
                <h1 className="font-bold tracking-wider text-emerald-300 text-sm sm:text-base">
                  {isGeneralAdmin ? 'PAINEL DE ADMINISTRAÇÃO GERAL' : 'CENTRAL DE MODERAÇÃO & ATENDIMENTO'}
                </h1>
                <div className="mt-1">
                  {renderRoleBadge(currentUser?.role, currentUser?.username)}
                </div>
              </div>
            </div>
            <button onClick={() => setView('chat')} className="flex items-center gap-2 text-emerald-400 hover:text-emerald-200 transition-colors text-xs font-bold bg-black px-4 py-2 border border-emerald-900/50 rounded-sm">
              <ArrowLeft className="w-4 h-4" />
              VOLTAR AO MY SOCIAL
            </button>
          </header>

          {/* Random Case Assignment Info Bar */}
          <div className="bg-zinc-900/80 border-b border-emerald-900/50 p-3 px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-black border border-emerald-900/80 rounded p-0.5 px-3 py-1">
                <span className="text-xs font-bold text-fuchsia-300 flex items-center gap-2">
                  <Target className="w-3.5 h-3.5" />
                  MEUS CASOS
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 italic ml-2 hidden sm:inline">
                *Tarefas atribuídas via sorteio automático.
              </span>
            </div>
            {!isGeneralAdmin && (
              <div className="text-[11px] text-amber-300/90 bg-amber-950/40 border border-amber-800/50 px-3 py-1 rounded">
                <strong>Perfil Administrador:</strong> Responsável por Denúncias, Sugestões e Banimentos.
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Reports Section */}
            <div className={`bg-black border border-emerald-900/30 rounded-sm p-4 flex flex-col ${!isGeneralAdmin ? 'md:col-span-2' : ''}`}>
              <h2 className="text-lg font-bold text-red-400 border-b border-red-900/30 pb-2 mb-4 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  DENÚNCIAS ({filteredReports.length})
                </span>
              </h2>
              <div className="space-y-4 overflow-y-auto pr-2 scrollbar-thin">
                {filteredReports.length === 0 ? (
                  <p className="text-zinc-600 text-sm italic">Nenhuma denúncia nesta visualização.</p>
                ) : (
                  filteredReports.map(rep => (
                    <div key={rep.id} className="bg-zinc-900/80 border border-red-900/30 p-3 rounded-sm flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex justify-between items-start mb-2 gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-sm ${
                              rep.type === 'profanity'
                                ? 'bg-red-950/80 border border-red-800 text-red-400'
                                : rep.type === 'auto_moderation'
                                ? 'bg-fuchsia-950/80 border border-fuchsia-800 text-fuchsia-300'
                                : 'bg-orange-950/80 border border-orange-800 text-orange-400'
                            }`}>
                              {rep.type === 'profanity' ? 'SISTEMA' : rep.type === 'auto_moderation' ? 'SISTEMA' : 'DENÚNCIA'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {formatTimestamp(rep.timestamp) && (
                              <span className="text-[10px] text-zinc-500 font-mono">
                                {formatTimestamp(rep.timestamp)}
                              </span>
                            )}
                            <button
                              onClick={() => handleDeleteReport(rep)}
                              className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-950/50 border border-transparent hover:border-red-900/50 rounded transition-colors"
                              title="Excluir denúncia da lista"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-zinc-300 text-sm mb-1">
                          Alvo: <span className="text-white font-bold">@{rep.reportedUser}</span>
                        </p>
                        <p className="text-zinc-500 text-xs mb-2">Reportado por: @{rep.reportedBy}</p>
                        <div className="bg-black p-2.5 text-red-200 text-xs italic border-l-2 border-red-900/50 mb-2 rounded-sm break-words">
                          "{rep.reason}"
                        </div>

                        {/* Media Attachment Preview if captured by auto-moderation */}
                        {rep.attachmentUrl && (
                          <div className="mb-2 bg-black p-2 border border-emerald-900/50 rounded">
                            <span className="text-[10px] text-emerald-400 font-bold block mb-1">Anexo / Mídia Capturada:</span>
                            <img src={rep.attachmentUrl} alt="Mídia da Moderação" className="max-h-36 rounded border border-emerald-800 object-contain mx-auto bg-zinc-950" />
                          </div>
                        )}

                        {rep.adminReply && (
                          <div className="bg-fuchsia-950/40 p-2 text-fuchsia-200 text-xs border border-fuchsia-800/60 rounded mb-2">
                            <span className="font-bold text-fuchsia-400">Resposta enviada pelo Admin:</span> {rep.adminReply}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setAdminReplyTarget({ id: rep.id, type: 'report', user: rep.reportedBy, text: rep.reason })}
                        className="mt-2 w-full py-1.5 bg-fuchsia-950/80 hover:bg-fuchsia-900 text-fuchsia-300 border border-fuchsia-800 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        RESPONDER AUTOR DA DENÚNCIA
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Suggestions Section */}
            {isGeneralAdmin && (
              <div className="bg-black border border-emerald-900/30 rounded-sm p-4 flex flex-col">
                <h2 className="text-lg font-bold text-blue-400 border-b border-blue-900/30 pb-2 mb-4 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-blue-400" />
                    SUGESTÕES DA COMUNIDADE ({filteredSuggestions.length})
                  </span>
                </h2>
                <div className="space-y-4 overflow-y-auto pr-2 scrollbar-thin">
                  {filteredSuggestions.length === 0 ? (
                    <p className="text-zinc-600 text-sm italic">Nenhuma sugestão nesta visualização.</p>
                  ) : (
                    filteredSuggestions.map(sug => (
                      <div key={sug.id} className="bg-zinc-900/80 border border-blue-900/20 p-3 rounded-sm flex flex-col justify-between space-y-2">
                        <div>
                          <div className="flex justify-between items-start mb-2 gap-2 flex-wrap">
                            <div>
                              <p className="text-blue-300 text-sm font-bold">
                                Enviado por: @{sug.sender}
                              </p>
                              <span className="text-[10px] bg-indigo-950/80 text-indigo-300 border border-indigo-800/80 px-2 py-0.5 rounded font-mono font-bold">
                                🎯 Sorteado: @{sug.assignedAdmin || 'Geral'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {formatTimestamp(sug.timestamp) && (
                                <span className="text-[10px] text-zinc-500 font-mono">
                                  {formatTimestamp(sug.timestamp)}
                                </span>
                              )}
                              <button
                                onClick={() => handleDeleteSuggestion(sug)}
                                className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-950/50 border border-transparent hover:border-red-900/50 rounded transition-colors"
                                title="Excluir sugestão da lista"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="bg-black p-3 text-blue-100 text-sm border-l-2 border-blue-900/50 rounded-sm mb-2 break-words">
                            {sug.text}
                          </div>
                          {sug.adminReply && (
                            <div className="bg-fuchsia-950/40 p-2 text-fuchsia-200 text-xs border border-fuchsia-800/60 rounded mb-2">
                              <span className="font-bold text-fuchsia-400">Resposta enviada pelo Admin:</span> {sug.adminReply}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => setAdminReplyTarget({ id: sug.id, type: 'suggestion', user: sug.sender, text: sug.text })}
                          className="mt-2 w-full py-1.5 bg-fuchsia-950/80 hover:bg-fuchsia-900 text-fuchsia-300 border border-fuchsia-800 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          RESPONDER SUGESTÃO
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Ban Appeals Section */}
            <div className="bg-black border border-amber-900/40 rounded-sm p-4 flex flex-col md:col-span-2">
              <div className="flex justify-between items-center border-b border-amber-900/30 pb-2 mb-4 flex-wrap gap-2">
                <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-amber-500" />
                  APELAÇÕES DE BANIMENTO ({filteredAppeals.filter(a => a.status === 'pending').length})
                </h2>
              </div>
              <div className="space-y-4 overflow-y-auto pr-2 scrollbar-thin">
                {filteredAppeals.length === 0 ? (
                  <p className="text-zinc-600 text-sm italic">Nenhuma apelação nesta visualização.</p>
                ) : (
                  filteredAppeals.map(app => (
                    <div key={app.id} className="bg-zinc-900/80 border border-amber-900/30 p-3 rounded-sm flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex justify-between items-start mb-2 gap-2 flex-wrap">
                          <div>
                            <p className="text-amber-300 text-sm font-bold">
                              @{app.username} ({app.name})
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-zinc-500 font-mono">
                                Enviado: {formatTimestamp(app.timestamp)}
                              </span>
                              <span className="text-[10px] bg-indigo-950/80 text-indigo-300 border border-indigo-800/80 px-2 py-0.5 rounded font-mono font-bold">
                                🎯 Sorteado: @{app.assignedAdmin || 'Geral'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                              app.status === 'approved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                              app.status === 'rejected' ? 'bg-red-950 text-red-400 border border-red-800' :
                              'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                            }`}>
                              {app.status === 'pending' ? 'ANÁLISE' : app.status}
                            </span>
                            <button
                              onClick={() => handleDeleteAppeal(app)}
                              className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-950/50 border border-transparent hover:border-red-900/50 rounded transition-colors"
                              title="Remover apelação"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="bg-black p-2.5 text-amber-100 text-xs border-l-2 border-amber-700/80 rounded-sm mb-2 italic break-words">
                          "{app.reason}"
                        </div>
                        {app.adminReplyText && (
                          <div className="bg-fuchsia-950/40 p-2 text-fuchsia-200 text-xs border border-fuchsia-800/60 rounded mb-1">
                            <span className="font-bold text-fuchsia-400">Sua Resposta:</span> {app.adminReplyText}
                          </div>
                        )}
                        {app.adminReplyImage && (
                          <div className="mb-2">
                            <span className="text-[10px] text-fuchsia-400 font-bold block mb-1">Prova Anexada:</span>
                            <img src={app.adminReplyImage} alt="Prova do Admin" className="max-h-24 rounded border border-fuchsia-800 object-contain bg-black mx-auto" />
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setAppealReplyTarget(app);
                          setAppealReplyText(app.adminReplyText || '');
                          setAppealReplyImage(app.adminReplyImage || null);
                        }}
                        className="w-full py-1.5 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Gavel className="w-3.5 h-3.5" />
                        JULGAR / ENVIAR PROVAS CONCRETAS
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        {renderReportModal()}
        {renderSuggestionModal()}
        {showPolicy && renderPrivacyPolicy()}
        {renderDeleteModal()}
        {renderConfirmPurgeModal()}
        {renderAlertModal()}
        {renderGroupModals()}
        {renderMembersModal()}
        {renderAdminReplyModal()}
        {renderDeleteUserConfirmModal()}
        {renderMicPermissionModal()}
        {renderPushToast()}
        {renderAppealModal()}
        {renderAppealReplyModal()}
        {renderBanReasonModal()}
        {renderRemoveFromGroupModal()}
        {renderItemDeleteConfirmModal()}
        {renderGroupTopicsModal()}
      </div>
    );
  }// --- CHAT VIEW ---
  return (
    <div className="h-[100dvh] bg-black text-emerald-400 font-mono flex flex-col items-center sm:p-4 overflow-hidden">
      <div className="w-full max-w-5xl h-full sm:h-[95vh] flex flex-col sm:border border-emerald-900/50 bg-zinc-950 sm:rounded-sm relative overflow-hidden sm:shadow-2xl">
        
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-30 z-10"></div>

        {/* Groups Drawer */}
        <AnimatePresence>
          {showGroupsMenu && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 bottom-0 w-[280px] bg-black border-r border-emerald-900/50 z-50 flex flex-col shadow-2xl"
            >
              <div className="p-4 border-b border-emerald-900/50 flex justify-between items-center bg-zinc-950">
                <h2 className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Comunidades
                </h2>
                <button onClick={() => setShowGroupsMenu(false)} className="text-emerald-600 hover:text-emerald-300">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-emerald-900">
                <button 
                  onClick={() => { setCurrentGroupId(null); setShowGroupsMenu(false); }}
                  className={`w-full text-left p-3 rounded-sm border flex items-center gap-3 transition-colors ${!currentGroupId ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300' : 'bg-black border-emerald-900/30 text-emerald-600 hover:bg-emerald-950/30'}`}
                >
                  <Globe className="w-5 h-5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate">Chat Global</div>
                    <div className="text-[10px] uppercase opacity-70">Canal Principal</div>
                  </div>
                </button>
                
                <div className="pt-3 pb-1 text-[10px] uppercase tracking-widest text-emerald-500 font-bold flex justify-between items-center border-t border-emerald-900/30 mt-2">
                  <span>Meus Grupos ({groups.filter(g => g.members.includes(currentUser?.username || '')).length})</span>
                  <button onClick={() => { setShowGroupsMenu(false); setShowCreateGroupModal(true); }} className="bg-emerald-900/80 border border-emerald-700 px-2 py-0.5 rounded-sm text-emerald-200 hover:bg-emerald-800 text-[10px] font-bold flex items-center gap-1 transition-colors" title="Criar Grupo">
                    <Plus className="w-3 h-3" />
                    <span>Novo Grupo</span>
                  </button>
                </div>

                {groups.filter(g => g.members.includes(currentUser?.username || '')).map(group => (
                  <button 
                    key={group.id}
                    onClick={() => { setCurrentGroupId(group.id); setCurrentTopic('Geral'); setShowGroupsMenu(false); }}
                    className={`w-full text-left p-3 rounded-sm border flex items-center gap-3 transition-colors ${currentGroupId === group.id ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300' : 'bg-black border-emerald-900/30 text-emerald-600 hover:bg-emerald-950/30'}`}
                  >
                    <Users className="w-5 h-5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate flex items-center gap-1">
                        {group.name}
                      </div>
                      <div className="text-[10px] opacity-70 truncate">{group.members.length} membros</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-3 border-t border-emerald-900/50 bg-zinc-950">
                <button 
                  onClick={() => { setShowGroupsMenu(false); setShowJoinGroupModal(true); }}
                  className="w-full bg-emerald-950 border border-emerald-800 text-emerald-400 p-2 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-900 transition-colors"
                >
                  <LinkIcon className="w-4 h-4" /> Entrar com Link
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unified & Organized Top Header */}
        <header className="bg-zinc-950 border-b border-emerald-900/60 px-2 sm:px-3 py-1.5 sm:py-2.5 flex items-center justify-between shrink-0 relative z-30 gap-1.5 sm:gap-2 font-mono">
          {/* Left Navigation & Active Location */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <button
              onClick={() => setShowGroupsMenu(true)}
              className="p-1.5 sm:px-2.5 bg-emerald-950/60 border border-emerald-800/80 rounded-sm hover:bg-emerald-900/60 transition-colors text-emerald-300 flex items-center gap-1.5 text-xs font-bold shrink-0"
              title="Menu de Comunidades"
            >
              <Menu className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Grupos</span>
            </button>

            <div className="h-5 w-px bg-emerald-900/80 hidden sm:block shrink-0"></div>

            {/* Organized Group / Location Banner Display */}
            {!currentGroupId ? (
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 bg-emerald-950/40 border border-emerald-900/60 px-2 py-1 rounded-sm">
                <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="font-extrabold text-[10px] sm:text-xs text-white tracking-wider uppercase truncate">CHAT GLOBAL</span>
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-emerald-500 font-mono hidden xs:inline truncate">Canal Principal</span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowGroupTopicsModal(true)}
                className="flex items-center gap-1.5 sm:gap-2 min-w-0 bg-emerald-950/60 hover:bg-emerald-900/40 border border-emerald-800/80 px-2 py-1 rounded-sm cursor-pointer transition-colors text-left"
                title="Clique para ver os tópicos e gerenciar"
              >
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-[9px] sm:text-[10px] text-emerald-500 uppercase font-bold hidden md:inline shrink-0">GRUPO:</span>
                    <span className="font-extrabold text-[10px] sm:text-xs text-emerald-200 tracking-wider truncate">
                      {groups.find(g => g.id === currentGroupId)?.name}
                    </span>
                    <Hash className="w-3 h-3 text-emerald-400 shrink-0 ml-1 animate-pulse" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-emerald-400 font-mono truncate">
                    #{currentTopic || 'Geral'}
                  </span>
                </div>
              </button>
            )}
          </div>

          {/* Right Controls & Administrative 3-Dots Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Search */}
            <div className="flex items-center relative">
              <AnimatePresence>
                {isSearching && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 'auto', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="overflow-hidden flex items-center bg-black border border-emerald-500/80 rounded-full px-2.5 py-1"
                  >
                    <Search className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mr-1.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar..."
                      className="bg-transparent border-none outline-none text-emerald-200 text-xs w-24 sm:w-40 placeholder-emerald-800"
                      autoFocus
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="text-emerald-600 hover:text-emerald-300 p-0.5 ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                onClick={() => {
                  setIsSearching(!isSearching);
                  if (isSearching) setSearchQuery('');
                }}
                className={`p-2 rounded-sm border transition-colors ${isSearching ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : 'text-emerald-400 bg-zinc-900 border-emerald-900/60 hover:bg-emerald-950/40'}`}
                title="Buscar mensagens"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Members Button */}
            <button
              onClick={() => setShowMembersModal(true)}
              className="px-2 py-1.5 text-emerald-300 bg-emerald-950/40 border border-emerald-800/80 rounded-sm hover:bg-emerald-900/50 transition-colors flex items-center gap-1 text-xs font-bold"
              title={currentGroupId ? "Ver Membros do Grupo" : "Ver Membros da Comunidade"}
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">
                Membros ({currentGroupId ? (groups.find(g => g.id === currentGroupId)?.members?.length || 0) : allMembers.length})
              </span>
            </button>

            {/* Push Notification Toggle */}
            <button
              onClick={requestPushPermission}
              className={`p-1.5 sm:px-2 sm:py-1 rounded-sm border transition-colors flex items-center gap-1 text-xs font-bold ${
                pushPermission === 'granted'
                  ? 'text-emerald-300 bg-emerald-950/50 border-emerald-700'
                  : 'text-amber-400 bg-amber-950/40 border-amber-800'
              }`}
              title={pushPermission === 'granted' ? 'Notificações de Push Ativadas' : 'Ativar Notificações Push'}
            >
              {pushPermission === 'granted' ? <Bell className="w-3.5 h-3.5 text-emerald-400" /> : <BellOff className="w-3.5 h-3.5 text-amber-400" />}
              <span className="hidden md:inline">{pushPermission === 'granted' ? 'Push ON' : 'Push OFF'}</span>
            </button>

            {/* User Profile Pill */}
            <button
              onClick={() => {
                setEditRoleValue(currentUser?.role || '');
                setShowEditRoleModal(true);
              }}
              className="hidden md:flex items-center gap-1.5 bg-black px-2.5 py-1 rounded-sm border border-emerald-900/60 text-xs hover:border-emerald-700 transition-colors cursor-pointer text-left"
              title="Clique para alterar seu cargo / função (opcional)"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
              <span className="text-emerald-100 font-bold truncate max-w-[100px]">{currentUser?.name}</span>
              <span className="text-emerald-400 font-mono border-l border-emerald-900/50 pl-1.5 text-[10px] truncate max-w-[120px]">
                {currentUser?.role || 'Membro'}
              </span>
            </button>

            {/* 3-DOTS ADMINISTRATIVE & MANAGEMENT MENU BUTTON */}
            <div className="relative">
              <button
                onClick={() => setShowHeaderAdminMenu(!showHeaderAdminMenu)}
                className={`p-1.5 sm:px-2 sm:py-1 rounded-sm border transition-all flex items-center gap-1 text-xs font-bold ${
                  showHeaderAdminMenu
                    ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                    : 'bg-zinc-900 hover:bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
                }`}
                title="Menu de Funções Administrativas"
              >
                <MoreVertical className="w-4 h-4" />
                <span className="hidden xs:inline text-[11px]">AÇÕES</span>
              </button>

              {/* 3-DOTS POPUP DROPDOWN MENU */}
              <AnimatePresence>
                {showHeaderAdminMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-zinc-950 border border-emerald-800 rounded-md shadow-[0_0_30px_rgba(0,0,0,0.9)] z-50 p-1.5 font-mono text-xs space-y-1"
                  >
                    <div className="px-2 py-1.5 text-[10px] font-bold text-emerald-500 border-b border-emerald-900/60 uppercase tracking-wider flex items-center justify-between">
                      <span>PAINEL DE GERENCIAMENTO</span>
                      <Shield className="w-3 h-3 text-emerald-400" />
                    </div>

                    {/* Group Invite option */}
                    {currentGroupId && (
                      <button
                        onClick={() => {
                          setShowHeaderAdminMenu(false);
                          const currentGrp = groups.find(g => g.id === currentGroupId);
                          if (currentGrp) copyOrShareGroupLink(currentGrp);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded hover:bg-emerald-900/40 text-emerald-200 transition-colors flex items-center gap-2 font-bold"
                      >
                        <LinkIcon className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Convidar para o Grupo</span>
                      </button>
                    )}

                    {/* Group Settings option (Group Owners) */}
                    {currentGroupId && groups.find(g => g.id === currentGroupId)?.owners.includes(currentUser?.username || '') && (
                      <button
                        onClick={() => {
                          setShowHeaderAdminMenu(false);
                          setGroupSettingsTarget(groups.find(g => g.id === currentGroupId) || null);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded hover:bg-emerald-900/40 text-emerald-300 transition-colors flex items-center gap-2 font-bold"
                      >
                        <Users className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Gerenciar Grupo Atual</span>
                      </button>
                    )}

                    {/* System Admin Panel option */}
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setShowHeaderAdminMenu(false);
                          setView('admin');
                        }}
                        className="w-full text-left px-2.5 py-2 rounded hover:bg-fuchsia-950/60 text-fuchsia-300 transition-colors flex items-center gap-2 font-bold"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-fuchsia-400" />
                        <span>Painel de Administração Geral</span>
                      </button>
                    )}

                    {/* Appeal & Suggestions Modal option */}
                    <button
                      onClick={() => {
                        setShowHeaderAdminMenu(false);
                        setShowSuggestionModal(true);
                      }}
                      className="w-full text-left px-2.5 py-2 rounded hover:bg-blue-950/40 text-blue-300 transition-colors flex items-center gap-2 font-bold"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-blue-400" />
                      <span>Enviar Sugestão / Ideia</span>
                    </button>

                    {!isAdmin && currentUser?.isBanned && (
                      <button
                        onClick={() => {
                          setShowHeaderAdminMenu(false);
                          setShowAppealModal(true);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded hover:bg-amber-950/40 text-amber-300 transition-colors flex items-center gap-2 font-bold"
                      >
                        <Flag className="w-3.5 h-3.5 text-amber-400" />
                        <span>Enviar Apelação ao Suporte</span>
                      </button>
                    )}

                    {/* Leave Group option */}
                    {currentGroupId && (
                      <button
                        onClick={() => {
                          setShowHeaderAdminMenu(false);
                          if (confirm('Tem certeza que deseja sair deste grupo?')) {
                          const currentGrp = groups.find(g => g.id === currentGroupId);
                          if (currentGrp) {
                            const newMembers = currentGrp.members.filter(m => m !== currentUser?.username);
                            const newOwners = currentGrp.owners.filter(o => o !== currentUser?.username);
                            updateDoc(doc(db, 'groups', currentGrp.id), { members: newMembers, owners: newOwners });
                            setCurrentGroupId(null);
                            showAlert('Você saiu do grupo.', 'SAÍDA DE GRUPO', 'info');
                          }
                        }
                        }}
                        className="w-full text-left px-2.5 py-2 rounded hover:bg-amber-950/60 text-amber-400 transition-colors flex items-center gap-2 font-bold border-t border-emerald-900/40 mt-1"
                      >
                        <LogOut className="w-3.5 h-3.5 text-amber-400" />
                        <span>Sair do Grupo</span>
                      </button>
                    )}

                    {/* PWA Installation Option */}
                    <button
                      onClick={() => {
                        setShowHeaderAdminMenu(false);
                        if (deferredPrompt) {
                          handleInstallPWA();
                        } else {
                          showAlert('No iOS/Safari: Toque no botão "Compartilhar" (ícone de quadrado com seta para cima) e escolha "Adicionar à Tela de Início". No Android/Chrome: Toque no menu do navegador e escolha "Instalar aplicativo" ou "Instalar app".', 'TRANSFORMAR EM APP', 'info');
                        }
                      }}
                      className="w-full text-left px-2.5 py-2 rounded hover:bg-emerald-950/60 text-emerald-400 transition-colors flex items-center justify-between font-bold border-t border-emerald-900/40 mt-1"
                    >
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        <span>Instalar App My social</span>
                      </div>
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    </button>

                    {/* Logout option */}
                    <button
                      onClick={() => {
                        setShowHeaderAdminMenu(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-2.5 py-2 rounded hover:bg-red-950/60 text-red-400 transition-colors flex items-center gap-2 font-bold border-t border-zinc-800"
                    >
                      <Power className="w-3.5 h-3.5 text-red-400" />
                      <span>Desconectar / Sair</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Pinned Messages Banner */}
        {filteredMessages.filter(m => m.isPinned && !m.isDeleted).length > 0 && (
          <div className="bg-emerald-950/40 border-b border-emerald-900/50 p-2 sm:p-3 shrink-0 flex flex-col gap-2 z-20 relative shadow-md">
            <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">
              <Pin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Mensagens Fixadas ({filteredMessages.filter(m => m.isPinned && !m.isDeleted).length})
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-emerald-900">
              {filteredMessages.filter(m => m.isPinned && !m.isDeleted).map(msg => (
                <div key={`pin-${msg.id}`} className="bg-black/60 border border-emerald-900/40 p-2 rounded-sm min-w-[200px] max-w-[300px] flex-shrink-0 flex flex-col gap-1.5 cursor-pointer hover:bg-emerald-950/20 transition-colors" onClick={() => {
                  const el = document.getElementById(`msg-${msg.id}`); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.add('bg-emerald-900/40'); setTimeout(() => el.classList.remove('bg-emerald-900/40'), 2000); }
                }}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-emerald-500 font-bold text-xs truncate">@{msg.sender}</span>
                    {isAdmin && (
                      <button onClick={(e) => { e.stopPropagation(); handleTogglePinMessage(msg.id, true); }} className="text-zinc-500 hover:text-red-400 p-0.5">
                        <PinOff className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <span className="text-emerald-100 text-xs line-clamp-2 leading-relaxed">
                    {msg.text || (msg.attachment ? '[Anexo]' : '')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-20 scrollbar-thin scrollbar-thumb-emerald-900 scrollbar-track-transparent">
          {filteredMessages.filter(m => m.type !== 'system').map((msg) => (
            <div id={`msg-${msg.id}`} key={msg.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300 group transition-colors rounded-sm">
              {msg.type === 'system' && (
                <div className="flex items-center justify-center gap-2 opacity-60 my-2">
                  <Server className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700 text-xs uppercase tracking-widest text-center">
                    {msg.text}
                  </span>
                </div>
              )}

              {msg.type === 'user' && (
                msg.isDeleted ? (
                  <div className="bg-red-950/30 border border-red-800/80 p-3 rounded-sm flex flex-col gap-1.5 text-red-200 my-2 max-w-[88%] sm:max-w-[80%]">
                    <div className="flex items-center gap-2 text-red-400 text-[10px] font-bold uppercase tracking-wider">
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      MENSAGEM APAGADA PELO USUÁRIO (Visível Apenas para Administrador)
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-emerald-400 text-xs font-bold">@{msg.sender}</span>
                      <span className="text-zinc-500 text-[10px] font-mono">{formatTimestamp(msg.timestamp || msg.deletedAt)}</span>
                    </div>
                    {msg.text && (
                      <p className="text-zinc-300 text-sm italic border-l-2 border-red-800 pl-2">
                        "{msg.text}"
                      </p>
                    )}
                    {msg.attachment && (
                      <div className="text-xs text-red-300 font-mono bg-black/60 p-2 rounded border border-red-900/40">
                        Anexo: {msg.attachment.name} ({msg.attachment.fileType})
                        {msg.attachment.url && (
                          msg.attachment.fileType === 'image' ? (
                            <button
                              type="button"
                              onClick={() => {
                                setLightboxImageUrl(msg.attachment.url);
                                setLightboxImageName(msg.attachment.name);
                              }}
                              className="block text-emerald-400 hover:underline text-left mt-1 cursor-zoom-in font-bold focus:outline-none"
                            >
                              Visualizar imagem
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => triggerSafeDownload(msg.attachment.url, msg.attachment.name)}
                              className="block text-emerald-400 hover:underline text-left mt-1 font-bold focus:outline-none"
                            >
                              Baixar anexo
                            </button>
                          )
                        )}
                      </div>
                    )}
                    <div className="flex justify-end gap-2 mt-1">
                      <button
                        onClick={() => setConfirmPurgeId(msg.id)}
                        className="px-2 py-1 bg-red-950 hover:bg-red-900 border border-red-700 text-red-300 text-[10px] font-bold rounded flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        PURGAR DO BANCO
                      </button>
                    </div>
                  </div>
                ) : (
                <div className={`flex flex-col border p-3 rounded-sm w-fit max-w-[88%] sm:max-w-[80%] relative group mt-2 ${msg.sender === currentUser?.username ? 'bg-emerald-900/20 border-emerald-800/50 self-end ml-auto' : 'bg-black/40 border-emerald-900/20'}`}>
                  
                  {/* Delete Button - Apenas o proprietário da mensagem ou administrador pode apagar */}
                  {/* 3-Dots Message Context Menu Button */}
                  <div className="absolute -top-2.5 right-2 z-10">
                    <button
                      onClick={() => setOpenMessageMenuId(openMessageMenuId === msg.id ? null : msg.id)}
                      className="bg-zinc-900/90 hover:bg-emerald-950 border border-emerald-800/80 text-emerald-400 p-1 rounded-full shadow-lg transition-colors opacity-90 hover:opacity-100"
                      title="Opções da Mensagem"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {/* Popover Dropdown Menu */}
                    {openMessageMenuId === msg.id && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-zinc-950 border border-emerald-800 rounded shadow-2xl p-1 z-50 space-y-1 font-mono text-xs">
                        {/* Edit Message option */}
                        {msg.sender === currentUser?.username && !msg.viewOnce && (
                          <button
                            onClick={() => {
                              setOpenMessageMenuId(null);
                              const editCount = msg.editCount || 0;
                              if (editCount >= 2) {
                                showAlert('Esta mensagem já foi editada 2 vezes (limite máximo atingido).', 'LIMITE DE EDIÇÃO', 'warning');
                                return;
                              }
                              setEditingMessageId(msg.id);
                              setInputValue(msg.text || '');
                              if (textareaRef.current) {
                                textareaRef.current.focus();
                              }
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded hover:bg-emerald-950/60 text-emerald-300 flex items-center gap-2 font-bold"
                          >
                            <Code className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Editar Mensagem</span>
                          </button>
                        )}

                        {/* Toggle Pin option (Admin Only) */}
                        {isAdmin && (
                          <button
                            onClick={() => {
                              setOpenMessageMenuId(null);
                              handleTogglePinMessage(msg.id, !!msg.isPinned);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded hover:bg-emerald-950/60 text-emerald-300 flex items-center gap-2 font-bold"
                          >
                            {msg.isPinned ? <PinOff className="w-3.5 h-3.5 text-amber-400" /> : <Pin className="w-3.5 h-3.5 text-emerald-400" />}
                            <span>{msg.isPinned ? 'Desafixar Mensagem' : 'Fixar Mensagem'}</span>
                          </button>
                        )}

                        {/* Report option */}
                        {msg.sender !== currentUser?.username && (
                          <button
                            onClick={() => {
                              setOpenMessageMenuId(null);
                              setReportTarget(msg.sender);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded hover:bg-amber-950/60 text-amber-300 flex items-center gap-2 font-bold"
                          >
                            <Flag className="w-3.5 h-3.5 text-amber-400" />
                            <span>Denunciar Usuário</span>
                          </button>
                        )}

                        {/* Delete option */}
                        {(() => {
                          const msgTime = msg.timestamp ? (typeof msg.timestamp.toMillis === 'function' ? msg.timestamp.toMillis() : new Date(msg.timestamp).getTime()) : Date.now();
                          const isWithin15Min = (Date.now() - msgTime) <= 15 * 60 * 1000;
                          const showDelete = isAdmin || (msg.sender === currentUser?.username && isWithin15Min);
                          if (!showDelete) return null;
                          return (
                            <button
                              onClick={() => {
                                setOpenMessageMenuId(null);
                                handleDeleteMessage(msg.id);
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-red-950/60 text-red-300 flex items-center gap-2 font-bold"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                              <span>Apagar Mensagem</span>
                            </button>
                          );
                        })()}

                        {/* Admin Purge option */}
                        {isAdmin && (
                          <button
                            onClick={() => {
                              setOpenMessageMenuId(null);
                              setConfirmPurgeId(msg.id);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded hover:bg-red-950/80 text-red-400 flex items-center gap-2 font-bold border-t border-red-900/40"
                          >
                            <Gavel className="w-3.5 h-3.5 text-red-500" />
                            <span>Expurgar do Banco</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2 mb-2 pr-6">
                    {renderRoleBadge(msg.role, msg.sender)}
                    <span className="text-emerald-400 text-xs font-bold">
                      {msg.sender}
                    </span>
                  </div>
                  
                  {msg.viewOnce ? (
                    isAdmin ? (
                      <div className="animate-in fade-in zoom-in duration-300 relative bg-fuchsia-950/20 p-2.5 rounded-sm border border-fuchsia-900/40">
                        <div className="flex items-center gap-2 text-fuchsia-400 text-[10px] font-bold mb-1.5 uppercase tracking-wider">
                          <Eye className="w-3.5 h-3.5 text-fuchsia-400" />
                          Visualização Única (Visível para Administrador)
                        </div>
                        {msg.text && (
                          <div className="flex items-baseline flex-wrap gap-1">
                            <span className="text-emerald-100 text-sm break-words leading-relaxed whitespace-pre-wrap">
                              {msg.text}
                            </span>
                            {msg.isEdited && (
                              <span className="text-[10px] text-zinc-400 italic">
                                (editada{msg.editCount ? ` ${msg.editCount}x` : ''})
                              </span>
                            )}
                          </div>
                        )}
                        {msg.attachment && (
                          <div className={`mt-2 bg-black/60 border border-emerald-900/50 p-2 rounded-sm flex flex-col gap-2 ${!msg.text ? 'mt-0' : ''}`}>
                            {msg.attachment.fileType === 'image' && msg.attachment.url ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setLightboxImageUrl(msg.attachment.url!);
                                  setLightboxImageName(msg.attachment.name);
                                }}
                                className="block focus:outline-none cursor-zoom-in text-left"
                                title="Abrir imagem"
                              >
                                <img src={msg.attachment.url} alt="Anexo" className="max-h-48 max-w-full rounded-sm border border-emerald-800/30 object-contain hover:opacity-80 transition-opacity" />
                              </button>
                            ) : msg.attachment.fileType === 'audio' && msg.attachment.url ? (
                              <AudioPlayer src={msg.attachment.url} name={msg.attachment.name} durationSec={msg.attachment.duration} />
                            ) : null}
                          </div>
                        )}
                      </div>
                    ) : msg.expired && !viewingHidden[msg.id] ? (
                      <div className="flex items-center gap-2 text-zinc-500 italic text-sm py-2">
                        <EyeOff className="w-4 h-4" />
                        Mensagem expirada
                      </div>
                    ) : (msg.sender === currentUser?.username) ? (
                      <div className="animate-in fade-in zoom-in duration-300 relative bg-emerald-950/20 p-2 rounded-sm border border-emerald-900/30">
                        <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-bold mb-1 uppercase tracking-wider">
                          <Eye className="w-3 h-3" />
                          Você enviou (Visualização Única)
                        </div>
                        {msg.text && (
                          <div className="flex items-baseline flex-wrap gap-1">
                            <span className="text-emerald-100 text-sm break-words leading-relaxed whitespace-pre-wrap">
                              {msg.text}
                            </span>
                            {msg.isEdited && (
                              <span className="text-[10px] text-zinc-400 italic">
                                (editada{msg.editCount ? ` ${msg.editCount}x` : ''})
                              </span>
                            )}
                          </div>
                        )}
                        {msg.attachment && (
                          <div className={`mt-2 bg-black/60 border border-emerald-900/50 p-2 rounded-sm flex flex-col gap-2 ${!msg.text ? 'mt-0' : ''}`}>
                            {msg.attachment.fileType === 'image' && msg.attachment.url ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setLightboxImageUrl(msg.attachment.url!);
                                  setLightboxImageName(msg.attachment.name);
                                }}
                                className="block focus:outline-none cursor-zoom-in text-left"
                                title="Abrir imagem"
                              >
                                <img src={msg.attachment.url} alt="Anexo" className="max-h-48 max-w-full rounded-sm border border-emerald-800/30 object-contain hover:opacity-80 transition-opacity" />
                              </button>
                            ) : msg.attachment.fileType === 'audio' && msg.attachment.url ? (
                              <AudioPlayer src={msg.attachment.url} name={msg.attachment.name} durationSec={msg.attachment.duration} />
                            ) : null}
                          </div>
                        )}
                      </div>
                    ) : !viewingHidden[msg.id] ? (
                      <button 
                        onClick={() => handleOpenViewOnce(msg)}
                        className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 bg-emerald-950/50 p-2 rounded-sm border border-emerald-900/50 transition-colors w-full justify-center text-sm my-2 shadow-lg shadow-emerald-900/20 hover:bg-emerald-900/50"
                      >
                        <Eye className="w-4 h-4" />
                        Tocar para visualizar
                      </button>
                    ) : (
                      <div className="animate-in fade-in zoom-in duration-300 relative bg-black/60 p-2 rounded-sm border border-amber-900/30 shadow-inner">
                        <div className="flex items-center gap-2 text-amber-500 text-[10px] font-bold mb-2 uppercase tracking-wider">
                          <AlertTriangle className="w-3 h-3" />
                          Visualização Única (Irá sumir ao fechar)
                        </div>
                        {msg.text && (
                          <div className="flex items-baseline flex-wrap gap-1">
                            <span className="text-emerald-100 text-sm break-words leading-relaxed whitespace-pre-wrap">
                              {msg.text}
                            </span>
                            {msg.isEdited && (
                              <span className="text-[10px] text-zinc-400 italic">
                                (editada{msg.editCount ? ` ${msg.editCount}x` : ''})
                              </span>
                            )}
                          </div>
                        )}
                        {msg.attachment && (
                          <div className={`mt-2 bg-black/60 border border-emerald-900/50 p-2 rounded-sm flex flex-col gap-2 ${!msg.text ? 'mt-0' : ''}`}>
                            {msg.attachment.fileType === 'image' && msg.attachment.url ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setLightboxImageUrl(msg.attachment.url!);
                                  setLightboxImageName(msg.attachment.name);
                                }}
                                className="block focus:outline-none cursor-zoom-in text-left"
                                title="Abrir imagem"
                              >
                                <img src={msg.attachment.url} alt="Anexo" className="max-h-48 max-w-full rounded-sm border border-emerald-800/30 object-contain hover:opacity-80 transition-opacity" />
                              </button>
                            ) : msg.attachment.fileType === 'audio' && msg.attachment.url ? (
                              <AudioPlayer src={msg.attachment.url} name={msg.attachment.name} durationSec={msg.attachment.duration} />
                            ) : null}
                          </div>
                        )}
                      </div>
                    )
                  ) : (
                    <>
                      {msg.text && (
                        <span className="text-emerald-100 text-sm break-words leading-relaxed whitespace-pre-wrap">
                          {msg.text}
                        </span>
                      )}
                      {msg.attachment && (
                        <div className={`mt-2 bg-black/60 border border-emerald-900/50 p-2 rounded-sm flex flex-col gap-2 ${!msg.text ? 'mt-0' : ''}`}>
                          {msg.attachment.fileType === 'image' && msg.attachment.url ? (
                            <button
                              type="button"
                              onClick={() => {
                                setLightboxImageUrl(msg.attachment.url!);
                                setLightboxImageName(msg.attachment.name);
                              }}
                              className="block focus:outline-none cursor-zoom-in text-left"
                              title="Abrir imagem inteira"
                            >
                              <img src={msg.attachment.url} alt="Anexo" className="max-h-48 max-w-full rounded-sm border border-emerald-800/30 object-contain hover:opacity-80 transition-opacity" />
                            </button>
                          ) : msg.attachment.fileType === 'audio' && msg.attachment.url ? (
                            <AudioPlayer src={msg.attachment.url} name={msg.attachment.name} durationSec={msg.attachment.duration} />
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-emerald-950/50 rounded-sm">
                                {msg.attachment.fileType === 'audio' && <Play className="w-4 h-4 text-emerald-400" />}
                                {msg.attachment.fileType === 'image' && <ImageIcon className="w-4 h-4 text-blue-400" />}
                                {msg.attachment.fileType === 'document' && <FileText className="w-4 h-4 text-zinc-400" />}
                              </div>
                              {msg.attachment.url ? (
                                <button
                                  type="button"
                                  onClick={() => triggerSafeDownload(msg.attachment.url!, msg.attachment.name)}
                                  className="text-emerald-300 text-xs truncate max-w-[200px] hover:underline cursor-pointer text-left font-bold focus:outline-none"
                                >
                                  {msg.attachment.name}
                                </button>
                              ) : (
                                <span className="text-emerald-300 text-xs truncate max-w-[200px]">
                                  {msg.attachment.name} (antigo, não pode ser aberto)
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
                )
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {currentUser?.isBanned && (
          <div className="bg-amber-950/90 border-t border-b border-amber-800 p-2 sm:p-3 flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs font-mono text-amber-200 z-20 shrink-0">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0 animate-bounce" />
              <span>Conta BANIDA. Envio bloqueado.</span>
            </div>
            <button
              onClick={() => setShowAppealModal(true)}
              className="px-2 py-1 sm:px-3 sm:py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded text-[10px] sm:text-xs transition-colors shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.4)]"
            >
              APELAR
            </button>
          </div>
        )}

        <div className="p-1.5 sm:p-3 bg-zinc-900 border-t border-emerald-900/50 shrink-0 relative z-20">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />

          {stagedAttachment && (
            <div className="bg-black/90 border border-emerald-800/80 p-1.5 sm:p-2 px-2.5 sm:px-3 rounded mb-1.5 sm:mb-2 flex items-center justify-between gap-2 sm:gap-3 animate-in slide-in-from-bottom-1 duration-200">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {stagedAttachment.fileType === 'image' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setLightboxImageUrl(stagedAttachment.url);
                      setLightboxImageName(stagedAttachment.name);
                    }}
                    className="relative group shrink-0 block focus:outline-none cursor-zoom-in"
                    title="Visualizar anexo"
                  >
                    <img
                      src={stagedAttachment.url}
                      alt="Preview"
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded border border-emerald-800 object-cover hover:opacity-80 transition-opacity animate-pulse"
                    />
                  </button>
                ) : (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded border border-emerald-800 bg-emerald-950/20 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                  </div>
                )}
                <div className="min-w-0 font-mono text-left animate-pulse">
                  <p className="text-[10px] sm:text-xs text-emerald-300 font-bold truncate max-w-[120px] sm:max-w-[350px]">
                    {stagedAttachment.name}
                  </p>
                  <p className="text-[8px] sm:text-[9px] text-emerald-600 uppercase tracking-widest font-extrabold">
                    {stagedAttachment.fileType === 'image' ? 'Imagem Carregada' : 'Documento Carregado'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setStagedAttachment(null)}
                  className="p-1 sm:p-1.5 text-red-400 hover:text-red-200 bg-red-950/40 border border-red-900/60 rounded transition-colors"
                  title="Remover anexo"
                >
                  <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-end mb-1 pr-1 font-mono">
            <span className="text-[10px] font-bold text-emerald-300 bg-black/90 px-2.5 py-0.5 rounded border border-emerald-800/80 shadow">
               
            </span>
          </div>
          
          {editingMessageId && (
            <div className="bg-amber-950/90 border border-amber-800/90 p-2 px-3 rounded-t-sm flex items-center justify-between text-xs text-amber-200 mb-1">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-bold">Editando mensagem (máximo 2 edições permitidas)</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingMessageId(null);
                  setInputValue('');
                }}
                className="text-amber-400 hover:text-amber-100 font-bold underline text-xs"
              >
                Cancelar
              </button>
            </div>
          )}
          <form onSubmit={handleSendMessage} className="flex items-end gap-1 sm:gap-2 relative">
            {/* View Once Toggle */}
            <button
              type="button"
              onClick={() => setIsViewOnce(!isViewOnce)}
              className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 bg-black border transition-colors rounded-sm flex items-center justify-center ${isViewOnce ? 'border-amber-700 text-amber-500 bg-amber-950/20' : 'border-emerald-800/80 text-emerald-500 hover:text-emerald-300 hover:bg-emerald-900/30'}`}
              title={isViewOnce ? "Visualização única ATIVADA" : "Visualização única DESATIVADA"}
            >
              {isViewOnce ? <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>

            {/* File Attachment */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 bg-black border border-emerald-800/80 text-emerald-500 hover:text-emerald-300 hover:bg-emerald-900/30 transition-colors rounded-sm flex items-center justify-center"
              title="Anexar Arquivo"
            >
              <Paperclip className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            
            {/* Record Audio Button */}
            <button
              type="button"
              onClick={toggleRecording}
              className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 bg-black border transition-colors rounded-sm flex items-center justify-center ${
                isRecording 
                  ? 'border-red-800 text-red-500 bg-red-950/30 animate-pulse' 
                  : 'border-emerald-800/80 text-emerald-500 hover:text-emerald-300 hover:bg-emerald-900/30'
              }`}
              title="Gravar Áudio"
            >
              {isRecording ? <Square className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>
            
            {isRecording ? (
              audioPreviewUrl ? (
                <div className="flex-1 flex items-center gap-1.5 sm:gap-2 bg-black border border-emerald-800/50 p-1.5 sm:p-2 rounded-sm min-w-0">
                  <div className="flex-1 min-w-0">
                    <AudioPlayer src={audioPreviewUrl} name='Voz' />
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={cancelRecording}
                      className="text-red-500 hover:text-red-300 p-1.5 sm:p-2 bg-red-950/30 rounded-full border border-red-900/50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={sendAudioPreview}
                      className="text-emerald-950 bg-emerald-500 hover:bg-emerald-400 p-1.5 sm:p-2 rounded-full transition-transform active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 bg-black border border-red-800 text-red-400 px-2 sm:px-3 py-1.5 sm:py-2 flex items-center justify-between rounded-sm min-w-0 animate-luxury-glow">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                    </span>
                    <span className="text-[10px] sm:text-xs font-mono tracking-widest font-extrabold text-red-500">
                      REC
                    </span>
                    <div className="flex items-end gap-[1.5px] h-2.5 ml-0.5 shrink-0">
                      {[0.1, 0.4, 0.2, 0.6].map((delay, index) => (
                        <span
                          key={index}
                          className="w-[1px] sm:w-[2px] bg-red-500 rounded-full"
                          style={{
                            height: '100%',
                            animation: `bouncing-bar ${0.7 + delay}s ease-in-out infinite alternate`,
                            animationDelay: `${delay}s`,
                            transformOrigin: 'bottom',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-1">
                    <button
                      type="button"
                      onClick={isRecordingPaused ? resumeRecording : pauseRecording}
                      className="text-amber-500 p-1.5 bg-amber-950/30 rounded-full border border-amber-900/50"
                    >
                      {isRecordingPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                    </button>
                    <button 
                      type="button"
                      onClick={stopAndPreviewRecording}
                      className="text-emerald-500 p-1.5 bg-emerald-950/30 rounded-full border border-emerald-900/50"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button 
                      type="button"
                      onClick={cancelRecording}
                      className="text-red-500 p-1.5 bg-red-950/30 rounded-full border border-red-900/50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )
            ) : (
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputValue}
                onFocus={() => {
                  // Ensure keyboard doesn't cover input on mobile
                  setTimeout(() => {
                    if (textareaRef.current) {
                      textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }, 300);
                }}
                onChange={(e) => setInputValue(e.target.value)}
                maxLength={5000}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    if (!window.matchMedia('(max-width: 640px)').matches) {
                      e.preventDefault();
                      if (inputValue.trim() || stagedAttachment) {
                        handleSendMessage(e);
                      }
                    }
                  }
                }}
                placeholder="Transmitir..."
                className="flex-1 bg-zinc-900 border border-emerald-800 text-emerald-100 px-3 py-2 sm:px-4 sm:py-2.5 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition-all text-sm resize-none min-h-[40px] max-h-40 sm:max-h-60 scrollbar-thin scrollbar-thumb-emerald-900 rounded-lg shadow-inner"
              />
            )}

            {/* Send Button */}
            <button
              type="submit"
              disabled={isRecording || (!inputValue.trim() && !stagedAttachment && !isRecording)}
              className="w-11 h-10 shrink-0 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 border border-emerald-700 font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center rounded-sm active:scale-95"
              title="Enviar mensagem"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

      {!!reportTarget && renderReportModal()}
      {showSuggestionModal && renderSuggestionModal()}
      {showPolicy && renderPrivacyPolicy()}
      {renderDeleteModal()}
      {renderConfirmPurgeModal()}
      {renderAlertModal()}
      {renderGroupModals()}
      {renderMembersModal()}
      {renderAdminReplyModal()}
      {renderDeleteUserConfirmModal()}
      {renderMicPermissionModal()}
      {renderPushToast()}
      {renderAppealModal()}
      {renderAppealReplyModal()}
      {renderBanReasonModal()}
      {renderItemDeleteConfirmModal()}
      {renderGroupTopicsModal()}
      {renderLightboxModal()}
    </div>
  );
}

