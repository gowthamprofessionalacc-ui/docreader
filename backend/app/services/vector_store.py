from sqlmodel import Session, select, text
from sqlalchemy import func

from app.models.database import DocumentChunk, engine


def add_chunks(
    doc_id: str,
    doc_name: str,
    chunks: list[dict],
    embeddings: list[list[float]],
) -> None:
    """Store document chunks with embeddings in PostgreSQL via pgvector."""
    total = len(chunks)
    with Session(engine) as session:
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            doc_chunk = DocumentChunk(
                id=f"doc_{doc_id}_chunk_{i}",
                document_id=doc_id,
                document_name=doc_name,
                chunk_index=i,
                total_chunks=total,
                char_start=chunk["char_start"],
                char_end=chunk["char_end"],
                chunk_text=chunk["text"],
                embedding=embedding,
            )
            session.add(doc_chunk)
        session.commit()


def search(
    query_embedding: list[float],
    top_k: int = 5,
    document_ids: list[str] | None = None,
) -> list[dict]:
    """Search for similar chunks using pgvector L2 distance."""
    with Session(engine) as session:
        # Build the L2 distance expression
        distance = DocumentChunk.embedding.l2_distance(query_embedding)

        query = (
            select(DocumentChunk, distance.label("distance"))
            .order_by(distance)
            .limit(top_k)
        )

        if document_ids:
            query = query.where(DocumentChunk.document_id.in_(document_ids))

        results = session.exec(query).all()

        output = []
        for row in results:
            chunk = row[0] if isinstance(row, tuple) else row.DocumentChunk
            dist = row[1] if isinstance(row, tuple) else row.distance
            score = 1 / (1 + dist)
            output.append({
                "chunk_text": chunk.chunk_text,
                "document_name": chunk.document_name,
                "document_id": chunk.document_id,
                "chunk_index": chunk.chunk_index,
                "similarity_score": round(score, 4),
            })
        return output


def delete_document(doc_id: str) -> None:
    """Remove all chunks for a document."""
    with Session(engine) as session:
        chunks = session.exec(
            select(DocumentChunk).where(DocumentChunk.document_id == doc_id)
        ).all()
        for chunk in chunks:
            session.delete(chunk)
        session.commit()


def get_collection_count() -> int:
    """Get total number of chunks stored."""
    with Session(engine) as session:
        result = session.exec(
            select(func.count()).select_from(DocumentChunk)
        ).one()
        return result


def get_chunks_for_document(doc_id: str, limit: int = 3) -> list[dict]:
    """Get the first N chunks for a document."""
    with Session(engine) as session:
        chunks = session.exec(
            select(DocumentChunk)
            .where(DocumentChunk.document_id == doc_id)
            .order_by(DocumentChunk.chunk_index)
            .limit(limit)
        ).all()
        return [
            {"chunk_text": c.chunk_text, "chunk_index": c.chunk_index}
            for c in chunks
        ]
