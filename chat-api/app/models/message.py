"""
Message model for chat system
Represents a message in a conversation
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum

from app.database.session import Base


class MessageType(str, enum.Enum):
    """Message type enum"""
    TEXT = "text"
    SYSTEM = "system"


class Message(Base):
    """Message model"""
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_id = Column(Integer, nullable=False, index=True)
    
    # Content
    content = Column(Text, nullable=False)
    message_type = Column(
        Enum(MessageType),
        default=MessageType.TEXT,
        nullable=False
    )
    
    # Metadata
    is_edited = Column(Boolean, default=False, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    deleted_at = Column(DateTime, nullable=True)
    
    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    statuses = relationship("MessageStatus", back_populates="message", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Message(id={self.id}, conversation_id={self.conversation_id}, sender_id={self.sender_id})>"

# Made with Bob
