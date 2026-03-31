.PHONY: backend frontend dev install-backend install-frontend test

install-backend:
	cd backend && pip install -r requirements.txt

install-frontend:
	cd frontend && npm install

backend:
	cd backend && uvicorn app.main:app --reload --port 8000

frontend:
	cd frontend && npm run dev

dev:
	@echo "Run these in separate terminals:"
	@echo "  make backend"
	@echo "  make frontend"

test:
	cd backend && python -m pytest tests/ -v
