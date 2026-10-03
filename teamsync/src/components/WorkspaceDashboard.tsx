/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Hash, Lock, FileText, ChevronDown, ChevronUp, Plus, Sparkles, Send, Mic, Paperclip, 
  MessageSquare, MessageCircle, Smile, UserPlus, Star, PanelRightOpen, Calendar, AlertCircle, 
  CheckCircle, PlusCircle, CheckSquare, Layers, FolderDot, BarChart3, AppWindow, Play, Pause, Bookmark,
  Sliders, Bold, Italic, Code, Link, List, Eye, Trash2, EyeOff, Quote, Terminal,
  HardDrive, UploadCloud, FileDown, Filter, RefreshCw, X, Users,
  Phone, Palette, MicOff, Video, VideoOff, MonitorUp, PhoneCall, Upload,
  Pencil, Mail, Camera, AtSign, Check
} from 'lucide-react';
import { Channel, Document, Task, Message, User, DocBlock, AppearancePreferences } from '../types';
import Logo from './Logo';
import { apiFetch } from '../api';


// Markdown/Slack Markup Parser for the rich chat renderer
export function parseSlackMarkdown(text: string): React.ReactNode {
  if (!text) return "";
  
  // 1. Detect block code blocks first
  const codeBlockRegex = /```([\s\S]+?)```/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  
  while ((match = codeBlockRegex.exec(text)) !== null) {
    const startIndex = match.index;
    const content = match[1];
    
    if (startIndex > lastIndex) {
      parts.push(parseInlines(text.substring(lastIndex, startIndex)));
    }
    
    parts.push(
      <pre key={`code-${startIndex}`} className="my-2.5 p-3.5 bg-slate-950/90 border border-slate-800 rounded-lg font-mono text-[11px] text-cyan-300 overflow-x-auto leading-relaxed max-w-full select-text selection:bg-cyan-900/60">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2 text-[10px] text-slate-500">
          <span>COWORKER ATTACHED_CODE_SNIPPET</span>
          <span className="bg-slate-900 px-1.5 py-0.2 rounded font-bold">RAW TEXT</span>
        </div>
        <code>{content.trim()}</code>
      </pre>
    );
    
    lastIndex = codeBlockRegex.lastIndex;
  }
  
  if (lastIndex < text.length) {
    parts.push(parseInlines(text.substring(lastIndex)));
  }
  
  return <div className="space-y-1 select-text">{parts}</div>;
}

function parseInlines(text: string): React.ReactNode {
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    // Detect bullet lists
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const bulletContent = line.trim().substring(2);
      return (
        <div key={lineIdx} className="flex items-start gap-2 pl-2 text-xs text-slate-300 my-1 justify-start">
          <span className="text-violet-400 mt-1.5 h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />
          <span className="flex-1">{parseLineFormat(bulletContent)}</span>
        </div>
      );
    }
    
    // Detect numbered list e.g. "1. "
    const numMatch = line.trim().match(/^(\d+)\.\s(.*)/);
    if (numMatch) {
      const num = numMatch[1];
      const rest = numMatch[2];
      return (
        <div key={lineIdx} className="flex items-start gap-2 pl-2 text-xs text-slate-350 my-1 justify-start font-sans">
          <span className="text-violet-400 font-mono font-bold text-[10px] mt-0.5">{num}.</span>
          <span className="flex-1">{parseLineFormat(rest)}</span>
        </div>
      );
    }

    // Detect Blockquote "> "
    if (line.trim().startsWith('> ')) {
      const quoteContent = line.trim().substring(2);
      return (
        <blockquote key={lineIdx} className="pl-3 border-l-2 border-violet-500 text-slate-400 italic text-[11px] my-1.5 bg-slate-950/20 py-1.5 rounded-r">
          {parseLineFormat(quoteContent)}
        </blockquote>
      );
    }

    return (
      <p key={lineIdx} className="text-xs text-slate-300 leading-relaxed font-sans min-h-[0.5rem] break-words">
        {parseLineFormat(line)}
      </p>
    );
  });
}

