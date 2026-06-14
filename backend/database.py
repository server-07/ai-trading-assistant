import os
from sqlalchemy import create_engine, Column, String, Text, DateTime, Float, Integer, JSON, Date, Boolean, text
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.dialects.postgresql import UUID, JSONB
from pgvector.sqlalchemy import Vector
from datetime import datetime, timezone
import uuid

from dotenv import load_dotenv

# Load environment variables
load_dotenv()
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@localhost:5433/ai_trading")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class NewsArticle(Base):
    __tablename__ = "news_articles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source = Column(String(100))
    title = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    published_at = Column(DateTime(timezone=True), nullable=False)
    entities = Column(JSONB)
    sentiment_score = Column(Float)
    embedding = Column(Vector(768)) # Gemini text-embedding-004 outputs 768 dims
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(UUID(as_uuid=True), primary_key=True)
    email = Column(String)
    role = Column(String(50))
    is_approved = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class PreMarketPrediction(Base):
    __tablename__ = "pre_market_predictions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trading_date = Column(Date, nullable=False)
    ticker = Column(String(20), nullable=False)
    exchange = Column(String(10), nullable=False)
    catalyst_core = Column(Text, nullable=False)
    directional_conviction = Column(String(10))
    expected_margin_low = Column(Float)
    expected_margin_high = Column(Float)
    stop_loss_atr = Column(Float)
    invalidation_level = Column(Float)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class LiveTick(Base):
    __tablename__ = "live_ticks"

    time = Column(DateTime(timezone=True), primary_key=True, nullable=False)
    ticker = Column(String(20), primary_key=True, nullable=False)
    last_traded_price = Column(Float, nullable=False)
    volume = Column(Integer, nullable=False)

def init_db():
    # Attempt to create vector extension if not exists (separate transaction)
    with engine.connect() as conn:
        try:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
            conn.commit()
            print("pgvector extension checked/enabled.")
        except Exception as e:
            print(f"pgvector extension warning: {e}")
            
    # Attempt to create timescaledb extension (separate transaction)
    with engine.connect() as conn:
        try:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;"))
            conn.commit()
        except Exception as e:
            print(f"TimescaleDB extension warning: {e}")
        
    Base.metadata.create_all(bind=engine)
    
    # Set up TimescaleDB Hypertable
    with engine.connect() as conn:
        try:
            conn.execute(text("SELECT create_hypertable('live_ticks', 'time', if_not_exists => TRUE);"))
            conn.commit()
        except Exception as e:
            print(f"Hypertable creation info: {e}")

# Dependency injection for FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
