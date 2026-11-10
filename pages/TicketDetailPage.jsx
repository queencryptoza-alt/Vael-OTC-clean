import React from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import TicketView from '@/components/tickets/TicketView';

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useOutletContext();

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['tickets', id],
    queryFn: () => base44.entities.TradeTicket.get(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="pt-8 lg:pt-0 text-center py-12">
        <p className="text-muted-foreground">Ticket not found</p>
        <Button variant="outline" onClick={() => navigate('/tickets')} className="mt-4">
          Back to Tickets
        </Button>
      </div>
    );
  }

  return (
    <div className="pt-8 lg:pt-0">
      <TicketView
        ticket={ticket}
        onEdit={() => navigate(`/tickets/${id}/edit`)}
        onBack={() => navigate('/tickets')}
        isAdmin={user?.role === 'admin'}
      />
    </div>
  );
}