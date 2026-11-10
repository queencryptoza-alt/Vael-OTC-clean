import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Save, RotateCw } from 'lucide-react';

const mockRecords = [
  { id: 1, client: 'Acme Corp', tin: '9876543210', dob: '1985-03-12', country: 'ZA', wallet: '0xa1b2...c3d4', type: 'Entity', valid: true },
  { id: 2, client: 'John Doe', tin: '', dob: '', country: '', wallet: '0x5e6f...7g8h', type: 'Individual', valid: false, errors: ['TIN', 'DOB', 'Country'] },
  { id: 3, client: 'Jane Smith', tin: '1234567890', dob: '1990-07-22', country: 'GB', wallet: '0x9i0j...1k2l', type: 'Individual', valid: true },
  { id: 4, client: 'Crypto Capital Ltd', tin: '4567890123', dob: '', country: 'MU', wallet: '', type: 'Entity', valid: false, errors: ['Wallet'] },
  { id: 5, client: 'Satoshi Dev', tin: '', dob: '1975-04-05', country: 'JP', wallet: '0x3m4n...5o6p', type: 'Individual', valid: false, errors: ['TIN'] },
];

export default function CARFErrorLog() {
  const [records, setRecords] = useState(mockRecords);
  const [editingCell, setEditingCell] = useState(null); // { id, field }

  const startEdit = (id, field) => setEditingCell({ id, field });
  const stopEdit = () => setEditingCell(null);

  const updateField = (id, field, value) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') stopEdit();
    if (e.key === 'Escape') stopEdit();
  };

  const validate = (record) => {
    const errors = [];
    if (!record.tin) errors.push('TIN');
    if (!record.dob) errors.push('DOB');
    if (!record.country) errors.push('Country');
    if (!record.wallet) errors.push('Wallet');
    return errors;
  };

  const saveAndRevalidate = (id) => {
    setRecords(prev => prev.map(r => {
      if (r.id !== id) return r;
      const errors = validate(r);
      return { ...r, valid: errors.length === 0, errors: errors.length ? errors : undefined };
    }));
    stopEdit();
  };

  const invalidCount = records.filter(r => !r.valid).length;

  const Cell = ({ record, field, mono, placeholder }) => {
    const isEditing = editingCell?.id === record.id && editingCell?.field === field;
    const hasError = record.errors?.includes(field.replace('client','').toUpperCase().replace('_',' ').trim());
    const value = record[field];

    if (isEditing) {
      return (
        <Input
          autoFocus
          className="h-7 text-[11px] font-mono w-full"
          value={value}
          onChange={e => updateField(record.id, field, e.target.value)}
          onBlur={stopEdit}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
      );
    }

    return (
      <span
        onDoubleClick={() => startEdit(record.id, field)}
        className={`cursor-pointer text-[11px] block w-full px-1.5 py-1 rounded transition-colors hover:bg-secondary/50 ${
          hasError ? 'text-red-400 font-medium' : mono ? 'font-mono' : ''
        } ${!value ? 'text-red-400/60 italic' : ''}`}
        title="Double-click to edit"
      >
        {value || <span className="text-red-400/50">— missing —</span>}
      </span>
    );
  };

  return (
    <div>
      <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-400" /> CARF Validation Error Log
        {invalidCount > 0 && (
          <Badge className="bg-red-500/15 text-red-400 text-[10px]">{invalidCount} validation errors</Badge>
        )}
      </h2>
      <Card className="bg-card border-border overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left px-3 py-2 text-muted-foreground font-medium text-[10px] uppercase tracking-wider">Client</th>
                  <th className="text-left px-3 py-2 text-muted-foreground font-medium text-[10px] uppercase tracking-wider">Type</th>
                  <th className="text-left px-3 py-2 text-muted-foreground font-medium text-[10px] uppercase tracking-wider">TIN</th>
                  <th className="text-left px-3 py-2 text-muted-foreground font-medium text-[10px] uppercase tracking-wider">Date of Birth</th>
                  <th className="text-left px-3 py-2 text-muted-foreground font-medium text-[10px] uppercase tracking-wider">ISO Country</th>
                  <th className="text-left px-3 py-2 text-muted-foreground font-medium text-[10px] uppercase tracking-wider">Wallet Address</th>
                  <th className="text-center px-3 py-2 text-muted-foreground font-medium text-[10px] uppercase tracking-wider">Status</th>
                  <th className="text-center px-3 py-2 text-muted-foreground font-medium text-[10px] uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => (
                  <tr key={rec.id} className={`border-b border-border/50 transition-colors ${
                    !rec.valid ? 'bg-red-500/[0.03]' : ''
                  }`}>
                    <td className="px-3 py-2 font-medium text-foreground">{rec.client}</td>
                    <td className="px-3 py-2 text-muted-foreground">{rec.type}</td>
                    <td className="px-1 py-2"><Cell record={rec} field="tin" placeholder="TIN" /></td>
                    <td className="px-1 py-2"><Cell record={rec} field="dob" placeholder="YYYY-MM-DD" /></td>
                    <td className="px-1 py-2"><Cell record={rec} field="country" placeholder="ISO code" /></td>
                    <td className="px-1 py-2"><Cell record={rec} field="wallet" mono placeholder="0x..." /></td>
                    <td className="px-3 py-2 text-center">
                      {rec.valid ? (
                        <CheckCircle2 className="w-4 h-4 text-primary inline" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400 inline" />
                      )}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <Button
                        size="sm"
                        className="h-7 text-[10px] px-2.5"
                        onClick={() => saveAndRevalidate(rec.id)}
                      >
                        <Save className="w-3 h-3 mr-1" /> Re-validate
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}