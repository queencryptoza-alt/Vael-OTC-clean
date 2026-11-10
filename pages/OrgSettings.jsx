import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useTenant } from '@/lib/useTenant';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Building2, SlidersHorizontal, Layers, Save, Loader2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

const MODULES = [
  { key: 'trades', label: 'Trades & Tickets' },
  { key: 'clients', label: 'Clients & KYC' },
  { key: 'arbitrage', label: 'Arbitrage & Exchange' },
  { key: 'risk', label: 'Risk & Regulatory' },
  { key: 'commissions', label: 'Commissions' },
  { key: 'communications', label: 'Communications Hub' },
  { key: 'payment-rails', label: 'Payment Rails' },
];

const Toggle = ({ checked, onChange }) => (
  <button onClick={() => onChange(!checked)} className={`w-11 h-6 rounded-full transition-colors relative ${checked ? 'bg-primary' : 'bg-muted'}`}>
    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
  </button>
);

export default function OrgSettings() {
  const { org, isOwner, loading } = useTenant();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (org) {
      setForm({
        desk_name: org.desk_name || org.name || '',
        primary_currency: org.primary_currency || 'ZAR',
        default_fee_pct: org.default_fee_pct ?? 1.5,
        daily_limit_zar: org.daily_limit_zar ?? 5000000,
        monthly_limit_zar: org.monthly_limit_zar ?? 50000000,
        branding_color: org.branding_color || '#cfff04',
        fsca_license_no: org.fsca_license_no || '',
        enabled_modules: org.enabled_modules || MODULES.map(m => m.key),
      });
    }
  }, [org]);

  const upd = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const toggleModule = (k) => setForm(p => ({ ...p, enabled_modules: p.enabled_modules.includes(k) ? p.enabled_modules.filter(x => x !== k) : [...p.enabled_modules, k] }));

  const handleSave = async () => {
    if (!org) return;
    setSaving(true);
    try {
      await base44.entities.Organization.update(org.id, {
        ...form,
        default_fee_pct: parseFloat(form.default_fee_pct) || 0,
        daily_limit_zar: parseFloat(form.daily_limit_zar) || 0,
        monthly_limit_zar: parseFloat(form.monthly_limit_zar) || 0,
      });
      toast.success('Organization settings saved');
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  if (!org) {
    return (
      <div className="pt-8 lg:pt-0 max-w-lg">
        <h1 className="text-2xl font-bold text-foreground">Organization</h1>
        <Card className="bg-card border-border mt-4">
          <CardContent className="p-6 flex gap-3">
            <ShieldAlert className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">No organization linked</p>
              <p className="text-xs text-muted-foreground mt-1">Your account isn't linked to an organization yet. The platform owner can create one under Organizations and set you as the owner.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="space-y-6 pt-8 lg:pt-0 max-w-2xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Organization Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">{org.name} — manage your desk's parameters</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-primary/20 text-primary text-[10px] capitalize">{org.plan}</Badge>
          {!isOwner && <Badge className="bg-yellow-500/20 text-yellow-400 text-[10px]">View only</Badge>}
          <Button onClick={handleSave} disabled={saving || !isOwner} className="bg-primary text-primary-foreground">
            {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}Save
          </Button>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" />Desk Identity</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label className="text-xs">Desk Name</Label><Input value={form.desk_name} onChange={e => upd('desk_name', e.target.value)} disabled={!isOwner} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Primary Currency</Label><Input value={form.primary_currency} onChange={e => upd('primary_currency', e.target.value)} disabled={!isOwner} /></div>
            <div className="space-y-1.5"><Label className="text-xs">FSCA License No.</Label><Input value={form.fsca_license_no} onChange={e => upd('fsca_license_no', e.target.value)} disabled={!isOwner} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Brand Accent Color</Label>
              <div className="flex gap-2 items-center">
                <input type="color" value={form.branding_color} onChange={e => upd('branding_color', e.target.value)} disabled={!isOwner} className="h-9 w-12 rounded border border-border bg-transparent cursor-pointer" />
                <Input value={form.branding_color} onChange={e => upd('branding_color', e.target.value)} disabled={!isOwner} className="font-mono" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><SlidersHorizontal className="w-4 h-4 text-primary" />Trading Parameters</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label className="text-xs">Default Fee %</Label><Input type="number" value={form.default_fee_pct} onChange={e => upd('default_fee_pct', e.target.value)} disabled={!isOwner} className="font-mono" /></div>
            <div className="space-y-1.5"><Label className="text-xs">Daily Limit (ZAR)</Label><Input type="number" value={form.daily_limit_zar} onChange={e => upd('daily_limit_zar', e.target.value)} disabled={!isOwner} className="font-mono" /></div>
            <div className="space-y-1.5"><Label className="text-xs">Monthly Limit (ZAR)</Label><Input type="number" value={form.monthly_limit_zar} onChange={e => upd('monthly_limit_zar', e.target.value)} disabled={!isOwner} className="font-mono" /></div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Layers className="w-4 h-4 text-primary" />Enabled Modules</CardTitle></CardHeader>
        <CardContent className="space-y-1">
          {MODULES.map((m, i) => (
            <div key={m.key}>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-foreground">{m.label}</span>
                <Toggle checked={form.enabled_modules.includes(m.key)} onChange={() => isOwner && toggleModule(m.key)} />
              </div>
              {i < MODULES.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}