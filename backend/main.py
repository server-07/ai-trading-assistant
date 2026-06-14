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
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

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

@app.get("/api/picks")
def get_daily_picks(region: str = "ALL", timeframe: str = "7W", db: Session = Depends(get_db), current_user: Profile = Depends(get_current_approved_user)):
    mock_data = {
        "1D": [
            {"ticker": "ZOMATO", "exchange": "NSE", "catalyst_core": "Intraday volume spike due to sudden positive analyst coverage.", "full_news": "Global brokerage firm upgrades Zomato citing robust growth in Blinkit and stable core food delivery margins. Expects strong open.", "directional_conviction": "High", "expected_margin_low": 1.5, "expected_margin_high": 3.0, "stop_loss_atr": 5.0, "invalidation_level": 160.0, "ltp": 165.0, "predictive_open": 168.0},
            {"ticker": "TSLA", "exchange": "NASDAQ", "catalyst_core": "Elon Musk tweet overnight hinting at new robotaxi feature.", "full_news": "Elon Musk teased an upcoming Full Self-Driving update focusing entirely on autonomous taxi routing algorithms, sparking pre-market retail buying.", "directional_conviction": "Medium", "expected_margin_low": 2.0, "expected_margin_high": 4.5, "stop_loss_atr": 8.0, "invalidation_level": 170.0, "ltp": 175.50, "predictive_open": 178.0}
        ],
        "1W": [
            {"ticker": "HDFCBANK", "exchange": "NSE", "catalyst_core": "Sustained FII inflow over the last 5 sessions driving momentum.", "full_news": "Foreign Institutional Investors have consistently bought HDFC Bank for 5 straight days following the latest deposit growth data. Technicals point to a breakout.", "directional_conviction": "High", "expected_margin_low": 3.0, "expected_margin_high": 5.0, "stop_loss_atr": 25.0, "invalidation_level": 1450.0, "ltp": 1480.0, "predictive_open": 1495.0},
            {"ticker": "AAPL", "exchange": "NASDAQ", "catalyst_core": "Anticipation of WWDC announcements building over the week.", "full_news": "Supply chain leaks suggest Apple's new AI features will be deeply integrated into iOS 18. Hedge funds are positioning ahead of the keynote.", "directional_conviction": "High", "expected_margin_low": 2.5, "expected_margin_high": 6.0, "stop_loss_atr": 4.5, "invalidation_level": 185.0, "ltp": 189.0, "predictive_open": 192.5}
        ],
        "1M": [
            {"ticker": "INFY", "exchange": "NSE", "catalyst_core": "Monthly macro shift towards defensive IT as rate cut hopes fade.", "full_news": "With US inflation data coming in hot over the month, investors are rotating out of growth and back into stable dividend-paying IT firms like Infosys.", "directional_conviction": "Medium", "expected_margin_low": 4.0, "expected_margin_high": 8.0, "stop_loss_atr": 45.0, "invalidation_level": 1400.0, "ltp": 1420.0, "predictive_open": 1445.0},
            {"ticker": "META", "exchange": "NASDAQ", "catalyst_core": "Strong ad revenue growth metrics verified over the rolling 30 days.", "full_news": "Third-party tracking tools indicate Meta's Instagram Reels monetization has increased by 15% month-over-month. AI engine forecasts sustained gap up.", "directional_conviction": "High", "expected_margin_low": 5.0, "expected_margin_high": 10.0, "stop_loss_atr": 15.0, "invalidation_level": 480.0, "ltp": 490.0, "predictive_open": 505.0}
        ],
        "7W": [
            {"ticker": "RELIANCE", "exchange": "NSE", "catalyst_core": "Strong Q4 earnings combined with a 7-week bullish trend in new energy.", "full_news": "Reliance's massive gigafactory investments are finally coming online. 7 weeks of sentiment analysis show an overwhelmingly positive shift in institutional reports.", "directional_conviction": "High", "expected_margin_low": 2.5, "expected_margin_high": 4.0, "stop_loss_atr": 45.5, "invalidation_level": 2800.0, "ltp": 2850.0, "predictive_open": 2885.0},
            {"ticker": "NVDA", "exchange": "NASDAQ", "catalyst_core": "7-week continuous easing of semiconductor supply chain, Blackwell hype.", "full_news": "TSMC confirmed ample CoWoS packaging capacity for NVIDIA's next-gen Blackwell chips. The 7-week vector analysis flags this as a critical inflection point for margins.", "directional_conviction": "High", "expected_margin_low": 4.0, "expected_margin_high": 7.5, "stop_loss_atr": 15.0, "invalidation_level": 115.0, "ltp": 120.0, "predictive_open": 124.0},
            {"ticker": "TCS", "exchange": "NSE", "catalyst_core": "Long-term deal wins accumulating over the 7-week vector window.", "full_news": "TCS announced a $1B+ digital transformation deal in the UK. This adds to a 7-week streak of consistent deal pipelines being finalized.", "directional_conviction": "Medium", "expected_margin_low": 1.0, "expected_margin_high": 2.5, "stop_loss_atr": 30.0, "invalidation_level": 3700.0, "ltp": 3750.0, "predictive_open": 3765.0}
        ]
    }
    
    # Get picks for timeframe
    picks = mock_data.get(timeframe, mock_data["7W"])
    
    # Filter by region
    if region == "INDIA":
        picks = [p for p in picks if p["exchange"] in ["NSE", "BSE"]]
    elif region == "WORLD":
        picks = [p for p in picks if p["exchange"] not in ["NSE", "BSE"]]
        
    return picks

@sio.event
async def connect(sid, environ, auth):
    # Authenticate socketio connection
    try:
        if not auth or 'token' not in auth:
            return False
        
        token = auth['token']
        
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
