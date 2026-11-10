import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const INITIAL_RAMPS = [
  { id: 1, name: 'Nairobi Hub', location: 'Nairobi, Kenya', type: 'Both', currencies: ['KES','USDT','USD'], routes: ['KES>USDT','USDT>KES','KES>USD'], status: 'active', partner: 'M-Pesa Business' },
  { id: 2, name: 'Lagos Off-Ramp', location: 'Lagos, Nigeria', type: 'Off Ramp', currencies: ['NGN','USDT'], routes: ['USDT>NGN'], status: 'maintenance', partner: 'GTBank' },
  { id: 3, name: 'Johannesburg Primary', location: 'Johannesburg, South Africa', type: 'Both', currencies: ['ZAR','USDT','USD'], routes: ['ZAR>USDT','USDT>ZAR','ZAR>USD'], status: 'active', partner: 'Standard Bank' },
  { id: 4, name: 'Dubai DIFC Node', location: 'Dubai, UAE', type: 'Both', currencies: ['AED','USDT','USD'], routes: ['AED>USDT','USDT>AED','AED>USD'], status: 'active', partner: 'Emirates NBD' },
  { id: 5, name: 'Cape Town Gateway', location: 'Cape Town, South Africa', type: 'On Ramp', currencies: ['ZAR','USDT'], routes: ['ZAR>USDT'], status: 'active', partner: 'Nedbank' },
  { id: 6, name: 'Accra Exchange Node', location: 'Accra, Ghana', type: 'Both', currencies: ['GHS','USDT','USD'], routes: ['GHS>USDT','USDT>GHS'], status: 'active', partner: 'MTN MoMo' },
  { id: 7, name: 'London Corridor', location: 'London, UK', type: 'Both', currencies: ['GBP','USDT','USD'], routes: ['GBP>USDT','USDT>GBP'], status: 'active', partner: 'Barclays' },
  { id: 8, name: 'Singapore Node', location: 'Singapore', type: 'Both', currencies: ['SGD','USDT','USD'], routes: ['SGD>USDT','USDT>SGD'], status: 'active', partner: 'DBS Bank' },
];

const statusColors = { active: 'bg-green-500/20 text-green-400', maintenance: 'bg-yellow-500/20 text-yellow-400', offline: 'bg-red-500/20 text-red-400' };

const BLANK = { name: '', location: '', type: 'Both', currencies: '', routes: '', status: 'active', partner: '' };

export default function Ramps() {
  const [ramps, setRamps] = useState(INITIAL_RAMPS);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRamp, setEditRamp] = useState(null);
  const [form, setForm] = useState(BLANK);

  const filtered = ramps.filter(r =>
    !search || r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.location.toLowerCase().includes(search.toLowerCase()) ||
    r.currencies.some(c => c.toLowerCase().includes(search.toLowerCase()))
  );

  const openNew = () => { setEditRamp(null); setForm(BLANK); setDialogOpen(true); };
  const openEdit = (r) => {
    setEditRamp(r);
    setForm({ ...r, currencies: r.currencies.join(', '), routes: r.routes.join(', ') });
    setDialogOpen(true);
  };
  const handleDelete = (id) => { setRamps(prev => prev.filter(r => r.id !== id)); toast.success('Ramp removed'); };
  const handleSave = () => {
    const data = { ...form, currencies: form.currencies.split(',').map(c => c.trim()).filter(Boolean), routes: form.routes.split(',').map(r => r.trim()).filter(Boolean) };
    if (editRamp) {
      setRamps(prev => prev.map(r => r.id === editRamp.id ? { ...data, id: r.id } : r));
      toast.success('Ramp updated');
    } else {
      setRamps(prev => [...prev, { ...data, id: Date.now() }]);
      toast.success('Ramp added');
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ramps</h1>
          <p className="text-sm text-muted-foreground mt-1">{ramps.length} ramps in network</p>
        </div>
        <Button onClick={openNew} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-1" /> Add Ramp
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search ramps, currencies, routes..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-card" />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Name','Location','Type','Currencies','Routes','Status','Partner','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id} className={`border-b border-border/50 hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                  <td className="px-4 py-3 font-medium text-foreground">{r.name}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{r.location}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{r.type}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {r.currencies.map(c => <span key={c} className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded font-mono">{c}</span>)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{r.routes.join(', ')}</td>
                  <td className="px-4 py-3"><Badge className={`text-[10px] ${statusColors[r.status]}`}>{r.status}</Badge></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{r.partner}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => openEdit(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="py-12 text-center text-muted-foreground text-sm">No ramps found</div>}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader><DialogTitle>{editRamp ? 'Edit Ramp' : 'Add Ramp'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs">Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div className="space-y-1"><Label className="text-xs">Location</Label><Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} /></div>
              <div className="space-y-1"><Label className="text-xs">Type</Label>
                <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Both">Both</SelectItem><SelectItem value="On Ramp">On Ramp</SelectItem><SelectItem value="Off Ramp">Off Ramp</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label className="text-xs">Status</Label>
                <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="maintenance">Maintenance</SelectItem><SelectItem value="offline">Offline</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1"><Label className="text-xs">Currencies (comma separated)</Label><Input value={form.currencies} onChange={e => setForm(p => ({ ...p, currencies: e.target.value }))} placeholder="ZAR, USDT, USD" /></div>
            <div className="space-y-1"><Label className="text-xs">Routes (comma separated)</Label><Input value={form.routes} onChange={e => setForm(p => ({ ...p, routes: e.target.value }))} placeholder="ZAR>USDT, USDT>ZAR" /></div>
            <div className="space-y-1"><Label className="text-xs">Partner</Label><Input value={form.partner} onChange={e => setForm(p => ({ ...p, partner: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name} className="bg-primary text-primary-foreground">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}