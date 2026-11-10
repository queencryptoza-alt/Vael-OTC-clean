import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft, ChevronRight, Download, CheckCircle2,
  ShieldCheck, Lock, ArrowLeftRight, Building2, Globe, Activity, Layers,
  Play, X, Volume2, VolumeX, Zap
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const SLIDES = [
  {
    type: 'cover',
    badge: 'PRIVATE & CONFIDENTIAL // INSTITUTIONAL BRIEFING',
    title: 'VAEL TERMINAL',
    subtitle: 'High-volume digital asset execution, bilateral DvP settlement, and regulatory treasury infrastructure for South African corporate desks.',
    metrics: [
      { label: 'Settlement Architecture', value: 'T+0 Bilateral DvP' },
      { label: 'Regulatory Alignment', value: 'FSCA CASP & SARS CARF' },
      { label: 'Execution Model', value: 'Principal 2-Way RFQ' },
    ],
  },
  {
    type: 'market',
    badge: 'STRUCTURAL FRICTION',
    title: 'The Challenge of 8-Figure Cross-Border Liquidity',
    lead: 'Corporate treasuries routing R50M–R200M monthly face significant friction across fragmented local and international rails.',
    cards: [
      {
        title: 'Execution Slippage',
        desc: 'Traditional retail exchanges lack institutional depth. Multi-million ZAR tickets move the order book, creating massive slippage on ZAR/USDT pairs.',
      },
      {
        title: 'Settlement Latency & Counterparty Risk',
        desc: 'Informal OTC desks rely on chat groups and manual proof-of-payment receipts, introducing critical delivery-versus-payment (DvP) vulnerabilities.',
      },
      {
        title: 'Regulatory & Audit Liability',
        desc: 'South African CASP mandates, SARB FinSurv reporting (BoP categories), and OECD CARF schemas make spreadsheet operations a compliance risk.',
      },
    ],
  },
  {
    type: 'solution',
    badge: 'THE PROTOCOL',
    title: 'Institutional Desk Architecture',
    lead: 'VAEL Terminal establishes a single sovereign operations portal uniting live pricing, settlement automation, and verifiable compliance.',
    features: [
      {
        title: 'Composite Liquidity Engine',
        desc: 'Aggregates depth from top-tier institutional liquidity providers with real-time XE benchmark rate indexing and customizable spread markups.',
      },
      {
        title: 'Deterministic Bilateral Trade Tickets',
        desc: 'Every ticket generates an immutable digital trade confirmation with deterministic reference IDs, legal terms, and verifiable bank details.',
      },
      {
        title: 'Sovereign Multi-Tenant Isolation',
        desc: 'Deployable as an isolated corporate operations node with dedicated database partitioning, enterprise branding, and full counterparty confidentiality.',
      },
    ],
  },
  {
    type: 'rails',
    badge: 'GLOBAL CLEARING',
    title: 'Sovereign Corridors & Settlement Channels',
    lead: 'Optimized high-capacity corridors engineered for seamless fiat-to-digital asset treasury movement.',
    corridors: [
      { corridor: 'ZAR ⇄ USD / USDT', clearing: 'Domestic RTC PayShap / TRC-20 & ERC-20', latency: '< 15 mins', status: 'OPERATIONAL' },
      { corridor: 'ZAR ⇄ AED (Dubai)', clearing: 'Direct DIFC / DMCC OTC Bilateral Clearing', latency: 'Same Day', status: 'OPERATIONAL' },
      { corridor: 'ZAR ⇄ GBP / EUR', clearing: 'Interbank SWIFT / SEPA Corporate Rails', latency: 'T+0 / T+1', status: 'ACTIVE' },
    ],
  },
  {
    type: 'compliance',
    badge: 'GOVERNANCE & AUDIT',
    title: 'Built-in Regulatory Safeguards',
    lead: 'Engineered specifically to satisfy South African and international financial supervisory standards directly at execution.',
    items: [
      {
        tag: 'SARS CARF READY',
        text: 'Automated extraction of Crypto-Asset Reporting Framework schemas for transaction disposals, acquisitions, and cross-border transfers.',
      },
      {
        tag: 'SARB FINSURV AUDITABLE',
        text: 'Full capture of Balance of Payments (BoP) categories, Single Discretionary Allowance (SDA), and Foreign Investment Allowance (FIA) tracking.',
      },
      {
        tag: 'FICA TIER-3 COMPLIANCE',
        text: 'Automated KYC/KYB document expiry guards, proof-of-funds verification, and sanctions watchlist checks before ticket locking.',
      },
    ],
  },
  {
    type: 'cta',
    badge: 'ENTERPRISE DEPLOYMENT',
    title: 'Deploy Institutional Operations',
    lead: 'VAEL Terminal operates on private infrastructure under your organization’s sole operational control.',
    points: [
      'Zero third-party SaaS lock-in or platform transaction royalties',
      'Direct integration with host-to-host banking and institutional multi-sig custody',
      'White-label portal tailored for private wealth, miners, and commercial importers',
    ],
  },
];

