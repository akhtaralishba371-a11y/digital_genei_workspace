import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

import 'data/mock_data.dart';
import 'models/models.dart';
// ignore_for_file: unused_import
// state/app_state.dart is intentionally minimal (main.dart is self-contained)

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      systemNavigationBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );
  runApp(const TeamSyncFlutterApp());
}

class TeamSyncFlutterApp extends StatelessWidget {
  const TeamSyncFlutterApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'FLOW',
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: AppColors.bg,
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.violet,
          brightness: Brightness.dark,
          surface: AppColors.panel,
        ),
        textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme),
      ),
      home: const TeamSyncShell(),
    );
  }
}

/// Typography system for FLOW.
/// Primary = Inter (messages, names, sidebar). Mono = Roboto Mono
/// (timestamps, code snippets, input boxes). Weights & sizes follow the spec.
class AppType {
  // Inter (primary UI font)
  static TextStyle sans({
    double fontSize = 14,
    FontWeight fontWeight = FontWeight.w400,
    Color? color,
    double? height,
    double letterSpacing = 0,
  }) => GoogleFonts.inter(
    fontSize: fontSize,
    fontWeight: fontWeight,
    color: color,
    height: height,
    letterSpacing: letterSpacing,
  );

  // Roboto Mono (timestamps, code, inputs, meta)
  static TextStyle mono({
    double fontSize = 12,
    FontWeight fontWeight = FontWeight.w400,
    Color? color,
    double? height,
    double letterSpacing = 0,
  }) => GoogleFonts.robotoMono(
    fontSize: fontSize,
    fontWeight: fontWeight,
    color: color,
    height: height,
    letterSpacing: letterSpacing,
  );

  // ── Named roles (per spec) ────────────────────────────────────────────────
  static TextStyle get message =>      // chat messages: 14px, regular
      sans(fontSize: 14, fontWeight: FontWeight.w400, color: const Color(0xFFCBD5E1), height: 1.5);
  static TextStyle get senderName =>   // names: bold 600–700
      sans(fontSize: 14, fontWeight: FontWeight.w700);
  static TextStyle get channelTitle => // headers / channel titles: 16–18px
      sans(fontSize: 17, fontWeight: FontWeight.w700);
  static TextStyle get sidebar =>      // sidebar text: 12–13px
      sans(fontSize: 13, fontWeight: FontWeight.w500);
  static TextStyle get sidebarActive =>
      sans(fontSize: 13, fontWeight: FontWeight.w600);
  static TextStyle get timestamp =>    // timestamps / meta: 11–12px mono
      mono(fontSize: 11, color: AppColors.muted);
  static TextStyle get meta =>
      mono(fontSize: 11, color: AppColors.muted);
  static TextStyle get input =>        // input boxes: mono
      mono(fontSize: 14, color: AppColors.text);
  static TextStyle get code =>         // code snippets: mono
      mono(fontSize: 13, height: 1.5, color: const Color(0xFFE2E8F0));
}

class AppColors {
  static const bg = Color(0xFF0F172A);
  static const bgDeep = Color(0xFF050811);
  static const panel = Color(0xFF121B2E);
  static const panel2 = Color(0xFF0B0F19);
  static const border = Color(0xFF1E293B);
  static const muted = Color(0xFF94A3B8);
  static const text = Color(0xFFF8FAFC);
  static const violet = Color(0xFF8B5CF6);
  static const cyan = Color(0xFF22D3EE);
  static const emerald = Color(0xFF06D6A0);
  static const rose = Color(0xFFF43F5E);
  static const amber = Color(0xFFF59E0B);
}

enum AppearanceThemeMode { dark, light, system }

enum AppearanceDensity { cozy, compact }

enum AppearanceFontSize { sm, md, lg, xl }

enum AppearanceFontFamily { sans, display, mono }

class AppearanceAccent {
  final String name;
  final Color color;

  const AppearanceAccent(this.name, this.color);
}

class AppearancePreferences {
  final AppearanceThemeMode theme;
  final AppearanceAccent accent;
  final AppearanceDensity sidebarDensity;
  final AppearanceDensity chatDensity;
  final AppearanceFontSize fontSize;
  final AppearanceFontFamily fontFamily;
  final int glassmorphismStrength;
  final int animationStrength;
  final bool reducedMotion;
  final String wallpaper;

  const AppearancePreferences({
    this.theme = AppearanceThemeMode.dark,
    this.accent = const AppearanceAccent('Purple', AppColors.violet),
    this.sidebarDensity = AppearanceDensity.cozy,
    this.chatDensity = AppearanceDensity.cozy,
    this.fontSize = AppearanceFontSize.md,
    this.fontFamily = AppearanceFontFamily.sans,
    this.glassmorphismStrength = 75,
    this.animationStrength = 80,
    this.reducedMotion = false,
    this.wallpaper = 'aurora',
  });

  AppearancePreferences copyWith({
    AppearanceThemeMode? theme,
    AppearanceAccent? accent,
    AppearanceDensity? sidebarDensity,
    AppearanceDensity? chatDensity,
    AppearanceFontSize? fontSize,
    AppearanceFontFamily? fontFamily,
    int? glassmorphismStrength,
    int? animationStrength,
    bool? reducedMotion,
    String? wallpaper,
  }) {
    return AppearancePreferences(
      theme: theme ?? this.theme,
      accent: accent ?? this.accent,
      sidebarDensity: sidebarDensity ?? this.sidebarDensity,
      chatDensity: chatDensity ?? this.chatDensity,
      fontSize: fontSize ?? this.fontSize,
      fontFamily: fontFamily ?? this.fontFamily,
      glassmorphismStrength:
          glassmorphismStrength ?? this.glassmorphismStrength,
      animationStrength: animationStrength ?? this.animationStrength,
      reducedMotion: reducedMotion ?? this.reducedMotion,
      wallpaper: wallpaper ?? this.wallpaper,
    );
  }
}

class TeamSyncShell extends StatefulWidget {
  const TeamSyncShell({super.key});

  @override
  State<TeamSyncShell> createState() => _TeamSyncShellState();
}

class _TeamSyncShellState extends State<TeamSyncShell> {
  ScreenView screen = ScreenView.admin; // open directly on the admin panel
  WorkspaceTab tab = WorkspaceTab.chat;
  Channel selectedChannel = MockData.channels.first;
  WorkspaceDoc selectedDoc = MockData.documents.first;
  TeamTask? selectedTask = MockData.tasks.first;
  WorkspaceUser currentUser = MockData.currentUser;
  AppearancePreferences appearance = const AppearancePreferences();
  bool showLanding = false; // skip the landing page, go straight in
  final TextEditingController composer = TextEditingController();

  @override
  void dispose() {
    composer.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colors = _wallpaperColors(appearance);
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: colors,
          ),
        ),
        child: SafeArea(
          child: showLanding
              ? LandingPage(onEnter: () => setState(() => showLanding = false))
              : Column(
                  children: [
                    _TopChrome(
                      current: screen,
                      onSelect: (next) => setState(() => screen = next),
                    ),
                    Expanded(child: _activeScreen()),
                  ],
                ),
        ),
      ),
    );
  }
  Widget _activeScreen() {
    return switch (screen) {
      ScreenView.workspace => WorkspaceView(
        tab: tab,
        selectedChannel: selectedChannel,
        selectedDoc: selectedDoc,
        selectedTask: selectedTask,
        currentUser: currentUser,
        composer: composer,
        onUpdateCurrentUser: (updated) => setState(() => currentUser = updated),
        onTab: (next) => setState(() => tab = next),
        onChannel: (channel) => setState(() {
          selectedChannel = channel;
          tab = WorkspaceTab.chat;
        }),
        onDoc: (doc) => setState(() {
          selectedDoc = doc;
          tab = WorkspaceTab.document;
        }),
        onTask: (task) => setState(() {
          selectedTask = task;
          tab = WorkspaceTab.tasks;
        }),
        onOpenAdmin: () => setState(() => screen = ScreenView.admin),
        onOpenMarketplace: () =>
            setState(() => screen = ScreenView.marketplace),
      ),
      ScreenView.admin => AdminConsoleView(
        appearance: appearance,
        onUpdateAppearance: (updated) => setState(() => appearance = updated),
      ),
      ScreenView.marketplace => const MarketplaceView(),
    };
  }

  List<Color> _wallpaperColors(AppearancePreferences prefs) {
    final isLight = prefs.theme == AppearanceThemeMode.light;
    if (isLight || prefs.wallpaper == 'light-gradient') {
      return const [Color(0xFFF8FAFC), Color(0xFFEFF6FF), Color(0xFFF1F5F9)];
    }
    return switch (prefs.wallpaper) {
      'none' => const [Color(0xFF0B0F19), Color(0xFF0B0F19), Color(0xFF0B0F19)],
      'cyberpunk' => const [
        Color(0xFF090D16),
        Color(0xFF11143A),
        Color(0xFF061A2D),
      ],
      'nebula' => const [
        Color(0xFF050811),
        Color(0xFF101B3D),
        Color(0xFF0B1026),
      ],
      _ => const [Color(0xFF0F172A), Color(0xFF11142A), Color(0xFF0A0D1A)],
    };
  }
}

class LandingPage extends StatelessWidget {
  final VoidCallback onEnter;
  const LandingPage({super.key, required this.onEnter});

  @override
  Widget build(BuildContext context) {
    final narrow = MediaQuery.sizeOf(context).width < 760;
    return SingleChildScrollView(
      child: Padding(
        padding: EdgeInsets.symmetric(
          horizontal: narrow ? 24 : 64,
          vertical: narrow ? 36 : 72,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const _Brand(),
            const SizedBox(height: 48),
            // Hero badge
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
              decoration: BoxDecoration(
                color: AppColors.violet.withValues(alpha: .12),
                borderRadius: BorderRadius.circular(30),
                border: Border.all(color: AppColors.violet.withValues(alpha: .4)),
              ),
              child: const Text(
                '✦  Enterprise collaboration, reimagined',
                style: TextStyle(
                  color: AppColors.violet,
                  fontWeight: FontWeight.w800,
                  fontSize: 12.5,
                ),
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'One workspace for chat,\ndocs, tasks & huddles.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontWeight: FontWeight.w900,
                fontSize: narrow ? 30 : 46,
                height: 1.1,
                letterSpacing: -1,
              ),
            ),
            const SizedBox(height: 18),
            ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 540),
              child: const Text(
                'FLOW brings your squad’s conversations, knowledge base, '
                'sprint board and analytics together — secured with SOC-2 '
                'compliant encryption.',
                textAlign: TextAlign.center,
                style: TextStyle(color: AppColors.muted, fontSize: 15, height: 1.5),
              ),
            ),
            const SizedBox(height: 32),
            FilledButton(
              onPressed: onEnter,
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.violet,
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 18),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Enter Workspace',
                    style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15),
                  ),
                  SizedBox(width: 8),
                  Icon(Icons.arrow_forward, size: 18),
                ],
              ),
            ),
            const SizedBox(height: 56),
            // Feature cards
            Wrap(
              spacing: 16,
              runSpacing: 16,
              alignment: WrapAlignment.center,
              children: const [
                _LandingFeature(
                  icon: Icons.chat_bubble_outline,
                  color: AppColors.violet,
                  title: 'Real-time Chat',
                  body: 'Threads, huddles and presence across every channel.',
                ),
                _LandingFeature(
                  icon: Icons.description_outlined,
                  color: AppColors.cyan,
                  title: 'Living Docs',
                  body: 'Notion-style editor with blocks and live cursors.',
                ),
                _LandingFeature(
                  icon: Icons.fact_check_outlined,
                  color: AppColors.emerald,
                  title: 'Sprint Board',
                  body: 'Kanban tasks with assignees and burndown tracking.',
                ),
                _LandingFeature(
                  icon: Icons.shield_outlined,
                  color: AppColors.amber,
                  title: 'Enterprise Secure',
                  body: 'SOC-2, SAML SSO and an encrypted file vault.',
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _LandingFeature extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String title;
  final String body;
  const _LandingFeature({
    required this.icon,
    required this.color,
    required this.title,
    required this.body,
  });
  @override
  Widget build(BuildContext context) => Container(
    width: 240,
    padding: const EdgeInsets.all(18),
    decoration: BoxDecoration(
      color: AppColors.panel,
      borderRadius: BorderRadius.circular(16),
      border: Border.all(color: AppColors.border),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: color.withValues(alpha: .15),
            borderRadius: BorderRadius.circular(11),
          ),
          child: Icon(icon, color: color, size: 20),
        ),
        const SizedBox(height: 14),
        Text(
          title,
          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15),
        ),
        const SizedBox(height: 6),
        Text(
          body,
          style: const TextStyle(color: AppColors.muted, fontSize: 12.5, height: 1.4),
        ),
      ],
    ),
  );
}

class _TopChrome extends StatelessWidget {
  final ScreenView current;
  final ValueChanged<ScreenView> onSelect;

  const _TopChrome({required this.current, required this.onSelect});

