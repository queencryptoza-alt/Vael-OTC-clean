import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Layers, Zap, CreditCard, CheckCircle2, ArrowLeftRight, Shield, Wallet } from 'lucide-react';

const TABS = ['Overview', 'Africa', 'Americas & Asia', 'Transaction Limits', 'Wallet Custody'];

const STATS = [
  { icon: Globe, value: '20+', label: 'Countries', sub: 'Africa + LatAm + Asia + EU' },
  { icon: Layers, value: '30+', label: 'Blockchains', sub: 'Multi-chain wallet infra' },
  { icon: Zap, value: '25+', label: 'Mobile Networks', sub: 'MTN, M-Pesa, Airtel & more' },
  { icon: CreditCard, value: '2', label: 'Payment Methods', sub: 'Bank Transfer + Mobile Money' },
];

const DIGITAL_WALLETS = [
  { title: 'Create Vaults', desc: 'Primary containers for managing digital assets — one per client or use-case' },
  { title: 'Custom Sub-Wallets', desc: 'Unlimited sub-wallets for customers, treasury, or payment flows' },
  { title: '30+ Blockchains', desc: 'USDT (TRC20/ERC20), USDC, BTC, ETH, LTC, XRP and more' },
  { title: 'Flexible Custody', desc: 'Self-custody — you hold private keys' },
  { title: 'Send & Receive', desc: 'On-chain sends to any address; webhook notifications for all events' },
];

const CONVERT_ROWS = [
  { label: 'Receive flow', value: 'forceAccept + directSettlement + settlementInfo (walletAddress, cryptoCurrency, network)', highlight: true },
  { label: 'Send flow', value: 'forceAccept + directSettlement + settlementInfo (cryptoCurrency, network, cryptoAmount)', highlight: true },
  { label: 'Auto refund', value: 'Specify refundAddress or refundToSourceAddress on send failure', highlight: false },
  { label: 'Supported rails', value: 'TRC20 (USDT), ERC20, Lightning, XLM Memo, XRP Tag', highlight: false },
];

const AFRICA_CORRIDORS = [
  { from: 'ZAR', to: 'USDT', route: 'South Africa → Crypto', partner: 'VALR / Luno', limits: 'R1M/day', status: 'active' },
  { from: 'KES', to: 'USDT', route: 'Kenya → Crypto', partner: 'M-Pesa', limits: '$10K/day', status: 'active' },
  { from: 'NGN', to: 'USDT', route: 'Nigeria → Crypto', partner: 'GTBank', limits: '₦5M/day', status: 'maintenance' },
  { from: 'GHS', to: 'USDT', route: 'Ghana → Crypto', partner: 'MTN MoMo', limits: 'GHS50K/day', status: 'active' },
  { from: 'AED', to: 'USDT', route: 'UAE → Crypto', partner: 'Emirates NBD', limits: 'AED200K/day', status: 'active' },
];

const LIMITS = [
  { tier: 'Starter', daily: 'R50,000', monthly: 'R500,000', kyc: 'Basic KYC', fee: '1.5%' },
  { tier: 'Professional', daily: 'R500,000', monthly: 'R5,000,000', kyc: 'Full KYC', fee: '1.2%' },
  { tier: 'Institutional', daily: 'R5,000,000', monthly: 'R50,000,000', kyc: 'Enhanced DD', fee: '0.8%' },
  { tier: 'Custom', daily: 'Negotiated', monthly: 'Negotiated', kyc: 'Custom', fee: 'Custom' },
];

const statusColors = { active: 'bg-green-500/20 text-green-400', maintenance: 'bg-yellow-500/20 text-yellow-400' };