function VideoTrailerModal({ isOpen, onClose }) {
  const [step, setStep] = useState(0);
  const [muted, setMuted] = useState(false);
  const audioCtxRef = useRef(null);

  const playSound = (type) => {
    if (muted) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      if (type === 'bass') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 1.2);
        gain.gain.setValueAtTime(0.7, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.2);
      } else if (type === 'tick') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch {}
  };

  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      return;
    }

    const timeline = [
      { t: 400, fn: () => { setStep(1); playSound('tick'); } },
      { t: 3200, fn: () => { setStep(2); playSound('bass'); } },
      { t: 6800, fn: () => { setStep(3); playSound('bass'); } },
      { t: 10800, fn: () => { setStep(4); playSound('bass'); } },
    ];

    const timers = timeline.map((item) => setTimeout(item.fn, item.t));
    return () => timers.forEach(clearTimeout);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 font-mono select-none">
      <div className="absolute top-6 right-6 flex items-center gap-3 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMuted(!muted)}
          className="border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white rounded-full w-9 h-9"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onClose}
          className="border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white rounded-full w-9 h-9"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="w-full max-w-5xl aspect-[16/9] bg-[#070A0F] border border-slate-800 rounded-2xl overflow-hidden relative flex flex-col justify-between shadow-[0_0_80px_rgba(37,99,235,0.15)]">
        <div className="absolute inset-0 bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none" />

        <div className="my-auto text-center px-6 relative z-10">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="scene1"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, filter: 'blur(10px)' }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <div className="text-red-500 font-mono text-xs tracking-[0.4em] uppercase font-bold">
                  LIQUIDITY FRAGMENTATION // SPREAD SLIPPAGE
                </div>
                <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight font-sans max-w-3xl mx-auto">
                  When you move eight figures across borders...
                </h2>
                <p className="text-sm md:text-base text-slate-400 font-mono">
                  Seconds aren't time. They're capital.
                </p>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="scene2"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, filter: 'blur(10px)' }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-2 text-blue-400">
                  <Globe className="w-8 h-8 animate-pulse" />
                </div>
                <div className="text-blue-400 font-mono text-xs tracking-[0.4em] uppercase font-bold">
                  JOHANNESBURG ⇄ DUBAI ⇄ LONDON
                </div>
                <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight font-sans">
                  Sovereign Cross-Border Liquidity
                </h2>
                <p className="text-sm md:text-base text-slate-400 font-mono max-w-xl mx-auto">
                  Zero retail order books. Zero hawala latency. Bilateral Delivery versus Payment.
                </p>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="scene3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                <div className="inline-flex gap-2 text-emerald-400 text-xs font-mono bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-full uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" /> SARS CARF & SARB FINSURV READY
                </div>
                <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight font-sans">
                  Compliance Built Directly at the Ticket Level
                </h2>
                <p className="text-sm md:text-base text-slate-400 font-mono max-w-lg mx-auto">
                  Deterministic audit logs, FICA Tier-3 verification, and automated foreign allowance tracking.
                </p>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="scene4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="w-20 h-20 rounded-3xl bg-blue-600/20 border-2 border-blue-500 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(37,99,235,0.4)]">
                  <Zap className="w-10 h-10 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight font-sans">
                    VAEL <span className="text-blue-500">TERMINAL</span>
                  </h1>
                  <p className="text-xs md:text-sm text-slate-400 tracking-[0.3em] font-mono mt-2 uppercase">
                    Institutional Digital Asset Operations
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    onClick={onClose}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs px-8 py-5 rounded-lg shadow-lg"
                  >
                    ENTER LIVE DESK →
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="border-t border-slate-800/80 p-4 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>VAEL TERMINAL // 4K TEASER</span>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1 rounded-full transition-all duration-300 ${step === s ? 'w-6 bg-blue-500' : 'w-2 bg-slate-800'}`}
              />
            ))}
          </div>
          <span>terminal.vaelotc.com</span>
        </div>
      </div>
    </div>
  );
}

