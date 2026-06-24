"""
Conversation model for chat system
Represents a conversation between doctor and patient
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum

from app.database.session import Base


class ConversationStatus(str, enum.Enum):
    """Conversation status enum"""
    ACTIVE = "active"
    ARCHIVED = "archived"
    EXPIRED = "expired"


class Conversation(Base):
    """Conversation model"""
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, nullable=False, unique=True, index=True)
    
    # Participants
    doctor_id = Column(Integer, nullable=False, index=True)
    patient_id = Column(Integer, nullable=False, index=True)
    
    # Status
    status = Column(
        Enum(ConversationStatus),
        default=ConversationStatus.ACTIVE,
        nullable=False,
        index=True
    )
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=False, index=True)
    archived_at = Column(DateTime, nullable=True)
    
    # Relationships
    participants = relationship("Participant", back_populates="conversation", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Conversation(id={self.id}, appointment_id={self.appointment_id}, status={self.status})>"

# Made with Bob
