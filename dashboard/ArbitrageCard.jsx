import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, ArrowRight, Zap } from 'lucide-react';

const opportunities = [
  { route: 'USDT → ZAR EFT', source: 'Binance P2P', dest: 'FNB EFT', spread: '2.8%', volume: 'R 1,250,000', time: 'Live', hot: true },
  { route: 'USDT → AED', source: 'SA Ramp', dest: 'DXB OTC Desk', spread: '3.2%', volume: 'R 2,480,000', time: 'Live', hot: true },
  { route: 'BTC → USDT', source: 'Luno SA', dest: 'Binance', spread: '1.5%', volume: 'R 890,000', time: '12 min ago', hot: false },
  { route: 'ZAR → USDT → AED', source: 'Standard Bank', dest: 'DXB Exchange', spread: '4.1%', volume: 'R 3,800,000', time: 'Live', hot: true },
  { route: 'USDT → GBP', source: 'Valr', dest: 'Kraken', spread: '1.9%', volume: 'R 650,000', time: '8 min ago', hot: false },
];

export default function ArbitrageCard() {
  return (
    <Card className="bg-card border-border h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" /> Arbitrage Opportunities
          </CardTitle>
          <Badge className="bg-amber-500/15 text-amber-400 text-[10px] border-0">{opportunities.filter(o => o.hot).length} active</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {opportunities.map((opp, i) => (
          <div key={i} className={`rounded-md p-2.5 border transition-colors ${
            opp.hot ? 'border-amber-500/20 bg-amber-500/[0.03] hover:bg-amber-500/[0.06]' : 'border-border hover:bg-secondary/30'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] font-medium text-foreground">{opp.route}</span>
              <div className="flex items-center gap-1.5">
                {opp.hot && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                  </span>
                )}
                <span className={`text-[11px] font-bold font-mono ${opp.hot ? 'text-amber-400' : 'text-primary'}`}>{opp.spread}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span>{opp.source}</span>
              <ArrowRight className="w-2.5 h-2.5" />
              <span>{opp.dest}</span>
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[10px] font-mono text-foreground/70">{opp.volume}</span>
              <span className="text-[10px] text-muted-foreground">{opp.time}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}