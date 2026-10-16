# IssueFlow — DevOps Learning Project

IssueFlow is a small full-stack issue tracker built to practise the developer side of a production-oriented DevOps project. It is intentionally a single frontend, a single API, and one database so you can understand the application before containerizing or deploying it.

## Features

- Dashboard with total, open, in-progress, and resolved issue counts
- Create, list, update status, search, and delete issues
- Priority, status, assignee, and creation date
- React frontend with responsive layout
- Express REST API with request validation, parameterized SQL, security headers, CORS, JSON body limits, and centralized error handling
- PostgreSQL persistence with schema constraints and indexes
- Basic Node.js validation tests

## Technology stack

- Frontend: React 18, Vite, Lucide
- Backend: Node.js 20+, Express 4
- Database: PostgreSQL 14+
- API: REST over HTTP/JSON

## Project structure

```text
devops-issue-tracker/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── db.js
│   │   ├── server.js
│   │   └── routes/
│   │       └── issues.js
│   ├── test/
│   │   └── validation.test.js
│   ├── .env.example
│   └── package.json
├── database/
│   └── schema.sql
└── README.md
```

## Prerequisites

Install the following on your machine:

- Node.js 20 or newer and npm
- PostgreSQL 14 or newer
- Git (optional)

Check versions:

```bash
node --version
npm --version
psql --version
```

## Run locally

### 1. Create the database and user

Open a PostgreSQL shell as an administrator, for example:

```bash
sudo -u postgres psql
```

Then run these SQL statements. Replace the sample password with your own local development password:

```sql
CREATE USER issueflow WITH PASSWORD 'change_this_password';
CREATE DATABASE issueflow OWNER issueflow;
\q
```

On Windows, open SQL Shell (psql) or pgAdmin and run the same SQL statements using an administrator account. If the user or database already exists, don't run the corresponding `CREATE` statement again.

### 2. Initialize the database schema

From the project root, run:

```bash
psql "postgresql://issueflow:change_this_password@localhost:5432/issueflow" -f database/schema.sql
```

If `psql` isn't on your PATH, run `schema.sql` from pgAdmin's Query Tool instead.

### 3. Configure the backend

```bash
cd backend
```

Copy `.env.example` to `.env`.

Linux/macOS:
```bash
cp .env.example .env
```

Windows PowerShell:
```powershell
Copy-Item .env.example .env
```

Edit `.env` and set `DATABASE_URL` to the same username, password, host, port, and database you configured. Keep `DB_SSL=false` for a local PostgreSQL server. Do not commit `.env` or real secrets to Git.

Install dependencies and start the API:

```bash
npm install
npm run dev
```

The API expects PostgreSQL to be running before it starts. You should see a message that it is listening on port 5000.

Verify the health endpoint in another terminal:

```bash
curl http://localhost:5000/health
```

Expected response:

```json
{"status":"ok","service":"issueflow-api"}
```

Verify the issue endpoint:

```bash
curl http://localhost:5000/api/issues
```

### 4. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually:

**http://localhost:5173**

The frontend calls `http://localhost:5000/api` by default. To use a different API address, create `frontend/.env` with:

```dotenv
VITE_API_URL=http://localhost:5000/api
```

Restart Vite after changing frontend environment variables.

## API reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/issues` | List issues |
| POST | `/issues` | Create an issue |
| PATCH | `/issues/:id` | Update one or more issue fields |
| DELETE | `/issues/:id` | Delete an issue |
| GET | `/health` | API health check (outside `/api`) |

Example create request:

```bash
curl -X POST http://localhost:5000/api/issues \
  -H "Content-Type: application/json" \
  -d '{"title":"Test deployment","description":"Verify the app locally","priority":"high","status":"open","assignee":"Uday"}'
```

Valid statuses: `open`, `in-progress`, `resolved`.

Valid priorities: `low`, `medium`, `high`.

## Run the tests

From the backend directory:

```bash
npm test
```

These are lightweight unit tests for input validation. They don't require a database connection.

## Troubleshooting

- **API fails to start:** Confirm PostgreSQL is running and `DATABASE_URL` in `backend/.env` is correct.
- **`password authentication failed`:** Check the database username/password and update both the PostgreSQL user and connection URL as needed.
- **`database "issueflow" does not exist`:** Create the database using the steps above.
- **Frontend shows API disconnected:** Start the backend and check `http://localhost:5000/health`.
- **Browser CORS error:** Ensure `FRONTEND_ORIGIN=http://localhost:5173` matches the URL shown by Vite.
- **`psql` not recognized:** Use PostgreSQL's SQL Shell or pgAdmin, or add the PostgreSQL `bin` directory to PATH.
- **Port is already in use:** Change `PORT` in backend `.env` or stop the process using the port, then update the frontend API URL if needed.

## Production-readiness learning notes

This is a learning baseline, not a complete production system. Before a real production deployment, add authentication and authorization, structured logging and request IDs, API rate limiting, automated integration tests, database migrations, backup/restore testing, TLS termination, secret management, dependency/image scanning, and observability. Review the PostgreSQL TLS settings carefully when using a managed database. The frontend's `VITE_API_URL` is public build-time configuration, never a place for secrets.

## Suggested DevOps progression

1. Understand the app and run it locally.
2. Add Dockerfiles and Docker Compose.
3. Build Kubernetes Deployments, Services, ConfigMaps, Secrets, probes, and storage.
4. Add CI with tests and image builds.
5. Push images to a container registry.
6. Provision cloud infrastructure with Terraform.
7. Deploy to managed Kubernetes.
8. Add Helm, GitOps, monitoring, logging, and security checks.