export default function PaymentRails() {
  const [tab, setTab] = useState('Overview');

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Payment Rails</h1>
        <p className="text-sm text-muted-foreground mt-1">Global corridors, wallet infrastructure & digital asset management</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-card border border-border rounded-lg p-1 w-fit flex-wrap">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${tab === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map(s => (
              <Card key={s.label} className="bg-card border-border">
                <CardContent className="p-4 flex gap-3 items-start">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <s.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{s.value}</p>
                    <p className="text-xs font-medium text-foreground">{s.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-primary" /> Digital Asset Wallets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {DIGITAL_WALLETS.map(w => (
                  <div key={w.title} className="flex gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{w.title}</p>
                      <p className="text-xs text-muted-foreground">{w.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ArrowLeftRight className="w-4 h-4 text-primary" /> Convert Currency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">Single-transaction crypto↔fiat conversion — customers send local currency and receive crypto (or vice versa).</p>
                <div className="space-y-2">
                  {CONVERT_ROWS.map(r => (
                    <div key={r.label} className="flex gap-3">
                      <span className={`text-xs font-medium shrink-0 w-28 ${r.highlight ? 'text-primary' : 'text-muted-foreground'}`}>{r.label}</span>
                      <span className="text-xs text-foreground">{r.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-[10px] text-yellow-400">Payment Reasons required: gift, bills, groceries, travel, health, education, business, salary, investment</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {tab === 'Africa' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Active corridors across Africa with fiat↔crypto settlement</p>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30">
                {['From','To','Route','Partner','Daily Limit','Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {AFRICA_CORRIDORS.map((c, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-mono text-xs bg-primary/10 text-primary rounded">{c.from}</td>
                    <td className="px-4 py-3 font-mono text-xs bg-primary/10 text-primary rounded">{c.to}</td>
                    <td className="px-4 py-3 text-xs text-foreground">{c.route}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{c.partner}</td>
                    <td className="px-4 py-3 text-xs font-mono text-foreground">{c.limits}</td>
                    <td className="px-4 py-3"><Badge className={`text-[10px] ${statusColors[c.status]}`}>{c.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'Transaction Limits' && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30">
                {['Tier','Daily Limit','Monthly Limit','KYC Required','Fee'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {LIMITS.map((l, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-medium text-foreground">{l.tier}</td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{l.daily}</td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{l.monthly}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{l.kyc}</td>
                    <td className="px-4 py-3 text-xs font-mono text-primary">{l.fee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'Wallet Custody' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[
            { title: 'Self Custody', desc: 'You hold private keys. Full control, full responsibility. Recommended for advanced users.', icon: Shield, color: 'text-primary' },
            { title: 'Multi-sig', desc: '2-of-3 or 3-of-5 multi-signature setup for institutional grade security.', icon: Layers, color: 'text-blue-400' },
            { title: 'Hot Wallets', desc: 'Always-online wallets for high-frequency trading and liquidity management.', icon: Zap, color: 'text-yellow-400' },
            { title: 'Cold Storage', desc: 'Offline key storage for large reserves. Transfer delays apply.', icon: CreditCard, color: 'text-green-400' },
          ].map(c => (
            <Card key={c.title} className="bg-card border-border">
              <CardContent className="p-5 flex gap-4">
                <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 ${c.color}`}>
                  <c.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{c.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{c.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tab === 'Americas & Asia' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Corridors across Americas & Asia Pacific</p>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30">
                {['From','To','Route','Partner','Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {[
                  { from: 'USD', to: 'USDT', route: 'USA → Crypto', partner: 'Kraken / Coinbase', status: 'active' },
                  { from: 'SGD', to: 'USDT', route: 'Singapore → Crypto', partner: 'DBS Bank', status: 'active' },
                  { from: 'BRL', to: 'USDT', route: 'Brazil → Crypto', partner: 'Mercado Pago', status: 'active' },
                  { from: 'INR', to: 'USDT', route: 'India → Crypto', partner: 'Razorpay', status: 'maintenance' },
                ].map((c, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-mono text-xs text-primary">{c.from}</td>
                    <td className="px-4 py-3 font-mono text-xs text-primary">{c.to}</td>
                    <td className="px-4 py-3 text-xs text-foreground">{c.route}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{c.partner}</td>
                    <td className="px-4 py-3"><Badge className={`text-[10px] ${statusColors[c.status]}`}>{c.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}