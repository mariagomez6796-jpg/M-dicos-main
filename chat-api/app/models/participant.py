"""
Participant model for chat system
Represents a user participating in a conversation
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum

from app.database.session import Base


class ParticipantRole(str, enum.Enum):
    """Participant role enum"""
    DOCTOR = "doctor"
    PATIENT = "patient"


class Participant(Base):
    """Participant model"""
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    
    # Role
    role = Column(
        Enum(ParticipantRole),
        nullable=False,
        index=True
    )
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    last_read_at = Column(DateTime, nullable=True)
    
    # Timestamps
    joined_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    left_at = Column(DateTime, nullable=True)
    
    # Relationships
    conversation = relationship("Conversation", back_populates="participants")
    message_statuses = relationship("MessageStatus", back_populates="participant", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Participant(id={self.id}, user_id={self.user_id}, role={self.role})>"

# Made with Bob
