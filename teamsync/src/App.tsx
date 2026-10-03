/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, Sliders, LayoutGrid, Users, LifeBuoy, LogOut, ChevronRight, 
  HelpCircle, Sparkles, Star, Globe, ShieldCheck, Moon, Sun, ArrowLeft, Menu,
  Bell, Check, X, ShieldAlert, Sparkle, CircleDot, MessageSquare, Terminal, Eye
} from 'lucide-react';

// TypeScript Types & Custom Mock Data
import { 
  User, Channel, Document, Task, Message, AppearancePreferences, WhiteLabelConfig 
} from './types';
import { 
  defaultAppearance, defaultWhiteLabel,
  mockDocuments, mockTasks
} from './data/mockData';

// Component Imports
import Logo from './components/Logo';
import GlobalSearch from './components/GlobalSearch';
import AppearanceSettings from './components/AppearanceSettings';
import AdminConsole from './components/AdminConsole';
import AppMarketplace from './components/AppMarketplace';
import WorkspaceDashboard from './components/WorkspaceDashboard';
import LoginPage from './components/LoginPage';
import { apiFetch, authToken } from './api';

export interface WorkspaceNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  type: 'mention' | 'doc' | 'task' | 'system';
  userId?: string; 
  user?: User;
  actionData?: {
    type: 'dm' | 'doc' | 'task';
    userId?: string;
    docId?: string;
    taskId?: string;
  };
}

