import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, DollarSign, Receipt, Users } from 'lucide-react';
import { format, subDays, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

const COLORS = ['hsl(187,92%,50%)', 'hsl(142,70%,50%)', 'hsl(270,70%,60%)', 'hsl(43,90%,55%)', 'hsl(0,72%,55%)'];

export default function Reports() {
  const [period, setPeriod] = useState('90d');

  const { data: tickets = [] } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => base44.entities.TradeTicket.list('-created_date', 500),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
  });

  const { data: leads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: () => base44.entities.Lead.list(),
  });

  const now = new Date();
  const cutoff = period === '7d' ? subDays(now, 7)
    : period === '30d' ? subDays(now, 30)
    : period === '90d' ? subDays(now, 90)
    : period === '1y' ? subDays(now, 365)
    : new Date(0);

  const filtered = tickets.filter(t => t.created_date && new Date(t.created_date) >= cutoff);
  const completed = filtered.filter(t => t.status === 'completed');
  const totalVolume = completed.reduce((s, t) => s + (t.total_zar_equivalent || 0), 0);
  const totalRevenue = completed.reduce((s, t) => s + (t.fee_amount_zar || 0), 0);
  const totalUsd = completed.reduce((s, t) => s + (t.total_usd_value || 0), 0);

  // Monthly volume chart
  const months = eachMonthOfInterval({
    start: startOfMonth(subMonths(now, 5)),
    end: endOfMonth(now),
  });
  const monthlyData = months.map(m => {
    const label = format(m, 'MMM yy');
    const monthTickets = tickets.filter(t => {
      if (!t.created_date) return false;
      const d = new Date(t.created_date);
      return d >= startOfMonth(m) && d <= endOfMonth(m) && t.status === 'completed';
    });
    return {
      month: label,
      volume: Math.round(monthTickets.reduce((s, t) => s + (t.total_zar_equivalent || 0), 0)),
      revenue: Math.round(monthTickets.reduce((s, t) => s + (t.fee_amount_zar || 0), 0)),
      count: monthTickets.length,
    };
  });

  // Route breakdown
  const routeCounts = {};
  completed.forEach(t => {
    if (t.route) routeCounts[t.route] = (routeCounts[t.route] || 0) + 1;
  });
  const routeData = Object.entries(routeCounts).map(([name, value]) => ({ name, value }));

  // Status breakdown
  const statusCounts = { draft: 0, in_progress: 0, awaiting_payment: 0, completed: 0, cancelled: 0 };
  filtered.forEach(t => { if (t.status) statusCounts[t.status] = (statusCounts[t.status] || 0) + 1; });
  const statusData = Object.entries(statusCounts).filter(([, v]) => v > 0).map(([name, value]) => ({ name: name.replace('_', ' '), value }));

  const handleExport = () => {
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(16);
    doc.text('OTC Trading Terminal — Report', 15, y); y += 10;
    doc.setFontSize(10);
    doc.text(`Period: ${period} | Generated: ${format(now, 'dd MMM yyyy HH:mm')}`, 15, y); y += 12;
    doc.setFontSize(12);
    doc.text('Summary', 15, y); y += 8;
    doc.setFontSize(10);
    doc.text(`Total Volume (ZAR): R${totalVolume.toLocaleString()}`, 15, y); y += 7;
    doc.text(`Total Revenue (Fees): R${totalRevenue.toLocaleString()}`, 15, y); y += 7;
    doc.text(`Total USD Value: $${totalUsd.toLocaleString()}`, 15, y); y += 7;
    doc.text(`Completed Tickets: ${completed.length}`, 15, y); y += 7;
    doc.text(`Total Clients: ${clients.length}`, 15, y); y += 7;
    doc.text(`Active Leads: ${leads.filter(l => l.stage !== 'won' && l.stage !== 'lost').length}`, 15, y); y += 12;
    doc.setFontSize(12);
    doc.text('Monthly Volume', 15, y); y += 8;
    doc.setFontSize(9);
    monthlyData.forEach(m => {
      doc.text(`${m.month}: R${m.volume.toLocaleString()} (${m.count} trades, R${m.revenue.toLocaleString()} fees)`, 15, y);
      y += 6;
    });
    doc.save(`otc-report-${period}.pdf`);
    toast.success('Report exported as PDF');
  };

  const stats = [
    { label: 'Total Volume (ZAR)', value: `R ${totalVolume.toLocaleString()}`, icon: DollarSign, color: 'text-primary' },
    { label: 'Total Revenue (Fees)', value: `R ${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-green-400' },
    { label: 'Completed Trades', value: completed.length, icon: Receipt, color: 'text-accent' },
    { label: 'Total Clients', value: clients.length, icon: Users, color: 'text-yellow-400' },
  ];

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Trading performance overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <s.icon className={`w-4 h-4 ${s.color}`} />
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
              <p className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly Volume & Revenue */}
      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-sm">Monthly Volume & Revenue (ZAR)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" tick={{ fill: 'hsl(215,20%,55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(215,20%,55%)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `R${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: 'hsl(222,44%,8%)', border: '1px solid hsl(222,30%,16%)', borderRadius: 8 }}
                labelStyle={{ color: 'hsl(210,40%,96%)' }}
                formatter={(v, name) => [`R${Number(v).toLocaleString()}`, name]}
              />
              <Bar dataKey="volume" fill="hsl(187,92%,50%)" radius={[4, 4, 0, 0]} name="Volume" />
              <Bar dataKey="revenue" fill="hsl(142,70%,50%)" radius={[4, 4, 0, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Trade count line */}
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-sm">Monthly Trade Count</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={monthlyData}>
                <XAxis dataKey="month" tick={{ fill: 'hsl(215,20%,55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(215,20%,55%)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(222,44%,8%)', border: '1px solid hsl(222,30%,16%)', borderRadius: 8 }} />
                <Line type="monotone" dataKey="count" stroke="hsl(270,70%,60%)" strokeWidth={2} dot={{ fill: 'hsl(270,70%,60%)', r: 4 }} name="Trades" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Route breakdown */}
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-sm">Top Routes</CardTitle></CardHeader>
          <CardContent>
            {routeData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data</p>
            ) : (
              <div className="space-y-2 mt-2">
                {routeData.sort((a, b) => b.value - a.value).slice(0, 6).map((r, i) => (
                  <div key={r.name} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-muted-foreground flex-1 truncate">{r.name}</span>
                    <Badge variant="outline" className="text-[10px] font-mono">{r.value}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status breakdown */}
        <Card className="bg-card border-border md:col-span-2">
          <CardHeader><CardTitle className="text-sm">Ticket Status Breakdown</CardTitle></CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center gap-6">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={70} dataKey="value">
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(222,44%,8%)', border: '1px solid hsl(222,30%,16%)', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {statusData.map((s, i) => (
                <div key={s.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-sm text-muted-foreground capitalize flex-1">{s.name}</span>
                  <span className="text-sm font-bold font-mono">{s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}