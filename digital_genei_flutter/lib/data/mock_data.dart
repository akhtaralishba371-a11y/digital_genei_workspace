import '../models/models.dart';

class MockData {
  // ── Users ─────────────────────────────────────────────────────────────────
  static final u1 = WorkspaceUser(
    id: 'u1', name: 'Sarah Chen', email: 'sarah.chen@teamsync.io',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    role: UserRole.admin, status: UserStatus.online,
    customStatus: '⚡ Building the future',
  );
  static final u2 = WorkspaceUser(
    id: 'u2', name: 'Marcus Vance', email: 'marcus.v@teamsync.io',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    role: UserRole.member, status: UserStatus.busy,
    customStatus: '⚡ Deep Work Mode (DND)',
  );
  static final u3 = WorkspaceUser(
    id: 'u3', name: 'Elena Rostova', email: 'elena.r@teamsync.io',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    role: UserRole.member, status: UserStatus.online,
    customStatus: '🔒 Compliance Review',
  );
  static final u4 = WorkspaceUser(
    id: 'u4', name: 'Devon Miller', email: 'devon.m@teamsync.io',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    role: UserRole.member, status: UserStatus.away,
    customStatus: '🍜 On Lunch break',
  );

  static List<WorkspaceUser> get users => [u1, u2, u3, u4];
  static WorkspaceUser get currentUser => u1;

  static WorkspaceUser userById(String id) =>
      users.firstWhere((u) => u.id == id, orElse: () => u1);

  static String dmChannelId(String a, String b) {
    final ids = [a, b]..sort();
    return 'dm-${ids[0]}-${ids[1]}';
  }

  // ── Channels ─────────────────────────────────────────────────────────────
  static final channels = <Channel>[
    Channel(id: 'c1', name: 'general',             description: 'Company-wide announcements and watercooler conversations.',   isPrivate: false, unreadCount: 3),
    Channel(id: 'c2', name: 'engineering-hq',      description: 'Engineering discussions, code reviews and technical syncs.',  isPrivate: false, unreadCount: 1),
    Channel(id: 'c3', name: 'product-roadmap',     description: 'Product specs, roadmap planning and feature prioritization.', isPrivate: false),
    Channel(id: 'c4', name: 'security-compliance', description: 'SOC-2, ISO-27001, SCIM, SSO and security discussions.',      isPrivate: true),
    Channel(id: 'c5', name: 'marketing-creative',  description: 'Brand assets, campaigns and creative direction.',             isPrivate: false),
  ];