export default function App() {
  // Navigation & View Orchestration States
  const [currentScreen, setCurrentScreen] = useState<'workspace' | 'admin' | 'marketplace'>('workspace');
  const [isAppearanceModalOpen, setIsAppearanceModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Dynamic status/presence user state
  const [users, setUsers] = useState<User[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(null as unknown as User);
  const [authChecked, setAuthChecked] = useState(false);

  const loadWorkspaceIdentity = async (user: User) => {
    setCurrentUser(user);
    const [usersResponse, channelsResponse] = await Promise.all([apiFetch('/users'), apiFetch('/channels')]);
    if (!usersResponse.ok || !channelsResponse.ok) throw new Error('Workspace data could not be loaded.');
    setUsers(await usersResponse.json());
    setChannels(await channelsResponse.json());
  };

  useEffect(() => {
    if (!authToken()) { setAuthChecked(true); return; }
    apiFetch('/auth/me')
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(loadWorkspaceIdentity)
      .catch(() => sessionStorage.removeItem('flow_api_token'))
      .finally(() => setAuthChecked(true));
  }, []);

  // Core Mutable States (Instantly synchronized to verify live sandbox credentials)
  const [appearance, setAppearance] = useState<AppearancePreferences>(defaultAppearance);
  const [whiteLabel, setWhiteLabel] = useState<WhiteLabelConfig>(defaultWhiteLabel);

  // Notification and Target Navigation States
  const [notifications, setNotifications] = useState<WorkspaceNotification[]>([]);

  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [selectedPresenceUser, setSelectedPresenceUser] = useState<User | null>(null);
  const [toasts, setToasts] = useState<Array<{ id: string; title: string; body: string; avatar?: string; type: string }>>([]);

  // Live trigger states forwarded to WorkspaceDashboard
  const [dmTargetUser, setDmTargetUser] = useState<User | null>(null);
  const [docTarget, setDocTarget] = useState<Document | null>(null);
  const [taskTarget, setTaskTarget] = useState<Task | null>(null);

  // Trigger non-intrusive floating toasts
  const triggerToast = (title: string, body: string, avatar?: string, type = 'info') => {
    const id = Math.random().toString(36).substring(3, 9);
    setToasts(prev => [...prev, { id, title, body, avatar, type }]);
    
    // Auto clear after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Simulate an active collaborator sandbox event
  const simulateCoworkerAction = () => {
    const actions = [
      {
        title: 'Elena Rostova edited ISO spec',
        body: 'Approved the Section 4 audit trail logging guidelines.',
        type: 'doc' as const,
        userId: 'u3',
        user: users[2],
        actionData: { type: 'doc' as const, docId: 'd2' }
      },
      {
        title: 'Marcus Vance edited Specification',
        body: 'Replaced code snippets in the "Enterprise Product Specification" doc.',
        type: 'doc' as const,
        userId: 'u2',
        user: users[1],
        actionData: { type: 'doc' as const, docId: 'd1' }
      },
      {
        title: 'Marcus Vance assigned high priority Task',
        body: 'Sentry transaction tracking threshold adjustments assigned to Dev team.',
        type: 'task' as const,
        userId: 'u2',
        user: users[1],
        actionData: { type: 'task' as const, taskId: 't4' }
      },
      {
        title: 'Elena Rostova triggered notification',
        body: 'Hey Sarah! Sent a message regarding tomorrow\'s ISO audit check.',
        type: 'mention' as const,
        userId: 'u3',
        user: users[2],
        actionData: { type: 'dm' as const, userId: 'u3' }
      }
    ];

    const pick = actions[Math.floor(Math.random() * actions.length)];
    const newId = `sim-${Date.now()}`;
    const newNotif: WorkspaceNotification = {
      id: newId,
      title: pick.title,
      body: pick.body,
      timestamp: 'Just now',
      isRead: false,
      type: pick.type,
      userId: pick.userId,
      user: pick.user,
      actionData: pick.actionData
    };

    setNotifications(prev => [newNotif, ...prev]);
    triggerToast(pick.title, pick.body, pick.user?.avatar, pick.type);
  };

  // periodic random user simulated notifications to feel exceptionally alive!
  useEffect(() => {
    const timer = setInterval(() => {
      // 15% chance to trigger an event every 50 seconds representation
      if (Math.random() < 0.15) {
        simulateCoworkerAction();
      }
    }, 50000);
    return () => clearInterval(timer);
  }, []);

  const handleNotificationClick = (notif: WorkspaceNotification) => {
    // Mark as read
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
    setIsNotifDropdownOpen(false);

    if (notif.actionData) {
      const { type, userId, docId, taskId } = notif.actionData;
      setCurrentScreen('workspace');
      
      if (type === 'dm' && userId) {
        const found = users.find(u => u.id === userId);
        if (found) setDmTargetUser(found);
      } else if (type === 'doc' && docId) {
        const found = mockDocuments.find(d => d.id === docId);
        if (found) setDocTarget(found);
      } else if (type === 'task' && taskId) {
        const found = mockTasks.find(t => t.id === taskId);
        if (found) setTaskTarget(found);
      }
    }
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    setIsNotifDropdownOpen(false);
    triggerToast('Notifications Cleared', 'All unread and read alerts removed.');
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    triggerToast('All Read', 'Marked all workspace notifications as read.');
  };

  // Listen to keyboard shortcut for Command Palette Spotlight (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleGlobalShortcut = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalShortcut);
    return () => window.removeEventListener('keydown', handleGlobalShortcut);
  }, []);

  // Theme support - add dark/light class descriptors safely
  useEffect(() => {
    const rootClass = document.documentElement.classList;
    if (appearance.theme === 'light') {
      rootClass.add('light');
      rootClass.remove('dark');
    } else {
      rootClass.add('dark');
      rootClass.remove('light');
    }
  }, [appearance.theme]);

  // Handle live personalized option adjustments
  const handleUpdateAppearance = (updated: Partial<AppearancePreferences>) => {
    setAppearance(prev => ({ ...prev, ...updated }));
  };

  // Handle live admin whitelist updates
  const handleUpdateWhiteLabel = (updated: Partial<WhiteLabelConfig>) => {
    setWhiteLabel(prev => ({ ...prev, ...updated }));
  };

  // Switch between panels seamlessly
  const handleSelectChannelFromSearch = (channelId: string) => {
    setCurrentScreen('workspace');
  };

  const handleSelectDocFromSearch = (docId: string) => {
    setCurrentScreen('workspace');
  };

  const handleSelectTaskFromSearch = (taskId: string) => {
    setCurrentScreen('workspace');
  };

  // Background Mesh mapping
  const getWallpaperBackground = () => {
    if (appearance.theme === 'light') {
      return 'bg-slate-50 text-slate-900';
    }
    switch (appearance.wallpaper) {
      case 'aurora':
        return 'bg-linear-to-b from-[#0F172A] via-[#10142A] to-[#120F2E]';
      case 'cyberpunk':
        return 'bg-gradient-to-tr from-[#0F172A] via-[#15122E] to-[#1C1645]';
      case 'nebula':
        return 'bg-gradient-to-br from-[#0A0D1A] via-[#0F1123] to-[#1E3A5F]/20';
      case 'light-gradient':
        return 'bg-gradient-to-br from-indigo-50/60 via-slate-50 to-cyan-50/50 text-slate-800';
      default:
        return 'bg-[#0F172A]';
    }
  };

  const getFontStyleAndSize = () => {
    const style: React.CSSProperties = {};
    
    // Font family mapping
    if (appearance.fontFamily === 'mono') {
      style.fontFamily = 'var(--font-mono), monospace';
    } else if (appearance.fontFamily === 'display') {
      style.fontFamily = 'var(--font-display), sans-serif';
    } else {
      style.fontFamily = 'var(--font-sans), sans-serif';
    }

    // Font size scaling
    if (appearance.fontSize === 'sm') {
      style.fontSize = '0.85rem';
    } else if (appearance.fontSize === 'lg') {
      style.fontSize = '1.05rem';
    } else if (appearance.fontSize === 'xl') {
      style.fontSize = '1.15rem';
    } else {
      style.fontSize = '0.95rem';
    }

    return style;
  };

  if (!authChecked) return <main className="min-h-screen bg-slate-950 text-white grid place-items-center">Loading…</main>;
  if (!currentUser) return <LoginPage onAuthenticated={user => loadWorkspaceIdentity(user).catch(() => sessionStorage.removeItem('flow_api_token'))} />;
  const logout = async () => {
    try { await apiFetch('/auth/logout', { method: 'POST' }); } finally {
      sessionStorage.removeItem('flow_api_token');
      setUsers([]);
      setChannels([]);
      setCurrentUser(null as unknown as User);
    }
  };

  return (
    <div 
      className={`min-h-screen relative flex flex-col transition-all ${getWallpaperBackground()} select-none`} 
      style={getFontStyleAndSize()}
      id="app-global-container"
    >
      
      {/* Dynamic Ambient Background Sparkles */}
      {appearance.theme === 'dark' && appearance.wallpaper !== 'none' && (
        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden" id="ambient-mesh-glow">
          <div className="absolute top-[20%] left-[10%] w-[450px] h-[450px] bg-indigo-650 rounded-full blur-[160px] animate-pulse-glow" style={{ animationDuration: '10s' }} />
          <div className="absolute bottom-[25%] right-[10%] w-[400px] h-[400px] bg-cyan-650 rounded-full blur-[140px] animate-pulse-glow" style={{ animationDuration: '12s', animationDelay: '3s' }} />
        </div>
      )}

      {/* RENDER CURRENT SCREEN */}
      {/* CORE APPLICATION CHROME */}
      <div className="flex flex-col h-screen overflow-hidden" id="application-chrome-layout">
        
        {/* Top Global Navigation Bar - SaaS Standard */}
        <header className="min-h-14 bg-[#090D16] border-b border-indigo-950/40 px-3 sm:px-4 py-2 flex flex-wrap lg:flex-nowrap items-center justify-between gap-2 z-40 relative">
          <div className="flex items-center gap-3 lg:gap-4 min-w-0">
            <Logo />
            
            <div 
              className="hidden lg:flex items-center gap-1.5 bg-[#121B2E]/90 hover:bg-[#152037] border border-slate-800 px-3 py-1.5 h-8.5 rounded-lg w-64 text-left cursor-pointer transition text-slate-505"
              onClick={() => setIsSearchOpen(true)}
              id="search-header-trigger"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] text-slate-400">Search Workspace...</span>
              <kbd className="ml-auto text-[9px] bg-slate-900 border border-slate-800 px-1 py-0.2 rounded font-mono font-bold text-slate-500">
                ⌘K
              </kbd>
            </div>

            {/* Active team presence indicator facepile */}
            <div className="hidden md:flex items-center gap-1.5 pl-2 border-l border-slate-850/80" id="header-active-presence-list">
              <span className="text-[10px] text-slate-500 font-mono font-bold tracking-wider uppercase mr-1">Active:</span>
              <div className="flex items-center -space-x-1.5 font-sans">
                {users.filter(u => u.id !== currentUser.id).map(u => {
                  const statusColors = {
                    online: 'bg-[#06D6A0] ring-[#06D6A0]',
                    busy: 'bg-rose-500 ring-rose-500',
                    away: 'bg-amber-400 ring-amber-400',
                    offline: 'bg-slate-500 ring-slate-500'
                  };
                  return (
                    <div 
                      key={u.id}
                      className="relative cursor-pointer hover:z-30 group"
                      onClick={() => setSelectedPresenceUser(selectedPresenceUser?.id === u.id ? null : u)}
                    >
                      <img 
                        src={u.avatar} 
                        alt={u.name} 
                        className={`w-7 h-7 rounded-full border border-slate-950 object-cover hover:scale-105 active:scale-95 transition-all ring-1 ring-offset-1 ring-offset-slate-950 ${u.status === 'online' ? 'ring-emerald-500' : 'ring-slate-800'}`} 
                      />
                      <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#0B0F19] ${statusColors[u.status]}`} />
                      
                      {/* Tooltip simple */}
                      <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-slate-950 text-white font-bold text-[9px] px-1.5 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-40 border border-slate-800 shadow-xl">
                        {u.name} <span className="text-cyan-400">({u.customStatus || u.status})</span>
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Coworker detailed presence popover */}
              {selectedPresenceUser && (
                <div className="absolute left-40 top-full mt-2 bg-[#0e1627] border border-slate-800 rounded-xl shadow-2xl w-64 p-4 z-45 animate-fade-in text-slate-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <img src={selectedPresenceUser.avatar} alt={selectedPresenceUser.name} className="w-10 h-10 rounded-full border border-slate-800 object-cover" />
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0B0F19] ${selectedPresenceUser.status === 'online' ? 'bg-emerald-500' : selectedPresenceUser.status === 'busy' ? 'bg-rose-500' : 'bg-amber-400'}`} />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-white">{selectedPresenceUser.name}</h4>
                        <p className="text-[9px] font-mono text-[#818CF8] bg-violet-950/40 px-1 py-0.2 rounded inline-block uppercase tracking-wider">{selectedPresenceUser.role}</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedPresenceUser(null)} className="text-slate-500 hover:text-white p-0.5 rounded cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2 text-xs border-t border-slate-900 pt-2.5 pb-1">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span className="text-[10px]">Email:</span>
                      <span className="text-[11px] text-slate-200 truncate">{selectedPresenceUser.email}</span>
                    </div>
                    {selectedPresenceUser.customStatus && (
                      <div className="p-1.5 bg-[#070b13] border border-slate-900 rounded text-[11px] text-violet-300 italic flex items-center gap-1">
                        <span>💬</span>
                        <span className="truncate">"{selectedPresenceUser.customStatus}"</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] text-slate-500">Last seen activity: Just now</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setCurrentScreen('workspace');
                      setDmTargetUser(selectedPresenceUser);
                      setSelectedPresenceUser(null);
                      triggerToast(`DM Initialized`, `Switched active talk workspace context with ${selectedPresenceUser.name}.`);
                    }}
                    className="w-full mt-3 bg-violet-650 hover:bg-violet-600 text-white font-bold text-xs py-1.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message Direct DM</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Middle Nav switches */}
          <div className="order-3 flex w-full items-center gap-1 overflow-x-auto sm:order-none sm:w-auto" id="chrome-center-nav">
            <button 
              onClick={() => setCurrentScreen('workspace')}
              className={`shrink-0 px-3 py-1.5 rounded-md text-[11px] font-bold select-none cursor-pointer transition ${currentScreen === 'workspace' ? 'bg-[#1E293B] text-white shadow-md' : 'text-slate-450 hover:text-white'}`}
            >
              <span className="sm:hidden">Work</span>
              <span className="hidden sm:inline">Collaborate Panel</span>
            </button>

            {currentUser.role === 'admin' && <button 
              onClick={() => setCurrentScreen('admin')}
              className={`shrink-0 px-3 py-1.5 rounded-md text-[11px] font-bold select-none cursor-pointer transition ${currentScreen === 'admin' ? 'bg-[#1E293B] text-white shadow-md' : 'text-slate-455 hover:text-white'}`}
            >
              <span className="sm:hidden">Admin</span>
              <span className="hidden sm:inline">Security & Controls</span>
            </button>}

            <button 
              onClick={() => setCurrentScreen('marketplace')}
              className={`shrink-0 px-3 py-1.5 rounded-md text-[11px] font-bold select-none cursor-pointer transition ${currentScreen === 'marketplace' ? 'bg-[#1E293B] text-white shadow-md' : 'text-slate-455 hover:text-white'}`}
            >
              <span className="sm:hidden">Apps</span>
              <span className="hidden sm:inline">Ecosystem</span>
            </button>
          </div>

          {/* Right Action tray / switches */}
          <div className="flex items-center gap-2 relative">
            
            {/* Simulation Catalyst Trigger */}
            <button
              onClick={simulateCoworkerAction}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#10192C]/90 hover:bg-[#16223D] text-[10.5px] font-bold text-cyan-400 border border-slate-800 rounded-lg cursor-pointer hover:border-cyan-500/30 transition shadow-inner"
              title="Click to simulate random team webhook updates (tests real-time notifications)"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              <span className="hidden sm:inline">Simulate Event</span>
            </button>

            {/* Notification Center Popover */}
            <div className="relative">
              <button
                onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                className={`p-2 rounded bg-[#10192D] border border-slate-800 hover:border-slate-705 text-slate-400 hover:text-white transition cursor-pointer relative ${notifications.some(n => !n.isRead) ? 'text-violet-400' : ''}`}
                title="Workspace Notification Hub"
              >
                <Bell className={`w-3.5 h-3.5 ${notifications.some(n => !n.isRead) ? 'animate-bounce text-violet-400' : ''}`} />
                {notifications.some(n => !n.isRead) && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 font-mono text-[9px] font-extrabold text-white animate-pulse">
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </button>

              {isNotifDropdownOpen && (
                <div id="notifications-popover-tray" className="fixed right-3 top-16 mt-2 bg-[#0e1627] border border-slate-800 rounded-xl shadow-2xl w-[calc(100vw-1.5rem)] max-w-sm sm:absolute sm:right-0 sm:top-auto sm:w-96 overflow-hidden z-45 animate-fade-in">
                  
                  {/* Header */}
                  <div className="p-3 bg-slate-950/40 border-b border-indigo-950/40 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-violet-400" />
                      <span className="font-bold text-xs text-white">Workspace Activity Feed</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={handleMarkAllAsRead} 
                        className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 font-sans cursor-pointer"
                      >
                        Read All
                      </button>
                      <span className="text-slate-800 text-xs font-mono">|</span>
                      <button 
                        onClick={handleClearAllNotifications} 
                        className="text-[10px] font-bold text-rose-400 hover:text-rose-350 font-sans cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* List Feed */}
                  <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-900" id="notification-items-feed">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-xs italic">
                        <Check className="w-8 h-8 mx-auto text-emerald-500/30 mb-2" />
                        <span>No new workspace alerts! Simulating actions creates some.</span>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => handleNotificationClick(n)}
                          className={`p-3 hover:bg-slate-900/60 transition cursor-pointer text-left flex gap-3 relative ${!n.isRead ? 'bg-indigo-950/15' : ''}`}
                        >
                          {!n.isRead && (
                            <span className="absolute left-1.5 top-4 h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                          )}

                          {n.user ? (
                            <img src={n.user.avatar} alt={n.user.name} className="w-8 h-8 rounded-full border border-slate-800 object-cover mt-0.5 shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#1e293b] flex items-center justify-center border border-slate-800 text-indigo-400 text-xs shrink-0 font-mono">
                              ⚙️
                            </div>
                          )}

                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className={`text-[11px] font-bold truncate block ${!n.isRead ? 'text-white' : 'text-slate-350'}`}>{n.title}</span>
                              <span className="text-[9px] text-slate-550 font-mono shrink-0 ml-1.5">{n.timestamp}</span>
                            </div>
                            <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans line-clamp-2">{n.body}</p>
                            
                            {/* Target bubble helper */}
                            {n.actionData && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-cyan-400 font-mono mt-1 bg-slate-950/40 px-1.5 py-0.2 rounded border border-indigo-950/20">
                                {n.actionData.type === 'doc' ? '📄 specifications document' : n.actionData.type === 'task' ? '🚀 linear task pipeline' : '💬 chat connection'}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Micro sliders trigger backdrop */}
            <button 
              onClick={() => setIsAppearanceModalOpen(true)}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-705 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Personalization controls"
            >
              <Sliders className="w-4 h-4 text-violet-400 animate-pulse" />
            </button>
            <button onClick={logout} className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white" title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* APPLICATION MAIN PORT */}
        <div className="flex-1 min-h-0 flex overflow-hidden z-20 relative">
          {currentScreen === 'workspace' && (
            <WorkspaceDashboard 
              currentUser={currentUser}
              users={users}
              onUpdateCurrentUser={(updated) => {
                setCurrentUser(updated);
                setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
              }}
              onUpdateUsersList={(updatedList) => setUsers(updatedList)}
              channels={channels}
              documents={mockDocuments}
              tasks={mockTasks}
              messages={[]}
              appearance={appearance}
              onOpenSettings={() => setIsAppearanceModalOpen(true)}
              onOpenAdmin={() => setCurrentScreen('admin')}
              onOpenMarketplace={() => setCurrentScreen('marketplace')}
              dmTargetUser={dmTargetUser}
              onClearDmTargetUser={() => setDmTargetUser(null)}
              activeDocTarget={docTarget}
              onClearDocTarget={() => setDocTarget(null)}
            />
          )}

          {currentScreen === 'admin' && currentUser.role === 'admin' && (
            <AdminConsole 
              currentUser={currentUser}
              workspaceUsers={users}
              onUpdateWhiteLabel={handleUpdateWhiteLabel}
              whiteLabel={whiteLabel}
            />
          )}

          {currentScreen === 'marketplace' && (
            <AppMarketplace />
          )}
        </div>

      </div>

      {/* APPEARANCE SETTINGS DRAWER MODAL */}
      {isAppearanceModalOpen && (
        <div id="appearance-drawer-backdrop" className="fixed inset-0 bg-[#020617]/70 backdrop-blur-md z-50 flex items-center justify-end">
          <div 
            id="appearance-drawer-pane"
            className="w-full max-w-md bg-slate-950 border-l border-slate-800/80 h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200"
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-6">
                <span className="font-bold text-sm text-slate-100 flex items-center gap-1.5 font-mono uppercase tracking-wide">
                  Appearance Studio
                </span>
                <button 
                  onClick={() => setIsAppearanceModalOpen(false)}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-350 cursor-pointer"
                >
                  Close X
                </button>
              </div>

              <AppearanceSettings 
                preferences={appearance}
                onUpdatePreferences={handleUpdateAppearance}
              />
            </div>

            <div className="pt-6 border-t border-slate-900/60 mt-6 flex justify-end">
              <button 
                onClick={() => setIsAppearanceModalOpen(false)}
                className="px-5 py-2 rounded bg-violet-605 text-white font-bold text-xs hover:bg-violet-600 shadow shadow-violet-955/20 cursor-pointer active:scale-98 transition-all"
              >
                Approve Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL SEARCH COMMAND PALETTE MODAL */}
      <GlobalSearch 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        channels={channels}
        documents={mockDocuments}
        tasks={mockTasks}
        onSelectChannel={handleSelectChannelFromSearch}
        onSelectDocument={handleSelectDocFromSearch}
        onSelectTask={handleSelectTaskFromSearch}
      />

      {/* Floating Push Notification Toast Portal */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none" id="toasts-portal">
        {toasts.map(t => (
          <div 
            key={t.id}
            className="p-3.5 border border-indigo-550/40 rounded-xl shadow-2xl flex items-start gap-3 pointer-events-auto animate-fade-in relative transition-all duration-200 select-text"
            style={{ 
              backgroundImage: 'linear-gradient(135deg, rgba(8, 12, 22, 0.95), rgba(15, 23, 42, 0.95))',
              borderColor: 'rgba(99, 102, 241, 0.3)'
            }}
          >
            {t.avatar ? (
              <img src={t.avatar} alt="Sender avatar" className="w-8 h-8 rounded-full border border-slate-800 object-cover shrink-0 mt-0.5" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 font-mono text-xs font-bold shrink-0">
                🔔
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="font-bold text-[9px] text-[#818CF8] block font-mono uppercase tracking-wider">COLLABORATIVE NOTIFICATION</span>
              <span className="font-bold text-xs text-slate-100 block mt-0.5 leading-snug">{t.title}</span>
              <p className="text-[10.5px] text-slate-400 leading-normal mt-0.5 font-sans break-words">{t.body}</p>
            </div>
            <button 
              onClick={() => setToasts(prev => prev.filter(toast => toast.id !== t.id))}
              className="text-slate-500 hover:text-white p-0.5 rounded cursor-pointer self-start shrink-0 transition"
              title="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
