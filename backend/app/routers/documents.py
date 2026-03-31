import os
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlmodel import Session, select

from app.config import settings
from app.models.database import Document, get_session
from app.services.document_processor import extract_text
from app.services.chunking_service import chunk_text
from app.services.embedding_service import embed_texts
from app.services import vector_store

router = APIRouter()

ALLOWED_TYPES = {"pdf", "docx", "txt", "csv", "md"}
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB


@router.post("/api/documents/upload")
def upload_document(
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
):
    # Validate file type
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_TYPES:
        raise HTTPException(400, f"Unsupported file type: .{ext}. Allowed: {ALLOWED_TYPES}")

    # Read file content
    content = file.file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(400, f"File too large. Maximum size: 20MB")

    # Save to disk
    file_id = str(uuid4())
    safe_name = f"{file_id}_{file.filename}"
    file_path = os.path.join(settings.upload_dir, safe_name)
    with open(file_path, "wb") as f:
        f.write(content)

    # Create DB record
    doc = Document(
        id=file_id,
        filename=file.filename,
        file_type=ext,
        file_size_bytes=len(content),
        file_path=file_path,
        status="processing",
    )
    session.add(doc)
    session.commit()
    session.refresh(doc)

    # Process: extract → chunk → embed → store
    try:
        text = extract_text(file_path, ext)
        chunks = chunk_text(text)
        chunk_texts = [c["text"] for c in chunks]
        embeddings = embed_texts(chunk_texts)
        vector_store.add_chunks(file_id, file.filename, chunks, embeddings)

        # Approximate token count (~4 chars per token)
        total_tokens = sum(len(c["text"]) for c in chunks) // 4

        doc.total_chunks = len(chunks)
        doc.total_tokens = total_tokens
        doc.status = "ready"
    except Exception as e:
        doc.status = "error"
        doc.error_message = str(e)

    session.add(doc)
    session.commit()
    session.refresh(doc)
    return doc


@router.get("/api/documents")
def list_documents(session: Session = Depends(get_session)):
    docs = session.exec(
        select(Document).order_by(Document.created_at.desc())
    ).all()
    return docs


@router.get("/api/documents/{doc_id}")
def get_document(doc_id: str, session: Session = Depends(get_session)):
    doc = session.get(Document, doc_id)
    if not doc:
        raise HTTPException(404, "Document not found")
    chunks_preview = vector_store.get_chunks_for_document(doc_id, limit=3)
    return {**doc.model_dump(), "chunks_preview": chunks_preview}


@router.delete("/api/documents/{doc_id}")
def delete_document(doc_id: str, session: Session = Depends(get_session)):
    doc = session.get(Document, doc_id)
    if not doc:
        raise HTTPException(404, "Document not found")

    # Delete file from disk
    if os.path.exists(doc.file_path):
        os.remove(doc.file_path)

    # Delete chunks from ChromaDB
    vector_store.delete_document(doc_id)

    # Delete DB record
    session.delete(doc)
    session.commit()

    return {"status": "deleted", "id": doc_id}