  // ── Messages ─────────────────────────────────────────────────────────────
  static List<Message> get messages => [
    Message(
      id: 'm1', channelId: 'c1', user: u1,
      content: 'Good morning team! 👋 Sprint 24 planning is starting today. Please add your capacity estimates to the board by EOD.',
      timestamp: '09:02 AM',
      reactions: [
        MessageReaction(emoji: '👍', userNames: ['Marcus Vance']),
        MessageReaction(emoji: '🔥', userNames: ['Elena Rostova']),
      ],
      isPinned: true,
      aiSummary: 'Sarah requests sprint 24 capacity estimates from all team members by end of day.',
    ),
    Message(
      id: 'm2', channelId: 'c1', user: u2,
      content: 'On it! Also — I\'ve pushed the SCIM group-mapping engine spec to the docs section. Would appreciate a quick review from @Sarah and @Elena before we lock the design.',
      timestamp: '09:10 AM',
      reactions: [MessageReaction(emoji: '🚀', userNames: ['Devon Miller'])],
    ),
    Message(
      id: 'm3', channelId: 'c1', user: u3,
      content: 'Hi team — compliance checkpoints are fully green 🟢. I\'ve uploaded the ISO-27001 framework to the Secure Vault. TLS proxy configs look solid.',
      timestamp: '09:18 AM',
      reactions: [MessageReaction(emoji: '✅', userNames: ['Sarah Chen', 'Marcus Vance'])],
    ),
    Message(
      id: 'm4', channelId: 'c1', user: u1,
      content: 'Amazing work Elena! @Marcus I\'ll review the SCIM spec this afternoon. Quick heads up — the Sentry error-rate threshold needs adjustment before next deploy.',
      timestamp: '09:35 AM',
    ),
    Message(
      id: 'm5', channelId: 'c1', user: u4,
      content: 'Just wrapped the new onboarding brand assets. Figma file uploaded to Vault — 34.5MB. Check the new color system and typography scale.',
      timestamp: '10:05 AM',
      reactions: [MessageReaction(emoji: '🎉', userNames: ['Sarah Chen'])],
    ),
    Message(
      id: 'm6', channelId: 'c2', user: u2,
      content: 'New PR up for review:\n```\nconst scimMapGroups = async (tenant: string) => {\n  const groups = await fetchADGroups(tenant);\n  return groups.map(g => ({ id: g.objectId, name: g.displayName }));\n};\n```\nTargeting <200ms avg response.',
      timestamp: '08:45 AM',
    ),
    Message(
      id: 'm7', channelId: 'c2', user: u1,
      content: 'Looks clean Marcus! One suggestion:\n- Add error boundary for AD timeout cases\n- Consider caching groups with 5min TTL\n\n> The SCIM spec doc has the full failure mode table',
      timestamp: '09:20 AM',
      repliesCount: 2,
    ),
    // DMs
    Message(
      id: 'dm1', channelId: 'dm-u1-u2', user: u2,
      content: 'Hey Sarah! Do you have a moment to review the SCIM group mapping spec? I added some initial thoughts on active directory sync logic.',
      timestamp: '10:15 AM',
    ),
    Message(
      id: 'dm2', channelId: 'dm-u1-u2', user: u1,
      content: 'Definitely Marcus! Send over the link or tell me what documentation page to check. Let\'s align on the security parameters.',
      timestamp: '10:20 AM',
    ),
    Message(
      id: 'dm3', channelId: 'dm-u1-u3', user: u3,
      content: 'Hi Sarah, compliance checkpoints are fully green. I\'ve uploaded the ISO guidelines. Let me know if we need to adjust the audit schedule.',
      timestamp: 'Yesterday 5:12 PM',
    ),
  ];

