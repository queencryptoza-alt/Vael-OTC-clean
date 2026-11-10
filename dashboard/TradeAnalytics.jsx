import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';

const STATUS_COLORS = {
  draft: '#a0a0a0',
  in_progress: '#6ea050',
  awaiting_payment: '#e6a817',
  completed: '#22c55e',
  cancelled: '#ef4444',
};

const PERIOD_OPTIONS = [
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
];

function buildDailyData(tickets, days) {
  const buckets = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = format(subDays(new Date(), i), 'dd MMM');
    buckets[d] = { date: d, volume: 0, fees: 0, count: 0 };
  }
  const cutoff = startOfDay(subDays(new Date(), days - 1));
  tickets.forEach(t => {
    if (!t.created_date) return;
    const d = new Date(t.created_date);
    if (d < cutoff) return;
    const key = format(d, 'dd MMM');
    if (buckets[key]) {
      buckets[key].volume += t.total_zar_equivalent || 0;
      buckets[key].fees += t.fee_amount_zar || 0;
      buckets[key].count += 1;
    }
  });
  return Object.values(buckets);
}

function buildStatusData(tickets) {
  const counts = {};
  tickets.forEach(t => {
    const s = t.status || 'draft';
    counts[s] = (counts[s] || 0) + 1;
  });
  return Object.entries(counts).map(([status, value]) => ({
    name: status.replace(/_/g, ' '),
    value,
    color: STATUS_COLORS[status] || '#a0a0a0',
  }));
}

const ZARFormatter = (v) => `R ${Number(v).toLocaleString()}`;
const shortZAR = (v) => v >= 1000000 ? `R${(v/1000000).toFixed(1)}M` : v >= 1000 ? `R${(v/1000).toFixed(0)}k` : `R${v}`;

export default function TradeAnalytics({ tickets }) {
  const [period, setPeriod] = useState(30);
  const daily = buildDailyData(tickets, period);
  const statusData = buildStatusData(tickets);

  // Tick interval for x-axis to avoid clutter
  const tickInterval = period === 7 ? 0 : period === 30 ? 4 : 9;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Trade Analytics</h2>
        <div className="flex gap-1">
          {PERIOD_OPTIONS.map(o => (
            <button
              key={o.days}
              onClick={() => setPeriod(o.days)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                period === o.days
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-accent'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Volume Bar Chart */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Trade Volume (ZAR)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={daily} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(45 15% 85%)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#888' }} interval={tickInterval} />
                <YAxis tickFormatter={shortZAR} tick={{ fontSize: 10, fill: '#888' }} width={52} />
                <Tooltip formatter={(v) => ZARFormatter(v)} labelStyle={{ color: '#333' }} contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="volume" fill="hsl(78 65% 42%)" radius={[3, 3, 0, 0]} name="Volume" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fees Line Chart */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Fees Earned (ZAR)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={daily} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(45 15% 85%)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#888' }} interval={tickInterval} />
                <YAxis tickFormatter={shortZAR} tick={{ fontSize: 10, fill: '#888' }} width={52} />
                <Tooltip formatter={(v) => ZARFormatter(v)} labelStyle={{ color: '#333' }} contentStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone" dataKey="fees" stroke="#e6a817"
                  strokeWidth={2} dot={false} name="Fees"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Pie */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  paddingAngle={3} dataKey="value" nameKey="name"
                >
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Trade Count */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tickets Created</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={daily} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(45 15% 85%)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#888' }} interval={tickInterval} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#888' }} width={30} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="count" fill="hsl(210 55% 55%)" radius={[3, 3, 0, 0]} name="Tickets" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}