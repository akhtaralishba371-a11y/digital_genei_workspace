/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Channel, Message, Document, Task, ActivityLog, MarketplaceApp, BillingConfig, AppearancePreferences, WhiteLabelConfig } from '../types';

export const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Sarah Chen',
    email: 'sarah.chen@teamsync.io',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    role: 'admin',
    status: 'online',
    customStatus: '🚀 Launching v2.4'
  },
  {
    id: 'u2',
    name: 'Marcus Vance',
    email: 'marcus.vance@teamsync.io',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    role: 'member',
    status: 'busy',
    customStatus: '🎧 Deep Work Mode'
  },
  {
    id: 'u3',
    name: 'Elena Rostova',
    email: 'elena.r@teamsync.io',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: 'member',
    status: 'online',
    customStatus: '☕ Grinding'
  },
  {
    id: 'u4',
    name: 'Devon Miller',
    email: 'devon.m@teamsync.io',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    role: 'member',
    status: 'away',
    customStatus: '🌴 OOO returning tomorrow'
  },
  {
    id: 'u5',
    name: 'Aiden Taylor',
    email: 'aiden.taylor@teamsync.io',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    role: 'guest',
    status: 'offline',
  }
];

export const mockCurrentUser: User = mockUsers[0];

export const defaultAppearance: AppearancePreferences = {
  theme: 'dark',
  accentColor: '#8B5CF6', // Purple
  accentName: 'Purple',
  sidebarDensity: 'cozy',
  chatDensity: 'comfortable',
  fontSize: 'md',
  fontFamily: 'sans',
  glassmorphismStrength: 75,
  animationStrength: 80,
  reducedMotion: false,
  wallpaper: 'aurora'
};

export const defaultWhiteLabel: WhiteLabelConfig = {
  companyName: 'FLOW Corp',
  companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&q=80',
  favicon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=32&q=80',
  customDomain: 'sync.enterprise.teamsync-app.com',
  accentBrandColor: '#8B5CF6',
  loginHeroText: 'Smarter Workflows. Connected Teams. Global Impact.'
};

export const mockChannels: Channel[] = [
  { id: 'c1', name: 'general', description: 'Company-wide announcements and shared conversations', isPrivate: false },
  { id: 'c2', name: 'engineering-hq', description: 'Technical design reviews and continuous deployment alerts', isPrivate: false },
  { id: 'c3', name: 'product-roadmap', description: 'Linear sprint logs and customer experience goals', isPrivate: false },
  { id: 'c4', name: 'security-compliance', description: 'SSO setup, audit schedules and policy reports', isPrivate: true, unreadCount: 2 },
  { id: 'c5', name: 'marketing-creative', description: 'Figma reviews, ad campaigns and asset sharing', isPrivate: false }
];

export const mockMessages: Message[] = [
  {
    id: 'm1',
    channelId: 'c1',
    userId: 'u2',
    user: mockUsers[1],
    content: 'Good morning team! Dynamic theme configs and live assets are looking pristine for today’s Board of Directors review. Did anyone fetch the latest report from the compliance channel?',
    timestamp: '08:42 AM',
    reactions: [
      { emoji: '💡', userNames: ['Sarah Chen', 'Elena Rostova'] },
      { emoji: '🚀', userNames: ['Devon Miller'] }
    ]
  },
  {
    id: 'm2',
    channelId: 'c1',
    userId: 'u3',
    user: mockUsers[2],
    content: 'Yes! I have prepared a summary of the compliance report. It is stored inside the Notion document *Security Charter 2026*. Let me share the attachment here!',
    timestamp: '08:45 AM',
    files: [
      { name: 'Security-Charter-2026.pdf', size: '2.4 MB', type: 'pdf' }
    ],
    repliesCount: 4,
    aiSummary: 'Elena confirmed the Security Charter 2026 PDF document is complete and attached inside general channel.'
  },
  {
    id: 'm3',
    channelId: 'c1',
    userId: 'u1',
    user: mockUsers[0],
    content: 'Excellent, Elena. I reviewed it and annotated the timeline. I’ve launched an AI digest for the team briefing at 10 AM. Let’s keep pushing forward!',
    timestamp: '09:02 AM',
    isPinned: true
  },
  {
    id: 'm4',
    channelId: 'c2',
    userId: 'u3',
    user: mockUsers[2],
    content: 'Hey devs, the CI/CD pipeline failed on cluster `prod-ap-east`. It seems there is a mismatch on the JWT secrets. Anyone troubleshooting this?',
    timestamp: 'Yesterday at 4:12 PM',
  },
  {
    id: 'm5',
    channelId: 'c2',
    userId: 'u2',
    user: mockUsers[1],
    content: 'Checking that. I ran a terminal scan and it seems the vault key rotated pre-emptively. Rolling config back to safe state. Listen to my soundclip explaining the incident flow:',
    timestamp: 'Yesterday at 4:20 PM',
    audioDuration: '0:34',
    aiSummary: 'Marcus reverted a pre-emptive vault key rotation that caused deployment failures on cluster prod-ap-east.'
  }
];

