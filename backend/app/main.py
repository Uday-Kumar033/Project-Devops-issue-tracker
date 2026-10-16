from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Query, Response
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app.models import Issue
from app.schemas import IssueCreate, IssueResponse, IssueUpdate


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Local learning convenience only. Use Alembic migrations in production.
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="DevOps Issue Tracker API", version="1.0.0", lifespan=lifespan)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/ready")
def readiness(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "ready", "database": "connected"}


@app.post("/api/issues", response_model=IssueResponse, status_code=201)
def create_issue(payload: IssueCreate, db: Session = Depends(get_db)):
    issue = Issue(**payload.model_dump())
    db.add(issue)
    db.commit()
    db.refresh(issue)
    return issue


@app.get("/api/issues", response_model=list[IssueResponse])
def list_issues(
    status: str | None = None,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    stmt = select(Issue)
    if status is not None:
        allowed = {"open", "in_progress", "resolved", "closed"}
        if status not in allowed:
            raise HTTPException(status_code=400, detail="Invalid status")
        stmt = stmt.where(Issue.status == status)
    stmt = stmt.order_by(Issue.created_at.desc())
    return db.scalars(stmt.offset(offset).limit(limit)).all()


@app.get("/api/issues/{issue_id}", response_model=IssueResponse)
def get_issue(issue_id: int, db: Session = Depends(get_db)):
    issue = db.get(Issue, issue_id)
    if issue is None:
        raise HTTPException(status_code=404, detail="Issue not found")
    return issue


@app.patch("/api/issues/{issue_id}", response_model=IssueResponse)
def update_issue(
    issue_id: int,
    payload: IssueUpdate,
    db: Session = Depends(get_db),
):
    issue = db.get(Issue, issue_id)
    if issue is None:
        raise HTTPException(status_code=404, detail="Issue not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(issue, field, value)
    db.commit()
    db.refresh(issue)
    return issue


@app.delete("/api/issues/{issue_id}", status_code=204)
def delete_issue(issue_id: int, db: Session = Depends(get_db)):
    issue = db.get(Issue, issue_id)
    if issue is None:
        raise HTTPException(status_code=404, detail="Issue not found")
    db.delete(issue)
    db.commit()
    return Response(status_code=204)