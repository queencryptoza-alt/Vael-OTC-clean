import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, FileText, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const statusColors = {
  draft: 'bg-muted text-muted-foreground',
  in_progress: 'bg-yellow-500/20 text-yellow-400',
  awaiting_payment: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
  quoted: 'bg-purple-500/20 text-purple-400',
  settled: 'bg-green-500/20 text-green-400',
  confirmed: 'bg-cyan-500/20 text-cyan-400',
};

const directionColor = { BUY: 'text-green-400', SELL: 'text-red-400' };

export default function Trades() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currency, setCurrency] = useState('ZAR');

  const { data: tickets = [] } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => base44.entities.TradeTicket.list('-created_date', 100),
  });

  const filtered = tickets.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.ticket_number?.toLowerCase().includes(q) || t.client_name?.toLowerCase().includes(q) || t.route?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalVolume = filtered.reduce((s, t) => s + (currency === 'ZAR' ? (t.total_zar_equivalent || 0) : (t.total_usd_value || 0)), 0);
  const totalPL = filtered.reduce((s, t) => s + (t.fee_amount_zar || 0), 0);
  const fmt = (n) => currency === 'ZAR' ? `R${Number(n).toLocaleString()}` : `$${Number(n).toLocaleString()}`;

  const inferDirection = (t) => {
    if (!t.route) return 'BUY';
    return t.route.toLowerCase().includes('usdt') || t.route.toLowerCase().includes('btc') ? 'BUY' : 'SELL';
  };

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Trades</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} total trades</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant={currency === 'ZAR' ? 'default' : 'outline'} onClick={() => setCurrency('ZAR')} className={currency === 'ZAR' ? 'bg-primary text-primary-foreground' : ''}>ZAR</Button>
          <Button size="sm" variant={currency === 'USD' ? 'default' : 'outline'} onClick={() => setCurrency('USD')} className={currency === 'USD' ? 'bg-primary text-primary-foreground' : ''}>USD</Button>
          <Button asChild size="sm" className="bg-primary text-primary-foreground">
            <Link to="/tickets"><Plus className="w-4 h-4 mr-1" /> New Trade</Link>
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: `Volume (${currency})`, value: fmt(totalVolume) },
          { label: 'P&L (Fees)', value: `R${Number(totalPL).toLocaleString()}`, green: true },
          { label: 'Count', value: filtered.length },
        ].map(c => (
          <div key={c.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{c.label}</p>
            <p className={`text-2xl font-mono font-bold mt-1 ${c.green ? 'text-green-400' : 'text-foreground'}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search trades..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-card" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 bg-card"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="awaiting_payment">Awaiting Payment</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Ref','Client','Dir','Route','Amount (ZAR)','Rate (Q)','Rate (A)','P&L','Status','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => {
                const dir = inferDirection(t);
                const pl = t.fee_amount_zar;
                return (
                  <tr key={t.id} className={`border-b border-border/50 hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                    <td className="px-4 py-3 font-mono text-xs text-primary">{t.ticket_number || t.id?.slice(0,8)}</td>
                    <td className="px-4 py-3 text-xs text-foreground">{t.client_name || '—'}</td>
                    <td className="px-4 py-3 font-bold text-xs"><span className={directionColor[dir]}>{dir}</span></td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{t.route || '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{t.total_zar_equivalent ? `R${Number(t.total_zar_equivalent).toLocaleString()}` : '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{t.xe_spot_rate || '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{t.xe_valid_spot_rate || t.xe_spot_rate || '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-green-400">{pl ? `R${Number(pl).toLocaleString()}` : '—'}</td>
                    <td className="px-4 py-3"><Badge className={`text-[10px] ${statusColors[t.status] || statusColors.draft}`}>{t.status?.replace(/_/g,' ')}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button asChild variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary">
                          <Link to="/tickets"><FileText className="w-3.5 h-3.5" /></Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="py-12 text-center text-muted-foreground text-sm">No trades found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}