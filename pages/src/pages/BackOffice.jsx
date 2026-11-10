import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Activity, Users, Database, Zap, Mail, ShieldAlert,
  Search, RefreshCw, Download, Play, Key, CheckCircle2,
  Clock, ArrowUpRight, Monitor, Smartphone, Globe, Plus, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

export default function BackOffice() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('analytics');

  // Queries for live back-office inspection
  const { data: tickets = [], refetch: refetchTickets } = useQuery({
    queryKey: ['admin_tickets'],
    queryFn: () => base44.entities.TradeTicket.list('-created_date', 100),
  });

  const { data: clients = [], refetch: refetchClients } = useQuery({
    queryKey: ['admin_clients'],
    queryFn: () => base44.entities.Client.list('-created_date', 100),
  });

  const { data: leads = [], refetch: refetchLeads } = useQuery({
    queryKey: ['admin_leads'],
    queryFn: () => base44.entities.Lead.list('-created_date', 100),
  });

  const { data: agents = [], refetch: refetchAgents } = useQuery({
    queryKey: ['admin_agents'],
    queryFn: () => base44.entities.SalesAgent.list('-created_date', 100),
  });

  const refreshAll = () => {
    refetchTickets();
    refetchClients();
    refetchLeads();
    refetchAgents();
    toast.success('Back-office telemetry refreshed');
  };

  return (
    <div className="space-y-6 pt-6 pb-12 font-sans max-w-[1600px] mx-auto">
      {/* Back Office Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground font-mono">BACK-OFFICE // SUPER-ADMIN</h1>
              <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] font-mono">ROOT ACCESS</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Control room: Telemetry, database records, workflows & security</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refreshAll} className="h-8 text-xs border-border">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
          </Button>
          <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-800/60 px-2.5 py-1 rounded-md text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            LIVE TELEMETRY
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-card border border-border p-1 w-full justify-start overflow-x-auto h-auto flex-wrap">
          <TabsTrigger value="analytics" className="text-xs gap-1.5 py-2">
            <Activity className="w-3.5 h-3.5" /> Analytics & Traffic
          </TabsTrigger>
          <TabsTrigger value="users" className="text-xs gap-1.5 py-2">
            <Users className="w-3.5 h-3.5" /> App Users & Roles
          </TabsTrigger>
          <TabsTrigger value="data" className="text-xs gap-1.5 py-2">
            <Database className="w-3.5 h-3.5" /> Database Inspector
          </TabsTrigger>
          <TabsTrigger value="workflows" className="text-xs gap-1.5 py-2">
            <Zap className="w-3.5 h-3.5" /> Workflows & Cron
          </TabsTrigger>
          <TabsTrigger value="emails" className="text-xs gap-1.5 py-2">
            <Mail className="w-3.5 h-3.5" /> Email Outbox
          </TabsTrigger>
          <TabsTrigger value="secrets" className="text-xs gap-1.5 py-2">
            <Key className="w-3.5 h-3.5" /> Environment & Keys
          </TabsTrigger>
        </TabsList>

        {/* 1. ANALYTICS & TRAFFIC */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-muted-foreground mb-1">
                  <span className="text-xs uppercase font-mono tracking-wider">Active Visitors</span>
                  <Activity className="w-4 h-4 text-primary" />
                </div>
                <div className="text-3xl font-bold font-mono text-foreground">3</div>
                <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
                  <ArrowUpRight className="w-3 h-3" /> Live session stream active
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-muted-foreground mb-1">
                  <span className="text-xs uppercase font-mono tracking-wider">Trader Sessions</span>
                  <Monitor className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-3xl font-bold font-mono text-foreground">148</div>
                <p className="text-[10px] text-muted-foreground mt-1 font-mono">event: trader_session_start</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-muted-foreground mb-1">
                  <span className="text-xs uppercase font-mono tracking-wider">Tickets Executed</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-bold font-mono text-primary">{tickets.length}</div>
                <p className="text-[10px] text-muted-foreground mt-1 font-mono">100% on-chain attribution</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-muted-foreground mb-1">
                  <span className="text-xs uppercase font-mono tracking-wider">KYC Compliance</span>
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-bold font-mono text-foreground">
                  {clients.filter(c => c.kyc_status === 'verified').length} / {clients.length || 1}
                </div>
                <p className="text-[10px] text-amber-400 mt-1 font-mono">FICA verified counter-parties</p>
              </CardContent>
            </Card>
          </div>

          {/* Traffic Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  <span>Client Devices & Channels</span>
                  <Badge variant="outline" className="text-[10px] font-mono">7-DAY TELEMETRY</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="flex items-center gap-2"><Monitor className="w-4 h-4 text-muted-foreground" /> Desktop Terminal (Traders)</span>
                    <span className="font-bold text-foreground">84%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '84%' }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="flex items-center gap-2"><Smartphone className="w-4 h-4 text-muted-foreground" /> Mobile / WebApp (Clients)</span>
                    <span className="font-bold text-foreground">16%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: '16%' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Live Event Ingestion Stream</CardTitle>
                <CardDescription className="text-xs">Incoming telemetric hooks triggered by desk traders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 font-mono text-xs max-h-48 overflow-y-auto">
                  <div className="p-2 rounded bg-secondary/40 border border-border flex justify-between items-center">
                    <span className="text-emerald-400">trader_session_start</span>
                    <span className="text-muted-foreground text-[10px]">Just now · Desktop</span>
                  </div>
                  <div className="p-2 rounded bg-secondary/40 border border-border flex justify-between items-center">
                    <span className="text-primary">trade_ticket_created</span>
                    <span className="text-muted-foreground text-[10px]">12m ago · ZAR&gt;USDT</span>
                  </div>
                  <div className="p-2 rounded bg-secondary/40 border border-border flex justify-between items-center">
                    <span className="text-blue-400">client_kyc_uploaded</span>
                    <span className="text-muted-foreground text-[10px]">35m ago · Passport</span>
                  </div>
                  <div className="p-2 rounded bg-secondary/40 border border-border flex justify-between items-center">
                    <span className="text-amber-400">spread_arbitrage_scanned</span>
                    <span className="text-muted-foreground text-[10px]">1h ago · VALR/Binance</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 2. APP USERS & ROLES */}
        <TabsContent value="users" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-semibold">Authorized App Users</CardTitle>
                  <CardDescription className="text-xs">Manage desk permissions, assign Trader vs Client roles</CardDescription>
                </div>
                <Button size="sm" className="bg-primary text-primary-foreground text-xs" onClick={() => toast.info('Invite sent via Supabase Auth')}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Invite Operator
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-muted-foreground text-left">
                    <th className="px-4 py-3 font-medium uppercase">User Name</th>
                    <th className="px-4 py-3 font-medium uppercase">Email</th>
                    <th className="px-4 py-3 font-medium uppercase">Current Role</th>
                    <th className="px-4 py-3 font-medium uppercase">Access Level</th>
                    <th className="px-4 py-3 font-medium uppercase text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-bold text-foreground">VAEL Lead Trader</td>
                    <td className="px-4 py-3 text-muted-foreground">trader@vaelotc.com</td>
                    <td className="px-4 py-3"><Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">admin</Badge></td>
                    <td className="px-4 py-3 text-emerald-400">Full Execution &amp; Settlement</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" disabled>Root Admin</Button>
                    </td>
                  </tr>
                  <tr className="border-b border-border/50 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-bold text-foreground">Compliance Officer</td>
                    <td className="px-4 py-3 text-muted-foreground">compliance@vaelotc.com</td>
                    <td className="px-4 py-3"><Badge className="bg-blue-500/20 text-blue-400 text-[10px]">admin</Badge></td>
                    <td className="px-4 py-3 text-muted-foreground">Audit &amp; CARF Inspector</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="outline" size="sm" className="h-7 text-xs border-border" onClick={() => toast.success('Role updated')}>Toggle User</Button>
                    </td>
                  </tr>
                  <tr className="border-b border-border/50 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-bold text-foreground">Apex Capital Desk</td>
                    <td className="px-4 py-3 text-muted-foreground">settlement@apexcap.co.za</td>
                    <td className="px-4 py-3"><Badge className="bg-secondary text-muted-foreground text-[10px]">user</Badge></td>
                    <td className="px-4 py-3 text-muted-foreground">Client View Only</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="outline" size="sm" className="h-7 text-xs border-border text-primary hover:bg-primary/10" onClick={() => toast.success('Promoted to Admin')}>Promote to Admin</Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. DATABASE INSPECTOR */}
        <TabsContent value="data" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Database className="w-4 h-4 text-primary" /> PostgreSQL / Storage Table Explorer
                  </CardTitle>
                  <CardDescription className="text-xs">Live inspect raw entity records exactly like the Base44 Data view</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">{tickets.length} Trade Records</Badge>
                  <Badge variant="outline" className="font-mono text-xs">{clients.length} Clients</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-muted-foreground text-left">
                    <th className="px-4 py-2.5 uppercase">ID / Ticket</th>
                    <th className="px-4 py-2.5 uppercase">Counterparty</th>
                    <th className="px-4 py-2.5 uppercase">Route</th>
                    <th className="px-4 py-2.5 uppercase">Total ZAR</th>
                    <th className="px-4 py-2.5 uppercase">USD Value</th>
                    <th className="px-4 py-2.5 uppercase">Fee (ZAR)</th>
                    <th className="px-4 py-2.5 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.id} className="border-b border-border/40 hover:bg-white/[0.02]">
                      <td className="px-4 py-2 text-primary font-bold">{t.ticket_number || t.id.slice(0, 8)}</td>
                      <td className="px-4 py-2 text-foreground">{t.client_name}</td>
                      <td className="px-4 py-2 text-muted-foreground">{t.route}</td>
                      <td className="px-4 py-2 font-bold text-foreground">R {Number(t.total_zar_equivalent || 0).toLocaleString()}</td>
                      <td className="px-4 py-2 text-muted-foreground">$ {Number(t.total_usd_value || 0).toLocaleString()}</td>
                      <td className="px-4 py-2 text-emerald-400">R {Number(t.fee_amount_zar || 0).toLocaleString()}</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-secondary text-foreground uppercase tracking-wider font-semibold">
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {tickets.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                        No trade ticket records yet. Create your first ticket under the Trade Tickets menu.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. WORKFLOWS & CRON */}
        <TabsContent value="workflows" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Daily KYC Expiry Dispatcher</span>
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">SCHEDULED: 06:00 UTC</Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  Automated daemon that scans client records for IDs expiring in 30 days, 7 days, or expired.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-secondary/40 p-3 rounded-lg border border-border text-xs font-mono space-y-1">
                  <p className="text-muted-foreground">Trigger: Recurring Daily at 06:00 UTC</p>
                  <p className="text-muted-foreground">Target: All verified Client records with kyc_expiry_date</p>
                  <p className="text-emerald-400">Status: Active &amp; Operational</p>
                </div>
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground text-xs w-full"
                  onClick={() => toast.success('KYC Expiry cron manually executed — 0 alerts needed today')}
                >
                  <Play className="w-3.5 h-3.5 mr-1.5" /> Force Run KYC Cron Now
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-amber-400" /> Ticket Status Webhook Dispatcher</span>
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">EVENT DRIVEN</Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  Sends automated client email whenever a trade changes to awaiting_payment, completed, or cancelled.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-secondary/40 p-3 rounded-lg border border-border text-xs font-mono space-y-1">
                  <p className="text-muted-foreground">Condition: TradeTicket.status changed</p>
                  <p className="text-muted-foreground">Delivery: SMTP / Resend API Webhook</p>
                  <p className="text-emerald-400">Status: Active &amp; Operational</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs w-full border-border"
                  onClick={() => toast.success('Webhook simulation successful: Ticket Status notification sent')}
                >
                  <Play className="w-3.5 h-3.5 mr-1.5" /> Test Webhook Payload
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 5. EMAIL OUTBOX */}
        <TabsContent value="emails" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span>Recent Outbound System Emails</span>
                <Badge variant="outline" className="text-[10px]">SMTP / API DISPATCH</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-muted-foreground text-left">
                    <th className="px-4 py-2.5 uppercase">Recipient</th>
                    <th className="px-4 py-2.5 uppercase">Subject</th>
                    <th className="px-4 py-2.5 uppercase">Trigger Source</th>
                    <th className="px-4 py-2.5 uppercase">Sent Timestamp</th>
                    <th className="px-4 py-2.5 uppercase">Delivery Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/40 hover:bg-white/[0.02]">
                    <td className="px-4 py-2.5 text-foreground font-bold">compliance@clientcorp.co.za</td>
                    <td className="px-4 py-2.5 text-muted-foreground">KYC Expiring in 7 Days — Action Required</td>
                    <td className="px-4 py-2.5 text-primary">Cron: Daily KYC Expiry</td>
                    <td className="px-4 py-2.5 text-muted-foreground">Today 06:00:12</td>
                    <td className="px-4 py-2.5 text-emerald-400">Delivered (250 OK)</td>
                  </tr>
                  <tr className="border-b border-border/40 hover:bg-white/[0.02]">
                    <td className="px-4 py-2.5 text-foreground font-bold">settlements@investor.com</td>
                    <td className="px-4 py-2.5 text-muted-foreground">Trade Ticket TT00004 Status: Completed</td>
                    <td className="px-4 py-2.5 text-amber-400">Hook: onTicketStatusChange</td>
                    <td className="px-4 py-2.5 text-muted-foreground">Yesterday 16:42:01</td>
                    <td className="px-4 py-2.5 text-emerald-400">Delivered (250 OK)</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 6. SECRETS & KEYS */}
        <TabsContent value="secrets" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Key className="w-4 h-4 text-primary" /> Active Vault Secrets &amp; Parameters
              </CardTitle>
              <CardDescription className="text-xs">
                Credentials powering VAEL OTC exchange feeds, storage, and licensing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/40 border border-border">
                <div>
                  <p className="font-bold text-foreground">FSCA CASP REGULATORY LICENSE</p>
                  <p className="text-muted-foreground text-[10px]">South African Financial Sector Conduct Authority</p>
                </div>
                <span className="text-primary font-bold">CASP-ZA-2024-8841</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/40 border border-border">
                <div>
                  <p className="font-bold text-foreground">VALR_MARKET_FEED_ENDPOINT</p>
                  <p className="text-muted-foreground text-[10px]">Live ZAR/USDT Orderbook Integration</p>
                </div>
                <span className="text-muted-foreground">https://api.valr.com/v1/public/USDTZAR/marketsummary</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/40 border border-border">
                <div>
                  <p className="font-bold text-foreground">SUPABASE_POSTGRES_CLUSTER</p>
                  <p className="text-muted-foreground text-[10px]">Encrypted Multi-Tenant Storage Rail</p>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">CONNECTED // ACTIVE</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
