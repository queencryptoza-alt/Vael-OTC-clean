import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Search, FolderOpen, FileText, Upload, Download, AlertCircle, Loader2 } from 'lucide-react';

export default function FileCabinet() {
  const { user } = useOutletContext();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'other', notes: '' });
  const [file, setFile] = useState(null);
  const [filterCat, setFilterCat] = useState('all');

  const { data: files = [] } = useQuery({
    queryKey: ['files'],
    queryFn: () => base44.entities.FileUpload.list('-created_date'),
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      setUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.FileUpload.create({
        ...form,
        file_url,
        file_type: file.name.split('.').pop(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      setUploadOpen(false);
      setFile(null);
      setForm({ name: '', category: 'other', notes: '' });
    },
    onSettled: () => setUploading(false),
  });

  const filtered = files.filter(f => {
    const q = search.toLowerCase();
    const matchSearch = !q || f.name?.toLowerCase().includes(q);
    const matchCat = filterCat === 'all' || f.category === filterCat;
    return matchSearch && matchCat;
  });

  const catColors = { ticket: 'text-primary', invoice: 'text-green-400', compliance: 'text-yellow-400', source_doc: 'text-accent', other: 'text-muted-foreground' };

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">File Cabinet</h1>
          <p className="text-sm text-muted-foreground mt-1">Upload and manage documents</p>
        </div>
        <Button onClick={() => setUploadOpen(true)} className="bg-primary text-primary-foreground">
          <Upload className="w-4 h-4 mr-2" /> Upload File
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search files..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-card" />
        </div>
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-40 bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="ticket">Tickets</SelectItem>
            <SelectItem value="invoice">Invoices</SelectItem>
            <SelectItem value="compliance">Compliance</SelectItem>
            <SelectItem value="source_doc">Source Docs</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {filtered.map(f => (
          <Card key={f.id} className="bg-card border-border hover:border-primary/30 transition-colors">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileText className={`w-5 h-5 flex-shrink-0 ${catColors[f.category] || catColors.other}`} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-foreground truncate">{f.name}</p>
                    <Badge variant="outline" className="text-[10px]">{f.category?.replace('_', ' ')}</Badge>
                    {f.file_type && <Badge variant="outline" className="text-[10px] font-mono">.{f.file_type}</Badge>}
                    {f.flagged_for_attention && <Badge className="bg-destructive/20 text-destructive text-[10px]"><AlertCircle className="w-3 h-3 mr-1" />Flagged</Badge>}
                  </div>
                  {f.notes && <p className="text-xs text-muted-foreground truncate mt-0.5">{f.notes}</p>}
                </div>
              </div>
              <a href={f.file_url} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="ghost"><Download className="w-4 h-4" /></Button>
              </a>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card className="p-12 bg-card border-border text-center">
            <FolderOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No files uploaded yet</p>
          </Card>
        )}
      </div>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader><DialogTitle>Upload File</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>File</Label>
              <Input type="file" onChange={e => {
                const f = e.target.files[0];
                if (f) { setFile(f); if (!form.name) setForm(prev => ({ ...prev, name: f.name })); }
              }} />
            </div>
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} /></div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm(prev => ({ ...prev, category: v }))}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="ticket">Ticket</SelectItem><SelectItem value="invoice">Invoice</SelectItem><SelectItem value="compliance">Compliance</SelectItem><SelectItem value="source_doc">Source Doc</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Notes</Label><Input value={form.notes} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button onClick={() => uploadMutation.mutate()} disabled={!file || uploading} className="bg-primary text-primary-foreground">
              {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}