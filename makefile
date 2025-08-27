# Makefile (à mettre à la racine du repo)
SHELL := /bin/bash

# ---- Config ----
BACK_HOST := 127.0.0.1
BACK_PORT := 8000
FRONT_PORT := 5173

PY := .venv/bin/python3
PIP := .venv/bin/pip
UVICORN := .venv/bin/uvicorn

# ---- Tâches courantes ----
.PHONY: start backend frontend install venv node_modules stop health

## Lance backend + frontend en parallèle
start: install
	@echo "🚀 Starting backend + frontend…"
	@$(MAKE) -j2 backend frontend

## Backend FastAPI (reload)
backend:
	@echo "▶ Backend → http://$(BACK_HOST):$(BACK_PORT)"
	@$(UVICORN) backend.app.main:app --host $(BACK_HOST) --port $(BACK_PORT) --reload

## Frontend Vite (port configurable)
frontend:
	@echo "▶ Frontend → http://localhost:$(FRONT_PORT)"
	@npm run dev -- --port $(FRONT_PORT)

## Installe deps (Python + Node) si besoin
install: venv node_modules

## Crée le venv et installe les requirements
venv:
	@if [ ! -x "$(PY)" ]; then \
		echo "🐍 Creating venv…"; \
		python3 -m venv .venv; \
	fi
	@$(PIP) install -U pip
	@if [ -f backend/requirements.txt ]; then \
		echo "📦 Installing Python requirements…"; \
		$(PIP) install -r backend/requirements.txt; \
	else \
		echo "⚠️ backend/requirements.txt introuvable → install minimal"; \
		$(PIP) install fastapi "uvicorn[standard]" pandas python-dotenv scikit-learn; \
	fi

## Installe les deps Node (si node_modules absent)
node_modules:
	@if [ ! -d node_modules ]; then \
		echo "📦 Installing npm dependencies…"; \
		npm install; \
	else \
		echo "✅ npm deps OK"; \
	fi

## Tente d'arrêter proprement uvicorn & vite
stop:
	@echo "🛑 Stopping processes…"
	@pkill -f "uvicorn .*backend\.app\.main" || true
	@pkill -f "[v]ite" || true
	@echo "Done."

## Ping de santé du backend
health:
	@curl -s http://$(BACK_HOST):$(BACK_PORT)/health || true