  @override
  Widget build(BuildContext context) {
    final compact = MediaQuery.sizeOf(context).width < 1100;
    final roomy = MediaQuery.sizeOf(context).width >= 1280;
    return Container(
      height: compact ? null : 70,
      padding: EdgeInsets.symmetric(
        horizontal: compact ? 10 : 18,
        vertical: compact ? 10 : 0,
      ),
      decoration: const BoxDecoration(
        color: Color(0xFF070B13),
        border: Border(bottom: BorderSide(color: Color(0xFF111827))),
      ),
      child: compact
          ? Column(
              children: [
                Row(
                  children: [
                    const Flexible(child: _Brand()),
                    const SizedBox(width: 8),
                    _IconButton(
                      icon: Icons.auto_awesome,
                      label: null,
                      color: AppColors.cyan,
                      onTap: () => _simulateEvent(context),
                    ),
                    const SizedBox(width: 6),
                    _NotifButton(onTap: () => _showNotifications(context)),
                    const SizedBox(width: 6),
                    _IconButton(
                      icon: Icons.tune,
                      color: AppColors.violet,
                      onTap: () => _showCommandPalette(context),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: _TopNav(
                    current: current,
                    onSelect: onSelect,
                    compact: true,
                  ),
                ),
              ],
            )
          : Row(
              children: [
                const _Brand(),
                const SizedBox(width: 22),
                SizedBox(
                  width: 320,
                  child: _SearchBox(
                    onTap: () => _showCommandPalette(context),
                  ),
                ),
                if (roomy) ...[
                  const SizedBox(width: 20),
                  const _VerticalDivider(),
                  const SizedBox(width: 10),
                  const Text(
                    'ACTIVE :',
                    style: TextStyle(
                      color: Color(0xFF8CA9D8),
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1.4,
                    ),
                  ),
                  const SizedBox(width: 10),
                  _PresenceFacepile(onTap: () => _showPresence(context)),
                ],
                const Spacer(),
                _TopNav(current: current, onSelect: onSelect),
                const Spacer(),
                _IconButton(
                  icon: Icons.auto_awesome,
                  label: 'Simulate Event',
                  color: AppColors.cyan,
                  onTap: () => _simulateEvent(context),
                ),
                const SizedBox(width: 10),
                _NotifButton(onTap: () => _showNotifications(context)),
                const SizedBox(width: 10),
                _IconButton(
                  icon: Icons.tune,
                  color: AppColors.violet,
                  onTap: () => _showCommandPalette(context),
                ),
              ],
            ),
    );
  }
}

const _simulatedEvents = <String>[
  '⚡ Maya pushed 3 commits to engineering-hq',
  '📅 Standup huddle starts in 5 minutes',
  '🔒 Security scan completed — 0 critical issues',
  '🚀 Deploy to staging succeeded',
  '💬 New mention in #product-roadmap',
  '✅ Task "Auth refactor" moved to Done',
];

void _simulateEvent(BuildContext context) {
  final event =
      _simulatedEvents[DateTime.now().millisecond % _simulatedEvents.length];
  ScaffoldMessenger.of(context)
    ..clearSnackBars()
    ..showSnackBar(
      SnackBar(
        behavior: SnackBarBehavior.floating,
        backgroundColor: AppColors.panel,
        duration: const Duration(seconds: 3),
        content: Row(
          children: [
            const Icon(Icons.auto_awesome, size: 16, color: AppColors.cyan),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                event,
                style: const TextStyle(fontSize: 13, color: AppColors.text),
              ),
            ),
          ],
        ),
      ),
    );
}

void _showNotifications(BuildContext context) {
  showDialog<void>(context: context, builder: (_) => const _NotificationsDialog());
}

void _showCommandPalette(BuildContext context) {
  showDialog<void>(
    context: context,
    barrierColor: Colors.black54,
    builder: (_) => const _CommandPalette(),
  );
}

void _showPresence(BuildContext context) {
  showDialog<void>(context: context, builder: (_) => const _PresenceDialog());
}

class _Notification {
  final IconData icon;
  final Color color;
  final String title;
  final String time;
  const _Notification(this.icon, this.color, this.title, this.time);
}

const _notifications = <_Notification>[
  _Notification(Icons.alternate_email, AppColors.violet,
      'Sofia mentioned you in #engineering-hq', '2m ago'),
  _Notification(Icons.task_alt, AppColors.emerald,
      'Task "Billing webhook" assigned to you', '18m ago'),
  _Notification(Icons.event, AppColors.amber,
      'Sprint review scheduled for 4:00 PM', '1h ago'),
];

