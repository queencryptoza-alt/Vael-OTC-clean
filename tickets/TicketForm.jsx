import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Save, Loader2, UserPlus, Upload, QrCode, RefreshCw } from 'lucide-react';

import { toast } from 'sonner';
import AddClientDialog from '@/components/clients/AddClientDialog';

const ROUTES = [
  'USDT to ZAR EFT',
  'USD to ZAR EFT',
  'BTC to ZAR EFT',
  'ETH to ZAR EFT',
  'ZAR to USDT',
  'ZAR to USD',
  'ZAR to BTC',
  'USDT to USD',
  'USD to USDT',
  'GBP to ZAR',
  'EUR to ZAR',
  'USD to AED',
  'AED to USD',
  'USDT to AED',
];

const NETWORKS = ['TRC-20', 'ERC-20', 'BEP-20', 'SOL', 'Lightning', 'On-chain'];

const SA_BANKS = [
  'Nedbank', 'Standard Bank', 'FNB', 'ABSA', 'Capitec',
  'Discovery Bank', 'Investec', 'African Bank', 'TymeBank', 'Bidvest Bank',
];

const ROUTE_META = {
  'USDT to ZAR EFT': { pair: 'USD/ZAR', exitCurrency: 'ZAR', symbol: 'R' },
  'USD to ZAR EFT':  { pair: 'USD/ZAR', exitCurrency: 'ZAR', symbol: 'R' },
  'BTC to ZAR EFT':  { pair: 'BTC/ZAR', exitCurrency: 'ZAR', symbol: 'R' },
  'ETH to ZAR EFT':  { pair: 'ETH/ZAR', exitCurrency: 'ZAR', symbol: 'R' },
  'ZAR to USDT':     { pair: 'USD/ZAR', exitCurrency: 'USDT', symbol: '$' },
  'ZAR to USD':      { pair: 'USD/ZAR', exitCurrency: 'USD', symbol: '$' },
  'ZAR to BTC':      { pair: 'BTC/ZAR', exitCurrency: 'BTC', symbol: '₿' },
  'USDT to USD':     { pair: 'USD/USD', exitCurrency: 'USD', symbol: '$' },
  'USD to USDT':     { pair: 'USD/USD', exitCurrency: 'USDT', symbol: '$' },
  'GBP to ZAR':      { pair: 'GBP/ZAR', exitCurrency: 'ZAR', symbol: 'R' },
  'EUR to ZAR':      { pair: 'EUR/ZAR', exitCurrency: 'ZAR', symbol: 'R' },
  'USD to AED':      { pair: 'USD/AED', exitCurrency: 'AED', symbol: 'د.إ' },
  'AED to USD':      { pair: 'AED/USD', exitCurrency: 'USD', symbol: '$' },
  'USDT to AED':     { pair: 'USD/AED', exitCurrency: 'AED', symbol: 'د.إ' },
};

