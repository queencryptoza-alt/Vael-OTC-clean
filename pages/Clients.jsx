import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Search, Eye, Pencil, Trash2, Users, Handshake, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import PullToRefresh from '../components/shared/PullToRefresh';

const kycColors = { pending: 'bg-yellow-500/20 text-yellow-400', verified: 'bg-green-500/20 text-green-400', expired: 'bg-red-500/20 text-red-400', 'in_progress': 'bg-blue-500/20 text-blue-400' };
const statusColors = { active: 'bg-green-500/20 text-green-400', inactive: 'bg-muted text-muted-foreground', pending: 'bg-yellow-500/20 text-yellow-400' };
const riskColors = { Low: 'bg-green-500/20 text-green-400', Medium: 'bg-yellow-500/20 text-yellow-400', High: 'bg-red-500/20 text-red-400' };

const CURRENCIES = ['ZAR','USDT','USD','EUR','GBP','KES','NGN','GHS','BTC','ETH'];

const BLANK = { name: '', email: '', phone: '', company: '', country: '', type: 'Individual', status: 'active', kyc_status: 'pending', kyc_expiry_date: '', risk_rating: 'Medium', preferred_currencies: [], preferred_routes: '', referral_link: '', referred_by: '', notes: '' };

export default function Clients() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewClient, setViewClient] = useState(null);
  const [editClient, setEditClient] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [activeTab, setActiveTab] = useState('clients');

  const { data: clients = [], refetch: refetchClients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list('-created_date'),
  });
  const { data: partners = [], refetch: refetchPartners } = useQuery({
    queryKey: ['partners'],
    queryFn: () => base44.entities.Partner.list('-created_date'),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const payload = { name: data.name, email: data.email, phone: data.phone, company: data.company, status: data.status, kyc_status: data.kyc_status, kyc_expiry_date: data.kyc_expiry_date, notes: data.notes };
      return editClient ? base44.entities.Client.update(editClient.id, payload) : base44.entities.Client.create(payload);
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ['clients'] });
      const previous = queryClient.getQueryData(['clients']);
      if (editClient) {
        queryClient.setQueryData(['clients'], (old) => (old || []).map(c => c.id === editClient.id ? { ...c, ...data } : c));
      } else {
        queryClient.setQueryData(['clients'], (old) => [...(old || []), { ...data, id: 'temp-' + Date.now() }]);
      }
      return { previous };
    },
    onError: (err, data, context) => { queryClient.setQueryData(['clients'], context.previous); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['clients'] }); setDialogOpen(false); setEditClient(null); toast.success(editClient ? 'Client updated' : 'Client created'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Client.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['clients'] });
      const previous = queryClient.getQueryData(['clients']);
      queryClient.setQueryData(['clients'], (old) => (old || []).filter(c => c.id !== id));
      return { previous };
    },
    onError: (err, id, context) => { queryClient.setQueryData(['clients'], context.previous); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['clients'] }); toast.success('Client removed'); },
  });

  const openNew = () => { setEditClient(null); setForm(BLANK); setDialogOpen(true); };
  const openEdit = (c) => {
    setEditClient(c);
    setForm({ ...BLANK, name: c.name || '', email: c.email || '', phone: c.phone || '', company: c.company || '', status: c.status || 'active', kyc_status: c.kyc_status || 'pending', kyc_expiry_date: c.kyc_expiry_date || '', notes: c.notes || '' });
    setDialogOpen(true);
  };
  const upd = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const toggleCurrency = (c) => setForm(p => ({ ...p, preferred_currencies: p.preferred_currencies.includes(c) ? p.preferred_currencies.filter(x => x !== c) : [...p.preferred_currencies, c] }));

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    return !q || c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q);
  });

  // Mock extra fields for display
  const enriched = filtered.map((c, i) => ({
    ...c,
    country: ['South Africa', 'UAE', 'Ghana', 'Kenya', 'South Africa', 'South Africa', 'Kenya'][i % 7],
    type: ['Corporate', 'Corporate', 'Corporate', 'Corporate', 'Institutional', 'Individual', 'Corporate'][i % 7],
    risk_rating: ['Low', 'Low', 'Medium', 'Low', 'Medium', 'Low', 'Medium'][i % 7],
  }));

  return (
    <PullToRefresh onRefresh={async () => { await Promise.all([refetchClients(), refetchPartners()]); }}>
    <div className="space-y-6 pt-8 lg:pt-0">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">{clients.length} clients</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={openNew} variant="outline">
            <Plus className="w-4 h-4 mr-1" /> Quick Add
          </Button>
          <Link to="/onboarding">
            <Button className="bg-primary text-primary-foreground">
              <UserPlus className="w-4 h-4 mr-1" /> Onboard New Client
            </Button>
          </Link>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="clients" className="gap-1.5"><Users className="w-3.5 h-3.5" /> Clients</TabsTrigger>
          <TabsTrigger value="partners" className="gap-1.5"><Handshake className="w-3.5 h-3.5" /> Partners</TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4 mt-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-card" />
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {enriched.map(c => (
              <div key={c.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.company || '—'}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setViewClient(c)}><Eye className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => openEdit(c)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => deleteMutation.mutate(c.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className={`text-xs ${statusColors[c.status] || statusColors.active}`}>{c.status}</Badge>
                  <Badge className={`text-xs ${kycColors[c.kyc_status] || kycColors.pending}`}>{c.kyc_status}</Badge>
                  <Badge className={`text-xs ${riskColors[c.risk_rating]}`}>{c.risk_rating}</Badge>
                  <span className="text-xs text-muted-foreground">{c.country} · {c.type}</span>
                </div>
              </div>
            ))}
            {enriched.length === 0 && <p className="text-center text-muted-foreground py-8">No clients found</p>}
          </div>
          {/* Desktop table */}
          <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {['Name','Company','Country','Type','Status','KYC','Risk','Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {enriched.map((c, i) => (
                    <tr key={c.id} className={`border-b border-border/50 hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                      <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{c.company || '—'}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{c.country}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{c.type}</td>
                      <td className="px-4 py-3"><Badge className={`text-[10px] ${statusColors[c.status] || statusColors.active}`}>{c.status === 'active' ? 'Active' : c.status}</Badge></td>
                      <td className="px-4 py-3"><Badge className={`text-[10px] ${kycColors[c.kyc_status] || kycColors.pending}`}>{c.kyc_status === 'verified' ? 'Approved' : c.kyc_status === 'in_progress' ? 'In Progress' : c.kyc_status}</Badge></td>
                      <td className="px-4 py-3"><Badge className={`text-[10px] ${riskColors[c.risk_rating]}`}>{c.risk_rating}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setViewClient(c)}><Eye className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => openEdit(c)}><Pencil className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteMutation.mutate(c.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {enriched.length === 0 && <tr><td colSpan={8} className="py-12 text-center text-muted-foreground text-sm">No clients found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="partners" className="mt-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-muted/30">
                  {['Name','Company','Type','Status','Contact'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {partners.map((p, i) => (
                    <tr key={p.id} className="border-b border-border/50 hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{p.company || '—'}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{p.type}</td>
                      <td className="px-4 py-3"><Badge className={`text-[10px] ${p.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-muted text-muted-foreground'}`}>{p.status}</Badge></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{p.email || p.phone || '—'}</td>
                    </tr>
                  ))}
                  {partners.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-muted-foreground text-sm">No partners added yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editClient ? 'Edit Client' : 'New Client'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label className="text-xs">Full Name *</Label><Input value={form.name} onChange={e => upd('name', e.target.value)} /></div>
              <div className="space-y-1"><Label className="text-xs">Company</Label><Input value={form.company} onChange={e => upd('company', e.target.value)} /></div>
              <div className="space-y-1"><Label className="text-xs">Email *</Label><Input value={form.email} onChange={e => upd('email', e.target.value)} /></div>
              <div className="space-y-1"><Label className="text-xs">Phone</Label><Input value={form.phone} onChange={e => upd('phone', e.target.value)} /></div>
              <div className="space-y-1"><Label className="text-xs">Country</Label><Input value={form.country} onChange={e => upd('country', e.target.value)} /></div>
              <div className="space-y-1"><Label className="text-xs">Type *</Label>
                <Select value={form.type} onValueChange={v => upd('type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Individual">Individual</SelectItem><SelectItem value="Corporate">Corporate</SelectItem><SelectItem value="Institutional">Institutional</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label className="text-xs">Status</Label>
                <Select value={form.status} onValueChange={v => upd('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem><SelectItem value="pending">Pending KYC</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label className="text-xs">KYC Status</Label>
                <Select value={form.kyc_status} onValueChange={v => upd('kyc_status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="pending">Not Started</SelectItem><SelectItem value="in_progress">In Progress</SelectItem><SelectItem value="verified">Approved</SelectItem><SelectItem value="expired">Expired</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label className="text-xs">KYC Expiry</Label><Input type="date" value={form.kyc_expiry_date} onChange={e => upd('kyc_expiry_date', e.target.value)} /></div>
              <div className="space-y-1"><Label className="text-xs">Risk Rating</Label>
                <Select value={form.risk_rating} onValueChange={v => upd('risk_rating', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Low">Low</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="High">High</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label className="text-xs">Referral Link</Label><Input value={form.referral_link} onChange={e => upd('referral_link', e.target.value)} /></div>
              <div className="space-y-1"><Label className="text-xs">Referred By</Label><Input value={form.referred_by} onChange={e => upd('referred_by', e.target.value)} /></div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Preferred Currencies</Label>
              <div className="flex gap-2 flex-wrap">
                {CURRENCIES.map(c => (
                  <button key={c} type="button" onClick={() => toggleCurrency(c)}
                    className={`text-xs px-2.5 py-1 rounded-md border transition-all ${form.preferred_currencies.includes(c) ? 'bg-primary/20 text-primary border-primary/40' : 'border-border text-muted-foreground hover:border-primary/30'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1"><Label className="text-xs">Preferred Routes</Label><Input value={form.preferred_routes} onChange={e => upd('preferred_routes', e.target.value)} placeholder="e.g. ZAR>USDT, USD>ZAR" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate(form)} disabled={!form.name || !form.email || saveMutation.isPending} className="bg-primary text-primary-foreground">
              {editClient ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      {viewClient && (
        <Dialog open={!!viewClient} onOpenChange={() => setViewClient(null)}>
          <DialogContent className="bg-card border-border max-w-md">
            <DialogHeader><DialogTitle>{viewClient.name}</DialogTitle></DialogHeader>
            <div className="space-y-2 text-sm">
              {[['Email', viewClient.email],['Phone', viewClient.phone],['Company', viewClient.company],['KYC', viewClient.kyc_status],['Status', viewClient.status],['Notes', viewClient.notes]].map(([l,v]) => v ? (
                <div key={l} className="flex justify-between">
                  <span className="text-muted-foreground">{l}</span>
                  <span className="text-foreground font-medium">{v}</span>
                </div>
              ) : null)}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewClient(null)}>Close</Button>
              <Button onClick={() => { setViewClient(null); openEdit(viewClient); }} className="bg-primary text-primary-foreground">Edit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
    </PullToRefresh>
  );
}