import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ArrowUpDown, Receipt, Users, MoreHorizontal, X, LogOut,
  Settings as SettingsIcon, FolderOpen, Newspaper, DollarSign, Shield,
  MessageSquareText, Globe, Map, Zap, CreditCard, ArrowLeftRight, Percent,
  Building2, Presentation, FileText, UserPlus, Handshake, ClipboardList,
  SlidersHorizontal, BarChart2, Sparkles
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

const adminTabs = [
  { path: '/', label: 'Home', icon: LayoutDashboard },
  { path: '/trades', label: 'Trades', icon: ArrowUpDown },
  { path: '/tickets', label: 'Tickets', icon: Receipt },
  { path: '/clients', label: 'Clients', icon: Users },
];

const clientTabs = [
  { path: '/', label: 'Home', icon: LayoutDashboard },
  { path: '/my-tickets', label: 'Tickets', icon: Receipt },
  { path: '/my-files', label: 'Files', icon: FolderOpen },
];

const adminMoreItems = [
  { path: '/global-map', label: 'Global Map', icon: Globe },
  { path: '/onboarding', label: 'Onboard', icon: UserPlus },
  { path: '/ramps', label: 'Ramps', icon: Map },
  { path: '/exchange', label: 'Exchange', icon: Zap },
  { path: '/arbitrage', label: 'Arbitrage', icon: ArrowLeftRight },
  { path: '/commissions', label: 'Commissions', icon: Percent },
  { path: '/payment-rails', label: 'Rails', icon: CreditCard },
  { path: '/risk', label: 'Risk', icon: Shield },
  { path: '/leads', label: 'Leads', icon: UserPlus },
  { path: '/partners', label: 'Partners', icon: Handshake },
  { path: '/communications', label: 'Comms', icon: MessageSquareText },
  { path: '/files', label: 'Files', icon: FolderOpen },
  { path: '/reports', label: 'Reports', icon: BarChart2 },
  { path: '/news', label: 'News', icon: Newspaper },
  { path: '/advisor', label: 'Advisor', icon: Sparkles },
  { path: '/organizations', label: 'Orgs', icon: Building2 },
  { path: '/org-settings', label: 'Org Settings', icon: SlidersHorizontal },
  { path: '/pitch', label: 'Pitch Deck', icon: Presentation },
  { path: '/overview', label: 'Overview', icon: FileText },
  { path: '/rates', label: 'Rates', icon: DollarSign },
  { path: '/audit-log', label: 'Audit Log', icon: ClipboardList },
  { path: '/settings', label: 'Settings', icon: SettingsIcon },
];

const clientMoreItems = [
  { path: '/rates', label: 'Live Rates', icon: DollarSign },
  { path: '/news', label: 'News', icon: Newspaper },
  { path: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function BottomTabBar({ user }) {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const isAdmin = user?.role === 'admin';
  const tabs = isAdmin ? adminTabs : clientTabs;
  const moreItems = isAdmin ? adminMoreItems : clientMoreItems;

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-stretch justify-around h-14">
          {tabs.map(tab => {
            const active = isActive(tab.path);
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`flex flex-col items-center justify-center flex-1 min-w-[44px] min-h-[44px] transition-colors ${
                  active ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <tab.icon className="w-5 h-5 mb-0.5" />
                <span className="text-xs font-medium">{tab.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setMoreOpen(true)}
            className={`flex flex-col items-center justify-center flex-1 min-w-[44px] min-h-[44px] transition-colors ${
              moreOpen ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <MoreHorizontal className="w-5 h-5 mb-0.5" />
            <span className="text-xs font-medium">More</span>
          </button>
        </div>
      </nav>

      {moreOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMoreOpen(false)} />
          <div
            className="relative bg-card border-t border-border rounded-t-2xl max-h-[80vh] overflow-y-auto"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="sticky top-0 flex items-center justify-between px-4 py-3 bg-card border-b border-border">
              <h2 className="text-sm font-bold text-foreground">More</h2>
              <button onClick={() => setMoreOpen(false)} className="p-2 -mr-2">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1 p-3">
              {moreItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMoreOpen(false)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg min-h-[44px] transition-colors ${
                    isActive(item.path) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'
                  }`}
                >
                  <item.icon className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium text-center leading-tight">{item.label}</span>
                </Link>
              ))}
            </div>
            <div className="p-3 border-t border-border">
              <button
                onClick={() => base44.auth.logout()}
                className="flex items-center gap-2 w-full p-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}