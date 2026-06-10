import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Radio, Wifi, WifiOff, Activity, CheckCircle2, XCircle, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useStore } from '../../lib/store';
import { supabase, publicAnonKey, projectId } from '../../lib/supabase';

interface Message {
  id: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE' | 'message_created';
  channel: string;
  payload: any;
  timestamp: string;
}

export const RealtimeDemo = () => {
  const { t } = useTranslation();
  const { language, isAuthenticated } = useStore();
  const isRTL = language === 'ar';
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [generalStatus, setGeneralStatus] = useState<'idle' | 'connecting' | 'subscribed' | 'error'>('idle');
  const [specificStatus, setSpecificStatus] = useState<'idle' | 'connecting' | 'subscribed' | 'error'>('idle');
  const [chatStatus, setChatStatus] = useState<'idle' | 'connecting' | 'subscribed' | 'error'>('idle');
  const [selectedMerchantId, setSelectedMerchantId] = useState('');
  const [merchants, setMerchants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatInput, setChatInput] = useState('');
  
  const generalChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const specificChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const chatChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const authSubRef = useRef<any>(null);

  // Memoized topics
  const generalTopic = useMemo(() => 'kv:merchant', []);
  const specificTopic = useMemo(() => selectedMerchantId ? `kv:merchant:${selectedMerchantId}` : null, [selectedMerchantId]);
  const chatTopic = useMemo(() => 'room:demo:messages', []);

  // Fetch merchants
  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        const authHeader = session ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`;

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b/merchants`,
          {
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();
        setMerchants(data.merchants || []);
        if (data.merchants && data.merchants.length > 0) {
          setSelectedMerchantId(data.merchants[0].id);
        }
      } catch (error) {
        console.error('Error fetching merchants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMerchants();
  }, []);

  // Setup auth state listener once
  useEffect(() => {
    const { data: authSub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const token = session?.access_token;
      try {
        await supabase.realtime.setAuth(token || '');
        console.log('[Realtime] Auth refreshed');
      } catch (e) {
        console.warn('[Realtime] setAuth refresh failed', e);
      }
    });

    authSubRef.current = authSub;

    return () => {
      if (authSubRef.current?.subscription) {
        authSubRef.current.subscription.unsubscribe();
      }
    };
  }, []);

  // Subscribe to GENERAL channel (kv:merchant)
  useEffect(() => {
    if (generalStatus !== 'connecting') return;

    let isMounted = true;

    const subscribe = async () => {
      try {
        // Ensure JWT is present for private channel auth
        const { data: { session } } = await supabase.auth.getSession();
        await supabase.realtime.setAuth(session?.access_token || '');

        const ch = supabase.channel(generalTopic, {
          config: {
            private: true,
            broadcast: { self: false, ack: true },
          },
        });

        generalChannelRef.current = ch;

        ch.on('broadcast', { event: 'INSERT' }, ({ payload }) => {
          console.log('[Realtime Demo] General - Merchant inserted:', payload.new);
          addMessage('INSERT', generalTopic, payload);
          toast.success(isRTL ? 'تاجر جديد مضاف' : 'New merchant added');
        });

        ch.on('broadcast', { event: 'UPDATE' }, ({ payload }) => {
          console.log('[Realtime Demo] General - Merchant updated:', payload.new);
          addMessage('UPDATE', generalTopic, payload);
          toast.info(isRTL ? 'تم تحديث التاجر' : 'Merchant updated');
        });

        ch.on('broadcast', { event: 'DELETE' }, ({ payload }) => {
          console.log('[Realtime Demo] General - Merchant deleted:', payload.old);
          addMessage('DELETE', generalTopic, payload);
          toast.warning(isRTL ? 'تم حذف التاجر' : 'Merchant deleted');
        });

        const subStatus = await new Promise<'subscribed' | 'timed_out' | 'closed' | 'channel_error'>((resolve) => {
          ch.subscribe((s) => {
            console.log('[Realtime Demo] General channel status:', s);
            resolve(s as any);
          });
        });

        if (!isMounted) return;

        if (subStatus === 'subscribed') {
          setGeneralStatus('subscribed');
          toast.success(isRTL ? 'متصل بالقناة العامة' : 'Connected to general channel');
        } else {
          setGeneralStatus('error');
          toast.error(isRTL ? 'فشل الاتصال بالقناة العامة' : 'Failed to connect to general channel');
        }
      } catch (e) {
        console.warn('[Realtime] General subscribe failed', e);
        if (isMounted) setGeneralStatus('error');
        toast.error(isRTL ? 'خطأ في الاتصال' : 'Connection error');
      }
    };

    subscribe();

    return () => {
      isMounted = false;
      if (generalChannelRef.current) {
        supabase.removeChannel(generalChannelRef.current);
        generalChannelRef.current = null;
      }
    };
  }, [generalStatus, generalTopic, isRTL]);

  // Subscribe to SPECIFIC channel (kv:merchant:id)
  useEffect(() => {
    if (specificStatus !== 'connecting' || !specificTopic) return;

    let isMounted = true;

    const subscribe = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await supabase.realtime.setAuth(session?.access_token || '');

        const ch = supabase.channel(specificTopic, {
          config: {
            private: true,
            broadcast: { self: false, ack: true },
          },
        });

        specificChannelRef.current = ch;

        ch.on('broadcast', { event: 'INSERT' }, ({ payload }) => {
          console.log('[Realtime Demo] Specific - Merchant inserted:', payload.new);
          addMessage('INSERT', specificTopic, payload);
          toast.success(isRTL ? `تاجر محدد مضاف: ${selectedMerchantId.substring(0, 8)}` : `Specific merchant added: ${selectedMerchantId.substring(0, 8)}`);
        });

        ch.on('broadcast', { event: 'UPDATE' }, ({ payload }) => {
          console.log('[Realtime Demo] Specific - Merchant updated:', payload.new);
          addMessage('UPDATE', specificTopic, payload);
          toast.info(isRTL ? `تم تحديث التاجر المحدد: ${selectedMerchantId.substring(0, 8)}` : `Specific merchant updated: ${selectedMerchantId.substring(0, 8)}`);
        });

        ch.on('broadcast', { event: 'DELETE' }, ({ payload }) => {
          console.log('[Realtime Demo] Specific - Merchant deleted:', payload.old);
          addMessage('DELETE', specificTopic, payload);
          toast.warning(isRTL ? `تم حذف التاجر المحدد: ${selectedMerchantId.substring(0, 8)}` : `Specific merchant deleted: ${selectedMerchantId.substring(0, 8)}`);
        });

        const subStatus = await new Promise<'subscribed' | 'timed_out' | 'closed' | 'channel_error'>((resolve) => {
          ch.subscribe((s) => {
            console.log('[Realtime Demo] Specific channel status:', s);
            resolve(s as any);
          });
        });

        if (!isMounted) return;

        if (subStatus === 'subscribed') {
          setSpecificStatus('subscribed');
          toast.success(isRTL ? 'متصل بالقناة الخاصة' : 'Connected to specific channel');
        } else {
          setSpecificStatus('error');
          toast.error(isRTL ? 'فشل الاتصال بالقناة الخاصة' : 'Failed to connect to specific channel');
        }
      } catch (e) {
        console.warn('[Realtime] Specific subscribe failed', e);
        if (isMounted) setSpecificStatus('error');
        toast.error(isRTL ? 'خطأ في الاتصال' : 'Connection error');
      }
    };

    subscribe();

    return () => {
      isMounted = false;
      if (specificChannelRef.current) {
        supabase.removeChannel(specificChannelRef.current);
        specificChannelRef.current = null;
      }
    };
  }, [specificStatus, specificTopic, selectedMerchantId, isRTL]);

  // Subscribe to CHAT channel (room:demo:messages)
  useEffect(() => {
    if (chatStatus !== 'connecting') return;

    let isMounted = true;

    const subscribe = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await supabase.realtime.setAuth(session?.access_token || '');

        const ch = supabase.channel(chatTopic, {
          config: {
            private: true,
            broadcast: { self: true, ack: true },
          },
        });

        chatChannelRef.current = ch;

        ch.on('broadcast', { event: 'message_created' }, ({ payload }) => {
          const data = payload as { id: string; text: string; at: string };
          console.log('[Realtime Demo] Chat message:', data);
          addMessage('message_created', chatTopic, data);
        });

        const subStatus = await new Promise<'subscribed' | 'timed_out' | 'closed' | 'channel_error'>((resolve) => {
          ch.subscribe((s) => {
            console.log('[Realtime Demo] Chat channel status:', s);
            resolve(s as any);
          });
        });

        if (!isMounted) return;

        if (subStatus === 'subscribed') {
          setChatStatus('subscribed');
          toast.success(isRTL ? 'متصل بغرفة الدردشة' : 'Connected to chat room');
        } else {
          setChatStatus('error');
          toast.error(isRTL ? 'فشل الاتصال بغرفة الدردشة' : 'Failed to connect to chat room');
        }
      } catch (e) {
        console.warn('[Realtime] Chat subscribe failed', e);
        if (isMounted) setChatStatus('error');
        toast.error(isRTL ? 'خطأ في الاتصال' : 'Connection error');
      }
    };

    subscribe();

    return () => {
      isMounted = false;
      if (chatChannelRef.current) {
        supabase.removeChannel(chatChannelRef.current);
        chatChannelRef.current = null;
      }
    };
  }, [chatStatus, chatTopic, isRTL]);

  const addMessage = (event: Message['event'], channel: string, payload: any) => {
    const message: Message = {
      id: crypto.randomUUID(),
      event,
      channel,
      payload,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [message, ...prev].slice(0, 50));
  };

  const sendChatMessage = async () => {
    if (!chatChannelRef.current || !chatInput.trim() || chatStatus !== 'subscribed') return;
    
    const msg = {
      id: crypto.randomUUID(),
      text: chatInput.trim(),
      at: new Date().toISOString(),
    };

    const ack = await chatChannelRef.current.send({
      type: 'broadcast',
      event: 'message_created',
      payload: msg,
    });

    if (ack === 'ok') {
      setChatInput('');
      toast.success(isRTL ? 'تم إرسال الرسالة' : 'Message sent');
    } else {
      toast.error(isRTL ? 'فشل إرسال الرسالة' : 'Failed to send message');
    }
  };

  const clearMessages = () => {
    setMessages([]);
    toast.success(isRTL ? 'تم مسح الرسائل' : 'Messages cleared');
  };

  const toggleGeneral = () => {
    if (generalStatus === 'idle' || generalStatus === 'error') {
      setGeneralStatus('connecting');
    } else if (generalStatus === 'subscribed') {
      if (generalChannelRef.current) {
        supabase.removeChannel(generalChannelRef.current);
        generalChannelRef.current = null;
      }
      setGeneralStatus('idle');
      toast.info(isRTL ? 'تم قطع الاتصال من القناة العامة' : 'Disconnected from general channel');
    }
  };

  const toggleSpecific = () => {
    if (!selectedMerchantId) {
      toast.error(isRTL ? 'اختر تاجراً أولاً' : 'Select a merchant first');
      return;
    }
    
    if (specificStatus === 'idle' || specificStatus === 'error') {
      setSpecificStatus('connecting');
    } else if (specificStatus === 'subscribed') {
      if (specificChannelRef.current) {
        supabase.removeChannel(specificChannelRef.current);
        specificChannelRef.current = null;
      }
      setSpecificStatus('idle');
      toast.info(isRTL ? 'تم قطع الاتصال من القناة الخاصة' : 'Disconnected from specific channel');
    }
  };

  const toggleChat = () => {
    if (chatStatus === 'idle' || chatStatus === 'error') {
      setChatStatus('connecting');
    } else if (chatStatus === 'subscribed') {
      if (chatChannelRef.current) {
        supabase.removeChannel(chatChannelRef.current);
        chatChannelRef.current = null;
      }
      setChatStatus('idle');
      toast.info(isRTL ? 'تم قطع الاتصال من غرفة الدردشة' : 'Disconnected from chat room');
    }
  };

  const getStatusColor = (status: typeof generalStatus) => {
    switch (status) {
      case 'subscribed': return 'text-emerald-500';
      case 'connecting': return 'text-amber-500';
      case 'error': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: typeof generalStatus) => {
    switch (status) {
      case 'subscribed': return <Wifi className="text-emerald-500" size={20} />;
      case 'connecting': return <Activity className="text-amber-500 animate-pulse" size={20} />;
      case 'error': return <WifiOff className="text-destructive" size={20} />;
      default: return <WifiOff className="text-muted-foreground" size={20} />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Radio className="text-primary" />
            {isRTL ? 'عرض توضيحي للوقت الفعلي' : 'Realtime Demo'}
          </h2>
          <p className="text-muted-foreground mt-1 text-lg">
            {isRTL 
              ? 'اختبر قنوات البث العامة والخاصة مع Supabase Realtime' 
              : 'Test general and specific broadcast channels with Supabase Realtime'}
          </p>
        </div>
      </div>

      {/* Connection Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* General Channel */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              {getStatusIcon(generalStatus)}
              {isRTL ? 'قناة عامة' : 'General Channel'}
            </h3>
            <button
              onClick={toggleGeneral}
              disabled={generalStatus === 'connecting'}
              className={`px-4 py-2 rounded-xl font-bold transition-all disabled:opacity-50 ${
                generalStatus === 'subscribed'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              {generalStatus === 'connecting' 
                ? (isRTL ? 'جاري الاتصال...' : 'Connecting...') 
                : generalStatus === 'subscribed'
                ? (isRTL ? 'قطع الاتصال' : 'Disconnect')
                : (isRTL ? 'اتصال' : 'Connect')}
            </button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {isRTL ? 'يستقبل جميع تغييرات التجار' : 'Receives all merchant changes'}
          </p>
          <div className={`p-4 rounded-xl border-2 ${
            generalStatus === 'subscribed'
              ? 'border-emerald-500 bg-emerald-500/10' 
              : 'border-border bg-muted/30'
          }`}>
            <code className="text-xs font-mono break-all">kv:merchant</code>
          </div>
          <div className={`mt-2 text-xs font-bold ${getStatusColor(generalStatus)}`}>
            {generalStatus.toUpperCase()}
          </div>
        </div>

        {/* Specific Channel */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              {getStatusIcon(specificStatus)}
              {isRTL ? 'قناة خاصة' : 'Specific Channel'}
            </h3>
            <button
              onClick={toggleSpecific}
              disabled={!selectedMerchantId || specificStatus === 'connecting'}
              className={`px-4 py-2 rounded-xl font-bold transition-all disabled:opacity-50 ${
                specificStatus === 'subscribed'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {specificStatus === 'connecting'
                ? (isRTL ? 'جاري الاتصال...' : 'Connecting...')
                : specificStatus === 'subscribed'
                ? (isRTL ? 'قطع الاتصال' : 'Disconnect')
                : (isRTL ? 'اتصال' : 'Connect')}
            </button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {isRTL ? 'يستقبل التغييرات لتاجر واحد محدد' : 'Receives changes for specific merchant'}
          </p>
          <select
            value={selectedMerchantId}
            onChange={(e) => setSelectedMerchantId(e.target.value)}
            disabled={loading || merchants.length === 0}
            className="w-full p-3 bg-muted border border-border rounded-xl text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {merchants.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.id.substring(0, 8)}...)
              </option>
            ))}
          </select>
          <div className={`p-4 rounded-xl border-2 ${
            specificStatus === 'subscribed'
              ? 'border-blue-500 bg-blue-500/10' 
              : 'border-border bg-muted/30'
          }`}>
            <code className="text-xs font-mono break-all">
              kv:merchant:{selectedMerchantId.substring(0, 8)}...
            </code>
          </div>
          <div className={`mt-2 text-xs font-bold ${getStatusColor(specificStatus)}`}>
            {specificStatus.toUpperCase()}
          </div>
        </div>

        {/* Chat Channel */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              {getStatusIcon(chatStatus)}
              {isRTL ? 'غرفة الدردشة' : 'Chat Room'}
            </h3>
            <button
              onClick={toggleChat}
              disabled={chatStatus === 'connecting'}
              className={`px-4 py-2 rounded-xl font-bold transition-all disabled:opacity-50 ${
                chatStatus === 'subscribed'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : 'bg-violet-500 text-white hover:bg-violet-600'
              }`}
            >
              {chatStatus === 'connecting'
                ? (isRTL ? 'جاري الاتصال...' : 'Connecting...')
                : chatStatus === 'subscribed'
                ? (isRTL ? 'قطع الاتصال' : 'Disconnect')
                : (isRTL ? 'اتصال' : 'Connect')}
            </button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {isRTL ? 'أرسل واستقبل الرسائل الفورية' : 'Send and receive live messages'}
          </p>
          <div className={`p-4 rounded-xl border-2 ${
            chatStatus === 'subscribed'
              ? 'border-violet-500 bg-violet-500/10' 
              : 'border-border bg-muted/30'
          }`}>
            <code className="text-xs font-mono break-all">room:demo:messages</code>
          </div>
          <div className={`mt-2 text-xs font-bold ${getStatusColor(chatStatus)}`}>
            {chatStatus.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Chat Input */}
      {chatStatus === 'subscribed' && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Send className="text-primary" size={20} />
            {isRTL ? 'إرسال رسالة' : 'Send Message'}
          </h3>
          <div className="flex items-center gap-2">
            <input
              className="flex-1 p-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder={isRTL ? 'اكتب رسالة...' : 'Type a message...'}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' ? sendChatMessage() : undefined}
            />
            <button
              onClick={sendChatMessage}
              disabled={!chatInput.trim()}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Send size={16} />
              {isRTL ? 'إرسال' : 'Send'}
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-4">
          {isRTL ? 'الإجراءات' : 'Actions'}
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={clearMessages}
            className="px-4 py-2 bg-muted border border-border text-foreground rounded-xl font-bold hover:bg-muted/80 transition-all"
          >
            {isRTL ? 'مسح الرسائل' : 'Clear Messages'}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          {isRTL 
            ? 'انتقل إلى صفحة العمليات وقم بتغيير حالة التاجر لرؤية الرسائل في الوقت الفعلي' 
            : 'Go to Operations page and change merchant status to see realtime messages'}
        </p>
      </div>

      {/* Message Feed */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Activity className="text-primary" size={20} />
            {isRTL ? 'رسائل البث المباشر' : 'Live Broadcast Messages'}
          </h3>
          <span className="text-sm font-bold text-muted-foreground">
            {messages.length} {isRTL ? 'رسالة' : 'messages'}
          </span>
        </div>
        <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <WifiOff size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                {isRTL 
                  ? 'لا توجد رسائل حتى الآن. اتصل بقناة وقم بتنفيذ إجراء.' 
                  : 'No messages yet. Connect to a channel and perform an action.'}
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="p-4 bg-muted/50 border border-border rounded-xl"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {msg.event === 'INSERT' && <CheckCircle2 size={16} className="text-emerald-500" />}
                    {msg.event === 'UPDATE' && <Activity size={16} className="text-blue-500" />}
                    {msg.event === 'DELETE' && <XCircle size={16} className="text-destructive" />}
                    {msg.event === 'message_created' && <Send size={16} className="text-violet-500" />}
                    <span className={`text-xs font-bold uppercase tracking-wider ${
                      msg.event === 'INSERT' ? 'text-emerald-500' :
                      msg.event === 'UPDATE' ? 'text-blue-500' :
                      msg.event === 'DELETE' ? 'text-destructive' :
                      'text-violet-500'
                    }`}>
                      {msg.event}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(msg.timestamp).toLocaleTimeString(isRTL ? 'ar-EG' : 'en-US')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  <strong>{isRTL ? 'القناة:' : 'Channel:'}</strong> {msg.channel}
                </p>
                <div className="p-2 bg-background/50 rounded-lg">
                  <code className="text-xs font-mono break-all">
                    {JSON.stringify(msg.payload, null, 2)}
                  </code>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};