class _NotificationsDialog extends StatelessWidget {
  const _NotificationsDialog();
  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.topRight,
      child: Padding(
        padding: const EdgeInsets.only(top: 70, right: 16),
        child: Material(
          color: Colors.transparent,
          child: Container(
            width: 320,
            decoration: BoxDecoration(
              color: AppColors.panel2,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Padding(
                  padding: EdgeInsets.fromLTRB(16, 14, 16, 10),
                  child: Text(
                    'Notifications',
                    style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
                  ),
                ),
                const Divider(color: AppColors.border, height: 1),
                ..._notifications.map(
                  (n) => ListTile(
                    dense: true,
                    leading: CircleAvatar(
                      radius: 16,
                      backgroundColor: n.color.withValues(alpha: .18),
                      child: Icon(n.icon, size: 16, color: n.color),
                    ),
                    title: Text(
                      n.title,
                      style: const TextStyle(fontSize: 12.5),
                    ),
                    subtitle: Text(
                      n.time,
                      style: const TextStyle(
                        color: AppColors.muted,
                        fontSize: 10,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 6),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _PresenceDialog extends StatelessWidget {
  const _PresenceDialog();
  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: AppColors.panel2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(18),
        side: const BorderSide(color: AppColors.border),
      ),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 380),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Padding(
              padding: EdgeInsets.fromLTRB(20, 16, 20, 10),
              child: Text(
                'Active Members',
                style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
              ),
            ),
            const Divider(color: AppColors.border, height: 1),
            Flexible(
              child: ListView(
                shrinkWrap: true,
                padding: const EdgeInsets.symmetric(vertical: 6),
                children: [
                  for (final u in MockData.users)
                    ListTile(
                      dense: true,
                      leading: _Avatar(user: u, size: 34),
                      title: Text(
                        u.name,
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      subtitle: Text(
                        u.customStatus ?? u.status.name,
                        style: const TextStyle(
                          color: AppColors.muted,
                          fontSize: 11,
                        ),
                      ),
                      trailing: _StatusDot(
                        color: _userStatusColor(u.status),
                        size: 10,
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}

class _CommandPalette extends StatefulWidget {
  const _CommandPalette();
  @override
  State<_CommandPalette> createState() => _CommandPaletteState();
}

class _CommandPaletteState extends State<_CommandPalette> {
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final q = _query.trim().toLowerCase();
    final channels = MockData.channels
        .where((c) => q.isEmpty || c.name.toLowerCase().contains(q))
        .toList();
    final people = MockData.users
        .where((u) => q.isEmpty || u.name.toLowerCase().contains(q))
        .toList();
    final docs = MockData.documents
        .where((d) => q.isEmpty || d.title.toLowerCase().contains(q))
        .toList();

    return Align(
      alignment: Alignment.topCenter,
      child: Padding(
        padding: const EdgeInsets.only(top: 90),
        child: Material(
          color: Colors.transparent,
          child: Container(
            width: 520,
            constraints: const BoxConstraints(maxHeight: 460),
            decoration: BoxDecoration(
              color: AppColors.panel2,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Search field
                Padding(
                  padding: const EdgeInsets.all(12),
                  child: TextField(
                    autofocus: true,
                    onChanged: (v) => setState(() => _query = v),
                    style: const TextStyle(fontSize: 15, color: AppColors.text),
                    decoration: const InputDecoration(
                      prefixIcon: Icon(Icons.search, size: 20),
                      hintText: 'Search channels, people, docs…',
                      hintStyle: TextStyle(color: AppColors.muted),
                      border: InputBorder.none,
                    ),
                  ),
                ),
                const Divider(color: AppColors.border, height: 1),
                Flexible(
                  child: ListView(
                    padding: const EdgeInsets.symmetric(vertical: 6),
                    children: [
                      if (channels.isNotEmpty) const _PaletteHeader('Channels'),
                      ...channels.map(
                        (c) => _PaletteRow(
                          icon: c.isPrivate ? Icons.lock_outline : Icons.tag,
                          label: c.name,
                          onTap: () => Navigator.of(context).pop(),
                        ),
                      ),
                      if (people.isNotEmpty) const _PaletteHeader('People'),
                      ...people.map(
                        (u) => _PaletteRow(
                          icon: Icons.person_outline,
                          label: u.name,
                          onTap: () => Navigator.of(context).pop(),
                        ),
                      ),
                      if (docs.isNotEmpty) const _PaletteHeader('Documents'),
                      ...docs.map(
                        (d) => _PaletteRow(
                          icon: Icons.description_outlined,
                          label: d.title,
                          onTap: () => Navigator.of(context).pop(),
                        ),
                      ),
                      if (channels.isEmpty && people.isEmpty && docs.isEmpty)
                        const Padding(
                          padding: EdgeInsets.all(24),
                          child: Center(
                            child: Text(
                              'No matches',
                              style: TextStyle(color: AppColors.muted),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _PaletteHeader extends StatelessWidget {
  final String text;
  const _PaletteHeader(this.text);
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.fromLTRB(16, 10, 16, 4),
    child: Text(
      text.toUpperCase(),
      style: const TextStyle(
        color: AppColors.muted,
        fontSize: 10,
        fontWeight: FontWeight.w900,
        letterSpacing: 1,
      ),
    ),
  );
}

class _PaletteRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _PaletteRow({
    required this.icon,
    required this.label,
    required this.onTap,
  });
  @override
  Widget build(BuildContext context) => InkWell(
    onTap: onTap,
    child: Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppColors.muted),
          const SizedBox(width: 12),
          Text(label, style: const TextStyle(fontSize: 13)),
        ],
      ),
    ),
  );
}

class _TopNav extends StatelessWidget {
  final ScreenView current;
  final ValueChanged<ScreenView> onSelect;
  final bool compact;

  const _TopNav({
    required this.current,
    required this.onSelect,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) => Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      _TopTab(
        label: compact ? 'Work' : 'Collaborate Panel',
        selected: current == ScreenView.workspace,
        onTap: () => onSelect(ScreenView.workspace),
      ),
      const SizedBox(width: 6),
      _TopTab(
        label: compact ? 'Admin' : 'Security & Controls',
        selected: current == ScreenView.admin,
        onTap: () => onSelect(ScreenView.admin),
      ),
      const SizedBox(width: 6),
      _TopTab(
        label: compact ? 'Apps' : 'Ecosystem',
        selected: current == ScreenView.marketplace,
        onTap: () => onSelect(ScreenView.marketplace),
      ),
    ],
  );
}

class _VerticalDivider extends StatelessWidget {
  const _VerticalDivider();

  @override
  Widget build(BuildContext context) =>
      Container(width: 1, height: 28, color: const Color(0xFFCBD5E1));
}

class WorkspaceView extends StatelessWidget {
  final WorkspaceTab tab;
  final Channel selectedChannel;
  final WorkspaceDoc selectedDoc;
  final TeamTask? selectedTask;
  final WorkspaceUser currentUser;
  final TextEditingController composer;
  final ValueChanged<WorkspaceUser> onUpdateCurrentUser;
  final ValueChanged<WorkspaceTab> onTab;
  final ValueChanged<Channel> onChannel;
  final ValueChanged<WorkspaceDoc> onDoc;
  final ValueChanged<TeamTask> onTask;
  final VoidCallback onOpenAdmin;
  final VoidCallback onOpenMarketplace;

  const WorkspaceView({
    super.key,
    required this.tab,
    required this.selectedChannel,
    required this.selectedDoc,
    required this.selectedTask,
    required this.currentUser,
    required this.composer,
    required this.onUpdateCurrentUser,
    required this.onTab,
    required this.onChannel,
    required this.onDoc,
    required this.onTask,
    required this.onOpenAdmin,
    required this.onOpenMarketplace,
  });

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    final mobile = width < 720;
    return Column(
      children: [
        Expanded(
          child: Row(
            children: [
              if (!mobile)
                _Rail(
                  tab: tab,
                  currentUser: currentUser,
                  onUpdateCurrentUser: onUpdateCurrentUser,
                  onTab: onTab,
                  onOpenAdmin: onOpenAdmin,
                  onOpenMarketplace: onOpenMarketplace,
                ),
              if (width >= 1050)
                _ContextDeck(
                  tab: tab,
                  selectedChannel: selectedChannel,
                  selectedDoc: selectedDoc,
                  onChannel: onChannel,
                  onDoc: onDoc,
                ),
              Expanded(
                child: _MainPane(
                  tab: tab,
                  selectedChannel: selectedChannel,
                  selectedDoc: selectedDoc,
                  selectedTask: selectedTask,
                  composer: composer,
                  onTask: onTask,
                ),
              ),
              if (width >= 1500) _CopilotPanel(selectedTask: selectedTask),
            ],
          ),
        ),
        if (mobile) _MobileTabBar(tab: tab, onTab: onTab),
      ],
    );
  }
}

class _MainPane extends StatelessWidget {
  final WorkspaceTab tab;
  final Channel selectedChannel;
  final WorkspaceDoc selectedDoc;
  final TeamTask? selectedTask;
  final TextEditingController composer;
  final ValueChanged<TeamTask> onTask;

  const _MainPane({
    required this.tab,
    required this.selectedChannel,
    required this.selectedDoc,
    required this.selectedTask,
    required this.composer,
    required this.onTask,
  });

  @override
  Widget build(BuildContext context) {
    return switch (tab) {
      WorkspaceTab.chat => ChatPane(
        channel: selectedChannel,
        composer: composer,
      ),
      WorkspaceTab.document => DocPane(doc: selectedDoc),
      WorkspaceTab.tasks => TasksPane(
        selectedTask: selectedTask,
        onTask: onTask,
      ),
      WorkspaceTab.calendar => const CalendarPane(),
      WorkspaceTab.analytics => const AnalyticsPane(),
      WorkspaceTab.vault => const VaultPane(),
    };
  }
}

class ChatPane extends StatelessWidget {
  final Channel channel;
  final TextEditingController composer;

  const ChatPane({super.key, required this.channel, required this.composer});

  @override
  Widget build(BuildContext context) {
    final messages = MockData.messages
        .where((m) => m.channelId == channel.id)
        .toList();
    final compact = MediaQuery.sizeOf(context).width < 620;
    return LayoutBuilder(
      builder: (context, constraints) {
        final showComposer = constraints.maxHeight > 360;
        return Column(
          children: [
            _PaneHeader(
              title: '#${channel.name}',
              subtitle: channel.description,
              actions: [
                _HeaderButton(
                  icon: Icons.call,
                  label: compact ? null : 'Join Huddle',
                  color: AppColors.emerald,
                  onTap: () => _openHuddle(context, channel),
                ),
                _HeaderButton(
                  icon: Icons.palette_outlined,
                  label: compact ? null : 'Sketch Canvas',
                  color: Colors.limeAccent,
                  onTap: () => showDialog<void>(
                    context: context,
                    builder: (_) => const _WhiteboardDialog(),
                  ),
                ),
                _HeaderButton(
                  icon: Icons.tune,
                  label: null,
                  color: AppColors.violet,
                  onTap: () => showDialog<void>(
                    context: context,
                    builder: (_) => const _ChatSettingsDialog(),
                  ),
                ),
              ],
            ),
            Expanded(
              child: ListView.separated(
                padding: EdgeInsets.all(compact ? 12 : 24),
                itemCount: messages.length,
                separatorBuilder: (context, index) =>
                    const SizedBox(height: 16),
                itemBuilder: (context, index) =>
                    _MessageBubble(message: messages[index]),
              ),
            ),
            if (showComposer)
              _Composer(controller: composer, target: '#${channel.name}'),
          ],
        );
      },
    );
  }
}

void _openHuddle(BuildContext context, Channel channel) {
  showDialog<void>(
    context: context,
    builder: (_) => _HuddleDialog(channel: channel),
  );
}

class _HuddleDialog extends StatefulWidget {
  final Channel channel;
  const _HuddleDialog({required this.channel});
  @override
  State<_HuddleDialog> createState() => _HuddleDialogState();
}

class _HuddleDialogState extends State<_HuddleDialog> {
  bool muted = false;
  bool video = false;
  bool sharing = false;
  bool connected = true;

  @override
  Widget build(BuildContext context) {
    final participants = MockData.users.take(4).toList();
    return Dialog(
      backgroundColor: AppColors.panel2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: const BorderSide(color: AppColors.border),
      ),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 460),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Container(
              padding: const EdgeInsets.fromLTRB(20, 16, 12, 16),
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: AppColors.border)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 9,
                    height: 9,
                    decoration: BoxDecoration(
                      color: connected ? AppColors.emerald : AppColors.muted,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      connected
                          ? 'Live Huddle · #${widget.channel.name}'
                          : 'Huddle ended',
                      style: const TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 14,
                      ),
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close, size: 18),
                    color: AppColors.muted,
                  ),
                ],
              ),
            ),
            // Participant grid
            Padding(
              padding: const EdgeInsets.all(18),
              child: Wrap(
                spacing: 12,
                runSpacing: 12,
                children: [
                  for (final u in participants)
                    Column(
                      children: [
                        Stack(
                          children: [
                            Container(
                              width: 92,
                              height: 64,
                              decoration: BoxDecoration(
                                color: AppColors.panel,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: AppColors.emerald.withValues(alpha: .4),
                                ),
                              ),
                              alignment: Alignment.center,
                              child: _Avatar(user: u, size: 34),
                            ),
                            Positioned(
                              bottom: 4,
                              right: 6,
                              child: Icon(
                                Icons.mic,
                                size: 13,
                                color: AppColors.emerald,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        SizedBox(
                          width: 92,
                          child: Text(
                            u.name,
                            textAlign: TextAlign.center,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontSize: 10),
                          ),
                        ),
                      ],
                    ),
                ],
              ),
            ),
            // Controls
            Container(
              padding: const EdgeInsets.fromLTRB(18, 12, 18, 18),
              decoration: const BoxDecoration(
                border: Border(top: BorderSide(color: AppColors.border)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _HuddleControl(
                    icon: muted ? Icons.mic_off : Icons.mic,
                    active: !muted,
                    onTap: () => setState(() => muted = !muted),
                  ),
                  const SizedBox(width: 12),
                  _HuddleControl(
                    icon: video ? Icons.videocam : Icons.videocam_off,
                    active: video,
                    onTap: () => setState(() => video = !video),
                  ),
                  const SizedBox(width: 12),
                  _HuddleControl(
                    icon: Icons.screen_share_outlined,
                    active: sharing,
                    onTap: () => setState(() => sharing = !sharing),
                  ),
                  const SizedBox(width: 12),
                  _HuddleControl(
                    icon: Icons.call_end,
                    active: false,
                    danger: true,
                    onTap: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _HuddleControl extends StatelessWidget {
  final IconData icon;
  final bool active;
  final bool danger;
  final VoidCallback onTap;
  const _HuddleControl({
    required this.icon,
    required this.active,
    required this.onTap,
    this.danger = false,
  });
  @override
  Widget build(BuildContext context) {
    final bg = danger
        ? AppColors.rose
        : active
        ? AppColors.violet
        : AppColors.panel;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(30),
      child: Container(
        width: 46,
        height: 46,
        decoration: BoxDecoration(
          color: bg,
          shape: BoxShape.circle,
          border: Border.all(color: AppColors.border),
        ),
        child: Icon(
          icon,
          size: 20,
          color: danger || active ? Colors.white : AppColors.muted,
        ),
      ),
    );
  }
}

class _WhiteboardDialog extends StatefulWidget {
  const _WhiteboardDialog();
  @override
  State<_WhiteboardDialog> createState() => _WhiteboardDialogState();
}

class _WhiteboardDialogState extends State<_WhiteboardDialog> {
  final List<List<Offset>> _strokes = [];
  Color _color = AppColors.violet;

  static const _palette = [
    AppColors.violet,
    AppColors.cyan,
    AppColors.emerald,
    AppColors.amber,
    AppColors.rose,
    Colors.white,
  ];

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: AppColors.panel2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(18),
        side: const BorderSide(color: AppColors.border),
      ),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 560),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header + toolbar
            Container(
              padding: const EdgeInsets.fromLTRB(18, 12, 8, 12),
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: AppColors.border)),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.palette_outlined,
                    size: 16,
                    color: Colors.limeAccent,
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'Squad Whiteboard',
                    style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
                  ),
                  const Spacer(),
                  for (final c in _palette)
                    GestureDetector(
                      onTap: () => setState(() => _color = c),
                      child: Container(
                        width: 20,
                        height: 20,
                        margin: const EdgeInsets.symmetric(horizontal: 3),
                        decoration: BoxDecoration(
                          color: c,
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: _color == c ? Colors.white : AppColors.border,
                            width: _color == c ? 2 : 1,
                          ),
                        ),
                      ),
                    ),
                  IconButton(
                    tooltip: 'Clear',
                    onPressed: () => setState(_strokes.clear),
                    icon: const Icon(Icons.delete_outline, size: 18),
                    color: AppColors.muted,
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close, size: 18),
                    color: AppColors.muted,
                  ),
                ],
              ),
            ),
            // Canvas
            Padding(
              padding: const EdgeInsets.all(14),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  height: 320,
                  color: const Color(0xFF0A0E18),
                  child: GestureDetector(
                    onPanStart: (d) =>
                        setState(() => _strokes.add([d.localPosition])),
                    onPanUpdate: (d) => setState(() {
                      if (_strokes.isNotEmpty) {
                        _strokes.last.add(d.localPosition);
                      }
                    }),
                    child: CustomPaint(
                      painter: _SketchPainter(_strokes, _color),
                      size: Size.infinite,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SketchPainter extends CustomPainter {
  final List<List<Offset>> strokes;
  final Color color;
  const _SketchPainter(this.strokes, this.color);
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 3
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;
    final dot = Paint()
      ..color = color
      ..style = PaintingStyle.fill;
    for (final stroke in strokes) {
      for (var i = 0; i < stroke.length - 1; i++) {
        canvas.drawLine(stroke[i], stroke[i + 1], paint);
      }
      if (stroke.length == 1) {
        canvas.drawCircle(stroke.first, 1.5, dot);
      }
    }
  }

  @override
  bool shouldRepaint(_SketchPainter oldDelegate) => true;
}

class _ChatSettingsDialog extends StatefulWidget {
  const _ChatSettingsDialog();
  @override
  State<_ChatSettingsDialog> createState() => _ChatSettingsDialogState();
}

class _ChatSettingsDialogState extends State<_ChatSettingsDialog> {
  bool compactMode = false;
  bool notificationSound = true;
  bool desktopAlerts = true;
  bool aiSummaries = true;
  bool readReceipts = true;

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: AppColors.panel2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(18),
        side: const BorderSide(color: AppColors.border),
      ),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 440),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.fromLTRB(20, 16, 12, 16),
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: AppColors.border)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.tune, size: 16, color: AppColors.violet),
                  const SizedBox(width: 8),
                  const Text(
                    'Chat Settings',
                    style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
                  ),
                  const Spacer(),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close, size: 18),
                    color: AppColors.muted,
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
              child: Column(
                children: [
                  _SettingToggle(
                    title: 'Compact message density',
                    subtitle: 'Tighten spacing between messages',
                    value: compactMode,
                    onChanged: (v) => setState(() => compactMode = v),
                  ),
                  _SettingToggle(
                    title: 'Notification sound',
                    subtitle: 'Play a chime on new mentions',
                    value: notificationSound,
                    onChanged: (v) => setState(() => notificationSound = v),
                  ),
                  _SettingToggle(
                    title: 'Desktop alerts',
                    subtitle: 'Show OS-level banners',
                    value: desktopAlerts,
                    onChanged: (v) => setState(() => desktopAlerts = v),
                  ),
                  _SettingToggle(
                    title: 'AI thread summaries',
                    subtitle: 'Auto-summarise long threads',
                    value: aiSummaries,
                    onChanged: (v) => setState(() => aiSummaries = v),
                  ),
                  _SettingToggle(
                    title: 'Read receipts',
                    subtitle: 'Let others see when you read',
                    value: readReceipts,
                    onChanged: (v) => setState(() => readReceipts = v),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.fromLTRB(20, 10, 20, 16),
              decoration: const BoxDecoration(
                border: Border(top: BorderSide(color: AppColors.border)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  FilledButton(
                    onPressed: () => Navigator.of(context).pop(),
                    style: FilledButton.styleFrom(
                      backgroundColor: AppColors.violet,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 18,
                        vertical: 12,
                      ),
                    ),
                    child: const Text(
                      'Apply Changes',
                      style: TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SettingToggle extends StatelessWidget {
  final String title;
  final String subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;
  const _SettingToggle({
    required this.title,
    required this.subtitle,
    required this.value,
    required this.onChanged,
  });
  @override
  Widget build(BuildContext context) => SwitchListTile(
    value: value,
    onChanged: onChanged,
    activeThumbColor: AppColors.violet,
    dense: true,
    contentPadding: const EdgeInsets.symmetric(horizontal: 12),
    title: Text(
      title,
      style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
    ),
    subtitle: Text(
      subtitle,
      style: const TextStyle(color: AppColors.muted, fontSize: 11),
    ),
  );
}

class DocPane extends StatelessWidget {
  final WorkspaceDoc doc;
  const DocPane({super.key, required this.doc});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        _PaneHeader(
          title: doc.title,
          subtitle:
              'Last active edit by ${doc.updatedBy.name} - ${doc.updatedAt}',
          actions: const [
            _HeaderButton(
              icon: Icons.add,
              label: 'Insert Block',
              color: AppColors.cyan,
            ),
          ],
        ),
        Expanded(
          child: ListView(
            padding: EdgeInsets.symmetric(
              horizontal: MediaQuery.sizeOf(context).width < 720 ? 16 : 48,
              vertical: 24,
            ),
            children: [
              Row(
                children: [
                  _MiniBadge(text: doc.emoji, color: AppColors.violet),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      doc.title,
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 22),
              ...doc.blocks.map(_DocBlockView.new),
            ],
          ),
        ),
      ],
    );
  }
}

class TasksPane extends StatelessWidget {
  final TeamTask? selectedTask;
  final ValueChanged<TeamTask> onTask;

  const TasksPane({
    super.key,
    required this.selectedTask,
    required this.onTask,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const _PaneHeader(
          title: 'Sprint Schedule Board',
          subtitle: 'Automated roadmap coordinates. Select cards to inspect.',
          actions: [
            _HeaderButton(
              icon: Icons.bolt,
              label: 'Sprint 24',
              color: AppColors.violet,
            ),
          ],
        ),
        Expanded(
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.all(18),
            children: TaskStatus.values
                .where((s) => s != TaskStatus.inReview)
                .map((status) {
                  final tasks = MockData.tasks
                      .where((task) => task.status == status)
                      .toList();
                  return _KanbanColumn(
                    status: status,
                    tasks: tasks,
                    selected: selectedTask,
                    onTask: onTask,
                  );
                })
                .toList(),
          ),
        ),
      ],
    );
  }
}

class CalendarPane extends StatelessWidget {
  const CalendarPane({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        const _PaneTitle(
          title: 'Team Calendar & Planner',
          subtitle: 'Coordinate huddles, audits, and sprint deadlines.',
        ),
        const SizedBox(height: 18),
        _Panel(
          child: GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 7,
              mainAxisSpacing: 8,
              crossAxisSpacing: 8,
            ),
            itemCount: 35,
            itemBuilder: (_, i) => Container(
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: [10, 15, 18, 22].contains(i + 1)
                    ? AppColors.violet.withValues(alpha: .22)
                    : AppColors.panel2,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.border),
              ),
              child: Text(
                '${i + 1}',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class AnalyticsPane extends StatelessWidget {
  const AnalyticsPane({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        const _PaneTitle(
          title: 'Visual Analytics & Charts',
          subtitle:
              'Workspace activity, retention, compliance and message health.',
        ),
        const SizedBox(height: 18),
        Wrap(
          spacing: 14,
          runSpacing: 14,
          children: const [
            _MetricCard(label: 'DAU / MAU', value: '84.2%', note: '+3.1%'),
            _MetricCard(
              label: 'Weekly Messages',
              value: '14,204',
              note: '+12%',
            ),
            _MetricCard(
              label: 'Response Speed',
              value: '18.4 ms',
              note: 'Stable',
            ),
            _MetricCard(
              label: 'SOC-2 Compliance',
              value: '100%',
              note: 'Clean',
            ),
          ],
        ),
        const SizedBox(height: 18),
        _Panel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: const [
                  Text(
                    'Weekly Activity Trend',
                    style: TextStyle(fontWeight: FontWeight.w800),
                  ),
                  Text(
                    '+12% vs last week',
                    style: TextStyle(
                      color: AppColors.emerald,
                      fontWeight: FontWeight.w800,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),
              SizedBox(
                height: 160,
                child: CustomPaint(
                  painter: _ActivityChartPainter(),
                  size: Size.infinite,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: const [
                  _ChartAxisLabel('Mon'),
                  _ChartAxisLabel('Tue'),
                  _ChartAxisLabel('Wed'),
                  _ChartAxisLabel('Thu'),
                  _ChartAxisLabel('Fri'),
                  _ChartAxisLabel('Sat'),
                  _ChartAxisLabel('Sun'),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),
        _Panel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Message Volume Distribution',
                style: TextStyle(fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 16),
              _Bar(label: '#general', value: .85, color: AppColors.violet),
              _Bar(label: '#engineering-hq', value: .70, color: AppColors.cyan),
              _Bar(
                label: '#product-roadmap',
                value: .56,
                color: AppColors.emerald,
              ),
              _Bar(
                label: '#security-compliance',
                value: .28,
                color: AppColors.amber,
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _ChartAxisLabel extends StatelessWidget {
  final String text;
  const _ChartAxisLabel(this.text);
  @override
  Widget build(BuildContext context) => Text(
    text,
    style: const TextStyle(color: AppColors.muted, fontSize: 10),
  );
}

class _ActivityChartPainter extends CustomPainter {
  static const _points = [0.35, 0.55, 0.45, 0.72, 0.6, 0.88, 0.7];

  @override
  void paint(Canvas canvas, Size size) {
    // Gridlines
    final grid = Paint()
      ..color = AppColors.border.withValues(alpha: .5)
      ..strokeWidth = 1;
    for (var i = 0; i <= 3; i++) {
      final y = size.height * i / 3;
      canvas.drawLine(Offset(0, y), Offset(size.width, y), grid);
    }

    final dx = size.width / (_points.length - 1);
    Offset pointAt(int i) =>
        Offset(dx * i, size.height * (1 - _points[i]));

    final path = Path()..moveTo(pointAt(0).dx, pointAt(0).dy);
    for (var i = 1; i < _points.length; i++) {
      path.lineTo(pointAt(i).dx, pointAt(i).dy);
    }

    // Area fill
    final fillPath = Path.from(path)
      ..lineTo(size.width, size.height)
      ..lineTo(0, size.height)
      ..close();
    canvas.drawPath(
      fillPath,
      Paint()
        ..shader = const LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0x558B5CF6), Color(0x008B5CF6)],
        ).createShader(Offset.zero & size),
    );

    // Line
    canvas.drawPath(
      path,
      Paint()
        ..color = AppColors.violet
        ..strokeWidth = 2.5
        ..style = PaintingStyle.stroke
        ..strokeJoin = StrokeJoin.round,
    );

    // Dots
    final dot = Paint()..color = AppColors.cyan;
    final ring = Paint()
      ..color = AppColors.bg
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;
    for (var i = 0; i < _points.length; i++) {
      canvas.drawCircle(pointAt(i), 3.5, dot);
      canvas.drawCircle(pointAt(i), 3.5, ring);
    }
  }

  @override
  bool shouldRepaint(_ActivityChartPainter oldDelegate) => false;
}

class _VaultFile {
  final String name;
  final String size;
  final IconData icon;
  final Color color;
  const _VaultFile(this.name, this.size, this.icon, this.color);
}

const _vaultFiles = <_VaultFile>[
  _VaultFile('Q3-Roadmap.pdf', '2.4 MB', Icons.picture_as_pdf_outlined, AppColors.rose),
  _VaultFile('brand-assets.zip', '48 MB', Icons.folder_zip_outlined, AppColors.amber),
  _VaultFile('hero-mockup.png', '1.1 MB', Icons.image_outlined, AppColors.cyan),
  _VaultFile('contract-v2.docx', '320 KB', Icons.description_outlined, AppColors.violet),
  _VaultFile('budget-2026.xlsx', '512 KB', Icons.table_chart_outlined, AppColors.emerald),
  _VaultFile('demo-recording.mp4', '128 MB', Icons.movie_outlined, AppColors.rose),
  _VaultFile('api-keys.env', '2 KB', Icons.lock_outline, AppColors.amber),
  _VaultFile('logo-source.svg', '88 KB', Icons.image_outlined, AppColors.cyan),
];

class VaultPane extends StatelessWidget {
  const VaultPane({super.key});

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    final cols = width < 720
        ? 2
        : width < 1100
        ? 3
        : 4;
    return Column(
      children: [
        _PaneHeader(
          title: 'Cloud Drive & Secure Vault',
          subtitle: 'Encrypted file storage with SOC-2 audit trails.',
          actions: [
            _HeaderButton(
              icon: Icons.upload_file_outlined,
              label: 'Upload',
              color: AppColors.emerald,
              onTap: () {
                ScaffoldMessenger.of(context)
                  ..clearSnackBars()
                  ..showSnackBar(
                    const SnackBar(
                      behavior: SnackBarBehavior.floating,
                      backgroundColor: AppColors.panel,
                      content: Text('📤 Uploading file to encrypted vault…'),
                    ),
                  );
              },
            ),
          ],
        ),
        Expanded(
          child: ListView(
            padding: const EdgeInsets.all(20),
            children: [
              // Storage meter
              _Panel(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: const [
                        Text(
                          'Storage Usage',
                          style: TextStyle(fontWeight: FontWeight.w800),
                        ),
                        Text(
                          '182 GB of 500 GB',
                          style: TextStyle(
                            color: AppColors.muted,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(6),
                      child: LinearProgressIndicator(
                        value: 182 / 500,
                        minHeight: 8,
                        backgroundColor: AppColors.border,
                        valueColor: const AlwaysStoppedAnimation(
                          AppColors.violet,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),
              const _DeckLabel('Recent Files'),
              const SizedBox(height: 4),
              GridView.count(
                crossAxisCount: cols,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 1.15,
                children: [
                  for (final f in _vaultFiles) _VaultCard(file: f),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _VaultCard extends StatelessWidget {
  final _VaultFile file;
  const _VaultCard({required this.file});
  @override
  Widget build(BuildContext context) => _Panel(
    padding: const EdgeInsets.all(14),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: file.color.withValues(alpha: .15),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(file.icon, color: file.color, size: 20),
        ),
        const Spacer(),
        Text(
          file.name,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12.5),
        ),
        const SizedBox(height: 2),
        Text(
          file.size,
          style: const TextStyle(color: AppColors.muted, fontSize: 10.5),
        ),
      ],
    ),
  );
}

class AdminConsoleView extends StatelessWidget {
  final AppearancePreferences appearance;
  final ValueChanged<AppearancePreferences> onUpdateAppearance;

  const AdminConsoleView({
    super.key,
    required this.appearance,
    required this.onUpdateAppearance,
  });

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(18),
      children: [
        const _PaneTitle(
          title: 'Enterprise Organization Control Suite',
          subtitle:
              'Configure SAML, members, telemetry, billing, and white-label controls.',
        ),
        const SizedBox(height: 18),
        Wrap(
          spacing: 10,
          runSpacing: 10,
          children: const [
            _Pill(text: 'Directory List (5)', selected: true),
            _Pill(text: 'SAML SSO'),
            _Pill(text: 'Workspace Stats'),
            _Pill(text: 'Billing Gate'),
            _Pill(text: 'White-Label'),
            _Pill(text: 'Appearance Theme'),
          ],
        ),
        const SizedBox(height: 18),
        LayoutBuilder(
          builder: (context, box) {
            final wide = box.maxWidth > 900;
            return Flex(
              direction: wide ? Axis.horizontal : Axis.vertical,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(flex: wide ? 2 : 0, child: _MembersPanel()),
                SizedBox(width: wide ? 16 : 0, height: wide ? 0 : 16),
                Expanded(flex: wide ? 1 : 0, child: _ProvisionPanel()),
              ],
            );
          },
        ),
        const SizedBox(height: 18),
        _AppearanceSettingsPanel(
          preferences: appearance,
          onChanged: onUpdateAppearance,
        ),
        const SizedBox(height: 18),
        _Panel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Active Security Audit Trails',
                style: TextStyle(fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 12),
              ...MockData.activityLogs.map((log) => _AuditRow(log: log)),
            ],
          ),
        ),
      ],
    );
  }
}

class _AppearanceSettingsPanel extends StatelessWidget {
  final AppearancePreferences preferences;
  final ValueChanged<AppearancePreferences> onChanged;

  const _AppearanceSettingsPanel({
    required this.preferences,
    required this.onChanged,
  });

  static const accents = [
    AppearanceAccent('Purple', Color(0xFF8B5CF6)),
    AppearanceAccent('Ocean', Color(0xFF3B82F6)),
    AppearanceAccent('Emerald', Color(0xFF10B981)),
    AppearanceAccent('Amber', Color(0xFFF59E0B)),
    AppearanceAccent('Rose', Color(0xFFF43F5E)),
  ];

  static const wallpapers = [
    ('none', 'Minimal Solid'),
    ('aurora', 'Aurora Borealis (Violet Mesh)'),
    ('cyberpunk', 'Cyberpunk Wave (Indigo Hue)'),
    ('nebula', 'Cosmic Nebula (Deep Blue Pulse)'),
    ('light-gradient', 'Mesh Breeze (Light Theme Gradient)'),
  ];

  @override
  Widget build(BuildContext context) {
    return _Panel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Personalization Core',
            style: TextStyle(
              color: AppColors.muted,
              fontWeight: FontWeight.w900,
              fontSize: 12,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 5),
          const Text(
            'Fine-tune typography, background meshes, rendering density and motion preferences.',
            style: TextStyle(color: AppColors.muted, fontSize: 12),
          ),
          const SizedBox(height: 18),
          _SectionLabel(
            icon: Icons.palette_outlined,
            label: 'General Appearance Interface',
          ),
          const SizedBox(height: 8),
          _SegmentedChoice<AppearanceThemeMode>(
            values: AppearanceThemeMode.values,
            selected: preferences.theme,
            labelFor: (value) => switch (value) {
              AppearanceThemeMode.dark => 'Dark Mode',
              AppearanceThemeMode.light => 'Light Mode',
              AppearanceThemeMode.system => 'System Mode',
            },
            onSelected: (value) =>
                onChanged(preferences.copyWith(theme: value)),
          ),
          const SizedBox(height: 18),
          _SectionLabel(
            icon: Icons.auto_awesome,
            label: 'Dynamic Focus Accent Color',
            color: preferences.accent.color,
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: accents
                .map(
                  (accent) => _AccentSwatch(
                    accent: accent,
                    selected: preferences.accent.name == accent.name,
                    onTap: () =>
                        onChanged(preferences.copyWith(accent: accent)),
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: 18),
          LayoutBuilder(
            builder: (context, box) {
              final wide = box.maxWidth >= 620;
              final children = [
                _AppearanceDropdown<AppearanceFontSize>(
                  label: 'Font Scale',
                  icon: Icons.text_fields,
                  value: preferences.fontSize,
                  items: const {
                    AppearanceFontSize.sm: 'Small (12px / Cozy)',
                    AppearanceFontSize.md: 'Medium (14px / Default)',
                    AppearanceFontSize.lg: 'Large (16px / Expanded)',
                    AppearanceFontSize.xl: 'Extra Large (18px)',
                  },
                  onChanged: (value) =>
                      onChanged(preferences.copyWith(fontSize: value)),
                ),
                _AppearanceDropdown<AppearanceFontFamily>(
                  label: 'Font Family Theme',
                  icon: Icons.title,
                  value: preferences.fontFamily,
                  items: const {
                    AppearanceFontFamily.sans: 'Inter (Elegant Sans)',
                    AppearanceFontFamily.display:
                        'Space Grotesk (Modern Display)',
                    AppearanceFontFamily.mono: 'JetBrains Mono (Technical)',
                  },
                  onChanged: (value) =>
                      onChanged(preferences.copyWith(fontFamily: value)),
                ),
              ];
              return Flex(
                direction: wide ? Axis.horizontal : Axis.vertical,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(flex: wide ? 1 : 0, child: children[0]),
                  SizedBox(width: wide ? 14 : 0, height: wide ? 0 : 14),
                  Expanded(flex: wide ? 1 : 0, child: children[1]),
                ],
              );
            },
          ),
          const SizedBox(height: 18),
          _SectionLabel(
            icon: Icons.layers_outlined,
            label: 'Active Backdrop Mesh Wallpaper',
          ),
          const SizedBox(height: 10),
          LayoutBuilder(
            builder: (context, box) {
              final columns = box.maxWidth >= 760 ? 2 : 1;
              return GridView.count(
                crossAxisCount: columns,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
                childAspectRatio: columns == 1 ? 7 : 5.2,
                children: wallpapers
                    .map(
                      (wallpaper) => _WallpaperButton(
                        label: wallpaper.$2,
                        selected: preferences.wallpaper == wallpaper.$1,
                        accent: preferences.accent.color,
                        onTap: () => onChanged(
                          preferences.copyWith(wallpaper: wallpaper.$1),
                        ),
                      ),
                    )
                    .toList(),
              );
            },
          ),
          const SizedBox(height: 18),
          Divider(color: AppColors.border.withValues(alpha: .6)),
          _AppearanceSlider(
            label: 'Glassmorphism Strength (Backdrop Blur)',
            value: preferences.glassmorphismStrength,
            accent: preferences.accent.color,
            onChanged: (value) => onChanged(
              preferences.copyWith(glassmorphismStrength: value.round()),
            ),
          ),
          _AppearanceSlider(
            label: 'Animation Timing Rate',
            value: preferences.animationStrength,
            accent: preferences.accent.color,
            onChanged: (value) => onChanged(
              preferences.copyWith(animationStrength: value.round()),
            ),
          ),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.panel2.withValues(alpha: .72),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Reduced Motion Mode',
                        style: TextStyle(
                          fontWeight: FontWeight.w900,
                          fontSize: 12,
                        ),
                      ),
                      SizedBox(height: 3),
                      Text(
                        'Deactivate spin cycles and glowing hover transitions.',
                        style: TextStyle(color: AppColors.muted, fontSize: 10),
                      ),
                    ],
                  ),
                ),
                Switch(
                  value: preferences.reducedMotion,
                  activeThumbColor: preferences.accent.color,
                  onChanged: (value) =>
                      onChanged(preferences.copyWith(reducedMotion: value)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          _AppearanceLivePreview(preferences: preferences),
        ],
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;

  const _SectionLabel({
    required this.icon,
    required this.label,
    this.color = AppColors.muted,
  });

  @override
  Widget build(BuildContext context) => Row(
    children: [
      Icon(icon, size: 16, color: color),
      const SizedBox(width: 7),
      Text(
        label,
        style: const TextStyle(
          color: Color(0xFFCBD5E1),
          fontWeight: FontWeight.w900,
          fontSize: 12,
        ),
      ),
    ],
  );
}

class _SegmentedChoice<T> extends StatelessWidget {
  final List<T> values;
  final T selected;
  final String Function(T value) labelFor;
  final ValueChanged<T> onSelected;

  const _SegmentedChoice({
    required this.values,
    required this.selected,
    required this.labelFor,
    required this.onSelected,
  });

  @override
  Widget build(BuildContext context) => LayoutBuilder(
    builder: (context, box) {
      final compact = box.maxWidth < 480;
      return Wrap(
        spacing: 8,
        runSpacing: 8,
        children: values.map((value) {
          final active = selected == value;
          return SizedBox(
            width: compact ? double.infinity : null,
            child: InkWell(
              onTap: () => onSelected(value),
              borderRadius: BorderRadius.circular(9),
              child: Container(
                alignment: Alignment.center,
                padding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 10,
                ),
                decoration: BoxDecoration(
                  color: active
                      ? AppColors.violet.withValues(alpha: .24)
                      : AppColors.panel2,
                  borderRadius: BorderRadius.circular(9),
                  border: Border.all(
                    color: active ? AppColors.violet : AppColors.border,
                  ),
                ),
                child: Text(
                  labelFor(value),
                  style: TextStyle(
                    color: active ? Colors.white : AppColors.muted,
                    fontWeight: FontWeight.w800,
                    fontSize: 12,
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      );
    },
  );
}

class _AccentSwatch extends StatelessWidget {
  final AppearanceAccent accent;
  final bool selected;
  final VoidCallback onTap;

  const _AccentSwatch({
    required this.accent,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) => Tooltip(
    message: accent.name,
    child: InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(99),
      child: Container(
        width: 42,
        height: 42,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: accent.color,
          shape: BoxShape.circle,
          border: Border.all(
            color: selected ? Colors.white : Colors.transparent,
            width: 2,
          ),
          boxShadow: selected
              ? [
                  BoxShadow(
                    color: accent.color.withValues(alpha: .45),
                    blurRadius: 14,
                  ),
                ]
              : null,
        ),
        child: selected
            ? const Icon(Icons.check, color: Colors.white, size: 18)
            : null,
      ),
    ),
  );
}

class _AppearanceDropdown<T> extends StatelessWidget {
  final String label;
  final IconData icon;
  final T value;
  final Map<T, String> items;
  final ValueChanged<T> onChanged;

  const _AppearanceDropdown({
    required this.label,
    required this.icon,
    required this.value,
    required this.items,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _SectionLabel(icon: icon, label: label),
      const SizedBox(height: 8),
      Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 10),
        decoration: BoxDecoration(
          color: AppColors.panel2,
          borderRadius: BorderRadius.circular(9),
          border: Border.all(color: AppColors.border),
        ),
        child: DropdownButtonHideUnderline(
          child: DropdownButton<T>(
            value: value,
            isExpanded: true,
            dropdownColor: AppColors.panel,
            style: const TextStyle(color: AppColors.text, fontSize: 12),
            items: items.entries
                .map(
                  (entry) => DropdownMenuItem<T>(
                    value: entry.key,
                    child: Text(entry.value),
                  ),
                )
                .toList(),
            onChanged: (next) {
              if (next != null) onChanged(next);
            },
          ),
        ),
      ),
    ],
  );
}

class _WallpaperButton extends StatelessWidget {
  final String label;
  final bool selected;
  final Color accent;
  final VoidCallback onTap;

  const _WallpaperButton({
    required this.label,
    required this.selected,
    required this.accent,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) => InkWell(
    onTap: onTap,
    borderRadius: BorderRadius.circular(10),
    child: Container(
      alignment: Alignment.centerLeft,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: selected
            ? accent.withValues(alpha: .18)
            : AppColors.panel2.withValues(alpha: .88),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: selected ? accent : AppColors.border),
      ),
      child: Text(
        label,
        overflow: TextOverflow.ellipsis,
        style: TextStyle(
          color: selected ? AppColors.text : AppColors.muted,
          fontWeight: selected ? FontWeight.w900 : FontWeight.w700,
          fontSize: 12,
        ),
      ),
    ),
  );
}

class _AppearanceSlider extends StatelessWidget {
  final String label;
  final int value;
  final Color accent;
  final ValueChanged<double> onChanged;

  const _AppearanceSlider({
    required this.label,
    required this.value,
    required this.accent,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 12),
    child: Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _SectionLabel(icon: Icons.tune, label: label),
            ),
            _MiniBadge(text: '$value%', color: AppColors.border),
          ],
        ),
        Slider(
          min: 0,
          max: 100,
          value: value.toDouble(),
          activeColor: accent,
          inactiveColor: AppColors.border,
          onChanged: onChanged,
        ),
      ],
    ),
  );
}

class _AppearanceLivePreview extends StatelessWidget {
  final AppearancePreferences preferences;

  const _AppearanceLivePreview({required this.preferences});

  @override
  Widget build(BuildContext context) {
    final isLight =
        preferences.theme == AppearanceThemeMode.light ||
        preferences.wallpaper == 'light-gradient';
    final textStyle = switch (preferences.fontFamily) {
      AppearanceFontFamily.mono => GoogleFonts.robotoMono(),
      AppearanceFontFamily.display => GoogleFonts.spaceGrotesk(),
      AppearanceFontFamily.sans => GoogleFonts.inter(),
    };
    final fontSize = switch (preferences.fontSize) {
      AppearanceFontSize.sm => 12.0,
      AppearanceFontSize.md => 14.0,
      AppearanceFontSize.lg => 16.0,
      AppearanceFontSize.xl => 18.0,
    };
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.bgDeep.withValues(alpha: .54),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.visibility_outlined, size: 15),
              const SizedBox(width: 6),
              const Expanded(
                child: Text(
                  'Real-time System Render',
                  style: TextStyle(
                    color: AppColors.muted,
                    fontWeight: FontWeight.w900,
                    fontSize: 11,
                    letterSpacing: 1,
                  ),
                ),
              ),
              _MiniBadge(text: 'Live Mockup', color: AppColors.emerald),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(13),
            decoration: BoxDecoration(
              color: isLight
                  ? Colors.white.withValues(alpha: .72)
                  : AppColors.border.withValues(
                      alpha: preferences.glassmorphismStrength / 160,
                    ),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: preferences.accent.color.withValues(alpha: .32),
              ),
            ),
            child: DefaultTextStyle.merge(
              style: textStyle.copyWith(fontSize: fontSize),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Dynamic Header Callout',
                    style: TextStyle(
                      color: preferences.accent.color,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Typography, borders, glass blur and interaction timing match the custom options at ${preferences.animationStrength}% speed.',
                    style: TextStyle(
                      color: isLight
                          ? const Color(0xFF475569)
                          : AppColors.muted,
                      height: 1.35,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class MarketplaceView extends StatelessWidget {
  const MarketplaceView({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(18),
      children: [
        const _PaneTitle(
          title: 'FLOW App & Integrity Marketplace',
          subtitle:
              'Connect GitHub, Jira, Calendar, Figma and enterprise tools.',
        ),
        const SizedBox(height: 16),
        const SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _Pill(text: 'All Ecosystem Tools', selected: true),
              _Pill(text: 'Productivity'),
              _Pill(text: 'Coding & Dev'),
              _Pill(text: 'Messaging'),
              _Pill(text: 'Design / Creative'),
            ],
          ),
        ),
        const SizedBox(height: 18),
        LayoutBuilder(
          builder: (context, box) {
            final columns = box.maxWidth > 1100
                ? 3
                : box.maxWidth > 700
                ? 2
                : 1;
            return GridView.count(
              crossAxisCount: columns,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              childAspectRatio: columns == 1 ? 1.65 : 1.2,
              children: MockData.marketplaceApps
                  .map((app) => _AppCard(app: app))
                  .toList(),
            );
          },
        ),
      ],
    );
  }
}

class _Rail extends StatelessWidget {
  final WorkspaceTab tab;
  final WorkspaceUser currentUser;
  final ValueChanged<WorkspaceUser> onUpdateCurrentUser;
  final ValueChanged<WorkspaceTab> onTab;
  final VoidCallback onOpenAdmin;
  final VoidCallback onOpenMarketplace;

  const _Rail({
    required this.tab,
    required this.currentUser,
    required this.onUpdateCurrentUser,
    required this.onTab,
    required this.onOpenAdmin,
    required this.onOpenMarketplace,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 68,
      color: AppColors.bgDeep,
      child: Column(
        children: [
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 14),
              children: [
                const Center(child: _BrandIcon()),
                const SizedBox(height: 18),
                _RailButton(
                  icon: Icons.chat_bubble_outline,
                  selected: tab == WorkspaceTab.chat,
                  onTap: () => onTab(WorkspaceTab.chat),
                ),
                _RailButton(
                  icon: Icons.description_outlined,
                  selected: tab == WorkspaceTab.document,
                  onTap: () => onTab(WorkspaceTab.document),
                ),
                _RailButton(
                  icon: Icons.fact_check_outlined,
                  selected: tab == WorkspaceTab.tasks,
                  onTap: () => onTab(WorkspaceTab.tasks),
                ),
                _RailButton(
                  icon: Icons.calendar_month_outlined,
                  selected: tab == WorkspaceTab.calendar,
                  onTap: () => onTab(WorkspaceTab.calendar),
                ),
                _RailButton(
                  icon: Icons.bar_chart_outlined,
                  selected: tab == WorkspaceTab.analytics,
                  onTap: () => onTab(WorkspaceTab.analytics),
                ),
                _RailButton(
                  icon: Icons.cloud_outlined,
                  selected: tab == WorkspaceTab.vault,
                  onTap: () => onTab(WorkspaceTab.vault),
                ),
                const SizedBox(height: 18),
                _RailButton(
                  icon: Icons.admin_panel_settings_outlined,
                  onTap: onOpenAdmin,
                ),
                _RailButton(
                  icon: Icons.extension_outlined,
                  onTap: onOpenMarketplace,
                ),
              ],
            ),
          ),
          // Profile avatar trigger -> Work Mode / Edit Profile
          Padding(
            padding: const EdgeInsets.only(bottom: 14, top: 6),
            child: InkWell(
              borderRadius: BorderRadius.circular(22),
              onTap: () => _openWorkModeSheet(context),
              child: Padding(
                padding: const EdgeInsets.all(4),
                child: _Avatar(user: currentUser, size: 38),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _openWorkModeSheet(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => _WorkModeSheet(
        currentUser: currentUser,
        onUpdateCurrentUser: onUpdateCurrentUser,
      ),
    );
  }
}

class _WorkPreset {
  final UserStatus status;
  final String label;
  final String emoji;
  final String customStatus;
  final Color color;
  const _WorkPreset(
    this.status,
    this.label,
    this.emoji,
    this.customStatus,
    this.color,
  );
}

const _workPresets = <_WorkPreset>[
  _WorkPreset(
    UserStatus.online,
    'Active',
    '🟢',
    'Active & Online',
    AppColors.emerald,
  ),
  _WorkPreset(
    UserStatus.busy,
    'Deep Work',
    '⚡',
    'Deep Work Mode (DND)',
    AppColors.violet,
  ),
  _WorkPreset(
    UserStatus.busy,
    'In Meeting',
    '📅',
    'In a Meeting',
    AppColors.rose,
  ),
  _WorkPreset(
    UserStatus.away,
    'Lunch Break',
    '🍜',
    'On Lunch break',
    AppColors.amber,
  ),
  _WorkPreset(
    UserStatus.away,
    'On Vacation',
    '🌴',
    'Out Of Office (Vacation)',
    AppColors.cyan,
  ),
  _WorkPreset(
    UserStatus.online,
    'Coding',
    '💻',
    'Hacking & Coding',
    AppColors.violet,
  ),
  _WorkPreset(
    UserStatus.busy,
    'Brainstorming',
    '💡',
    'Brainstorming / Drawing',
    AppColors.amber,
  ),
];

class _WorkModeSheet extends StatefulWidget {
  final WorkspaceUser currentUser;
  final ValueChanged<WorkspaceUser> onUpdateCurrentUser;
  const _WorkModeSheet({
    required this.currentUser,
    required this.onUpdateCurrentUser,
  });

  @override
  State<_WorkModeSheet> createState() => _WorkModeSheetState();
}

class _WorkModeSheetState extends State<_WorkModeSheet> {
  late final TextEditingController _custom = TextEditingController();

  @override
  void dispose() {
    _custom.dispose();
    super.dispose();
  }

  void _applyPreset(_WorkPreset p) {
    widget.onUpdateCurrentUser(
      widget.currentUser.copyWith(
        status: p.status,
        customStatus: '${p.emoji} ${p.customStatus}',
      ),
    );
    Navigator.of(context).pop();
  }

  void _applyBespoke() {
    final text = _custom.text.trim();
    if (text.isEmpty) return;
    widget.onUpdateCurrentUser(
      widget.currentUser.copyWith(
        status: UserStatus.online,
        customStatus: text,
      ),
    );
    Navigator.of(context).pop();
  }

  Future<void> _openEditProfile() async {
    Navigator.of(context).pop(); // close the sheet first
    final updated = await showDialog<WorkspaceUser>(
      context: context,
      builder: (_) => _EditProfileDialog(currentUser: widget.currentUser),
    );
    if (updated != null) widget.onUpdateCurrentUser(updated);
  }

  @override
  Widget build(BuildContext context) {
    final user = widget.currentUser;
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
      child: Container(
        decoration: const BoxDecoration(
          color: AppColors.bgDeep,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          border: Border(
            top: BorderSide(color: AppColors.border),
            left: BorderSide(color: AppColors.border),
            right: BorderSide(color: AppColors.border),
          ),
        ),
        padding: const EdgeInsets.fromLTRB(16, 10, 16, 18),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: 14),
                decoration: BoxDecoration(
                  color: AppColors.border,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const Text(
              'SET WORK MODE',
              style: TextStyle(
                color: AppColors.muted,
                fontWeight: FontWeight.w900,
                fontSize: 11,
                letterSpacing: 1.4,
              ),
            ),
            const SizedBox(height: 12),

            // Profile card + Edit Profile entry
            InkWell(
              borderRadius: BorderRadius.circular(12),
              onTap: _openEditProfile,
              child: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.panel,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  children: [
                    _Avatar(user: user, size: 34),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            user.name,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontWeight: FontWeight.w800,
                              fontSize: 13,
                            ),
                          ),
                          Text(
                            user.email,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: AppColors.muted,
                              fontSize: 10,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.edit_outlined,
                          size: 13,
                          color: AppColors.violet,
                        ),
                        SizedBox(width: 4),
                        Text(
                          'Edit',
                          style: TextStyle(
                            color: AppColors.violet,
                            fontWeight: FontWeight.w800,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 14),

            // Presets
            ..._workPresets.map((p) {
              final active =
                  user.status == p.status &&
                  (user.customStatus?.contains(p.customStatus) ?? false);
              return Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: InkWell(
                  borderRadius: BorderRadius.circular(10),
                  onTap: () => _applyPreset(p),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 9,
                    ),
                    decoration: BoxDecoration(
                      color: active
                          ? AppColors.violet.withValues(alpha: .15)
                          : Colors.transparent,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: active
                            ? AppColors.violet.withValues(alpha: .4)
                            : Colors.transparent,
                      ),
                    ),
                    child: Row(
                      children: [
                        Text(p.emoji, style: const TextStyle(fontSize: 15)),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                p.label,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w800,
                                  fontSize: 12,
                                ),
                              ),
                              Text(
                                p.customStatus,
                                style: const TextStyle(
                                  color: AppColors.muted,
                                  fontSize: 9,
                                ),
                              ),
                            ],
                          ),
                        ),
                        _MiniBadge(
                          text: p.status.name.toUpperCase(),
                          color: p.color,
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }),

            const SizedBox(height: 6),
            const Divider(color: AppColors.border, height: 18),
            const Text(
              'Or write a bespoke status…',
              style: TextStyle(color: AppColors.muted, fontSize: 11),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _custom,
                    style: const TextStyle(fontSize: 12, color: AppColors.text),
                    onSubmitted: (_) => _applyBespoke(),
                    decoration: InputDecoration(
                      isDense: true,
                      hintText: 'E.g. Out of office ☕',
                      hintStyle: const TextStyle(
                        color: AppColors.muted,
                        fontSize: 12,
                      ),
                      filled: true,
                      fillColor: AppColors.panel,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 10,
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(color: AppColors.border),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(color: AppColors.violet),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                FilledButton(
                  onPressed: _applyBespoke,
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.violet,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 14,
                    ),
                  ),
                  child: const Text(
                    'Set',
                    style: TextStyle(fontWeight: FontWeight.w800, fontSize: 12),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _EditProfileDialog extends StatefulWidget {
  final WorkspaceUser currentUser;
  const _EditProfileDialog({required this.currentUser});

  @override
  State<_EditProfileDialog> createState() => _EditProfileDialogState();
}

class _EditProfileDialogState extends State<_EditProfileDialog> {
  late final TextEditingController _name = TextEditingController(
    text: widget.currentUser.name,
  );
  late final TextEditingController _email = TextEditingController(
    text: widget.currentUser.email,
  );
  late final TextEditingController _avatar = TextEditingController(
    text: widget.currentUser.avatarUrl,
  );

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _avatar.dispose();
    super.dispose();
  }

  void _save() {
    final name = _name.text.trim();
    final email = _email.text.trim();
    if (name.isEmpty || email.isEmpty) return;
    Navigator.of(context).pop(
      widget.currentUser.copyWith(
        name: name,
        email: email,
        avatarUrl: _avatar.text.trim().isEmpty
            ? widget.currentUser.avatarUrl
            : _avatar.text.trim(),
      ),
    );
  }

  InputDecoration _decoration(String hint) => InputDecoration(
    isDense: true,
    hintText: hint,
    hintStyle: const TextStyle(color: AppColors.muted, fontSize: 12),
    filled: true,
    fillColor: AppColors.panel2,
    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(10),
      borderSide: const BorderSide(color: AppColors.border),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(10),
      borderSide: const BorderSide(color: AppColors.violet),
    ),
  );

  Widget _label(IconData icon, String text) => Padding(
    padding: const EdgeInsets.only(bottom: 6),
    child: Row(
      children: [
        Icon(icon, size: 13, color: AppColors.muted),
        const SizedBox(width: 6),
        Text(
          text,
          style: const TextStyle(
            color: AppColors.muted,
            fontWeight: FontWeight.w900,
            fontSize: 10,
            letterSpacing: 1,
          ),
        ),
      ],
    ),
  );

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: AppColors.panel2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(18),
        side: const BorderSide(color: AppColors.border),
      ),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 420),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Container(
              padding: const EdgeInsets.fromLTRB(20, 16, 12, 16),
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: AppColors.border)),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.edit_outlined,
                    size: 16,
                    color: AppColors.violet,
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'Edit Profile',
                    style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
                  ),
                  const Spacer(),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close, size: 18),
                    color: AppColors.muted,
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Avatar preview + URL
                  Row(
                    children: [
                      ClipOval(
                        child: Image.network(
                          _avatar.text.trim().isEmpty
                              ? widget.currentUser.avatarUrl
                              : _avatar.text.trim(),
                          width: 60,
                          height: 60,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) =>
                              Container(
                                width: 60,
                                height: 60,
                                color: AppColors.panel,
                                child: const Icon(Icons.person, size: 30),
                              ),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _label(Icons.camera_alt_outlined, 'AVATAR URL'),
                            TextField(
                              controller: _avatar,
                              style: const TextStyle(
                                fontSize: 11,
                                color: AppColors.text,
                              ),
                              onChanged: (_) => setState(() {}),
                              decoration: _decoration('https://…'),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  _label(Icons.person_outline, 'DISPLAY NAME'),
                  TextField(
                    controller: _name,
                    style: const TextStyle(fontSize: 14, color: AppColors.text),
                    decoration: _decoration('Your name'),
                  ),
                  const SizedBox(height: 16),
                  _label(Icons.mail_outline, 'EMAIL'),
                  TextField(
                    controller: _email,
                    keyboardType: TextInputType.emailAddress,
                    style: const TextStyle(fontSize: 14, color: AppColors.text),
                    decoration: _decoration('you@company.com'),
                  ),
                ],
              ),
            ),
            // Footer
            Container(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 16),
              decoration: const BoxDecoration(
                border: Border(top: BorderSide(color: AppColors.border)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed: () => Navigator.of(context).pop(),
                    child: const Text(
                      'Cancel',
                      style: TextStyle(color: AppColors.muted),
                    ),
                  ),
                  const SizedBox(width: 8),
                  FilledButton.icon(
                    onPressed: _save,
                    style: FilledButton.styleFrom(
                      backgroundColor: AppColors.violet,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 18,
                        vertical: 12,
                      ),
                    ),
                    icon: const Icon(Icons.check, size: 16),
                    label: const Text(
                      'Save Changes',
                      style: TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MobileTabBar extends StatelessWidget {
  final WorkspaceTab tab;
  final ValueChanged<WorkspaceTab> onTab;

  const _MobileTabBar({required this.tab, required this.onTab});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 64,
      decoration: const BoxDecoration(
        color: AppColors.bgDeep,
        border: Border(top: BorderSide(color: AppColors.border)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _MobileTab(
            icon: Icons.chat_bubble_outline,
            selected: tab == WorkspaceTab.chat,
            onTap: () => onTab(WorkspaceTab.chat),
          ),
          _MobileTab(
            icon: Icons.description_outlined,
            selected: tab == WorkspaceTab.document,
            onTap: () => onTab(WorkspaceTab.document),
          ),
          _MobileTab(
            icon: Icons.fact_check_outlined,
            selected: tab == WorkspaceTab.tasks,
            onTap: () => onTab(WorkspaceTab.tasks),
          ),
          _MobileTab(
            icon: Icons.calendar_month_outlined,
            selected: tab == WorkspaceTab.calendar,
            onTap: () => onTab(WorkspaceTab.calendar),
          ),
          _MobileTab(
            icon: Icons.bar_chart_outlined,
            selected: tab == WorkspaceTab.analytics,
            onTap: () => onTab(WorkspaceTab.analytics),
          ),
          _MobileTab(
            icon: Icons.cloud_outlined,
            selected: tab == WorkspaceTab.vault,
            onTap: () => onTab(WorkspaceTab.vault),
          ),
        ],
      ),
    );
  }
}

class _ContextDeck extends StatelessWidget {
  final WorkspaceTab tab;
  final Channel selectedChannel;
  final WorkspaceDoc selectedDoc;
  final ValueChanged<Channel> onChannel;
  final ValueChanged<WorkspaceDoc> onDoc;

  const _ContextDeck({
    required this.tab,
    required this.selectedChannel,
    required this.selectedDoc,
    required this.onChannel,
    required this.onDoc,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 210,
      decoration: const BoxDecoration(
        color: Color(0xFF070B13),
        border: Border(right: BorderSide(color: AppColors.border)),
      ),
      child: ListView(
        padding: const EdgeInsets.all(12),
        children: [
          const Text(
            'WORKSPACE DECK',
            style: TextStyle(
              fontSize: 10,
              color: AppColors.violet,
              fontWeight: FontWeight.w900,
              letterSpacing: 1.6,
            ),
          ),
          const SizedBox(height: 14),
          if (tab == WorkspaceTab.chat) ...[
            const _DeckLabel('Channels & Groups'),
            ...MockData.channels.map(
              (c) => _DeckItem(
                icon: c.isPrivate ? Icons.lock_outline : Icons.tag,
                title: c.name,
                subtitle: c.description,
                selected: c.id == selectedChannel.id,
                trailing: c.unreadCount == 0 ? null : '${c.unreadCount}',
                onTap: () => onChannel(c),
              ),
            ),
            const SizedBox(height: 18),
            const _DeckLabel('Direct Messages'),
            ...MockData.users
                .where((u) => u.id != MockData.currentUser.id)
                .map(
                  (u) => _DeckItem(
                    icon: Icons.person_outline,
                    title: u.name,
                    subtitle: u.customStatus ?? u.email,
                    selected: false,
                    onTap: () {},
                  ),
                ),
          ] else if (tab == WorkspaceTab.document) ...[
            const _DeckLabel('Wiki Manuals'),
            ...MockData.documents.map(
              (d) => _DeckItem(
                icon: Icons.description_outlined,
                title: d.title,
                subtitle: d.updatedAt,
                selected: d.id == selectedDoc.id,
                onTap: () => onDoc(d),
              ),
            ),
          ] else if (tab == WorkspaceTab.tasks) ...[
            const _DeckLabel('Sprint Scopes'),
            const _DeckItem(
              icon: Icons.bolt,
              title: 'Current Sprint',
              subtitle: 'Active',
              selected: true,
            ),
            const _DeckItem(
              icon: Icons.view_kanban_outlined,
              title: 'Backlog Pipeline',
              subtitle: '32 open',
            ),
            const _DeckItem(
              icon: Icons.history,
              title: 'Release Logs',
              subtitle: '12 entries',
            ),
          ] else if (tab == WorkspaceTab.analytics) ...[
            const _DeckLabel('System Telemetry'),
            _Panel(
              color: AppColors.panel2,
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    'WORKSPACE RATING',
                    style: TextStyle(
                      color: AppColors.muted,
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      letterSpacing: .8,
                    ),
                  ),
                  SizedBox(height: 6),
                  _DeckMetricRow(
                    label: 'Sprint Efficiency',
                    value: 'Grade A+',
                    color: AppColors.emerald,
                    bold: true,
                  ),
                  Divider(color: AppColors.border, height: 22),
                  Text(
                    'SQUAD ATTRIBUTES',
                    style: TextStyle(
                      color: AppColors.muted,
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      letterSpacing: .8,
                    ),
                  ),
                  SizedBox(height: 8),
                  _DeckMetricRow(
                    label: 'Sync Velocity',
                    value: '94.2%',
                    color: AppColors.cyan,
                  ),
                  SizedBox(height: 6),
                  _DeckMetricRow(
                    label: 'Response SLA',
                    value: '< 3 mins',
                    color: AppColors.violet,
                  ),
                ],
              ),
            ),
          ] else if (tab == WorkspaceTab.vault) ...[
            const _DeckLabel('Storage Buckets'),
            const _DeckItem(
              icon: Icons.folder_outlined,
              title: 'All Files',
              subtitle: '128 items',
              selected: true,
            ),
            const _DeckItem(
              icon: Icons.image_outlined,
              title: 'Media',
              subtitle: '42 items',
            ),
            const _DeckItem(
              icon: Icons.picture_as_pdf_outlined,
              title: 'Documents',
              subtitle: '57 items',
            ),
            const _DeckItem(
              icon: Icons.lock_outline,
              title: 'Encrypted Vault',
              subtitle: '9 items',
            ),
          ] else ...[
            const _DeckLabel('Coordinated Planner'),
            const _DeckItem(
              icon: Icons.circle,
              title: 'Huddle Schedules',
              subtitle: 'Daily standups',
              selected: true,
            ),
            const _DeckItem(
              icon: Icons.groups_outlined,
              title: 'Team Sync Meetings',
              subtitle: 'Weekly cadence',
            ),
            const _DeckItem(
              icon: Icons.flag_outlined,
              title: 'Sprint Deadlines',
              subtitle: '3 upcoming',
            ),
          ],
        ],
      ),
    );
  }
}

class _CopilotPanel extends StatelessWidget {
  final TeamTask? selectedTask;
  const _CopilotPanel({required this.selectedTask});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 320,
      decoration: const BoxDecoration(
        color: Color(0xFF0B0F1A),
        border: Border(left: BorderSide(color: AppColors.border)),
      ),
      child: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          const Text(
            'FLOW Smart AI Panel',
            style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13),
          ),
          const SizedBox(height: 14),
          _Panel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                _MiniBadge(text: 'AI', color: AppColors.violet),
                SizedBox(height: 12),
                Text(
                  'Hi! I can review specifications, summarize channels, and extract agile tasks into sprint columns.',
                  style: TextStyle(color: AppColors.muted, height: 1.45),
                ),
              ],
            ),
          ),
          if (selectedTask != null) ...[
            const SizedBox(height: 16),
            _Panel(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Linear Task Attributes',
                    style: TextStyle(fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    selectedTask!.title,
                    style: const TextStyle(fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 10),
                  _KeyValue('Priority', selectedTask!.priority.name),
                  _KeyValue('Sprint', selectedTask!.sprint ?? 'Unassigned'),
                  _KeyValue('Due date', selectedTask!.dueDate),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _PaneHeader extends StatelessWidget {
  final String title;
  final String subtitle;
  final List<Widget> actions;

  const _PaneHeader({
    required this.title,
    required this.subtitle,
    this.actions = const [],
  });

  @override
  Widget build(BuildContext context) {
    final compact = MediaQuery.sizeOf(context).width < 720;
    return Container(
      padding: EdgeInsets.all(compact ? 14 : 22),
      decoration: const BoxDecoration(
        color: Color(0x99070B13),
        border: Border(bottom: BorderSide(color: AppColors.border)),
      ),
      child: compact
          ? Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _PaneTitle(title: title, subtitle: subtitle),
                if (actions.isNotEmpty) const SizedBox(height: 12),
                Wrap(spacing: 8, runSpacing: 8, children: actions),
              ],
            )
          : Row(
              children: [
                Expanded(
                  child: _PaneTitle(title: title, subtitle: subtitle),
                ),
                Wrap(spacing: 10, children: actions),
              ],
            ),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  final Message message;
  const _MessageBubble({required this.message});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _Avatar(user: message.user, size: 38),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Flexible(
                    child: Text(
                      message.user.name,
                      style: AppType.senderName, // 14px, w700
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    message.timestamp,
                    style: AppType.timestamp, // mono 11px
                  ),
                  if (message.isPinned)
                    const Padding(
                      padding: EdgeInsets.only(left: 8),
                      child: _MiniBadge(text: 'Pinned', color: AppColors.amber),
                    ),
                ],
              ),
              const SizedBox(height: 5),
              Text(
                message.content,
                style: AppType.message, // Inter 14px, regular
              ),
              if (message.files.isNotEmpty) ...[
                const SizedBox(height: 10),
                ...message.files.map((f) => _Attachment(file: f)),
              ],
              if (message.aiSummary != null) ...[
                const SizedBox(height: 10),
                _AiSummary(text: message.aiSummary!),
              ],
              if (message.reactions.isNotEmpty) ...[
                const SizedBox(height: 10),
                Wrap(
                  spacing: 6,
                  children: message.reactions
                      .map((r) => _ReactionChip(reaction: r))
                      .toList(),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }
}

class _Composer extends StatelessWidget {
  final TextEditingController controller;
  final String target;

  const _Composer({required this.controller, required this.target});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: const BoxDecoration(
        color: Color(0xAA020617),
        border: Border(top: BorderSide(color: AppColors.border)),
      ),
      child: _Panel(
        padding: EdgeInsets.zero,
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              decoration: const BoxDecoration(
                color: AppColors.panel2,
                border: Border(bottom: BorderSide(color: AppColors.border)),
              ),
              child: Row(
                children: const [
                  Icon(Icons.format_bold, size: 17, color: AppColors.muted),
                  SizedBox(width: 12),
                  Icon(Icons.format_italic, size: 17, color: AppColors.muted),
                  SizedBox(width: 12),
                  Icon(Icons.code, size: 17, color: AppColors.cyan),
                  Spacer(),
                  Icon(Icons.attach_file, size: 17, color: AppColors.violet),
                ],
              ),
            ),
            TextField(
              controller: controller,
              minLines: 2,
              maxLines: 4,
              style: AppType.input, // mono input box
              decoration: InputDecoration(
                contentPadding: const EdgeInsets.all(12),
                hintText: 'Message $target...',
                hintStyle: AppType.mono(fontSize: 14, color: AppColors.muted),
                border: InputBorder.none,
              ),
            ),
            Container(
              padding: const EdgeInsets.fromLTRB(12, 0, 12, 10),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      'Markdown active',
                      style: AppType.mono(
                        fontSize: 11,
                        color: AppColors.muted.withValues(alpha: .7),
                      ),
                    ),
                  ),
                  FilledButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.send, size: 16),
                    label: const Text('Send'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DocBlockView extends StatelessWidget {
  final DocBlock block;
  const _DocBlockView(this.block);

  @override
  Widget build(BuildContext context) {
    final style = switch (block.type) {
      'heading1' => const TextStyle(fontSize: 24, fontWeight: FontWeight.w900),
      'heading2' => const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
      'code' => GoogleFonts.jetBrainsMono(
        fontSize: 12,
        color: AppColors.cyan,
        height: 1.5,
      ),
      _ => const TextStyle(
        fontSize: 14,
        color: Color(0xFFCBD5E1),
        height: 1.55,
      ),
    };
    Widget child;
    if (block.type == 'callout') {
      child = _Panel(
        color: AppColors.violet.withValues(alpha: .12),
        child: Text(block.content, style: style),
      );
    } else if (block.type == 'bullet') {
      child = Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('- ', style: TextStyle(color: AppColors.violet)),
          Expanded(child: Text(block.content, style: style)),
        ],
      );
    } else if (block.type == 'checklist') {
      child = Row(
        children: [
          Icon(
            block.checked ? Icons.check_box : Icons.check_box_outline_blank,
            color: block.checked ? AppColors.emerald : AppColors.muted,
            size: 18,
          ),
          const SizedBox(width: 8),
          Expanded(child: Text(block.content, style: style)),
        ],
      );
    } else if (block.type == 'code') {
      child = _Panel(
        color: const Color(0xFF020617),
        child: Text(block.content, style: style),
      );
    } else {
      child = Text(block.content, style: style);
    }
    return Padding(padding: const EdgeInsets.only(bottom: 16), child: child);
  }
}

class _KanbanColumn extends StatelessWidget {
  final TaskStatus status;
  final List<TeamTask> tasks;
  final TeamTask? selected;
  final ValueChanged<TeamTask> onTask;

  const _KanbanColumn({
    required this.status,
    required this.tasks,
    required this.selected,
    required this.onTask,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 292,
      margin: const EdgeInsets.only(right: 14),
      child: _Panel(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                _StatusDot(color: _statusColor(status)),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    _statusLabel(status),
                    style: const TextStyle(fontWeight: FontWeight.w800),
                  ),
                ),
                _MiniBadge(text: '${tasks.length}', color: AppColors.border),
              ],
            ),
            const Divider(height: 24, color: AppColors.border),
            ...tasks.map(
              (task) => _TaskCard(
                task: task,
                selected: selected?.id == task.id,
                onTap: () => onTask(task),
              ),
            ),
            if (tasks.isEmpty)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(24),
                  child: Text(
                    'Empty column',
                    style: TextStyle(color: AppColors.muted),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _TaskCard extends StatelessWidget {
  final TeamTask task;
  final bool selected;
  final VoidCallback onTap;

  const _TaskCard({
    required this.task,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: selected
                ? AppColors.violet.withValues(alpha: .15)
                : AppColors.panel2,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: selected ? AppColors.violet : AppColors.border,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                task.title,
                style: const TextStyle(
                  fontWeight: FontWeight.w800,
                  fontSize: 13,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                task.description,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: AppColors.muted,
                  fontSize: 11,
                  height: 1.35,
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  _MiniBadge(
                    text: task.priority.name.toUpperCase(),
                    color: _priorityColor(task.priority),
                  ),
                  const Spacer(),
                  Text(
                    task.dueDate,
                    style: const TextStyle(
                      color: AppColors.muted,
                      fontSize: 10,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MembersPanel extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return _Panel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Directory List',
            style: TextStyle(fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 14),
          ...MockData.users.map(
            (u) => Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.panel2,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                children: [
                  _Avatar(user: u, size: 34),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          u.name,
                          style: const TextStyle(fontWeight: FontWeight.w800),
                        ),
                        Text(
                          u.email,
                          style: const TextStyle(
                            color: AppColors.muted,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                  _MiniBadge(
                    text: u.role.name.toUpperCase(),
                    color: AppColors.violet,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ProvisionPanel extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return _Panel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: const [
          Text(
            'Provision Member Account',
            style: TextStyle(fontWeight: FontWeight.w900),
          ),
          SizedBox(height: 12),
          _FakeInput(label: 'Full Legal Name', value: 'Liam Vance'),
          _FakeInput(
            label: 'Corporate Email Pointer',
            value: 'liam.v@teamsync.io',
          ),
          _FakeInput(
            label: 'Assigned Security Role',
            value: 'Corporate Member',
          ),
        ],
      ),
    );
  }
}

class _AuditRow extends StatelessWidget {
  final ActivityLog log;
  const _AuditRow({required this.log});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(top: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.panel2,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  log.userName,
                  style: const TextStyle(fontWeight: FontWeight.w800),
                ),
              ),
              Text(
                log.timestamp,
                style: const TextStyle(color: AppColors.muted, fontSize: 10),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            log.action,
            style: const TextStyle(color: AppColors.cyan, fontSize: 12),
          ),
          const SizedBox(height: 4),
          Text(
            '${log.target} - ${log.ip} - ${log.device}',
            style: const TextStyle(color: AppColors.muted, fontSize: 11),
          ),
        ],
      ),
    );
  }
}

class _AppCard extends StatelessWidget {
  final MarketplaceApp app;
  const _AppCard({required this.app});

  @override
  Widget build(BuildContext context) {
    return _Panel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              _MiniBadge(
                text: app.name.characters.first,
                color: AppColors.violet,
              ),
              const Spacer(),
              const Icon(Icons.star, size: 15, color: AppColors.amber),
              const SizedBox(width: 4),
              Text(
                '${app.rating}',
                style: const TextStyle(
                  fontWeight: FontWeight.w800,
                  fontSize: 12,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            app.name,
            style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15),
          ),
          const SizedBox(height: 5),
          Text(
            app.vendor,
            style: const TextStyle(color: AppColors.muted, fontSize: 11),
          ),
          const SizedBox(height: 10),
          Expanded(
            child: Text(
              app.description,
              style: const TextStyle(
                color: AppColors.muted,
                height: 1.35,
                fontSize: 12,
              ),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: Text(
                  'Review SOC-2 Tokens',
                  style: TextStyle(
                    color: AppColors.violet.withValues(alpha: .95),
                    fontWeight: FontWeight.w800,
                    fontSize: 11,
                  ),
                ),
              ),
              _MiniBadge(
                text: app.isInstalled ? 'Installed' : 'Authenticate',
                color: app.isInstalled ? AppColors.border : AppColors.violet,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _Brand extends StatelessWidget {
  const _Brand();

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        const _BrandIcon(),
        const SizedBox(width: 10),
        Flexible(
          child: RichText(
            overflow: TextOverflow.ellipsis,
            text: const TextSpan(
              style: TextStyle(
                fontWeight: FontWeight.w900,
                fontSize: 21,
                color: AppColors.text,
                height: 1,
              ),
              children: [
                TextSpan(text: 'F'),
                TextSpan(
                  text: 'LOW',
                  style: TextStyle(color: Color(0xFFA5B4FC)),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 6),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 4),
          decoration: BoxDecoration(
            color: const Color(0xFF062638),
            borderRadius: BorderRadius.circular(4),
            border: Border.all(color: const Color(0xFF0E7490)),
          ),
          child: const Text(
            'ENT',
            style: TextStyle(
              color: AppColors.cyan,
              fontSize: 10,
              fontWeight: FontWeight.w900,
              letterSpacing: 1.4,
              height: 1,
            ),
          ),
        ),
      ],
    );
  }
}

class _BrandIcon extends StatelessWidget {
  const _BrandIcon();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 40,
      height: 40,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF1ED6FF), Color(0xFF7C3AED)],
        ),
        borderRadius: BorderRadius.circular(9),
        boxShadow: [
          BoxShadow(
            color: AppColors.violet.withValues(alpha: .42),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: const Icon(Icons.auto_awesome, size: 22, color: Colors.white),
    );
  }
}

class _SearchBox extends StatelessWidget {
  final VoidCallback? onTap;
  const _SearchBox({this.onTap});
  @override
  Widget build(BuildContext context) => InkWell(
    onTap: onTap,
    borderRadius: BorderRadius.circular(9),
    child: Container(
    height: 42,
    padding: const EdgeInsets.symmetric(horizontal: 14),
    decoration: BoxDecoration(
      color: const Color(0xFF101827),
      borderRadius: BorderRadius.circular(9),
      border: Border.all(color: const Color(0xFF1D2A44)),
    ),
    child: const Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(Icons.search, size: 18, color: Color(0xFF8EA4C8)),
        SizedBox(width: 10),
        Expanded(
          child: Text(
            'Search Workspace...',
            style: TextStyle(color: Color(0xFFA8BCE3), fontSize: 14),
          ),
        ),
        _ShortcutPill(),
      ],
    ),
    ),
  );
}

class _ShortcutPill extends StatelessWidget {
  const _ShortcutPill();

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
    decoration: BoxDecoration(
      color: const Color(0xFF0B1220),
      borderRadius: BorderRadius.circular(5),
      border: Border.all(color: const Color(0xFF24324E)),
    ),
    child: const Text(
      '⌘K',
      style: TextStyle(
        color: Color(0xFF64748B),
        fontSize: 11,
        fontWeight: FontWeight.w800,
        height: 1,
      ),
    ),
  );
}

class _PresenceFacepile extends StatelessWidget {
  final VoidCallback? onTap;
  const _PresenceFacepile({this.onTap});
  @override
  Widget build(BuildContext context) {
    final users = MockData.users.take(4).toList();
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: SizedBox(
        width: 118,
        height: 40,
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            for (var i = 0; i < users.length; i++)
              Positioned(
                left: i * 27,
                child: _Avatar(user: users[i], size: 38),
              ),
          ],
        ),
      ),
    );
  }
}

class _Avatar extends StatelessWidget {
  final WorkspaceUser user;
  final double size;
  const _Avatar({required this.user, required this.size});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          width: size,
          height: size,
          padding: const EdgeInsets.all(2),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: const Color(0xFF070B13),
            border: Border.all(color: const Color(0xFF22314C)),
          ),
          child: ClipOval(
            child: Image.network(
              user.avatarUrl,
              width: size,
              height: size,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) => Container(
                width: size,
                height: size,
                color: AppColors.panel,
                child: Icon(Icons.person, size: size * .55),
              ),
            ),
          ),
        ),
        Positioned(
          right: 0,
          bottom: 0,
          child: _StatusDot(color: _userStatusColor(user.status), size: 8),
        ),
      ],
    );
  }
}

class _Panel extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final Color color;
  const _Panel({
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.color = AppColors.panel,
  });
  @override
  Widget build(BuildContext context) => Container(
    padding: padding,
    decoration: BoxDecoration(
      color: color,
      borderRadius: BorderRadius.circular(14),
      border: Border.all(color: AppColors.border),
    ),
    child: child,
  );
}

class _PaneTitle extends StatelessWidget {
  final String title;
  final String subtitle;
  const _PaneTitle({required this.title, required this.subtitle});
  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(
        title,
        style: AppType.channelTitle, // 17px, w700 (headers/channel titles)
      ),
      const SizedBox(height: 4),
      Text(
        subtitle,
        style: AppType.sans(fontSize: 12, color: AppColors.muted),
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
      ),
    ],
  );
}

