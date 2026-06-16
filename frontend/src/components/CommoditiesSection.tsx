"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Info, Activity, AlertTriangle, Star } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface CommodityData {
  name: string;
  current_price: number;
  change: string;
  change_pct: string;
  trend: string;
  catalyst: string;
  prediction: string;
}

export default function CommoditiesSection({ 
  refreshTrigger, 
  setSelectedNews,
  watchlist = [],
  onToggleWatchlist,
  watchlistOnly = false
}: { 
  refreshTrigger?: number;
  setSelectedNews: (news: { ticker: string; news: string } | null) => void;
  watchlist?: string[];
  onToggleWatchlist?: (key: string) => void;
  watchlistOnly?: boolean;
}) {
  const [data, setData] = useState<Record<string, CommodityData> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      const isBypass = document.cookie.includes('bypass_auth=true');
      const token = isBypass ? "server_bypass_token" : session?.access_token;
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      try {
        const res = await fetch(`${baseUrl}/api/commodities?t=${Date.now()}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          cache: 'no-store'
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to fetch commodities", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-3 text-zinc-400">
        <Activity className="w-8 h-8 text-yellow-500 animate-spin" />
        <p className="text-sm font-semibold">Syncing latest macro commodities...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-3 text-zinc-500 border border-white/5 bg-white/5 rounded-xl text-center">
        <AlertTriangle className="w-6 h-6 text-yellow-500/50" />
        <p className="text-sm">No commodity data available.</p>
      </div>
    );
  }

  let commodities = Object.entries(data).map(([key, value]) => ({
    key,
    ...value
  }));

  if (watchlistOnly) {
    commodities = commodities.filter(c => watchlist.includes(c.key));
  }

  return (
    <div className="w-full flex flex-col mt-4">
      {/* Desktop view */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-[11px] font-extrabold uppercase tracking-wider text-zinc-400">
              <th className="p-4 font-semibold w-1/4">Commodity</th>
              <th className="p-4 font-semibold">Trend</th>
              <th className="p-4 font-semibold">Live Rate</th>
              <th className="p-4 font-semibold">AI Prediction Target</th>
              <th className="p-4 font-semibold text-right">Catalyst Engine</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {commodities.map((c) => {
              const isBullish = c.trend === "bullish";
              const trendClass = isBullish 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                : "bg-red-500/10 text-red-400 border border-red-500/20";
              const valueClass = isBullish ? "text-emerald-400" : "text-red-400";
              
              return (
                <tr key={c.key} className="transition-colors hover:bg-white/5 group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center border border-white/10 ${isBullish ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20' : 'bg-gradient-to-br from-red-500/20 to-orange-500/20'}`}>
                        <Activity className={`w-5 h-5 ${isBullish ? 'text-green-400' : 'text-red-400'}`} />
                      </div>
                      <div>
                        <div className="font-bold text-base text-white flex items-center gap-1.5">
                          <span>{c.name.split(" (")[0]}</span>
                          {onToggleWatchlist && (
                            <button
                              onClick={(e) => { e.stopPropagation(); onToggleWatchlist(c.key); }}
                              className="focus:outline-none p-1 rounded-full hover:bg-white/10 transition-colors"
                              title={watchlist.includes(c.key) ? "Remove from Watchlist" : "Add to Watchlist"}
                            >
                              <Star
                                size={16}
                                className={watchlist.includes(c.key) ? "fill-yellow-400 text-yellow-400" : "text-zinc-500 hover:text-yellow-400 transition-colors"}
                              />
                            </button>
                          )}
                        </div>
                        <div className="text-xs text-zinc-500">{c.name.includes(" (") ? c.name.split(" (")[1].replace(")", "") : ""}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${trendClass}`}>
                      {isBullish ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {c.trend.toUpperCase()}
                    </span>
                  </td>

                  <td className="p-4 font-mono">
                    <div className="text-white font-bold text-sm">
                      ₹{c.current_price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className={`text-xs ${valueClass} font-semibold flex items-center gap-0.5`}>
                      {c.change.startsWith("+") || c.change.startsWith("-") ? "" : (isBullish ? "+" : "-")}
                      {c.change} ({c.change_pct})
                    </div>
                  </td>

                  <td className="p-4">
                    <p className={`text-sm ${valueClass} font-medium max-w-md`}>
                      {c.prediction}
                    </p>
                  </td>

                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedNews({ ticker: c.name.split(" (")[0], news: c.catalyst })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg text-xs font-semibold transition-colors hover:bg-cyan-500/20"
                    >
                      <Info className="w-4 h-4" />
                      View Catalyst
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card view */}
      <div className="block md:hidden space-y-1.5">
        {commodities.map((c) => {
          const isBullish = c.trend === "bullish";
          const trendClass = isBullish 
            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
            : "bg-red-500/10 text-red-400 border border-red-500/20";
          const valueClass = isBullish ? "text-emerald-400" : "text-red-400";
          
          return (
            <div key={c.key} className={`p-2.5 rounded-xl flex flex-col gap-1.5 border transition-all ${isBullish ? 'border-emerald-500/25 shadow-[2px_3px_0px_rgba(16,185,129,0.12)] bg-gradient-to-br from-zinc-900/90 to-emerald-950/15' : 'border-red-500/25 shadow-[2px_3px_0px_rgba(239,68,68,0.12)] bg-gradient-to-br from-zinc-900/90 to-red-950/15'}`}>
              {/* Header */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center border border-white/10 ${isBullish ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20' : 'bg-gradient-to-br from-red-500/20 to-orange-500/20'}`}>
                    <Activity className={`w-3.5 h-3.5 ${isBullish ? 'text-green-400' : 'text-red-400'}`} />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white leading-tight flex items-center gap-1">
                      <span>{c.name.split(" (")[0]}</span>
                      {onToggleWatchlist && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onToggleWatchlist(c.key); }}
                          className="focus:outline-none p-0.5"
                        >
                          <Star
                            size={11}
                            className={watchlist.includes(c.key) ? "fill-yellow-400 text-yellow-400" : "text-zinc-500"}
                          />
                        </button>
                      )}
                    </div>
                    <div className="text-[9px] text-zinc-500 leading-none">{c.name.includes(" (") ? c.name.split(" (")[1].replace(")", "") : ""}</div>
                  </div>
                </div>

                <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-semibold ${trendClass}`}>
                  {isBullish ? <TrendingUp className="w-2 h-2" /> : <TrendingDown className="w-2 h-2" />}
                  {c.trend.toUpperCase()}
                </span>
              </div>

              {/* Catalyst Button */}
              <div className="bg-black/20 p-2 rounded-md border border-white/5">
                <button
                  onClick={() => setSelectedNews({ ticker: c.name.split(" (")[0], news: c.catalyst })}
                  className="text-left w-full group/btn"
                >
                  <div className="text-[10px] text-zinc-300 group-hover/btn:text-cyan-400 transition-colors flex items-start gap-1">
                    <Info className="w-3 h-3 shrink-0 text-cyan-400 mt-0.5" />
                    <div className="line-clamp-2 leading-normal">
                      {c.catalyst}
                    </div>
                  </div>
                </button>
              </div>

              {/* Price & Prediction Stack (100% horizontal space) */}
              <div className="flex flex-col gap-1.5 mt-0.5">
                <div className="bg-white/5 p-2 rounded border border-white/5 flex justify-between items-center">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-zinc-500 text-[8px] uppercase font-bold tracking-wider leading-none">Live Rate</span>
                    <div className="text-white font-bold text-xs mt-0.5">
                      ₹{c.current_price.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                    </div>
                  </div>
                  <div className={`text-[10px] ${valueClass} font-bold font-mono`}>
                    {c.change.startsWith("+") || c.change.startsWith("-") ? "" : (isBullish ? "+" : "-")}
                    {c.change} ({c.change_pct})
                  </div>
                </div>

                <div className="bg-white/5 p-2 rounded border border-white/5 flex flex-col gap-1">
                  <span className="text-zinc-500 text-[8px] uppercase font-bold tracking-wider leading-none">AI Prediction Target</span>
                  <p className={`text-[10px] leading-relaxed font-medium ${valueClass}`}>
                    {c.prediction}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
