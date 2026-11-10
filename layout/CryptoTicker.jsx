import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';

const ZAR_RATE = 18.35;

const BASE_PRICES = [
  { symbol: 'BTC', price: 104500, change_24h: 2.34 },
  { symbol: 'ETH', price: 3450, change_24h: -1.12 },
  { symbol: 'USDT', price: 1.00, change_24h: 0.01 },
  { symbol: 'SOL', price: 178, change_24h: 4.56 },
  { symbol: 'XRP', price: 2.45, change_24h: -0.87 },
  { symbol: 'BNB', price: 680, change_24h: 1.23 },
  { symbol: 'ADA', price: 0.72, change_24h: -2.15 },
  { symbol: 'DOGE', price: 0.18, change_24h: 3.41 },
  { symbol: 'ZAR/USD', price: 1 / ZAR_RATE, change_24h: -0.32 },
  { symbol: 'USDT/ZAR', price: ZAR_RATE, change_24h: 0.28 },
];

const wiggle = (base, pct) => {
  const max = base * (pct / 100);
  return base + (Math.random() - 0.5) * max * 2;
};

export default function CryptoTicker() {
  const [prices, setPrices] = useState(BASE_PRICES);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setPrices(prev => prev.map(p => ({
        ...p,
        price: wiggle(p.price, p.symbol === 'USDT' || p.symbol === 'USDT/ZAR' ? 0.02 : 0.8),
        change_24h: wiggle(p.change_24h, 0.5),
      })));
    }, 3000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const tickerItems = [...prices, ...prices];
  const isFiat = (s) => s.includes('/');

  return (
    <div className="h-9 bg-card border-b border-border overflow-hidden relative">
      <div className="absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-card to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-card to-transparent z-10 pointer-events-none" />
      <div className="flex items-center h-full ticker-animate whitespace-nowrap pl-8">
        {tickerItems.map((coin, i) => {
          const change = Number(coin.change_24h);
          const displayPrice = isFiat(coin.symbol)
            ? `R ${coin.price?.toFixed(4)}`
            : `$ ${coin.price?.toLocaleString(undefined, { minimumFractionDigits: coin.price < 1 ? 4 : 2, maximumFractionDigits: coin.price < 1 ? 4 : 2 })}`;
          return (
            <div key={i} className="flex items-center gap-2 px-5 border-r border-border/40">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isFiat(coin.symbol) ? 'text-amber-400' : 'text-foreground'}`}>
                {coin.symbol}
              </span>
              <span className="text-[11px] font-mono text-foreground/80">
                {displayPrice}
              </span>
              <span className={`text-[10px] font-mono flex items-center gap-0.5 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(change).toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}