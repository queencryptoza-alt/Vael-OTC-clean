import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Pencil, Download, Share2, Lock, MessageCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import TicketPreviewModal from './TicketPreviewModal';

const DEFAULT_QR = 'https://media.base44.com/images/public/69e2d908ffcd868bc66aacee/2c98ad18d_Screenshot2026-03-25110553.png';

const statusColors = {
  draft: 'bg-muted text-muted-foreground',
  in_progress: 'bg-primary/20 text-primary',
  awaiting_payment: 'bg-yellow-500/20 text-yellow-400',
  completed: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-destructive/20 text-destructive',
};

const Row = ({ label, value, mono = false, fullWidth = false }) => (
  fullWidth ? (
    <div className="py-1.5">
      <span className="text-xs text-muted-foreground block mb-1">{label}</span>
      <span className={`text-xs font-medium text-foreground break-all ${mono ? 'font-mono' : ''}`}>{value || '—'}</span>
    </div>
  ) : (
    <div className="flex justify-between items-start py-1.5">
      <span className="text-xs text-muted-foreground shrink-0 mr-3">{label}</span>
      <span className={`text-xs font-medium text-foreground text-right ${mono ? 'font-mono' : ''}`}>{value || '—'}</span>
    </div>
  )
);

export default function TicketView({ ticket, onEdit, onBack, isAdmin = false }) {
  const printRef = useRef();
  const [showPreview, setShowPreview] = useState(false);

  const handleSignal = () => {
    const lines = [
      `📋 *Trade Ticket ${ticket.ticket_number || ''}*`,
      ``,
      `👤 *Client:* ${ticket.client_name || '—'}`,
      `🔄 *Route:* ${ticket.route || '—'}`,
      `💱 *XE Spot Rate:* ${ticket.xe_spot_rate || '—'}`,
      ``,
      `💰 *Invoice Value:* R ${Number(ticket.invoice_value_zar || 0).toLocaleString()}`,
      `📊 *Fee (${ticket.fee_percentage || 0}%):* R ${Number(ticket.fee_amount_zar || 0).toLocaleString()}`,
      `💵 *Total ZAR:* R ${Number(ticket.total_zar_equivalent || 0).toLocaleString()}`,
      `💲 *Total USD to Send:* $${Number(ticket.total_usd_value || 0).toLocaleString()}`,
      ``,
      `🪙 *Crypto:* ${ticket.crypto_currency || 'USDT'} (${ticket.crypto_network || 'TRC-20'})`,
      `📬 *Wallet Address:*`,
      `${ticket.wallet_address || '—'}`,
      ``,
      `📌 *Status:* ${(ticket.status || '').replace(/_/g, ' ').toUpperCase()}`,
    ].join('\n');

    const encoded = encodeURIComponent(lines);
    // Signal deep link — opens Signal with pre-filled message (no phone needed if using signal.me note-to-self, or use client phone)
    const clientPhone = ticket.client_phone || '';
    if (clientPhone) {
      window.open(`https://signal.me/#p/${clientPhone}`, '_blank');
      navigator.clipboard.writeText(lines);
      toast.success('Message copied — Signal opening. Paste the message to send.');
    } else {
      navigator.clipboard.writeText(lines);
      toast.success('Message copied to clipboard — open Signal and paste to send.');
    }
  };

  const handleShare = async () => {
    const text = `Trade Ticket ${ticket.ticket_number}\nClient: ${ticket.client_name}\nRoute: ${ticket.route}\nAmount: R${ticket.total_zar_equivalent?.toLocaleString()}\nStatus: ${ticket.status?.replace('_', ' ')}`;
    if (navigator.share) {
      await navigator.share({ title: `Ticket ${ticket.ticket_number}`, text });
    } else {
      await navigator.clipboard.writeText(text);
      toast.success('Ticket details copied to clipboard');
    }
  };

  const loadImageAsDataUrl = (url) => new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width; canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });

  const handleExportPDF = async () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const W = 210;
    let y = 0;

    // Header bar — warm off-white
    doc.setFillColor(248, 246, 240);
    doc.rect(0, 0, W, 38, 'F');
    // Thin accent line at top
    doc.setFillColor(110, 160, 80);
    doc.rect(0, 0, W, 1.5, 'F');

    doc.setTextColor(35, 45, 60);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('OTC TRADING TERMINAL', 15, 16);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90, 100, 115);
    doc.text('TRADE SUMMARY', 15, 24);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(35, 45, 60);
    doc.text(`Ticket: ${ticket.ticket_number || 'N/A'}`, W - 15, 14, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90, 100, 115);
    doc.text(`Date: ${ticket.created_date ? format(new Date(ticket.created_date), 'dd MMM yyyy') : 'N/A'}`, W - 15, 22, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(110, 160, 80);
    doc.text(`Status: ${ticket.status?.replace(/_/g, ' ')?.toUpperCase() || 'N/A'}`, W - 15, 30, { align: 'right' });

    // Thin separator line
    doc.setDrawColor(210, 205, 195);
    doc.setLineWidth(0.3);
    doc.line(10, 38, W - 10, 38);

    y = 50;

    const section = (title) => {
      doc.setFillColor(240, 237, 228);
      doc.rect(10, y - 4, W - 20, 8, 'F');
      doc.setDrawColor(200, 195, 182);
      doc.setLineWidth(0.2);
      doc.rect(10, y - 4, W - 20, 8, 'S');
      doc.setTextColor(60, 80, 50);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 15, y + 1);
      y += 11;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
    };

    const row = (label, value) => {
      if (y > 265) { doc.addPage(); y = 20; }
      doc.setTextColor(110, 115, 125);
      doc.setFont('helvetica', 'normal');
      doc.text(label, 15, y);
      doc.setTextColor(30, 35, 45);
      doc.setFont('helvetica', 'bold');
      doc.text(String(value || '—'), 90, y);
      doc.setFont('helvetica', 'normal');
      // subtle row separator
      doc.setDrawColor(228, 224, 215);
      doc.setLineWidth(0.15);
      doc.line(15, y + 2, W - 15, y + 2);
      y += 8;
    };

    section('CLIENT INFORMATION');
    row('Client Name:', ticket.client_name || '');
    row('Client Email:', ticket.client_email || '');
    y += 2;

    section('TRADE OVERVIEW');
    row('Route:', ticket.route || '');
    row('XE Spot Rate:', ticket.xe_spot_rate ? `${ticket.xe_spot_rate}` : '');
    row('Invoice Value (ZAR):', ticket.invoice_value_zar ? `R ${Number(ticket.invoice_value_zar).toLocaleString()}` : '');
    row('Fee (%):', ticket.fee_percentage ? `${ticket.fee_percentage}%` : '');
    row('Fee Amount (ZAR):', ticket.fee_amount_zar ? `R ${Number(ticket.fee_amount_zar).toLocaleString()}` : '');
    row('Total ZAR Equivalent:', ticket.total_zar_equivalent ? `R ${Number(ticket.total_zar_equivalent).toLocaleString()}` : '');
    row('Total USD Value:', ticket.total_usd_value ? `$ ${Number(ticket.total_usd_value).toLocaleString()}` : '');
    y += 2;

    section('CRYPTO PAYMENT DETAILS');
    row('Crypto Currency:', ticket.crypto_currency || '');
    row('Network:', ticket.crypto_network || '');
    row('Wallet Address:', ticket.wallet_address || '');
    row('Amount to Send:', ticket.crypto_amount_to_send ? `${ticket.crypto_amount_to_send} ${ticket.crypto_currency}` : '');
    y += 4;

    // QR Code image
    const qrUrl = ticket.wallet_qr_url || DEFAULT_QR;
    try {
      const qrImg = await loadImageAsDataUrl(qrUrl);
      if (qrImg) {
        doc.setFontSize(8); doc.setTextColor(110, 115, 125); doc.setFont('helvetica', 'normal');
        doc.text('Wallet QR Code:', 15, y);
        y += 4;
        doc.addImage(qrImg, 'PNG', 15, y, 35, 35);
        // Spot rate screenshot beside QR if available
        if (ticket.spot_rate_screenshot_url) {
          const ssImg = await loadImageAsDataUrl(ticket.spot_rate_screenshot_url);
          if (ssImg) {
            doc.text('Spot Rate Screenshot:', 58, y - 4);
            doc.addImage(ssImg, 'JPEG', 58, y, 60, 35);
          }
        }
        y += 40;
      }
    } catch {}
    y += 2;

    if (ticket.notes) {
      section('NOTES');
      const noteLines = doc.splitTextToSize(ticket.notes, W - 30);
      doc.setTextColor(60, 65, 75);
      doc.text(noteLines, 15, y);
      y += noteLines.length * 6 + 5;
    }

    // Footer
    doc.setFillColor(240, 237, 228);
    doc.rect(0, 282, W, 15, 'F');
    doc.setFillColor(110, 160, 80);
    doc.rect(0, 282, W, 1, 'F');
    doc.setTextColor(110, 115, 125);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('This document is confidential and intended solely for the named recipient. OTC Trading Terminal', W / 2, 290, { align: 'center' });

    doc.save(`${ticket.ticket_number || 'ticket'}-trade-summary.pdf`);
    toast.success('PDF exported');
  };

  return (
    <>
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-mono text-primary">{ticket.ticket_number}</h2>
              <Badge className={`text-[10px] ${statusColors[ticket.status] || statusColors.draft}`}>
                {ticket.status?.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {ticket.created_date ? format(new Date(ticket.created_date), 'dd MMM yyyy HH:mm') : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleSignal} className="border-blue-500/40 text-blue-400 hover:bg-blue-500/10">
            <MessageCircle className="w-4 h-4 mr-1" /> Signal
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-1" /> Share
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowPreview(true)} className="border-primary/40 text-primary hover:bg-primary/10">
            <Eye className="w-4 h-4 mr-1" /> Preview
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-1" /> Export PDF
          </Button>
          {isAdmin && (
            <Button size="sm" onClick={onEdit} className="bg-primary text-primary-foreground">
              <Pencil className="w-4 h-4 mr-1" /> Edit
            </Button>
          )}
        </div>
      </div>

      <div ref={printRef} className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {/* Client */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Client</CardTitle></CardHeader>
          <CardContent>
            <Row label="Name" value={ticket.client_name} />
            <Row label="Email" value={ticket.client_email} />
          </CardContent>
        </Card>

        {/* Trade Info */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Trade Details</CardTitle></CardHeader>
          <CardContent>
            <Row label="Route" value={ticket.route} />
            <Row label="XE Spot Rate" value={ticket.xe_spot_rate} mono />
            <Row label="XE Valid Rate (Cost)" value={isAdmin ? ticket.xe_valid_spot_rate : undefined} mono />
          </CardContent>
        </Card>

        {/* Financials */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Trade Amounts</CardTitle></CardHeader>
          <CardContent>
            <Row label="Invoice Value" value={ticket.invoice_value_zar ? `R ${Number(ticket.invoice_value_zar).toLocaleString()}` : null} mono />
            <Row label="Fee %" value={ticket.fee_percentage ? `${ticket.fee_percentage}%` : null} />
            <Row label="Fee Amount" value={ticket.fee_amount_zar ? `R ${Number(ticket.fee_amount_zar).toLocaleString()}` : null} mono />
            <Separator className="my-2" />
            <Row label="Total ZAR Equivalent" value={ticket.total_zar_equivalent ? `R ${Number(ticket.total_zar_equivalent).toLocaleString()}` : null} mono />
            <Row label="Total USD Value" value={ticket.total_usd_value ? `$ ${Number(ticket.total_usd_value).toLocaleString()}` : null} mono />
          </CardContent>
        </Card>

        {/* Crypto */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Crypto Payment</CardTitle></CardHeader>
          <CardContent>
            <Row label="Currency" value={ticket.crypto_currency} />
            <Row label="Network" value={ticket.crypto_network} />
            <Row label="Amount to Send" value={ticket.crypto_amount_to_send ? `${ticket.crypto_amount_to_send} ${ticket.crypto_currency}` : null} mono />
            <Row label="Wallet Address" value={ticket.wallet_address} mono fullWidth />
            <div className="mt-4 flex justify-center w-full">
              <img src={ticket.wallet_qr_url || DEFAULT_QR} alt="Wallet QR" className="h-28 w-28 border border-border rounded bg-white p-1 object-contain" />
            </div>
          </CardContent>
        </Card>

        {/* Spot Rate Screenshot */}
        {ticket.spot_rate_screenshot_url && (
          <Card className="bg-card border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Spot Rate Screenshot</CardTitle></CardHeader>
            <CardContent>
              <img src={ticket.spot_rate_screenshot_url} alt="Spot rate" className="w-full rounded border border-border object-contain max-h-48 bg-black" />
            </CardContent>
          </Card>
        )}

        {/* Beneficiary - Admin/Paymaster Only */}
        {isAdmin && (
          <Card className="bg-card border-yellow-500/20 border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Beneficiary / Payout</CardTitle>
                <Badge className="bg-yellow-500/10 text-yellow-400 text-[10px] flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Admin / Paymaster Only
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Row label="Beneficiary Name" value={ticket.beneficiary_name} />
              <Row label="Bank" value={ticket.beneficiary_bank} />
              <Row label="Account Number" value={ticket.beneficiary_account} mono />
              <Row label="Reference" value={ticket.beneficiary_reference} />
              <Row label="Payout Amount" value={ticket.payout_amount ? `${ticket.payout_currency || 'ZAR'} ${Number(ticket.payout_amount).toLocaleString()}` : null} mono />
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {ticket.notes && (
          <Card className="bg-card border-border md:col-span-2">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Notes</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ticket.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>

    {showPreview && (
      <TicketPreviewModal
        ticket={ticket}
        onClose={() => setShowPreview(false)}
        onExportPDF={() => { setShowPreview(false); handleExportPDF(); }}
      />
    )}
    </>
  );
}