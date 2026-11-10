import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsRow({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Card key={i} className="p-4 bg-card border-border relative overflow-hidden group hover:border-primary/30 transition-colors">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -translate-y-6 translate-x-6 group-hover:bg-primary/10 transition-colors" />
          <div className="flex items-center gap-2 mb-2">
            <stat.icon className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</span>
          </div>
          <p className="text-2xl font-bold font-mono text-foreground">{stat.value}</p>
          {stat.change && (
            <div className={`flex items-center gap-1 mt-1 text-xs ${stat.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stat.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(stat.change)}% this month
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}