export default function TicketForm({ ticket, onSave, onCancel }) {
  const isEdit = !!ticket;

  const { data: clients = [], refetch: refetchClients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
  });

  const DEFAULT_USDT_TRC20_WALLET = 'THQiuKGr7HRg6k3R6DKkiWvNgMYuy1YNhw';

  const [form, setForm] = useState({
    client_id: ticket?.client_id || '',
    client_name: ticket?.client_name || '',
    client_email: ticket?.client_email || '',
    client_phone: ticket?.client_phone || '',
    route: ticket?.route || '',
    xe_spot_rate: ticket?.xe_spot_rate || '',
    xe_valid_spot_rate: ticket?.xe_valid_spot_rate || '',
    fee_percentage: ticket?.fee_percentage || 2,
    invoice_value_zar: ticket?.invoice_value_zar || '',
    crypto_currency: ticket?.crypto_currency || 'USDT',
    crypto_network: ticket?.crypto_network || 'TRC-20',
    wallet_address: ticket?.wallet_address || DEFAULT_USDT_TRC20_WALLET,
   wallet_qr_url: ticket?.wallet_qr_url || 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=THQiuKGr7HRg6k3R6DKkiWvNgMYuy1YNhw&color=0-0-0&bgcolor=255-255-255',
    beneficiary_name: ticket?.beneficiary_name || '',
    beneficiary_bank: ticket?.beneficiary_bank || '',
    beneficiary_account: ticket?.beneficiary_account || '',
    beneficiary_reference: ticket?.beneficiary_reference || '',
    payout_amount: ticket?.payout_amount || '',
    payout_currency: ticket?.payout_currency || 'ZAR',
    spot_rate_screenshot_url: ticket?.spot_rate_screenshot_url || '',
    notes: ticket?.notes || '',
    status: ticket?.status || 'draft',
  });

  const [saving, setSaving] = useState(false);
  const [fetchingRate, setFetchingRate] = useState(false);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);

  const invoiceVal = parseFloat(form.invoice_value_zar) || 0;
  const feePct = parseFloat(form.fee_percentage) || 0;
  const xeRate = parseFloat(form.xe_spot_rate) || 0;
  const feeAmount = invoiceVal * (feePct / 100);
  const totalZar = invoiceVal + feeAmount;
  const totalUsd = xeRate > 0 ? totalZar / xeRate : 0;

  const routeMeta = ROUTE_META[form.route] || { pair: '', exitCurrency: 'ZAR', symbol: 'R' };

  const fetchSpotRate = async (route) => {
    const meta = ROUTE_META[route];
    if (!meta || !meta.pair || meta.pair === 'USD/USD') return;
    setFetchingRate(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Fetch the current live XE.com mid-market exchange rate for ${meta.pair} (e.g. from https://www.xe.com/currencyconverter/convert/?Amount=1&From=${meta.pair.split('/')[0]}&To=${meta.pair.split('/')[1]}). Return a JSON object with: { "rate": <number>, "valid_rate": <number> }. "rate" is the mid-market rate shown on XE, "valid_rate" is the same interbank spot rate. Return only numbers, no text or symbols.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            rate: { type: 'number' },
            valid_rate: { type: 'number' },
          }
        }
      });
      if (result?.rate) {
        setForm(prev => ({
          ...prev,
          xe_spot_rate: result.rate,
          xe_valid_spot_rate: result.valid_rate || result.rate,
        }));
        toast.success(`XE rate fetched: ${result.rate}`);
      }
    } catch {
      toast.error('Could not auto-fetch XE rate');
    }
    setFetchingRate(false);
  };

  const handleRouteChange = (route) => {
    const meta = ROUTE_META[route] || { exitCurrency: 'ZAR' };
    setForm(prev => ({ ...prev, route, payout_currency: meta.exitCurrency }));
    fetchSpotRate(route);
  };

  const handleClientSelect = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setForm(prev => ({ ...prev, client_id: client.id, client_name: client.name, client_email: client.email || '', client_phone: client.phone || '' }));
    }
  };

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleUploadScreenshot = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingScreenshot(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    update('spot_rate_screenshot_url', file_url);
    setUploadingScreenshot(false);
    toast.success('Screenshot uploaded');
  };

  const handleUploadQr = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingQr(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    update('wallet_qr_url', file_url);
    setUploadingQr(false);
    toast.success('QR code uploaded');
  };

  const handleSave = async () => {
    // Screenshot and QR are optional when credits are unavailable
    setSaving(true);
    try {
      const data = {
        ...form,
        invoice_value_zar: parseFloat(form.invoice_value_zar) || 0,
        payout_amount: parseFloat(form.payout_amount) || 0,
        xe_spot_rate: parseFloat(form.xe_spot_rate) || 0,
        xe_valid_spot_rate: parseFloat(form.xe_valid_spot_rate) || 0,
        fee_percentage: parseFloat(form.fee_percentage) || 0,
        fee_amount_zar: feeAmount,
        total_zar_equivalent: totalZar,
        total_usd_value: totalUsd,
        crypto_amount_to_send: totalUsd,
      };

      if (!isEdit) {
        const count = await base44.entities.TradeTicket.list('-created_date', 1);
        const num = (count.length > 0 ? parseInt(count[0].ticket_number?.replace(/\D/g, '') || '0') : 0) + 1;
        data.ticket_number = `TT${String(num).padStart(5, '0')}`;
      }

      await onSave(data);
    } finally {
      setSaving(false);
    }
  };

  const handleClientAdded = (newClient) => {
    refetchClients();
    setForm(prev => ({ ...prev, client_id: newClient.id, client_name: newClient.name, client_email: newClient.email || '' }));
    setShowAddClient(false);
  };

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">{isEdit ? 'Edit Ticket' : 'New Trade Ticket'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Client */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Client</h3>
              <Button variant="outline" size="sm" onClick={() => setShowAddClient(true)}>
                <UserPlus className="w-4 h-4 mr-1" /> Add Customer
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Select Client</Label>
                <Select value={form.client_id} onValueChange={handleClientSelect}>
                  <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Client Name</Label>
                <Input value={form.client_name} onChange={e => update('client_name', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Client Email</Label>
                <Input value={form.client_email} onChange={e => update('client_email', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Trade Details */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Trade Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Route *</Label>
                <Select value={form.route} onValueChange={handleRouteChange}>
                  <SelectTrigger><SelectValue placeholder="Select route" /></SelectTrigger>
                  <SelectContent>
                    {ROUTES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  XE Spot Rate — {routeMeta.pair}
                  {fetchingRate && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                  {!fetchingRate && form.route && (
                    <button onClick={() => fetchSpotRate(form.route)} className="text-primary hover:underline text-xs">
                      <RefreshCw className="w-3 h-3 inline mr-0.5" />refresh
                    </button>
                  )}
                </Label>
                <Input
                  type="number" step="0.01"
                  value={form.xe_spot_rate}
                  onChange={e => update('xe_spot_rate', e.target.value)}
                  className="font-mono"
                  placeholder="Enter rate manually"
                />
              </div>
              <div className="space-y-2">
                <Label>Valid Spot Rate (Cost Ref)</Label>
                <Input
                  type="number" step="0.01"
                  value={form.xe_valid_spot_rate}
                  onChange={e => update('xe_valid_spot_rate', e.target.value)}
                  className="font-mono"
                  placeholder="Enter rate manually"
                />
              </div>
            </div>

            {/* Spot Rate Screenshot */}
            <div className="mt-4 p-4 bg-secondary/40 border border-border rounded-lg">
              <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                <Upload className="w-4 h-4 text-yellow-400" />
                Spot Rate Screenshot <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              {form.spot_rate_screenshot_url ? (
                <div className="flex items-center gap-3">
                  <img src={form.spot_rate_screenshot_url} alt="Spot rate" className="h-16 rounded border border-border object-contain bg-black" />
                  <label className="cursor-pointer text-xs text-primary underline">
                    Replace
                    <input type="file" accept="image/*" className="hidden" onChange={handleUploadScreenshot} />
                  </label>
                  <button onClick={() => update('spot_rate_screenshot_url', '')} className="text-xs text-destructive underline">Remove</button>
                </div>
              ) : (
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                  {uploadingScreenshot ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploadingScreenshot ? 'Uploading...' : 'Click to upload screenshot'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleUploadScreenshot} />
                </label>
              )}
            </div>
          </div>

          {/* Fee & Amounts */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Trade Amounts</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Fee %</Label>
                <Input type="number" step="0.1" value={form.fee_percentage} onChange={e => update('fee_percentage', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Invoice Value (ZAR)</Label>
                <Input type="number" step="0.01" value={form.invoice_value_zar} onChange={e => update('invoice_value_zar', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => update('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="awaiting_payment">Awaiting Payment</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Calculation Summary */}
            <div className="mt-4 p-4 rounded-lg border border-primary/30 bg-primary/5 space-y-3">
              <h4 className="text-xs font-semibold text-primary uppercase tracking-wider">Calculated Summary</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Fee Amount (ZAR)</p>
                  <p className="text-lg font-mono font-bold text-foreground">R {feeAmount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total ZAR (incl. fee)</p>
                  <p className="text-lg font-mono font-bold text-primary">R {totalZar.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total USD to Send</p>
                  <p className="text-lg font-mono font-bold text-foreground">$ {totalUsd.toFixed(2)}</p>
                  {xeRate === 0 && <p className="text-[10px] text-yellow-400 mt-0.5">Enter XE rate to calculate</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Crypto Details */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Crypto Payment</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Crypto Currency</Label>
                <Input value={form.crypto_currency} onChange={e => update('crypto_currency', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Network</Label>
                <Select value={form.crypto_network} onValueChange={v => update('crypto_network', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {NETWORKS.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Wallet Address</Label>
                <Input value={form.wallet_address} onChange={e => update('wallet_address', e.target.value)} className="font-mono text-xs" />
              </div>
            </div>

            {form.wallet_address && (
              <div className="mt-4 p-4 bg-secondary/40 border border-border rounded-lg">
                <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <QrCode className="w-4 h-4 text-primary" />
                  Wallet QR Code <span className="text-muted-foreground text-xs">(optional)</span>
                </Label>
                <p className="text-xs text-muted-foreground mb-3">Upload a QR code of the wallet address for client scanning.</p>
                {form.wallet_qr_url ? (
                  <div className="flex items-center gap-3">
                    <img src={form.wallet_qr_url} alt="Wallet QR" className="h-24 w-24 rounded border border-border object-contain bg-white p-1" />
                    <label className="cursor-pointer">
                      <span className="text-xs text-primary underline">Replace</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleUploadQr} />
                    </label>
                  </div>
                ) : (
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                    {uploadingQr ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                    {uploadingQr ? 'Uploading...' : 'Click to upload QR code'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleUploadQr} />
                  </label>
                )}
              </div>
            )}
          </div>

          {/* Beneficiary */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Beneficiary / Payout</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.beneficiary_name} onChange={e => update('beneficiary_name', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Bank</Label>
                <Select value={form.beneficiary_bank} onValueChange={v => update('beneficiary_bank', v)}>
                  <SelectTrigger><SelectValue placeholder="Select bank" /></SelectTrigger>
                  <SelectContent>
                    {SA_BANKS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Account Number</Label>
                <Input value={form.beneficiary_account} onChange={e => update('beneficiary_account', e.target.value)} className="font-mono" />
              </div>
              <div className="space-y-2">
                <Label>Reference</Label>
                <Input value={form.beneficiary_reference} onChange={e => update('beneficiary_reference', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Payout Amount ({routeMeta.symbol} {routeMeta.exitCurrency})</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">{routeMeta.symbol}</span>
                  <Input
                    type="number" step="0.01"
                    value={form.payout_amount}
                    onChange={e => update('payout_amount', e.target.value)}
                    className="pl-7"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={3} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {isEdit ? 'Update Ticket' : 'Create Ticket'}
          </Button>
        </CardFooter>
      </Card>

      {showAddClient && (
        <AddClientDialog
          onClose={() => setShowAddClient(false)}
          onSaved={handleClientAdded}
        />
      )}
    </>
  );
}