export const mockDocuments: Document[] = [
  {
    id: 'd1',
    title: 'Enterprise Product Specification',
    emoji: '📘',
    updatedAt: '10 mins ago',
    updatedBy: mockUsers[0],
    isFavorite: true,
    workspaceId: 'w1',
    blocks: [
      { id: 'b1', type: 'heading1', content: '📘 FLOW Enterprise Specification' },
      { id: 'b2', type: 'callout', content: '💡 This document defines our global compliance milestones and security standards across multi-region architectures.' },
      { id: 'b3', type: 'heading2', content: 'Architecture Principles' },
      { id: 'b4', type: 'text', content: 'The FLOW front-end is optimized using sub-divided modules to guarantee token safety, prevent infinite loop risks, and render beautiful responsive layouts securely.' },
      { id: 'b5', type: 'checklist', content: 'Refine high-performance layout rendering engine', checked: true },
      { id: 'b6', type: 'checklist', content: 'Configure 2FA token generation inside admin suite', checked: false },
      { id: 'b7', type: 'code', content: 'const authHeaders = {\n  "Authorization": `Bearer ${token}`,\n  "X-Device-Id": clientDeviceFingerprint\n};', language: 'typescript' }
    ]
  },
  {
    id: 'd2',
    title: 'Security Charter & ISO Compliance',
    emoji: '🔐',
    updatedAt: '2 hours ago',
    updatedBy: mockUsers[1],
    isFavorite: false,
    workspaceId: 'w1',
    blocks: [
      { id: 'cb1', type: 'heading1', content: '🔐 Security & Enterprise Isolation Charter' },
      { id: 'cb2', type: 'text', content: 'FLOW guarantees isolated database instances, end-to-end envelope encryption, and comprehensive role mapping. Access keys are stored in encrypted client structures.' },
      { id: 'cb3', type: 'heading2', content: 'Core Audit Mandates' },
      { id: 'cb4', type: 'bullet', content: 'Audit logging for every role configuration modification.' },
      { id: 'cb5', type: 'bullet', content: 'Automated sessions termination policies.' }
    ]
  }
];

export const mockTasks: Task[] = [
  {
    id: 't1',
    title: 'Migrate active clients to HTTPS standard proxies',
    description: 'Ensure double-layer TLS termination parameters are deployed on both regional gateways and VPC tunnels.',
    status: 'in_progress',
    priority: 'urgent',
    dueDate: '2026-06-15',
    assignees: [mockUsers[0], mockUsers[1]],
    project: 'SaaS Expansion',
    timeSpentMinutes: 180,
    timeEstimateMinutes: 300,
    sprint: 'Sprint 24',
    dependencies: []
  },
  {
    id: 't2',
    title: 'Build automated SCIM group-mapping engine',
    description: 'Provide custom enterprise mappings to convert Active Directory attributes directly into workspace permissions.',
    status: 'todo',
    priority: 'high',
    dueDate: '2026-06-20',
    assignees: [mockUsers[2]],
    project: 'IAM Integration',
    timeSpentMinutes: 0,
    timeEstimateMinutes: 480,
    sprint: 'Sprint 24'
  },
  {
    id: 't3',
    title: 'Design glassmorphic branding wallpaper defaults',
    description: 'Produce pre-rendered vector meshes that support real-time CSS overlay adjustments and dark/light dynamic switches.',
    status: 'done',
    priority: 'medium',
    dueDate: '2026-06-05',
    assignees: [mockUsers[0], mockUsers[3]],
    project: 'Visual Refresh',
    timeSpentMinutes: 240,
    timeEstimateMinutes: 240,
    sprint: 'Sprint 23'
  },
  {
    id: 't4',
    title: 'Sentry transaction tracking threshold adjustments',
    description: 'Filter transaction noise down to 1% sample rate on high-rate analytics callbacks.',
    status: 'backlog',
    priority: 'low',
    dueDate: '2026-07-01',
    assignees: [],
    project: 'SaaS Expansion'
  }
];