class _HeaderButton extends StatelessWidget {
  final IconData icon;
  final String? label;
  final Color color;
  final VoidCallback? onTap;
  const _HeaderButton({
    required this.icon,
    this.label,
    required this.color,
    this.onTap,
  });
  @override
  Widget build(BuildContext context) =>
      _IconButton(icon: icon, label: label, color: color, onTap: onTap);
}

class _IconButton extends StatelessWidget {
  final IconData icon;
  final String? label;
  final Color color;
  final VoidCallback? onTap;
  const _IconButton({
    required this.icon,
    this.label,
    this.color = AppColors.muted,
    this.onTap,
  });
  @override
  Widget build(BuildContext context) {
    final body = Container(
      height: 34,
      padding: EdgeInsets.symmetric(
        horizontal: label == null ? 10 : 14,
        vertical: 0,
      ),
      decoration: BoxDecoration(
        color: const Color(0xFF111A2D),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFF1D2A44)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: color, size: 17),
          if (label != null) ...[
            const SizedBox(width: 8),
            Text(
              label!,
              style: TextStyle(
                color: color == AppColors.cyan ? AppColors.cyan : Colors.white,
                fontWeight: FontWeight.w900,
                fontSize: 13,
              ),
            ),
          ],
        ],
      ),
    );
    if (onTap == null) return body;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: body,
    );
  }
}

