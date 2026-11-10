import React from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import TicketForm from '@/components/tickets/TicketForm';

export default function TicketFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useOutletContext();
  const queryClient = useQueryClient();

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['tickets', id],
    queryFn: () => base44.entities.TradeTicket.get(id),
    enabled: !!id,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.TradeTicket.create(data),
    onMutate: async (newTicket) => {
      await queryClient.cancelQueries({ queryKey: ['tickets'] });
      const previous = queryClient.getQueryData(['tickets']);
      queryClient.setQueryData(['tickets'], (old) => [...(old || []), { ...newTicket, id: 'temp-' + Date.now() }]);
      return { previous };
    },
    onError: (err, newTicket, context) => {
      queryClient.setQueryData(['tickets'], context.previous);
    },
    onSuccess: async (newTicket) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      base44.analytics.track({ eventName: 'trade_ticket_created' });
      if (newTicket?.client_email) {
        try {
          await base44.integrations.Core.SendEmail({
            to: newTicket.client_email,
            subject: `Trade Ticket ${newTicket.ticket_number} Created`,
            body: `Hi ${newTicket.client_name},\n\nYour trade ticket ${newTicket.ticket_number} has been created.\n\nRoute: ${newTicket.route}\nTotal ZAR: R${newTicket.total_zar_equivalent?.toLocaleString()}\n\nYou can view your ticket details by logging into the app.\n\nThank you for trading with us!`,
          });
        } catch (e) {
          console.error('Email send failed:', e);
        }
      }
      navigate('/tickets');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TradeTicket.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['tickets'] });
      const previous = queryClient.getQueryData(['tickets']);
      queryClient.setQueryData(['tickets'], (old) => (old || []).map(t => t.id === id ? { ...t, ...data } : t));
      return { previous };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['tickets'], context.previous);
    },
    onSuccess: (updatedTicket, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      if (variables.data?.status === 'completed') {
        base44.analytics.track({
          eventName: 'trade_volume_processed_zar',
          properties: { zar: updatedTicket?.total_zar_equivalent || variables.data?.total_zar_equivalent || 0 },
        });
      }
      navigate('/tickets');
    },
  });

  const handleSave = async (data) => {
    if (id) {
      await updateMutation.mutateAsync({ id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  if (id && isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pt-8 lg:pt-0">
      <Button variant="ghost" size="sm" onClick={() => navigate('/tickets')} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Tickets
      </Button>
      <TicketForm
        ticket={id ? ticket : null}
        onSave={handleSave}
        onCancel={() => navigate('/tickets')}
      />
    </div>
  );
}