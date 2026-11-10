import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Plus, Search, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import PullToRefresh from '@/components/shared/PullToRefresh';

const statusColors = {
  draft: 'bg-muted text-muted-foreground',
  in_progress: 'bg-primary/20 text-primary',
  awaiting_payment: 'bg-yellow-500/20 text-yellow-400',
  completed: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-destructive/20 text-destructive',
};

export default function TradeTickets() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: tickets = [], isLoading, refetch } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => base44.entities.TradeTicket.list('-created_date', 100),
  });

  const filtered = tickets.filter(t => {
    const q = search.toLowerCase();
    return !q || t.ticket_number?.toLowerCase().includes(q) || t.client_name?.toLowerCase().includes(q) || t.route?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Trade Tickets</h1>
          <p className="text-sm text-muted-foreground mt-1">{tickets.length} total tickets</p>
        </div>
        <Button onClick={() => navigate('/tickets/new')} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" /> New Ticket
        </Button>
      </div>

      <PullToRefresh onRefresh={async () => { await refetch(); }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by ticket #, client, or route..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 bg-card"
          />
        </div>

        <div className="space-y-2">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!isLoading && filtered.length === 0 && (
            <Card className="p-12 bg-card border-border text-center">
              <Receipt className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No tickets found</p>
            </Card>
          )}
          {filtered.map(ticket => (
            <Card
              key={ticket.id}
              className="p-4 bg-card border-border hover:border-primary/30 transition-colors cursor-pointer"
              onClick={() => navigate(`/tickets/${ticket.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-mono font-bold text-primary">{ticket.ticket_number}</span>
                    <Badge className={`text-[10px] ${statusColors[ticket.status] || statusColors.draft}`}>
                      {ticket.status?.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{ticket.route}</span>
                  </div>
                  <p className="text-sm text-foreground mt-1">{ticket.client_name}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-lg font-mono font-bold text-foreground">R{ticket.total_zar_equivalent?.toLocaleString() || '0'}</p>
                  <p className="text-xs text-muted-foreground">
                    {ticket.created_date ? format(new Date(ticket.created_date), 'dd MMM yyyy') : ''}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </PullToRefresh>
    </div>
  );
}