class _TopTab extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;
  const _TopTab({
    required this.label,
    required this.selected,
    required this.onTap,
  });
  @override
  Widget build(BuildContext context) => Padding(
    padding: EdgeInsets.zero,
    child: InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(9),
      child: Container(
        height: 35,
        alignment: Alignment.center,
        padding: const EdgeInsets.symmetric(horizontal: 15),
        decoration: BoxDecoration(
          color: selected ? const Color(0xFF1A2740) : Colors.transparent,
          borderRadius: BorderRadius.circular(7),
          border: Border.all(
            color: selected ? const Color(0xFF22314C) : Colors.transparent,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w900,
            fontSize: 13,
          ),
        ),
      ),
    ),
  );
}

class _NotifButton extends StatelessWidget {
  final VoidCallback? onTap;
  const _NotifButton({this.onTap});
  @override
  Widget build(BuildContext context) => Stack(
    clipBehavior: Clip.none,
    children: [
      _IconButton(
        icon: Icons.notifications_none,
        color: AppColors.violet,
        onTap: onTap,
      ),
      Positioned(
        right: -5,
        top: -7,
        child: Container(
          width: 18,
          height: 18,
          alignment: Alignment.center,
          decoration: const BoxDecoration(
            color: AppColors.rose,
            shape: BoxShape.circle,
          ),
          child: const Text(
            '2',
            style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900),
          ),
        ),
      ),
    ],
  );
}

