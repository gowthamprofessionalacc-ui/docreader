from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func

from app.models.database import Document, get_session

router = APIRouter()


@router.get("/api/stats")
def get_stats(session: Session = Depends(get_session)):
    docs = session.exec(select(Document).where(Document.status == "ready")).all()

    total_documents = len(docs)
    total_chunks = sum(d.total_chunks for d in docs)
    total_tokens = sum(d.total_tokens for d in docs)
    avg_chunks = total_chunks / total_documents if total_documents > 0 else 0

    last_upload = None
    if docs:
        last_upload = max(d.created_at for d in docs).isoformat() + "Z"

    return {
        "total_documents": total_documents,
        "total_chunks": total_chunks,
        "total_tokens_approx": total_tokens,
        "avg_chunks_per_document": round(avg_chunks, 1),
        "last_upload": last_upload,
    }
