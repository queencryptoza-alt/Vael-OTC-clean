import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { User, Mail, Shield, UserPlus, Bell, Loader2, Check, Globe, Save, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const Toggle = ({ checked, onChange }) => (
  <button onClick={() => onChange(!checked)}
    className={`w-11 h-6 rounded-full transition-colors relative ${checked ? 'bg-primary' : 'bg-muted'}`}>
    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
  </button>
);

export default function Settings() {
  const { user } = useOutletContext();
  const isAdmin = user?.role === 'admin';

  const [profile, setProfile] = useState({ full_name: user?.full_name || '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [inviting, setInviting] = useState(false);

  const [tradingDefaults, setTradingDefaults] = useState({
    defaultSource: 'ZAR',
    defaultTarget: 'USDT',
    defaultFee: '1.5',
    preferredExchanges: 'Valr, Luno, OVEX',
    largeTradeThreshold: '500000',
  });

  const [alerts, setAlerts] = useState({
    rampOffline: true,
    complianceExpiry: true,
    largeTrade: true,
    kycExpiry: true,
  });

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await base44.auth.updateMe({ full_name: profile.full_name });
      toast.success('Profile updated');
    } catch { toast.error('Failed to update profile'); }
    setSavingProfile(false);
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    try {
      await base44.users.inviteUser(inviteEmail, inviteRole);
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
    } catch (e) { toast.error(e?.message || 'Failed to send invitation'); }
    setInviting(false);
  };

  const handleSaveTradingDefaults = () => toast.success('Trading defaults saved');

  return (
    <div className="space-y-6 pt-8 lg:pt-0 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure your desk</p>
        </div>
        <Button onClick={handleSaveTradingDefaults} className="bg-primary text-primary-foreground">
          <Save className="w-4 h-4 mr-1.5" /> Save
        </Button>
      </div>

      {/* Trading Defaults */}
      {isAdmin && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" /> Trading Defaults
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Default Source Currency</Label>
                <Input value={tradingDefaults.defaultSource} onChange={e => setTradingDefaults(p => ({ ...p, defaultSource: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Default Target Currency</Label>
                <Input value={tradingDefaults.defaultTarget} onChange={e => setTradingDefaults(p => ({ ...p, defaultTarget: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Default Fee %</Label>
                <Input value={tradingDefaults.defaultFee} onChange={e => setTradingDefaults(p => ({ ...p, defaultFee: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Preferred Exchanges</Label>
                <Input value={tradingDefaults.preferredExchanges} onChange={e => setTradingDefaults(p => ({ ...p, preferredExchanges: e.target.value }))} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts */}
      {isAdmin && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" /> Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'rampOffline', label: 'Ramp Offline Alert', desc: 'Get notified when a ramp goes offline' },
              { key: 'complianceExpiry', label: 'Compliance Expiry Alert', desc: 'Alert before compliance documents expire' },
              { key: 'largeTrade', label: 'Large Trade Alert', desc: 'Notify on trades above threshold' },
              { key: 'kycExpiry', label: 'KYC Expiry Alert', desc: 'Automated reminder 30 days before KYC expires' },
            ].map((a, i) => (
              <div key={a.key}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{a.label}</p>
                    <p className="text-xs text-muted-foreground">{a.desc}</p>
                  </div>
                  <Toggle checked={alerts[a.key]} onChange={v => setAlerts(p => ({ ...p, [a.key]: v }))} />
                </div>
                {i < 3 && <Separator className="mt-4" />}
              </div>
            ))}
            <div className="space-y-1.5 pt-1">
              <Label className="text-xs">Large Trade Threshold (ZAR)</Label>
              <Input value={tradingDefaults.largeTradeThreshold} onChange={e => setTradingDefaults(p => ({ ...p, largeTradeThreshold: e.target.value }))} className="font-mono max-w-xs" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-bold text-primary">{user?.full_name?.[0]?.toUpperCase() || '?'}</span>
            </div>
            <div>
              <p className="font-medium text-foreground">{user?.full_name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              <Badge className={`text-[10px] mt-1 ${isAdmin ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                <Shield className="w-3 h-3 mr-1" />{user?.role}
              </Badge>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Display Name</Label>
            <Input value={profile.full_name} onChange={e => setProfile({ full_name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ''} readOnly className="bg-secondary opacity-60 cursor-not-allowed" />
          </div>
          <Button onClick={handleSaveProfile} disabled={savingProfile} className="bg-primary text-primary-foreground">
            {savingProfile ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
            Save Profile
          </Button>
        </CardContent>
      </Card>

      {/* Invite Users */}
      {isAdmin && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-primary" /> Invite Users
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">Send an invitation to a new team member or client.</p>
            <div className="flex gap-2 flex-wrap">
              <Input placeholder="Email address" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} className="flex-1 min-w-[200px]" />
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Client (user)</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleInvite} disabled={inviting || !inviteEmail} className="bg-primary text-primary-foreground">
                {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4 mr-1" />}
                {inviting ? 'Sending...' : 'Send Invite'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Account */}
      <Card className="bg-card border-destructive/30">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-4 h-4" /> Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="bg-destructive text-destructive-foreground">
                <Trash2 className="w-4 h-4 mr-2" /> Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground">Delete Account?</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  This will permanently delete your account and remove your access to the terminal.
                  All your tickets, files, and settings will be lost. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={async () => {
                    try {
                      await base44.entities.User.delete(user?.id);
                      toast.success('Account deleted');
                      base44.auth.logout();
                    } catch (e) {
                      toast.error(e?.message || 'Could not delete account. Contact support.');
                    }
                  }}
                >
                  Yes, Delete My Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}