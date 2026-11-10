import React, { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Receipt, Users, UserPlus, DollarSign } from 'lucide-react';
import StatsRow from '../components/dashboard/StatsRow';
import LeadsPipeline from '../components/dashboard/LeadsPipeline';
import RecentTickets from '../components/dashboard/RecentTickets';
import TradingSummary from '../components/dashboard/TradingSummary';
import TradeAnalytics from '../components/dashboard/TradeAnalytics';
import CurrencyConverter from '../components/dashboard/CurrencyConverter';
import ArbitrageCard from '../components/dashboard/ArbitrageCard';
import PullToRefresh from '../components/shared/PullToRefresh';

let sessionStartFired = false;

export default function Dashboard() {
  const { user } = useOutletContext();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (user && !sessionStartFired) {
      sessionStartFired = true;
      base44.analytics.track({ eventName: 'trader_session_start' });
    }
  }, [user]);

  const { data: tickets = [], refetch: refetchTickets } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => base44.entities.TradeTicket.list('-created_date', 50),
  });

  const { data: clients = [], refetch: refetchClients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
    enabled: isAdmin,
  });

  const { data: leads = [], refetch: refetchLeads } = useQuery({
    queryKey: ['leads'],
    queryFn: () => base44.entities.Lead.list(),
    enabled: isAdmin,
  });

  const completedTickets = tickets.filter(t => t.status === 'completed');
  const totalVolume = completedTickets.reduce((sum, t) => sum + (t.total_zar_equivalent || 0), 0);
  const activeTickets = tickets.filter(t => t.status === 'in_progress' || t.status === 'awaiting_payment');

  const stats = [
    { label: 'Total Volume', value: `R${totalVolume.toLocaleString()}`, icon: DollarSign, change: 12 },
    { label: 'Active Tickets', value: activeTickets.length, icon: Receipt },
    { label: 'Clients', value: clients.length, icon: Users },
    { label: 'Leads', value: leads.filter(l => l.stage !== 'won' && l.stage !== 'lost').length, icon: UserPlus },
  ];

  if (!isAdmin) {
    const myTickets = tickets.filter(t => t.client_email === user?.email);
    return (
      <PullToRefresh onRefresh={async () => { await refetchTickets(); }}>
      <div className="space-y-6 pt-8 lg:pt-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.full_name?.split(' ')[0] || 'there'}</h1>
          <p className="text-sm text-muted-foreground mt-1">Your trading overview</p>
        </div>
        <RecentTickets tickets={myTickets} />
      </div>
      </PullToRefresh>
    );
  }

  const handleRefresh = async () => { await Promise.all([refetchTickets(), refetchClients(), refetchLeads()]); };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="space-y-6 pt-8 lg:pt-0">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Trading Terminal</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <StatsRow stats={stats} />

      <TradingSummary tickets={tickets} />

      <TradeAnalytics tickets={tickets} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentTickets tickets={tickets} />
        <LeadsPipeline leads={leads} />
        <CurrencyConverter />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ArbitrageCard />
      </div>
    </div>
    </PullToRefresh>
  );
}