# DevOps Issue Tracker

A learning project for the DevOps lifecycle, built with React, FastAPI, and PostgreSQL.

## Features
- Create, list, filter, update, and delete issues
- Priority and status fields with API validation
- Health and database-readiness endpoints
- React frontend and REST API backend

## Requirements
- Node.js 20+
- Python 3.11+
- PostgreSQL

## Configure PostgreSQL
Create a database and user matching the URL below, or set `DATABASE_URL` to your own PostgreSQL connection string.

Example URL:
`postgresql+psycopg://issues:issues@localhost:5432/issue_tracker`

The `database/init.sql` file documents the intended schema. For the initial local learning version, SQLAlchemy creates the table automatically when the backend starts.

## Run backend
From `backend/`:

```bash
python -m venv .venv
# Windows PowerShell: .venv\\Scripts\\Activate.ps1
# Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend docs: http://localhost:8000/docs

## Run frontend
From `frontend/`:

```bash
npm install
npm run dev
```

Open the URL printed by Vite, usually http://localhost:5173.

The frontend defaults to `http://localhost:8000` for the API. Set `VITE_API_URL` before starting Vite if needed.

## Test API

```bash
curl http://localhost:8000/health
curl http://localhost:8000/ready
curl http://localhost:8000/api/issues
```

Create an issue:

```bash
curl -X POST http://localhost:8000/api/issues \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Login API error","description":"Investigate a 500 response","priority":"high"}'
```

## Learning roadmap
1. Understand and run developer code.
2. Containerize the frontend, backend, and database.
3. Deploy to Kubernetes.
4. Add CI/CD using GitHub Actions.
5. Provision cloud infrastructure with Terraform.
6. Add security scanning, monitoring, Helm, and GitOps.

## Production-readiness note
This is a learning starter, not a production-hardened system. Before public deployment, add Alembic migrations, authentication and authorization, explicit CORS configuration, automated tests, structured logging, secure secrets handling, dependency updates, and database backup/restore procedures.
