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
    <div className="flex flex-col flex-1 p-4 md:p-8 text-white max-w-[90rem] mx-auto w-full relative z-10">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 md:mb-8 backdrop-blur-md bg-white/5 border border-white/10 p-5 md:p-6 rounded-2xl shadow-2xl gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
            PrePulse AI
          </h1>
          <p className="text-zinc-400 mt-1.5 text-xs md:text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Live Analytics & Vector Intelligence
          </p>
        </div>
        
        {/* Controls Layer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
          <div className="flex bg-zinc-900/80 p-1 rounded-xl border border-white/10 justify-around sm:justify-start">
            {['ALL', 'INDIA', 'WORLD'].map(r => (
              <button 
                key={r}
                onClick={() => setRegion(r)}
                className={`flex items-center justify-center gap-1.5 px-3 md:px-4 py-2 text-[11px] md:text-xs font-semibold rounded-lg transition-all ${region === r ? 'bg-cyan-500/20 text-cyan-400 shadow-md' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
              >
                {r === 'WORLD' ? <Globe className="w-3 h-3" /> : r === 'INDIA' ? <MapPin className="w-3 h-3" /> : null}
                {r}
              </button>
            ))}
          </div>

          <div className="flex bg-zinc-900/80 p-1 rounded-xl border border-white/10 justify-around sm:justify-start">
            {['1D', '1W', '1M', '1Y'].map(t => (
              <button 
                key={t}
                onClick={() => setTimeframe(t)}
                className={`flex items-center justify-center gap-1 px-2.5 md:px-3 py-2 text-[11px] md:text-xs font-semibold rounded-lg transition-all ${timeframe === t ? 'bg-blue-500/20 text-blue-400 shadow-md' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
              >
                <Clock className="w-3 h-3 opacity-50" />
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-3 sm:ml-2 sm:border-l border-white/10 sm:pl-6 h-10 w-full sm:w-auto">
            <button 
              onClick={() => setRefreshTrigger(prev => prev + 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 border border-indigo-500/30 rounded-lg text-xs font-bold transition-all"
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
              <span className="text-xs md:text-sm font-medium text-zinc-300">
                {isConnected ? "System Online" : "Connecting..."}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Tabs */}
      <div className="hidden md:flex gap-4 mb-6">
        <button 
          onClick={() => setActiveSection('bullish')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeSection !== 'bearish' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
        >
          <TrendingUp className="w-5 h-5" /> Bullish Catalysts
        </button>
        <button 
          onClick={() => setActiveSection('bearish')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeSection === 'bearish' ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
        >
          <TrendingDown className="w-5 h-5" /> Bearish Catalysts
        </button>
      </div>

      {/* Mobile Tabs */}
      <div className="md:hidden flex w-full gap-2 mb-6 p-1 bg-black/40 border border-white/10 rounded-2xl">
        <button 
          onClick={() => setActiveSection('bullish')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl font-bold text-[10px] sm:text-xs transition-all ${activeSection === 'bullish' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md' : 'text-zinc-400 hover:text-white'}`}
        >
          <TrendingUp className="w-5 h-5 sm:w-4 sm:h-4" /> Bullish
        </button>
        <button 
          onClick={() => setActiveSection('bearish')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl font-bold text-[10px] sm:text-xs transition-all ${activeSection === 'bearish' ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-md' : 'text-zinc-400 hover:text-white'}`}
        >
          <TrendingDown className="w-5 h-5 sm:w-4 sm:h-4" /> Bearish
        </button>
        <button 
          onClick={() => setActiveSection('commodities')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl font-bold text-[10px] sm:text-xs transition-all ${activeSection === 'commodities' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 shadow-md' : 'text-zinc-400 hover:text-white'}`}
        >
          <Activity className="w-5 h-5 sm:w-4 sm:h-4" /> Commodity
        </button>
      </div>

      {/* Content Area */}
      <div className="mb-8">
        {/* Mobile rendering logic */}
        <div className="md:hidden">
          {activeSection === 'bullish' && <PicksTable picks={bullishPicks} isBearish={false} setSelectedNews={setSelectedNews} />}
          {activeSection === 'bearish' && <PicksTable picks={bearishPicks} isBearish={true} setSelectedNews={setSelectedNews} />}
          {activeSection === 'commodities' && <CommoditiesSection refreshTrigger={refreshTrigger} />}
        </div>

        {/* Desktop rendering logic (Commodities always visible, toggle between bull/bear tables) */}
        <div className="hidden md:block">
          {activeSection !== 'bearish' ? (
            <PicksTable picks={bullishPicks} isBearish={false} setSelectedNews={setSelectedNews} />
          ) : (
            <PicksTable picks={bearishPicks} isBearish={true} setSelectedNews={setSelectedNews} />
          )}
          <CommoditiesSection refreshTrigger={refreshTrigger} />
        </div>
      </div>

      {/* News Modal */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-zinc-900 border border-white/10 p-6 rounded-2xl max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setSelectedNews(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-zinc-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              {selectedNews.ticker} Catalyst Engine
            </h3>
            <div className="w-full h-px bg-white/10 my-4" />
            <p className="text-zinc-300 leading-relaxed text-sm">
              {selectedNews.news}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
