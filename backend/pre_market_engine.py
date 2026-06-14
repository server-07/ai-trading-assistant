import os
import json
import asyncio
from datetime import datetime, timezone, timedelta
from google import genai
from google.genai import types
from sqlalchemy import text
from database import SessionLocal, NewsArticle, PreMarketPrediction

os.environ.setdefault("GEMINI_API_KEY", "mock-key-for-dev")
client = genai.Client()

def fetch_global_closes():
    # Mocking external market API calls
    return {
        "GIFT_Nifty": 23450,
        "Nasdaq": 17800,
        "Nikkei": 38900,
        "Dollar_Index": 104.5
    }

async def generate_daily_picks():
    print("Starting Pre-Market Engine...")
    db = SessionLocal()
    
    try:
        global_market_context = fetch_global_closes()
        
        # Fetch top breaking news from the last 24 hours
        yesterday = datetime.now(timezone.utc) - timedelta(days=1)
        recent_news = db.query(NewsArticle).filter(NewsArticle.published_at >= yesterday).order_by(NewsArticle.published_at.desc()).limit(10).all()
        
        if not recent_news:
            print("No recent news found. Using a mock catalyst for demonstration.")
            # For demo purposes, we will mock one if the DB is empty
            mock_news = NewsArticle(
                title="Global Semiconductor Shortage Expected to Ease in Q4",
                content="Major chipmakers announce expanded production lines.",
                embedding=[0.1] * 768
            )
            recent_news = [mock_news]

        picks_generated = 0
        
        for news in recent_news:
            # Vector search for similar news from the 7-week history
            # The pgvector extension allows ordering by L2 distance (<->)
            # In a real setup, embedding is populated and we do vector math
            similar_past_news = []
            if news.embedding is not None:
                similar_past_news = db.query(NewsArticle).order_by(
                    NewsArticle.embedding.l2_distance(news.embedding)
                ).limit(3).all()
            
            past_titles = [n.title for n in similar_past_news if n.title != news.title]
            
            prompt = f"""
            You are a quantitative AI. 
            Overnight Markets: {json.dumps(global_market_context)}
            Current Catalyst: {news.title} - {news.content}
            Historical Context (last 7 weeks): {json.dumps(past_titles)}
            
            Identify 1 high conviction asset (Indian NSE or US NASDAQ) impacted by this catalyst. 
            Output MUST be in JSON format matching this schema:
            {{
                "ticker": "string",
                "exchange": "NSE or NASDAQ",
                "catalyst_core": "string description",
                "directional_conviction": "High/Medium/Low",
                "expected_margin_low": "float",
                "expected_margin_high": "float",
                "stop_loss_atr": "float",
                "invalidation_level": "float"
            }}
            """
            
            try:
                response = client.models.generate_content(
                    model='gemini-2.5-pro',
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_schema={
                            "type": "OBJECT",
                            "properties": {
                                "ticker": {"type": "STRING"},
                                "exchange": {"type": "STRING"},
                                "catalyst_core": {"type": "STRING"},
                                "directional_conviction": {"type": "STRING"},
                                "expected_margin_low": {"type": "NUMBER"},
                                "expected_margin_high": {"type": "NUMBER"},
                                "stop_loss_atr": {"type": "NUMBER"},
                                "invalidation_level": {"type": "NUMBER"}
                            }
                        }
                    )
                )
                
                prediction_data = json.loads(response.text)
                
                # Save to database
                pick = PreMarketPrediction(
                    trading_date=datetime.now(timezone.utc).date(),
                    **prediction_data
                )
                db.add(pick)
                db.commit()
                print(f"Generated pick for {prediction_data['ticker']}")
                picks_generated += 1
                
            except Exception as e:
                print(f"Error generating pick for news '{news.title}': {e}")
                db.rollback()

        print(f"Finished generating {picks_generated} picks.")
            
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(generate_daily_picks())
