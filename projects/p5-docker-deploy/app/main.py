"""The tickets API: create, list, get, update."""
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Query, status
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from app.auth import require_api_key
from app.db import Ticket, get_db, init_db
from app.schemas import Status, TicketCreate, TicketOut, TicketUpdate


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()  # create tables on startup (a real project would use Alembic migrations)
    yield


app = FastAPI(title="Tickets API", version="1.0.0", lifespan=lifespan)


@app.get("/healthz")
def healthz() -> dict:
    """Liveness: the process is up and serving HTTP. Deliberately does NOT touch the DB,
    so a slow database never makes Kubernetes restart healthy pods."""
    return {"status": "ok"}


@app.get("/readyz")
def readyz(db: Session = Depends(get_db)) -> dict:
    """Readiness: can we actually serve traffic? Checks the database connection."""
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "database unavailable")
    return {"status": "ready"}


@app.post("/tickets", response_model=TicketOut, status_code=status.HTTP_201_CREATED,
          dependencies=[Depends(require_api_key)])
def create_ticket(body: TicketCreate, db: Session = Depends(get_db)) -> Ticket:
    ticket = Ticket(title=body.title, description=body.description, priority=body.priority.value)
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


@app.get("/tickets", response_model=list[TicketOut], dependencies=[Depends(require_api_key)])
def list_tickets(
    status_filter: Status | None = Query(default=None, alias="status"),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
) -> list[Ticket]:
    stmt = select(Ticket).order_by(Ticket.id).limit(limit).offset(offset)
    if status_filter is not None:
        stmt = stmt.where(Ticket.status == status_filter.value)
    return list(db.scalars(stmt))


def _get_or_404(db: Session, ticket_id: int) -> Ticket:
    ticket = db.get(Ticket, ticket_id)
    if ticket is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Ticket {ticket_id} not found")
    return ticket


@app.get("/tickets/{ticket_id}", response_model=TicketOut, dependencies=[Depends(require_api_key)])
def get_ticket(ticket_id: int, db: Session = Depends(get_db)) -> Ticket:
    return _get_or_404(db, ticket_id)


@app.patch("/tickets/{ticket_id}", response_model=TicketOut, dependencies=[Depends(require_api_key)])
def update_ticket(ticket_id: int, body: TicketUpdate, db: Session = Depends(get_db)) -> Ticket:
    ticket = _get_or_404(db, ticket_id)
    # exclude_unset: only touch fields the client actually sent.
    for field, value in body.model_dump(exclude_unset=True).items():
        if value is None:
            raise HTTPException(422, f"{field} cannot be null")
        setattr(ticket, field, getattr(value, "value", value))
    db.commit()
    db.refresh(ticket)
    return ticket
