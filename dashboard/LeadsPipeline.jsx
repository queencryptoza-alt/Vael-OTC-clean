import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const STAGE_COLORS = {
  new: 'hsl(187 92% 50%)',
  contacted: 'hsl(210 70% 55%)',
  qualified: 'hsl(270 70% 60%)',
  proposal: 'hsl(43 90% 55%)',
  negotiation: 'hsl(30 80% 55%)',
  won: 'hsl(142 70% 50%)',
  lost: 'hsl(0 72% 55%)',
};

export default function LeadsPipeline({ leads }) {
  const stages = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
  const data = stages.map(stage => ({
    name: stage.charAt(0).toUpperCase() + stage.slice(1),
    count: leads.filter(l => l.stage === stage).length,
    stage
  }));

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Lead Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} barSize={28}>
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: 'hsl(222 44% 8%)',
                border: '1px solid hsl(222 30% 16%)',
                borderRadius: '8px',
                color: 'hsl(210 40% 96%)',
                fontSize: '12px'
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.stage} fill={STAGE_COLORS[entry.stage]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}