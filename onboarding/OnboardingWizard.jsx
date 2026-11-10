import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  User, Building2, ShieldCheck, TrendingUp, CheckCircle2,
  ChevronLeft, ChevronRight, Loader2, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

const CURRENCIES = ['ZAR', 'USDT', 'USD', 'EUR', 'GBP', 'KES', 'NGN', 'GHS', 'BTC', 'ETH'];
const INDUSTRIES = ['Finance', 'Tech / SaaS', 'Retail / E-commerce', 'Mining', 'Real Estate', 'Logistics', 'Healthcare', 'Agriculture', 'Other'];

const STEPS = [
  { key: 'personal', label: 'Personal', icon: User },
  { key: 'business', label: 'Business', icon: Building2 },
  { key: 'kyc', label: 'Identity', icon: ShieldCheck },
  { key: 'trading', label: 'Trading', icon: TrendingUp },
  { key: 'review', label: 'Review', icon: CheckCircle2 },
];

const BLANK = {
  name: '', email: '', phone: '', date_of_birth: '', country: 'South Africa',
  company: '', client_type: 'Individual', industry: '', job_title: '', business_registration_number: '',
  id_type: 'passport', id_number: '', residential_address: '',
  preferred_currencies: [], preferred_routes: '', source_of_funds: '', estimated_annual_volume_usd: '',
  referred_by: '',
};

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(BLANK);
  const [submitting, setSubmitting] = useState(false);

  const upd = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const toggleCurrency = (c) => setForm(p => ({
    ...p,
    preferred_currencies: p.preferred_currencies.includes(c)
      ? p.preferred_currencies.filter(x => x !== c)
      : [...p.preferred_currencies, c],
  }));

  const canProceed = () => {
    if (step === 0) return form.name && form.email;
    if (step === 1) return form.client_type === 'Individual' ? true : form.company;
    if (step === 2) return form.id_number && form.residential_address;
    if (step === 3) return form.preferred_currencies.length > 0;
    return true;
  };

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  const submit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        status: 'pending',
        kyc_status: 'pending',
        estimated_annual_volume_usd: form.estimated_annual_volume_usd ? Number(form.estimated_annual_volume_usd) : undefined,
      };
      await base44.entities.Client.create(payload);
      toast.success('Client onboarded successfully');
      navigate('/clients');
    } catch (e) {
      toast.error('Failed to onboard client');
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-10">
        {STEPS.map((s, idx) => (
          <React.Fragment key={s.key}>
            <div className="flex flex-col items-center gap-2">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center border-2 transition-all duration-300 ${
                idx === step ? 'bg-primary border-primary text-primary-foreground shadow-[0_0_20px_hsl(67_100%_51%/0.3)]' :
                idx < step ? 'bg-primary/10 border-primary/40 text-primary' :
                'bg-card border-border text-muted-foreground'
              }`}>
                {idx < step ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
              </div>
              <span className={`text-[11px] font-medium ${idx === step ? 'text-foreground' : 'text-muted-foreground'}`}>{s.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all duration-500 ${idx < step ? 'bg-primary/40' : 'bg-border'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-card border border-border rounded-2xl p-8 min-h-[420px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {step === 0 && <PersonalStep form={form} upd={upd} />}
            {step === 1 && <BusinessStep form={form} upd={upd} />}
            {step === 2 && <KycStep form={form} upd={upd} />}
            {step === 3 && <TradingStep form={form} upd={upd} toggleCurrency={toggleCurrency} />}
            {step === 4 && <ReviewStep form={form} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav Buttons */}
      <div className="flex items-center justify-between mt-6">
        <Button variant="outline" onClick={prev} disabled={step === 0 || submitting}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={next} disabled={!canProceed()} className="bg-primary text-primary-foreground">
            Continue <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={submit} disabled={submitting} className="bg-primary text-primary-foreground">
            {submitting ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Onboarding...</> : <><Sparkles className="w-4 h-4 mr-1" /> Complete Onboarding</>}
          </Button>
        )}
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}{required && <span className="text-primary ml-0.5">*</span>}</Label>
      {children}
    </div>
  );
}

function StepHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Icon className="w-5 h-5 text-primary" /></div>
        <div>
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function PersonalStep({ form, upd }) {
  return (
    <div>
      <StepHeader icon={User} title="Personal Details" subtitle="Let's start with the basics" />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Full Name" required><Input value={form.name} onChange={e => upd('name', e.target.value)} placeholder="John Doe" /></Field>
        <Field label="Email" required><Input type="email" value={form.email} onChange={e => upd('email', e.target.value)} placeholder="john@example.com" /></Field>
        <Field label="Phone"><Input value={form.phone} onChange={e => upd('phone', e.target.value)} placeholder="+27 82 000 0000" /></Field>
        <Field label="Date of Birth"><Input type="date" value={form.date_of_birth} onChange={e => upd('date_of_birth', e.target.value)} /></Field>
        <div className="col-span-2"><Field label="Country"><Input value={form.country} onChange={e => upd('country', e.target.value)} placeholder="South Africa" /></Field></div>
      </div>
    </div>
  );
}

function BusinessStep({ form, upd }) {
  return (
    <div>
      <StepHeader icon={Building2} title="Business Profile" subtitle="Tell us about the entity you represent" />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Client Type" required>
          <Select value={form.client_type} onValueChange={v => upd('client_type', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Individual">Individual</SelectItem>
              <SelectItem value="Corporate">Corporate</SelectItem>
              <SelectItem value="Institutional">Institutional</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Job Title"><Input value={form.job_title} onChange={e => upd('job_title', e.target.value)} placeholder="Director" /></Field>
        {form.client_type !== 'Individual' && (
          <>
            <Field label="Company Name" required><Input value={form.company} onChange={e => upd('company', e.target.value)} placeholder="Acme Pty Ltd" /></Field>
            <Field label="Registration No."><Input value={form.business_registration_number} onChange={e => upd('business_registration_number', e.target.value)} placeholder="2018/123456/07" /></Field>
            <div className="col-span-2"><Field label="Industry">
              <Select value={form.industry} onValueChange={v => upd('industry', v)}>
                <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                <SelectContent>{INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
              </Select>
            </Field></div>
          </>
        )}
      </div>
    </div>
  );
}

function KycStep({ form, upd }) {
  return (
    <div>
      <StepHeader icon={ShieldCheck} title="Identity Verification" subtitle="FICA / KYC compliance details" />
      <div className="grid grid-cols-2 gap-4">
        <Field label="ID Type" required>
          <Select value={form.id_type} onValueChange={v => upd('id_type', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="passport">Passport</SelectItem>
              <SelectItem value="id_book">SA ID Book</SelectItem>
              <SelectItem value="drivers_license">Driver's License</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="ID / Passport Number" required><Input value={form.id_number} onChange={e => upd('id_number', e.target.value)} placeholder="A12345678" /></Field>
        <div className="col-span-2"><Field label="Residential Address" required><Textarea value={form.residential_address} onChange={e => upd('residential_address', e.target.value)} placeholder="123 Main Street, Sandton, Johannesburg, 2196" rows={3} /></Field></div>
      </div>
      <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">Document uploads (ID copy, proof of address) can be submitted via the File Cabinet after onboarding.</p>
      </div>
    </div>
  );
}

function TradingStep({ form, upd, toggleCurrency }) {
  return (
    <div>
      <StepHeader icon={TrendingUp} title="Trading Profile" subtitle="Help us tailor your experience" />
      <div className="space-y-4">
        <Field label="Preferred Currencies">
          <div className="flex gap-2 flex-wrap">
            {CURRENCIES.map(c => (
              <button key={c} type="button" onClick={() => toggleCurrency(c)}
                className={`text-xs px-3 py-1.5 rounded-md border transition-all ${form.preferred_currencies.includes(c) ? 'bg-primary/20 text-primary border-primary/40' : 'border-border text-muted-foreground hover:border-primary/30'}`}>
                {c}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Preferred Routes"><Input value={form.preferred_routes} onChange={e => upd('preferred_routes', e.target.value)} placeholder="ZAR>USDT, USD>ZAR" /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Source of Funds"><Input value={form.source_of_funds} onChange={e => upd('source_of_funds', e.target.value)} placeholder="Business revenue" /></Field>
          <Field label="Est. Annual Volume (USD)"><Input type="number" value={form.estimated_annual_volume_usd} onChange={e => upd('estimated_annual_volume_usd', e.target.value)} placeholder="500000" /></Field>
        </div>
        <Field label="Referred By"><Input value={form.referred_by} onChange={e => upd('referred_by', e.target.value)} placeholder="Referral source (optional)" /></Field>
      </div>
    </div>
  );
}

function ReviewStep({ form }) {
  const sections = [
    { label: 'Personal', icon: User, items: [['Name', form.name], ['Email', form.email], ['Phone', form.phone], ['DOB', form.date_of_birth], ['Country', form.country]] },
    { label: 'Business', icon: Building2, items: [['Type', form.client_type], ['Company', form.company], ['Industry', form.industry], ['Reg No.', form.business_registration_number]] },
    { label: 'Identity', icon: ShieldCheck, items: [['ID Type', form.id_type], ['ID Number', form.id_number], ['Address', form.residential_address]] },
    { label: 'Trading', icon: TrendingUp, items: [['Currencies', form.preferred_currencies.join(', ')], ['Routes', form.preferred_routes], ['Source of Funds', form.source_of_funds], ['Est. Volume', form.estimated_annual_volume_usd ? `$${Number(form.estimated_annual_volume_usd).toLocaleString()}` : '']] },
  ];
  return (
    <div>
      <StepHeader icon={CheckCircle2} title="Review & Submit" subtitle="Confirm the details below before onboarding" />
      <div className="space-y-4">
        {sections.map(s => (
          <div key={s.label} className="rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-3"><s.icon className="w-4 h-4 text-primary" /><span className="text-sm font-semibold text-foreground">{s.label}</span></div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {s.items.map(([l, v]) => v ? (
                <div key={l} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{l}</span>
                  <span className="text-foreground font-medium text-right truncate ml-2 max-w-[200px]">{v}</span>
                </div>
              ) : null)}
            </div>
          </div>
        ))}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending KYC</Badge>
          <span className="text-xs text-muted-foreground">Client will be created with pending status. Verify documents to activate.</span>
        </div>
      </div>
    </div>
  );
}