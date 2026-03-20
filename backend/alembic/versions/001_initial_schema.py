"""Initial schema — all existing tables.

Revision ID: 001_initial
Revises: None
Create Date: 2026-03-19
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- Users ---
    op.create_table(
        "users",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("email", sa.String(255), unique=True, index=True, nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("first_name", sa.String(100)),
        sa.Column("last_name", sa.String(100)),
        sa.Column("patronymic", sa.String(100)),
        sa.Column("bio", sa.Text),
        sa.Column("specialty", sa.String(120)),
        sa.Column("avatar_url", sa.String(500)),
        sa.Column("socials_json", sa.Text),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("is_active", sa.Boolean, default=True),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )

    # --- Organizations ---
    op.create_table(
        "organizations",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("join_code", sa.String(16), unique=True, index=True),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )

    # --- Org Memberships ---
    op.create_table(
        "org_memberships",
        sa.Column("org_id", sa.String(36), sa.ForeignKey("organizations.id"), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id"), primary_key=True),
        sa.Column("role", sa.Enum("admin", "manager", "member", name="orgrole"), default="member"),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )

    # --- Org Join Requests ---
    op.create_table(
        "org_join_requests",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("org_id", sa.String(36), sa.ForeignKey("organizations.id")),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id")),
        sa.Column("status", sa.Enum("pending", "approved", "rejected", name="joinstatus"), default="pending"),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )

    # --- Projects ---
    op.create_table(
        "projects",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("org_id", sa.String(36), sa.ForeignKey("organizations.id")),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )

    # --- Teams ---
    op.create_table(
        "teams",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("org_id", sa.String(36), sa.ForeignKey("organizations.id")),
        sa.Column("project_id", sa.String(36), sa.ForeignKey("projects.id"), nullable=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )

    # --- Team Memberships ---
    op.create_table(
        "team_memberships",
        sa.Column("team_id", sa.String(36), sa.ForeignKey("teams.id"), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id"), primary_key=True),
        sa.Column("role", sa.Enum("member", "lead", name="teamrole"), default="member"),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )

    # --- Tasks ---
    op.create_table(
        "tasks",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("org_id", sa.String(36), sa.ForeignKey("organizations.id")),
        sa.Column("team_id", sa.String(36), sa.ForeignKey("teams.id"), nullable=True),
        sa.Column("assignee_id", sa.String(36), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text),
        sa.Column("status", sa.Enum("todo", "in_progress", "done", name="taskstatus"), default="todo"),
        sa.Column("report", sa.Text),
        sa.Column("due_date", sa.Date),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )

    # --- Screen Sessions ---
    op.create_table(
        "screen_sessions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("org_id", sa.String(36), sa.ForeignKey("organizations.id")),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id")),
        sa.Column("status", sa.Enum("active", "stopped", name="sessionstatus"), default="active"),
        sa.Column("started_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("ended_at", sa.DateTime, nullable=True),
        sa.Column("device_name", sa.String(255)),
        sa.Column("os_name", sa.String(255)),
    )

    # --- Activity Events ---
    op.create_table(
        "activity_events",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("session_id", sa.String(36), sa.ForeignKey("screen_sessions.id")),
        sa.Column("org_id", sa.String(36), sa.ForeignKey("organizations.id")),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id")),
        sa.Column("event_type", sa.Enum("app", "input", "idle", "system", name="activitytype")),
        sa.Column("captured_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("app_name", sa.String(255)),
        sa.Column("window_title", sa.String(255)),
        sa.Column("idle_seconds", sa.Integer),
        sa.Column("notes", sa.Text),
    )

    # --- Audit Logs ---
    op.create_table(
        "audit_logs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("org_id", sa.String(36), sa.ForeignKey("organizations.id")),
        sa.Column("actor_id", sa.String(36), sa.ForeignKey("users.id")),
        sa.Column("action", sa.Enum("create", "update", "delete", "approve", "reject", "login", name="auditaction")),
        sa.Column("entity_type", sa.String(100)),
        sa.Column("entity_id", sa.String(36)),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("details", sa.Text),
    )

    # --- Screen Recordings ---
    op.create_table(
        "screen_recordings",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("session_id", sa.String(36), sa.ForeignKey("screen_sessions.id")),
        sa.Column("org_id", sa.String(36), sa.ForeignKey("organizations.id")),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id")),
        sa.Column("file_path", sa.String(500)),
        sa.Column("content_type", sa.String(100)),
        sa.Column("size_bytes", sa.Integer),
        sa.Column("checksum_sha256", sa.String(64)),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )

    # --- Consent Records ---
    op.create_table(
        "consent_records",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("org_id", sa.String(36), sa.ForeignKey("organizations.id")),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id")),
        sa.Column("policy_version", sa.String(50)),
        sa.Column("accepted_at", sa.DateTime, server_default=sa.func.now()),
        sa.UniqueConstraint("org_id", "user_id", name="uq_consent_org_user"),
    )

    # --- Daily Reports ---
    op.create_table(
        "daily_reports",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("org_id", sa.String(36), sa.ForeignKey("organizations.id")),
        sa.Column("project_id", sa.String(36), sa.ForeignKey("projects.id")),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id")),
        sa.Column("report_date", sa.Date),
        sa.Column("content", sa.Text),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
        sa.UniqueConstraint("org_id", "project_id", "user_id", "report_date", name="uq_daily_report"),
    )

    # --- Notification Hooks ---
    op.create_table(
        "notification_hooks",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("org_id", sa.String(36), sa.ForeignKey("organizations.id")),
        sa.Column("event_type", sa.Enum("report_export_ready", name="notificationevent")),
        sa.Column("url", sa.String(500)),
        sa.Column("enabled", sa.Boolean, default=True),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )

    # --- Privacy Rules ---
    op.create_table(
        "privacy_rules",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("org_id", sa.String(36), sa.ForeignKey("organizations.id")),
        sa.Column("target", sa.Enum("app_name", "window_title", name="privacytarget")),
        sa.Column("match_type", sa.Enum("equals", "contains", "regex", name="matchtype")),
        sa.Column("pattern", sa.Text),
        sa.Column("action", sa.Enum("redact", "ignore", name="privacyaction")),
        sa.Column("enabled", sa.Boolean, default=True),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )

    # --- AI Score Snapshots ---
    op.create_table(
        "ai_score_snapshots",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("org_id", sa.String(36), sa.ForeignKey("organizations.id")),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id")),
        sa.Column("period_type", sa.Enum("daily", "weekly", name="scoreperiod")),
        sa.Column("period_start", sa.Date),
        sa.Column("period_end", sa.Date),
        sa.Column("score", sa.Integer),
        sa.Column("completion_rate", sa.Float),
        sa.Column("active_ratio", sa.Float),
        sa.Column("tasks_total", sa.Integer),
        sa.Column("tasks_done", sa.Integer),
        sa.Column("observed_seconds", sa.Integer),
        sa.Column("idle_seconds", sa.Integer),
        sa.Column("active_seconds", sa.Integer),
        sa.Column("sessions_count", sa.Integer),
        sa.Column("reasons_json", sa.Text),
        sa.Column("drivers_json", sa.Text),
        sa.Column("generated_at", sa.DateTime, server_default=sa.func.now()),
        sa.UniqueConstraint("org_id", "user_id", "period_type", "period_start", "period_end", name="uq_ai_score_period"),
    )

    # --- Report Exports ---
    op.create_table(
        "report_exports",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("org_id", sa.String(36), sa.ForeignKey("organizations.id")),
        sa.Column("created_by", sa.String(36), sa.ForeignKey("users.id")),
        sa.Column("report_type", sa.String(50)),
        sa.Column("export_format", sa.String(10)),
        sa.Column("params_json", sa.Text),
        sa.Column("file_path", sa.String(500)),
        sa.Column("size_bytes", sa.Integer),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )

    # --- Report Schedules ---
    op.create_table(
        "report_schedules",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("org_id", sa.String(36), sa.ForeignKey("organizations.id")),
        sa.Column("created_by", sa.String(36), sa.ForeignKey("users.id")),
        sa.Column("report_type", sa.String(50)),
        sa.Column("params_json", sa.Text),
        sa.Column("interval_days", sa.Integer),
        sa.Column("enabled", sa.Boolean, default=True),
        sa.Column("last_run_at", sa.DateTime, nullable=True),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )

    # --- Refresh Tokens (new for production) ---
    op.create_table(
        "refresh_tokens",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("token_hash", sa.String(64), unique=True, index=True, nullable=False),
        sa.Column("expires_at", sa.DateTime, nullable=False),
        sa.Column("revoked", sa.Boolean, default=False),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )

    # --- Failed Login Attempts (rate limiting) ---
    op.create_table(
        "failed_login_attempts",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("email", sa.String(255), index=True, nullable=False),
        sa.Column("ip_address", sa.String(45), nullable=False),
        sa.Column("attempted_at", sa.DateTime, server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("failed_login_attempts")
    op.drop_table("refresh_tokens")
    op.drop_table("report_schedules")
    op.drop_table("report_exports")
    op.drop_table("ai_score_snapshots")
    op.drop_table("privacy_rules")
    op.drop_table("notification_hooks")
    op.drop_table("daily_reports")
    op.drop_table("consent_records")
    op.drop_table("screen_recordings")
    op.drop_table("audit_logs")
    op.drop_table("activity_events")
    op.drop_table("screen_sessions")
    op.drop_table("tasks")
    op.drop_table("team_memberships")
    op.drop_table("teams")
    op.drop_table("projects")
    op.drop_table("org_join_requests")
    op.drop_table("org_memberships")
    op.drop_table("organizations")
    op.drop_table("users")
