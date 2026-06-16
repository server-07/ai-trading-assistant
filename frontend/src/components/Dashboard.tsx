"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Activity, TrendingUp, TrendingDown, DollarSign, IndianRupee, AlertTriangle, Globe, MapPin, Clock, Info, X, RefreshCw, Star, Search, LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { signOut } from "@/app/auth-actions";

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

export default function Dashboard({
  fullName = "Trader",
  isAdmin = false
}: {
  fullName?: string;
  isAdmin?: boolean;
}) {
  const [bullishPicks, setBullishPicks] = useState<Pick[]>([]);
  const [bearishPicks, setBearishPicks] = useState<Pick[]>([]);
  const [activeSection, setActiveSection] = useState<'bullish' | 'bearish' | 'commodities' | 'watchlist'>('bullish');
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [timeframe, setTimeframe] = useState("1D");
  const [region, setRegion] = useState("ALL");
  const [selectedNews, setSelectedNews] = useState<{ticker: string, news: string} | null>(null);
  
  const [viewType, setViewType] = useState<'stocks' | 'news'>('stocks');
  const [newsArticles, setNewsArticles] = useState<any[]>([]);
  const [isNewsLoading, setIsNewsLoading] = useState(false);

  // Pagination states
  const [stockPage, setStockPage] = useState(1);
  const [newsPage, setNewsPage] = useState(1);

  // Reset pagination on filter change
  useEffect(() => {
    setStockPage(1);
  }, [activeSection, region, timeframe, viewType]);

  useEffect(() => {
    setNewsPage(1);
  }, [region, timeframe, viewType]);

  // Auto-refresh triggers
  const [newsRefreshTrigger, setNewsRefreshTrigger] = useState(0);
  const [stocksRefreshTrigger, setStocksRefreshTrigger] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Compatibility for commodities

  // Watchlist states
  const [watchlistStocks, setWatchlistStocks] = useState<string[]>([]);
  const [watchlistStockDetails, setWatchlistStockDetails] = useState<Record<string, Pick>>({});
  const [watchlistCommodities, setWatchlistCommodities] = useState<string[]>([]);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<Pick | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Sync Watchlist from LocalStorage on mount
  useEffect(() => {
    const savedStocks = localStorage.getItem("watchlist_stocks");
    const savedDetails = localStorage.getItem("watchlist_stock_details");
    const savedCommodities = localStorage.getItem("watchlist_commodities");
    
    if (savedStocks) setWatchlistStocks(JSON.parse(savedStocks));
    if (savedDetails) setWatchlistStockDetails(JSON.parse(savedDetails));
    if (savedCommodities) setWatchlistCommodities(JSON.parse(savedCommodities));
  }, []);

  const handleToggleStockWatchlist = (ticker: string) => {
    const isAdded = watchlistStocks.includes(ticker);
    
    let detail: Pick | undefined;
    if (!isAdded) {
      detail = bullishPicks.find(p => p.ticker === ticker) || 
               bearishPicks.find(p => p.ticker === ticker) ||
               (searchResult && searchResult.ticker === ticker ? searchResult : undefined);
    }
    
    setWatchlistStocks(prev => {
      const next = prev.includes(ticker) ? prev.filter(t => t !== ticker) : [...prev, ticker];
      localStorage.setItem("watchlist_stocks", JSON.stringify(next));
      return next;
    });
    
    if (!isAdded && detail) {
      setWatchlistStockDetails(prev => {
        const next = { ...prev, [ticker]: detail };
        localStorage.setItem("watchlist_stock_details", JSON.stringify(next));
        return next;
      });
    } else if (isAdded) {
      setWatchlistStockDetails(prev => {
        const next = { ...prev };
        delete next[ticker];
        localStorage.setItem("watchlist_stock_details", JSON.stringify(next));
        return next;
      });
    }
  };

  const handleToggleCommodityWatchlist = (key: string) => {
    setWatchlistCommodities(prev => {
      const next = prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key];
      localStorage.setItem("watchlist_commodities", JSON.stringify(next));
      return next;
    });
  };

  // Fetch picks based on filters and stocksRefreshTrigger
  useEffect(() => {
    const fetchPicks = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
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
  }, [region, timeframe, stocksRefreshTrigger]);

  // Fetch news based on filters and newsRefreshTrigger
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
        const res = await fetch(`${baseUrl}/api/news?region=${region}&timeframe=${timeframe}`, {
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
  }, [region, timeframe, viewType, newsRefreshTrigger]);

  // Socket.IO configuration
  useEffect(() => {
    let s: Socket;
    
    const initSocket = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
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
        setSearchResult(current => current && current.ticker === tick.ticker ? { ...current, ltp: tick.ltp } : current);
        setWatchlistStockDetails(current => {
          if (current[tick.ticker]) {
            return {
              ...current,
              [tick.ticker]: { ...current[tick.ticker], ltp: tick.ltp }
            };
          }
          return current;
        });
      });
    };
    
    initSocket();

    return () => {
      if (s) s.disconnect();
    };
  }, []);

  // Auto-refresh intervals: 15-min news, 30-min stocks
  useEffect(() => {
    const newsInterval = setInterval(() => {
      setNewsRefreshTrigger(prev => prev + 1);
    }, 15 * 60 * 1000);

    const stocksInterval = setInterval(() => {
      setStocksRefreshTrigger(prev => prev + 1);
      setRefreshTrigger(prev => prev + 1);
    }, 30 * 60 * 1000);
    
    return () => {
      clearInterval(newsInterval);
      clearInterval(stocksInterval);
    };
  }, []);

  const handleSync = () => {
    setNewsRefreshTrigger(prev => prev + 1);
    setStocksRefreshTrigger(prev => prev + 1);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchError("");
    setSearchResult(null);
    
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const isBypass = document.cookie.includes('bypass_auth=true');
      const token = isBypass ? "server_bypass_token" : session?.access_token;
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      const res = await fetch(`${baseUrl}/api/search?ticker=${encodeURIComponent(searchQuery.trim())}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setSearchResult(data);
      } else {
        const errData = await res.json();
        setSearchError(errData.detail || "Stock not found.");
      }
    } catch (err) {
      console.error("Search failed:", err);
      setSearchError("Failed to connect to search API.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 p-2.5 md:p-8 text-white max-w-[90rem] mx-auto w-full relative z-10">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 md:mb-8 backdrop-blur-md bg-white/5 border border-white/10 p-3.5 md:p-6 rounded-xl md:rounded-2xl shadow-2xl gap-4 md:gap-6 w-full">
        <div className="flex justify-between items-center w-full lg:w-auto">
          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
              PrePulse AI
            </h1>
            <p className="text-zinc-400 mt-1 md:mt-1.5 text-[10px] md:text-sm flex items-center gap-1.5 md:gap-2">
              <Activity className="w-3.5 h-3.5 md:w-4 md:h-4 text-cyan-400" />
              Live Analytics & Vector Intelligence
            </p>
          </div>
          
          {/* Mobile top status bar - compact */}
          <div className="flex lg:hidden items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                {isConnected && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
              </span>
              <span className="text-[10px] font-medium text-zinc-400">
                {isConnected ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>
        
        {/* Right Side Info & Auth Controls */}
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 w-full lg:w-auto">
          {/* Status indicator on desktop */}
          <div className="hidden lg:flex items-center gap-1.5 pr-2">
            <span className="relative flex h-2 w-2">
              {isConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            </span>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              {isConnected ? "Online" : "Offline"}
            </span>
          </div>

          <button 
            onClick={handleSync}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 border border-indigo-500/30 rounded-full text-xs font-bold transition-all cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> Sync
          </button>

          {isAdmin && (
            <a href="/admin" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition bg-cyan-900/20 px-3 py-1.5 rounded-full border border-cyan-800/50 whitespace-nowrap">
              Admin Panel
            </a>
          )}

          <form action={signOut}>
            <button type="submit" className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800/50 backdrop-blur-md whitespace-nowrap">
              <LogOut size={12} /> Sign Out
            </button>
          </form>
        </div>
      </header>
      
      {/* Controls Layer */}
      {/* Desktop Controls (hidden on mobile) */}
      <div className="hidden md:flex flex-row items-center gap-4 mb-6">
        <div className="flex bg-zinc-900/80 p-1 rounded-xl border border-white/10">
          {['ALL', 'INDIA', 'NASDAQ', 'WORLD'].map(r => (
            <button 
              key={r}
              onClick={() => setRegion(r)}
              className={`flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${region === r ? 'bg-cyan-500/20 text-cyan-400 shadow-md' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
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
      </div>

      {/* Mobile Controls (visible only on mobile) */}
      <div className="flex md:hidden flex-col gap-2.5 w-full mb-4">
        <div className="grid grid-cols-3 gap-1.5 w-full">
          {/* Region Dropdown */}
          <div className="relative">
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-cyan-500/50 appearance-none pr-6 cursor-pointer"
            >
              <option value="ALL">All Regions</option>
              <option value="INDIA">India</option>
              <option value="NASDAQ">NASDAQ</option>
              <option value="WORLD">World</option>
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
      </div>

      {/* Stock Search Bar */}
      {viewType === 'stocks' && (
        <div className="mb-6 max-w-md">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder="Search stock ticker (e.g. AAPL, TCS.NS)..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-2 pl-10 text-sm text-white focus:outline-none focus:border-cyan-500/50 placeholder:text-zinc-500"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
            </div>
            <button 
              type="submit" 
              disabled={isSearching}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50"
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          </form>
          {searchError && (
            <p className="text-red-400 text-xs mt-2 pl-1">{searchError}</p>
          )}
        </div>
      )}

      {/* Search Result display */}
      {viewType === 'stocks' && searchResult && (
        <div className="mb-6 p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-2xl relative">
          <button 
            onClick={() => setSearchResult(null)}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-zinc-400 transition"
          >
            <X size={16} />
          </button>
          <h3 className="text-sm font-bold text-cyan-400 mb-3 flex items-center gap-1.5">
            <Search size={16} /> Search Result: {searchResult.ticker}
          </h3>
          <PicksTable 
            picks={[searchResult]} 
            isBearish={searchResult.predictive_open ? searchResult.predictive_open < (searchResult.ltp || 0) : false} 
            setSelectedNews={setSelectedNews}
            watchlist={watchlistStocks}
            onToggleWatchlist={handleToggleStockWatchlist}
          />
        </div>
      )}

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
          <button 
            onClick={() => setActiveSection('watchlist')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeSection === 'watchlist' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
          >
            <Star className="w-5 h-5" /> Watchlist
          </button>
        </div>
      )}

      {/* Mobile Tabs (Thin Line, Minimal Spacing) */}
      {viewType === 'stocks' && (
        <div className="md:hidden flex w-full border-b border-white/10 mb-4 text-xs">
          {(['bullish', 'bearish', 'commodities', 'watchlist'] as const).map((tab) => {
            const label = tab === 'bullish' ? 'Bullish' : tab === 'bearish' ? 'Bearish' : tab === 'commodities' ? 'Commodity' : 'Watchlist';
            const isActive = activeSection === tab;
            const activeColor = tab === 'bullish' ? 'border-emerald-500 text-emerald-400' : tab === 'bearish' ? 'border-red-500 text-red-400' : tab === 'commodities' ? 'border-yellow-500 text-yellow-400' : 'border-blue-500 text-blue-400';
            
            return (
              <button
                key={tab}
                onClick={() => setActiveSection(tab)}
                className={`flex-1 pb-2 pt-0.5 text-center font-bold border-b-2 transition-all ${isActive ? `${activeColor}` : 'border-transparent text-zinc-400'}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Pagination helper */}
      {(() => {
        const renderPagination = (currentPage: number, totalItems: number, itemsPerPage: number, onPageChange: (p: number) => void) => {
          const totalPages = Math.ceil(totalItems / itemsPerPage);
          if (totalPages <= 1) return null;
          
          return (
            <div className="flex items-center justify-between mt-3 p-2.5 bg-black/40 border border-white/10 rounded-xl">
              <span className="text-[11px] text-zinc-400">
                Showing <span className="font-semibold text-white">{Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(totalItems, currentPage * itemsPerPage)}</span> of <span className="font-semibold text-white">{totalItems}</span>
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => onPageChange(currentPage - 1)}
                  className="px-2.5 py-1 bg-zinc-900 border border-white/10 rounded-lg text-[10px] font-semibold hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
                >
                  Prev
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => onPageChange(currentPage + 1)}
                  className="px-2.5 py-1 bg-zinc-900 border border-white/10 rounded-lg text-[10px] font-semibold hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          );
        };

        const watchlistedStocksFiltered = Object.values(watchlistStockDetails).filter(p => watchlistStocks.includes(p.ticker));

        return (
          <div className="mb-6 md:mb-8">
            {viewType === 'news' ? (
              <>
                <NewsSection articles={newsArticles.slice((newsPage - 1) * 10, newsPage * 10)} isLoading={isNewsLoading} />
                {!isNewsLoading && renderPagination(newsPage, newsArticles.length, 10, setNewsPage)}
              </>
            ) : (
              <>
                {activeSection === 'bullish' && (
                  <>
                    <PicksTable picks={bullishPicks.slice((stockPage - 1) * 10, stockPage * 10)} isBearish={false} setSelectedNews={setSelectedNews} watchlist={watchlistStocks} onToggleWatchlist={handleToggleStockWatchlist} />
                    {renderPagination(stockPage, bullishPicks.length, 10, setStockPage)}
                  </>
                )}
                {activeSection === 'bearish' && (
                  <>
                    <PicksTable picks={bearishPicks.slice((stockPage - 1) * 10, stockPage * 10)} isBearish={true} setSelectedNews={setSelectedNews} watchlist={watchlistStocks} onToggleWatchlist={handleToggleStockWatchlist} />
                    {renderPagination(stockPage, bearishPicks.length, 10, setStockPage)}
                  </>
                )}
                {activeSection === 'commodities' && <CommoditiesSection refreshTrigger={refreshTrigger} setSelectedNews={setSelectedNews} watchlist={watchlistCommodities} onToggleWatchlist={handleToggleCommodityWatchlist} />}
                {activeSection === 'watchlist' && (
                  <div className="flex flex-col gap-6">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <Star className="w-4.5 h-4.5 text-yellow-400 fill-yellow-400" /> Watchlisted Stocks
                      </h3>
                      {watchlistStocks.length === 0 ? (
                        <div className="p-8 text-center text-zinc-500 border border-white/5 bg-white/5 rounded-xl text-sm">
                          No watchlisted stocks yet. Star a stock ticker to add it.
                        </div>
                      ) : (
                        <>
                          <PicksTable 
                            picks={watchlistedStocksFiltered.slice((stockPage - 1) * 10, stockPage * 10)} 
                            isBearish={false} 
                            setSelectedNews={setSelectedNews}
                            watchlist={watchlistStocks}
                            onToggleWatchlist={handleToggleStockWatchlist}
                          />
                          {renderPagination(stockPage, watchlistedStocksFiltered.length, 10, setStockPage)}
                        </>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <Star className="w-4.5 h-4.5 text-yellow-400 fill-yellow-400" /> Watchlisted Commodities
                      </h3>
                      {watchlistCommodities.length === 0 ? (
                        <div className="p-8 text-center text-zinc-500 border border-white/5 bg-white/5 rounded-xl text-sm">
                          No watchlisted commodities yet. Star a commodity to add it.
                        </div>
                      ) : (
                        <CommoditiesSection 
                          refreshTrigger={refreshTrigger} 
                          setSelectedNews={setSelectedNews}
                          watchlist={watchlistCommodities}
                          onToggleWatchlist={handleToggleCommodityWatchlist}
                          watchlistOnly={true}
                        />
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })()}

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
                {art.source} • {new Date(art.published_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(art.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
