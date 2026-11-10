import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Upload, Download, FileText, FolderOpen, AlertCircle, Loader2 } from 'lucide-react';

export default function MyFiles() {
  const { user } = useOutletContext();
  const queryClient = useQueryClient();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ name: '', notes: '' });

  const { data: files = [] } = useQuery({
    queryKey: ['my-files', user?.email],
    queryFn: () => base44.entities.FileUpload.filter({ created_by: user?.email }, '-created_date'),
    enabled: !!user?.email,
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      setUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.FileUpload.create({
        name: form.name || file.name,
        file_url,
        file_type: file.name.split('.').pop(),
        category: 'source_doc',
        notes: form.notes,
        flagged_for_attention: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-files'] });
      setUploadOpen(false);
      setFile(null);
      setForm({ name: '', notes: '' });
    },
    onSettled: () => setUploading(false),
  });

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Documents</h1>
          <p className="text-sm text-muted-foreground mt-1">Upload source docs for your trader to review</p>
        </div>
        <Button onClick={() => setUploadOpen(true)} className="bg-primary text-primary-foreground">
          <Upload className="w-4 h-4 mr-2" /> Upload Document
        </Button>
      </div>

      <div className="space-y-2">
        {files.map(f => (
          <Card key={f.id} className="bg-card border-border">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-foreground truncate">{f.name}</p>
                    {f.flagged_for_attention && <Badge className="bg-yellow-500/20 text-yellow-400 text-[10px]"><AlertCircle className="w-3 h-3 mr-1" />Flagged for review</Badge>}
                  </div>
                  {f.notes && <p className="text-xs text-muted-foreground truncate">{f.notes}</p>}
                </div>
              </div>
              <a href={f.file_url} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="ghost"><Download className="w-4 h-4" /></Button>
              </a>
            </CardContent>
          </Card>
        ))}
        {files.length === 0 && (
          <Card className="p-12 bg-card border-border text-center">
            <FolderOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No documents uploaded yet</p>
            <p className="text-xs text-muted-foreground mt-1">Upload your source docs here — they'll be flagged for your trader's attention</p>
          </Card>
        )}
      </div>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>File</Label>
              <Input type="file" onChange={e => {
                const f = e.target.files[0];
                if (f) { setFile(f); if (!form.name) setForm(prev => ({ ...prev, name: f.name })); }
              }} />
            </div>
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Notes for Trader</Label><Input value={form.notes} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} placeholder="Any context about this document..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button onClick={() => uploadMutation.mutate()} disabled={!file || uploading} className="bg-primary text-primary-foreground">
              {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              Upload & Flag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}