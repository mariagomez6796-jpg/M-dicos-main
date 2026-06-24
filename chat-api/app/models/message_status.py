"""
MessageStatus model for chat system
Tracks read/delivery status of messages for each participant
"""
from datetime import datetime
from sqlalchemy import Column, Integer, DateTime, ForeignKey, Enum, UniqueConstraint
from sqlalchemy.orm import relationship
import enum

from app.database.session import Base


class DeliveryStatus(str, enum.Enum):
    """Message delivery status enum"""
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"


class MessageStatus(Base):
    """MessageStatus model"""
    __tablename__ = "message_status"
    __table_args__ = (
        UniqueConstraint('message_id', 'participant_id', name='uq_message_participant'),
    )

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id", ondelete="CASCADE"), nullable=False, index=True)
    participant_id = Column(Integer, ForeignKey("participants.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Status
    status = Column(
        Enum(DeliveryStatus),
        default=DeliveryStatus.SENT,
        nullable=False,
        index=True
    )
    
    # Timestamps
    delivered_at = Column(DateTime, nullable=True)
    read_at = Column(DateTime, nullable=True)
    
    # Relationships
    message = relationship("Message", back_populates="statuses")
    participant = relationship("Participant", back_populates="message_statuses")

    def __repr__(self):
        return f"<MessageStatus(id={self.id}, message_id={self.message_id}, status={self.status})>"

# Made with Bob
