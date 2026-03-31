import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select
from sse_starlette.sse import EventSourceResponse

from app.models.database import ChatSession, ChatMessage, get_session, engine
from app.services.rag_chain import rag_stream

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None
    document_ids: list[str] | None = None


@router.post("/api/chat")
def chat(request: ChatRequest, session: Session = Depends(get_session)):
    if not request.message.strip():
        raise HTTPException(400, "Message must not be empty")

    # Get or create session
    chat_session = None
    if request.session_id:
        chat_session = session.get(ChatSession, request.session_id)

    if not chat_session:
        title = request.message[:50].strip()
        chat_session = ChatSession(title=title)
        session.add(chat_session)
        session.commit()
        session.refresh(chat_session)

    # Save user message
    user_msg = ChatMessage(
        session_id=chat_session.id,
        role="user",
        content=request.message,
    )
    session.add(user_msg)
    session.commit()

    # Load chat history for this session
    history_records = session.exec(
        select(ChatMessage)
        .where(ChatMessage.session_id == chat_session.id)
        .order_by(ChatMessage.created_at)
    ).all()
    chat_history = [{"role": m.role, "content": m.content} for m in history_records[:-1]]

    session_id = chat_session.id

    def event_generator():
        full_answer = []
        sources_data = None

        for event in rag_stream(
            message=request.message,
            chat_history=chat_history,
            document_ids=request.document_ids,
        ):
            if event["type"] == "token":
                full_answer.append(event["content"])
                yield {"data": json.dumps(event)}
            elif event["type"] == "sources":
                sources_data = event["sources"]
                yield {"data": json.dumps(event)}
            elif event["type"] == "done":
                # Save assistant message
                with Session(engine) as db:
                    assistant_msg = ChatMessage(
                        session_id=session_id,
                        role="assistant",
                        content="".join(full_answer),
                        sources=json.dumps(sources_data) if sources_data else None,
                    )
                    db.add(assistant_msg)
                    # Update session timestamp
                    cs = db.get(ChatSession, session_id)
                    if cs:
                        cs.updated_at = datetime.utcnow()
                        db.add(cs)
                    db.commit()

                yield {"data": json.dumps({"type": "done", "session_id": session_id})}

    return EventSourceResponse(event_generator())


@router.get("/api/chat/sessions")
def list_sessions(session: Session = Depends(get_session)):
    sessions = session.exec(
        select(ChatSession).order_by(ChatSession.updated_at.desc())
    ).all()
    return sessions


@router.get("/api/chat/sessions/{session_id}")
def get_session_messages(session_id: str, session: Session = Depends(get_session)):
    chat_session = session.get(ChatSession, session_id)
    if not chat_session:
        raise HTTPException(404, "Session not found")

    messages = session.exec(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
    ).all()

    # Parse sources JSON for assistant messages
    result = []
    for m in messages:
        msg_dict = m.model_dump()
        if m.sources:
            try:
                msg_dict["sources"] = json.loads(m.sources)
            except json.JSONDecodeError:
                msg_dict["sources"] = None
        result.append(msg_dict)

    return {"session": chat_session, "messages": result}


@router.delete("/api/chat/sessions/{session_id}")
def delete_session(session_id: str, session: Session = Depends(get_session)):
    chat_session = session.get(ChatSession, session_id)
    if not chat_session:
        raise HTTPException(404, "Session not found")

    # Delete all messages
    messages = session.exec(
        select(ChatMessage).where(ChatMessage.session_id == session_id)
    ).all()
    for m in messages:
        session.delete(m)

    session.delete(chat_session)
    session.commit()

    return {"status": "deleted", "id": session_id}