function parseLineFormat(text: string): React.ReactNode[] {
  let tokens: { type: 'text' | 'bold' | 'italic' | 'code' | 'link' | 'mention'; content: string; extra?: string }[] = [{ type: 'text', content: text }];

  const applyRegex = (regex: RegExp, type: 'bold' | 'italic' | 'code' | 'mention' | 'link', mapFn: (match: any) => { content: string; extra?: string }) => {
    let nextTokens: typeof tokens = [];
    for (const token of tokens) {
      if (token.type !== 'text') {
        nextTokens.push(token);
        continue;
      }
      let lastIdx = 0;
      let match;
      regex.lastIndex = 0;
      while ((match = regex.exec(token.content)) !== null) {
        if (match.index > lastIdx) {
          nextTokens.push({ type: 'text', content: token.content.substring(lastIdx, match.index) });
        }
        const { content, extra } = mapFn(match);
        nextTokens.push({ type, content, extra });
        lastIdx = regex.lastIndex;
      }
      if (lastIdx < token.content.length) {
        nextTokens.push({ type: 'text', content: token.content.substring(lastIdx) });
      }
    }
    tokens = nextTokens;
  };

  // 1. Inline Code `code`
  applyRegex(/`([^`]+)`/g, 'code', (m) => ({ content: m[1] }));

  // 2. Bold **bold** or *bold*
  applyRegex(/\*\*([^*]+)\*\*/g, 'bold', (m) => ({ content: m[1] }));
  applyRegex(/\*([^*]+)\*/g, 'bold', (m) => ({ content: m[1] }));

  // 3. Italic _italic_
  applyRegex(/_([^_]+)_/g, 'italic', (m) => ({ content: m[1] }));

  // 4. Mentions: @Name
  applyRegex(/@(\w+)/g, 'mention', (m) => ({ content: m[1] }));

  // 5. Links: [text](url)
  applyRegex(/\[([^\]]+)\]\(([^)]+)\)/g, 'link', (m) => ({ content: m[1], extra: m[2] }));

  return tokens.map((token, idx) => {
    switch (token.type) {
      case 'bold':
        return <strong key={idx} className="font-bold text-[#FFFFFF] bg-slate-900/10 px-0.5 rounded">{token.content}</strong>;
      case 'italic':
        return <em key={idx} className="italic text-slate-200">{token.content}</em>;
      case 'code':
        return <code key={idx} className="bg-[#121B2E] border border-slate-800 text-[10px] font-mono select-text px-1.5 py-0.3 rounded text-indigo-300 font-semibold">{token.content}</code>;
      case 'mention':
        return (
          <span key={idx} className="px-1.5 py-0.2 bg-violet-600/35 border border-violet-500/40 text-violet-200 text-[10.5px] font-extrabold rounded select-none inline-flex items-center mx-0.5">
            @{token.content}
          </span>
        );
      case 'link':
        return <a key={idx} href={token.extra} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline hover:text-violet-300 font-bold">{token.content}</a>;
      default:
        return <span key={idx}>{token.content}</span>;
    }
  });
}

interface WorkspaceDashboardProps {
  currentUser: User;
  users: User[];
  onUpdateCurrentUser: (updated: User) => void;
  onUpdateUsersList: (updatedList: User[]) => void;
  channels: Channel[];
  documents: Document[];
  tasks: Task[];
  messages: Message[];
  appearance: AppearancePreferences;
  onOpenSettings: () => void;
  onOpenAdmin: () => void;
  onOpenMarketplace: () => void;
  dmTargetUser?: User | null;
  onClearDmTargetUser?: () => void;
  activeDocTarget?: Document | null;
  onClearDocTarget?: () => void;
}

export default function WorkspaceDashboard({
  currentUser,
  users,
  onUpdateCurrentUser,
  onUpdateUsersList,
  channels,
  documents,
  tasks,
  messages,
  appearance,
  onOpenSettings,
  onOpenAdmin,
  onOpenMarketplace,
  dmTargetUser,
  onClearDmTargetUser,
  activeDocTarget,
  onClearDocTarget
}: WorkspaceDashboardProps) {
  
  // Tab-views: 'chat' | 'document' | 'tasks' | 'analytics' | 'calendar'
  const [currentTab, setCurrentTab] = useState<'chat' | 'document' | 'tasks' | 'analytics' | 'calendar'>('chat');
  const [docSubTab, setDocSubTab] = useState<'specs' | 'drive'>('specs');

  // Shared reactions list for messages
  const [messageReactions, setMessageReactions] = useState<Record<string, Record<string, string[]>>>({});

  // Keep track of thread replies per message
  const [threadRepliesMap, setThreadRepliesMap] = useState<Record<string, Array<{ user: User; text: string; time: string }>>>({});

  // Calendar Events data
  const [calendarEvents, setCalendarEvents] = useState<Array<{ id: string; date: number; title: string; type: 'sync' | 'deadline' | 'huddle'; time: string }>>([
    { id: 'ev-1', date: 10, title: 'Sprint 24 Sync Planning', type: 'sync', time: '10:00 AM' },
    { id: 'ev-2', date: 15, title: 'ISO Guideline Audit Deadline', type: 'deadline', time: '05:00 PM' },
    { id: 'ev-3', date: 18, title: 'Ad-hoc Voice Huddle Tech Arch', type: 'huddle', time: '03:15 PM' },
    { id: 'ev-4', date: 22, title: 'SCIM AD Group Mapping Review', type: 'sync', time: '11:00 AM' }
  ]);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<number | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleTime, setScheduleTime] = useState('10:00 AM');
  const [scheduleType, setScheduleType] = useState<'sync' | 'deadline' | 'huddle'>('sync');

  // Drag and drop Kanban columns tracker
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Work Mode Selection properties
  const [isWorkModeMenuOpen, setIsWorkModeMenuOpen] = useState(false);
  const [customModeText, setCustomModeText] = useState('');

  // Edit Profile modal state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', avatar: '' });
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  const openEditProfile = () => {
    setProfileForm({
      name: currentUser.name,
      email: currentUser.email,
      avatar: currentUser.avatar,
    });
    setIsWorkModeMenuOpen(false);
    setIsEditProfileOpen(true);
  };

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProfileForm(prev => ({ ...prev, avatar: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    const name = profileForm.name.trim();
    const email = profileForm.email.trim();
    const avatar = profileForm.avatar.trim();
    if (!name || !email) return; // name & email required

    const updated: User = {
      ...currentUser,
      name,
      email,
      avatar: avatar || currentUser.avatar,
    };
    onUpdateCurrentUser(updated);
    setIsEditProfileOpen(false);

    const systemLog: Message = {
      id: `system-profile-${Date.now()}`,
      channelId: selectedChannel ? selectedChannel.id : (channels[0] ? channels[0].id : 'general'),
      userId: 'system',
      user: {
        id: 'system',
        name: 'Presence Bot',
        email: 'presence-bot@workspace',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop',
        role: 'admin',
        status: 'online'
      },
      content: `🪪 *Profile Updated:* ${name} refreshed their profile details.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setLiveMessages(prev => [...prev, systemLog]);
  };

  const WORK_MODE_PRESETS = [
    { status: 'online' as const, label: 'Active', emoji: '🟢', customStatus: 'Active & Online', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { status: 'busy' as const, label: 'Deep Work', emoji: '⚡', customStatus: 'Deep Work Mode (DND)', color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { status: 'busy' as const, label: 'In Meeting', emoji: '📅', customStatus: 'In a Meeting', color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { status: 'away' as const, label: 'Lunch Break', emoji: '🍜', customStatus: 'On Lunch break', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { status: 'away' as const, label: 'On Vacation', emoji: '🌴', customStatus: 'Out Of Office (Vacation)', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { status: 'online' as const, label: 'Coding', emoji: '💻', customStatus: 'Hacking & Coding', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { status: 'busy' as const, label: 'Brainstorming', emoji: '💡', customStatus: 'Brainstorming / Drawing', color: 'text-yellow-450', bg: 'bg-yellow-500/10' },
  ];

  const handleSetPresetWorkMode = (preset: typeof WORK_MODE_PRESETS[0]) => {
    const updated: User = {
      ...currentUser,
      status: preset.status,
      customStatus: `${preset.emoji} ${preset.customStatus}`
    };
    onUpdateCurrentUser(updated);
    setIsWorkModeMenuOpen(false);

    // Create an interactive chat system log message
    const systemLog: Message = {
      id: `system-presence-${Date.now()}`,
      channelId: selectedChannel ? selectedChannel.id : (channels[0] ? channels[0].id : 'general'),
      userId: 'system',
      user: {
        id: 'system',
        name: 'Presence Bot',
        email: 'presence-bot@workspace',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop',
        role: 'admin',
        status: 'online'
      },
      content: `🔒 *Presence Notification:* ${currentUser.name} updated active work mode to ~${preset.emoji} ${preset.label}~ (${preset.customStatus}).`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setLiveMessages(prev => [...prev, systemLog]);
  };

  const handleSetBespokeStatus = () => {
    if (!customModeText.trim()) return;
    const updated: User = {
      ...currentUser,
      status: 'online', // default active
      customStatus: customModeText.trim()
    };
    onUpdateCurrentUser(updated);
    setCustomModeText('');
    setIsWorkModeMenuOpen(false);

    const systemLog: Message = {
      id: `system-presence-${Date.now()}`,
      channelId: selectedChannel ? selectedChannel.id : (channels[0] ? channels[0].id : 'general'),
      userId: 'system',
      user: {
        id: 'system',
        name: 'Presence Bot',
        email: 'presence-bot@workspace',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop',
        role: 'admin',
        status: 'online'
      },
      content: `🔒 *Presence Notification:* ${currentUser.name} set a custom active status: _"${customModeText.trim()}"_.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setLiveMessages(prev => [...prev, systemLog]);
  };
  
  const [selectedChannel, setSelectedChannel] = useState<Channel>(channels[0]);
  const [selectedDoc, setSelectedDoc] = useState<Document>(documents[0]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(tasks[0]);

  // Listen to external navigation triggers (e.g., clicking presence facepile, notification detail action)
  useEffect(() => {
    if (dmTargetUser) {
      setDirectMessageUserIds(previous => Array.from(new Set([...previous, dmTargetUser.id])));
      setSelectedDmUser(dmTargetUser);
      setActiveChatType('dm');
      setCurrentTab('chat');
      if (onClearDmTargetUser) {
        onClearDmTargetUser();
      }
    }
  }, [dmTargetUser, onClearDmTargetUser]);

  useEffect(() => {
    if (activeDocTarget) {
      setSelectedDoc(activeDocTarget);
      setDocSubTab('specs');
      setCurrentTab('document');
      if (onClearDocTarget) {
        onClearDocTarget();
      }
    }
  }, [activeDocTarget, onClearDocTarget]);
  
  // Direct Message & Chat Settings States
  const [activeChatType, setActiveChatType] = useState<'channel' | 'dm'>('channel');
  const [selectedDmUser, setSelectedDmUser] = useState<User | null>(null);
  const [directMessageUserIds, setDirectMessageUserIds] = useState<string[]>([]);
  const [isDmPickerOpen, setIsDmPickerOpen] = useState(false);
  const [isChatSettingsOpen, setIsChatSettingsOpen] = useState(false);
  const [chatSettings, setChatSettings] = useState({
    compactMode: appearance.chatDensity === 'compact',
    showNotificationSound: true,
    showDesktopAlerts: true,
    enableAiSummaries: true,
    readReceiptsEnabled: true,
    messageExpiry: 'none'
  });

  useEffect(() => {
    apiFetch('/chats')
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(payload => {
        const ids = (payload.data || [])
          .filter((chat: any) => chat.type === 'direct')
          .flatMap((chat: any) => chat.members || [])
          .map((member: any) => member.id)
          .filter((id: string) => id !== currentUser.id);
        setDirectMessageUserIds(Array.from(new Set(ids)) as string[]);
      })
      .catch(() => setChatApiError('Direct messages backend se load nahi huay.'));
  }, [currentUser.id]);

  const addDirectMessage = async (user: User) => {
    try {
      const response = await apiFetch('/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          type: 'direct',
          userId: currentUser.id,
          memberIds: [user.id],
        }),
      });
      if (!response.ok) throw new Error();
      setDirectMessageUserIds(previous => Array.from(new Set([...previous, user.id])));
      setSelectedDmUser(user);
      setActiveChatType('dm');
      setCurrentTab('chat');
      setIsDmPickerOpen(false);
      setChatApiError(null);
    } catch {
      setChatApiError('Direct message add nahi hua. Backend check karein.');
    }
  };

  // 📁 Interactive Secure Cloud Drive Vault States
  const [vaultFiles, setVaultFiles] = useState([
    { id: 'f-1', name: 'ISO-27001-compliance-framework.xlsx', size: '1.8 MB', type: 'excel', category: 'Compliance', timestamp: 'Yesterday, 4:12 PM', author: 'Elena Rostova', downloadCount: 42 },
    { id: 'f-2', name: 'scim-mapping-azure-ad-spec.pdf', size: '3.1 MB', type: 'pdf', category: 'Technical Specs', timestamp: 'Today, 9:25 AM', author: 'Marcus Vance', downloadCount: 19 },
    { id: 'f-3', name: 'figma-branding-layout-assets.zip', size: '34.5 MB', type: 'archive', category: 'Creative Assets', timestamp: 'Jun 4, 2026', author: 'Devon Miller', downloadCount: 105 },
    { id: 'f-4', name: 'jwt-rsa-keypair-secrets.pem', size: '4 KB', type: 'key', category: 'SecOps Keyring', timestamp: 'Jun 7, 2026', author: 'Sarah Chen', downloadCount: 5 }
  ]);

  const [vaultSearchQuery, setVaultSearchQuery] = useState('');
  const [vaultSelectedCategory, setVaultSelectedCategory] = useState<string>('All');
  const [selectedPreviewFile, setSelectedPreviewFile] = useState<any>(null);
  
  // Drag and Drop Upload Indicator & Simulate Progress States
  const [isDragOverUpload, setIsDragOverUpload] = useState(false);
  const [activeUploadProgress, setActiveUploadProgress] = useState<number | null>(null);
  const [activeUploadName, setActiveUploadName] = useState('');
  const [uploadNotification, setUploadNotification] = useState<string | null>(null);

  // Proper Editor State Parameters
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);

  // Interactive Live Data States
  const [liveMessages, setLiveMessages] = useState<Message[]>(messages);
  const [chatApiError, setChatApiError] = useState<string | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [liveDocs, setLiveDocs] = useState<Document[]>(documents);
  const [liveTasks, setLiveTasks] = useState<Task[]>(tasks);

  // Chat input states
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Notion doc block text modification states
  const [activeEditingBlockId, setActiveEditingBlockId] = useState<string | null>(null);
  const [blockEditingText, setBlockEditingText] = useState('');

  // Notion doc Slash Command Trigger
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashSearchQuery, setSlashSearchQuery] = useState('');

  // AI Copilot context dialogue inputs
  const [copilotInput, setCopilotInput] = useState('Suggest a risk assessment checklist for this specification.');
  const [copilotHistory, setCopilotHistory] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([
    { sender: 'assistant', text: 'Hi! I’m the FLOW AI. I can review specifications, rewrite selected documentation blocks, and extract agile tasks onto the sprint columns in real-time. Ask me any command!' }
  ]);
  const [isAiCopilotLoading, setIsAiCopilotLoading] = useState(false);

  // Thread panel sidebars
  const [activeThreadMsg, setActiveThreadMsg] = useState<Message | null>(null);
  const [threadReplyInput, setThreadReplyInput] = useState('');
  const [threadReplies, setThreadReplies] = useState<Array<{ user: User; text: string; time: string }>>([
    { user: currentUser, text: 'This matches ISO guidelines securely.', time: '09:15 AM' }
  ]);

  // Audio Playback simulation state
  const [playingAudioMsgId, setPlayingAudioMsgId] = useState<string | null>(null);

  // New Chat Media/Attachments upload (WhatsApp-style)
  const [stagedFiles, setStagedFiles] = useState<Array<{ file: File; id: string; previewUrl?: string }>>([]);
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const [chatIsDragging, setChatIsDragging] = useState<boolean>(false);
  
  // Interactive Team Audio Huddle / Instant Meeting
  const [activeHuddle, setActiveHuddle] = useState<boolean>(false);
  const [huddleMuted, setHuddleMuted] = useState<boolean>(false);
  const [huddleVideoActive, setHuddleVideoActive] = useState<boolean>(false);
  const [huddleScreenShare, setHuddleScreenShare] = useState<boolean>(false);
  const [huddleDuration, setHuddleDuration] = useState<number>(0);
  const huddleTimerRef = useRef<any>(null);

  // Interactive Drawing Sketchbox (Canvas functionality)
  const [isCanvasOpen, setIsCanvasOpen] = useState<boolean>(false);
  const [canvasStrokeColor, setCanvasStrokeColor] = useState<string>('#6366F1'); 
  const [canvasStrokeWidth, setCanvasStrokeWidth] = useState<number>(3);
  const [canvasIsDrawing, setCanvasIsDrawing] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Attachment Image Lightbox
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);

  // Huddle Stopwatch active timer effect
  useEffect(() => {
    if (activeHuddle) {
      setHuddleDuration(0);
      huddleTimerRef.current = setInterval(() => {
        setHuddleDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (huddleTimerRef.current) {
        clearInterval(huddleTimerRef.current);
        huddleTimerRef.current = null;
      }
    }
    return () => {
      if (huddleTimerRef.current) clearInterval(huddleTimerRef.current);
    };
  }, [activeHuddle]);

  // Whiteboard Canvas initialization
  useEffect(() => {
    if (isCanvasOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = 640;
      canvas.height = 420;
      if (ctx) {
        ctx.fillStyle = '#0f172a'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [isCanvasOpen]);

  // Coordinate-relative Mouse Drawing callbacks
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;
    
    if ('touches' in e) {
      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        return;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = canvasStrokeColor;
    ctx.lineWidth = canvasStrokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setCanvasIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasIsDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;
    
    if ('touches' in e) {
      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        return;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setCanvasIsDrawing(false);
  };

  // Convert drawing to high-integrity PNG attachment and stage in input area
  const handleShareCanvasToChat = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/png');
    
    fetch(dataUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `sketch-${Date.now()}.png`, { type: 'image/png' });
        setStagedFiles(prev => [...prev, {
          file,
          id: `f-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          previewUrl: dataUrl
        }]);
        setIsCanvasOpen(false); 
        setCurrentTab('chat');
      });
  };

  // Multiple File selector trigger 
  const handleChatFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files) as File[];
      const newStaged = selected.map(file => {
        const id = `f-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        let previewUrl: string | undefined;
        if (file.type.startsWith('image/')) {
          previewUrl = URL.createObjectURL(file);
        }
        return { file, id, previewUrl };
      });
      setStagedFiles(prev => [...prev, ...newStaged]);
    }
    if (e.target) e.target.value = '';
  };

  // Viewport native Drag-To-Stage event triggers
  const handleChatDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setChatIsDragging(true);
  };

  const handleChatDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setChatIsDragging(false);
  };

  const handleChatDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setChatIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const dropped = Array.from(e.dataTransfer.files) as File[];
      const newStaged = dropped.map(file => {
        const id = `f-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        let previewUrl: string | undefined;
        if (file.type.startsWith('image/')) {
          previewUrl = URL.createObjectURL(file);
        }
        return { file, id, previewUrl };
      });
      setStagedFiles(prev => [...prev, ...newStaged]);
    }
  };

  const formatHuddleTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 📁 Cloud Vault File Handlers & Progress Simulation
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverUpload(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverUpload(false);
  };

  const handleDropUpload = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverUpload(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      triggerSimulatedFileUpload(file.name, file.size);
    }
  };

  const handleManualFileUploadSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      triggerSimulatedFileUpload(file.name, file.size);
    }
  };

  const triggerSimulatedFileUpload = (name: string, sizeInBytes: number) => {
    const sizeStr = sizeInBytes > 1024 * 1024 
      ? `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB` 
      : `${(sizeInBytes / 1024).toFixed(0)} KB`;
      
    const ext = name.split('.').pop()?.toLowerCase() || 'unknown';
    let type = 'binary';
    let category = 'Technical Specs';
    if (['xlsx', 'xls', 'csv'].includes(ext)) { type = 'excel'; category = 'Compliance'; }
    else if (['pdf', 'doc', 'docx'].includes(ext)) { type = 'pdf'; category = 'Documents'; }
    else if (['zip', 'rar', 'gz'].includes(ext)) { type = 'archive'; category = 'Creative Assets'; }
    else if (['key', 'pem', 'ssh', 'pub'].includes(ext)) { type = 'key'; category = 'SecOps Keyring'; }
    else if (['png', 'jpg', 'jpeg', 'svg'].includes(ext)) { type = 'image'; category = 'Creative Assets'; }

    setActiveUploadName(name);
    setActiveUploadProgress(0);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      setActiveUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          const newFile = {
            id: `f-${Math.random()}`,
            name,
            size: sizeStr,
            type,
            category,
            timestamp: 'Just now',
            author: currentUser.name,
            downloadCount: 0
          };
          setVaultFiles(prev => [newFile, ...prev]);
          setActiveUploadProgress(null);
          setUploadNotification(`Successfully uploaded "${name}" (${sizeStr}) to Secure Vault Cloud Drive!`);
          setTimeout(() => setUploadNotification(null), 4000);
        }, 200);
      }
    }, 150);
  };

  // Handle typing indicator simulation
  useEffect(() => {
    if (chatInput.length > 0) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 2000);
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
    }
  }, [chatInput]);

  useEffect(() => {
    const controller = new AbortController();
    const isChannel = activeChatType === 'channel';
    const targetId = isChannel
      ? selectedChannel.id
      : `dm-${[currentUser.id, selectedDmUser?.id || ''].sort().join('-')}`;

    if (!isChannel && !selectedDmUser) return;

    const query = isChannel
      ? `channelId=${encodeURIComponent(selectedChannel.id)}`
      : `directWith=${encodeURIComponent(selectedDmUser!.id)}&me=${encodeURIComponent(currentUser.id)}`;

    setIsChatLoading(true);
    setChatApiError(null);
    apiFetch(`/messages?${query}`, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error(`API returned ${response.status}`);
        return response.json();
      })
      .then((rows: any[]) => {
        const remoteMessages = rows.map((row): Message => ({
          ...row,
          channelId: targetId,
          user: row.user || users.find(user => user.id === row.userId) || currentUser,
          reactions: row.reactions || [],
          files: row.files || undefined,
        }));
        setLiveMessages(previous => [
          ...previous.filter(message => message.channelId !== targetId),
          ...remoteMessages,
        ]);
      })
      .catch(error => {
        if (error.name !== 'AbortError') setChatApiError('Backend API connect nahi ho rahi.');
      })
      .finally(() => setIsChatLoading(false));

    return () => controller.abort();
  }, [activeChatType, selectedChannel.id, selectedDmUser?.id, currentUser.id, users]);

  // Handle send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() && stagedFiles.length === 0) return;

    const currentChannelId = activeChatType === 'channel' 
      ? selectedChannel.id 
      : (selectedDmUser ? `dm-${[currentUser.id, selectedDmUser.id].sort().join('-')}` : '');

    const typedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Map staged files to Message objects
    const msgFiles = stagedFiles.map(sf => {
      const sizeInKb = sf.file.size / 1024;
      const sizeStr = sizeInKb > 1024 
        ? `${(sizeInKb / 1024).toFixed(1)} MB` 
        : `${sizeInKb.toFixed(1)} KB`;

      return {
        name: sf.file.name,
        size: sizeStr,
        type: sf.file.type || 'application/octet-stream',
        url: sf.previewUrl || URL.createObjectURL(sf.file)
      };
    });

    const messageText = chatInput;

    try {
      setChatApiError(null);
      const response = await apiFetch('/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          content: messageText,
          files: msgFiles.map(({ name, size, type }) => ({ name, size, type })),
          ...(activeChatType === 'channel'
            ? { channelId: selectedChannel.id }
            : { recipientId: selectedDmUser?.id }),
        }),
      });
      if (!response.ok) throw new Error(`API returned ${response.status}`);

      const saved = await response.json();
      const newMsg: Message = {
        ...saved,
        channelId: currentChannelId,
        user: saved.user || currentUser,
        reactions: saved.reactions || [],
        files: saved.files || undefined,
      };
      setLiveMessages(previous => [...previous, newMsg]);
      setChatInput('');
      setStagedFiles([]);
    } catch {
      setChatApiError('Message save nahi hua. Backend/XAMPP check karein.');
      return;
    }

  };

  const handleInsertFormat = (formatType: 'bold' | 'italic' | 'code' | 'codeblock' | 'bullet' | 'quote') => {
    const textarea = document.getElementById('slack-chat-textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const val = chatInput;
    const selectedText = val.substring(start, end);
    
    let formatted = '';
    let cursorOffset = 0;
    
    switch(formatType) {
      case 'bold':
        formatted = `*${selectedText || 'bold_text'}*`;
        cursorOffset = selectedText ? 0 : 1; 
        break;
      case 'italic':
        formatted = `_${selectedText || 'italic_text'}_`;
        cursorOffset = selectedText ? 0 : 1;
        break;
      case 'code':
        formatted = `\`${selectedText || 'code'}\``;
        cursorOffset = selectedText ? 0 : 1;
        break;
      case 'codeblock':
        formatted = `\`\`\`\n${selectedText || '// code snippet'}\n\`\`\``;
        cursorOffset = selectedText ? 0 : 4;
        break;
      case 'bullet':
        formatted = `\n- ${selectedText || 'list_item'}`;
        cursorOffset = selectedText ? 0 : 2;
        break;
      case 'quote':
        formatted = `\n> ${selectedText || 'quote'}`;
        cursorOffset = selectedText ? 0 : 2;
        break;
    }
    
    setChatInput(val.substring(0, start) + formatted + val.substring(end));
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + formatted.length - cursorOffset;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  const handleInsertTemplate = (templateType: 'bug' | 'standup' | 'code' | 'meeting') => {
    let content = '';
    switch(templateType) {
      case 'bug':
        content = `*🐛 BUG REPORT:*
- *Summary:* Describe the software failure
- *Steps to Reproduce:*
  1. Navigate to the chat viewport page
  2. Click on the formatting button list
- *Observed behavior:* Incorrect cursor focus
- *Expected behavior:* Seamless focused transitions`;
        break;
      case 'standup':
        content = `*🗓️ DAILY STANDUP:*
- *Yesterday:* Finished adding direct message subsections & chat layouts
- *Today:* Implementing markdown rich editor and tag triggers
- *Blockers:* None at the moment`;
        break;
      case 'code':
        content = `*💻 REFACTOR SNIPPET:*
\`\`\`typescript
interface ChatDraft {
  id: string;
  bodyText: string;
  isPreviewActive: boolean;
}
export function submitMessageDraft(draft: ChatDraft): boolean {
  console.log("Sending: ", draft.bodyText);
  return true;
}
\`\`\``;
        break;
      case 'meeting':
        content = `*📝 MEETING SUMMARY:*
- *Attendees:* @Sarah @Marcus @Elena
- *Key decisions:* Migrate manual chat textboxes into a rich markdown interactive composer
- *Next Steps:* Test build with dynamic selection markers`;
        break;
    }
    setChatInput(prev => prev ? `${prev}\n\n${content}` : content);
    setIsTemplateMenuOpen(false);
  };

  // Add thread message replies
  const handleSendThreadReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!threadReplyInput.trim() || !activeThreadMsg) return;

    const newReply = {
      user: currentUser,
      text: threadReplyInput,
      time: 'Just now'
    };

    // Update real replies mapping
    const currentReplies = threadRepliesMap[activeThreadMsg.id] || [];
    const updatedReplies = [...currentReplies, newReply];
    const newMap = {
      ...threadRepliesMap,
      [activeThreadMsg.id]: updatedReplies
    };
    setThreadRepliesMap(newMap);

    // Synchronize current state as fallback
    setThreadReplies(updatedReplies);

    // Increment repliesCount on the matching message in liveMessages
    const updatedMessages = liveMessages.map(msg => {
      if (msg.id === activeThreadMsg.id) {
        return {
          ...msg,
          repliesCount: (msg.repliesCount || 0) + 1
        };
      }
      return msg;
    });
    setLiveMessages(updatedMessages);
    
    setThreadReplyInput('');
  };

  // Toggle user emoji reactions
  const handleToggleReaction = (messageId: string, emoji: string) => {
    const currentMsgReactions = messageReactions[messageId] || {};
    const existingUsers = currentMsgReactions[emoji] || [];
    
    let updatedUsers: string[];
    if (existingUsers.includes(currentUser.name)) {
      updatedUsers = existingUsers.filter(u => u !== currentUser.name);
    } else {
      updatedUsers = [...existingUsers, currentUser.name];
    }

    const updatedMsgReactions = {
      ...currentMsgReactions,
      [emoji]: updatedUsers
    };

    if (updatedUsers.length === 0) {
      delete updatedMsgReactions[emoji];
    }

    setMessageReactions({
      ...messageReactions,
      [messageId]: updatedMsgReactions
    });
  };

  // Handle Notion Block updates
  const handleSelectEditingBlock = (block: DocBlock) => {
    setActiveEditingBlockId(block.id);
    setBlockEditingText(block.content);
  };

  const handleSaveBlockEdit = (blockId: string) => {
    const updatedDocuments = liveDocs.map(doc => {
      if (doc.id === selectedDoc.id) {
        return {
          ...doc,
          blocks: doc.blocks.map(b => b.id === blockId ? { ...b, content: blockEditingText } : b)
        };
      }
      return doc;
    });
    setLiveDocs(updatedDocuments);
    setSelectedDoc(updatedDocuments.find(d => d.id === selectedDoc.id)!);
    setActiveEditingBlockId(null);
  };

  // Notion toggle checklist item
  const handleToggleChecklist = (blockId: string) => {
    const updatedDocuments = liveDocs.map(doc => {
      if (doc.id === selectedDoc.id) {
        return {
          ...doc,
          blocks: doc.blocks.map(b => b.id === blockId ? { ...b, checked: !b.checked } : b)
        };
      }
      return doc;
    });
    setLiveDocs(updatedDocuments);
    setSelectedDoc(updatedDocuments.find(d => d.id === selectedDoc.id)!);
  };

  // Move a block up or down inside active specification doc
  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === selectedDoc.blocks.length - 1) return;
    const offset = direction === 'up' ? -1 : 1;
    const blocksCopy = [...selectedDoc.blocks];
    const targetBlock = blocksCopy[index];
    blocksCopy[index] = blocksCopy[index + offset];
    blocksCopy[index + offset] = targetBlock;

    const updatedDocuments = liveDocs.map(doc => {
      if (doc.id === selectedDoc.id) {
        return { ...doc, blocks: blocksCopy };
      }
      return doc;
    });
    setLiveDocs(updatedDocuments);
    setSelectedDoc(updatedDocuments.find(d => d.id === selectedDoc.id)!);
  };

  // Delete block row
  const handleDeleteBlock = (index: number) => {
    const blocksCopy = selectedDoc.blocks.filter((_, idx) => idx !== index);
    const updatedDocuments = liveDocs.map(doc => {
      if (doc.id === selectedDoc.id) {
        return { ...doc, blocks: blocksCopy };
      }
      return doc;
    });
    setLiveDocs(updatedDocuments);
    setSelectedDoc(updatedDocuments.find(d => d.id === selectedDoc.id)!);
  };

  // Transform block type dynamically (Notion command alignment)
  const handleChangeBlockType = (index: number, newType: 'text' | 'heading1' | 'heading2' | 'bullet' | 'checklist' | 'code' | 'callout') => {
    const blocksCopy = selectedDoc.blocks.map((b, idx) => idx === index ? { ...b, type: newType } : b);
    const updatedDocuments = liveDocs.map(doc => {
      if (doc.id === selectedDoc.id) {
        return { ...doc, blocks: blocksCopy };
      }
      return doc;
    });
    setLiveDocs(updatedDocuments);
    setSelectedDoc(updatedDocuments.find(d => d.id === selectedDoc.id)!);
  };

  // Notion slash command selector insertion
  const handleInsertSlashBlock = (type: 'heading1' | 'heading2' | 'bullet' | 'checklist' | 'code' | 'callout') => {
    let contentStr = '';
    let extraProps: Partial<DocBlock> = {};
    
    switch(type) {
      case 'heading1': contentStr = '🆕 Brand New Section Area'; break;
      case 'heading2': contentStr = 'Sub-section Strategy Documentation'; break;
      case 'bullet': contentStr = 'Bullet list constraint definition block'; break;
      case 'checklist': contentStr = 'Review TLS cert updates with dev teams'; extraProps.checked = false; break;
      case 'code': contentStr = '// Insert TS scripts \nconst testLimits = true;'; extraProps.language = 'typescript'; break;
      case 'callout': contentStr = '🔒 Enterprise Sandbox: SOC-2 active integrity verified.'; break;
    }

    const newBlock: DocBlock = {
      id: `b-live-${Date.now()}`,
      type,
      content: contentStr,
      ...extraProps
    };

    const updatedDocuments = liveDocs.map(doc => {
      if (doc.id === selectedDoc.id) {
        return {
          ...doc,
          blocks: [...doc.blocks, newBlock]
        };
      }
      return doc;
    });

    setLiveDocs(updatedDocuments);
    setSelectedDoc(updatedDocuments.find(d => d.id === selectedDoc.id)!);
    setShowSlashMenu(false);
  };

  // Kanban update task status click trigger
  const handleUpdateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    const updatedTasks = liveTasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
    setLiveTasks(updatedTasks);
    if (selectedTask?.id === taskId) {
      setSelectedTask(updatedTasks.find(t => t.id === taskId) || null);
    }
  };

  // AI Copilot prompt submissions inside sidebar
  const handleLaunchCopilotAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotInput.trim() || isAiCopilotLoading) return;

    const userMsg = { sender: 'user' as const, text: copilotInput };
    setCopilotHistory(prev => [...prev, userMsg]);
    setCopilotInput('');
    setIsAiCopilotLoading(true);

    setTimeout(() => {
      let aiText = '';
      const inputLower = userMsg.text.toLowerCase();

      if (inputLower.includes('checklist') || inputLower.includes('assess')) {
        aiText = `📋 **AI Risk Assessment Review:**\n1. Enforce strict TLS tunnels on non-secure API mappings.\n2. Revoke OAuth keys on stagnant repository webhooks.\n3. Verify continuous syslog ingestion into cluster analytics.\n\nWould you like me to dump these checklists onto your active page document?`;
      } else if (inputLower.includes('sprint') || inputLower.includes('tasks')) {
        aiText = `🎯 **Sprint Agile Analytics:**\n- Checked Sprint 24 columns. 3 tasks active. 1 task categorized Done.\n- Recommended: Drag "SCIM mapping engine" from *Todo* to *In Progress* to reflect active workloads.\n- AI computed velocity metrics: ~82% milestone confidence.`;
      } else {
        aiText = `✨ **FLOW AI Engine Response:**\nI have evaluated your request context on current workspace items. The SOC-2 cert configurations are optimal. Let me know if you would like to automatically generate a brand presentation!`;
      }

      setCopilotHistory(prev => [...prev, { sender: 'assistant', text: aiText }]);
      setIsAiCopilotLoading(false);
    }, 1500);
  };

  // Filter messages for current channel or direct message
  const currentChannelMessages = liveMessages.filter(m => {
    if (activeChatType === 'channel') {
      return m.channelId === selectedChannel.id;
    } else {
      const dmId = `dm-${[currentUser.id, selectedDmUser?.id || ''].sort().join('-')}`;
      return m.channelId === dmId;
    }
  });

  return (
    <div 
      className="h-full min-h-0 w-full flex flex-col sm:flex-row text-slate-100 font-sans overflow-hidden" 
      id="workspace-dashboard-screen"
      style={{
        fontFamily: appearance.fontFamily === 'mono' ? 'var(--font-mono)' : appearance.fontFamily === 'display' ? 'var(--font-display)' : 'var(--font-sans)',
        fontSize: appearance.fontSize === 'sm' ? '13px' : appearance.fontSize === 'lg' ? '15px' : appearance.fontSize === 'xl' ? '17px' : '14px'
      }}
    >
      
      {/* ===== REDESIGNED BESPOKE DUAL-COLUMN SIDEBAR ===== */}
      {/* COLUMN 1: SLIM VISUAL RAIL (Command Deck) */}
      <aside 
        id="sidebar-slim-rail"
        className="order-2 sm:order-none h-16 w-full sm:h-auto sm:w-[68px] bg-[#050811] border-t sm:border-t-0 sm:border-r border-slate-900/90 flex flex-row sm:flex-col items-center justify-center sm:justify-between px-2 sm:px-0 py-2 sm:py-4 shrink-0 select-none z-30 overflow-x-auto sm:overflow-visible"
      >
        <div className="flex flex-row sm:flex-col items-center justify-center gap-2 sm:gap-5 w-full">
          {/* Workspace Accent Symbol */}
          <div className="hidden sm:block relative group cursor-pointer mb-2" title="FLOW Hub">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center transition-all hover:border-violet-400">
              <Logo iconOnly={true} />
            </div>
            {/* Pulsing indicator of connectivity */}
            <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-[#06D6A0] border-2 border-[#050811] flex items-center justify-center" title="Enterprise Linked">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            </span>
          </div>

          <div className="hidden sm:block w-8 border-t border-slate-800/40 my-1" />

          {/* Core Panes Navigation Buttons */}
          <div className="flex flex-row sm:flex-col gap-2 sm:gap-3.5 w-full items-center justify-center">
            {/* Chats tab view button */}
            <button 
              onClick={() => setCurrentTab('chat')}
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center relative transition-all group cursor-pointer ${
                currentTab === 'chat' 
                  ? 'bg-violet-600/30 text-violet-300 border border-violet-500/50 shadow-md shadow-violet-950/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <MessageSquare className="w-[19px] h-[19px]" />
              {channels.some(c => (c.unreadCount || 0) > 0) && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#050811]" />
              )}
              {/* Tooltip banner */}
              <span className="hidden sm:block absolute left-16 bg-slate-950 border border-slate-800 text-[10px] text-slate-100 font-bold px-2 py-1 rounded shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Chats & Threads
              </span>
            </button>

            {/* Documents tab view button */}
            <button 
              onClick={() => setCurrentTab('document')}
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center relative transition-all group cursor-pointer ${
                currentTab === 'document' 
                  ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-950/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <FileText className="w-[19px] h-[19px]" />
              {/* Tooltip banner */}
              <span className="hidden sm:block absolute left-16 bg-slate-950 border border-slate-800 text-[10px] text-slate-100 font-bold px-2 py-1 rounded shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Notion Documents
              </span>
            </button>

            {/* Tasks tab view button */}
            <button 
              onClick={() => setCurrentTab('tasks')}
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center relative transition-all group cursor-pointer ${
                currentTab === 'tasks' 
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 shadow-md shadow-emerald-950/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <CheckSquare className="w-[19px] h-[19px]" />
              {/* Tooltip banner */}
              <span className="hidden sm:block absolute left-16 bg-slate-950 border border-slate-805 text-[10px] text-slate-100 font-bold px-2 py-1 rounded shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Linear Backlog
              </span>
            </button>

            {/* Team Calendar & Planner tab view button */}
            <button 
              onClick={() => setCurrentTab('calendar')}
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center relative transition-all group cursor-pointer ${
                currentTab === 'calendar' 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-md shadow-amber-950/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <Calendar className="w-[19px] h-[19px]" />
              {/* Tooltip banner */}
              <span className="hidden sm:block absolute left-16 bg-slate-950 border border-slate-805 text-[10px] text-slate-100 font-bold px-2 py-1 rounded shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Team Calendar & Planner
              </span>
            </button>

            {/* Interactive Visual Analytics tab view button */}
            <button 
              onClick={() => setCurrentTab('analytics')}
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center relative transition-all group cursor-pointer ${
                currentTab === 'analytics' 
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-md shadow-indigo-950/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <BarChart3 className="w-[19px] h-[19px]" />
              {/* Tooltip banner */}
              <span className="hidden sm:block absolute left-16 bg-slate-950 border border-slate-805 text-[10px] text-slate-100 font-bold px-2 py-1 rounded shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Visual Analytics & Charts
              </span>
            </button>
          </div>

          <div className="hidden sm:block w-8 border-t border-slate-800/40 my-1" />

          {/* Quick Launches Panel in visual loop */}
          <div className="hidden sm:flex flex-col gap-3 w-full items-center">
            {/* Admin trigger */}
            {currentUser.role === 'admin' && <button 
              onClick={onOpenAdmin}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-450 hover:text-white hover:bg-slate-900/60 transition-all group relative border border-transparent cursor-pointer"
            >
              <FolderDot className="w-4 h-4 text-cyan-400" />
              <span className="absolute left-16 bg-slate-950 border border-slate-800 text-[10px] text-slate-100 font-bold px-2 py-1 rounded shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Admin Settings ⚙️
              </span>
            </button>}

            {/* Integration Store */}
            <button 
              onClick={onOpenMarketplace}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-450 hover:text-white hover:bg-slate-900/60 transition-all group relative border border-transparent cursor-pointer"
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span className="absolute left-16 bg-slate-950 border border-slate-800 text-[10px] text-slate-100 font-bold px-2 py-1 rounded shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Integrations Store
              </span>
            </button>
          </div>
        </div>

        {/* Profile Avatar Trigger at very bottom with work mode selectors */}
        <div className="hidden sm:flex relative flex-col items-center">
          <button 
            onClick={() => setIsWorkModeMenuOpen(!isWorkModeMenuOpen)}
            className="w-11 h-11 rounded-full relative overflow-visible border border-slate-750/70 focus:outline-none focus:ring-2 focus:ring-violet-500 group cursor-pointer hover:scale-105 transition-all"
            title="Set Mode / Presence status"
          >
            <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full rounded-full object-cover" />
            
            {/* Mini active badge showing actual Status Emoji or color dot */}
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-slate-950 border border-[#050811] flex items-center justify-center text-[10px]">
              {currentUser.status === 'busy' ? '⚡' : currentUser.status === 'away' ? '🌙' : '🟢'}
            </span>
          </button>

          {/* Interactive Member Status / Mode setting drop-up absolute overlay menu */}
          {isWorkModeMenuOpen && (
            <div 
              id="sidebar-status-dropup"
              className="absolute bottom-12 left-4 w-60 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl p-3 shadow-2xl z-50 animate-in slide-in-from-bottom-2 duration-150"
            >
              <div className="flex items-center justify-between border-b border-slate-900 pb-1.5 mb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Set Work Mode</span>
                <button 
                  onClick={() => setIsWorkModeMenuOpen(false)}
                  className="text-slate-505 hover:text-white text-xs px-1 hover:bg-slate-900 rounded"
                >
                  ✕
                </button>
              </div>

              {/* Profile summary + Edit Profile entry */}
              <button
                onClick={openEditProfile}
                className="w-full flex items-center gap-2.5 px-2 py-2 mb-2.5 rounded-lg text-left bg-slate-900/40 hover:bg-slate-900 border border-slate-850 hover:border-violet-500/40 transition-colors cursor-pointer group"
              >
                <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full object-cover border border-slate-750 shrink-0" />
                <div className="min-w-0 flex-1 leading-tight">
                  <span className="block text-[12px] font-bold text-white truncate">{currentUser.name}</span>
                  <span className="block text-[9px] text-slate-500 truncate">{currentUser.email}</span>
                </div>
                <span className="flex items-center gap-1 text-[9px] font-bold text-violet-300 opacity-70 group-hover:opacity-100 shrink-0">
                  <Pencil className="w-3 h-3" /> Edit
                </span>
              </button>

              {/* Status presets list */}
              <div className="space-y-1 mb-2.5">
                {WORK_MODE_PRESETS.map((p) => {
                  const isActivePreset = currentUser.status === p.status && currentUser.customStatus?.includes(p.customStatus);
                  return (
                    <button
                      key={p.label}
                      onClick={() => handleSetPresetWorkMode(p)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                        isActivePreset 
                          ? 'bg-violet-600/20 border border-violet-500/30 text-white font-bold' 
                          : 'hover:bg-slate-900 text-slate-350 hover:text-slate-100 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{p.emoji}</span>
                        <div className="flex flex-col">
                          <span className="font-bold">{p.label}</span>
                          <span className="text-[9px] text-slate-500 leading-none mt-0.5">{p.customStatus}</span>
                        </div>
                      </div>
                      <span className={`text-[8px] font-mono font-semibold px-1 rounded ${p.bg} ${p.color}`}>
                        {p.status.toUpperCase()}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-slate-900 pt-2">
                <span className="text-[9.5px] text-slate-400 block mb-1">Or write a bespoke status...</span>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={customModeText}
                    onChange={(e) => setCustomModeText(e.target.value)}
                    placeholder="E.g. Out of office ☕"
                    className="flex-1 bg-slate-905 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-200 placeholder-slate-650 focus:outline-none focus:border-violet-500 font-sans"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSetBespokeStatus();
                      }
                    }}
                  />
                  <button
                    onClick={handleSetBespokeStatus}
                    className="px-2 py-1 bg-violet-600 hover:bg-violet-505 text-white text-[11px] font-bold rounded cursor-pointer shrink-0 animate-pulse"
                  >
                    Set
                  </button>
                </div>
              </div>

              <div className="mt-2 text-[8px] text-slate-555 font-sans leading-relaxed">
                Applying updates status alerts to presence grids.
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* COLUMN 2: DETAILED CONTEXT NAV PANEL (Active lists & Channels deck) */}
      <aside 
        id="sidebar-context-deck"
        className="hidden lg:flex w-[188px] bg-[#070b13] border-r border-slate-900/85 flex-col justify-between shrink-0 select-none"
      >
        <div className="flex flex-col flex-1 min-h-0">
          
          {/* Workspace context tag identifier */}
          <div className="p-3.5 border-b border-slate-900/60" id="context-deck-header">
            <span className="text-[8.5px] font-mono font-extrabold text-indigo-400 uppercase tracking-widest block">
              WORKSPACE DECK
            </span>
            <span className="text-[11px] font-bold text-white mt-1 max-w-full block truncate">
              {currentTab === 'chat' ? '🧬 Registries & Nodes' : currentTab === 'document' ? '📄 Active Docs' : '🚀 Project Sprint'}
            </span>
          </div>

          {/* Dynamic Scroll pane of items */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-4" id="context-deck-scroll">
            
            {/* View Switchers - CHAT SECTION */}
            {currentTab === 'chat' && (
              <>
                {/* Channels lists */}
                <div id="deck-channels-section" className="space-y-1">
                  <div className="flex items-center justify-between px-1.5 mb-1 animate-fadeIn duration-200">
                    <span className="text-[8.5px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Channels & Groups</span>
                    <Plus className="w-3 h-3 text-slate-500 hover:text-white cursor-pointer" />
                  </div>
                  <div className="space-y-0.5" id="deck-channels-list">
                    {channels.map(chan => {
                      const isSelected = activeChatType === 'channel' && selectedChannel.id === chan.id;
                      
                      // Sophisticated directory-path naming and visual schema to break Slack aesthetic
                      let dirPath = `module/${chan.name}`;
                      let iconComponent = <Terminal className="w-3 h-3 text-cyan-400" />;
                      
                      if (chan.name === 'general') {
                        dirPath = `core/announcements`;
                        iconComponent = <Sparkles className="w-3 h-3 text-amber-400" />;
                      } else if (chan.name === 'engineering-hq') {
                        dirPath = `sh/engineering-hq`;
                        iconComponent = <Terminal className="w-3 h-3 text-violet-400" />;
                      } else if (chan.name === 'product-roadmap') {
                        dirPath = `spec/roadmap`;
                        iconComponent = <BarChart3 className="w-3 h-3 text-emerald-400" />;
                      } else if (chan.name === 'security-compliance') {
                        dirPath = `ops/compliance`;
                        iconComponent = <Lock className="w-3 h-3 text-rose-400" />;
                      } else if (chan.name === 'marketing-creative') {
                        dirPath = `pub/creative-camp`;
                        iconComponent = <Layers className="w-3 h-3 text-cyan-400" />;
                      }

                      return (
                        <button
                          key={chan.id}
                          onClick={() => {
                            setSelectedChannel(chan);
                            setActiveChatType('channel');
                            setCurrentTab('chat');
                          }}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs select-none text-left cursor-pointer transition-all border ${
                            isSelected 
                              ? 'bg-indigo-600/10 border-indigo-500/30 text-white font-bold shadow-lg shadow-indigo-950/20' 
                              : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200 border-transparent'
                          }`}
                        >
                          <span className="shrink-0">{iconComponent}</span>
                          <span className="truncate font-mono text-[11px] font-medium">{dirPath}</span>
                          {chan.unreadCount && (
                            <span className="ml-auto bg-rose-500 text-[8.5px] font-bold font-mono px-1 rounded text-white leading-none">
                              {chan.unreadCount}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Direct Messages section with user avatars and status indicators */}
                <div id="deck-team-section" className="space-y-1">
                  <div className="relative flex items-center justify-between px-1.5 mb-1 mt-4">
                    <span className="text-[8.5px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Direct Messages</span>
                    <button
                      type="button"
                      onClick={() => setIsDmPickerOpen(open => !open)}
                      title="Add direct message"
                      className="text-slate-500 hover:text-white cursor-pointer"
                    >
                      <Users className="w-3 h-3" />
                    </button>
                    {isDmPickerOpen && (
                      <div className="absolute top-5 right-0 z-50 w-44 rounded-lg border border-slate-700 bg-slate-950 p-1.5 shadow-2xl">
                        <span className="block px-2 py-1 text-[9px] font-mono uppercase text-slate-500">Start new chat</span>
                        {users.filter(user => user.id !== currentUser.id && !directMessageUserIds.includes(user.id)).map(user => (
                          <button
                            type="button"
                            key={user.id}
                            onClick={() => addDirectMessage(user)}
                            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] text-slate-300 hover:bg-slate-800 hover:text-white"
                          >
                            <img src={user.avatar} alt="" className="h-5 w-5 rounded-full object-cover" />
                            <span className="truncate">{user.name}</span>
                          </button>
                        ))}
                        {users.filter(user => user.id !== currentUser.id && !directMessageUserIds.includes(user.id)).length === 0 && (
                          <span className="block px-2 py-2 text-[10px] text-slate-500">Sab users add hain.</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="space-y-0.5" id="deck-team-list">
                    {users.filter(u => u.id !== currentUser.id && directMessageUserIds.includes(u.id)).map(user => {
                      const statusDot = {
                        online: 'bg-[#06D6A0]',
                        away: 'bg-amber-400',
                        offline: 'bg-slate-600',
                        busy: 'bg-rose-500'
                      }[user.status] || 'bg-slate-600';

                      const isSelected = activeChatType === 'dm' && selectedDmUser?.id === user.id;

                      return (
                        <button
                          key={user.id}
                          onClick={() => {
                            setSelectedDmUser(user);
                            setActiveChatType('dm');
                            setCurrentTab('chat');
                          }}
                          className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs select-none text-left cursor-pointer transition-colors border ${
                            isSelected 
                              ? 'bg-[#12192d] border-violet-500/30 text-white font-bold' 
                              : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200 border-transparent'
                          }`}
                        >
                          {/* User Avatar with Presence indicator */}
                          <div className="relative shrink-0 select-none">
                            <img 
                              src={user.avatar} 
                              alt={user.name} 
                              className="w-5.5 h-5.5 rounded-full object-cover border border-slate-750" 
                            />
                            <span className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${statusDot} border border-[#070b13]`} />
                          </div>

                          {/* Member labels and custom statuses */}
                          <div className="min-w-0 flex-1 flex flex-col leading-tight">
                            <span className="truncate block font-semibold text-slate-305">{user.name}</span>
                            <span className="text-[8.5px] text-cyan-400 font-mono mt-0.5 truncate block max-w-full">
                              {user.customStatus ? user.customStatus : `[${user.status.toUpperCase()}]`}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* View Switchers - DOCUMENTS SECTION */}
            {currentTab === 'document' && (
              <div id="deck-docs-section" className="space-y-1 animate-fadeIn duration-200">
                <div className="flex items-center justify-between px-1.5 mb-1">
                  <span className="text-[9px] font-mono font-bold text-slate-555 uppercase tracking-widest block font-sans">Wiki Manuals</span>
                  <PlusCircle className="w-3 h-3 text-slate-500 hover:text-white cursor-pointer" />
                </div>
                <div className="space-y-0.5" id="deck-docs-list">
                  {liveDocs.map(doc => (
                    <button
                      key={doc.id}
                      onClick={() => {
                        setSelectedDoc(doc);
                        setCurrentTab('document');
                      }}
                      className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs select-none text-left cursor-pointer transition-all ${
                        selectedDoc.id === doc.id 
                          ? 'bg-[#1b253b] text-white font-bold' 
                          : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-sm shrink-0">{doc.emoji}</span>
                      <span className="truncate">{doc.title}</span>
                      {doc.isFavorite && <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400 ml-auto shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* View Switchers - TASKS SECTION */}
            {currentTab === 'tasks' && (
              <div id="deck-tasks-section" className="space-y-1 animate-fadeIn duration-200">
                <div className="flex items-center justify-between px-1.5 mb-1">
                  <span className="text-[9px] font-mono font-bold text-slate-555 uppercase tracking-widest block">Sprint Backlog</span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-400 p-1.5 bg-slate-950/40 rounded border border-slate-900">
                  <div className="font-bold text-[10px] text-slate-500 px-1 font-mono mb-1">ACTIVE SCOPES:</div>
                  <div className="px-1.5 py-1 hover:text-white cursor-pointer flex justify-between items-center bg-slate-900/20 rounded text-[10px]">
                    <span className="font-medium text-slate-300">⚡ Current Sprint</span>
                    <span className="bg-slate-800 text-[8px] px-1 font-mono text-emerald-450 font-bold rounded">Active</span>
                  </div>
                  <div className="px-1.5 py-1 hover:text-white cursor-pointer flex justify-between items-center text-[10px]">
                    <span className="font-medium text-slate-400">📅 Backlog Pipeline</span>
                    <span className="text-[8px] px-1 font-mono text-slate-655 bg-slate-900/40 rounded">32</span>
                  </div>
                  <div className="px-1.5 py-1 hover:text-white cursor-pointer flex justify-between items-center text-[10px]">
                    <span className="font-medium text-slate-400">🌿 Release Logs</span>
                    <span className="text-[8px] px-1 font-mono text-cyan-400 bg-cyan-950/20 rounded">12</span>
                  </div>
                </div>
              </div>
            )}

            {/* View Switchers - ANALYTICS SECTION */}
            {currentTab === 'analytics' && (
              <div id="deck-analytics-section" className="space-y-1 animate-fadeIn duration-200">
                <div className="flex items-center justify-between px-1.5 mb-1">
                  <span className="text-[9px] font-mono font-bold text-slate-550 uppercase tracking-widest block">System Telemetry</span>
                </div>
                <div className="space-y-3.5 p-3.5 bg-slate-950/40 rounded-xl border border-slate-900 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 block font-mono">WORKSPACE RATING:</span>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-200">Sprint Efficiency</span>
                      <span className="text-lime-400 font-mono font-bold">Grade A+</span>
                    </div>
                  </div>
                  <div className="w-full h-px bg-slate-850" />
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 block font-mono">SQUAD ATTRIBUTES:</span>
                    <div className="flex justify-between text-[11px] text-slate-450">
                      <span>Sync Velocity</span>
                      <span className="font-mono text-cyan-400">94.2%</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-450">
                      <span>Response SLA</span>
                      <span className="font-mono text-violet-400">&lt; 3 mins</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* View Switchers - CALENDAR SECTION */}
            {currentTab === 'calendar' && (
              <div id="deck-calendar-section" className="space-y-1 animate-fadeIn duration-200">
                <div className="flex items-center justify-between px-1.5 mb-1">
                  <span className="text-[9px] font-mono font-bold text-slate-555 uppercase tracking-widest block">Coordinated Planner</span>
                </div>
                <div className="space-y-1 text-slate-400 p-1 bg-slate-950/40 rounded-xl border border-slate-800">
                  <div className="px-2 py-1.5 bg-indigo-950/20 text-[#6366F1] font-bold rounded-lg text-[10px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" />
                    <span>🔵 Huddle Schedules</span>
                  </div>
                  <div className="px-2 py-1.5 text-emerald-450 font-bold rounded-lg text-[10px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>🟢 Team Sync Meetings</span>
                  </div>
                  <div className="px-2 py-1.5 text-[#EF4444] font-bold rounded-lg text-[10px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                    <span>🔴 Critical Deadlines</span>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedCalendarDate(new Date().getDate());
                      setScheduleTitle('New Ad-hoc Sync');
                      setShowScheduleModal(true);
                    }}
                    className="w-full mt-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-[10.5px] font-extrabold rounded-lg cursor-pointer transition text-center block"
                  >
                    + Schedule Slot
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Connected banner and simple details at bottom */}
          <div id="deck-footer-status" className="p-2 border-t border-slate-900 bg-slate-950/40 text-[9px] text-slate-500 font-mono text-center flex items-center justify-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-[#06D6A0] animate-pulse" />
            <span>Singapore Edge Node</span>
          </div>

        </div>
      </aside>

      {/* 2. CHAT WORKSPACE (Slack equivalent) */}
      {currentTab === 'chat' && (
        <main 
          onDragOver={handleChatDragOver}
          onDragLeave={handleChatDragLeave}
          onDrop={handleChatDrop}
          className="order-1 sm:order-none min-h-0 min-w-0 flex-1 flex flex-col bg-slate-900 relative" 
          id="chat-viewport-root"
        >
          {/* Top chat/DM info - De-congested Airy Header */}
          <div className="py-3 sm:py-5 px-3 sm:px-7 border-b border-slate-800/50 flex flex-col md:flex-row md:items-center md:justify-between bg-[#070b13]/60 backdrop-blur-md gap-3 sm:gap-4 select-none animate-fadeIn" id="chat-header">
            <div className="min-w-0 w-full md:w-auto">
              <div className="flex items-center gap-3">
                {activeChatType === 'channel' ? (
                  <>
                    <span className="font-bold text-white text-base tracking-tight">#{selectedChannel.name}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mt-0.5" title="Decentralized channel state verified" />
                  </>
                ) : (
                  selectedDmUser && (
                    <>
                      <div className="relative shrink-0">
                        <img 
                          src={selectedDmUser.avatar} 
                          alt={selectedDmUser.name} 
                          className="w-7 h-7 rounded-full object-cover border border-violet-500/20" 
                        />
                        <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ${{
                          online: 'bg-emerald-400',
                          away: 'bg-amber-500',
                          offline: 'bg-slate-600',
                          busy: 'bg-rose-500'
                        }[selectedDmUser.status] || 'bg-slate-600'} border border-[#070b13] shadow`} />
                      </div>
                      <span className="font-bold text-white text-base tracking-tight">{selectedDmUser.name}</span>
                      <span className="text-[9px] font-mono font-extrabold bg-[#1A2436] text-violet-300 px-1.5 py-0.5 rounded tracking-wider uppercase">{selectedDmUser.role}</span>
                    </>
                  )
                )}
              </div>
              
              <p className="text-[11px] text-slate-400/80 mt-1 max-w-full md:max-w-[400px] truncate leading-normal">
                {activeChatType === 'channel' 
                  ? selectedChannel.description 
                  : `Secure direct message line. Status: ${selectedDmUser?.customStatus || 'Active'}`}
              </p>
            </div>
            
            {/* Elegant action clusters */}
            <div className="flex min-w-0 flex-wrap items-center gap-2 md:justify-end">
              
              {/* BUTTON 1: VOIP / AUDIO HUDDLE TRIGGER */}
              <button
                type="button"
                onClick={() => setActiveHuddle(!activeHuddle)}
                className={`shrink-0 flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-lg font-bold text-xs cursor-pointer transition ${
                  activeHuddle 
                    ? 'bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-950/20 animate-pulse' 
                    : 'bg-slate-800 hover:bg-slate-755 text-slate-300 border border-transparent'
                }`}
                title="Instant voice huddle meeting with squad"
              >
                {activeHuddle ? (
                  <>
                    <span className="flex items-center gap-0.5 h-2.5">
                      <span className="w-0.5 h-2 bg-emerald-400 rounded animate-bounce" />
                      <span className="w-0.5 h-3 bg-emerald-400 rounded animate-bounce" style={{ animationDelay: '0.15s' }} />
                      <span className="w-0.5 h-1.5 bg-emerald-400 rounded animate-bounce" style={{ animationDelay: '0.3s' }} />
                    </span>
                    <span className="hidden sm:inline">In Huddle</span>
                  </>
                ) : (
                  <>
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="hidden sm:inline">Join Huddle</span>
                  </>
                )}
              </button>

              {/* BUTTON 2: CANVAS SKETCHPAD TRIGGER */}
              <button
                type="button"
                onClick={() => setIsCanvasOpen(true)}
                className="shrink-0 flex items-center gap-2 px-3 sm:px-3.5 py-2 bg-slate-800 hover:bg-slate-755 text-slate-300 border border-transparent rounded-lg font-bold text-xs cursor-pointer transition-colors"
                title="Open Team whiteboard drawing canvas"
                id="header-canvas-trigger"
              >
                <Palette className="w-3.5 h-3.5 text-lime-400" />
                 <span className="hidden sm:inline">Sketch Canvas</span>
              </button>

              {/* BARRIER DECORATION */}
              <span className="w-px h-5 bg-slate-805 hidden sm:inline" />

              {/* BUTTON 3: CHAT SETTINGS */}
              <button
                type="button"
                onClick={() => setIsChatSettingsOpen(true)}
                className="p-2 bg-slate-800 hover:bg-slate-755 text-slate-300 rounded-lg cursor-pointer transition-colors"
                title="Chat Workspace Settings"
                id="header-chat-settings-trigger"
              >
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              </button>

              {/* REDUCED SOCKET CLUTTER -> POLISHED PULSING DOT */}
              <div 
                className="flex items-center gap-1.5 pl-1"
                title="Transport connected. End-to-end encryption requires client-managed keys and is not guaranteed by metadata alone."
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse relative">
                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                </span>
                <span className="hidden xl:inline text-[9px] text-amber-400">E2E depends on client keys</span>
              </div>

            </div>
          </div>

          {/* Messages list with variable density spacing set by Chat Settings */}
           <div className={`flex-1 overflow-y-auto ${chatSettings.compactMode ? 'space-y-1.5 p-3 sm:p-4' : 'space-y-5 sm:space-y-6 p-3 sm:p-6'}`} id="chat-messages-area">
            {currentChannelMessages.map(msg => (
              <div key={msg.id} className={`flex gap-3 sm:gap-4 group hover:bg-slate-850/10 p-1 rounded-lg transition-colors duration-75 ${chatSettings.compactMode ? 'gap-2.5 py-1 items-center' : 'gap-3 sm:gap-4 py-1.5'}`} id={`message-${msg.id}`}>
                <img src={msg.user.avatar} alt={msg.user.name} className={`${chatSettings.compactMode ? 'w-6 h-6' : 'w-9 h-9'} rounded-full object-cover shrink-0 border border-slate-700/50`} />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-bold text-white">{msg.user.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                    {msg.isPinned && (
                      <span className="text-[9px] bg-amber-955/40 text-amber-450 px-1.5 py-0.2 rounded border border-amber-900/30">Pinned</span>
                    )}
                  </div>
                  
                  <div className="text-xs text-slate-300 leading-relaxed font-sans mt-0.5">{parseSlackMarkdown(msg.content)}</div>

                  {/* WhatsApp-style and rich premium attachments preview */}
                  {msg.files && msg.files.map((file, fIdx) => {
                    const isImg = file.type?.startsWith('image/') || file.name.endsWith('.png') || file.name.endsWith('.jpg') || file.name.endsWith('.jpeg') || file.name.endsWith('.gif');
                    return (
                      <div key={fIdx} className="mt-2.5 max-w-full sm:max-w-sm rounded-xl overflow-hidden shadow-lg border border-slate-800 bg-[#0c101b] transition-all hover:border-indigo-500/30">
                        {isImg ? (
                          <div className="relative group/attachment cursor-pointer overflow-hidden max-h-56">
                            <img 
                              src={file.url} 
                              alt={file.name} 
                              className="w-full object-cover transition-transform duration-200 group-hover/attachment:scale-[1.02] cursor-zoom-in"
                              referrerPolicy="no-referrer"
                              onClick={() => {
                                if (file.url) setActiveLightboxImage(file.url);
                              }}
                            />
                            {/* Overlay caption or helper */}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-2.5 flex items-center justify-between text-[10px] text-slate-305">
                              <span className="truncate font-medium pr-2">{file.name}</span>
                              <span className="font-mono bg-slate-950/60 px-1.5 py-0.5 rounded shrink-0">{file.size}</span>
                            </div>
                          </div>
                        ) : (
                          /* Document or source file style WhatsApp block */
                          <div className="p-3.5 flex items-center justify-between gap-3 select-none">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              {/* File icon based on extension */}
                              <div className="w-10 h-10 bg-indigo-950/40 border border-indigo-900/40 rounded-lg flex items-center justify-center shrink-0">
                                <Paperclip className="w-4.5 h-4.5 text-indigo-400" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="font-bold text-slate-200 block truncate text-[11.5px] leading-tight" title={file.name}>
                                  {file.name}
                                </span>
                                <span className="text-slate-500 font-mono text-[9px] uppercase tracking-wider block mt-1">
                                  {file.type ? file.type.split('/')[1] : 'File'} &bull; {file.size}
                                </span>
                              </div>
                            </div>
                            
                            {file.url ? (
                              <a 
                                href={file.url} 
                                download={file.name}
                                className="text-[10px] text-indigo-400 font-bold hover:text-white px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 rounded-md border border-slate-800 select-none transition-colors"
                              >
                                Download
                              </a>
                            ) : (
                              <button className="text-[10px] text-violet-400 font-bold hover:underline cursor-pointer">
                                Open
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Audio clips preview */}
                  {msg.audioDuration && (
                    <div className="mt-2.5 p-2 bg-slate-950/40 border border-slate-850 rounded-lg flex items-center gap-3 max-w-xs justify-between">
                      <button 
                        onClick={() => setPlayingAudioMsgId(playingAudioMsgId === msg.id ? null : msg.id)}
                        className="w-7 h-7 rounded-full bg-violet-605/90 text-white flex items-center justify-center cursor-pointer hover:bg-violet-600 transition-all shadow"
                      >
                        {playingAudioMsgId === msg.id ? <Pause className="w-3.5 h-3.5 text-white" /> : <Play className="w-3.5 h-3.5 text-white ml-0.5" />}
                      </button>
                      
                      <div className="flex-1 px-1">
                        {/* Fake equalizer */}
                        <div className="flex items-end gap-0.5 h-3.5">
                          <span className="flex-1 bg-violet-500 rounded-px" style={{ height: playingAudioMsgId === msg.id ? '60%' : '20%', transition: 'height 0.15s' }} />
                          <span className="flex-1 bg-violet-400 rounded-px" style={{ height: playingAudioMsgId === msg.id ? '90%' : '15%', transition: 'height 0.15s' }} />
                          <span className="flex-1 bg-violet-500 rounded-px" style={{ height: playingAudioMsgId === msg.id ? '40%' : '25%', transition: 'height 0.15s' }} />
                          <span className="flex-1 bg-violet-400 rounded-px" style={{ height: playingAudioMsgId === msg.id ? '75%' : '10%', transition: 'height 0.15s' }} />
                          <span className="flex-1 bg-violet-300 rounded-px" style={{ height: playingAudioMsgId === msg.id ? '50%' : '30%', transition: 'height 0.15s' }} />
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-slate-500">{msg.audioDuration}</span>
                    </div>
                  )}

                  {/* AI automatic summary banner inline (toggled by Chat Settings) */}
                  {msg.aiSummary && chatSettings.enableAiSummaries && (
                    <div className="mt-2.5 p-2.5 bg-violet-955/20 border border-violet-900/30 rounded-lg text-[10px] text-violet-350 flex items-start gap-1.5 max-w-lg">
                      <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
                      <span><strong>AI Summary:</strong> {msg.aiSummary}</span>
                    </div>
                  )}

                  {/* Active Reactions display row */}
                  {Object.keys(messageReactions[msg.id] || {}).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 select-none">
                      {Object.entries(messageReactions[msg.id] || {}).map(([emoji, users]) => {
                        const usersList = (users as string[]) || [];
                        const hasReacted = usersList.includes(currentUser.name);
                        return (
                          <button
                            key={emoji}
                            onClick={() => handleToggleReaction(msg.id, emoji)}
                            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] transition-all cursor-pointer ${
                              hasReacted 
                                ? 'bg-[#1e1b4b] text-[#c084fc] border-[#a21caf]/40 font-semibold' 
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-750'
                            }`}
                            title={`Current reactions: ${usersList.join(', ')}`}
                          >
                            <span>{emoji}</span>
                            <span className="font-mono text-[9px]">{usersList.length}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Thread triggers & Emoji Picker row */}
                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-3 text-[10px] text-slate-500">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setActiveThreadMsg(msg)}
                        className="font-bold text-violet-400 hover:text-violet-300 transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3 h-3 text-violet-450" />
                        <span>
                          {msg.repliesCount 
                            ? `View thread responses (${msg.repliesCount})` 
                            : 'Reply in thread'
                          }
                        </span>
                      </button>
                      <button 
                        onClick={() => {
                          const mockShareText = `Shared link reference to thread ID: "${msg.id}"`;
                          setUploadNotification(mockShareText);
                          setTimeout(() => setUploadNotification(null), 3000);
                        }}
                        className="hover:text-slate-200 transition-colors cursor-pointer"
                      >
                        Share thread
                      </button>
                    </div>

                    {/* Quick custom reaction picker */}
                    <div className="flex items-center gap-1 bg-[#141b2b] border border-slate-800/80 rounded-lg p-1 py-0.5 select-none opacity-40 hover:opacity-100 transition-opacity">
                      <span className="text-[9px] text-slate-655 px-1 font-mono tracking-wider font-bold">REACT:</span>
                      {['👍', '❤️', '🔥', '🚀', '🎉'].map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => handleToggleReaction(msg.id, emoji)}
                          className="hover:scale-130 transition-transform duration-100 p-1 hover:bg-slate-800/40 rounded text-[11px] leading-none cursor-pointer"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Typing indicators */}
          {isTyping && (
            <div className="px-6 py-1 text-[10px] text-slate-500 flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              <span>Sarah Chen is typing an enterprise report...</span>
            </div>
          )}

          {/* Active Audio Huddle Deck */}
          {activeHuddle && (
            <div className="mx-4 mb-2 p-3.5 rounded-xl border border-emerald-500/30 bg-[#0e1b19] shadow-xl shadow-emerald-950/20 flex flex-col md:flex-row md:items-center justify-between gap-3 animate-fadeIn" id="active-huddle-room">
              <div className="flex items-center gap-3">
                {/* Wave indicator / video mini stream bubble */}
                <div className="relative shrink-0">
                  {huddleVideoActive ? (
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-950 border border-emerald-400 flex items-center justify-center relative shadow-lg">
                      {/* Interactive CSS scanner mesh to mimic camera */}
                      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 via-transparent to-green-950/30 animate-pulse" />
                      <div className="absolute top-0.5 left-1 text-[8px] font-mono text-emerald-400 bg-black/60 px-1 rounded uppercase tracking-wider scale-90">LIVE FEED</div>
                      <img src={currentUser.avatar} alt="You" className="w-10 h-10 rounded-full object-cover scale-110 opacity-80 animate-pulse" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-500/20 flex items-center justify-center shadow-inner">
                      <PhoneCall className="w-5 h-5 text-emerald-400 animate-pulse" />
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0e1b19] flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping opacity-75" />
                  </span>
                </div>

                {/* Left labels: duration and speaking indicators */}
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-xs text-white">Active SQ-9 Voice Huddle</h5>
                    <span className="text-[10px] font-mono bg-emerald-950/65 px-2 py-0.5 rounded-full text-emerald-400 border border-emerald-900/30">
                      {formatHuddleTime(huddleDuration)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-[10px] text-slate-300 font-medium">Sarah Chen (You)</span>
                    </div>
                    <span className="text-slate-600 font-mono text-[9px]">&bull;</span>
                    {/* Fake speaker activity simulation */}
                    <span className="text-[10px] text-emerald-400 animate-pulse">David is sketching workflow concepts...</span>
                  </div>
                </div>
              </div>

              {/* Action controller cluster */}
              <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
                {/* Mute button */}
                <button
                  type="button"
                  onClick={() => setHuddleMuted(!huddleMuted)}
                  className={`p-2 rounded-lg cursor-pointer transition ${
                    huddleMuted 
                      ? 'bg-rose-600/25 hover:bg-rose-600/35 border border-rose-500/40 text-rose-400' 
                      : 'bg-slate-900 border border-slate-800 hover:bg-slate-850 text-emerald-400'
                  }`}
                  title={huddleMuted ? "Unmute Microphone" : "Mute Microphone"}
                >
                  {huddleMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Video toggle button */}
                <button
                  type="button"
                  onClick={() => setHuddleVideoActive(!huddleVideoActive)}
                  className={`p-2 rounded-lg cursor-pointer transition ${
                    huddleVideoActive 
                      ? 'bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-white' 
                      : 'bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-400'
                  }`}
                  title={huddleVideoActive ? "Disable Camera" : "Enable Camera"}
                >
                  {huddleVideoActive ? <Video className="w-4 h-4 text-emerald-400" /> : <VideoOff className="w-4 h-4" />}
                </button>

                {/* Screen share button */}
                <button
                  type="button"
                  onClick={() => setHuddleScreenShare(!huddleScreenShare)}
                  className={`p-2 rounded-lg cursor-pointer transition ${
                    huddleScreenShare 
                      ? 'bg-indigo-650 hover:bg-indigo-600 border border-indigo-500/40 text-white' 
                      : 'bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-400'
                  }`}
                  title={huddleScreenShare ? "Stop Sharing Screen" : "Share Screen"}
                >
                  <MonitorUp className="w-4 h-4" />
                </button>

                {/* Divider */}
                <span className="w-px h-6 bg-slate-805 mx-1 block" />

                {/* Join code / link */}
                <span className="text-[9px] font-mono text-slate-505 bg-slate-950/60 p-2 rounded-lg border border-slate-850 select-none block max-w-[120px] truncate">
                  URI: hdl.core.main
                </span>

                {/* Leave trigger button */}
                <button
                  type="button"
                  onClick={() => setActiveHuddle(false)}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg cursor-pointer transition shadow hover:shadow-rose-900/10"
                >
                  Leave
                </button>
              </div>
            </div>
          )}

          {/* Messaging input footer - Proper Slack-style Rich Markdown Editor */}
          <div className="p-2.5 sm:p-4 border-t border-slate-800/60 bg-slate-950/40" id="rich-chat-editor-container">
            {(isChatLoading || chatApiError) && (
              <div className={`mb-2 text-[11px] font-mono ${chatApiError ? 'text-rose-400' : 'text-cyan-400'}`}>
                {chatApiError || 'Messages backend se load ho rahe hain...'}
              </div>
            )}
            <form onSubmit={handleSendMessage} className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden focus-within:border-violet-500/80 transition-all duration-150 shadow-lg">
              
              {/* Toolbar Section */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-[#0b0f19] border-b border-slate-800/80 select-none">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Styling Buttons */}
                  <button
                    type="button"
                    onClick={() => handleInsertFormat('bold')}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
                    title="Bold (*text* / Ctrl+B)"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertFormat('italic')}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
                    title="Italic (_text_ / Ctrl+I)"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertFormat('code')}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
                    title="Inline Code (`code` / Ctrl+`)"
                  >
                    <Code className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertFormat('codeblock')}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
                    title="Snippet Block (```code```)"
                  >
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertFormat('bullet')}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
                    title="Bullet List (- item)"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertFormat('quote')}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
                    title="Blockquote (> quote)"
                  >
                    <Quote className="w-3.5 h-3.5 text-indigo-400" />
                  </button>

                  <span className="w-px h-4 bg-slate-800 mx-1 block" />

                  {/* Paperclip upload trigger */}
                  <button
                    type="button"
                    onClick={() => chatFileInputRef.current?.click()}
                    className="p-1.5 text-indigo-400 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
                    title="Upload Files & Media"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                  </button>
                  <input 
                    type="file"
                    ref={chatFileInputRef}
                    onChange={handleChatFileSelect}
                    multiple
                    className="hidden"
                    id="chat-media-file-input"
                  />

                  <span className="w-px h-4 bg-slate-800 mx-1 block" />

                  {/* Template macro presets */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded text-slate-300 hover:text-white text-[10.5px] font-bold cursor-pointer transition"
                    >
                      <Sparkles className="w-3 h-3 text-violet-400" />
                      <span className="hidden sm:inline">Macros & Templates</span>
                      <span className="sm:hidden">Macros</span>
                      <ChevronDown className="w-3 h-3 text-slate-500" />
                    </button>

                    {isTemplateMenuOpen && (
                      <div className="absolute left-0 bottom-full mb-2 bg-[#0e1626] border border-slate-800 rounded-lg shadow-2xl w-56 py-1.5 z-45 animate-fade-in text-slate-200">
                        <div className="px-3 py-1 font-mono uppercase tracking-wider text-[9px] text-[#818CF8] bg-slate-950/40 rounded-t-lg mb-1">Insert Workspace Macro</div>
                        <button
                          type="button"
                          onClick={() => handleInsertTemplate('standup')}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-800/80 text-xs flex items-center gap-2 cursor-pointer transition text-slate-200"
                        >
                          <span>🗓️</span>
                          <span className="truncate">Daily Standup Update</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertTemplate('bug')}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-800/80 text-xs flex items-center gap-2 cursor-pointer transition text-slate-200"
                        >
                          <span>🐛</span>
                          <span className="truncate">Bug Report Form</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertTemplate('code')}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-800/80 text-xs flex items-center gap-2 cursor-pointer transition text-slate-200"
                        >
                          <span>💻</span>
                          <span className="truncate">TypeScript Code Refactor</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertTemplate('meeting')}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-800/80 text-xs flex items-center gap-2 cursor-pointer transition text-slate-200"
                        >
                          <span>📝</span>
                          <span className="truncate">Meeting Action Items</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Clear Draft */}
                  {(chatInput || stagedFiles.length > 0) && (
                    <button
                      type="button"
                      onClick={() => {
                        setChatInput('');
                        setStagedFiles([]);
                      }}
                      className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded cursor-pointer transition"
                      title="Clear draft and attachments"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Toggle Preview Button */}
                  <button
                    type="button"
                    onClick={() => setIsPreviewActive(!isPreviewActive)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10.5px] font-bold cursor-pointer transition ${isPreviewActive ? 'bg-violet-650 text-white shadow-md' : 'bg-slate-905 border border-slate-800 text-slate-300 hover:bg-slate-800'}`}
                    title="Toggle formatted Markdown preview"
                  >
                    {isPreviewActive ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-violet-300" />
                         <span className="hidden sm:inline">Edit Draft</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-violet-400" />
                         <span className="hidden sm:inline">Preview Draft</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* WhatsApp-style Staged Attachments list */}
              {stagedFiles.length > 0 && (
                <div className="flex gap-3.5 overflow-x-auto p-3.5 bg-slate-950/20 border-b border-slate-850 select-none animate-fadeIn">
                  {stagedFiles.map((sf) => {
                    const isImg = sf.file.type.startsWith('image/');
                    return (
                      <div 
                        key={sf.id} 
                        className="relative group flex items-center gap-2.5 p-2 bg-slate-900 border border-slate-800 rounded-lg shrink-0 max-w-[200px]"
                      >
                        {isImg && sf.previewUrl ? (
                          <img 
                            src={sf.previewUrl} 
                            alt={sf.file.name} 
                            className="w-10 h-10 object-cover rounded-md border border-slate-755" 
                          />
                        ) : (
                          <div className="w-10 h-10 bg-slate-805 rounded-md border border-slate-755 flex items-center justify-center">
                            <Paperclip className="w-4 h-4 text-indigo-400" />
                          </div>
                        )}
                        <div className="text-[10px] min-w-0 flex-1">
                          <span className="font-bold text-slate-200 block truncate leading-tight" title={sf.file.name}>
                            {sf.file.name}
                          </span>
                          <span className="text-slate-500 font-mono text-[9px] block">
                            {(sf.file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                        {/* Remove staged file button */}
                        <button
                          type="button"
                          onClick={() => {
                            setStagedFiles(prev => prev.filter(x => x.id !== sf.id));
                          }}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center text-[8px] font-bold shadow cursor-pointer transition-transform group-hover:scale-110"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Editor Workspace Area (Textarea vs Preview Node) */}
              <div className="p-3 bg-[#111827]">
                {isPreviewActive ? (
                  // Preview mode view panel
                  <div className="min-h-[72px] max-h-48 overflow-y-auto p-3.5 bg-slate-950/40 rounded-lg border border-indigo-950/45 animate-fade-in relative text-slate-300">
                    <span className="absolute top-1.5 right-2 text-[9px] font-mono text-indigo-400 uppercase tracking-widest bg-indigo-950/40 px-1.5 rounded select-none">
                      🔬 Rendered Live Preview
                    </span>
                    {chatInput ? (
                        parseSlackMarkdown(chatInput)
                    ) : (
                      <span className="text-slate-500 italic text-xs block pt-2">Nothing to preview. Start typing formatting shortcuts to see outputs...</span>
                    )}
                  </div>
                ) : (
                  // Real-time Textarea editor
                  <div className="relative">
                    <textarea
                      id="slack-chat-textarea"
                      rows={3}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={activeChatType === 'channel' ? `Message #${selectedChannel.name}... (Press Shift+Enter for new lines, @name to mention, Ctrl+B for bold)` : `Write secure message to ${selectedDmUser?.name || 'User'}...`}
                      className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-xs focus:outline-none resize-none leading-relaxed font-sans"
                    />

                    {/* Mentions Hint Helper */}
                    {!chatInput && (
                  <div className="hidden sm:block absolute right-0 bottom-0 text-[10px] text-slate-500 font-mono select-none pointer-events-none">
                        Shift+Enter for newline
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Status footer inside the rich editor bar */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-3 py-1.5 bg-[#0b0f19]/70 border-t border-slate-850 select-none text-[10px] text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline"><strong>Markdown Active:</strong> *bold* &bull; _italic_ &bull; \`code\` &bull; \`\`\`snippet\`\`\`</span>
                  {chatInput && (
                    <span className="bg-slate-900 border border-slate-800 px-1.5 py-0.2 rounded font-mono text-[9px] text-slate-400">
                      {chatInput.length} characters &bull; {chatInput.split('\n').filter(Boolean).length} lines
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                   <span className="hidden md:inline text-[10px] text-[#475569] font-mono">
                    Target: {activeChatType === 'channel' ? `#${selectedChannel.name}` : `@${selectedDmUser?.name}`}
                  </span>
                  <button 
                    type="submit" 
                    disabled={!chatInput.trim() && stagedFiles.length === 0}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded font-bold text-xs transition cursor-pointer ${(chatInput.trim() || stagedFiles.length > 0) ? 'bg-indigo-600 hover:bg-indigo-400 text-white shadow-md' : 'bg-slate-800 text-slate-505 cursor-not-allowed'}`}
                    title="Send message"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </form>
            {chatSettings.messageExpiry !== 'none' && (
              <div className="mt-1.5 text-[10px] text-indigo-400 font-mono text-center">
                ⏱️ Message auto-deleted enabled: Clears after {chatSettings.messageExpiry === '24h' ? '24 hours' : '7 days'}.
              </div>
            )}
          </div>

          {/* WhatsApp-style full-screen files drag/drop overlay cover */}
          {chatIsDragging && (
            <div className="absolute inset-0 bg-[#070b14]/90 backdrop-blur-sm border-2 border-dashed border-violet-500/50 flex flex-col items-center justify-center p-6 z-50 pointer-events-none animate-fadeIn">
              <div className="w-20 h-20 rounded-full bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 animate-[bounce_1.5s_infinite]">
                <Upload className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">Drop files & media to share</h3>
              <p className="text-xs text-slate-400 mt-1.5 max-w-xs text-center leading-normal">
                Release your assets to stage them for secure transmission instantly, WhatsApp-style. Docs, sheets, images, and archives are all supported.
              </p>
            </div>
          )}

        </main>
      )}

      {/* 3. NOTION-SPEC DOCUMENT EDITOR OR SECURE DRIVE */}
      {currentTab === 'document' && (
        <main className="min-w-0 flex-1 flex flex-col bg-slate-900" id="docs-viewport-root">
          
          {/* Header Row */}
          <div className="p-4 sm:px-6 border-b border-slate-800/60 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-slate-950/20" id="doc-editor-heading">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest block">Resource Space</span>
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-800/80 p-0.5 rounded-lg select-none overflow-x-auto max-w-full">
                <button
                  onClick={() => setDocSubTab('specs')}
                  className={`px-3 py-1 rounded text-[10.5px] font-bold select-none cursor-pointer transition ${docSubTab === 'specs' ? 'bg-[#1E293B] text-white font-extrabold shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  📄 Notion Confluence Specs
                </button>
                <button
                  onClick={() => setDocSubTab('drive')}
                  className={`px-3 py-1 rounded text-[10.5px] font-bold select-none cursor-pointer transition ${docSubTab === 'drive' ? 'bg-[#1E293B] text-white font-extrabold shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  📁 Secure Cloud Drive Vault
                </button>
              </div>
            </div>

            {/* Title / Action bar */}
            <div className="flex items-center gap-2">
              {docSubTab === 'specs' ? (
                <>
                  <span className="text-slate-500 text-[10px] sm:text-[11px] font-mono hidden sm:inline">Last active edit by {selectedDoc.updatedBy.name}</span>
                  <button 
                    onClick={() => handleInsertSlashBlock('bullet')}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold rounded cursor-pointer"
                  >
                    + Insert Block
                  </button>
                </>
              ) : (
                <div className="p-1 px-2.5 bg-[#0A101D] border border-slate-850 rounded-lg text-[10px] font-mono text-cyan-400 font-bold tracking-tight">
                  🔒 End-to-End Isolated AES-256 Vault
                </div>
              )}
            </div>
          </div>

          {docSubTab === 'specs' ? (
            /* ==================== SUBTAB: NOTION DOC SPEC BLOCK EDITOR ==================== */
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-3xl mx-auto w-full space-y-6 relative animate-fade-in" id="notion-block-editor">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-800/40">
                <span className="text-2xl">{selectedDoc.emoji}</span>
                <div>
                  <h1 className="text-lg font-bold text-white tracking-tight">{selectedDoc.title}</h1>
                  <p className="text-[10px] text-slate-500 mt-0.5">Secure collaborative specification ledger inside enterprise sandbox.</p>
                </div>
              </div>

              <div className="space-y-4" id="notion-blocks-list">
                {selectedDoc.blocks.map((block, bIdx) => (
                  <div key={block.id} className="relative group/block pl-3 sm:pl-6 pr-3 sm:pr-24 py-1 hover:bg-slate-850/15 rounded-lg transition-all" id={`block-${block.id}`}>
                    
                    {/* Collaborative Block Actions floating bar on hover */}
                    <div className="static mb-2 flex w-fit items-center gap-1.5 bg-slate-950/80 border border-slate-800 p-1.5 py-1 rounded-lg z-10 select-none sm:absolute sm:right-2 sm:top-1.5 sm:mb-0 sm:opacity-0 sm:group-hover/block:opacity-100 transition-opacity">
                      {/* Move Up/Down actions */}
                      <button 
                        onClick={() => handleMoveBlock(bIdx, 'up')}
                        disabled={bIdx === 0}
                        className="p-1 hover:text-white text-slate-500 disabled:opacity-20 cursor-pointer transition-transform active:scale-90"
                        title="Move Block Up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleMoveBlock(bIdx, 'down')}
                        disabled={bIdx === selectedDoc.blocks.length - 1}
                        className="p-1 hover:text-white text-slate-500 disabled:opacity-20 cursor-pointer transition-transform active:scale-90"
                        title="Move Block Down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      
                      {/* Quick block style direct transformer dropdown */}
                      <select
                        value={block.type}
                        onChange={(e) => handleChangeBlockType(bIdx, e.target.value as any)}
                        className="bg-slate-900 text-slate-300 font-mono text-[9px] border border-slate-800 rounded p-0.5 focus:outline-none cursor-pointer"
                        title="Transform Block Style Type"
                      >
                        <option value="text">Text</option>
                        <option value="heading1">H1 title</option>
                        <option value="heading2">H2 subtitle</option>
                        <option value="bullet">Bullet</option>
                        <option value="checklist">Checked</option>
                        <option value="code">Code</option>
                        <option value="callout">Callout</option>
                      </select>

                      {/* Deletion bin button action */}
                      <button 
                        onClick={() => handleDeleteBlock(bIdx)}
                        className="p-1 hover:text-rose-455 text-slate-500 transition-colors cursor-pointer"
                        title="Delete Block"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      </button>
                    </div>

                    {/* Inline Edit form fallback */}
                    {activeEditingBlockId === block.id ? (
                      <div className="flex items-center gap-2">
                        <textarea
                          value={blockEditingText}
                          onChange={(e) => setBlockEditingText(e.target.value)}
                          className="w-full bg-[#1a2030] text-xs text-slate-100 p-2 rounded focus:outline-none focus:border-violet-500 font-sans"
                          rows={2}
                          autoFocus
                        />
                        <button 
                          onClick={() => handleSaveBlockEdit(block.id)}
                          className="px-3 py-1.5 bg-emerald-600 text-white font-extrabold rounded text-[11px] cursor-pointer shadow hover:bg-emerald-550"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div onClick={() => handleSelectEditingBlock(block)} className="cursor-text p-1 rounded transition-all">
                        
                        {block.type === 'heading1' && (
                          <h1 className="text-xl font-extrabold font-sans text-white tracking-tight leading-tight select-text py-0.8">{block.content}</h1>
                        )}

                        {block.type === 'heading2' && (
                          <h2 className="text-sm font-bold font-sans text-slate-200 tracking-tight leading-snug select-text pt-2 pb-0.8 border-b border-slate-800/15">{block.content}</h2>
                        )}

                        {block.type === 'text' && (
                          <p className="text-xs text-slate-300 leading-relaxed font-sans select-text">{block.content}</p>
                        )}

                        {block.type === 'bullet' && (
                          <div className="flex gap-2 items-start text-xs text-slate-300 select-text">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0 animate-pulse" />
                            <span>{block.content}</span>
                          </div>
                        )}

                        {block.type === 'checklist' && (
                          <div className="flex gap-2 items-center text-xs text-slate-300 select-none">
                            <input 
                              type="checkbox" 
                              checked={block.checked || false}
                              onChange={() => handleToggleChecklist(block.id)}
                              className="w-4 h-4 rounded accent-violet-500 text-slate-900 cursor-pointer"
                              onClick={(e) => e.stopPropagation()} 
                            />
                            <span className={`select-text ${block.checked ? 'line-through text-slate-500 font-serif' : ''}`}>{block.content}</span>
                          </div>
                        )}

                        {block.type === 'code' && (
                          <pre className="p-3.5 rounded-xl bg-slate-950 text-[11px] text-emerald-400 font-mono border border-slate-850/80 overflow-x-auto relative group-hover/block:border-emerald-950/40 transition-colors">
                            <span className="absolute top-1 right-2 text-[8px] text-slate-600 uppercase font-bold select-none tracking-widest font-mono">TS / JS</span>
                            <code>{block.content}</code>
                          </pre>
                        )}

                        {block.type === 'callout' && (
                          <div className="p-3.5 rounded-xl bg-violet-955/20 border border-violet-900/30 text-xs text-violet-300 flex items-start gap-2 max-w-2xl">
                            <Sparkles className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                            <span className="select-text">{block.content}</span>
                          </div>
                        )}

                      </div>
                    )}

                    <span className="absolute -left-5 top-2.5 text-[9px] text-slate-600 font-mono opacity-0 group-hover/block:opacity-40 select-none cursor-grab">
                      ::
                    </span>
                  </div>
                ))}
              </div>

              {/* Simulated slash command suggestions */}
              <div className="mt-8 border-t border-slate-800/40 pt-4" id="slash-triggers-block">
                <span className="text-[10px] text-slate-500 font-mono block">Type or select formatting block structures down:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  <button 
                    onClick={() => handleInsertSlashBlock('heading1')}
                    className="p-2 py-1 bg-slate-850 hover:bg-slate-800 text-[10px] rounded font-mono text-slate-400"
                  >
                    /heading1
                  </button>
                  <button 
                    onClick={() => handleInsertSlashBlock('heading2')}
                    className="p-2 py-1 bg-slate-850 hover:bg-slate-800 text-[10px] rounded font-mono text-slate-400"
                  >
                    /heading2
                  </button>
                  <button 
                    onClick={() => handleInsertSlashBlock('checklist')}
                    className="p-2 py-1 bg-slate-850 hover:bg-slate-800 text-[10px] rounded font-mono text-slate-400"
                  >
                    /checklist
                  </button>
                  <button 
                    onClick={() => handleInsertSlashBlock('code')}
                    className="p-2 py-1 bg-slate-850 hover:bg-slate-800 text-[10px] rounded font-mono text-slate-400"
                  >
                    /code-block
                  </button>
                  <button 
                    onClick={() => handleInsertSlashBlock('callout')}
                    className="p-2 py-1 bg-slate-850 hover:bg-slate-800 text-[10px] rounded font-mono text-slate-400"
                  >
                    /callout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ==================== SUBTAB: SECURE CLOUD DRIVE VAULT & FILES ==================== */
            <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in" id="secure-cloud-drive-vault-root">
              
              {/* Upper dynamic statistic summary row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Isolated Storage Load</span>
                    <span className="text-base font-extrabold text-slate-100 block mt-1">39.4 MB / 2.0 GB</span>
                    <div className="w-32 bg-slate-900 border border-slate-850 h-1 rounded-full mt-2 overflow-hidden">
                      <div className="bg-cyan-500 h-full rounded-full" style={{ width: '4%' }} />
                    </div>
                  </div>
                  <HardDrive className="w-8 h-8 text-cyan-400 border border-slate-800 p-1.5 rounded-lg bg-slate-900" />
                </div>

                <div className="p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Security Quarantine Logs</span>
                    <span className="text-base font-extrabold text-slate-100 block mt-1">Status: Fully Green</span>
                    <span className="text-[10px] text-[#06D6A0] font-mono mt-1.5 block">Static & dynamic scan active</span>
                  </div>
                  <Lock className="w-8 h-8 text-emerald-400 border border-slate-800 p-1.5 rounded-lg bg-slate-900" />
                </div>

                <div className="p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Federated Keyrings</span>
                    <span className="text-base font-extrabold text-slate-100 block mt-1">AES-256 Enabled</span>
                    <span className="text-[10px] text-slate-500 mt-1.5 block font-sans">Complies with ISO-27001</span>
                  </div>
                  <Users className="w-8 h-8 text-violet-400 border border-slate-800 p-1.5 rounded-lg bg-slate-900" />
                </div>
              </div>

              {/* Filtering Controls Bar */}
              <div className="p-4 bg-slate-950/35 border border-slate-850/80 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
                <input 
                  type="text"
                  placeholder="Search repository files, certs, specs, codes..."
                  value={vaultSearchQuery}
                  onChange={e => setVaultSearchQuery(e.target.value)}
                  className="bg-[#080d1a] border border-slate-850 px-3 py-1.5 rounded-lg text-xs w-full md:max-w-xs focus:outline-none focus:border-cyan-500/50 text-slate-200"
                />

                <div className="flex flex-wrap gap-1 items-center">
                  <span className="text-[10.5px] text-slate-500 font-mono mr-1.5 hidden lg:inline">Filters:</span>
                  {['All', 'Compliance', 'Technical Specs', 'Creative Assets', 'SecOps Keyring'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setVaultSelectedCategory(cat)}
                      className={`px-2.5 py-1 text-[10.5px] font-semibold rounded-md border cursor-pointer select-none transition ${vaultSelectedCategory === cat ? 'bg-[#1E293B] border-slate-700 text-cyan-300' : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-white'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Drag/Drop Workspace Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* UPLOADER PORTAL */}
                <div className="lg:col-span-4 space-y-3.5">
                  <h4 className="text-[10.5px] font-mono font-bold text-slate-500 uppercase tracking-wider pl-1">Compliance Sandbox Uploader</h4>
                  
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDropUpload}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all relative ${isDragOverUpload ? 'border-cyan-400 bg-cyan-955/20 scale-[1.01]' : 'border-slate-800 bg-slate-950/30 hover:border-slate-700'}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      const input = document.getElementById('manual-drive-file-input');
                      if (input) input.click();
                    }}
                  >
                    {/* Native Form trigger helper */}
                    <input 
                      type="file" 
                      id="manual-drive-file-input" 
                      className="hidden" 
                      onChange={handleManualFileUploadSelection} 
                    />

                    {activeUploadProgress !== null ? (
                      <div className="py-4 space-y-3" id="drive-uploader-activity">
                        <RefreshCw className="w-7 h-7 text-cyan-400 animate-spin mx-auto" />
                        <div>
                          <span className="text-xs font-bold text-slate-200 block truncate">Uploading: {activeUploadName}</span>
                          <span className="text-[10px] text-slate-500 mt-0.5 block font-mono">Verifying cybersecurity SHA-2 hashes... {activeUploadProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-900 border border-slate-850 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-cyan-400 h-full rounded-full transition-all duration-155" style={{ width: `${activeUploadProgress}%` }} />
                        </div>
                      </div>
                    ) : (
                      <div className="py-3 space-y-2.5 select-none group" id="drive-uploader-standard">
                        <UploadCloud className="w-8 h-8 text-indigo-400 mx-auto group-hover:scale-110 active:scale-95 transition-all duration-200" />
                        <div>
                          <span className="text-xs font-bold text-slate-200 block">Drag & Drop visual asset</span>
                          <span className="text-[10px] text-slate-400 mt-1 block leading-relaxed px-2">
                            or <span className="text-[#818CF8] font-bold underline">browse native drive</span> to execute quarantine inspection
                          </span>
                        </div>
                        <div className="text-[9px] text-slate-500 font-mono pt-3 border-t border-slate-900 select-none">
                          PDF, XLS, ZIP, PEM structures &bull; Max 50MB
                        </div>
                      </div>
                    )}
                  </div>

                  {uploadNotification && (
                    <div className="p-3 bg-emerald-950/35 border border-emerald-520/20 text-emerald-300 text-[10.5px] rounded-lg animate-fade-in flex items-start gap-2 select-text">
                      <span className="text-xs shrink-0 mt-0.5">⚡</span>
                      <span>{uploadNotification}</span>
                    </div>
                  )}
                </div>

                {/* FILE SYSTEM RECORDS VIEW */}
                <div className="lg:col-span-8 space-y-3">
                  <div className="flex items-center justify-between pl-1">
                    <h4 className="text-[10.5px] font-mono font-bold text-slate-500 uppercase tracking-wider">SECURE FILE RECORDS</h4>
                    <span className="text-[10px] text-slate-500 font-mono">Showing {
                      vaultFiles.filter(f => {
                        const matchQuery = f.name.toLowerCase().includes(vaultSearchQuery.toLowerCase());
                        const matchCat = vaultSelectedCategory === 'All' || f.category === vaultSelectedCategory;
                        return matchQuery && matchCat;
                      }).length
                    } of {vaultFiles.length} files</span>
                  </div>

                  <div className="space-y-2.5" id="vault-records-deck">
                    {vaultFiles.filter(f => {
                      const matchQuery = f.name.toLowerCase().includes(vaultSearchQuery.toLowerCase());
                      const matchCat = vaultSelectedCategory === 'All' || f.category === vaultSelectedCategory;
                      return matchQuery && matchCat;
                    }).map(file => {
                      const renderTagBadge = () => {
                        switch (file.type) {
                          case 'excel':
                            return <div className="p-1 px-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-md font-mono shrink-0">XLS SHEET</div>;
                          case 'pdf':
                            return <div className="p-1 px-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold rounded-md font-mono shrink-0">PDF SPEC</div>;
                          case 'archive':
                            return <div className="p-1 px-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold rounded-md font-mono shrink-0">ZIP ARCHIVE</div>;
                          case 'key':
                            return <div className="p-1 px-2.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold rounded-md font-mono shrink-0">SSH KEY</div>;
                          default:
                            return <div className="p-1 px-2.5 bg-slate-500/10 border border-slate-500/20 text-slate-400 text-[10px] font-bold rounded-md font-mono shrink-0">BINARY</div>;
                        }
                      };

                      return (
                        <div 
                          key={file.id}
                          className="p-3 bg-[#0a0f1d] hover:bg-[#0f172a] border border-slate-850/80 rounded-xl transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            {renderTagBadge()}
                            <div className="min-w-0">
                              <span 
                                onClick={() => setSelectedPreviewFile(file)}
                                className="font-bold text-xs text-slate-200 hover:text-indigo-400 cursor-pointer block truncate"
                              >
                                {file.name}
                              </span>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[10px] text-slate-500 select-text font-sans">
                                <span className="bg-slate-900 border border-slate-850 px-1 rounded text-slate-400">{file.category}</span>
                                <span>&bull;</span>
                                <span>{file.size}</span>
                                <span>&bull;</span>
                                <span>Created: {file.timestamp}</span>
                                <span>&bull;</span>
                                <span className="text-slate-400 font-medium">Author: {file.author}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 shrink-0">
                            <span className="text-[10px] text-slate-500 font-mono hidden md:inline-block">Dls: {file.downloadCount}</span>
                            <button
                              onClick={() => setSelectedPreviewFile(file)}
                              className="p-1 px-2 bg-[#121a2e] hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded text-[10.5px] font-bold cursor-pointer transition"
                              title="Inspect content file coordinates"
                            >
                              Preview
                            </button>
                            <button
                              onClick={() => {
                                const updated = vaultFiles.map(v => v.id === file.id ? { ...v, downloadCount: v.downloadCount + 1 } : v);
                                setVaultFiles(updated);
                                setUploadNotification(`Secured download stream initiated for: "${file.name}". Hash tag checked successfully.`);
                                setTimeout(() => setUploadNotification(null), 4000);
                              }}
                              className="p-1 px-2 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-[#06D6A0] text-slate-450 rounded text-[10.5px] cursor-pointer transition"
                              title="Download ISO secure file asset"
                            >
                              <FileDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
              
              {/* FILE PREVIEW MODAL ZONE */}
              {selectedPreviewFile && (
                <div className="fixed inset-0 bg-[#020617]/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-[#0c1221] border border-slate-800/80 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-scale-up">
                    
                    {/* Header */}
                    <div className="p-4 bg-slate-950/80 border-b border-slate-850 flex items-center justify-between select-none">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] bg-indigo-950 border border-indigo-900/60 text-[#818CF8] font-mono px-2 py-0.5 rounded font-extrabold">SECURE PARSING PREVIEW</span>
                        <span className="font-extrabold text-[11px] text-slate-200 truncate max-w-xs">{selectedPreviewFile.name}</span>
                      </div>
                      <button 
                        onClick={() => setSelectedPreviewFile(null)} 
                        className="text-slate-500 hover:text-white p-1 rounded-md transition cursor-pointer"
                        title="Close preview"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Preview Area Grid */}
                    <div className="p-5 max-h-[380px] overflow-y-auto space-y-4 text-xs select-text leading-relaxed text-slate-350 font-sans">
                      
                      <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl grid grid-cols-2 gap-3 text-[10px] font-mono select-all">
                        <div>
                          <span className="text-slate-550 block text-[9px] uppercase tracking-wider">Cryptographic Token ID</span>
                          <span className="text-indigo-300 truncate block">{selectedPreviewFile.id}</span>
                        </div>
                        <div>
                          <span className="text-slate-550 block text-[9px] uppercase tracking-wider">Storage Scope Size</span>
                          <span className="text-slate-200 block">{selectedPreviewFile.size}</span>
                        </div>
                        <div>
                          <span className="text-slate-550 block text-[9px] uppercase tracking-wider">Access Signatory Seats</span>
                          <span className="text-[#06D6A0] block font-bold">{selectedPreviewFile.author} (Verified)</span>
                        </div>
                        <div>
                          <span className="text-slate-550 block text-[9px] uppercase tracking-wider">Server Upload DateTime</span>
                          <span className="text-slate-300 block">{selectedPreviewFile.timestamp}</span>
                        </div>
                      </div>

                      {/* XLS Spreadsheet detail simulation */}
                      {selectedPreviewFile.type === 'excel' && (
                        <div className="space-y-2 select-none">
                          <span className="text-[9.5px] font-mono text-slate-500 block uppercase font-bold">Encrypted Ledger Cells preview</span>
                          <div className="border border-slate-850 rounded-lg overflow-hidden font-sans">
                            <table className="w-full text-left text-[10.5px]">
                              <thead className="bg-[#0b0f19] text-slate-400 font-mono text-[9px]">
                                <tr>
                                  <th className="p-2 border-b border-slate-850">Row Index</th>
                                  <th className="p-2 border-b border-slate-850">Compliance Checkpoint Specs</th>
                                  <th className="p-2 border-b border-slate-850">Risk Evaluation Score</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-850 bg-slate-950/10 text-slate-300">
                                <tr>
                                  <td className="p-2 border-r border-slate-850 font-mono text-[9.5px]">0x00F1</td>
                                  <td className="p-2 border-r border-slate-850">Enterprise federated Active Directory integration parameters.</td>
                                  <td className="p-2 text-[#06D6A0] font-bold bg-[#06D6A0]/5">PASS (100)</td>
                                </tr>
                                <tr>
                                  <td className="p-2 border-r border-slate-850 font-mono text-[9.5px]">0x00F5</td>
                                  <td className="p-2 border-r border-slate-850">Multi-factor physical keys requirement policies.</td>
                                  <td className="p-2 text-[#06D6A0] font-bold bg-[#06D6A0]/5">PASS (100)</td>
                                </tr>
                                <tr>
                                  <td className="p-2 border-r border-slate-850 font-mono text-[9.5px]">0x00FA</td>
                                  <td className="p-2 border-r border-slate-850">TLS secure proxy configurations mapping browser client keys.</td>
                                  <td className="p-2 text-rose-400 font-bold bg-rose-500/5">WARNING (40)</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* PDF Spec description simulation */}
                      {selectedPreviewFile.type === 'pdf' && (
                        <div className="space-y-2">
                          <span className="text-[9.5px] font-mono text-slate-500 block uppercase font-bold">Isolated PDF OCR parsing</span>
                          <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-850 text-slate-300 text-xs space-y-2">
                            <h4 className="font-extrabold text-white text-xs">Standard Mapping Requirements for Group SCIM Sync</h4>
                            <p>This technical mapping documentation identifies roles and groups parsing procedures for automated synchronization configurations inside our Okta integration.</p>
                            <p>Administrators should configure IAM tokens on the security console to isolate key parameters. Under no circumstances should client authorization secrets remain exposed inside socket buffers.</p>
                          </div>
                        </div>
                      )}

                      {/* KEY block rendering */}
                      {selectedPreviewFile.type === 'key' && (
                        <div className="space-y-2">
                          <span className="text-[9.5px] font-mono text-slate-500 block uppercase font-bold">PEM Key block reader</span>
                          <pre className="p-3 bg-slate-950 text-emerald-400 font-mono text-[10px] rounded-lg border border-slate-850 overflow-x-auto leading-relaxed select-all">
{`-----BEGIN PRIVATE TRUST CERTIFICATE-----
MIIEpQIBAAKCAQEA0X1W5b8fC3A7d8s9C4M3L2R5T6Y8p9O0KeyRingSecure
+Vb3z9Y7B8N9A6C2m5P4o3r2s1h8X7f6d5c4B3y2x1m9k8J7H6F5D4S3A2W1
9X8P7N6M5L4K3J2I1H0G9F8E7D6C5B4A3Z2Y1X0W9V8U7T6S5R4Q3P2O1N0
... Verification Block Signatories ISO certified audit logs ...
D6F5E4D3C2B1A9G8F7E6D5C4B3A2Z1M0P9O8N7M6L5K4J3I2H1G0F9E8D7C6B
-----END PRIVATE TRUST CERTIFICATE-----`}
                          </pre>
                        </div>
                      )}

                      {/* ZIP bundle folder hierarchy rendering */}
                      {selectedPreviewFile.type === 'archive' && (
                        <div className="space-y-2">
                          <span className="text-[9.5px] font-mono text-slate-500 block uppercase font-bold">Uncompressed Directory Tree schema</span>
                          <div className="p-3 bg-[#080d1a] border border-slate-850 rounded-lg space-y-1.5 font-mono text-[10.5px] text-[#818CF8] select-none">
                            <div>📦 figma-branding-layout-assets.zip</div>
                            <div className="pl-4 text-slate-500">&gt; index.html (2.4 KB)</div>
                            <div className="pl-4 text-slate-400 font-bold">&gt; assets/logo-flat-white.svg (312 KB)</div>
                            <div className="pl-4 text-slate-500">&gt; assets/global-branding-guidelines.css (104 KB)</div>
                            <div className="pl-4 text-slate-505">&gt; configuration-okta-oauth.json (2.1 KB)</div>
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Footer */}
                    <div className="p-3.5 bg-slate-950/75 border-t border-slate-850 flex items-center justify-end gap-2 text-xs select-none">
                      <button 
                        onClick={() => setSelectedPreviewFile(null)}
                        className="px-3.5 py-1.5 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded cursor-pointer font-bold transition"
                      >
                        Close
                      </button>
                      <button 
                        onClick={() => {
                          const updated = vaultFiles.map(v => v.id === selectedPreviewFile.id ? { ...v, downloadCount: v.downloadCount + 1 } : v);
                          setVaultFiles(updated);
                          setSelectedPreviewFile(null);
                          setUploadNotification(`Mock Download triggered for: "${selectedPreviewFile.name}".`);
                          setTimeout(() => setUploadNotification(null), 3500);
                        }}
                        className="px-4 py-1.5 bg-indigo-650 hover:bg-indigo-600 text-white rounded cursor-pointer font-extrabold shadow shadow-indigo-950/20"
                      >
                        Verify Signatory Download
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

        </main>
      )}

      {/* 4. LINEAR-SPEC TASK KANBAN BOARD */}
      {currentTab === 'tasks' && (
        <main className="min-w-0 flex-1 flex flex-col bg-[#0F172A]" id="tasks-viewport-root">
          
          <div className="p-4 sm:px-6 border-b border-slate-800/60 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-slate-950/20" id="tasks-kanban-heading">
            <div>
              <h2 className="text-sm font-bold text-white">Sprint Schedule Board</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Automated roadmap coordinates. Select cards or drag & drop to update columns.</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="font-mono text-[10px] bg-indigo-950 border border-indigo-900/40 text-indigo-400 px-3 py-1 rounded-lg font-bold">Sprint 24 (Active)</span>
            </div>
          </div>

          {/* Columns grid */}
          <div className="flex-1 overflow-x-auto p-4 sm:p-6 flex gap-4 items-start animate-fadeIn" id="kanban-grid-slider">
            
            {/* Columns list mapping */}
            {['backlog', 'todo', 'in_progress', 'done'].map((columnKey) => {
              const colTasks = liveTasks.filter(t => t.status === columnKey);
              const isOver = dragOverColumn === columnKey;

              return (
                <div 
                  key={columnKey} 
                  onDragOver={(e) => { e.preventDefault(); setDragOverColumn(columnKey); }}
                  onDragLeave={() => setDragOverColumn(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    const taskId = e.dataTransfer.getData('text/plain');
                    if (taskId) {
                      handleUpdateTaskStatus(taskId, columnKey as any);
                    }
                    setDragOverColumn(null);
                  }}
                  className={`w-[min(18rem,calc(100vw-5rem))] sm:w-72 shrink-0 bg-[#121B2E]/60 border rounded-xl p-4 flex flex-col max-h-[80vh] transition-all duration-200 ${
                    isOver 
                      ? 'border-violet-500 bg-[#17253D] scale-[1.01] shadow-xl shadow-violet-950/20 ring-1 ring-violet-500/30' 
                      : 'border-slate-850'
                  }`}
                >
                  
                  {/* Column Title header */}
                  <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-slate-800/40 select-none">
                    <div className="flex items-center gap-1.5 capitalize text-xs font-bold text-slate-300">
                      <span className={`w-1.5 h-1.5 rounded-full ${columnKey === 'done' ? 'bg-[#06D6A0]' : columnKey === 'in_progress' ? 'bg-violet-400' : 'bg-slate-500'}`} />
                      <span>{columnKey.replace('_', ' ')}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-500 font-bold bg-slate-900 border border-slate-800 px-1.5 py-0.2 rounded">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Cards stack */}
                  <div className="space-y-3 overflow-y-auto flex-1 pr-0.5" id={`kanban-col-${columnKey}`}>
                    {colTasks.map(task => (
                      <div 
                        key={task.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', task.id);
                        }}
                        onClick={() => setSelectedTask(task)}
                        className={`p-3.5 rounded-lg border bg-slate-900 hover:border-slate-700 hover:bg-[#142034] active:scale-95 active:rotate-1 transition-all duration-150 cursor-grab active:cursor-grabbing text-left space-y-2.5 relative group ${selectedTask?.id === task.id ? 'border-violet-500 ring-1 ring-violet-500/30 bg-[#131D31]' : 'border-slate-800/80'}`}
                        title="Drag this card to move between lists"
                      >
                        <h4 className="text-xs font-semibold text-slate-200 leading-tight line-clamp-2">{task.title}</h4>
                        
                        <div className="flex items-center justify-between mt-2 text-[10px]">
                          <span className={`px-1.5 py-0.2 rounded font-mono uppercase text-[8px] tracking-wider font-bold ${task.priority === 'urgent' ? 'bg-rose-950/40 text-rose-400 border border-rose-900/30' : task.priority === 'high' ? 'bg-amber-950/40 text-amber-400' : 'bg-slate-800 text-slate-450'}`}>
                            {task.priority}
                          </span>
                          <span className="text-slate-500 font-mono text-[9px]">{task.dueDate}</span>
                        </div>

                        {/* Inline Move column triggers quick sandbox */}
                        <div className="pt-2 border-t border-slate-850 mt-1 flex justify-between items-center text-[9px] text-slate-505 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[8px] text-slate-550 font-mono">MOVE TO:</span>
                          <div className="flex gap-1.5">
                            {columnKey !== 'todo' && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleUpdateTaskStatus(task.id, 'todo'); }}
                                className="px-1 py-0.2 rounded bg-slate-950/45 hover:text-white"
                              >
                                Todo
                              </button>
                            )}
                            {columnKey !== 'in_progress' && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleUpdateTaskStatus(task.id, 'in_progress'); }}
                                className="px-1 py-0.2 rounded bg-slate-950/45 hover:text-white"
                              >
                                Play
                              </button>
                            )}
                            {columnKey !== 'done' && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleUpdateTaskStatus(task.id, 'done'); }}
                                className="px-1 py-0.2 rounded bg-slate-950/45 hover:text-[#06D6A0]"
                              >
                                Done
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    ))}

                    {colTasks.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 border border-dashed border-slate-805/60 rounded-xl text-center p-4">
                        <span className="text-[10px] text-slate-600 block">Empty Column</span>
                        <span className="text-[9px] text-slate-700 mt-1">Drag task card here</span>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}

          </div>
        </main>
      )}

      {/* 4.5. INTERACTIVE VISUAL ANALYTICS PANEL */}
      {currentTab === 'analytics' && (
        <main className="min-w-0 flex-1 flex flex-col bg-[#0b0f19] overflow-y-auto" id="analytics-viewport-root animate-fadeIn">
          {/* Header */}
          <div className="p-5 px-6 border-b border-slate-900 flex items-center justify-between bg-slate-950/25">
            <div>
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider font-sans">Interactive Team Analytics</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">High-fidelity metrics, team agility velocity, system traffic logs, and node status.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              <span className="font-mono text-[9px] text-emerald-400 uppercase font-extrabold bg-emerald-950/20 px-2.5 py-1 rounded border border-emerald-900/30">Live telemetry</span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* KPI Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { title: 'Sprint Velocity', value: '47.5 pts', change: '+12%', label: 'Active Sprint 24', color: 'text-indigo-400' },
                { title: 'Response SLA', value: '2.8 mins', change: '-45s', label: 'Average chat feedback', color: 'text-cyan-400' },
                { title: 'Huddles Conducted', value: '18 sessions', change: 'Stable', label: 'This week huddle list', color: 'text-amber-400' },
                { title: 'Audit Readiness', value: '98.4%', change: 'Green', label: 'Compliance checklist pass', color: 'text-[#06D6A0]' }
              ].map((kpi, idx) => (
                <div key={idx} className="bg-[#121829] border border-slate-900 rounded-xl p-4 space-y-1 select-none">
                  <span className="text-[10px] font-mono text-slate-550 block font-bold uppercase">{kpi.title}</span>
                  <div className="flex items-baseline justify-between">
                    <span className={`text-lg font-black ${kpi.color}`}>{kpi.value}</span>
                    <span className="text-[9.5px] font-mono font-bold text-lime-400 bg-lime-950/10 px-1 py-0.2 rounded">{kpi.change}</span>
                  </div>
                  <span className="text-[9px] text-slate-500 block">{kpi.label}</span>
                </div>
              ))}
            </div>

            {/* Bento Grid Graphics */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Graphic 1: Velocity Curve */}
              <div className="lg:col-span-8 bg-[#121829] border border-slate-900 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">Squad Agile Performance Curve</h4>
                      <p className="text-[10px] text-slate-500">Completed backlog tasks vs. initial sprint estimation target</p>
                    </div>
                    <span className="text-[9.5px] font-mono bg-slate-950 border border-slate-850 p-1 rounded text-indigo-400 font-extrabold px-2">June 2026</span>
                  </div>

                  {/* SVG glowing velocity line graph */}
                  <div className="h-56 relative w-full pt-4">
                    <svg viewBox="0 0 500 200" className="w-full h-full stroke-indigo-500 fill-none" style={{ overflow: 'visible' }}>
                      {/* Grid Lines */}
                      <line x1="0" y1="50" x2="500" y2="50" stroke="#1c2438" strokeDasharray="3,3" strokeWidth="1" />
                      <line x1="0" y1="100" x2="500" y2="100" stroke="#1c2438" strokeDasharray="3,3" strokeWidth="1" />
                      <line x1="0" y1="150" x2="500" y2="150" stroke="#1c2438" strokeDasharray="3,3" strokeWidth="1" />
                      
                      {/* Performance line path */}
                      <path 
                        d="M 10,180 Q 100,140 180,90 T 350,110 T 490,40" 
                        stroke="url(#line-glow)" 
                        strokeWidth="3.5" 
                        strokeLinecap="round" 
                        className="animate-pulse"
                      />

                      {/* Expected projection path */}
                      <path 
                        d="M 10,185 L 120,150 L 240,110 L 360,80 L 490,45" 
                        stroke="#475569" 
                        strokeWidth="1.5" 
                        strokeDasharray="4,4" 
                      />

                      {/* Dots & Info Markers */}
                      {[
                        { cx: 10, cy: 180, label: 'W1: 12 pts' },
                        { cx: 120, cy: 135, label: 'W2: 24 pts' },
                        { cx: 240, cy: 100, label: 'W3: 41 pts' },
                        { cx: 360, cy: 102, label: 'W4: 51 pts' },
                        { cx: 490, cy: 40, label: 'Sprint End: 84 pts' }
                      ].map((pt, i) => (
                        <g key={i} className="group cursor-pointer">
                          <circle cx={pt.cx} cy={pt.cy} r="5" fill="#6366F1" stroke="#0b0f19" strokeWidth="2" className="hover:scale-125 transition-transform" />
                          <circle cx={pt.cx} cy={pt.cy} r="9" stroke="#6366F1" strokeWidth="1.2" className="animate-ping opacity-20" />
                          {/* Rich inline dynamic HTML tooltip on hover */}
                          <text x={pt.cx} y={pt.cy - 12} textAnchor="middle" fill="#CBD5E1" className="text-[8.5px] font-mono font-bold bg-slate-950 opacity-0 group-hover:opacity-100 transition-opacity">
                            {pt.label}
                          </text>
                        </g>
                      ))}

                      {/* Linear Gradient for glow design */}
                      <defs>
                        <linearGradient id="line-glow" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#818CF8" />
                          <stop offset="50%" stopColor="#4F46E5" />
                          <stop offset="100%" stopColor="#06D6A0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[9.5px] font-mono text-slate-500 border-t border-slate-900/60 pt-3 select-none">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-0.5 bg-indigo-500" />
                    <span>Completed Velocity</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-0.5 border-t border-dashed border-slate-500" />
                    <span>Linear Forecast Target</span>
                  </div>
                  <span className="text-[#06D6A0] ml-auto font-bold animate-pulse">● Target Achieved +8.4%</span>
                </div>
              </div>

              {/* Graphic 2: Storage Consumed & Channels traffic */}
              <div className="lg:col-span-4 flex flex-col gap-5">
                
                {/* Dial Storage Consumed */}
                <div className="p-5 bg-[#121829] border border-slate-900 rounded-xl space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-205">Vault Directory Allocation</h4>
                    <p className="text-[10px] text-slate-500">Secure disk mapping footprint info</p>
                  </div>

                  {/* Circular radial bar simulation */}
                  <div className="flex items-center justify-center p-2">
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                        <circle cx="18" cy="18" r="16" fill="none" stroke="#1e293b" strokeWidth="2.5" />
                        {/* 68% full */}
                        <circle cx="18" cy="18" r="16" fill="none" stroke="#22D3EE" strokeWidth="2.8" strokeDasharray="68, 100" strokeLinecap="round" />
                      </svg>
                      <div className="absolute text-center flex flex-col select-none">
                        <span className="text-base font-black text-white">342.2 GB</span>
                        <span className="text-[8.5px] text-cyan-400 font-mono tracking-widest font-bold">68% USED</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 text-center select-none">
                    Remaining clean volume size limit: <span className="font-mono font-bold text-slate-200">157.8 GB</span>
                  </div>
                </div>

                {/* Vertical Message Traffic */}
                <div className="p-4 bg-[#121829] border border-slate-900 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-205">Active Channels Volume</h4>
                  
                  <div className="space-y-2 select-none">
                    {[
                      { name: 'compliance-audit', count: 420, percent: 'w-[90%]', color: 'bg-rose-500' },
                      { name: 'dev-secure', count: 310, percent: 'w-[72%]', color: 'bg-indigo-505' },
                      { name: 'general-sync', count: 180, percent: 'w-[45%]', color: 'bg-cyan-400' },
                      { name: 'legal-signatory', count: 90, percent: 'w-[20%]', color: 'bg-[#06D6A0]' }
                    ].map((chan, idx) => (
                      <div key={idx} className="space-y-0.8 text-[11px]">
                        <div className="flex justify-between text-slate-350">
                          <span className="font-mono text-[9.5px]">module/{chan.name}</span>
                          <span className="font-mono font-bold text-slate-200">{chan.count} msgs</span>
                        </div>
                        <div className="w-full h-[5px] bg-slate-950 rounded-full overflow-hidden">
                          <div className={`h-full ${chan.color} ${chan.percent} rounded-full`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Edge Node telemetry metrics */}
            <div className="p-5 bg-[#121829] border border-slate-900 rounded-xl space-y-3.5 select-none animate-fadeIn">
              <h4 className="text-xs font-bold text-slate-200">Secure Cluster Node Connections log</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[10.5px] font-mono">
                <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-900 flex justify-between">
                  <span className="text-slate-500">AP-EAST BRIDGEWAY:</span>
                  <span className="text-[#06D6A0] font-bold">Online (0x4AE)</span>
                </div>
                <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-900 flex justify-between">
                  <span className="text-slate-500">OAUTH AGENT SECURE:</span>
                  <span className="text-cyan-400 font-bold">Active SLA 99.9%</span>
                </div>
                <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-900 flex justify-between">
                  <span className="text-slate-500">ENCRYPTION ENGINE SHA-256:</span>
                  <span className="text-violet-400 font-bold">Hardware Safe</span>
                </div>
              </div>
            </div>

          </div>
        </main>
      )}

      {/* 4.6. DYNAMIC TEAM CALENDAR VIEW */}
      {currentTab === 'calendar' && (
        <main className="min-w-0 flex-1 flex flex-col bg-[#0b0f19] overflow-y-auto" id="calendar-viewport-root animate-fadeIn">
          {/* Header */}
          <div className="p-5 px-6 border-b border-slate-900 flex items-center justify-between bg-slate-950/25">
            <div>
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider font-sans">Dynamic Team Calendar &amp; Sync Planner</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Coordinate physical huddles, team alignments and log project target deadlines securely.</p>
            </div>
            <button 
              onClick={() => {
                setSelectedCalendarDate(10);
                setScheduleTitle('New Scrum Aligment');
                setShowScheduleModal(true);
              }}
              className="bg-[#6366F1] hover:bg-indigo-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow cursor-pointer transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Schedule Sync</span>
            </button>
          </div>

          <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
            
            {/* Calendar Layout Card with grid */}
            <div className="bg-[#121829] border border-[#1d273a] rounded-2xl overflow-hidden shadow-xl">
              {/* Month Bar */}
              <div className="p-4 border-b border-[#1d273a] bg-slate-950/40 flex items-center justify-between px-6">
                <span className="text-sm font-black text-white">JUNE 2026</span>
                <div className="flex items-center gap-3 text-[10.5px] font-mono text-slate-500 select-none">
                  <span className="flex items-center gap-1 border-r border-slate-800 pr-3">🔵 Huddles</span>
                  <span className="flex items-center gap-1 border-r border-slate-800 pr-3 text-emerald-450">🟢 Sync Reviews</span>
                  <span className="flex items-center gap-1 text-rose-400">🔴 Critical Deadlines</span>
                </div>
              </div>

              {/* Day Headers row */}
              <div className="grid grid-cols-7 text-center bg-slate-950/15 border-b border-[#1d273a] text-[10px] font-bold text-slate-500 uppercase tracking-widest p-2 font-mono">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="py-2">{day}</div>
                ))}
              </div>

              {/* Days Monthly Grid */}
              <div className="grid grid-cols-7 bg-slate-950/5 text-xs text-slate-300 divide-x divide-y divide-[#1c2638] border-l border-[#1c2638]">
                {/* Prepend empty days for accurate grid alignment - June 1 2026 is Monday, so 1 empty cell */}
                <div className="bg-slate-950/20 py-10" />
                
                {Array.from({ length: 30 }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const dayEvents = calendarEvents.filter(ev => ev.date === dayNum);

                  return (
                    <div 
                      key={dayNum} 
                      onClick={() => {
                        setSelectedCalendarDate(dayNum);
                        setScheduleTitle('');
                        setShowScheduleModal(true);
                      }}
                      className="min-h-24 p-2 bg-slate-950/5 hover:bg-[#1A2438]/50 transition-colors cursor-pointer flex flex-col justify-between group"
                      title="Click slot to add meeting"
                    >
                      {/* Day Number Label */}
                      <span className="text-slate-400 font-mono font-bold group-hover:text-white transition-colors">{dayNum}</span>
                      
                      {/* Bulleted list of events */}
                      <div className="mt-1 space-y-1 overflow-y-auto max-h-16">
                        {dayEvents.map(ev => {
                          const badgeColor = ev.type === 'huddle' ? 'bg-[#6366F1]/10 text-indigo-300 border-[#6366F1]/30' : ev.type === 'sync' ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30';
                          return (
                            <div 
                              key={ev.id} 
                              onClick={(e) => {
                                e.stopPropagation();
                                // Remove on click trigger simulation
                                const filtered = calendarEvents.filter(x => x.id !== ev.id);
                                setCalendarEvents(filtered);
                              }}
                              className={`p-1 px-1.5 text-[8.5px] leading-tight font-sans rounded-md border truncate ${badgeColor}`}
                              title={`${ev.title} at ${ev.time}. Click to delete event slot.`}
                            >
                              <span className="font-bold">{ev.time}</span> <span className="opacity-90">{ev.title}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Micro interaction */}
                      <span className="text-[8.5px] text-slate-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity mt-auto block text-right">
                        + Reserve
                      </span>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Calendar Planner schedule dialog modal */}
            {showScheduleModal && selectedCalendarDate && (
              <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-[#121829] border border-slate-805 rounded-xl max-w-sm w-full overflow-hidden shadow-2xl animate-scaleIn">
                  <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex justify-between items-center">
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">📅 Schedule: June {selectedCalendarDate}, 2026</span>
                    <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-mono block uppercase font-bold">Event Title:</label>
                      <input 
                        type="text" 
                        value={scheduleTitle}
                        onChange={(e) => setScheduleTitle(e.target.value)}
                        placeholder="E.g. Sprint Review meeting"
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 font-sans"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-mono block uppercase font-bold">Time Target:</label>
                        <input 
                          type="text" 
                          value={scheduleTime}
                          onChange={(e) => setScheduleTime(e.target.value)}
                          placeholder="10:00 AM"
                          className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white focus:outline-none font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-mono block uppercase font-bold">Slot Range Category:</label>
                        <select 
                          value={scheduleType}
                          onChange={(e: any) => setScheduleType(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white focus:outline-none font-mono"
                        >
                          <option value="sync">🟢 Team Sync meeting</option>
                          <option value="huddle">🔵 Voice Huddle</option>
                          <option value="deadline">🔴 Compliance deadline</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-950/40 border-t border-[#121829] flex justify-end gap-2 text-xs select-none">
                    <button 
                      onClick={() => setShowScheduleModal(false)}
                      className="px-3.5 py-1.5 bg-transparent border border-slate-800 text-slate-400 hover:text-white rounded"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => {
                        if (!scheduleTitle.trim()) return;
                        const newEvent = {
                          id: `ev-${Date.now()}`,
                          date: selectedCalendarDate,
                          title: scheduleTitle,
                          type: scheduleType,
                          time: scheduleTime
                        };
                        setCalendarEvents([...calendarEvents, newEvent]);
                        setShowScheduleModal(false);
                      }}
                      className="px-4 py-1.5 bg-[#6366F1] hover:bg-indigo-500 text-white font-extrabold rounded"
                    >
                      Reserve Slot
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      )}
      <aside 
        id="right-context-panel" 
        className="hidden 2xl:flex w-80 bg-[#0B0F1A] border-l border-slate-800/60 flex-col justify-between shrink-0"
      >
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-850/50 flex items-center justify-between" id="right-panel-header">
            <span className="font-bold text-xs text-white uppercase tracking-wider font-mono">FLOW Smart AI Panel</span>
            <span className="font-mono text-[9px] bg-indigo-950/45 px-1.5 py-0.5 rounded text-cyan-400 font-bold border border-indigo-900/30">Gemini Pro 1.5</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5" id="right-panel-scroll">
            
            {/* AI Assistant Chat Context */}
            <div className="space-y-3" id="ai-interactor">
              <span className="text-[9px] font-mono font-bold text-slate-550 uppercase tracking-widest block font-sans">Active AI Assistant Copilot</span>
              
              <div className="bg-slate-900 rounded-lg p-3 border border-slate-850 max-h-56 overflow-y-auto space-y-2.5 text-xs" id="chat-copilot-history">
                {copilotHistory.map((item, idx) => (
                  <div key={idx} className={item.sender === 'user' ? 'text-right' : 'text-left'}>
                    <div className={`inline-block p-2 rounded-lg leading-relaxed ${item.sender === 'user' ? 'bg-violet-900/40 text-violet-300' : 'bg-slate-850 text-slate-300'}`} style={{ maxWidth: '90%' }}>
                      {item.text}
                    </div>
                  </div>
                ))}

                {isAiCopilotLoading && (
                  <div className="text-left animate-pulse flex items-center gap-1.5 text-slate-500 font-mono text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                    <span>Gemini analyzing sprint workspace attributes...</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleLaunchCopilotAction} className="relative">
                <input 
                  type="text" 
                  value={copilotInput}
                  onChange={(e) => setCopilotInput(e.target.value)}
                  placeholder="Ask for risk checklists or summaries..."
                  className="w-full bg-slate-950 border border-slate-805/70 rounded p-2 text-xs text-slate-350 focus:outline-none focus:border-violet-500"
                />
                <button type="submit" className="absolute right-2 top-2 text-violet-400 hover:text-violet-300">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Task properties mapper */}
            {currentTab === 'tasks' && selectedTask && (
              <div className="space-y-4 pt-4 border-t border-slate-850/50" id="task-context">
                <span className="text-[9px] font-mono font-bold text-slate-550 uppercase tracking-widest block font-sans">Linear Task Attributes</span>
                
                <div className="space-y-3 text-xs text-slate-400 bg-slate-950/20 p-3 rounded-lg border border-slate-850">
                  <span className="font-bold text-white text-xs block truncate mb-1">{selectedTask.title}</span>
                  <div className="flex justify-between">
                    <span>Priority:</span>
                    <span className="text-slate-200 capitalize font-mono font-semibold">{selectedTask.priority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Agile Sprint:</span>
                    <span className="text-indigo-400 font-bold text-[10px] bg-slate-900 border border-slate-850/60 px-1 py-0.2 rounded font-mono">{selectedTask.sprint || 'Unassigned'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Due Date Limit:</span>
                    <span className="text-slate-300 font-mono">{selectedTask.dueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Timelog:</span>
                    <span className="text-slate-200 font-mono font-semibold">{(selectedTask.timeEstimateMinutes || 0) / 60} hours</span>
                  </div>
                </div>
              </div>
            )}

            {/* Slack Pinned threads section context */}
            {activeThreadMsg && (
              <div className="space-y-4 pt-4 border-t border-slate-850/50" id="thread-context">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-mono font-bold text-slate-550 uppercase tracking-widest block font-sans">Active Thread Responses</span>
                  <button onClick={() => setActiveThreadMsg(null)} className="text-[10px] text-slate-550 hover:text-white">Close X</button>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-850 text-xs">
                  <span className="font-bold text-slate-300 block">{activeThreadMsg.user.name}:</span>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{activeThreadMsg.content}</p>
                </div>

                <div className="space-y-2 max-h-44 overflow-y-auto pr-0.5 text-xs" id="thread-reply-history">
                  {(threadRepliesMap[activeThreadMsg.id] || []).map((reply, index) => (
                    <div key={index} className="p-2 rounded bg-slate-900 border border-slate-800/40">
                      <div className="flex justify-between text-[10px] mb-1 font-semibold text-slate-400">
                        <span>{reply.user.name}</span>
                        <span className="font-mono">{reply.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-300">{reply.text}</p>
                    </div>
                  ))}
                  {(threadRepliesMap[activeThreadMsg.id] || []).length === 0 && (
                    <div className="text-center py-4 text-[10px] text-slate-500 font-mono">
                      No nested replies yet. Submit first reply.
                    </div>
                  )}
                </div>

                <form onSubmit={handleSendThreadReply} className="relative">
                  <input 
                    type="text" 
                    value={threadReplyInput}
                    onChange={(e) => setThreadReplyInput(e.target.value)}
                    placeholder="Comment on thread..."
                    className="w-full bg-[#1A2436] border border-slate-805/70 rounded p-2 text-xs text-slate-300 focus:outline-none"
                  />
                  <button type="submit" className="absolute right-2 top-2 text-violet-400 hover:text-white">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      </aside>

      {/* Chat Settings Overlay Modal */}
      {isChatSettingsOpen && (
        <div className="fixed inset-0 bg-slate-955/90 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" id="chat-settings-modal-overlay">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-violet-400" />
                <h3 className="font-bold text-sm text-white">Slack-style Chat Settings</h3>
              </div>
              <button 
                onClick={() => setIsChatSettingsOpen(false)}
                className="text-slate-405 hover:text-white text-xs font-semibold px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <p className="text-xs text-slate-400 leading-relaxed">
                Configure your display density and privacy parameters for channels and direct message chats.
              </p>

              {/* Setting Action List */}
              <div className="space-y-4">
                
                {/* 1. Spacing Layout Density */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/20 border border-slate-850">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Compact Density</span>
                    <span className="text-[10px] text-slate-500 block">Less margins, smaller avatars for high productivity</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setChatSettings(prev => ({ ...prev, compactMode: !prev.compactMode }))}
                    className={`w-10 h-5.5 rounded-full p-0.5 transition-all duration-200 cursor-pointer ${chatSettings.compactMode ? 'bg-[#06D6A0]' : 'bg-slate-700'}`}
                  >
                    <div className={`w-4.5 h-4.5 rounded-full bg-white shadow transition-transform duration-200 ${chatSettings.compactMode ? 'translate-x-4.5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* 2. Toggle AI Summaries */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/20 border border-slate-850">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">AI-Powered Summaries</span>
                    <span className="text-[10px] text-slate-500 block">Enable inline automatic text summaries under updates</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setChatSettings(prev => ({ ...prev, enableAiSummaries: !prev.enableAiSummaries }))}
                    className={`w-10 h-5.5 rounded-full p-0.5 transition-all duration-200 cursor-pointer ${chatSettings.enableAiSummaries ? 'bg-[#06D6A0]' : 'bg-slate-700'}`}
                  >
                    <div className={`w-4.5 h-4.5 rounded-full bg-white shadow transition-transform duration-200 ${chatSettings.enableAiSummaries ? 'translate-x-4.5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* 3. Notification Audio */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/20 border border-slate-850">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Notification Sounds</span>
                    <span className="text-[10px] text-slate-500 block">Play sound alert on new direct messages</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setChatSettings(prev => ({ ...prev, showNotificationSound: !prev.showNotificationSound }))}
                    className={`w-10 h-5.5 rounded-full p-0.5 transition-all duration-200 cursor-pointer ${chatSettings.showNotificationSound ? 'bg-[#06D6A0]' : 'bg-slate-700'}`}
                  >
                    <div className={`w-4.5 h-4.5 rounded-full bg-white shadow transition-transform duration-200 ${chatSettings.showNotificationSound ? 'translate-x-4.5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* 4. Desktop Alerts */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/20 border border-slate-850">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Desktop Notifications</span>
                    <span className="text-[10px] text-slate-500 block">Show browser push alerts</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setChatSettings(prev => ({ ...prev, showDesktopAlerts: !prev.showDesktopAlerts }))}
                    className={`w-10 h-5.5 rounded-full p-0.5 transition-all duration-200 cursor-pointer ${chatSettings.showDesktopAlerts ? 'bg-[#06D6A0]' : 'bg-slate-700'}`}
                  >
                    <div className={`w-4.5 h-4.5 rounded-full bg-white shadow transition-transform duration-200 ${chatSettings.showDesktopAlerts ? 'translate-x-4.5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* 5. Message Expiry Retention */}
                <div className="p-3 rounded-lg bg-[#0E1524] border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Retention & Auto-Delete</span>
                      <span className="text-[10px] text-slate-500 block">Period of storing conversation records</span>
                    </div>
                    <select 
                      value={chatSettings.messageExpiry}
                      onChange={(e) => setChatSettings(prev => ({ ...prev, messageExpiry: e.target.value }))}
                      className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-violet-500 cursor-pointer"
                    >
                      <option value="none">Infinite (Default)</option>
                      <option value="24h">24 Hours (Ephemeral)</option>
                      <option value="7d">7 Days</option>
                    </select>
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950/50 border-t border-slate-800 flex justify-end gap-2.5">
              <button 
                type="button"
                onClick={() => {
                  setChatSettings({
                    compactMode: appearance.chatDensity === 'compact',
                    showNotificationSound: true,
                    showDesktopAlerts: true,
                    enableAiSummaries: true,
                    readReceiptsEnabled: true,
                    messageExpiry: 'none'
                  });
                }}
                className="text-xs text-slate-400 hover:text-white px-3 py-1.5 hover:underline cursor-pointer"
              >
                Reset Default
              </button>
              <button 
                type="button"
                onClick={() => setIsChatSettingsOpen(false)}
                className="bg-violet-600 hover:bg-violet-550 font-bold text-white text-xs px-4 py-1.5 rounded transition shadow-lg cursor-pointer"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {isEditProfileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 select-none animate-fadeIn"
          onClick={() => setIsEditProfileOpen(false)}
        >
          <div
            className="bg-[#0f172a] border border-slate-805 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-violet-400" />
                <h3 className="font-bold text-sm text-white">Edit Profile</h3>
              </div>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 hover:bg-slate-900 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Avatar editor */}
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <img
                    src={profileForm.avatar || currentUser.avatar}
                    alt="Avatar preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-slate-750"
                  />
                  <button
                    type="button"
                    onClick={() => avatarFileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-violet-600 hover:bg-violet-550 border-2 border-[#0f172a] flex items-center justify-center cursor-pointer transition-colors"
                    title="Upload a new photo"
                  >
                    <Camera className="w-3 h-3 text-white" />
                  </button>
                  <input
                    ref={avatarFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarFileSelect}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">Avatar URL</label>
                  <input
                    type="text"
                    value={profileForm.avatar}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, avatar: e.target.value }))}
                    placeholder="https://… or upload a photo"
                    className="w-full bg-slate-905 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200 placeholder-slate-650 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Name field */}
              <div>
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                  <UserPlus className="w-3 h-3" /> Display Name
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your name"
                  className="w-full bg-slate-905 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-650 focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* Email field */}
              <div>
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3 h-3" /> Email
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="you@company.com"
                  className="w-full bg-slate-905 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-650 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 px-6 bg-slate-950/50 border-t border-slate-800 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="text-xs text-slate-400 hover:text-white px-4 py-2 hover:bg-slate-900 rounded-lg cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={!profileForm.name.trim() || !profileForm.email.trim()}
                className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-550 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-white text-xs px-4 py-2 rounded-lg transition shadow-lg cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. WHITEBOARD SKETCHPAD CANVAS MODAL */}
      {isCanvasOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none animate-fadeIn">
          <div className="bg-[#0f172a] border border-slate-805 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[calc(100vh-2rem)] overflow-y-auto animate-scaleIn">
            {/* Header */}
            <div className="p-4 px-6 border-b border-slate-800/8 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-lime-400" />
                <h3 className="font-bold text-sm text-white">Squad Whiteboard Sketchpad</h3>
              </div>
              <button 
                onClick={() => setIsCanvasOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-xs"
              >
                ✕ Close
              </button>
            </div>

            {/* Drawing Area */}
            <div className="bg-[#0f172a] p-4 flex items-center justify-center">
              <div className="relative border border-slate-800 rounded-xl overflow-hidden shadow-inner">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="bg-slate-950 cursor-crosshair touch-none"
                  width={640}
                  height={420}
                  style={{ width: '100%', maxWidth: '640px', height: '420px', display: 'block' }}
                />
              </div>
            </div>

            {/* Config & share bar Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Stroke colors config */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider">Palette:</span>
                  {[
                    '#6366F1', // Indigo
                    '#10B981', // Emerald
                    '#F59E0B', // Amber
                    '#EF4444', // Red
                    '#EC4899', // Pink
                    '#38BDF8', // Cyan
                    '#FFFFFF'  // White
                  ].map((color) => (
                    <button
                      key={color}
                      onClick={() => setCanvasStrokeColor(color)}
                      className={`w-5 h-5 rounded-full border transition-all ${canvasStrokeColor === color ? 'border-white scale-110 ring-2 ring-indigo-505/30' : 'border-transparent hover:scale-105'}`}
                      style={{ backgroundColor: color }}
                      title={`Marker: ${color}`}
                    />
                  ))}
                </div>

                {/* Stroke width marker slider */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider">Tip:</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={canvasStrokeWidth}
                    onChange={(e) => setCanvasStrokeWidth(parseInt(e.target.value))}
                    className="w-20 accent-indigo-500 cursor-pointer h-1.5 range-sm bg-slate-800 rounded-lg"
                    title={`Tip Thickness: ${canvasStrokeWidth}px`}
                  />
                  <span className="text-[10px] font-mono text-slate-400 w-4">{canvasStrokeWidth}px</span>
                </div>
              </div>

              {/* Share and reset */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const canvas = canvasRef.current;
                    if (canvas) {
                      const ctx = canvas.getContext('2d');
                      if (ctx) {
                        ctx.fillStyle = '#0f172a';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                      }
                    }
                  }}
                  className="px-3.5 py-1.5 border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-305 text-xs font-bold rounded-lg cursor-pointer transition"
                >
                  Clear Canvas
                </button>
                <button
                  type="button"
                  onClick={handleShareCanvasToChat}
                  className="px-4 py-1.5 bg-lime-600 hover:bg-lime-500 text-white text-xs font-extrabold rounded-lg shadow-lg shadow-lime-950/20 cursor-pointer transition flex items-center gap-1.5"
                >
                  <Send className="w-3 h-3 text-white" />
                  <span>Attach sketch</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. LIGHTBOX IMAGE ZOOM SLIDE OVERLAY */}
      {activeLightboxImage && (
        <div 
          className="fixed inset-0 bg-black/95 z-55 flex items-center justify-center p-4 animate-fadeIn cursor-zoom-out"
          onClick={() => setActiveLightboxImage(null)}
        >
          {/* Top header navigation buttons */}
          <div className="absolute top-5 inset-x-0 px-6 flex items-center justify-between select-none pointer-events-none">
            <div className="text-white text-xs font-mono font-bold bg-slate-950/50 p-2.5 px-4 rounded-xl border border-slate-850">
              🖼️ High-Res Image View
            </div>
            <div className="flex items-center gap-2 pointer-events-auto">
              <a 
                href={activeLightboxImage} 
                download={`teamsync-file-${Date.now()}.png`}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
              >
                Download Original
              </a>
              <button 
                onClick={() => setActiveLightboxImage(null)}
                className="bg-slate-800 hover:bg-rose-600 text-white w-9 h-9 rounded-xl flex items-center justify-center transition shadow cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="max-w-4xl max-h-[80vh] overflow-hidden rounded-2xl border border-slate-800 bg-[#070c14] shadow-2xl transition pointer-events-auto">
            <img 
              src={activeLightboxImage} 
              alt="Zoom preview" 
              className="max-w-full max-h-[80vh] object-contain select-none cursor-default"
              referrerPolicy="no-referrer"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

    </div>
  );
}
