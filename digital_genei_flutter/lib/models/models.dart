import 'package:flutter/material.dart';

// ── Enums ──────────────────────────────────────────────────────────────────
enum UserRole     { admin, member, guest, billing }
enum UserStatus   { online, away, offline, busy }
enum TaskStatus   { backlog, todo, inProgress, inReview, done }
enum TaskPriority { low, medium, high, urgent }
enum ScreenView   { workspace, admin, marketplace }
enum WorkspaceTab { chat, document, tasks, calendar, analytics, vault }

// ── User ──────────────────────────────────────────────────────────────────
class WorkspaceUser {
  final String id;
  String name;
  String email;
  String avatarUrl;
  UserRole role;
  UserStatus status;
  String? customStatus;

  WorkspaceUser({
    required this.id,
    required this.name,
    required this.email,
    required this.avatarUrl,
    required this.role,
    required this.status,
    this.customStatus,
  });

  Color get accentColor => switch (id) {
    'u1' => const Color(0xFF8B5CF6),
    'u2' => const Color(0xFF06B6D4),
    'u3' => const Color(0xFF10B981),
    'u4' => const Color(0xFFF59E0B),
    _    => const Color(0xFF6366F1),
  };

  Color get statusColor => switch (status) {
    UserStatus.online  => const Color(0xFF06D6A0),
    UserStatus.away    => const Color(0xFFFBBF24),
    UserStatus.busy    => const Color(0xFFF43F5E),
    UserStatus.offline => const Color(0xFF475569),
  };

  WorkspaceUser copyWith({
    String? name, String? email, String? avatarUrl,
    UserRole? role, UserStatus? status, String? customStatus,
  }) => WorkspaceUser(
    id:           id,
    name:         name         ?? this.name,
    email:        email        ?? this.email,
    avatarUrl:    avatarUrl    ?? this.avatarUrl,
    role:         role         ?? this.role,
    status:       status       ?? this.status,
    customStatus: customStatus ?? this.customStatus,
  );
}

// ── Channel ──────────────────────────────────────────────────────────────
class Channel {
  final String id;
  final String name;
  final String description;
  final bool isPrivate;
  int unreadCount;

  Channel({
    required this.id,
    required this.name,
    required this.description,
    required this.isPrivate,
    this.unreadCount = 0,
  });
}

// ── Message ───────────────────────────────────────────────────────────────
class MessageReaction {
  final String emoji;
  final List<String> userNames;
  MessageReaction({required this.emoji, required this.userNames});
}

class MessageAttachment {
  final String name;
  final String size;
  final String type;
  MessageAttachment({required this.name, required this.size, required this.type});
}

class Message {
  final String id;
  final String channelId;
  final WorkspaceUser user;
  String content;
  final String timestamp;
  final bool isPinned;
  final List<MessageReaction> reactions;
  final List<MessageAttachment> files;
  final String? aiSummary;
  int repliesCount;

  Message({
    required this.id,
    required this.channelId,
    required this.user,
    required this.content,
    required this.timestamp,
    this.isPinned = false,
    List<MessageReaction>? reactions,
    List<MessageAttachment>? files,
    this.aiSummary,
    this.repliesCount = 0,
  })  : reactions = reactions ?? [],
        files = files ?? [];
}

// ── Document ─────────────────────────────────────────────────────────────
class DocBlock {
  final String id;
  final String type; // 'heading1' | 'heading2' | 'text' | 'bullet' | 'checklist' | 'code' | 'callout'
  final String content;
  final bool checked;
  final String? language;

  const DocBlock({
    required this.id,
    required this.type,
    required this.content,
    this.checked = false,
    this.language,
  });

  DocBlock copyWith({String? type, String? content, bool? checked, String? language}) =>
      DocBlock(
        id: id,
        type: type ?? this.type,
        content: content ?? this.content,
        checked: checked ?? this.checked,
        language: language ?? this.language,
      );
}

class WorkspaceDoc {
  final String id;
  String title;
  String emoji;
  List<DocBlock> blocks;
  String updatedAt;
  WorkspaceUser updatedBy;
  bool isFavorite;

  WorkspaceDoc({
    required this.id,
    required this.title,
    required this.emoji,
    required this.blocks,
    required this.updatedAt,
    required this.updatedBy,
    this.isFavorite = false,
  });
}

// ── Task ──────────────────────────────────────────────────────────────────
class TeamTask {
  final String id;
  String title;
  String description;
  TaskStatus status;
  TaskPriority priority;
  String dueDate;
  List<WorkspaceUser> assignees;
  String project;
  String? sprint;

  TeamTask({
    required this.id,
    required this.title,
    required this.description,
    required this.status,
    required this.priority,
    required this.dueDate,
    required this.assignees,
    required this.project,
    this.sprint,
  });

  Color get priorityColor => switch (priority) {
    TaskPriority.urgent => const Color(0xFFF43F5E),
    TaskPriority.high   => const Color(0xFFFBBF24),
    TaskPriority.medium => const Color(0xFF6366F1),
    TaskPriority.low    => const Color(0xFF475569),
  };
}

// ── Audit log ─────────────────────────────────────────────────────────────
class ActivityLog {
  final String id;
  final String userName;
  final String action;
  final String target;
  final String ip;
  final String timestamp;
  final String device;

  const ActivityLog({
    required this.id,
    required this.userName,
    required this.action,
    required this.target,
    required this.ip,
    required this.timestamp,
    required this.device,
  });
}

// ── Marketplace ───────────────────────────────────────────────────────────
class MarketplaceApp {
  final String id;
  final String name;
  final String description;
  final String vendor;
  final double rating;
  final bool isInstalled;

  const MarketplaceApp({
    required this.id,
    required this.name,
    required this.description,
    required this.vendor,
    required this.rating,
    required this.isInstalled,
  });
}
