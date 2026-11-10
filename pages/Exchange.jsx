import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, TrendingUp, Calculator, ArrowRight, RefreshCw } from 'lucide-react';

const EXCHANGES = [
  { id: 'valr', name: 'Valr', url: 'https://www.valr.com', defaultRate: 18.52 },
  { id: 'luno', name: 'Luno', url: 'https://www.luno.com', defaultRate: 18.61 },
  { id: 'ovex', name: 'OVEX', url: 'https://www.ovex.io', defaultRate: 18.48 },
  { id: 'binance', name: 'Binance', url: 'https://www.binance.com', defaultRate: 18.45 },
  { id: 'kraken', name: 'Kraken', url: 'https://www.kraken.com', defaultRate: 18.43 },
];

export default function Exchange() {
  const [zarAmount, setZarAmount] = useState(100000);
  const [rates, setRates] = useState(() => Object.fromEntries(EXCHANGES.map(e => [e.id, e.defaultRate])));
  const [results, setResults] = useState(null);

  const calculate = () => {
    const validRates = EXCHANGES.filter(e => rates[e.id] && parseFloat(rates[e.id]) > 0)
      .map(e => ({ ...e, rate: parseFloat(rates[e.id]), usdt: zarAmount / parseFloat(rates[e.id]) }));

    if (validRates.length < 2) return;

    const sorted = [...validRates].sort((a, b) => b.rate - a.rate);
    const best = sorted[sorted.length - 1]; // lowest rate = most USDT per ZAR
    const worst = sorted[0]; // highest rate = least USDT

    const spread = ((worst.rate - best.rate) / best.rate) * 100;
    const profitUsdt = zarAmount / best.rate - zarAmount / worst.rate;
    const profitZar = profitUsdt * worst.rate;

    setResults({ sorted, best, worst, spread, profitUsdt, profitZar, zarAmount });
  };

  const refreshRates = () => {
    const newRates = {};
    EXCHANGES.forEach(e => {
      const base = e.defaultRate;
      newRates[e.id] = (base + (Math.random() - 0.5) * 0.3).toFixed(2);
    });
    setRates(newRates);
    setResults(null);
  };

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Arbitrage Calculator</h1>
          <p className="text-sm text-muted-foreground mt-1">Find the best buy/sell spread across exchanges</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs">BETA</Badge>
          <Button variant="outline" size="sm" onClick={refreshRates}><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Refresh Rates</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input panel */}
        <Card className="bg-card border-border">
          <CardContent className="p-6 space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium">ZAR Amount</Label>
              <Input
                type="number"
                value={zarAmount}
                onChange={e => setZarAmount(parseFloat(e.target.value) || 0)}
                className="font-mono text-lg h-11"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">USDT/ZAR Rates per Exchange</Label>
              {EXCHANGES.map(e => (
                <div key={e.id} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground w-16 shrink-0">{e.name}</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={rates[e.id]}
                    onChange={ev => setRates(p => ({ ...p, [e.id]: ev.target.value }))}
                    className="font-mono flex-1"
                    placeholder="18.50"
                  />
                  <a href={e.url} target="_blank" rel="noreferrer">
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </a>
                </div>
              ))}
            </div>

            <Button onClick={calculate} className="w-full bg-primary text-primary-foreground h-11">
              <Calculator className="w-4 h-4 mr-2" /> Calculate Arbitrage
            </Button>
          </CardContent>
        </Card>

        {/* Results panel */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!results ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Calculator className="w-10 h-10 text-muted-foreground mb-3 opacity-40" />
                <p className="text-sm text-muted-foreground">Enter ZAR amount and at least 2 exchange rates to calculate</p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Best route */}
                <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                  <p className="text-xs text-green-400 uppercase tracking-wider mb-2 font-medium">Best Opportunity</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">Buy on {results.best.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Sell on {results.worst.name}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Spread</p>
                      <p className="text-lg font-mono font-bold text-primary">{results.spread.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Profit USDT</p>
                      <p className="text-lg font-mono font-bold text-green-400">{results.profitUsdt.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Profit ZAR</p>
                      <p className="text-lg font-mono font-bold text-green-400">R{Number(results.profitZar.toFixed(0)).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Rate table */}
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Rate Comparison</p>
                  <div className="space-y-1.5">
                    {results.sorted.map((ex, i) => (
                      <div key={ex.id} className={`flex items-center justify-between p-2.5 rounded-lg ${i === results.sorted.length - 1 ? 'bg-green-500/10 border border-green-500/20' : 'bg-muted/30'}`}>
                        <div className="flex items-center gap-2">
                          {i === results.sorted.length - 1 && <Badge className="bg-green-500/20 text-green-400 text-[10px]">BEST</Badge>}
                          {i === 0 && <Badge className="bg-red-500/20 text-red-400 text-[10px]">HIGH</Badge>}
                          <span className="text-sm font-medium text-foreground">{ex.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-mono text-foreground">{ex.rate.toFixed(2)}</p>
                          <p className="text-[10px] text-muted-foreground">{ex.usdt.toFixed(2)} USDT</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-[10px] text-muted-foreground">* Excludes trading fees, gas fees and slippage. For illustration only.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}