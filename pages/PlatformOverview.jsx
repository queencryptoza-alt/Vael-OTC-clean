import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Download, Globe, ShieldCheck, TrendingUp, Users, Zap, MessageSquareText,
  BarChart3, Building2, ArrowLeftRight, Percent, Map, FileText,
  CheckCircle2, Lock, Rocket, Sparkles, CreditCard, UserPlus, Loader2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function PlatformOverview() {
  const [exporting, setExporting] = useState(null);
  const fullRef = useRef(null);
  const onePagerRef = useRef(null);

  const exportPDF = async (which) => {
    const ref = which === 'full' ? fullRef : onePagerRef;
    if (!ref.current) return;
    setExporting(which);
    try {
      const node = ref.current;
      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: '#08080a',
        logging: false,
        windowWidth: 900,
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const imgWidth = 800;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [imgWidth, imgHeight] });
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      pdf.save(which === 'full' ? 'VAEL-OTC-Platform-Overview.pdf' : 'VAEL-OTC-One-Pager.pdf');
    } catch (e) {
      console.error(e);
      alert('Failed to generate PDF.');
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="pt-8 lg:pt-0 space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Platform Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Shareable documents for interested parties</p>
        </div>
      </div>

      {/* FULL OVERVIEW */}
      <div className="flex items-center justify-end">
        <Button onClick={() => exportPDF('full')} disabled={exporting === 'full'} size="sm" className="bg-primary text-primary-foreground">
          {exporting === 'full' ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Generating...</> : <><Download className="w-4 h-4 mr-1" /> Download Full Overview PDF</>}
        </Button>
      </div>

      <div ref={fullRef} className="bg-card border border-border rounded-2xl p-10 space-y-8">
        {/* Header */}
        <div className="text-center border-b border-border pb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center"><Globe className="w-6 h-6 text-primary" /></div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">VAEL OTC</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Institutional OTC Crypto Trading Terminal for South African Licensed Dealers</p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <Badge className="bg-primary/10 text-primary border border-primary/20">FSCA-Aligned</Badge>
            <Badge className="bg-primary/10 text-primary border border-primary/20">CARF Ready</Badge>
            <Badge className="bg-primary/10 text-primary border border-primary/20">Multi-Tenant SaaS</Badge>
            <Badge className="bg-primary/10 text-primary border border-primary/20">Travel-Rule Compliant</Badge>
          </div>
        </div>

        {/* The Problem */}
        <Section icon={Lock} title="The Problem">
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Running a licensed crypto OTC desk in South Africa is operationally brutal. Dealers juggle fragmented tools, manual compliance, and disconnected workflows:
          </p>
          <ul className="space-y-2">
            {[
              'Rates scattered across XE, VALR, Luno, and Binance — no single source of truth.',
              'FSCA licensing, FICA/AML, SARB exchange control, and CARF reporting are manual and error-prone.',
              'Trade tickets, beneficiaries, and KYC records live in spreadsheets and WhatsApp groups.',
              'No structured way to attribute trades to sales agents or scale the desk to new entities.',
            ].map((p, i) => (
              <li key={i} className="flex gap-3 text-sm text-muted-foreground"><span className="text-destructive mt-0.5">✕</span> {p}</li>
            ))}
          </ul>
        </Section>

        {/* The Solution */}
        <Section icon={Rocket} title="The Solution">
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            VAEL OTC is a single terminal that unifies pricing, trade execution, settlement, compliance, and client management — purpose-built for the SA regulatory environment.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: BarChart3, name: 'Command Dashboard', desc: 'Live desk P&L, volume, ticket pipeline & arbitrage at a glance.' },
              { icon: Globe, name: 'Global Map', desc: 'Real-time view of ramp network and active corridors across 20+ countries.' },
              { icon: ArrowLeftRight, name: 'Trades & Tickets', desc: 'Full trade lifecycle with PDF quotes and Signal-ready settlement instructions.' },
              { icon: Users, name: 'Clients & KYC', desc: 'Client book with KYC status, risk rating, and beneficiary vault.' },
              { icon: UserPlus, name: 'Guided Onboarding', desc: 'Step-by-step KYC and business profile capture for new clients.' },
              { icon: Map, name: 'Ramps & Payment Rails', desc: '20+ countries, 30+ chains, bank & mobile-money corridors.' },
              { icon: Zap, name: 'Exchange & Arbitrage', desc: 'Cross-exchange spread calculator to capture the SA crypto premium.' },
              { icon: ShieldCheck, name: 'Risk & Regulatory', desc: 'CARF validation, error logs, and one-click compliance reports.' },
              { icon: MessageSquareText, name: 'Communications Hub', desc: 'WhatsApp / Telegram / Signal client chat converted to RFQ tickets.' },
              { icon: Percent, name: 'Commission Engine', desc: 'Auto-attribute trades to agents and compile monthly payout reports.' },
              { icon: Building2, name: 'Multi-Tenant Orgs', desc: 'Full data isolation per organization with custom branding and rules.' },
              { icon: FileText, name: 'Pitch Deck', desc: 'Built-in sales presentation with high-fidelity PDF export.' },
            ].map((m) => (
              <div key={m.name} className="p-4 rounded-xl border border-border bg-background/50">
                <div className="flex items-center gap-2 mb-2"><m.icon className="w-4 h-4 text-primary" /><span className="text-sm font-semibold text-foreground">{m.name}</span></div>
                <p className="text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Compliance */}
        <Section icon={ShieldCheck} title="Compliance Architecture">
          <div className="space-y-3">
            {[
              ['CARF Validation', 'Crypto-Asset Reporting Framework validation and error logging, ready for SARS automatic exchange of information.'],
              ['FICA / AML KYC', 'KYC tracking with expiry alerts and hard-stops on lapsed verifications — no client trades on an expired check.'],
              ['SARB Exchange Control', 'Exchange-control-aware routing and audit-grade trail on every trade action.'],
              ['FATF Travel Rule', 'Originator and beneficiary data captured natively at the ticket level for cross-border settlement.'],
              ['Audit Log', 'Immutable action log across all entities for regulator-ready evidence.'],
            ].map(([t, d]) => (
              <div key={t} className="flex gap-3 items-start">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div><span className="text-sm font-semibold text-foreground">{t}</span><p className="text-xs text-muted-foreground mt-0.5">{d}</p></div>
              </div>
            ))}
          </div>
        </Section>

        {/* Multi-Tenancy */}
        <Section icon={Building2} title="Multi-Tenant Architecture">
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            VAEL OTC is built as multi-tenant SaaS from the ground up. Onboard a new licensed desk in minutes — each with fully isolated data, custom parameters, and independent compliance.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              'Per-organization data isolation (clients, trades, agents, files)',
              'Custom fee structures, trading limits, and currency preferences',
              'Per-organization branding and accent colors',
              'Module enable/disable per plan tier',
              'Plan tiers: Trial → Starter → Professional → Institutional → Enterprise',
              'FSCA license number tracking per organization',
            ].map((p, i) => (
              <div key={i} className="flex gap-2 items-start text-xs text-muted-foreground"><CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> {p}</div>
            ))}
          </div>
        </Section>

        {/* Business Model */}
        <Section icon={TrendingUp} title="Business Model">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Sell the terminal to multiple licensed OTC desks simultaneously. Each organization pays a subscription based on plan tier and seat count. The platform scales revenue without scaling infrastructure — one codebase, ten or a hundred isolated desks, each running their own branded terminal with their own rules.
          </p>
        </Section>

        {/* Tech */}
        <Section icon={Sparkles} title="Technology">
          <div className="flex flex-wrap gap-2">
            {['React', 'Tailwind CSS', 'Real-time Data Sync', 'PDF Export Engine', 'Multi-Tenant Database', 'Role-Based Access Control', 'Row-Level Security', 'Mobile-Responsive'].map(t => (
              <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
            ))}
          </div>
        </Section>

        {/* Footer */}
        <div className="text-center border-t border-border pt-6">
          <p className="text-xs text-muted-foreground">vael-otc.base44.app · FSCA-aligned · CARF & Travel-Rule ready</p>
        </div>
      </div>

      {/* ONE PAGER */}
      <div className="flex items-center justify-between pt-4">
        <h2 className="text-lg font-bold text-foreground">One-Pager</h2>
        <Button onClick={() => exportPDF('onepager')} disabled={exporting === 'onepager'} size="sm" variant="outline">
          {exporting === 'onepager' ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Generating...</> : <><Download className="w-4 h-4 mr-1" /> Download One-Pager PDF</>}
        </Button>
      </div>

      <div ref={onePagerRef} className="bg-card border border-border rounded-2xl p-10">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center"><Globe className="w-5 h-5 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">VAEL OTC</h1>
            <p className="text-xs text-muted-foreground">Institutional OTC Crypto Trading Terminal</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">What</p>
            <p className="text-sm text-muted-foreground leading-relaxed">An all-in-one terminal that unifies live pricing, trade ticketing, settlement, KYC onboarding, compliance reporting, and client communications for South African licensed crypto OTC desks.</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Who It's For</p>
            <p className="text-sm text-muted-foreground leading-relaxed">FSCA-licensed Crypto Asset Service Providers, OTC desks, and crypto brokers operating in or routing through South Africa.</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Key Capabilities</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Live multi-exchange rate aggregation',
                'Full trade lifecycle & PDF ticketing',
                'Guided KYC onboarding wizard',
                'CARF / FICA / SARB compliance engine',
                'Cross-exchange arbitrage spread calculator',
                'WhatsApp / Telegram / Signal comms hub',
                'Sales agent commission tracking',
                'Multi-tenant — sell to multiple desks',
              ].map((f, i) => (
                <div key={i} className="flex gap-2 items-start text-xs text-muted-foreground"><CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" /> {f}</div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">By the Numbers</p>
            <div className="grid grid-cols-4 gap-3">
              {[['20+', 'Countries'], ['30+', 'Chains'], ['5', 'Exchanges'], ['100%', 'CARF-Ready']].map(([v, l]) => (
                <div key={l} className="text-center p-3 rounded-lg border border-border bg-background/50">
                  <p className="text-2xl font-bold text-primary font-mono">{v}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{l}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Why It Wins</p>
            <p className="text-sm text-muted-foreground leading-relaxed">Purpose-built for SA regulation — not a generic tool retrofitted. Compliance is baked into every trade, not bolted on. And it's multi-tenant from day one: sell it to ten desks on one platform.</p>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">vael-otc.base44.app</p>
            <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs">Deploy in days, not months</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Icon className="w-4 h-4 text-primary" /></div>
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  );
}