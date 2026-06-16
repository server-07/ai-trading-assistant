"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Activity, TrendingUp, TrendingDown, DollarSign, IndianRupee, AlertTriangle, Globe, MapPin, Clock, Info, X, RefreshCw } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Pick {
  id: string;
  ticker: string;
  exchange: string;
  catalyst_core: string;
  full_news: string;
  directional_conviction: string;
  expected_margin_low: number;
  expected_margin_high: number;
  stop_loss_atr: number;
  invalidation_level: number;
  ltp?: number;
  predictive_open?: number;
}

import PicksTable from "./PicksTable";
import CommoditiesSection from "./CommoditiesSection";

export default function Dashboard() {
  const [bullishPicks, setBullishPicks] = useState<Pick[]>([]);
  const [bearishPicks, setBearishPicks] = useState<Pick[]>([]);
  const [activeSection, setActiveSection] = useState<'bullish' | 'bearish' | 'commodities'>('bullish');
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [timeframe, setTimeframe] = useState("1Y");
  const [region, setRegion] = useState("ALL");
  const [selectedNews, setSelectedNews] = useState<{ticker: string, news: string} | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [viewType, setViewType] = useState<'stocks' | 'news'>('stocks');
  const [newsArticles, setNewsArticles] = useState<any[]>([]);
  const [isNewsLoading, setIsNewsLoading] = useState(false);

  useEffect(() => {
    // Fetch picks based on filters
    const fetchPicks = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        // BYPASS LOGIC
        const isBypass = document.cookie.includes('bypass_auth=true');
        const token = isBypass ? "server_bypass_token" : session?.access_token;

        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${baseUrl}/api/picks?region=${region}&timeframe=${timeframe}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setBullishPicks(data.bullish || []);
          setBearishPicks(data.bearish || []);
        } else {
          console.error("Failed to fetch picks:", res.status);
        }
      } catch (err) {
        console.error("Error fetching picks:", err);
      }
    };
    
    fetchPicks();
  }, [region, timeframe, refreshTrigger]);

  useEffect(() => {
    if (viewType !== 'news') return;
    
    const fetchNews = async () => {
      setIsNewsLoading(true);
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        const isBypass = document.cookie.includes('bypass_auth=true');
        const token = isBypass ? "server_bypass_token" : session?.access_token;

        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const queryRegion = region === "NASDAQ" ? "WORLD" : region;
        const res = await fetch(`${baseUrl}/api/news?region=${queryRegion}&timeframe=${timeframe}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setNewsArticles(data || []);
        }
      } catch (err) {
        console.error("Error fetching news:", err);
      } finally {
        setIsNewsLoading(false);
      }
    };

    fetchNews();
  }, [region, timeframe, viewType, refreshTrigger]);

  useEffect(() => {
    let s: Socket;
    
    const initSocket = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      // BYPASS LOGIC
      const isBypass = document.cookie.includes('bypass_auth=true');
      const token = isBypass ? "server_bypass_token" : session?.access_token;

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      s = io(baseUrl, {
        transports: ["websocket", "polling"],
        auth: {
          token: token
        }
      });
      setSocket(s);

      s.on("connect", () => setIsConnected(true));
      s.on("disconnect", () => setIsConnected(false));
      s.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
        setIsConnected(false);
      });

      s.on("market_update", (tick: { ticker: string, ltp: number }) => {
        setBullishPicks(current => current.map(p => p.ticker === tick.ticker ? { ...p, ltp: tick.ltp } : p));
        setBearishPicks(current => current.map(p => p.ticker === tick.ticker ? { ...p, ltp: tick.ltp } : p));
      });
    };
    
    initSocket();

    return () => {
      if (s) s.disconnect();
    };
  }, []);

  useEffect(() => {
    // Automatically trigger a refresh/sync every 1 hour (3600000 ms)
    const interval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 3600000);
    
    return () => clearInterval(interval);
  }, []);

  const getCurrencySymbol = (exchange: string) => {
    return ["NSE", "BSE"].includes(exchange.toUpperCase()) ? "₹" : "$";
  };
  
  const getCurrencyIcon = (exchange: string) => {
    return ["NSE", "BSE"].includes(exchange.toUpperCase()) 
      ? <IndianRupee className="w-5 h-5 text-green-400" />
      : <DollarSign className="w-5 h-5 text-blue-400" />;
  };

  const calculateAbsoluteMargin = (price: number, percentage: number) => {
    return (price * (percentage / 100)).toFixed(2);
  };

  return (
    <div className="flex flex-col flex-1 p-2.5 md:p-8 text-white max-w-[90rem] mx-auto w-full relative z-10">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 md:mb-8 backdrop-blur-md bg-white/5 border border-white/10 p-3.5 md:p-6 rounded-xl md:rounded-2xl shadow-2xl gap-4 md:gap-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
            PrePulse AI
          </h1>
          <p className="text-zinc-400 mt-1 md:mt-1.5 text-[10px] md:text-sm flex items-center gap-1.5 md:gap-2">
            <Activity className="w-3.5 h-3.5 md:w-4 md:h-4 text-cyan-400" />
            Live Analytics & Vector Intelligence
          </p>
        </div>
        
        {/* Controls Layer */}
        {/* Desktop Controls (hidden on mobile) */}
        <div className="hidden md:flex flex-row items-center gap-4">
          <div className="flex bg-zinc-900/80 p-1 rounded-xl border border-white/10">
            {['ALL', 'INDIA', 'WORLD'].map(r => (
              <button 
                key={r}
                onClick={() => setRegion(r)}
                className={`flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${region === r || (r === 'WORLD' && region === 'NASDAQ') ? 'bg-cyan-500/20 text-cyan-400 shadow-md' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
              >
                {r === 'WORLD' ? <Globe className="w-3 h-3" /> : r === 'INDIA' ? <MapPin className="w-3 h-3" /> : null}
                {r}
              </button>
            ))}
          </div>

          <div className="flex bg-zinc-900/80 p-1 rounded-xl border border-white/10">
            {['1D', '1W', '1M', '1Y'].map(t => (
              <button 
                key={t}
                onClick={() => setTimeframe(t)}
                className={`flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${timeframe === t ? 'bg-blue-500/20 text-blue-400 shadow-md' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
              >
                <Clock className="w-3 h-3 opacity-50" />
                {t}
              </button>
            ))}
          </div>

          {/* Stocks/News Toggle */}
          <div className="flex bg-zinc-900/80 p-1 rounded-xl border border-white/10">
            <button 
              onClick={() => setViewType('stocks')}
              className={`flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${viewType === 'stocks' ? 'bg-indigo-500/20 text-indigo-400 shadow-md' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
            >
              <Activity className="w-3.5 h-3.5" /> Stocks
            </button>
            <button 
              onClick={() => setViewType('news')}
              className={`flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${viewType === 'news' ? 'bg-indigo-500/20 text-indigo-400 shadow-md' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
            >
              <Globe className="w-3.5 h-3.5" /> News
            </button>
          </div>

          <div className="flex items-center gap-3 border-l border-white/10 pl-6 h-10">
            <button 
              onClick={() => setRefreshTrigger(prev => prev + 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 border border-indigo-500/30 rounded-lg text-xs font-bold transition-all relative z-20 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Sync Now
            </button>
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                {isConnected && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
              </span>
              <span className="text-sm font-medium text-zinc-300">
                {isConnected ? "System Online" : "Connecting..."}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Controls (visible only on mobile) */}
        <div className="flex md:hidden flex-col gap-2.5 w-full">
          <div className="grid grid-cols-3 gap-1.5 w-full">
            {/* Region Dropdown */}
            <div className="relative">
              <select
                value={region === "WORLD" ? "NASDAQ" : region}
                onChange={(e) => setRegion(e.target.value === "NASDAQ" ? "WORLD" : e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-cyan-500/50 appearance-none pr-6 cursor-pointer"
              >
                <option value="ALL">All Regions</option>
                <option value="INDIA">India</option>
                <option value="NASDAQ">NASDAQ</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-zinc-500">
                <Globe className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Timeframe Dropdown */}
            <div className="relative">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-blue-500/50 appearance-none pr-6 cursor-pointer"
              >
                <option value="1D">1 Day</option>
                <option value="1W">1 Week</option>
                <option value="1M">1 Month</option>
                <option value="1Y">1 Year</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-zinc-500">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* View Type Dropdown */}
            <div className="relative">
              <select
                value={viewType}
                onChange={(e) => setViewType(e.target.value as 'stocks' | 'news')}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-indigo-500/50 appearance-none pr-6 cursor-pointer"
              >
                <option value="stocks">Stocks</option>
                <option value="news">News</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-zinc-500">
                <Activity className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between w-full p-2 bg-zinc-900/50 border border-white/5 rounded-lg">
            <button 
              onClick={() => setRefreshTrigger(prev => prev + 1)}
              className="flex items-center gap-1 px-2.5 py-1 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 border border-indigo-500/30 rounded-md text-[10px] font-bold transition-all cursor-pointer relative z-20"
            >
              <RefreshCw className="w-3 h-3" /> Sync Now
            </button>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                {isConnected && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
              </span>
              <span className="text-[10px] font-medium text-zinc-400">
                {isConnected ? "System Online" : "Connecting..."}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Tabs */}
      {viewType === 'stocks' && (
        <div className="hidden md:flex gap-4 mb-6">
          <button 
            onClick={() => setActiveSection('bullish')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeSection === 'bullish' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
          >
            <TrendingUp className="w-5 h-5" /> Bullish Catalysts
          </button>
          <button 
            onClick={() => setActiveSection('bearish')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeSection === 'bearish' ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
          >
            <TrendingDown className="w-5 h-5" /> Bearish Catalysts
          </button>
          <button 
            onClick={() => setActiveSection('commodities')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeSection === 'commodities' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
          >
            <Activity className="w-5 h-5" /> Commodities
          </button>
        </div>
      )}

      {/* Mobile Tabs */}
      {viewType === 'stocks' && (
        <div className="md:hidden flex w-full gap-2 mb-4 p-1 bg-black/40 border border-white/10 rounded-xl">
          <button 
            onClick={() => setActiveSection('bullish')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-lg font-bold text-[10px] sm:text-xs transition-all ${activeSection === 'bullish' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md' : 'text-zinc-400 hover:text-white'}`}
          >
            <TrendingUp className="w-4 h-4" /> Bullish
          </button>
          <button 
            onClick={() => setActiveSection('bearish')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-lg font-bold text-[10px] sm:text-xs transition-all ${activeSection === 'bearish' ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-md' : 'text-zinc-400 hover:text-white'}`}
          >
            <TrendingDown className="w-4 h-4" /> Bearish
          </button>
          <button 
            onClick={() => setActiveSection('commodities')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-lg font-bold text-[10px] sm:text-xs transition-all ${activeSection === 'commodities' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 shadow-md' : 'text-zinc-400 hover:text-white'}`}
          >
            <Activity className="w-4 h-4" /> Commodity
          </button>
        </div>
      )}

      {/* Content Area */}
      <div className="mb-6 md:mb-8">
        {/* Mobile rendering logic */}
        <div className="md:hidden">
          {viewType === 'news' ? (
            <NewsSection articles={newsArticles} isLoading={isNewsLoading} />
          ) : (
            <>
              {activeSection === 'bullish' && <PicksTable picks={bullishPicks} isBearish={false} setSelectedNews={setSelectedNews} />}
              {activeSection === 'bearish' && <PicksTable picks={bearishPicks} isBearish={true} setSelectedNews={setSelectedNews} />}
              {activeSection === 'commodities' && <CommoditiesSection refreshTrigger={refreshTrigger} setSelectedNews={setSelectedNews} />}
            </>
          )}
        </div>

        {/* Desktop rendering logic */}
        <div className="hidden md:block">
          {viewType === 'news' ? (
            <NewsSection articles={newsArticles} isLoading={isNewsLoading} />
          ) : (
            <>
              {activeSection === 'bullish' && <PicksTable picks={bullishPicks} isBearish={false} setSelectedNews={setSelectedNews} />}
              {activeSection === 'bearish' && <PicksTable picks={bearishPicks} isBearish={true} setSelectedNews={setSelectedNews} />}
              {activeSection === 'commodities' && <CommoditiesSection refreshTrigger={refreshTrigger} setSelectedNews={setSelectedNews} />}
            </>
          )}
        </div>
      </div>

      {/* News Modal */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-zinc-900 border border-white/10 p-4 sm:p-6 rounded-xl sm:rounded-2xl max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setSelectedNews(null)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-zinc-400 transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <h3 className="text-base sm:text-xl font-bold text-white mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2 pr-6">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
              {selectedNews.ticker} Catalyst Engine
            </h3>
            <div className="w-full h-px bg-white/10 my-3 sm:my-4" />
            <p className="text-zinc-300 leading-relaxed text-xs sm:text-sm">
              {selectedNews.news}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function NewsSection({ articles, isLoading }: { articles: any[], isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-3 text-zinc-400">
        <Activity className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-sm">Fetching latest market intelligence...</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-3 text-zinc-500 border border-white/5 bg-white/5 rounded-xl text-center">
        <AlertTriangle className="w-6 h-6 text-yellow-500/50" />
        <p className="text-sm">No news articles found for this criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {articles.map((art) => {
        const score = art.sentiment_score || 0;
        const sentimentClass = score > 0.1 
          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
          : score < -0.1 
          ? "bg-red-500/10 text-red-400 border border-red-500/20" 
          : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20";
        const sentimentLabel = score > 0.1 
          ? "Bullish" 
          : score < -0.1 
          ? "Bearish" 
          : "Neutral";

        return (
          <div key={art.id} className="p-3.5 rounded-xl border border-white/10 bg-white/5 flex flex-col gap-2 shadow-md">
            <div className="flex justify-between items-center gap-3">
              <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold border ${sentimentClass}`}>
                {sentimentLabel} ({score.toFixed(1)})
              </span>
              <span className="text-[9px] text-zinc-500 font-mono">
                {art.source} • {new Date(art.published_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} {new Date(art.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white leading-snug">{art.title}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">{art.content}</p>
            {art.tickers && art.tickers.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Stocks Affected:</span>
                {art.tickers.map((t: string) => (
                  <span key={t} className="text-[9px] font-bold font-mono bg-cyan-900/20 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-800/30">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
