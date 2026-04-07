import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, Integer, DateTime, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from database import Base


class Card(Base):
    __tablename__ = "cards"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    raw_text: Mapped[str] = mapped_column(Text, nullable=False)
    time_field: Mapped[str | None] = mapped_column(String(50))
    location: Mapped[str | None] = mapped_column(String(200))
    summary: Mapped[str | None] = mapped_column(Text)
    zone: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
        default="left",
    )
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    collaboration_status: Mapped[str | None] = mapped_column(Text)
    urgency: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
        default="normal",
    )
    created_by: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    __table_args__ = (
        CheckConstraint("zone IN ('left', 'right')", name="ck_cards_zone"),
        CheckConstraint("urgency IN ('normal', 'urgent')", name="ck_cards_urgency"),
    )