class _RailButton extends StatelessWidget {
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;
  const _RailButton({
    required this.icon,
    this.selected = false,
    required this.onTap,
  });
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 5),
    child: IconButton(
      onPressed: onTap,
      icon: Icon(icon),
      color: selected ? AppColors.violet : AppColors.muted,
      style: IconButton.styleFrom(
        backgroundColor: selected
            ? AppColors.violet.withValues(alpha: .15)
            : Colors.transparent,
      ),
    ),
  );
}

class _MobileTab extends StatelessWidget {
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;
  const _MobileTab({
    required this.icon,
    required this.selected,
    required this.onTap,
  });
  @override
  Widget build(BuildContext context) => IconButton(
    onPressed: onTap,
    icon: Icon(icon),
    color: selected ? AppColors.violet : AppColors.muted,
  );
}

class _DeckLabel extends StatelessWidget {
  final String text;
  const _DeckLabel(this.text);
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 8, top: 4),
    child: Text(
      text,
      style: const TextStyle(
        color: AppColors.muted,
        fontWeight: FontWeight.w900,
        fontSize: 10,
        letterSpacing: 1,
      ),
    ),
  );
}

class _DeckItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final bool selected;
  final String? trailing;
  final VoidCallback? onTap;
  const _DeckItem({
    required this.icon,
    required this.title,
    required this.subtitle,
    this.selected = false,
    this.trailing,
    this.onTap,
  });
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 6),
    child: InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(11),
      child: Container(
        padding: const EdgeInsets.all(9),
        decoration: BoxDecoration(
          color: selected
              ? AppColors.violet.withValues(alpha: .14)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(11),
          border: Border.all(
            color: selected
                ? AppColors.violet.withValues(alpha: .5)
                : Colors.transparent,
          ),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              size: 15,
              color: selected ? AppColors.violet : AppColors.muted,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontWeight: FontWeight.w800,
                      fontSize: 12,
                    ),
                  ),
                  Text(
                    subtitle,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: AppColors.muted,
                      fontSize: 10,
                    ),
                  ),
                ],
              ),
            ),
            if (trailing != null)
              _MiniBadge(text: trailing!, color: AppColors.rose),
          ],
        ),
      ),
    ),
  );
}

