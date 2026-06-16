import { Activity, TrendingUp, TrendingDown, IndianRupee, DollarSign, AlertTriangle, Info, ArrowUpDown, ArrowUp, ArrowDown, Star } from "lucide-react";
import { useState } from "react";

interface Pick {
  id?: string;
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

export default function PicksTable({ 
  picks, 
  isBearish, 
  setSelectedNews,
  watchlist = [],
  onToggleWatchlist
}: { 
  picks: Pick[], 
  isBearish: boolean, 
  setSelectedNews: (news: {ticker: string, news: string}) => void,
  watchlist?: string[],
  onToggleWatchlist?: (ticker: string) => void
}) {
  type SortColumn = 'name' | 'conviction' | 'margin' | null;
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (col: SortColumn) => {
    if (sortColumn === col) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(col);
      setSortDirection('desc');
    }
  };

  const getConvictionWeight = (c: string) => {
    const lower = c.toLowerCase();
    if (lower === 'high') return 3;
    if (lower === 'medium') return 2;
    return 1;
  };

  const sortedPicks = [...picks].sort((a, b) => {
    if (!sortColumn) return 0;
    
    let comparison = 0;
    if (sortColumn === 'name') {
      comparison = a.ticker.localeCompare(b.ticker);
    } else if (sortColumn === 'conviction') {
      comparison = getConvictionWeight(a.directional_conviction) - getConvictionWeight(b.directional_conviction);
    } else if (sortColumn === 'margin') {
      comparison = Math.abs(a.expected_margin_low) - Math.abs(b.expected_margin_low);
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-100" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />;
  };
  const getCurrencySymbol = (exchange: string) => {
    return ["NSE", "BSE"].includes(exchange.toUpperCase()) ? "₹" : "$";
  };
  
  const getCurrencyIcon = (exchange: string) => {
    return ["NSE", "BSE"].includes(exchange.toUpperCase()) 
      ? <IndianRupee className="w-5 h-5 text-green-400" />
      : <DollarSign className="w-5 h-5 text-blue-400" />;
  };

  const calculateAbsoluteMargin = (price: number, percentage: number) => {
    return (price * (Math.abs(percentage) / 100)).toFixed(2);
  };

  const themeConfig = {
    bg: isBearish ? "bg-red-950/10 border-red-900/30" : "bg-white/5 border-white/10",
    headerBg: isBearish ? "bg-red-950/40 border-red-900/30" : "bg-black/40 border-white/10",
    textPrimary: isBearish ? "text-red-400" : "text-emerald-400",
    textSecondary: isBearish ? "text-red-500/70" : "text-emerald-500/70",
    iconBg: isBearish ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    rowHover: isBearish ? "hover:bg-red-900/10" : "hover:bg-white/5",
    sign: isBearish ? "" : "+"
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Desktop Table View */}
      <div className={`hidden md:block border rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl ${themeConfig.bg}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-xs uppercase tracking-wider text-zinc-400 ${themeConfig.headerBg}`}>
                <th className="p-4 font-semibold cursor-pointer hover:bg-white/5 transition-colors group" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1.5">Asset <SortIcon column="name" /></div>
                </th>
                <th className="p-4 font-semibold w-1/4">Catalyst Engine</th>
                <th className="p-4 font-semibold cursor-pointer hover:bg-white/5 transition-colors group" onClick={() => handleSort('conviction')}>
                  <div className="flex items-center gap-1.5">Conviction <SortIcon column="conviction" /></div>
                </th>
                <th className="p-4 font-semibold">Price Context</th>
                <th className="p-4 font-semibold cursor-pointer hover:bg-white/5 transition-colors group" onClick={() => handleSort('margin')}>
                  <div className="flex items-center gap-1.5">Target Margin <SortIcon column="margin" /></div>
                </th>
                <th className="p-4 font-semibold text-right">Stop-Loss (ATR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedPicks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <AlertTriangle className="w-8 h-8 text-yellow-500/50" />
                      <p>No predictions available.</p>
                    </div>
                  </td>
                </tr>
              ) : sortedPicks.map((pick, i) => {
                const sym = getCurrencySymbol(pick.exchange);
                const openPrice = pick.predictive_open || pick.ltp || 0;
                
                return (
                  <tr key={i} className={`transition-colors group ${themeConfig.rowHover}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center border border-white/10 ${isBearish ? 'bg-gradient-to-br from-red-500/20 to-orange-500/20' : (sym === '₹' ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20' : 'bg-gradient-to-br from-blue-500/20 to-purple-500/20')}`}>
                          {getCurrencyIcon(pick.exchange)}
                        </div>
                        <div>
                          <div className="font-bold text-lg text-white flex items-center gap-1.5">
                            <span>{pick.ticker}</span>
                            {onToggleWatchlist && (
                              <button
                                onClick={(e) => { e.stopPropagation(); onToggleWatchlist(pick.ticker); }}
                                className="focus:outline-none p-1 rounded-full hover:bg-white/10 transition-colors"
                                title={watchlist.includes(pick.ticker) ? "Remove from Watchlist" : "Add to Watchlist"}
                              >
                                <Star
                                  size={16}
                                  className={watchlist.includes(pick.ticker) ? "fill-yellow-400 text-yellow-400" : "text-zinc-500 hover:text-yellow-400 transition-colors"}
                                />
                              </button>
                            )}
                          </div>
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
                          ? themeConfig.iconBg
                          : pick.directional_conviction.toLowerCase() === 'medium'
                          ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                      }`}>
                        {pick.directional_conviction.toLowerCase() === 'high' && (isBearish ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />)}
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
                        <div className={`${themeConfig.textPrimary} font-bold flex items-center gap-2`}>
                          <span>{themeConfig.sign}{pick.expected_margin_low}%</span>
                          <span className="text-zinc-600">→</span>
                          <span>{themeConfig.sign}{pick.expected_margin_high}%</span>
                        </div>
                        {openPrice > 0 && (
                          <div className={`${themeConfig.textSecondary} text-xs`}>
                            {isBearish ? "-" : "+"}{sym}{calculateAbsoluteMargin(openPrice, pick.expected_margin_low)} to {isBearish ? "-" : "+"}{sym}{calculateAbsoluteMargin(openPrice, pick.expected_margin_high)}
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
                            Trigger: {sym}{(isBearish ? openPrice + pick.stop_loss_atr : openPrice - pick.stop_loss_atr).toFixed(2)}
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

      <div className="block md:hidden space-y-1.5">
        {sortedPicks.length === 0 ? (
          <div className={`flex flex-col items-center justify-center gap-2 p-6 border rounded-lg ${themeConfig.bg}`}>
            <AlertTriangle className="w-5 h-5 text-yellow-500/50" />
            <p className="text-zinc-500 text-xs">No predictions available.</p>
          </div>
        ) : (
          sortedPicks.map((pick, i) => {
            const sym = getCurrencySymbol(pick.exchange);
            const openPrice = pick.predictive_open || pick.ltp || 0;
            
            return (
              <div key={i} className={`p-2.5 rounded-xl flex flex-col gap-1.5 border transition-all ${isBearish ? 'border-red-500/25 shadow-[2px_3px_0px_rgba(239,68,68,0.12)] bg-gradient-to-br from-zinc-900/90 to-red-950/15' : (sym === '₹' ? 'border-emerald-500/25 shadow-[2px_3px_0px_rgba(16,185,129,0.12)] bg-gradient-to-br from-zinc-900/90 to-emerald-950/15' : 'border-blue-500/25 shadow-[2px_3px_0px_rgba(59,130,246,0.12)] bg-gradient-to-br from-zinc-900/90 to-blue-950/15')}`}>
                {/* Header Info */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center border border-white/10 ${isBearish ? 'bg-gradient-to-br from-red-500/20 to-orange-500/20' : (sym === '₹' ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20' : 'bg-gradient-to-br from-blue-500/20 to-purple-500/20')}`}>
                      {["NSE", "BSE"].includes(pick.exchange.toUpperCase()) 
                        ? <IndianRupee className="w-3 h-3 text-green-400" />
                        : <DollarSign className="w-3 h-3 text-blue-400" />}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white leading-tight flex items-center gap-1">
                        <span>{pick.ticker}</span>
                        {onToggleWatchlist && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onToggleWatchlist(pick.ticker); }}
                            className="focus:outline-none p-0.5"
                          >
                            <Star
                              size={11}
                              className={watchlist.includes(pick.ticker) ? "fill-yellow-400 text-yellow-400" : "text-zinc-500"}
                            />
                          </button>
                        )}
                      </div>
                      <div className="text-[9px] text-zinc-500 leading-none">{pick.exchange}</div>
                    </div>
                  </div>
 