export const mockActivityLogs: ActivityLog[] = [
  { id: 'l1', userId: 'u1', userName: 'Sarah Chen', action: 'Rotated JWT Private Secret', target: 'Environment Variables', ip: '184.22.45.101', timestamp: '2026-06-08 09:12 AM', device: 'iOS Applet (Safari Mobile)' },
  { id: 'l2', userId: 'u1', userName: 'Sarah Chen', action: 'Configured Custom Domain Lookup', target: 'DNS Setup ("sync.enterprise.teamsync-app.com")', ip: '184.22.45.101', timestamp: '2026-06-08 08:30 AM', device: 'macOS Client v4.11' },
  { id: 'l3', userId: 'u2', userName: 'Marcus Vance', action: 'Updated Workspace Billing Method', target: 'Stripe Gateway Seat Allocation', ip: '98.114.22.9', timestamp: '2026-06-07 14:15 PM', device: 'Windows 11 Workstation' },
  { id: 'l4', userId: 'u4', userName: 'Devon Miller', action: 'Deleted Dev-Test Channel', target: 'Channel Workspace #test-garbage', ip: '45.12.83.6', timestamp: '2026-06-06 11:02 AM', device: 'Ubuntu Desktop 24.04 lts' }
];

export const mockMarketplaceApps: MarketplaceApp[] = [
  {
    id: 'm1',
    name: 'GitHub Enterprise Connector',
    description: 'Enrich conversations with automated pull request actions, commits logs, and deployment events.',
    category: 'development',
    icon: 'GithubIcon',
    isInstalled: true,
    rating: 4.8,
    reviewsCount: 1420,
    vendor: 'GitHub Enterprise Inc.',
    permissionsProposed: ['Read Repository Code', 'Read Pull Requests', 'Write Deployment Webhooks']
  },
  {
    id: 'm2',
    name: 'Jira Cloud Synchronizer',
    description: 'Synchronize Jira issue logs with FLOW task pipelines automatically.',
    category: 'productivity',
    icon: 'Layers',
    isInstalled: false,
    rating: 4.5,
    reviewsCount: 890,
    vendor: 'Atlassian Ltd.',
    permissionsProposed: ['Read Issues Metadata', 'Read Epics', 'Write Issue Status Transitions']
  },
  {
    id: 'm3',
    name: 'Google Calendar Suite',
    description: 'Coordinate schedule invitations, reserve virtual meeting channels, and trigger automated reminders in channels.',
    category: 'communication',
    icon: 'Calendar',
    isInstalled: true,
    rating: 4.9,
    reviewsCount: 3105,
    vendor: 'Google LLC',
    permissionsProposed: ['Read Calendar Events', 'Read Guest Presence Status', 'Create Event Reminders']
  },
  {
    id: 'm4',
    name: 'Figma Dev Insights',
    description: 'Embed Figma multiplayer files, view auto-generated design token variables, and track creative feedback threads.',
    category: 'marketing',
    icon: 'FigmaIcon',
    isInstalled: false,
    rating: 4.7,
    reviewsCount: 654,
    vendor: 'Figma Inc.',
    permissionsProposed: ['Read Canvas Components', 'Read Design Comments', 'Write Shared Invites']
  }
];

export const mockBillingConfig: BillingConfig = {
  planName: 'Enterprise',
  currentSeats: 480,
  maxSeats: 1000,
  billingCycle: 'yearly',
  nextInvoiceDate: 'Dec 15, 2026',
  nextInvoiceAmount: 28800.00,
  paymentMethod: {
    brand: 'Visa Business',
    last4: '9012'
  }
};
