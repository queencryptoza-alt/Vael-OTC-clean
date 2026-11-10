import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Building2, Pencil, Trash2, Users, Layers, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

const planColors = { trial: 'bg-secondary text-muted-foreground', starter: 'bg-blue-500/20 text-blue-400', professional: 'bg-purple-500/20 text-purple-400', institutional: 'bg-primary/20 text-primary', enterprise: 'bg-green-500/20 text-green-400' };
const statusColors = { active: 'bg-green-500/20 text-green-400', suspended: 'bg-red-500/20 text-red-400', trial: 'bg-yellow-500/20 text-yellow-400' };

const BLANK = { name: '', slug: '', owner_email: '', plan: 'trial', status: 'trial', seats: 5, desk_name: '', primary_currency: 'ZAR', default_fee_pct: 1.5, fsca_license_no: '' };

export default function Organizations() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editOrg, setEditOrg] = useState(null);
  const [form, setForm] = useState(BLANK);

  const { data: orgs = [] } = useQuery({ queryKey: ['organizations'], queryFn: () => base44.entities.Organization.list('-created_date') });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const payload = { ...data, seats: parseInt(data.seats) || 0, default_fee_pct: parseFloat(data.default_fee_pct) || 0 };
      return editOrg ? base44.entities.Organization.update(editOrg.id, payload) : base44.entities.Organization.create({ ...payload, enabled_modules: ['trades','clients','arbitrage','risk','commissions','communications'] });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['organizations'] }); setDialogOpen(false); setEditOrg(null); toast.success(editOrg ? 'Organization updated' : 'Organization created'); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Organization.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['organizations'] }); toast.success('Organization removed'); },
  });

  const openNew = () => { setEditOrg(null); setForm(BLANK); setDialogOpen(true); };
  const openEdit = (o) => { setEditOrg(o); setForm({ ...BLANK, ...o }); setDialogOpen(true); };
  const upd = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const stats = [
    { label: 'Tenants', value: orgs.length, icon: Building2 },
    { label: 'Active', value: orgs.filter(o => o.status === 'active').length, icon: ShieldCheck },
    { label: 'Total Seats', value: orgs.reduce((s, o) => s + (o.seats || 0), 0), icon: Users },
    { label: 'Enterprise', value: orgs.filter(o => o.plan === 'enterprise' || o.plan === 'institutional').length, icon: Layers },
  ];

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Organizations</h1>
          <p className="text-sm text-muted-foreground mt-1">Multi-tenant control — each company gets an isolated dataset</p>
        </div>
        <Button onClick={openNew} className="bg-primary text-primary-foreground"><Plus className="w-4 h-4 mr-1" />New Organization</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><s.icon className="w-4 h-4 text-primary" /></div>
              <div><p className="text-2xl font-bold text-foreground">{s.value}</p><p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Organization','Owner','Plan','Status','Seats','Fee %','FSCA Lic.','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orgs.map((o, i) => (
                <tr key={o.id} className={`border-b border-border/50 hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{o.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{o.slug || '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{o.owner_email || '—'}</td>
                  <td className="px-4 py-3"><Badge className={`text-[10px] capitalize ${planColors[o.plan]}`}>{o.plan}</Badge></td>
                  <td className="px-4 py-3"><Badge className={`text-[10px] ${statusColors[o.status]}`}>{o.status}</Badge></td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground">{o.seats}</td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground">{o.default_fee_pct}%</td>
                  <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">{o.fsca_license_no || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => openEdit(o)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteMutation.mutate(o.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {orgs.length === 0 && <tr><td colSpan={8} className="py-12 text-center text-muted-foreground text-sm">No organizations yet — create your first tenant</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editOrg ? 'Edit Organization' : 'New Organization'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 col-span-2"><Label className="text-xs">Company Name *</Label><Input value={form.name} onChange={e => upd('name', e.target.value)} /></div>
            <div className="space-y-1"><Label className="text-xs">Slug</Label><Input value={form.slug} onChange={e => upd('slug', e.target.value)} placeholder="acme-otc" /></div>
            <div className="space-y-1"><Label className="text-xs">Owner Email</Label><Input value={form.owner_email} onChange={e => upd('owner_email', e.target.value)} /></div>
            <div className="space-y-1"><Label className="text-xs">Plan</Label>
              <Select value={form.plan} onValueChange={v => upd('plan', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="trial">Trial</SelectItem><SelectItem value="starter">Starter</SelectItem><SelectItem value="professional">Professional</SelectItem><SelectItem value="institutional">Institutional</SelectItem><SelectItem value="enterprise">Enterprise</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Status</Label>
              <Select value={form.status} onValueChange={v => upd('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="trial">Trial</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="suspended">Suspended</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Seats</Label><Input type="number" value={form.seats} onChange={e => upd('seats', e.target.value)} /></div>
            <div className="space-y-1"><Label className="text-xs">Default Fee %</Label><Input type="number" value={form.default_fee_pct} onChange={e => upd('default_fee_pct', e.target.value)} /></div>
            <div className="space-y-1"><Label className="text-xs">Desk Name</Label><Input value={form.desk_name} onChange={e => upd('desk_name', e.target.value)} /></div>
            <div className="space-y-1"><Label className="text-xs">FSCA License No.</Label><Input value={form.fsca_license_no} onChange={e => upd('fsca_license_no', e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate(form)} disabled={!form.name || saveMutation.isPending} className="bg-primary text-primary-foreground">{editOrg ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}