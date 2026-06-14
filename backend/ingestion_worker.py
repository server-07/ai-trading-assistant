import os
import json
import asyncio
from datetime import datetime, timezone
from google import genai
from google.genai import types
from database import SessionLocal, NewsArticle
import uuid

# Provide Gemini API key in environment or local config
os.environ.setdefault("GEMINI_API_KEY", "mock-key-for-dev")
client = genai.Client()

async def process_article(title: str, content: str, source: str, published_at: datetime):
    print(f"Processing article from {source}: {title}")
    
    # 1. Extract Entities & Sentiment using Gemini
    prompt = f"Analyze this financial article. Extract tickers, sectors, countries. Assign a sentiment score (-1.0 to 1.0).\n\nTitle: {title}\nContent: {content}"
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema={
                    "type": "OBJECT",
                    "properties": {
                        "tickers": {"type": "ARRAY", "items": {"type": "STRING"}},
                        "sectors": {"type": "ARRAY", "items": {"type": "STRING"}},
                        "countries": {"type": "ARRAY", "items": {"type": "STRING"}},
                        "sentiment_score": {"type": "NUMBER"}
                    }
                }
            )
        )
        analysis_json = response.text
        analysis = json.loads(analysis_json)
        sentiment = analysis.get('sentiment_score', 0.0)
    except Exception as e:
        print(f"Error calling Gemini generation: {e}")
        analysis = {}
        sentiment = 0.0
        
    # 2. Generate Text Embedding
    try:
        embedding_res = client.models.embed_content(
            model='text-embedding-004',
            contents=f"{title}\n{content}"
        )
        vector = embedding_res.embeddings[0].values
    except Exception as e:
        print(f"Error calling Gemini embedding: {e}")
        # Default mock vector for testing
        vector = [0.0] * 768

    # 3. Save to Database
    db = SessionLocal()
    try:
        article = NewsArticle(
            source=source, 
            title=title, 
            content=content,
            published_at=published_at, 
            entities=analysis,
            sentiment_score=sentiment,
            embedding=vector
        )
        db.add(article)
        db.commit()
        print(f"Saved article to vector DB: {title}")
    except Exception as e:
        db.rollback()
        print(f"Database error: {e}")
    finally:
        db.close()

# Mock ingestion runner
async def run_ingestion_loop():
    print("Starting news ingestion worker...")
    mock_news = [
        {
            "title": "Fed Signals Potential Rate Cut in Q3",
            "content": "The Federal Reserve indicated that it might begin cutting interest rates as inflation cools...",
            "source": "Reuters",
            "published_at": datetime.now(timezone.utc)
        },
        {
            "title": "Reliance Industries Reports Strong Quarterly Earnings",
            "content": "Reliance Industries beat analyst expectations with a 15% YoY increase in revenue driven by Jio and Retail...",
            "source": "Moneycontrol",
            "published_at": datetime.now(timezone.utc)
        }
    ]
    
    for news in mock_news:
        await process_article(**news)
        await asyncio.sleep(1)

if __name__ == "__main__":
    asyncio.run(run_ingestion_loop())
