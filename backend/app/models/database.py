from datetime import datetime
from uuid import uuid4

from sqlalchemy import Column, Text, Integer, String, DateTime, Float
from sqlmodel import Field, SQLModel, Session, create_engine

from app.config import settings

# pgvector support
from pgvector.sqlalchemy import Vector


class Document(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    filename: str
    file_type: str
    file_size_bytes: int
    file_path: str
    total_chunks: int = 0
    total_tokens: int = 0
    status: str = "processing"
    error_message: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ChatSession(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    title: str = "New Chat"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ChatMessage(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    session_id: str = Field(foreign_key="chatsession.id")
    role: str
    content: str
    sources: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class DocumentChunk(SQLModel, table=True):
    id: str = Field(primary_key=True)  # "doc_{doc_id}_chunk_{i}"
    document_id: str = Field(index=True)
    document_name: str
    chunk_index: int
    total_chunks: int
    char_start: int
    char_end: int
    chunk_text: str = Field(sa_column=Column(Text))
    embedding: list[float] | None = Field(
        default=None,
        sa_column=Column(Vector(1536)),
    )


engine = create_engine(settings.database_url, echo=False, pool_pre_ping=True)


def create_db_and_tables():
    # Create pgvector extension first
    from sqlalchemy import text
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        conn.commit()
    # Then create tables
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
