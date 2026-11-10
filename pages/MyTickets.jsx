import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Receipt } from 'lucide-react';
import { format } from 'date-fns';
import TicketView from '../components/tickets/TicketView';

const statusColors = {
  draft: 'bg-muted text-muted-foreground',
  in_progress: 'bg-primary/20 text-primary',
  awaiting_payment: 'bg-yellow-500/20 text-yellow-400',
  completed: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-destructive/20 text-destructive',
};

export default function MyTickets() {
  const { user } = useOutletContext();
  const [selected, setSelected] = useState(null);

  const { data: tickets = [] } = useQuery({
    queryKey: ['my-tickets', user?.email],
    queryFn: () => base44.entities.TradeTicket.filter({ client_email: user?.email }, '-created_date'),
    enabled: !!user?.email,
  });

  if (selected) {
    return (
      <div className="pt-8 lg:pt-0">
        <TicketView ticket={selected} onEdit={() => {}} onBack={() => setSelected(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Trade Tickets</h1>
        <p className="text-sm text-muted-foreground mt-1">{tickets.length} tickets</p>
      </div>

      <div className="space-y-2">
        {tickets.map(ticket => (
          <Card key={ticket.id} className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer" onClick={() => setSelected(ticket)}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold text-primary">{ticket.ticket_number}</span>
                  <Badge className={`text-[10px] ${statusColors[ticket.status]}`}>{ticket.status?.replace('_', ' ')}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{ticket.route}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-mono font-bold text-foreground">R{ticket.total_zar_equivalent?.toLocaleString() || '0'}</p>
                <p className="text-xs text-muted-foreground">{ticket.created_date ? format(new Date(ticket.created_date), 'dd MMM yyyy') : ''}</p>
              </div>
            </CardContent>
          </Card>
        ))}
        {tickets.length === 0 && (
          <Card className="p-12 bg-card border-border text-center">
            <Receipt className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No tickets yet</p>
          </Card>
        )}
      </div>
    </div>
  );
}