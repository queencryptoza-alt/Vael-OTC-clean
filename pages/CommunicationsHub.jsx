import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  MessageSquareText, Phone, QrCode, CheckCircle2, Circle,
  ArrowRight, FileText, Send, Paperclip, MoreVertical
} from 'lucide-react';

// Mock connections
const initialConnections = [
  { id: 'wa', label: 'WhatsApp Business', icon: 'whatsapp', connected: false, phone: null },
  { id: 'tg', label: 'Telegram', icon: 'telegram', connected: false, phone: null },
  { id: 'sg', label: 'Signal', icon: 'signal', connected: false, phone: null },
];

// Mock conversations
const mockThreads = [
  { id: 1, network: 'whatsapp', client: 'James Muller', lastMsg: 'I need to settle R2.5M USDT today', time: '14:32', unread: 2 },
  { id: 2, network: 'telegram', client: 'Crypto Capital Ltd', lastMsg: 'Can we execute the arbitrage trade at 09:00?', time: '13:15', unread: 0 },
  { id: 3, network: 'signal', client: 'Sarah Chen', lastMsg: 'Wallet address confirmed on TRC-20', time: '11:48', unread: 1 },
  { id: 4, network: 'whatsapp', client: 'Marcus du Toit', lastMsg: 'RFQ for 500k USDT to ZAR EFT', time: '10:20', unread: 0 },
  { id: 5, network: 'telegram', client: 'Institutional Desk HK', lastMsg: 'Large block: $5M BTC settlement', time: '09:05', unread: 3 },
  { id: 6, network: 'signal', client: 'Nico van Wyk', lastMsg: 'FICA docs uploaded to file cabinet', time: 'Yesterday', unread: 0 },
];

// Mock chat messages
const mockMessages = [
  { from: 'them', text: 'Hi, I need to settle some USDT today. Can you help?', time: '14:28' },
  { from: 'me', text: 'Absolutely. What volume are you looking at?', time: '14:29' },
  { from: 'them', text: 'Around R2.5 million equivalent in USDT, destination ZAR EFT to Standard Bank.', time: '14:31' },
  { from: 'them', text: 'I need to settle R2.5M USDT today', time: '14:32' },
];

const networkIcons = {
  whatsapp: { bg: 'bg-green-500/10', fg: 'text-green-400', label: 'WA' },
  telegram: { bg: 'bg-blue-500/10', fg: 'text-blue-400', label: 'TG' },
  signal: { bg: 'bg-purple-500/10', fg: 'text-purple-400', label: 'SG' },
};

