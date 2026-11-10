import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, Eye, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportGenerator() {
  const [dateFrom, setDateFrom] = useState('2026-03-01');
  const [dateTo, setDateTo] = useState('2027-02-28');
  const [currency, setCurrency] = useState('all');
  const [batchRef, setBatchRef] = useState('');
  const [activePreview, setActivePreview] = useState(null);

  const showPreview = (report) => {
    setActivePreview(activePreview === report ? null : report);
  };

  const hasErrors = true; // TODO: wire to CARFErrorLog validation state

  const ReportCard = ({ title, description, fields, previewData, onGenerate }) => (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-primary" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-[10px] text-muted-foreground leading-relaxed">{description}</p>
        
        <div className="flex gap-2 flex-wrap">
          <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-7 text-[11px] w-[130px]" />
          <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-7 text-[11px] w-[130px]" />
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="h-7 text-[11px] w-[80px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="ZAR">ZAR</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
            </SelectContent>
          </Select>
          {fields}
        </div>

        <div className="flex gap-2">
          <Button size="sm" className="h-7 text-[10px]" onClick={() => showPreview(title)}>
            <Eye className="w-3 h-3 mr-1" /> Preview
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-7 text-[10px] border-primary/30 text-primary"
            onClick={() => {
              if (hasErrors && title.includes('CARF')) {
                toast.error('Cannot download: active validation errors remain');
                return;
              }
              toast.success('Report generated');
              onGenerate?.();
            }}
          >
            <Download className="w-3 h-3 mr-1" /> Download
          </Button>
        </div>

        {activePreview === title && (
          <div className="mt-2 border border-border rounded-md overflow-x-auto bg-secondary/20">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="border-b border-border">
                  {previewData.headers.map((h, i) => (
                    <th key={i} className="text-left px-2 py-1.5 text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.rows.map((row, i) => (
                  <tr key={i} className="border-b border-border/30">
                    {row.map((cell, j) => (
                      <td key={j} className="px-2 py-1 text-foreground whitespace-nowrap font-mono">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {hasErrors && title.includes('CARF') && (
          <div className="flex items-center gap-1.5 text-[10px] text-amber-400">
            <AlertTriangle className="w-3 h-3" /> Download locked — resolve validation errors first
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div>
      <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <Download className="w-4 h-4 text-primary" /> Regulatory Report Generator
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Card 1: SARS CARF/OECD Schema */}
        <ReportCard
          title="SARS CARF / OECD Schema Generator"
          description="Aggregates transaction logs into CARF BRS XML/JSON layout. Includes investor type, tax residency, crypto disposals, acquisitions, and external transfer counts."
          fields={
            <Input 
              placeholder="Batch Ref #" 
              value={batchRef} 
              onChange={e => setBatchRef(e.target.value)} 
              className="h-7 text-[11px] w-[100px] font-mono" 
            />
          }
          previewData={{
            headers: ['Investor Type', 'Tax Jur.', 'Disposals', 'Acquisitions', 'Xfer-In (#/ZAR)', 'Xfer-Out (#/ZAR)'],
            rows: [
              ['Individual', 'ZA', '$120,000', '$85,000', '3 / R2.1M', '2 / R1.5M'],
              ['Entity', 'GB', '$450,000', '$320,000', '5 / R4.8M', '4 / R3.9M'],
              ['Individual', 'MU', '$95,000', '$60,000', '1 / R0.9M', '2 / R1.2M'],
            ],
          }}
        />

        {/* Card 2: SARB FinSurv BOP */}
        <ReportCard
          title="SARB FinSurv BOP Ledger"
          description="Cross-border fiat and stablecoin transactions. Displays foreign currency value, ZAR value, counterparty country, SWIFT/TX ID, and SARB flow codes."
          previewData={{
            headers: ['Foreign Value', 'ZAR Value', 'Counterparty', 'TX ID', 'SARB Code'],
            rows: [
              ['$150,000', 'R 2,700,000', 'GB', 'SWIFT-0042A', '801'],
              ['$85,000', 'R 1,530,000', 'AE', '0x9f2a...b3c1', '801'],
              ['$210,000', 'R 3,780,000', 'US', 'SWIFT-0091F', '801'],
            ],
          }}
        />

        {/* Card 3: FSCA Travel Rule */}
        <ReportCard
          title="FSCA Market Conduct & Travel Rule Log"
          description="Trade-level Travel Rule compliance. Originator/beneficiary details, wallet addresses, intermediary routing hops, and dispatch status."
          previewData={{
            headers: ['Trade ID', 'Originator', 'Orig. Wallet', 'Beneficiary', 'Benef. Wallet', 'Hop', 'Dispatched'],
            rows: [
              ['TT-0042', 'John Doe', '0xa1b2...c3', 'Acme Ltd', '0xd4e5...f6', '—', 'True'],
              ['TT-0043', 'Jane S.', '0x7g8h...9i', 'Global Pte', '0xj0k1...l2', 'Binance', 'True'],
              ['TT-0044', 'Bob T.', '0xm3n4...o5', 'HK Trust', '0xp6q7...r8', '—', 'False'],
            ],
          }}
        />

      </div>
    </div>
  );
}