class _MiniBadge extends StatelessWidget {
  final String text;
  final Color color;
  const _MiniBadge({required this.text, required this.color});
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
    decoration: BoxDecoration(
      color: color.withValues(alpha: .18),
      borderRadius: BorderRadius.circular(8),
      border: Border.all(color: color.withValues(alpha: .45)),
    ),
    child: Text(
      text,
      style: TextStyle(
        color: color == AppColors.border ? AppColors.muted : color,
        fontWeight: FontWeight.w900,
        fontSize: 10,
      ),
    ),
  );
}

class _DeckMetricRow extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  final bool bold;
  const _DeckMetricRow({
    required this.label,
    required this.value,
    required this.color,
    this.bold = false,
  });
  @override
  Widget build(BuildContext context) => Row(
    mainAxisAlignment: MainAxisAlignment.spaceBetween,
    children: [
      Text(
        label,
        style: TextStyle(
          color: bold ? AppColors.text : AppColors.muted,
          fontSize: 12,
          fontWeight: bold ? FontWeight.w800 : FontWeight.w500,
        ),
      ),
      Text(
        value,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.w800,
          fontFamily: 'monospace',
        ),
      ),
    ],
  );
}

class _Attachment extends StatelessWidget {
  final MessageAttachment file;
  const _Attachment({required this.file});
  @override
  Widget build(BuildContext context) => _Panel(
    padding: const EdgeInsets.all(10),
    color: AppColors.panel2,
    child: Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        const Icon(Icons.attach_file, color: AppColors.violet, size: 18),
        const SizedBox(width: 8),
        Flexible(
          child: Text(
            file.name,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          file.size,
          style: const TextStyle(color: AppColors.muted, fontSize: 10),
        ),
      ],
    ),
  );
}

