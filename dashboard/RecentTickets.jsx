import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const statusColors = {
  draft: 'bg-muted text-muted-foreground',
  in_progress: 'bg-primary/20 text-primary',
  awaiting_payment: 'bg-yellow-500/20 text-yellow-400',
  completed: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-destructive/20 text-destructive',
};

export default function RecentTickets({ tickets }) {
  const recent = tickets.slice(0, 6);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Recent Tickets
        </CardTitle>
        <Link to="/tickets" className="text-xs text-primary hover:underline">View all</Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recent.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No tickets yet</p>
          )}
          {recent.map(ticket => (
            <Link
              key={ticket.id}
              to={`/tickets?id=${ticket.id}`}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-primary">{ticket.ticket_number}</span>
                  <Badge className={`text-[10px] ${statusColors[ticket.status] || statusColors.draft}`}>
                    {ticket.status?.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-foreground mt-0.5 truncate">{ticket.client_name}</p>
                <p className="text-xs text-muted-foreground">{ticket.route}</p>
              </div>
              <div className="text-right ml-4">
                <p className="text-sm font-mono font-semibold text-foreground">
                  R{ticket.total_zar_equivalent?.toLocaleString() || '0'}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {ticket.created_date ? format(new Date(ticket.created_date), 'dd MMM') : ''}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}