export default function CommunicationsHub() {
  const { user } = useOutletContext();
  const [connections, setConnections] = useState(initialConnections);
  const [activeConnModal, setActiveConnModal] = useState(null);
  const [qrVisible, setQrVisible] = useState(null);
  const [activeThread, setActiveThread] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [showRFQ, setShowRFQ] = useState(false);
  const [rfqVolume, setRfqVolume] = useState('');
  const [rfqAsset, setRfqAsset] = useState('USDT');

  const connect = (id) => {
    setConnections(prev => prev.map(c => c.id === id ? { ...c, connected: true, phone: '+27 82 555 0192' } : c));
    setActiveConnModal(null);
    setQrVisible(null);
  };

  const openConnect = (conn) => {
    setActiveConnModal(conn.id);
    if (conn.id === 'sg') return; // Signal uses API creds, not QR
    setQrVisible(conn.id);
  };

  const activeClient = activeThread ? mockThreads.find(t => t.id === activeThread) : null;
  const netStyle = activeClient ? networkIcons[activeClient.network] : null;

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    setNewMessage('');
  };

  const convertToRFQ = () => {
    if (!rfqVolume || !rfqAsset) return;
    setShowRFQ(false);
    setRfqVolume('');
    setRfqAsset('USDT');
  };

  return (
    <div className="flex gap-0 h-[calc(100vh-120px)] pt-8 lg:pt-0">
      {/* Left Panel */}
      <div className="w-[280px] flex-shrink-0 border-r border-border bg-card/50 flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <MessageSquareText className="w-4 h-4 text-primary" /> Secure Comms
          </h2>
        </div>

        {/* Connections */}
        <div className="p-3 space-y-2 border-b border-border">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Connected Accounts</p>
          {connections.map(conn => (
            <button
              key={conn.id}
              onClick={() => conn.connected ? null : openConnect(conn)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[11px] transition-all ${
                conn.connected
                  ? 'bg-primary/5 border border-primary/20 cursor-default'
                  : 'bg-secondary/30 border border-border hover:border-primary/30 hover:bg-secondary/50'
              }`}
            >
              {conn.connected ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-muted-foreground" />
              )}
              <span className="flex-1 text-left text-foreground">{conn.label}</span>
              {conn.connected ? (
                <Badge className="text-[9px] bg-primary/15 text-primary border-0 h-4 px-1.5">
                  {conn.phone}
                </Badge>
              ) : (
                <span className="text-[10px] text-muted-foreground">Connect</span>
              )}
            </button>
          ))}
        </div>

        {/* Thread list */}
        <div className="flex-1 overflow-y-auto">
          <p className="px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Conversations</p>
          {mockThreads.map(thread => {
            const ns = networkIcons[thread.network];
            return (
              <button
                key={thread.id}
                onClick={() => setActiveThread(thread.id)}
                className={`w-full text-left px-3 py-2.5 border-b border-border/30 transition-colors ${
                  activeThread === thread.id ? 'bg-primary/5 border-l-[3px] border-l-primary pl-[9px]' : 'hover:bg-secondary/20'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className={`w-6 h-6 rounded-full ${ns.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <span className={`text-[9px] font-bold ${ns.fg}`}>{ns.label}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-medium text-foreground truncate">{thread.client}</span>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">{thread.time}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">{thread.lastMsg}</p>
                  </div>
                  {thread.unread > 0 && (
                    <Badge className="bg-primary text-primary-foreground text-[9px] h-4 min-w-[16px] flex items-center justify-center rounded-full">{thread.unread}</Badge>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Chat Window */}
      <div className="flex-1 flex flex-col bg-card/30">
        {activeThread && activeClient ? (
          <>
            {/* Chat header */}
            <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-full ${netStyle?.bg} flex items-center justify-center`}>
                  <span className={`text-[10px] font-bold ${netStyle?.fg}`}>{netStyle?.label}</span>
                </div>
                <div>
                  <p className="text-[13px] font-medium text-foreground">{activeClient.client}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{activeClient.network}</p>
                </div>
              </div>
              <Button
                size="sm"
                className="h-7 text-[10px] bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setShowRFQ(true)}
              >
                <FileText className="w-3 h-3 mr-1" /> Convert to RFQ Ticket
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {mockMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-lg px-3 py-2 text-[12px] ${
                    msg.from === 'me'
                      ? 'bg-primary/15 text-foreground'
                      : 'bg-secondary/40 text-foreground'
                  }`}>
                    <p>{msg.text}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-border flex items-center gap-2">
              <button className="text-muted-foreground hover:text-foreground"><Paperclip className="w-4 h-4" /></button>
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                className="flex-1 h-8 text-[12px] bg-secondary/30 border-border"
              />
              <Button size="sm" className="h-8 w-8 p-0" onClick={sendMessage}>
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-2">
              <MessageSquareText className="w-10 h-10 text-muted-foreground/30 mx-auto" />
              <p className="text-sm text-muted-foreground">Select a conversation to start</p>
              <p className="text-[11px] text-muted-foreground/60">Connect your messaging accounts above to aggregate chats</p>
            </div>
          </div>
        )}
      </div>

      {/* QR Modal */}
      {activeConnModal && qrVisible === activeConnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => { setActiveConnModal(null); setQrVisible(null); }}>
          <div className="bg-card rounded-lg p-6 w-[320px] space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-foreground">Connect {connections.find(c => c.id === activeConnModal)?.label}</h3>
            <div className="bg-white rounded-lg p-4 flex items-center justify-center">
              <QrCode className="w-40 h-40 text-slate-900" />
            </div>
            <p className="text-[10px] text-muted-foreground text-center">Open your app and scan this QR code to link your account</p>
            <Button className="w-full h-8 text-xs" onClick={() => connect(activeConnModal)}>Simulate Connection</Button>
          </div>
        </div>
      )}

      {/* Signal Credential Modal */}
      {activeConnModal && !qrVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setActiveConnModal(null)}>
          <div className="bg-card rounded-lg p-6 w-[320px] space-y-3" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-foreground">Connect Signal Account</h3>
            <Input placeholder="Phone number (+27...)" className="h-8 text-xs bg-secondary/30" />
            <Input placeholder="Device linking token" className="h-8 text-xs bg-secondary/30" />
            <Button className="w-full h-8 text-xs" onClick={() => connect(activeConnModal)}>Link Device</Button>
          </div>
        </div>
      )}

      {/* RFQ Overlay */}
      {showRFQ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setShowRFQ(false)}>
          <div className="bg-card rounded-lg p-5 w-[340px] space-y-3" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-foreground">Convert to RFQ Ticket</h3>
            <p className="text-[10px] text-muted-foreground">Client: <span className="text-foreground font-medium">{activeClient?.client}</span></p>
            <div className="flex gap-2">
              <Input placeholder="Volume (ZAR)" value={rfqVolume} onChange={e => setRfqVolume(e.target.value)} className="h-8 text-xs flex-1 font-mono" />
              <Select value={rfqAsset} onValueChange={setRfqAsset}>
                <SelectTrigger className="h-8 text-xs w-[80px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USDT">USDT</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="BTC">BTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full h-8 text-xs" onClick={convertToRFQ}>
              Create RFQ Ticket <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}