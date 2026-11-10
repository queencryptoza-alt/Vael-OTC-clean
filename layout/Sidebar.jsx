import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Receipt, Users, TrendingUp, FolderOpen,
  Newspaper, UserPlus, Handshake, ArrowLeftRight,
  DollarSign, LogOut, BarChart2, Settings, Sparkles,
  Shield, MessageSquareText, Globe, Map, Zap, CreditCard,
  ClipboardList, ArrowUpDown, Percent, Building2, Presentation,
  SlidersHorizontal, FileText
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

const adminSections = [
  {
    label: 'Overview',
    items: [
      { path: '/', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/global-map', label: 'Global Map', icon: Globe },
    ],
  },
  {
    label: 'Trade Management',
    items: [
      { path: '/trades', label: 'Trades', icon: ArrowUpDown },
      { path: '/tickets', label: 'Trade Tickets', icon: Receipt },
      { path: '/clients', label: 'Clients', icon: Users },
      { path: '/onboarding', label: 'Onboard Client', icon: UserPlus },
      { path: '/ramps', label: 'Ramps', icon: Map },
      { path: '/exchange', label: 'Exchange', icon: Zap },
      { path: '/arbitrage', label: 'Arbitrage', icon: ArrowLeftRight },
      { path: '/commissions', label: 'Commissions', icon: Percent },
      {
  label: 'Overview',
  items: [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin', label: 'Back Office (Root)', icon: Activity },
    { path: '/global-map', label: 'Global Map', icon: Globe },
  ],
},
    ],
  },
  {
    label: 'Infrastructure',
    items: [
      { path: '/payment-rails', label: 'Payment Rails', icon: CreditCard },
      { path: '/risk', label: 'Risk & Regulatory', icon: Shield },
    ],
  },
  {
    label: 'CRM',
    items: [
      { path: '/leads', label: 'CRM / Leads', icon: UserPlus },
      { path: '/partners', label: 'Partners', icon: Handshake },
      { path: '/communications', label: 'Communications Hub', icon: MessageSquareText },
    ],
  },
  {
    label: 'Documents',
    items: [
      { path: '/files', label: 'File Cabinet', icon: FolderOpen },
      { path: '/reports', label: 'Reports', icon: BarChart2 },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { path: '/news', label: 'News & Insights', icon: Newspaper },
      { path: '/advisor', label: 'Trading Advisor', icon: Sparkles },
    ],
  },
  {
    label: 'Organization',
    items: [
      { path: '/organizations', label: 'Organizations', icon: Building2 },
      { path: '/org-settings', label: 'Org Settings', icon: SlidersHorizontal },
    ],
  },
  {
    label: 'Sales',
    items: [
      { path: '/pitch', label: 'Pitch Deck', icon: Presentation },
      { path: '/overview', label: 'Platform Overview', icon: FileText },
    ],
  },
  {
    label: 'System',
    items: [
      { path: '/rates', label: 'Live Rates', icon: DollarSign },
      { path: '/audit-log', label: 'Audit Log', icon: ClipboardList },
      { path: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export default function Sidebar({ user }) {
  const location = useLocation();

  const NavLink = ({ item }) => {
    const isActive = location.pathname === item.path;
    return (
      <Link
        to={item.path}
        className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-all ${
          isActive
            ? 'bg-primary/10 text-primary font-medium border-l-[3px] border-primary pl-[9px]'
            : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.03] border-l-[3px] border-transparent pl-[9px]'
        }`}
      >
        <item.icon className="w-[15px] h-[15px] flex-shrink-0" />
        {item.label}
      </Link>
    );
  };

  return (
    <aside className="fixed top-0 left-0 h-full w-[220px] bg-sidebar border-r border-sidebar-border z-40 hidden lg:block">
      <div className="flex flex-col h-full">
        {/* Brand */}
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-primary/15 flex items-center justify-center">
              <Globe className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-[13px] font-bold text-foreground tracking-tight leading-tight">VAEL OTC</h1>
              <p className="text-[10px] text-primary uppercase font-mono tracking-[0.15em]">Admin Terminal</p>
            </div>
          </div>
        </div>

        {/* Full 25-Module Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-5">
          {adminSections.map((section, i) => (
            <div key={i} className="space-y-1">
              <p className="px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-[0.12em] mb-1.5">
                {section.label}
              </p>
              {section.items.map(item => (
                <NavLink key={item.path} item={item} />
              ))}
            </div>
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t border-border">
          <div className="px-2 py-1.5 mb-2">
            <p className="text-xs font-semibold text-foreground truncate">{user?.full_name || 'Desk Trader'}</p>
            <p className="text-[10px] text-primary font-mono truncate">Role: Super Admin</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-destructive h-8 text-xs"
            onClick={() => base44.auth.logout()}
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            Sign Out
          </Button>
        </div>
      </div>
    </aside>
  );
}
