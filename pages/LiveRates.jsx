import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function LiveRates() {
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rateHistory, setRateHistory] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Return current live forex and crypto rates for an OTC trader in South Africa. I need:
        1. USD/ZAR exchange rate (XE spot rate)
        2. EUR/ZAR
        3. GBP/ZAR
        4. BTC/USD, BTC/ZAR
        5. ETH/USD, ETH/ZAR
        6. USDT/ZAR
        7. VALR BTC/ZAR rate (VALR is a South African crypto exchange)
        8. VALR USDT/ZAR rate
        9. Luno BTC/ZAR rate
        Give realistic current market rates.`,
        response_json_schema: {
          type: "object",
          properties: {
            xe_rates: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  pair: { type: "string" },
                  rate: { type: "number" },
                  change_24h: { type: "number" }
                }
              }
            },
            exchange_rates: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  exchange: { type: "string" },
                  pair: { type: "string" },
                  rate: { type: "number" },
                  change_24h: { type: "number" }
                }
              }
            }
          }
        },
        add_context_from_internet: true,
        model: "gemini_3_flash"
      });
      setRates(result);
      setLastUpdated(new Date());

      // Add to history
      const xeRate = result.xe_rates?.find(r => r.pair === 'USD/ZAR');
      if (xeRate) {
        setRateHistory(prev => [...prev.slice(-23), {
          time: new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' }),
          rate: xeRate.rate
        }]);
      }
    } catch (e) {
      console.error('Failed to fetch rates:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 120000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Live Rates</h1>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString('en-ZA')}` : 'Loading...'}
            </p>
            <Badge variant="outline" className="text-[10px] text-green-400 border-green-400/30">LIVE</Badge>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={fetchRates} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* XE Forex Rates */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Global Spot Rates (XE)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(rates?.xe_rates || []).map((rate, i) => (
            <Card key={i} className="bg-card border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{rate.pair}</span>
                  <span className={`flex items-center gap-1 text-xs font-mono ${rate.change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {rate.change_24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(rate.change_24h).toFixed(2)}%
                  </span>
                </div>
                <p className="text-2xl font-bold font-mono text-foreground mt-1">
                  {rate.rate?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Exchange Rates */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Exchange Rates (VALR / Luno)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(rates?.exchange_rates || []).map((rate, i) => (
            <Card key={i} className="bg-card border-border hover:border-accent/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{rate.exchange}</Badge>
                    <span className="text-sm font-medium text-muted-foreground">{rate.pair}</span>
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-mono ${rate.change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {rate.change_24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(rate.change_24h).toFixed(2)}%
                  </span>
                </div>
                <p className="text-2xl font-bold font-mono text-foreground mt-1">
                  R{rate.rate?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* USD/ZAR Rate History Chart */}
      {rateHistory.length > 1 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              USD/ZAR Session History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={rateHistory}>
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(222 44% 8%)',
                    border: '1px solid hsl(222 30% 16%)',
                    borderRadius: '8px',
                    color: 'hsl(210 40% 96%)',
                    fontSize: '12px'
                  }}
                />
                <Line type="monotone" dataKey="rate" stroke="hsl(187 92% 50%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}