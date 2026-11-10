import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, DollarSign, Receipt, Percent, BarChart2 } from 'lucide-react';

const PERIODS = ['All Time', 'This Month', 'This Week', 'Today'];

function filterByPeriod(tickets, period) {
  const now = new Date();
  return tickets.filter(t => {
    if (period === 'All Time') return true;
    const d = new Date(t.created_date);
    if (period === 'Today') {
      return d.toDateString() === now.toDateString();
    }
    if (period === 'This Week') {
      const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
      return d >= weekAgo;
    }
    if (period === 'This Month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    return true;
  });
}

export default function TradingSummary({ tickets = [] }) {
  const [period, setPeriod] = useState('All Time');
  const [view, setView] = useState('overview'); // 'overview' | 'completed' | 'active'

  const completed = tickets.filter(t => t.status === 'completed');
  const active = tickets.filter(t => ['in_progress', 'awaiting_payment'].includes(t.status));

  const filtered = filterByPeriod(
    view === 'completed' ? completed : view === 'active' ? active : tickets,
    period
  );

  const totalVolume = filtered.reduce((s, t) => s + (t.total_zar_equivalent || 0), 0);
  const totalFees = filtered.reduce((s, t) => s + (t.fee_amount_zar || 0), 0);
  const totalInvoice = filtered.reduce((s, t) => s + (t.invoice_value_zar || 0), 0);
  const totalUSD = filtered.reduce((s, t) => s + (t.total_usd_value || 0), 0);
  const tradeCount = filtered.length;

  const stats = [
    { label: 'Total Volume (ZAR)', value: `R${totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: BarChart2, color: 'text-primary' },
    { label: 'Revenue / Invoice', value: `R${totalInvoice.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: DollarSign, color: 'text-green-400' },
    { label: 'Fees Charged', value: `R${totalFees.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: Percent, color: 'text-yellow-400' },
    { label: 'USD Equivalent', value: `$${totalUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: TrendingUp, color: 'text-accent' },
    { label: 'Trade Count', value: tradeCount, icon: Receipt, color: 'text-muted-foreground' },
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Trading Summary
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {/* View selector */}
            <div className="flex border border-border rounded-md overflow-hidden">
              {['overview', 'completed', 'active'].map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1 text-xs capitalize transition-colors ${view === v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {v}
                </button>
              ))}
            </div>
            {/* Period selector */}
            <div className="flex border border-border rounded-md overflow-hidden">
              {PERIODS.map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 text-xs transition-colors ${period === p ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-secondary/50 rounded-lg p-3 space-y-1">
              <div className="flex items-center gap-1.5">
                <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
              </div>
              <p className="text-base font-bold text-foreground font-mono">{s.value}</p>
            </div>
          ))}
        </div>
        {tradeCount === 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">No trades for this selection.</p>
        )}
      </CardContent>
    </Card>
  );
}