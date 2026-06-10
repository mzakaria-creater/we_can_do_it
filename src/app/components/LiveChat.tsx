import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../lib/store';
import { 
  X, 
  Send, 
  Smile, 
  Paperclip, 
  Users, 
  Search,
  MoreVertical,
  Phone,
  Video
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface Message {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
  avatar?: string;
}

interface LiveChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveChat: React.FC<LiveChatProps> = ({ isOpen, onClose }) => {
  const { language, user } = useStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !user) return;

    // Subscribe to chat messages
    const channel = supabase.channel('chat-room', {
      config: { broadcast: { self: true, ack: true } }
    })
      .on('broadcast', { event: 'message' }, (payload) => {
        if (payload?.payload) {
          setMessages(prev => [...prev, payload.payload as Message]);
          setTimeout(scrollToBottom, 100);
        }
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setOnlineUsers(Object.values(state).flat());
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track user presence
          await channel.track({
            userId: user.id,
            userName: user.name,
            online_at: new Date().toISOString()
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [isOpen, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const message: Message = {
      id: crypto.randomUUID(),
      userId: user.id,
      userName: user.name || 'User',
      text: newMessage,
      timestamp: new Date().toISOString()
    };

    try {
      const channel = supabase.channel('chat-room');
      await channel.send({
        type: 'broadcast',
        event: 'message',
        payload: message
      });
      setNewMessage('');
    } catch (err) {
      console.error('[Chat] Failed to send message:', err);
      toast.error(language === 'ar' ? 'فشل في إرسال الرسالة' : 'Failed to send message');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: language === 'ar' ? -300 : 300, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: language === 'ar' ? -300 : 300, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`fixed ${language === 'ar' ? 'left-4' : 'right-4'} bottom-20 lg:bottom-4 w-96 h-[600px] bg-card border border-border rounded-2xl shadow-2xl z-[100] flex flex-col overflow-hidden`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-[#D4AF37]/10 to-[#C49F27]/10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Users size={20} className="text-[#D4AF37]" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-card animate-pulse" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {language === 'ar' ? 'الدردشة المباشرة' : 'Live Chat'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {onlineUsers.length} {language === 'ar' ? 'متصل' : 'online'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground">
                <Phone size={18} />
              </button>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground">
                <Video size={18} />
              </button>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Users size={32} className="text-muted-foreground/30" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' 
                    ? 'ابدأ محادثة مع فريقك'
                    : 'Start a conversation with your team'}
                </p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = message.userId === user?.id;
                let formattedTime = '';
                try {
                  formattedTime = new Date(message.timestamp).toLocaleTimeString(
                    language === 'ar' ? 'ar-EG' : 'en-US',
                    { hour: '2-digit', minute: '2-digit' }
                  );
                } catch (e) {
                  formattedTime = '--:--';
                }

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#C49F27] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                      {message.userName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className={`flex flex-col gap-1 max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                      <span className="text-[10px] text-muted-foreground px-2">
                        {message.userName}
                      </span>
                      <div className={`px-3 py-2 rounded-2xl ${
                        isOwn 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-foreground'
                      }`}>
                        <p className="text-sm break-words">{message.text}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground px-2">
                        {formattedTime}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border bg-card">
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground">
                <Smile size={20} />
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={language === 'ar' ? 'اكتب رسالة...' : 'Type a message...'}
                className="flex-1 bg-muted border-none rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
