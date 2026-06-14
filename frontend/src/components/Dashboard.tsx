"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Activity, TrendingUp, DollarSign, IndianRupee, AlertTriangle, Globe, MapPin, Clock, Info, X } from "lucide-react";

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

export default function Dashboard() {
  const [picks, setPicks] = useState<Pick[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [timeframe, setTimeframe] = useState("7W");
  const [region, setRegion] = useState("ALL");
  const [selectedNews, setSelectedNews] = useState<{ticker: string, news: string} | null>(null);

  useEffect(() => {
    // Fetch picks based on filters
    const fetchPicks = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${baseUrl}/api/picks?region=${region}&timeframe=${timeframe}`);
        const data = await res.json();
        setPicks(data);
      } catch (err) {
        console.error("Error fetching picks:", err);
      }
    };
    
    fetchPicks();
  }, [region, timeframe]);

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const s = io(baseUrl, {
      transports: ["websocket", "polling"]
    });
    setSocket(s);

    s.on("connect", () => setIsConnected(true));
    s.on("disconnect", () => setIsConnected(false));

    s.on("market_update", (tick: { ticker: string, ltp: number }) => {
      setPicks(current => current.map(p => p.ticker === tick.ticker ? { ...p, ltp: tick.ltp } : p));
    });

    return () => {
      s.disconnect();
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
            {['1D', '1W', '1M', '7W'].map(t => (
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

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/40 text-xs uppercase tracking-wider text-zinc-400">
                <th className="p-4 font-semibold">Asset</th>
                <th className="p-4 font-semibold w-1/4">Catalyst Engine</th>
                <th className="p-4 font-semibold">Conviction</th>
                <th className="p-4 font-semibold">Price Context</th>
                <th className="p-4 font-semibold">Target Margin</th>
                <th className="p-4 font-semibold text-right">Stop-Loss (ATR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {picks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <AlertTriangle className="w-8 h-8 text-yellow-500/50" />
                      <p>No predictions available for the selected filters.</p>
                    </div>
                  </td>
                </tr>
              ) : picks.map((pick, i) => {
                const sym = getCurrencySymbol(pick.exchange);
                const openPrice = pick.predictive_open || pick.ltp || 0;
                
                return (
                  <tr key={i} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center border border-white/10 ${sym === '₹' ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20' : 'bg-gradient-to-br from-blue-500/20 to-purple-500/20'}`}>
                          {getCurrencyIcon(pick.exchange)}
                        </div>
                        <div>
                          <div className="font-bold text-lg text-white">{pick.ticker}</div>
                          <div className="text-xs text-zinc-500">{pick.exchange}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <button 
                        onClick={() => setSelectedNews({ ticker: pick.ticker, news: pick.full_news || pick.catalyst_core })}
                        className="text-left group/btn"
                      >
                        <div className="text-sm text-zinc-300 line-clamp-2 max-w-sm group-hover/btn:text-cyan-400 transition-colors cursor-pointer flex items-start gap-2">
                          <Info className="w-4 h-4 shrink-0 mt-0.5 opacity-50 group-hover/btn:opacity-100" />
                          {pick.catalyst_core}
                        </div>
                      </button>
                    </td>

                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        pick.directional_conviction.toLowerCase() === 'high' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : pick.directional_conviction.toLowerCase() === 'medium'
                          ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                      }`}>
                        {pick.directional_conviction.toLowerCase() === 'high' && <TrendingUp className="w-3 h-3" />}
                        {pick.directional_conviction}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-col gap-1 font-mono text-sm">
                        <div className="flex items-center gap-2 text-zinc-400">
                          <span className="w-12">LTP:</span> 
                          <span className="text-white">
                            {pick.ltp ? `${sym}${pick.ltp.toFixed(2)}` : '---'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-400">
                          <span className="w-12 text-blue-400">Open:</span> 
                          <span className="text-blue-400 font-bold">
                            {pick.predictive_open ? `${sym}${pick.predictive_open.toFixed(2)}` : '---'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-col gap-1 text-sm font-mono">
                        <div className="text-emerald-400 font-bold flex items-center gap-2">
                          <span>+{pick.expected_margin_low}%</span>
                          <span className="text-zinc-600">→</span>
                          <span>+{pick.expected_margin_high}%</span>
                        </div>
                        {openPrice > 0 && (
                          <div className="text-emerald-500/70 text-xs">
                            +{sym}{calculateAbsoluteMargin(openPrice, pick.expected_margin_low)} to +{sym}{calculateAbsoluteMargin(openPrice, pick.expected_margin_high)}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex flex-col items-end gap-1 font-mono text-sm">
                        <div className="text-red-400 font-bold bg-red-500/10 inline-block px-3 py-1 rounded border border-red-500/20">
                          {pick.stop_loss_atr ? `${sym}${pick.stop_loss_atr.toFixed(2)}` : "N/A"}
                        </div>
                        {openPrice > 0 && pick.stop_loss_atr && (
                          <div className="text-zinc-500 text-xs mt-1">
                            Trigger: {sym}{(openPrice - pick.stop_loss_atr).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List View */}
      <div className="block md:hidden space-y-4">
        {picks.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-12 bg-white/5 border border-white/10 rounded-2xl">
            <AlertTriangle className="w-8 h-8 text-yellow-500/50" />
            <p className="text-zinc-500 text-sm">No predictions available for the selected filters.</p>
          </div>
        ) : (
          picks.map((pick, i) => {
            const sym = getCurrencySymbol(pick.exchange);
            const openPrice = pick.predictive_open || pick.ltp || 0;
            
            return (
              <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col gap-4 shadow-xl backdrop-blur-md">
                {/* Header Info */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center border border-white/10 ${sym === '₹' ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20' : 'bg-gradient-to-br from-blue-500/20 to-purple-500/20'}`}>
                      {getCurrencyIcon(pick.exchange)}
                    </div>
                    <div>
                      <div className="font-bold text-lg text-white">{pick.ticker}</div>
                      <div className="text-xs text-zinc-500">{pick.exchange}</div>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    pick.directional_conviction.toLowerCase() === 'high' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : pick.directional_conviction.toLowerCase() === 'medium'
                      ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                  }`}>
                    {pick.directional_conviction.toLowerCase() === 'high' && <TrendingUp className="w-3 h-3" />}
                    {pick.directional_conviction}
                  </span>
                </div>

                {/* Catalyst News Button */}
                <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                  <button 
                    onClick={() => setSelectedNews({ ticker: pick.ticker, news: pick.full_news || pick.catalyst_core })}
                    className="text-left w-full group/btn"
                  >
                    <div className="text-xs text-zinc-300 group-hover/btn:text-cyan-400 transition-colors flex items-start gap-2">
                      <Info className="w-4 h-4 shrink-0 text-cyan-400 mt-0.5" />
                      <div className="line-clamp-2 leading-relaxed">
                        {pick.catalyst_core}
                      </div>
                    </div>
                  </button>
                </div>

                {/* Value Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col gap-1.5">
                    <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Price Context</span>
                    <div className="flex flex-col gap-1 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">LTP:</span>
                        <span className="text-white font-bold">{pick.ltp ? `${sym}${pick.ltp.toFixed(2)}` : '---'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-400">Open:</span>
                        <span className="text-blue-400 font-bold">{pick.predictive_open ? `${sym}${pick.predictive_open.toFixed(2)}` : '---'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col gap-1.5">
                    <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Stop-Loss (ATR)</span>
                    <div className="flex flex-col items-start gap-1 text-xs font-mono">
                      <div className="text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                        {pick.stop_loss_atr ? `${sym}${pick.stop_loss_atr.toFixed(2)}` : "N/A"}
                      </div>
                      {openPrice > 0 && pick.stop_loss_atr && (
                        <div className="text-zinc-500 text-[9px]">
                          Trig: {sym}{(openPrice - pick.stop_loss_atr).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col gap-1">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Target Margin</span>
                  <div className="flex items-center justify-between font-mono">
                    <div className="text-emerald-400 font-bold text-sm">
                      +{pick.expected_margin_low}% <span className="text-zinc-500">→</span> +{pick.expected_margin_high}%
                    </div>
                    {openPrice > 0 && (
                      <div className="text-emerald-500/70 text-xs">
                        +{sym}{calculateAbsoluteMargin(openPrice, pick.expected_margin_low)} to +{sym}{calculateAbsoluteMargin(openPrice, pick.expected_margin_high)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
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
