import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship, backref
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    credentials = Column(Text, nullable=True) # Custom Gemini API key or user credentials
    details = Column(Text, nullable=True) # JSON details / user analytics metadata
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_active = Column(DateTime, default=datetime.datetime.utcnow)

    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), default=1, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="pending", nullable=False, index=True) # pending, completed
    priority = Column(String(50), default="medium", nullable=False, index=True) # low, medium, high
    category = Column(String(100), default="general", nullable=False, index=True)
    due_date = Column(String(50), nullable=True, index=True) # YYYY-MM-DD
    due_time = Column(String(50), nullable=True) # HH:MM
    reminder_time = Column(String(50), nullable=True)
    reminder_sent = Column(Boolean, default=False)
    solution_output = Column(Text, nullable=True)
    parent_task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="tasks")
    subtasks = relationship("Task", backref=backref("parent", remote_side=[id]), cascade="all, delete-orphan")

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), default=1, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    role = Column(String(50), nullable=False) # user, assistant, system, tool
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")
