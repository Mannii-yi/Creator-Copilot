from sqlalchemy import create_engine, Column, String, Float, Integer, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
import uuid

# SQLite database - creates a local file "creator_copilot.db"
DATABASE_URL = "sqlite:///./creator_copilot.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Deal(Base):
    __tablename__ = "deals"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    brand_name = Column(String, nullable=False)
    deliverable = Column(String, nullable=True)
    deal_amount = Column(Float, nullable=True)
    stage = Column(String, default="negotiating")  # negotiating, contracted, invoiced, paid
    offer_text = Column(String, nullable=True)
    market_value_estimate = Column(Float, nullable=True)
    suggested_counter = Column(Float, nullable=True)
    risk_flags = Column(String, nullable=True)  # stored as JSON string
    created_at = Column(DateTime, default=datetime.utcnow)


# Creates the database file and tables if they don't exist
def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()