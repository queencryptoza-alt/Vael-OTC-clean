import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Shield, AlertTriangle, Activity, TrendingUp } from 'lucide-react';

// Mock SARB tracker data
const sarbData = {
  annualLimit: 1000000000, // R1B
  currentOutflow: 780000000,
  pct: 78,
};

// Mock wallet risk data
const walletAlerts = [
  { wallet: '0x1a2b...3c4d', network: 'Ethereum', risk: 8.2, sanction: true, amount: 'R 2,450,000' },
  { wallet: '0x5e6f...7g8h', network: 'TRC-20', risk: 5.1, sanction: false, amount: 'R 890,000' },
  { wallet: '0x9i0j...1k2l', network: 'BSC', risk: 3.4, sanction: false, amount: 'R 1,200,000' },
  { wallet: '0x3m4n...5o6p', network: 'Ethereum', risk: 9.1, sanction: true, amount: 'R 5,100,000' },
  { wallet: '0x7q8r...9s0t', network: 'TRC-20', risk: 1.2, sanction: false, amount: 'R 340,000' },
];

// Mock arbitrage volatility
const volatilityData = [
  { time: '00:00', flow: 12000000 },
  { time: '04:00', flow: 8500000 },
  { time: '08:00', flow: 22000000 },
  { time: '12:00', flow: 45000000 },
  { time: '16:00', flow: 38000000 },
  { time: '20:00', flow: 17000000 },
];

export default function LiveRiskDashboard() {
  const maxFlow = Math.max(...volatilityData.map(d => d.flow));

  return (
    <div>
      <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <Shield className="w-4 h-4 text-primary" /> Live Risk & Limits Dashboard
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Column 1: SARB Exchange Control Tracker */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-primary" /> SARB Exchange Control Tracker
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-[11px]">
              <span className="text-muted-foreground">CY Capital Outflows</span>
              <span className={`font-mono font-bold ${
                sarbData.pct >= 95 ? 'text-red-400' : sarbData.pct >= 80 ? 'text-amber-400' : 'text-foreground'
              }`}>{sarbData.pct}%</span>
            </div>
            <Progress 
              value={sarbData.pct} 
              className={`h-2 ${
                sarbData.pct >= 95 ? '[&>div]:bg-red-500' : sarbData.pct >= 80 ? '[&>div]:bg-amber-500' : '[&>div]:bg-primary'
              }`}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>R {(sarbData.currentOutflow / 1e9).toFixed(2)}B</span>
              <span>R {(sarbData.annualLimit / 1e9).toFixed(1)}B limit</span>
            </div>
            <div className={`rounded px-2.5 py-1.5 text-[10px] font-medium flex items-center gap-1.5 ${
              sarbData.pct >= 95 ? 'bg-red-500/10 text-red-400 pulse-red' : 
              sarbData.pct >= 80 ? 'bg-amber-500/10 text-amber-400 pulse-amber' : 
              'bg-primary/10 text-primary'
            }`}>
              <AlertTriangle className="w-3 h-3" />
              {sarbData.pct >= 95 ? 'CRITICAL: Near SARB limit' : 
               sarbData.pct >= 80 ? 'WARNING: Approaching 80% threshold' : 
               'Within allowable SARB limits'}
            </div>
          </CardContent>
        </Card>

        {/* Column 2: Private Wallet Risk Status */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Private Wallet Risk Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[220px] overflow-y-auto">
            {walletAlerts.map((alert, i) => (
              <div key={i} className={`rounded-md px-2.5 py-2 text-[11px] border ${
                alert.risk >= 7 
                  ? 'border-red-500/30 bg-red-500/5' 
                  : alert.risk >= 5 
                    ? 'border-amber-500/20 bg-amber-500/5' 
                    : 'border-border bg-secondary/30'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-muted-foreground">{alert.wallet}</span>
                  <span className={`font-mono font-bold ${
                    alert.risk >= 7 ? 'text-red-400' : alert.risk >= 5 ? 'text-amber-400' : 'text-primary'
                  }`}>{alert.risk}/10</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{alert.network} · {alert.amount}</span>
                  {alert.sanction && (
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold">
                      BLOCKED — SANCTION RISK
                    </span>
                  )}
                </div>
                {alert.risk >= 7 && (
                  <button className="mt-1.5 text-[10px] bg-amber-500/15 text-amber-400 px-2 py-1 rounded hover:bg-amber-500/25 transition-colors w-full text-left">
                    Manual Compliance Override →
                  </button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Column 3: Arbitrage Flow Volatility */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-primary" /> Arbitrage Flow Volatility (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1.5 h-[160px]">
              {volatilityData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] text-muted-foreground font-mono">R{(d.flow/1e6).toFixed(0)}M</span>
                  <div 
                    className="w-full rounded-t-sm transition-all"
                    style={{
                      height: `${(d.flow / maxFlow) * 130}px`,
                      backgroundColor: d.flow > 30000000 ? 'hsl(0, 72%, 51%)' : 'hsl(67, 100%, 51%)',
                      opacity: d.flow > 30000000 ? 0.9 : 0.6,
                    }}
                  />
                  <span className="text-[9px] text-muted-foreground">{d.time}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 text-center">
              Spike threshold: R30M · Above triggers FIC STR alert
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}