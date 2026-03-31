import json
from collections.abc import Generator

from openai import OpenAI

from app.config import settings
from app.services.embedding_service import embed_texts
from app.services import vector_store

client = OpenAI(api_key=settings.openai_api_key, base_url=settings.openai_base_url)

SYSTEM_PROMPT = """You are DocMind, an AI assistant that answers questions using the provided document context.

Rules:
1. Base your answers on the provided context. Synthesize and explain information from the context even if it doesn't contain an exact phrase match — use the available content to construct a helpful answer.
2. Only say "I couldn't find information about that in your documents" if the context is genuinely unrelated to the question.
3. Never fabricate facts, numbers, or claims not supported by the context.
4. When referencing information, cite the source document name.
5. Be concise but thorough.
6. If the question is ambiguous, ask for clarification.
7. Format your responses with markdown for readability."""

LLM_MODEL = "openai/gpt-4o-mini"


def build_context(sources: list[dict]) -> str:
    """Format retrieved chunks into context for the LLM."""
    parts = []
    for i, s in enumerate(sources, 1):
        parts.append(f"[Source {i}: {s['document_name']}]\n{s['chunk_text']}")
    return "\n\n---\n\n".join(parts)


def rag_stream(
    message: str,
    chat_history: list[dict],
    document_ids: list[str] | None = None,
) -> Generator[dict, None, None]:
    """Stream RAG response with sources.

    Yields dicts with type: "token", "sources", or "done".
    """
    # 1. Retrieve relevant chunks
    query_embedding = embed_texts([message])[0]
    sources = vector_store.search(
        query_embedding=query_embedding,
        top_k=5,
        document_ids=document_ids,
    )

    # 2. Build context
    context = build_context(sources)

    # 3. Build messages
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    # Add chat history (last 6 exchanges)
    for msg in chat_history[-12:]:
        messages.append({"role": msg["role"], "content": msg["content"]})

    # Add current message with context
    user_message = f"""Based on the following document context, answer the user's question.

Document Context:
{context}

User Question: {message}"""

    messages.append({"role": "user", "content": user_message})

    # 4. Stream LLM response
    stream = client.chat.completions.create(
        model=LLM_MODEL,
        messages=messages,
        temperature=0.1,
        stream=True,
    )

    for chunk in stream:
        if chunk.choices and chunk.choices[0].delta.content:
            yield {"type": "token", "content": chunk.choices[0].delta.content}

    # 5. Yield sources
    yield {"type": "sources", "sources": sources}

    # 6. Done
    yield {"type": "done"}