  // ── Documents ─────────────────────────────────────────────────────────────
  static List<WorkspaceDoc> get documents => [
    WorkspaceDoc(
      id: 'doc1', title: 'Enterprise Product Specification', emoji: '📐',
      isFavorite: true, updatedAt: 'Today, 9:25 AM', updatedBy: u2,
      blocks: const [
        DocBlock(id: 'b1', type: 'heading1', content: 'Enterprise Product Specification'),
        DocBlock(id: 'b2', type: 'callout',  content: '🚀 This document outlines the full technical specification for FLOW Enterprise v2.0, targeting Fortune 500 deployments.'),
        DocBlock(id: 'b3', type: 'heading2', content: 'SCIM Group Mapping Engine'),
        DocBlock(id: 'b4', type: 'text',     content: 'The SCIM 2.0 provisioning layer must automatically synchronize user groups from Active Directory with sub-200ms latency.'),
        DocBlock(id: 'b5', type: 'bullet',   content: 'Support SCIM 2.0 RFC 7643/7644 compliance'),
        DocBlock(id: 'b6', type: 'bullet',   content: 'Bidirectional sync with conflict resolution'),
        DocBlock(id: 'b7', type: 'bullet',   content: 'Webhook-based real-time provisioning events'),
        DocBlock(id: 'b8', type: 'code',     content: 'const scimSync = async (tenantId: string) => {\n  const groups = await fetchADGroups(tenantId);\n  return groups.map(g => mapToWorkspaceRole(g));\n};', language: 'typescript'),
        DocBlock(id: 'b9', type: 'heading2', content: 'Security Requirements'),
        DocBlock(id: 'b10', type: 'checklist', content: 'TLS 1.3 enforced on all API endpoints', checked: true),
        DocBlock(id: 'b11', type: 'checklist', content: 'AES-256 encryption at rest', checked: true),
        DocBlock(id: 'b12', type: 'checklist', content: 'SAML 2.0 SSO integration verified', checked: false),
      ],
    ),
    WorkspaceDoc(
      id: 'doc2', title: 'ISO-27001 Compliance Guidelines', emoji: '🛡️',
      isFavorite: true, updatedAt: 'Yesterday, 4:12 PM', updatedBy: u3,
      blocks: const [
        DocBlock(id: 'c1', type: 'heading1', content: 'ISO-27001 Compliance Framework'),
        DocBlock(id: 'c2', type: 'callout',  content: '⚠️ Deadline: Full compliance audit scheduled for June 15, 2026 at 5:00 PM.'),
        DocBlock(id: 'c3', type: 'heading2', content: 'Information Security Policy'),
        DocBlock(id: 'c4', type: 'text',     content: 'All team members must adhere to the information security policy outlined in this document.'),
        DocBlock(id: 'c5', type: 'bullet',   content: 'Classify all data assets by sensitivity level'),
        DocBlock(id: 'c6', type: 'bullet',   content: 'Report security incidents within 24 hours'),
        DocBlock(id: 'c7', type: 'bullet',   content: 'Complete annual security awareness training'),
      ],
    ),
    WorkspaceDoc(
      id: 'doc3', title: 'Mobile Onboarding Flow — Design Spec', emoji: '📱',
      isFavorite: false, updatedAt: 'Jun 4, 2026', updatedBy: u4,
      blocks: const [
        DocBlock(id: 'd1', type: 'heading1', content: 'Mobile Onboarding Flow v2.0'),
        DocBlock(id: 'd2', type: 'text',     content: 'Redesigned onboarding experience focusing on biometric setup and workspace personalization.'),
        DocBlock(id: 'd3', type: 'heading2', content: 'Step 1: Welcome Screen'),
        DocBlock(id: 'd4', type: 'checklist', content: 'Single CTA button design', checked: true),
        DocBlock(id: 'd5', type: 'checklist', content: 'SSO integration prompt',   checked: false),
      ],
    ),
  ];

  // ── Tasks ─────────────────────────────────────────────────────────────────
  static List<TeamTask> get tasks => [
    TeamTask(id: 't1', title: 'Implement SCIM 2.0 group provisioning',
      description: 'Build automated SCIM group-mapping engine for Azure AD sync.',
      status: TaskStatus.inProgress, priority: TaskPriority.urgent,
      dueDate: 'Jun 15', assignees: [u2], project: 'IAM Integration', sprint: 'Sprint 24'),
    TeamTask(id: 't2', title: 'ISO-27001 audit trail logging',
      description: 'Add comprehensive audit logs for all admin actions.',
      status: TaskStatus.inProgress, priority: TaskPriority.high,
      dueDate: 'Jun 14', assignees: [u3], project: 'Security', sprint: 'Sprint 24'),
    TeamTask(id: 't3', title: 'Sentry error-rate threshold adjustment',
      description: 'Calibrate Sentry transaction tracking thresholds for production.',
      status: TaskStatus.todo, priority: TaskPriority.high,
      dueDate: 'Jun 18', assignees: [u2, u4], project: 'DevOps', sprint: 'Sprint 24'),
    TeamTask(id: 't4', title: 'Onboarding flow redesign — mobile',
      description: 'Implement new biometric prompt design with glass-morphism overlay.',
      status: TaskStatus.todo, priority: TaskPriority.medium,
      dueDate: 'Jun 20', assignees: [u4], project: 'Mobile', sprint: 'Sprint 24'),
    TeamTask(id: 't5', title: 'White-label domain CNAME setup',
      description: 'Configure DNS routing for enterprise custom domain mapping.',
      status: TaskStatus.backlog, priority: TaskPriority.medium,
      dueDate: 'Jun 25', assignees: [u1], project: 'Infrastructure'),
    TeamTask(id: 't6', title: 'Sprint 23 retrospective docs',
      description: 'Document sprint 23 learnings and improvement actions.',
      status: TaskStatus.done, priority: TaskPriority.low,
      dueDate: 'Jun 10', assignees: [u1, u2], project: 'Process', sprint: 'Sprint 23'),
  ];

