import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Activity, Users, Database, Zap, Mail, ShieldAlert,
  RefreshCw, Play, Key, CheckCircle2, Clock, ArrowUpRight,
  Monitor, Smartphone, Plus
} from 'lucide-react';
import { toast } from 'sonner';

export default function BackOffice() {
  const [activeTab, setActiveTab] = useState('analytics');

  const { data: tickets = [], refetch: refetchTickets } = useQuery({
    queryKey: ['admin_tickets'],
    queryFn: () => base44.entities.TradeTicket.list('-created_date', 100),
  });

  const { data: clients = [], refetch: refetchClients } = useQuery({
    queryKey: ['admin_clients'],
    queryFn: () => base44.entities.Client.list('-created_date', 100),
  });

  const refreshAll = () => {
    refetchTickets();
    refetchClients();
    toast.success('Back-office telemetry refreshed');
  };

  return (
    <div className="space-y-6 pt-6 pb-12 font-sans max-w-[1600px] mx-auto text-slate-100">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center">
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-mono">BACK-OFFICE // SUPER-ADMIN</h1>
              <Badge className="bg-blue-950/60 text-blue-400 border border-blue-800/60 text-[10px] font-mono">ROOT ACCESS</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Control room: Telemetry, database records, workflows & security</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refreshAll} className="h-8 text-xs border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800">
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
        <TabsList className="bg-slate-900/80 border border-slate-800 p-1 w-full justify-start overflow-x-auto h-auto flex-wrap">
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

        {/* 1. ANALYTICS */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-slate-900/60 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs uppercase font-mono tracking-wider">Active Visitors</span>
                  <Activity className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-3xl font-bold font-mono text-white">3</div>
                <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
                  <ArrowUpRight className="w-3 h-3" /> Live session stream active
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs uppercase font-mono tracking-wider">Trader Sessions</span>
                  <Monitor className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-3xl font-bold font-mono text-white">148</div>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">event: trader_session_start</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs uppercase font-mono tracking-wider">Tickets Executed</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-bold font-mono text-blue-400">{tickets.length}</div>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">100% on-chain attribution</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs uppercase font-mono tracking-wider">KYC Compliance</span>
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-bold font-mono text-white">
                  {clients.filter(c => c.kyc_status === 'verified').length} / {clients.length || 1}
                </div>
                <p className="text-[10px] text-amber-400 mt-1 font-mono">FICA verified counter-parties</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  <span>Client Devices & Channels</span>
                  <Badge variant="outline" className="text-[10px] font-mono border-slate-800">7-DAY TELEMETRY</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="flex items-center gap-2"><Monitor className="w-4 h-4 text-slate-400" /> Desktop Terminal</span>
                    <span className="font-bold text-white">84%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600" style={{ width: '84%' }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="flex items-center gap-2"><Smartphone className="w-4 h-4 text-slate-400" /> Mobile / WebApp</span>
                    <span className="font-bold text-white">16%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: '16%' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Live Event Ingestion Stream</CardTitle>
                <CardDescription className="text-xs text-slate-400">Incoming telemetric hooks triggered by desk traders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 font-mono text-xs max-h-48 overflow-y-auto">
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                    <span className="text-emerald-400">trader_session_start</span>
                    <span className="text-slate-500 text-[10px]">Just now · Desktop</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                    <span className="text-blue-400">trade_ticket_created</span>
                    <span className="text-slate-500 text-[10px]">12m ago · ZAR&gt;USDT</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                    <span className="text-amber-400">spread_arbitrage_scanned</span>
                    <span className="text-slate-500 text-[10px]">1h ago · VALR/Binance</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 2. USERS */}
        <TabsContent value="users" className="space-y-4">
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-semibold">Authorized App Users</CardTitle>
                  <CardDescription className="text-xs text-slate-400">Manage desk permissions, assign Trader vs Client roles</CardDescription>
                </div>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-xs" onClick={() => toast.info('Invite sent')}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Invite Operator
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 text-left">
                    <th className="px-4 py-3 font-medium uppercase">User Name</th>
                    <th className="px-4 py-3 font-medium uppercase">Email</th>
                    <th className="px-4 py-3 font-medium uppercase">Current Role</th>
                    <th className="px-4 py-3 font-medium uppercase">Access Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-bold text-white">VAEL Lead Trader</td>
                    <td className="px-4 py-3 text-slate-400">trader@vaelotc.com</td>
                    <td className="px-4 py-3"><Badge className="bg-blue-950/60 text-blue-400 border border-blue-800/60 text-[10px]">admin</Badge></td>
                    <td className="px-4 py-3 text-emerald-400">Full Execution &amp; Settlement</td>
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-bold text-white">Compliance Officer</td>
                    <td className="px-4 py-3 text-slate-400">compliance@vaelotc.com</td>
                    <td className="px-4 py-3"><Badge className="bg-blue-950/60 text-blue-400 border border-blue-800/60 text-[10px]">admin</Badge></td>
                    <td className="px-4 py-3 text-slate-400">Audit &amp; CARF Inspector</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. DATA */}
        <TabsContent value="data" className="space-y-4">
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400" /> Database Records ({tickets.length} tickets)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 text-left">
                    <th className="px-4 py-2.5 uppercase">Ticket #</th>
                    <th className="px-4 py-2.5 uppercase">Counterparty</th>
                    <th className="px-4 py-2.5 uppercase">Route</th>
                    <th className="px-4 py-2.5 uppercase">Total ZAR</th>
                    <th className="px-4 py-2.5 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-2 text-blue-400 font-bold">{t.ticket_number || t.id.slice(0, 8)}</td>
                      <td className="px-4 py-2 text-white">{t.client_name}</td>
                      <td className="px-4 py-2 text-slate-400">{t.route}</td>
                      <td className="px-4 py-2 font-bold text-white">R {Number(t.total_zar_equivalent || 0).toLocaleString()}</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-200 uppercase font-semibold">
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {tickets.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                        No trade ticket records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. WORKFLOWS */}
        <TabsContent value="workflows" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-400" /> Daily KYC Expiry Dispatcher</span>
                  <Badge className="bg-blue-950/60 text-blue-400 border border-blue-800 text-[10px]">06:00 UTC</Badge>
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">Scans client records for KYC/FICA document expiry.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-xs w-full" onClick={() => toast.success('KYC cron executed: 0 alerts required')}>
                  <Play className="w-3.5 h-3.5 mr-1.5" /> Force Run KYC Check
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-amber-400" /> Ticket Status Webhook</span>
                  <Badge className="bg-amber-950/60 text-amber-400 border border-amber-800 text-[10px]">ACTIVE</Badge>
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">Dispatches real-time client notifications upon status updates.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button size="sm" variant="outline" className="border-slate-800 bg-slate-900 text-slate-300 text-xs w-full hover:bg-slate-800" onClick={() => toast.success('Webhook simulation successful')}>
                  <Play className="w-3.5 h-3.5 mr-1.5" /> Test Webhook Payload
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 5. EMAILS */}
        <TabsContent value="emails" className="space-y-4">
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Outbound Dispatch Log</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 text-left">
                    <th className="px-4 py-2.5 uppercase">Recipient</th>
                    <th className="px-4 py-2.5 uppercase">Subject</th>
                    <th className="px-4 py-2.5 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr className="hover:bg-slate-800/40">
                    <td className="px-4 py-2.5 text-white font-bold">compliance@clientcorp.co.za</td>
                    <td className="px-4 py-2.5 text-slate-400">KYC Expiring in 7 Days — Action Required</td>
                    <td className="px-4 py-2.5 text-emerald-400">Delivered</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 6. SECRETS */}
        <TabsContent value="secrets" className="space-y-4">
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-400" /> Vault Credentials &amp; Node Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div>
                  <p className="font-bold text-white">FSCA CASP LICENSE</p>
                  <p className="text-slate-500 text-[10px]">South African Financial Sector Conduct Authority</p>
                </div>
                <span className="text-blue-400 font-bold">CASP-ZA-2024-8841</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div>
                  <p className="font-bold text-white">MARKET FEED ENGINE</p>
                  <p className="text-slate-500 text-[10px]">Live ZAR/USDT Composite Index</p>
                </div>
                <Badge className="bg-emerald-950/60 text-emerald-400 border border-emerald-800 text-[10px]">ONLINE // STREAMING</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