export default function PitchDeck({ autoPlayTrailer = false, standalone = false }) {
  const [current, setCurrent] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [showTrailer, setShowTrailer] = useState(autoPlayTrailer);
  const deckRef = useRef(null);

  const next = useCallback(() => setCurrent((c) => Math.min(c + 1, SLIDES.length - 1)), []);
  const prev = useCallback(() => setCurrent((c) => Math.max(c - 1, 0)), []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [next, prev]);

  const exportPDF = async () => {
    setExporting(true);
    try {
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1280, 720] });
      const node = deckRef.current;
      if (!node) return;

      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: '#070A0F',
        logging: false,
      });

      pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 1280, 720);
      pdf.save(`VAEL-Terminal-Executive-Briefing.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  const slide = SLIDES[current];

  return (
    <div className="min-h-screen bg-[#070A0F] text-slate-100 flex flex-col justify-between p-6 lg:p-10 font-sans select-none">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="h-5 w-1 bg-blue-600 rounded-full" />
          <span className="font-mono text-xs tracking-widest text-slate-400 uppercase font-semibold">
            VAEL OTC // EXECUTIVE BRIEFING
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => setShowTrailer(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono px-3 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
          >
            <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
            Watch Trailer
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={exportPDF}
            disabled={exporting}
            className="border-slate-800 bg-slate-900 text-slate-200 text-xs hover:bg-slate-800"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            {exporting ? 'Generating...' : 'Export Slide'}
          </Button>

          <span className="font-mono text-xs text-slate-400 border-l border-slate-800 pl-3">
            {current + 1} / {SLIDES.length}
          </span>
        </div>
      </div>

      <div
        ref={deckRef}
        className="w-full max-w-6xl mx-auto my-auto aspect-[16/9] bg-[#0A0E17] border border-slate-800 rounded-xl p-10 lg:p-14 flex flex-col justify-between shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-3xl pointer-events-none rounded-full" />

        <div>
          <Badge className="bg-blue-950/60 text-blue-400 border border-blue-800/60 font-mono text-[10px] px-2.5 py-0.5 tracking-wider uppercase mb-4">
            {slide.badge}
          </Badge>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white max-w-3xl leading-tight">
            {slide.title}
          </h1>
          {slide.subtitle && (
            <p className="text-base text-slate-300 mt-3 max-w-2xl font-normal leading-relaxed">{slide.subtitle}</p>
          )}
          {slide.lead && (
            <p className="text-sm text-slate-400 mt-2 max-w-2xl font-normal leading-relaxed">{slide.lead}</p>
          )}
        </div>

        <div className="my-auto py-4">
          {slide.type === 'cover' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
              {slide.metrics.map((m, idx) => (
                <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{m.label}</span>
                  <p className="text-base font-bold text-slate-100 font-mono mt-1">{m.value}</p>
                </div>
              ))}
            </div>
          )}

          {slide.type === 'market' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {slide.cards.map((c, idx) => (
                <div key={idx} className="bg-slate-900/40 border border-slate-800 p-5 rounded-lg space-y-2">
                  <p className="font-semibold text-slate-200 text-sm font-sans">{c.title}</p>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">{c.desc}</p>
                </div>
              ))}
            </div>
          )}

          {slide.type === 'solution' && (
            <div className="space-y-3 max-w-3xl">
              {slide.features.map((f, idx) => (
                <div key={idx} className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-lg flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{f.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {slide.type === 'rails' && (
            <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/40">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3 font-semibold uppercase">Liquidity Corridor</th>
                    <th className="p-3 font-semibold uppercase">Clearing Rail</th>
                    <th className="p-3 font-semibold uppercase">Execution Latency</th>
                    <th className="p-3 font-semibold uppercase">System Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {slide.corridors.map((c, idx) => (
                    <tr key={idx} className="text-slate-200">
                      <td className="p-3 font-bold text-blue-400">{c.corridor}</td>
                      <td className="p-3 text-slate-300">{c.clearing}</td>
                      <td className="p-3 text-slate-400">{c.latency}</td>
                      <td className="p-3">
                        <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded text-[10px]">
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {slide.type === 'compliance' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {slide.items.map((it, idx) => (
                <div key={idx} className="bg-slate-900/60 border border-slate-800 p-4 rounded-lg">
                  <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wide">{it.tag}</span>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">{it.text}</p>
                </div>
              ))}
            </div>
          )}

          {slide.type === 'cta' && (
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-lg max-w-2xl space-y-3">
              {slide.points.map((pt, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 font-mono text-[10px] text-slate-400">
          <span>HOSTED VIA PRIVATE NODE // terminal.vaelotc.com</span>
          <span>FSCA COMPLIANT DESK INFRASTRUCTURE</span>
        </div>
      </div>

      <div className="flex items-center justify-between max-w-6xl w-full mx-auto pt-4">
        <Button variant="ghost" size="sm" onClick={prev} disabled={current === 0} className="text-slate-400 hover:text-white">
          <ChevronLeft className="w-4 h-4 mr-1" /> Previous
        </Button>
        <div className="flex gap-1.5">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-1.5 rounded-full transition-all ${idx === current ? 'w-6 bg-blue-600' : 'w-2 bg-slate-800'}`}
            />
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={next} disabled={current === SLIDES.length - 1} className="text-slate-400 hover:text-white">
          Next <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <VideoTrailerModal isOpen={showTrailer} onClose={() => setShowTrailer(false)} />
    </div>
  );
}
