import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { format } from 'date-fns';

const LOGS = [
  { id: 1, time: new Date(Date.now() - 1000*60*5), action: 'CREATE', entity: 'TradeTicket', details: 'TT00012 created for Sipho Dlamini — R2,200,000', user: 'admin@vaelotc.com' },
  { id: 2, time: new Date(Date.now() - 1000*60*18), action: 'UPDATE', entity: 'TradeTicket', details: 'TT00011 status changed: draft → awaiting_payment', user: 'admin@vaelotc.com' },
  { id: 3, time: new Date(Date.now() - 1000*60*42), action: 'UPDATE', entity: 'Client', details: 'KYC status updated: Fatima Al-Hassan → verified', user: 'admin@vaelotc.com' },
  { id: 4, time: new Date(Date.now() - 1000*60*60*2), action: 'CREATE', entity: 'Client', details: 'New client added: Yolanda Ferreira', user: 'admin@vaelotc.com' },
  { id: 5, time: new Date(Date.now() - 1000*60*60*3), action: 'DELETE', entity: 'Lead', details: 'Lead converted to client: James Kariuki', user: 'admin@vaelotc.com' },
  { id: 6, time: new Date(Date.now() - 1000*60*60*5), action: 'UPDATE', entity: 'TradeTicket', details: 'TT00010 status changed: in_progress → completed', user: 'admin@vaelotc.com' },
  { id: 7, time: new Date(Date.now() - 1000*60*60*8), action: 'CREATE', entity: 'TradeTicket', details: 'TT00010 created for Priya Naidoo — R450,000', user: 'admin@vaelotc.com' },
  { id: 8, time: new Date(Date.now() - 1000*60*60*24), action: 'UPDATE', entity: 'Ramp', details: 'Lagos Off-Ramp status changed: active → maintenance', user: 'system' },
  { id: 9, time: new Date(Date.now() - 1000*60*60*25), action: 'LOGIN', entity: 'User', details: 'Admin login from 41.190.x.x', user: 'admin@vaelotc.com' },
  { id: 10, time: new Date(Date.now() - 1000*60*60*26), action: 'EXPORT', entity: 'TradeTicket', details: 'PDF exported: TT00009', user: 'admin@vaelotc.com' },
  { id: 11, time: new Date(Date.now() - 1000*60*60*48), action: 'UPDATE', entity: 'Client', details: 'KYC expiry updated: Kwame Mensah', user: 'admin@vaelotc.com' },
  { id: 12, time: new Date(Date.now() - 1000*60*60*72), action: 'CREATE', entity: 'Partner', details: 'New partner added: Standard Bank', user: 'admin@vaelotc.com' },
];

const actionColors = {
  CREATE: 'bg-green-500/20 text-green-400',
  UPDATE: 'bg-blue-500/20 text-blue-400',
  DELETE: 'bg-red-500/20 text-red-400',
  LOGIN: 'bg-purple-500/20 text-purple-400',
  EXPORT: 'bg-yellow-500/20 text-yellow-400',
};

export default function AuditLog() {
  const [search, setSearch] = useState('');

  const filtered = LOGS.filter(l =>
    !search || l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.entity.toLowerCase().includes(search.toLowerCase()) ||
    l.details.toLowerCase().includes(search.toLowerCase()) ||
    l.user.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
        <p className="text-sm text-muted-foreground mt-1">Activity history</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-card" />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Time','Action','Entity','Details','User'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((l, i) => (
                <tr key={l.id} className={`border-b border-border/50 hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground whitespace-nowrap">{format(l.time, 'dd MMM HH:mm')}</td>
                  <td className="px-4 py-3"><Badge className={`text-[10px] ${actionColors[l.action] || 'bg-muted text-muted-foreground'}`}>{l.action}</Badge></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{l.entity}</td>
                  <td className="px-4 py-3 text-xs text-foreground">{l.details}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{l.user}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-muted-foreground text-sm">No logs found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}