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
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, UserPlus, ArrowRight } from 'lucide-react';
import LeadsPipeline from '../components/dashboard/LeadsPipeline';
import PullToRefresh from '../components/shared/PullToRefresh';

const stageColors = {
  new: 'bg-primary/20 text-primary',
  contacted: 'bg-blue-500/20 text-blue-400',
  qualified: 'bg-purple-500/20 text-purple-400',
  proposal: 'bg-yellow-500/20 text-yellow-400',
  negotiation: 'bg-orange-500/20 text-orange-400',
  won: 'bg-green-500/20 text-green-400',
  lost: 'bg-destructive/20 text-destructive',
};

export default function Leads() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', source: 'referral', stage: 'new', notes: '', estimated_volume_usd: '' });

  const { data: leads = [], refetch: refetchLeads } = useQuery({
    queryKey: ['leads'],
    queryFn: () => base44.entities.Lead.list('-created_date'),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editLead ? base44.entities.Lead.update(editLead.id, data) : base44.entities.Lead.create(data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ['leads'] });
      const previous = queryClient.getQueryData(['leads']);
      if (editLead) {
        queryClient.setQueryData(['leads'], (old) => (old || []).map(l => l.id === editLead.id ? { ...l, ...data } : l));
      } else {
        queryClient.setQueryData(['leads'], (old) => [...(old || []), { ...data, id: 'temp-' + Date.now() }]);
      }
      return { previous };
    },
    onError: (err, data, context) => { queryClient.setQueryData(['leads'], context.previous); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['leads'] }); setDialogOpen(false); },
  });

  const convertMutation = useMutation({
    mutationFn: async (lead) => {
      await base44.entities.Client.create({ name: lead.name, email: lead.email, phone: lead.phone, company: lead.company, status: 'active' });
      await base44.entities.Lead.update(lead.id, { converted_to_client: true, stage: 'won' });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['leads'] }); queryClient.invalidateQueries({ queryKey: ['clients'] }); },
  });

  const openNew = () => { setEditLead(null); setForm({ name: '', email: '', phone: '', company: '', source: 'referral', stage: 'new', notes: '', estimated_volume_usd: '' }); setDialogOpen(true); };
  const openEdit = (l) => { setEditLead(l); setForm({ name: l.name, email: l.email || '', phone: l.phone || '', company: l.company || '', source: l.source || 'referral', stage: l.stage || 'new', notes: l.notes || '', estimated_volume_usd: l.estimated_volume_usd || '' }); setDialogOpen(true); };
  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const filtered = leads.filter(l => {
    const q = search.toLowerCase();
    return !q || l.name?.toLowerCase().includes(q) || l.email?.toLowerCase().includes(q);
  });

  return (
    <PullToRefresh onRefresh={async () => { await refetchLeads(); }}>
    <div className="space-y-6 pt-8 lg:pt-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">CRM / Leads</h1>
          <p className="text-sm text-muted-foreground mt-1">{leads.length} total leads</p>
        </div>
        <Button onClick={openNew} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" /> Add Lead
        </Button>
      </div>

      <LeadsPipeline leads={leads} />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-card" />
      </div>

      <div className="space-y-2">
        {filtered.map(lead => (
          <Card key={lead.id} className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer" onClick={() => openEdit(lead)}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-accent">{lead.name?.[0]?.toUpperCase()}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{lead.name}</p>
                    <Badge className={`text-[10px] ${stageColors[lead.stage] || stageColors.new}`}>{lead.stage}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{lead.email} {lead.company ? `· ${lead.company}` : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {lead.estimated_volume_usd && <span className="text-sm font-mono text-muted-foreground">${lead.estimated_volume_usd.toLocaleString()}</span>}
                {!lead.converted_to_client && lead.stage !== 'lost' && (
                  <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); convertMutation.mutate(lead); }}>
                    <ArrowRight className="w-3 h-3 mr-1" /> Convert
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card className="p-12 bg-card border-border text-center">
            <UserPlus className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No leads yet</p>
          </Card>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader><DialogTitle>{editLead ? 'Edit Lead' : 'New Lead'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={e => update('name', e.target.value)} /></div>
            <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={e => update('email', e.target.value)} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e => update('phone', e.target.value)} /></div>
            <div className="space-y-2"><Label>Company</Label><Input value={form.company} onChange={e => update('company', e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Source</Label>
                <Select value={form.source} onValueChange={v => update('source', v)}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="referral">Referral</SelectItem><SelectItem value="website">Website</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem><SelectItem value="cold_call">Cold Call</SelectItem>
                    <SelectItem value="event">Event</SelectItem><SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Stage</Label>
                <Select value={form.stage} onValueChange={v => update('stage', v)}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem><SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem><SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem><SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Est. Volume (USD)</Label><Input type="number" value={form.estimated_volume_usd} onChange={e => update('estimated_volume_usd', parseFloat(e.target.value) || '')} /></div>
            <div className="space-y-2"><Label>Notes</Label><Textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate(form)} disabled={!form.name} className="bg-primary text-primary-foreground">{editLead ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </PullToRefresh>
  );
}