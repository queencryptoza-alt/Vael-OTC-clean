import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AddClientDialog({ onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '' });
  const [saving, setSaving] = useState(false);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form.name || !form.email) {
      toast.error('Name and email are required');
      return;
    }
    setSaving(true);
    const newClient = await base44.entities.Client.create({ ...form, status: 'active', kyc_status: 'pending' });
    setSaving(false);
    toast.success('Client added');
    onSaved(newClient);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Full Name *</Label>
            <Input value={form.name} onChange={e => update('name', e.target.value)} placeholder="John Smith" />
          </div>
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input value={form.email} onChange={e => update('email', e.target.value)} placeholder="john@example.com" />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+27 82 000 0000" />
          </div>
          <div className="space-y-2">
            <Label>Company</Label>
            <Input value={form.company} onChange={e => update('company', e.target.value)} placeholder="Company name (optional)" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Add Customer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}