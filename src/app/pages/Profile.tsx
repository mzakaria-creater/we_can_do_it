/**
 * 👤 Press2Pay - Profile Page
 * User profile management
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Phone, Building, Calendar, Shield, Key } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export default function Profile() {
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    company: '',
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        setUser(authUser);
        
        // Fetch from user_profiles table
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          // Fallback to user metadata if profile doesn't exist
          setFormData({
            full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || '',
            email: authUser.email || '',
            phone: authUser.user_metadata?.phone || '',
            company: authUser.user_metadata?.company || '',
          });
        } else {
          // Use profile data
          setFormData({
            full_name: profile.full_name || '',
            email: authUser.email || '',
            phone: profile.phone || '',
            company: profile.company || '',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          name: formData.full_name,
          phone: formData.phone,
          company: formData.company,
        },
      });

      if (authError) throw authError;

      // Update user_profiles table
      if (user?.id) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            id: user.id,
            full_name: formData.full_name,
            phone: formData.phone,
            company: formData.company,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'id'
          });

        if (profileError) {
          console.error('Profile update error:', profileError);
          // Don't throw, auth update succeeded
        }
      }

      toast.success('تم حفظ التعديلات بنجاح');
      fetchUserProfile();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error('فشل حفظ التعديلات');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gold-500">{t('profile')}</h1>
      </div>

      {/* Profile Header */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-gold-500/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 border-2 border-gold-500">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-gold-600 text-black text-2xl">
                {formData.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gold-500">
                {formData.full_name || user?.email}
              </h2>
              <p className="text-gray-400">{user?.email}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="border-gold-500 text-gold-500">
                  {user?.user_metadata?.role || 'user'}
                </Badge>
                <Badge variant="outline" className="border-green-500 text-green-500">
                  Active
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card className="bg-gray-900 border-gold-500/30">
        <CardHeader>
          <CardTitle className="text-gold-500 flex items-center gap-2">
            <User className="w-5 h-5" />
            {t('personal_information')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">{t('full_name')}</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="bg-black border-gold-500/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-black border-gold-500/30 opacity-60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t('phone')}</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-black border-gold-500/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">{t('company')}</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="bg-black border-gold-500/30"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={fetchUserProfile}
              disabled={saving}
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gold-600 hover:bg-gold-700"
            >
              {saving ? t('saving') : t('save')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Details */}
      <Card className="bg-gray-900 border-gold-500/30">
        <CardHeader>
          <CardTitle className="text-gold-500 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {t('account_details')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">{t('created_at')}</span>
            </div>
            <span className="text-white">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('ar-EG') : '-'}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <Key className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">{t('user_id')}</span>
            </div>
            <span className="text-white font-mono text-sm">{user?.id?.substring(0, 8)}...</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Named export for compatibility
export { Profile };