class _AiSummary extends StatelessWidget {
  final String text;
  const _AiSummary({required this.text});
  @override
  Widget build(BuildContext context) => _Panel(
    padding: const EdgeInsets.all(10),
    color: AppColors.violet.withValues(alpha: .12),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Icon(Icons.auto_awesome, color: AppColors.violet, size: 16),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(
              color: Color(0xFFD8B4FE),
              fontSize: 11,
              height: 1.35,
            ),
          ),
        ),
      ],
    ),
  );
}

class _ReactionChip extends StatelessWidget {
  final MessageReaction reaction;
  const _ReactionChip({required this.reaction});
  @override
  Widget build(BuildContext context) => _MiniBadge(
    text: '${reaction.emoji} ${reaction.userNames.length}',
    color: AppColors.border,
  );
}

class _Pill extends StatelessWidget {
  final String text;
  final bool selected;
  const _Pill({required this.text, this.selected = false});
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(right: 8),
    child: _MiniBadge(
      text: text,
      color: selected ? AppColors.violet : AppColors.border,
    ),
  );
}

class _MetricCard extends StatelessWidget {
  final String label;
  final String value;
  final String note;
  const _MetricCard({
    required this.label,
    required this.value,
    required this.note,
  });
  @override
  Widget build(BuildContext context) => SizedBox(
    width: 230,
    child: _Panel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: AppColors.muted,
              fontSize: 10,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 4),
          Text(
            note,
            style: const TextStyle(color: AppColors.emerald, fontSize: 12),
          ),
        ],
      ),
    ),
  );
}

class _Bar extends StatelessWidget {
  final String label;
  final double value;
  final Color color;
  const _Bar({required this.label, required this.value, required this.color});
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 14),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(child: Text(label, style: const TextStyle(fontSize: 12))),
            Text(
              '${(value * 100).round()}%',
              style: const TextStyle(color: AppColors.muted, fontSize: 11),
            ),
          ],
        ),
        const SizedBox(height: 6),
        LinearProgressIndicator(
          value: value,
          color: color,
          backgroundColor: AppColors.bgDeep,
          minHeight: 8,
          borderRadius: BorderRadius.circular(20),
        ),
      ],
    ),
  );
}

class _FakeInput extends StatelessWidget {
  final String label;
  final String value;
  const _FakeInput({required this.label, required this.value});
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 12),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: AppColors.muted,
            fontSize: 10,
            fontWeight: FontWeight.w900,
          ),
        ),
        const SizedBox(height: 5),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(11),
          decoration: BoxDecoration(
            color: AppColors.panel2,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: AppColors.border),
          ),
          child: Text(value, style: const TextStyle(fontSize: 12)),
        ),
      ],
    ),
  );
}

class _KeyValue extends StatelessWidget {
  final String label;
  final String value;
  const _KeyValue(this.label, this.value);
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(top: 7),
    child: Row(
      children: [
        Expanded(
          child: Text(
            label,
            style: const TextStyle(color: AppColors.muted, fontSize: 12),
          ),
        ),
        Text(
          value,
          style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12),
        ),
      ],
    ),
  );
}

class _StatusDot extends StatelessWidget {
  final Color color;
  final double size;
  const _StatusDot({required this.color, this.size = 10});
  @override
  Widget build(BuildContext context) => Container(
    width: size,
    height: size,
    decoration: BoxDecoration(
      color: color,
      shape: BoxShape.circle,
      border: Border.all(color: AppColors.bgDeep),
    ),
  );
}

Color _userStatusColor(UserStatus status) => switch (status) {
  UserStatus.online => AppColors.emerald,
  UserStatus.away => AppColors.amber,
  UserStatus.offline => const Color(0xFF64748B),
  UserStatus.busy => AppColors.rose,
};

String _statusLabel(TaskStatus status) => switch (status) {
  TaskStatus.backlog => 'Backlog',
  TaskStatus.todo => 'Todo',
  TaskStatus.inProgress => 'In Progress',
  TaskStatus.inReview => 'In Review',
  TaskStatus.done => 'Done',
};

Color _statusColor(TaskStatus status) => switch (status) {
  TaskStatus.done => AppColors.emerald,
  TaskStatus.inProgress => AppColors.violet,
  TaskStatus.todo => AppColors.cyan,
  TaskStatus.backlog => AppColors.muted,
  TaskStatus.inReview => AppColors.amber,
};

Color _priorityColor(TaskPriority priority) => switch (priority) {
  TaskPriority.urgent => AppColors.rose,
  TaskPriority.high => AppColors.amber,
  TaskPriority.medium => AppColors.violet,
  TaskPriority.low => AppColors.muted,
};
