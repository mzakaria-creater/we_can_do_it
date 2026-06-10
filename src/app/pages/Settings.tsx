import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  User, 
  Lock, 
  Bell, 
  Globe, 
  Shield, 
  Code, 
  Database, 
  ExternalLink,
  Save,
  Trash2,
  Plus
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '../components/ui/tabs';
import { toast } from 'sonner';

export const Settings = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme, language, setLanguage, user } = useStore();

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  const handleLanguageChange = async (lang: 'en' | 'ar') => {
    setLanguage(lang);
    const i18nModule = await import('../../lib/i18n');
    i18nModule.default.changeLanguage(lang);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('settings')}</h1>
        <p className="text-muted-foreground mt-1">Manage your account, organization, and API integrations.</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 h-auto p-1 bg-muted">
          <TabsTrigger value="general" className="gap-2 py-2">
            <Globe size={16} />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="organization" className="gap-2 py-2">
            <User size={16} />
            <span className="hidden sm:inline">Org</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 py-2">
            <Lock size={16} />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-2 py-2">
            <Code size={16} />
            <span className="hidden sm:inline">API & Hooks</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2 py-2">
            <Bell size={16} />
            <span className="hidden sm:inline">Alerts</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance & Locale</CardTitle>
              <CardDescription>Customize how Press2Pay looks and feels for you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Toggle between light and dark themes.</p>
                </div>
                <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Interface Language</Label>
                  <p className="text-sm text-muted-foreground">Choose between English and Arabic (RTL).</p>
                </div>
                <div className="flex bg-muted p-1 rounded-lg">
                  <button 
                    onClick={() => handleLanguageChange('en')}
                    className={`px-3 py-1 text-xs rounded-md transition-all ${language === 'en' ? 'bg-card shadow-sm font-bold' : ''}`}
                  >
                    English
                  </button>
                  <button 
                    onClick={() => handleLanguageChange('ar')}
                    className={`px-3 py-1 text-xs rounded-md transition-all ${language === 'ar' ? 'bg-card shadow-sm font-bold' : ''}`}
                  >
                    العربية
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organization Settings */}
        <TabsContent value="organization" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>Update your company information for settlements and billing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input id="org-name" defaultValue="Press2Pay Holdings" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax-id">Tax ID / CR Number</Label>
                  <Input id="tax-id" defaultValue="1010123456" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Registered Address</Label>
                <Input id="address" defaultValue="Level 15, Nile Towers, Zamalek, Cairo, Egypt" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Settlement Currency</Label>
                  <Input id="currency" defaultValue="EGP" disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">Finance Contact Email</Label>
                  <Input id="contact" defaultValue="finance@press2pay.com" />
                </div>
              </div>
              <Button onClick={handleSave} className="mt-2 bg-primary text-primary-foreground">
                <Save size={16} className="mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
              <CardDescription>Protect your account with modern security standards.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-muted/30">
                <div className="flex gap-4 items-center">
                  <div className="p-3 bg-primary/10 text-primary rounded-full">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Enable 2FA</Button>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Update Password</h4>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="curr-pass">Current Password</Label>
                    <Input id="curr-pass" type="password" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-pass">New Password</Label>
                      <Input id="new-pass" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="conf-pass">Confirm Password</Label>
                      <Input id="conf-pass" type="password" />
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">Update Password</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Settings */}
        <TabsContent value="api" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>Use these keys to authenticate your server-side requests.</CardDescription>
              </div>
              <Button size="sm" className="bg-primary text-primary-foreground">
                <Plus size={16} className="mr-2" />
                Generate Key
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-border rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold">Production Secret Key</span>
                    <span className="text-xs text-muted-foreground">Last used: 2h ago</span>
                  </div>
                  <div className="flex gap-2">
                    <Input value="pp_live_45f8e23a...9d12" readOnly className="font-mono text-xs bg-muted" />
                    <Button variant="outline" size="sm">Reveal</Button>
                  </div>
                </div>
                <div className="p-4 border border-border rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold">Sandbox Secret Key</span>
                    <span className="text-xs text-muted-foreground">Never used</span>
                  </div>
                  <div className="flex gap-2">
                    <Input value="pp_test_11b2c45d...6e78" readOnly className="font-mono text-xs bg-muted" />
                    <Button variant="outline" size="sm">Reveal</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>n8n Webhook Endpoints</CardTitle>
                <CardDescription>Configure URLs where you want to receive transaction events.</CardDescription>
              </div>
              <Button size="sm" variant="outline">
                <Plus size={16} className="mr-2" />
                Add Endpoint
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-xl">
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 bg-accent/10 text-accent rounded-lg flex items-center justify-center">
                      <ExternalLink size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Main Automation Hub</h4>
                      <p className="text-xs text-muted-foreground">https://n8n.press2pay.com/webhook/primary</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                      <Settings size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Settings */}
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk Alerts & Notifications</CardTitle>
              <CardDescription>Configure how you receive critical system and risk alerts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 text-primary rounded-lg">
                    <Database size={20} />
                  </div>
                  <h4 className="font-bold">Telegram Bot Integration</h4>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="tg-token">Bot API Token</Label>
                  <div className="flex gap-2">
                    <Input id="tg-token" value="7349182345:AAH6v7Q8x..." readOnly className="bg-muted" />
                    <Button variant="outline" size="sm">Update</Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Risk alerts are pushed via this bot to the connected group.</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-sm">Notification Channels</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Email Digest (Daily)</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Push Notifications (Browser)</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Critical Risk SMS</Label>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
