import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Download, Users, DollarSign, Wallet, Pencil, Trash2, TrendingUp, Check, Undo2, Clock } from 'lucide-react';
import { toast } from 'sonner';

const tierColors = { junior: 'bg-secondary text-muted-foreground', senior: 'bg-blue-500/20 text-blue-400', lead: 'bg-purple-500/20 text-purple-400', partner: 'bg-primary/20 text-primary' };
const BLANK = { name: '', email: '', phone: '', commission_rate: 10, tier: 'junior', status: 'active' };

function getMonthOptions(n = 12) {
  const opts = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    opts.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: d.toLocaleString('en-US', { month: 'long', year: 'numeric' }) });
  }
  return opts;
}

export default function Commissions() {
  const queryClient = useQueryClient();
  const monthOptions = useMemo(() => getMonthOptions(12), []);
  const [period, setPeriod] = useState(monthOptions[0].key);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editAgent, setEditAgent] = useState(null);
  const [form, setForm] = useState(BLANK);

  const { data: agents = [] } = useQuery({ queryKey: ['salesAgents'], queryFn: () => base44.entities.SalesAgent.list('-created_date') });
  const { data: tickets = [] } = useQuery({ queryKey: ['tickets'], queryFn: () => base44.entities.TradeTicket.list('-created_date', 500) });
  const { data: payouts = [] } = useQuery({ queryKey: ['payouts', period], queryFn: () => base44.entities.CommissionPayout.filter({ period }) });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const payload = { name: data.name, email: data.email, phone: data.phone, commission_rate: parseFloat(data.commission_rate) || 0, tier: data.tier, status: data.status };
      return editAgent ? base44.entities.SalesAgent.update(editAgent.id, payload) : base44.entities.SalesAgent.create(payload);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['salesAgents'] }); setDialogOpen(false); setEditAgent(null); toast.success(editAgent ? 'Agent updated' : 'Agent added'); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SalesAgent.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['salesAgents'] }); toast.success('Agent removed'); },
  });
  const payoutMutation = useMutation({
    mutationFn: async ({ agent, amount, status }) => {
      const existing = payouts.find(p => p.agent_id === agent.id);
      const data = { agent_id: agent.id, agent_name: agent.name, period, amount: Math.round(amount), status, paid_date: status === 'paid' ? new Date().toISOString() : null };
      return existing ? base44.entities.CommissionPayout.update(existing.id, data) : base44.entities.CommissionPayout.create(data);
    },
    onSuccess: (_, vars) => { queryClient.invalidateQueries({ queryKey: ['payouts', period] }); toast.success(vars.status === 'paid' ? 'Marked as paid' : 'Marked outstanding'); },
  });

  const periodTickets = useMemo(() => {
    const [y, m] = period.split('-').map(Number);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 1);
    return tickets.filter(t => { const d = new Date(t.created_date); return d >= start && d < end; });
  }, [tickets, period]);

  const report = useMemo(() => {
    return agents.map(a => {
      const agentTickets = periodTickets.filter(t => t.sales_agent_id === a.id && t.status !== 'cancelled');
      const volume = agentTickets.reduce((s, t) => s + (t.total_zar_equivalent || 0), 0);
      const revenue = agentTickets.reduce((s, t) => s + (t.fee_amount_zar || 0), 0);
      const commission = revenue * (a.commission_rate || 0) / 100;
      const payout = payouts.find(p => p.agent_id === a.id);
      return { agent: a, trades: agentTickets.length, volume, revenue, commission, status: payout?.status || 'pending' };
    }).sort((x, y) => y.commission - x.commission);
  }, [agents, periodTickets, payouts]);

  const totals = report.reduce((acc, r) => ({
    trades: acc.trades + r.trades,
    revenue: acc.revenue + r.revenue,
    commission: acc.commission + r.commission,
    outstanding: acc.outstanding + (r.status === 'paid' ? 0 : r.commission),
    paid: acc.paid + (r.status === 'paid' ? r.commission : 0),
  }), { trades: 0, revenue: 0, commission: 0, outstanding: 0, paid: 0 });

  const openNew = () => { setEditAgent(null); setForm(BLANK); setDialogOpen(true); };
  const openEdit = (a) => { setEditAgent(a); setForm({ name: a.name, email: a.email || '', phone: a.phone || '', commission_rate: a.commission_rate ?? 10, tier: a.tier || 'junior', status: a.status || 'active' }); setDialogOpen(true); };
  const upd = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const fmt = (n) => `R${Number(Math.round(n)).toLocaleString()}`;
  const periodLabel = monthOptions.find(m => m.key === period)?.label || period;

  const exportCSV = () => {
    const header = ['Agent', 'Tier', 'Rate %', 'Trades', 'Volume (ZAR)', 'Desk Revenue (ZAR)', 'Commission (ZAR)', 'Status'];
    const rows = report.map(r => [r.agent.name, r.agent.tier, r.agent.commission_rate, r.trades, Math.round(r.volume), Math.round(r.revenue), Math.round(r.commission), r.status]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = `commission-payouts-${period}.csv`; link.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported');
  };

  const summaryCards = [
    { label: 'Outstanding Liability', value: fmt(totals.outstanding), icon: Wallet, accent: 'text-primary' },
    { label: 'Paid This Month', value: fmt(totals.paid), icon: Check, accent: 'text-green-400' },
    { label: 'Total Commission', value: fmt(totals.commission), icon: DollarSign, accent: 'text-foreground' },
    { label: 'Desk Revenue (Fees)', value: fmt(totals.revenue), icon: TrendingUp, accent: 'text-green-400' },
  ];

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Commission Payouts</h1>
          <p className="text-sm text-muted-foreground mt-1">Monthly agent payouts auto-calculated from trade data</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-44 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>{monthOptions.map(m => <SelectItem key={m.key} value={m.key}>{m.label}</SelectItem>)}</SelectContent>
          </Select>
          <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-1.5" />Export</Button>
          <Button onClick={openNew} className="bg-primary text-primary-foreground"><Plus className="w-4 h-4 mr-1" />Add Agent</Button>
        </div>
      </div>

      {/* Liability banner */}
      <Card className="bg-gradient-to-r from-primary/10 to-transparent border-primary/20">
        <CardContent className="p-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Commission Liability · {periodLabel}</p>
            <p className="text-3xl font-mono font-bold text-primary mt-1">{fmt(totals.outstanding)}</p>
          </div>
          <Badge className="bg-primary/20 text-primary text-xs">{report.filter(r => r.status !== 'paid' && r.commission > 0).length} agents awaiting payout</Badge>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(c => (
          <Card key={c.label} className="bg-card border-border">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0"><c.icon className={`w-4 h-4 ${c.accent}`} /></div>
              <div>
                <p className={`text-xl font-mono font-bold ${c.accent}`}>{c.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Agent','Tier','Rate','Trades','Volume','Desk Revenue','Commission','Payout','Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.map((r, i) => (
                <tr key={r.agent.id} className={`border-b border-border/50 hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                  <td className="px-4 py-3 font-medium text-foreground">{r.agent.name}</td>
                  <td className="px-4 py-3"><Badge className={`text-[10px] capitalize ${tierColors[r.agent.tier]}`}>{r.agent.tier}</Badge></td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.agent.commission_rate}%</td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground">{r.trades}</td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground">{fmt(r.volume)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-green-400">{fmt(r.revenue)}</td>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-primary">{fmt(r.commission)}</td>
                  <td className="px-4 py-3">
                    {r.status === 'paid'
                      ? <Badge className="text-[10px] bg-green-500/20 text-green-400"><Check className="w-3 h-3 mr-1" />Paid</Badge>
                      : <Badge className="text-[10px] bg-yellow-500/20 text-yellow-400"><Clock className="w-3 h-3 mr-1" />Outstanding</Badge>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 items-center">
                      {r.status === 'paid'
                        ? <Button variant="ghost" size="sm" className="h-7 text-[11px] text-muted-foreground hover:text-foreground" onClick={() => payoutMutation.mutate({ agent: r.agent, amount: r.commission, status: 'pending' })}><Undo2 className="w-3.5 h-3.5 mr-1" />Undo</Button>
                        : <Button variant="ghost" size="sm" className="h-7 text-[11px] text-green-400 hover:text-green-300" disabled={r.commission <= 0} onClick={() => payoutMutation.mutate({ agent: r.agent, amount: r.commission, status: 'paid' })}><Check className="w-3.5 h-3.5 mr-1" />Mark Paid</Button>}
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => openEdit(r.agent)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteMutation.mutate(r.agent.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {report.length > 0 && (
                <tr className="bg-muted/20 font-medium">
                  <td className="px-4 py-3 text-foreground" colSpan={3}>Total</td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground">{totals.trades}</td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 font-mono text-xs text-green-400">{fmt(totals.revenue)}</td>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-primary">{fmt(totals.commission)}</td>
                  <td colSpan={2}></td>
                </tr>
              )}
              {report.length === 0 && <tr><td colSpan={9} className="py-12 text-center text-muted-foreground text-sm">No agents yet — add a sales agent to start tracking commissions</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">Commission = desk fee revenue from each agent's attributed trades in {periodLabel} × their rate. Mark payouts as paid to clear them from your outstanding liability.</p>

      {/* Add/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader><DialogTitle>{editAgent ? 'Edit Agent' : 'Add Sales Agent'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label className="text-xs">Name *</Label><Input value={form.name} onChange={e => upd('name', e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs">Email</Label><Input value={form.email} onChange={e => upd('email', e.target.value)} /></div>
              <div className="space-y-1"><Label className="text-xs">Phone</Label><Input value={form.phone} onChange={e => upd('phone', e.target.value)} /></div>
              <div className="space-y-1"><Label className="text-xs">Commission Rate %</Label><Input type="number" value={form.commission_rate} onChange={e => upd('commission_rate', e.target.value)} /></div>
              <div className="space-y-1"><Label className="text-xs">Tier</Label>
                <Select value={form.tier} onValueChange={v => upd('tier', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="junior">Junior</SelectItem><SelectItem value="senior">Senior</SelectItem><SelectItem value="lead">Lead</SelectItem><SelectItem value="partner">Partner</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label className="text-xs">Status</Label>
                <Select value={form.status} onValueChange={v => upd('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate(form)} disabled={!form.name || saveMutation.isPending} className="bg-primary text-primary-foreground">{editAgent ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}