                  <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-semibold ${
                    pick.directional_conviction.toLowerCase() === 'high' 
                      ? themeConfig.iconBg
                      : pick.directional_conviction.toLowerCase() === 'medium'
                      ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                  }`}>
                    {pick.directional_conviction.toLowerCase() === 'high' && (isBearish ? <TrendingDown className="w-2 h-2" /> : <TrendingUp className="w-2 h-2" />)}
                    {pick.directional_conviction}
                  </span>
                </div>
 
                {/* Catalyst News Button */}
                <div className="bg-black/20 p-2 rounded-md border border-white/5">
                  <button 
                    onClick={() => setSelectedNews({ ticker: pick.ticker, news: pick.full_news || pick.catalyst_core })}
                    className="text-left w-full group/btn"
                  >
                    <div className="text-[10px] text-zinc-300 group-hover/btn:text-cyan-400 transition-colors flex items-start gap-1">
                      <Info className="w-3 h-3 shrink-0 text-cyan-400 mt-0.5" />
                      <div className="line-clamp-2 leading-normal">
                        {pick.catalyst_core}
                      </div>
                    </div>
                  </button>
                </div>
 
                {/* Value Metrics Grid (Optimized mobile width split for readability) */}
                <div className="grid grid-cols-[1.35fr_0.825fr_0.825fr] gap-1 mt-0.5">
                  <div className="bg-white/5 p-1.5 rounded border border-white/5 flex flex-col gap-0.5 justify-center">
                    <span className="text-zinc-500 text-[7px] uppercase font-bold tracking-wider leading-none">Price</span>
                    <div className="flex flex-col text-[10px] font-mono leading-normal mt-0.5">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400">LTP:</span>
                        <span className="text-white font-bold text-[10.5px]">{pick.ltp ? `${sym}${pick.ltp.toFixed(1)}` : '---'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-blue-400">Open:</span>
                        <span className="text-blue-400 font-bold text-[10.5px]">{pick.predictive_open ? `${sym}${pick.predictive_open.toFixed(1)}` : '---'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 p-1 px-0.5 rounded border border-white/5 flex flex-col gap-0.5 text-center justify-center">
                    <span className="text-zinc-500 text-[7px] uppercase font-bold tracking-wider leading-none">Stop-Loss</span>
                    <div className="flex flex-col items-center font-mono leading-none mt-1">
                      <div className="text-red-400 font-bold bg-red-500/10 px-1 py-0.5 rounded border border-red-500/20 text-[8.5px] leading-none">
                        {pick.stop_loss_atr ? `${sym}${pick.stop_loss_atr.toFixed(1)}` : "N/A"}
                      </div>
                      {openPrice > 0 && pick.stop_loss_atr && (
                        <div className="text-zinc-500 text-[7.5px] leading-none mt-1 truncate max-w-full">
                          Tr:{(isBearish ? openPrice + pick.stop_loss_atr : openPrice - pick.stop_loss_atr).toFixed(1)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white/5 p-1 px-0.5 rounded border border-white/5 flex flex-col gap-0.5 text-center justify-center">
                    <span className="text-zinc-500 text-[7px] uppercase font-bold tracking-wider leading-none">Margin</span>
                    <div className="flex flex-col font-mono leading-none mt-1">
                      <div className={`${themeConfig.textPrimary} font-bold text-[8.5px] leading-none`}>
                        {themeConfig.sign}{pick.expected_margin_low}%-{pick.expected_margin_high}%
                      </div>
                      {openPrice > 0 && (
                        <div className={`${themeConfig.textSecondary} text-[7.5px] leading-none mt-1 truncate max-w-full`}>
                          {isBearish ? "-" : "+"}{sym}{calculateAbsoluteMargin(openPrice, pick.expected_margin_low)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
