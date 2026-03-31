# DocMind

Upload documents. Ask questions. Get cited answers.

A full-stack RAG (Retrieval-Augmented Generation) application that lets you upload documents, search them semantically, and chat with an AI that answers based on your document content with source citations.

## Tech Stack

- **Frontend:** Next.js 14 (App Router, TypeScript, Tailwind CSS)
- **Backend:** Python FastAPI
- **Orchestration:** LangChain + OpenAI (via OpenRouter)
- **Vector DB:** ChromaDB (local, persistent)
- **Database:** SQLite (via SQLModel)

## Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- An OpenRouter API key (or OpenAI API key)

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
```

Create `backend/.env`:

```env
OPENAI_API_KEY=sk-or-v1-your-key-here
OPENAI_BASE_URL=https://openrouter.ai/api/v1
CHROMA_PERSIST_DIR=./chroma_db
UPLOAD_DIR=./uploads
DATABASE_URL=sqlite:///./docmind.db
```

### 2. Frontend

```bash
cd frontend
npm install
```

## Running

Start both servers in separate terminals:

```bash
# Terminal 1 - Backend (port 8000)
cd backend && uvicorn app.main:app --reload --port 8000

# Terminal 2 - Frontend (port 3000)
cd frontend && npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

1. **Upload** documents (PDF, DOCX, TXT, CSV, MD) at `/upload`
2. **Chat** with your documents at `/chat` - get AI answers with source citations
3. **Search** documents semantically at `/search`
4. **Manage** your knowledge base at `/documents`

## Supported File Types

| Type | Max Size |
|------|----------|
| PDF  | 20 MB    |
| DOCX | 20 MB    |
| TXT  | 20 MB    |
| CSV  | 20 MB    |
| MD   | 20 MB    |
