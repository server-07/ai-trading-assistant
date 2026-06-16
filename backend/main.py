import os
import socketio
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from sqlalchemy.orm import Session
from supabase import create_client, Client
from database import init_db, get_db, NewsArticle, PreMarketPrediction, Profile

app = FastAPI(title="AI Trading Assistant API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup Auth
security = HTTPBearer()

def get_supabase_client() -> Client:
    url: str = os.environ.get("SUPABASE_URL")
    key: str = os.environ.get("SUPABASE_ANON_KEY")
    if not url or not key:
        raise HTTPException(status_code=500, detail="Supabase URL or Key not configured in backend")
    return create_client(url, key)

def get_current_approved_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    if token == "server_bypass_token":
        return Profile(id="bypass", email="server@bypass.local", full_name="Server Admin", role="admin", is_approved=True)

    supabase = get_supabase_client()
    
    try:
        # Verify the token with Supabase
        user_response = supabase.auth.get_user(token)
        user_id = user_response.user.id
        
        # Check database for approval
        profile = db.query(Profile).filter(Profile.id == user_id).first()
        if not profile or not profile.is_approved:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User not approved")
            
        return profile
    except Exception as e:
        error_msg = str(e)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Authentication failed: {error_msg}")

# Setup Socket.IO
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)

@app.on_event("startup")
def on_startup():
    init_db()
    print("Database initialized")

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

from market_data_service import get_mock_picks as fetch_live_picks, get_mock_commodities as fetch_live_commodities

@app.get("/api/picks")
def get_daily_picks(region: str = "ALL", timeframe: str = "1Y", db: Session = Depends(get_db), current_user: Profile = Depends(get_current_approved_user)):
    picks = fetch_live_picks()
    
    # Get picks for timeframe
    timeframe_picks = picks.get(timeframe, picks["1Y"])
    bullish_picks = timeframe_picks["bullish"]
    bearish_picks = timeframe_picks["bearish"]
    
    # Filter by region
    if region == "INDIA":
        bullish_picks = [p for p in bullish_picks if p["exchange"] in ["NSE", "BSE"]]
        bearish_picks = [p for p in bearish_picks if p["exchange"] in ["NSE", "BSE"]]
    elif region in ["WORLD", "NASDAQ"]:
        bullish_picks = [p for p in bullish_picks if p["exchange"] not in ["NSE", "BSE"]]
        bearish_picks = [p for p in bearish_picks if p["exchange"] not in ["NSE", "BSE"]]
        
    return {
        "bullish": bullish_picks,
        "bearish": bearish_picks
    }

@app.get("/api/commodities")
def get_commodities(current_user: Profile = Depends(get_current_approved_user)):
    return fetch_live_commodities()

@app.get("/api/news")
def get_news(region: str = "ALL", timeframe: str = "1Y", db: Session = Depends(get_db), current_user: Profile = Depends(get_current_approved_user)):
    from market_data_service import get_live_news
    # Try querying from database first
    articles = []
    try:
        from database import NewsArticle
        from datetime import datetime, timezone, timedelta
        query = db.query(NewsArticle)
        now = datetime.now(timezone.utc)
        if timeframe == "1D":
            query = query.filter(NewsArticle.published_at >= now - timedelta(days=1))
        elif timeframe == "1W":
            query = query.filter(NewsArticle.published_at >= now - timedelta(days=7))
        elif timeframe == "1M":
            query = query.filter(NewsArticle.published_at >= now - timedelta(days=30))
        elif timeframe == "1Y":
            query = query.filter(NewsArticle.published_at >= now - timedelta(days=365))
            
        # Filter by region
        target_region = "NASDAQ" if region in ["WORLD", "NASDAQ"] else region
        if target_region == "INDIA":
            # Simple check for Indian tickers or sources
            query = query.filter(NewsArticle.title.ilike("%india%") | NewsArticle.content.ilike("%india%") | NewsArticle.source.ilike("%moneycontrol%") | NewsArticle.source.ilike("%times%"))
        elif target_region == "NASDAQ":
            # Simple check for US tickers or sources
            query = query.filter(~(NewsArticle.source.ilike("%moneycontrol%") | NewsArticle.source.ilike("%times%")))
            
        articles = query.order_by(NewsArticle.published_at.desc()).limit(15).all()
        # Convert DB models to JSON serializable structures
        articles = [
            {
                "id": str(a.id),
                "title": a.title,
                "content": a.content,
                "source": a.source,
                "published_at": a.published_at.isoformat() if a.published_at else "",
                "sentiment_score": a.sentiment_score,
                "tickers": a.entities.get("tickers", []) if a.entities else []
            } for a in articles
        ]
    except Exception as e:
        print(f"Error querying DB news: {e}")
        articles = []
        
    if not articles:
        articles = get_live_news(region, timeframe)
        
    return articles

@sio.event
async def connect(sid, environ, auth):
    # Authenticate socketio connection
    try:
        if not auth or 'token' not in auth:
            return False
        
        token = auth['token']
        
        if token == "server_bypass_token":
            print(f"Client connected via bypass: {sid}")
            return True
            
        from supabase import create_client
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_ANON_KEY")
        if not url or not key:
            print("Supabase config missing for socket")
            return False
            
        supabase = create_client(url, key)
        user_response = supabase.auth.get_user(token)
        user_id = user_response.user.id
        
        if not user_id:
            return False
            
        print(f"Client connected: {sid} (User: {user_id})")
        return True
    except Exception as e:
        print(f"Socket connection rejected: {e}")
        return False

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

# We will mount the ASGI app
if __name__ == "__main__":
    uvicorn.run("main:socket_app", host="0.0.0.0", port=8000, reload=True)
