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
import { Plus, Search, Handshake } from 'lucide-react';

export default function Partners() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPartner, setEditPartner] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', type: 'other', status: 'active', notes: '' });

  const { data: partners = [] } = useQuery({
    queryKey: ['partners'],
    queryFn: () => base44.entities.Partner.list('-created_date'),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editPartner ? base44.entities.Partner.update(editPartner.id, data) : base44.entities.Partner.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['partners'] }); setDialogOpen(false); },
  });

  const openNew = () => { setEditPartner(null); setForm({ name: '', email: '', phone: '', company: '', type: 'other', status: 'active', notes: '' }); setDialogOpen(true); };
  const openEdit = (p) => { setEditPartner(p); setForm({ name: p.name, email: p.email || '', phone: p.phone || '', company: p.company || '', type: p.type || 'other', status: p.status || 'active', notes: p.notes || '' }); setDialogOpen(true); };
  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const filtered = partners.filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Partners</h1>
          <p className="text-sm text-muted-foreground mt-1">Ramps, exchanges, brokers & compliance</p>
        </div>
        <Button onClick={openNew} className="bg-primary text-primary-foreground"><Plus className="w-4 h-4 mr-2" /> Add Partner</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search partners..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-card" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(partner => (
          <Card key={partner.id} className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer" onClick={() => openEdit(partner)}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Handshake className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{partner.name}</p>
                  <p className="text-xs text-muted-foreground">{partner.company} {partner.email ? `· ${partner.email}` : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">{partner.type}</Badge>
                <Badge className={partner.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-muted text-muted-foreground'} >{partner.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card className="col-span-full p-12 bg-card border-border text-center">
            <Handshake className="w-10 h-10 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No partners yet</p>
          </Card>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader><DialogTitle>{editPartner ? 'Edit Partner' : 'New Partner'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={e => update('name', e.target.value)} /></div>
            <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={e => update('email', e.target.value)} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e => update('phone', e.target.value)} /></div>
            <div className="space-y-2"><Label>Company</Label><Input value={form.company} onChange={e => update('company', e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Type</Label>
                <Select value={form.type} onValueChange={v => update('type', v)}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="ramp">Ramp</SelectItem><SelectItem value="exchange">Exchange</SelectItem><SelectItem value="broker">Broker</SelectItem><SelectItem value="compliance">Compliance</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Status</Label>
                <Select value={form.status} onValueChange={v => update('status', v)}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Notes</Label><Textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate(form)} disabled={!form.name} className="bg-primary text-primary-foreground">{editPartner ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}