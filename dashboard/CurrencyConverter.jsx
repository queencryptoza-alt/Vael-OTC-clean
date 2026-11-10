import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, ArrowRightLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const PAIRS = [
  { label: 'ZAR → USD', from: 'ZAR', to: 'USD', pair: 'USD/ZAR', invert: true },
  { label: 'ZAR → USDT', from: 'ZAR', to: 'USDT', pair: 'USD/ZAR', invert: true },
  { label: 'USD → ZAR', from: 'USD', to: 'ZAR', pair: 'USD/ZAR', invert: false },
  { label: 'ZAR → GBP', from: 'ZAR', to: 'GBP', pair: 'GBP/ZAR', invert: true },
  { label: 'ZAR → EUR', from: 'ZAR', to: 'EUR', pair: 'EUR/ZAR', invert: true },
  { label: 'ZAR → AED', from: 'ZAR', to: 'AED', pair: 'USD/AED', invert: false },
];

const CURRENCY_SYMBOLS = { ZAR: 'R', USD: '$', USDT: '$', GBP: '£', EUR: '€', AED: 'د.إ' };

export default function CurrencyConverter() {
  const [amount, setAmount] = useState('');
  const [selectedPair, setSelectedPair] = useState(PAIRS[0]);
  const [rate, setRate] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState(null);

  const fetchRate = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Fetch the current live XE.com mid-market exchange rate for the currency pair ${selectedPair.pair}. Return only a JSON object: { "rate": <number> }. The rate should be the number of ${selectedPair.pair.split('/')[1]} per 1 ${selectedPair.pair.split('/')[0]}. Return only numbers, no symbols or text.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: { rate: { type: 'number' } },
        },
      });
      if (res?.rate) {
        setRate(res.rate);
        setLastFetched(new Date());
        computeResult(res.rate, amount, selectedPair);
        toast.success(`Rate updated: ${selectedPair.pair} = ${res.rate}`);
      }
    } catch {
      toast.error('Could not fetch live rate');
    }
    setLoading(false);
  };

  const computeResult = (r, amt, pair) => {
    const num = parseFloat(amt);
    if (!r || isNaN(num)) { setResult(null); return; }
    // pair is always quoted as X per 1 base (e.g. ZAR per 1 USD)
    // invert=true means user input is in the quote currency (ZAR) and wants the base (USD)
    const converted = pair.invert ? num / r : num * r;
    setResult(converted);
  };

  const handleAmountChange = (val) => {
    setAmount(val);
    computeResult(rate, val, selectedPair);
  };

  const handlePairChange = (label) => {
    const pair = PAIRS.find(p => p.label === label);
    setSelectedPair(pair);
    setRate(null);
    setResult(null);
    setLastFetched(null);
  };

  const fromSymbol = CURRENCY_SYMBOLS[selectedPair.from] || '';
  const toSymbol = CURRENCY_SYMBOLS[selectedPair.to] || '';

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-primary" />
            Live Currency Converter
          </CardTitle>
          {lastFetched && (
            <span className="text-[10px] text-muted-foreground">
              Rate: {rate} · {lastFetched.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Pair selector */}
        <Select value={selectedPair.label} onValueChange={handlePairChange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAIRS.map(p => (
              <SelectItem key={p.label} value={p.label}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Input + convert */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-mono">{fromSymbol}</span>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={e => handleAmountChange(e.target.value)}
              className="pl-7 h-8 text-sm font-mono"
            />
          </div>
          <Button size="sm" onClick={fetchRate} disabled={loading} className="h-8 px-3 text-xs">
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-1" />}
            {loading ? '' : 'Get Rate'}
          </Button>
        </div>

        {/* Result */}
        {result !== null && rate ? (
          <div className="rounded-lg bg-primary/8 border border-primary/20 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{selectedPair.from} → {selectedPair.to}</p>
              <p className="text-xl font-mono font-bold text-primary">
                {toSymbol} {result.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">XE Rate</p>
              <p className="text-xs font-mono text-foreground">{rate.toFixed(4)}</p>
              <p className="text-[10px] text-muted-foreground mt-1">1 {selectedPair.invert ? selectedPair.to : selectedPair.from} = {rate} {selectedPair.invert ? selectedPair.from : selectedPair.to}</p>
            </div>
          </div>
        ) : !rate ? (
          <p className="text-[11px] text-muted-foreground text-center py-2">
            Enter an amount and click <span className="text-primary font-medium">Get Rate</span> to fetch the live XE rate.
          </p>
        ) : (
          <p className="text-[11px] text-muted-foreground text-center py-2">Enter an amount to convert.</p>
        )}
      </CardContent>
    </Card>
  );
}