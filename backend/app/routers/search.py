from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.embedding_service import embed_texts
from app.services import vector_store

router = APIRouter()


class SearchRequest(BaseModel):
    query: str
    top_k: int = 5
    document_ids: list[str] | None = None


@router.post("/api/search")
def search_documents(request: SearchRequest):
    if not request.query.strip():
        raise HTTPException(400, "Query must be a non-empty string")
    if not 1 <= request.top_k <= 20:
        raise HTTPException(400, "top_k must be between 1 and 20")

    # Check if there are any documents
    if vector_store.get_collection_count() == 0:
        return {"query": request.query, "results": []}

    # Embed the query
    query_embedding = embed_texts([request.query])[0]

    # Search
    results = vector_store.search(
        query_embedding=query_embedding,
        top_k=request.top_k,
        document_ids=request.document_ids,
    )

    return {"query": request.query, "results": results}
