import 'package:flutter/material.dart';

/// TeamSync Design Tokens — exact match to React teamsync index.css + Tailwind values
class TS {
  // ── Backgrounds ────────────────────────────────────────────────────────────
  static const bg         = Color(0xFF0F172A); // slate-900 — main app bg
  static const bgPanel    = Color(0xFF0B0F19); // sidebar slim rail
  static const bgDeck     = Color(0xFF070B13); // context deck
  static const bgCard     = Color(0xFF121B2E); // cards / panels
  static const bgElevated = Color(0xFF1D2942); // elevated surfaces
  static const bgInput    = Color(0xFF0F172A); // input fields
  static const bgHover    = Color(0xFF1E293B); // hover states

  // ── Accent ─────────────────────────────────────────────────────────────────
  static const indigo     = Color(0xFF6366F1); // primary accent (#6366F1)
  static const indigoDark = Color(0xFF4F46E5); // darker indigo
  static const indigoLight= Color(0xFF818CF8); // lighter indigo
  static const cyan       = Color(0xFF06B6D4); // cyan-500
  static const teal       = Color(0xFF06D6A0); // online / success teal
  static const violet     = Color(0xFF8B5CF6); // violet-500
  static const emerald    = Color(0xFF10B981); // emerald
  static const amber      = Color(0xFFF59E0B); // amber
  static const rose       = Color(0xFFF43F5E); // rose
  static const sky        = Color(0xFF3B82F6); // blue-500

  // ── Status ─────────────────────────────────────────────────────────────────
  static const statusOnline  = Color(0xFF06D6A0); // #06D6A0 teal-green
  static const statusAway    = Color(0xFFFBBF24); // amber-400
  static const statusBusy    = Color(0xFFF43F5E); // rose-500
  static const statusOffline = Color(0xFF475569); // slate-600

  // ── Text ───────────────────────────────────────────────────────────────────
  static const text1 = Color(0xFFF8FAFC); // slate-50  — primary
  static const text2 = Color(0xFFCBD5E1); // slate-300 — secondary
  static const text3 = Color(0xFF94A3B8); // slate-400 — muted
  static const text4 = Color(0xFF64748B); // slate-500 — dimmed
  static const text5 = Color(0xFF475569); // slate-600 — very dim

  // ── Borders ────────────────────────────────────────────────────────────────
  static const border     = Color(0x1FFFFFFF); // white/12 subtle
  static const borderCard = Color(0xFF1E293B); // slate-800
  static const borderMid  = Color(0xFF334155); // slate-700
  static const borderAcc  = Color(0x666366F1); // indigo/40

  // ── Gradients ──────────────────────────────────────────────────────────────
  static const gradHero = LinearGradient(
    colors: [Color(0xFF8B5CF6), Color(0xFF6366F1), Color(0xFF22D3EE)],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );
  static const gradIndigo = LinearGradient(
    colors: [Color(0xFF6366F1), Color(0xFF4F46E5)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  static const gradIndigoViolet = LinearGradient(
    colors: [Color(0xFF7C3AED), Color(0xFF6366F1)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  static const gradTeal = LinearGradient(
    colors: [Color(0xFF06D6A0), Color(0xFF06B6D4)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  static const gradTopAccent = LinearGradient(
    colors: [Colors.transparent, Color(0xFF6366F1), Color(0xFF22D3EE), Colors.transparent],
    stops: [0, 0.3, 0.7, 1],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  // ── Shadows ────────────────────────────────────────────────────────────────
  static List<BoxShadow> cardShadow = [
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.35),
      blurRadius: 24,
      offset: const Offset(0, 8),
    ),
  ];
  static List<BoxShadow> indigoGlow = [
    BoxShadow(
      color: const Color(0xFF6366F1).withValues(alpha: 0.25),
      blurRadius: 16,
      offset: const Offset(0, 4),
    ),
  ];

  // ── BoxDecoration helpers ──────────────────────────────────────────────────
  static BoxDecoration card({
    Color? color,
    double radius = 12,
    Color? border,
  }) => BoxDecoration(
    color: color ?? bgCard,
    borderRadius: BorderRadius.circular(radius),
    border: Border.all(color: border ?? borderCard, width: 1),
    boxShadow: cardShadow,
  );

  static BoxDecoration accentBtn({double radius = 10}) => BoxDecoration(
    gradient: gradIndigo,
    borderRadius: BorderRadius.circular(radius),
    boxShadow: indigoGlow,
  );

  static BoxDecoration railBtn({bool active = false, Color? color}) => BoxDecoration(
    color: active
        ? (color ?? indigo).withValues(alpha: 0.20)
        : Colors.transparent,
    borderRadius: BorderRadius.circular(12),
    border: Border.all(
      color: active
          ? (color ?? indigo).withValues(alpha: 0.45)
          : Colors.transparent,
    ),
  );

  static BoxDecoration glassInput = BoxDecoration(
    color: bgInput,
    borderRadius: BorderRadius.circular(10),
    border: Border.all(color: borderCard),
  );

  // ── Text styles ────────────────────────────────────────────────────────────
  static const tsTitle = TextStyle(
    color: text1,
    fontWeight: FontWeight.w700,
    fontSize: 14,
    letterSpacing: -0.2,
  );
  static const tsMono = TextStyle(
    color: text4,
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 0.8,
    fontWeight: FontWeight.w600,
  );
  static const tsLabel = TextStyle(
    color: text4,
    fontSize: 9.5,
    fontWeight: FontWeight.w700,
    letterSpacing: 1.2,
  );
}