  // ── Activity Logs ─────────────────────────────────────────────────────────
  static const activityLogs = <ActivityLog>[
    ActivityLog(id: 'al1', userName: 'Sarah Chen',    action: 'Signed in via SSO',                  target: 'Admin Console',       ip: '192.168.1.42',  timestamp: 'Today 09:01 AM', device: 'MacBook Pro'),
    ActivityLog(id: 'al2', userName: 'Marcus Vance',  action: 'Uploaded SCIM config',               target: 'Secure Vault',        ip: '10.0.0.88',     timestamp: 'Today 09:25 AM', device: 'Windows 11'),
    ActivityLog(id: 'al3', userName: 'Elena Rostova', action: 'Reviewed ISO compliance doc',         target: 'ISO-27001 Guidelines',ip: '172.16.0.5',    timestamp: 'Today 09:48 AM', device: 'Ubuntu 22'),
    ActivityLog(id: 'al4', userName: 'Sarah Chen',    action: 'Provisioned new member seat',         target: 'User Directory',      ip: '192.168.1.42',  timestamp: 'Today 10:12 AM', device: 'MacBook Pro'),
    ActivityLog(id: 'al5', userName: 'Devon Miller',  action: 'Exported branding assets to Vault',   target: 'Cloud Drive',         ip: '10.0.0.91',     timestamp: 'Today 10:33 AM', device: 'MacBook Air'),
  ];

  // ── Marketplace Apps ─────────────────────────────────────────────────────
  static const marketplaceApps = <MarketplaceApp>[
    MarketplaceApp(id: 'app1', name: 'GitHub',         description: 'Connect repos, track PRs and deployment status directly in channels.',           vendor: 'GitHub Inc.',          rating: 4.9, isInstalled: true),
    MarketplaceApp(id: 'app2', name: 'Jira',           description: 'Sync sprint tickets, update issue status and view backlogs without leaving.',    vendor: 'Atlassian',            rating: 4.7, isInstalled: true),
    MarketplaceApp(id: 'app3', name: 'Figma',          description: 'Embed live design frames, share prototypes and collect async feedback easily.',  vendor: 'Figma Inc.',           rating: 4.8, isInstalled: false),
    MarketplaceApp(id: 'app4', name: 'Google Calendar',description: 'Sync team events, set standup reminders and schedule huddles automatically.',   vendor: 'Google LLC',           rating: 4.6, isInstalled: true),
    MarketplaceApp(id: 'app5', name: 'Datadog',        description: 'Stream live error logs, alert on SLA breaches and monitor system health.',       vendor: 'Datadog Inc.',         rating: 4.5, isInstalled: false),
    MarketplaceApp(id: 'app6', name: 'Stripe',         description: 'View billing events, chargeback alerts and revenue dashboards in-app.',          vendor: 'Stripe Inc.',          rating: 4.6, isInstalled: false),
    MarketplaceApp(id: 'app7', name: 'Okta',           description: 'Enforce SAML SSO, SCIM provisioning and multi-factor policies at scale.',        vendor: 'Okta Inc.',            rating: 4.8, isInstalled: true),
    MarketplaceApp(id: 'app8', name: 'Loom',           description: 'Record async video walkthroughs and attach them directly to threads and docs.',  vendor: 'Loom Inc.',            rating: 4.4, isInstalled: false),
    MarketplaceApp(id: 'app9', name: 'Notion',         description: 'Embed Notion pages, sync databases and trigger page updates from chat.',         vendor: 'Notion Labs',          rating: 4.7, isInstalled: false),
  ];
}
