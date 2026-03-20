"""SMTP email service with Jinja2 HTML templates."""

import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

from jinja2 import Environment, FileSystemLoader

from app.core.config import settings

logger = logging.getLogger(__name__)

_templates_dir = Path(__file__).parent.parent / "templates" / "email"
_jinja_env = Environment(loader=FileSystemLoader(str(_templates_dir)), autoescape=True)


def _send_raw(to: str, subject: str, html_body: str) -> bool:
    """Send an email via SMTP. Returns True on success."""
    if not settings.SMTP_HOST:
        logger.warning("SMTP not configured — email to %s skipped", to)
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["From"] = settings.SMTP_FROM
        msg["To"] = to
        msg["Subject"] = subject
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            if settings.SMTP_USE_TLS:
                server.starttls()
            if settings.SMTP_USER:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM, to, msg.as_string())

        logger.info("email_sent", extra={"to": to, "subject": subject})
        return True
    except Exception:
        logger.error("email_send_failed", extra={"to": to}, exc_info=True)
        return False


def send_verification_email(to: str, token: str, base_url: str = "") -> bool:
    """Send email verification link."""
    template = _jinja_env.get_template("verification.html")
    verify_url = f"{base_url}/auth/verify-email?token={token}"
    html = template.render(verify_url=verify_url)
    return _send_raw(to, "Подтвердите ваш email — ProjectsControl", html)


def send_password_reset_email(to: str, token: str, base_url: str = "") -> bool:
    """Send password reset link."""
    template = _jinja_env.get_template("password_reset.html")
    reset_url = f"{base_url}/auth/reset-password?token={token}"
    html = template.render(reset_url=reset_url)
    return _send_raw(to, "Сброс пароля — ProjectsControl", html)


def send_welcome_email(to: str, full_name: str) -> bool:
    """Send welcome email after registration."""
    template = _jinja_env.get_template("welcome.html")
    html = template.render(full_name=full_name)
    return _send_raw(to, "Добро пожаловать в ProjectsControl!", html)
