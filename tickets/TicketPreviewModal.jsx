import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Download } from 'lucide-react';

const DEFAULT_QR = 'https://media.base44.com/images/public/69e2d908ffcd868bc66aacee/2c98ad18d_Screenshot2026-03-25110553.png';

const statusColors = {
  draft: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  awaiting_payment: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
};

const Row = ({ label, value, mono = false }) => (
  <div className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-500">{label}</span>
    <span className={`text-sm font-medium text-gray-900 text-right max-w-[55%] ${mono ? 'font-mono text-xs' : ''}`}>{value || '—'}</span>
  </div>
);

export default function TicketPreviewModal({ ticket, onClose, onExportPDF }) {
  const qrUrl = ticket.wallet_qr_url || DEFAULT_QR;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold font-mono text-gray-900">{ticket.ticket_number}</h2>
              <Badge className={`text-[10px] ${statusColors[ticket.status] || statusColors.draft}`}>
                {ticket.status?.replace(/_/g, ' ')}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {ticket.created_date ? format(new Date(ticket.created_date), 'dd MMM yyyy HH:mm') : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={onExportPDF} className="bg-gray-900 text-white hover:bg-gray-800">
              <Download className="w-4 h-4 mr-1" /> Export PDF
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Client + Trade side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Client</p>
              <Row label="Name" value={ticket.client_name} />
              <Row label="Email" value={ticket.client_email} />
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Trade Details</p>
              <Row label="Route" value={ticket.route} />
              <Row label="XE Spot Rate" value={ticket.xe_spot_rate} mono />
            </div>
          </div>

          {/* Trade Amounts */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Trade Amounts</p>
            <Row label="Invoice Value" value={ticket.invoice_value_zar ? `R ${Number(ticket.invoice_value_zar).toLocaleString()}` : null} mono />
            <Row label={`Fee (${ticket.fee_percentage || 0}%)`} value={ticket.fee_amount_zar ? `R ${Number(ticket.fee_amount_zar).toLocaleString()}` : null} mono />
            <Row label="Total ZAR Equivalent" value={ticket.total_zar_equivalent ? `R ${Number(ticket.total_zar_equivalent).toLocaleString()}` : null} mono />
            <Row label="Total USD Value" value={ticket.total_usd_value ? `$ ${Number(ticket.total_usd_value).toLocaleString()}` : null} mono />
          </div>

          {/* Crypto + QR */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Crypto Payment</p>
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <Row label="Currency" value={ticket.crypto_currency} />
                <Row label="Network" value={ticket.crypto_network} />
                <Row label="Amount to Send" value={ticket.crypto_amount_to_send ? `${Number(ticket.crypto_amount_to_send).toFixed(4)} ${ticket.crypto_currency}` : null} mono />
                <Row label="Wallet Address" value={ticket.wallet_address} mono />
              </div>
              <div className="flex-shrink-0 flex flex-col items-center gap-1">
                <img src={qrUrl} alt="Wallet QR" className="h-28 w-28 border border-gray-200 rounded bg-white p-1 object-contain" />
                <span className="text-[10px] text-gray-400">Scan to send</span>
              </div>
            </div>
          </div>

          {ticket.notes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Notes</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{ticket.notes}</p>
            </div>
          )}

          <p className="text-[10px] text-center text-gray-400">
            This document is confidential and intended solely for the named recipient. OTC Trading Terminal.
          </p>
        </div>
      </div>
    </div>
  );
}