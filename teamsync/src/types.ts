/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'member' | 'guest' | 'billing';
  status: 'online' | 'away' | 'offline' | 'busy';
  customStatus?: string;
}

export type ThemeType = 'dark' | 'light' | 'system';

export interface AppearancePreferences {
  theme: ThemeType;
  accentColor: string; // hex code
  accentName: string; // e.g. Purple, Ocean, Emerald, Amber, Rose
  sidebarDensity: 'cozy' | 'compact';
  chatDensity: 'comfortable' | 'compact';
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  fontFamily: 'sans' | 'display' | 'mono';
  glassmorphismStrength: number; // 0 to 100
  animationStrength: number; // 0 to 100
  reducedMotion: boolean;
  wallpaper: string; // 'none' | 'aurora' | 'cyberpunk' | 'nebula' | 'light-gradient'
}

export interface WhiteLabelConfig {
  companyName: string;
  companyLogo: string; // base64 or URL
  favicon: string;
  customDomain: string;
  accentBrandColor: string;
  loginHeroText: string;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  teamSpaceId?: string;
  unreadCount?: number;
}

export interface MessageReaction {
  emoji: string;
  userNames: string[];
}

export interface Message {
  id: string;
  channelId: string;
  userId: string;
  user: User;
  content: string;
  timestamp: string;
  reactions?: MessageReaction[];
  files?: Array<{ name: string; size: string; type: string; url?: string }>;
  isPinned?: boolean;
  repliesCount?: number;
  aiSummary?: string;
  audioDuration?: string; // If audio message
}

export interface Document {
  id: string;
  title: string;
  emoji: string;
  updatedAt: string;
  updatedBy: User;
  isFavorite: boolean;
  blocks: DocBlock[];
  workspaceId: string;
}

export interface DocBlock {
  id: string;
  type: 'text' | 'heading1' | 'heading2' | 'bullet' | 'checklist' | 'code' | 'callout' | 'table';
  content: string;
  checked?: boolean; // checklist block
  language?: string; // code block
  tableRows?: string[][]; // table block
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  assignees: User[];
  project: string;
  timeSpentMinutes?: number;
  timeEstimateMinutes?: number;
  sprint?: string;
  dependencies?: string[]; // IDs of tasks
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
  ip: string;
  timestamp: string;
  device: string;
}

export interface MarketplaceApp {
  id: string;
  name: string;
  description: string;
  category: 'productivity' | 'development' | 'communication' | 'file_storage' | 'marketing';
  icon: string; // lucide name or custom string
  isInstalled: boolean;
  rating: number;
  reviewsCount: number;
  vendor: string;
  permissionsProposed: string[];
}

export interface BillingConfig {
  planName: 'Starter' | 'Business' | 'Enterprise';
  currentSeats: number;
  maxSeats: number;
  billingCycle: 'monthly' | 'yearly';
  nextInvoiceDate: string;
  nextInvoiceAmount: number;
  paymentMethod: {
    brand: string;
    last4: string;
  };
}
