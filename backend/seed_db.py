import os
import uuid
from datetime import datetime, timezone
from database import SessionLocal, PreMarketPrediction, init_db

def seed_database():
    # Initialize the database schemas and extensions
    init_db()
    
    db = SessionLocal()
    
    # Check if we already have picks
    if db.query(PreMarketPrediction).count() > 0:
        print("Database already has picks.")
        db.close()
        return

    picks = [
        {
            "ticker": "RELIANCE",
            "exchange": "NSE",
            "catalyst_core": "Strong Q4 earnings and new energy investments.",
            "directional_conviction": "High",
            "expected_margin_low": 2.5,
            "expected_margin_high": 4.0,
            "stop_loss_atr": 45.5,
            "invalidation_level": 2800.0,
        },
        {
            "ticker": "NVDA",
            "exchange": "NASDAQ",
            "catalyst_core": "Global semiconductor shortage easing, new Blackwell chips announced.",
            "directional_conviction": "High",
            "expected_margin_low": 4.0,
            "expected_margin_high": 7.5,
            "stop_loss_atr": 15.0,
            "invalidation_level": 115.0,
        },
        {
            "ticker": "TCS",
            "exchange": "NSE",
            "catalyst_core": "Major IT deal signed in Europe despite macro headwinds.",
            "directional_conviction": "Medium",
            "expected_margin_low": 1.0,
            "expected_margin_high": 2.5,
            "stop_loss_atr": 30.0,
            "invalidation_level": 3700.0,
        }
    ]

    for data in picks:
        p = PreMarketPrediction(
            trading_date=datetime.now(timezone.utc).date(),
            **data
        )
        db.add(p)
    
    db.commit()
    db.close()
    print("Database seeded successfully.")

if __name__ == "__main__":
    seed_database()
