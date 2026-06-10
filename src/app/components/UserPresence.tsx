import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../lib/store';
import { Users, Circle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface OnlineUser {
  userId: string;
  userName: string;
  role?: string;
  online_at: string;
}

export const UserPresence: React.FC = () => {
  const { language, user } = useStore();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('online-users')
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.values(state).flat() as OnlineUser[];
        console.log('[Presence] Online users:', users);
        setOnlineUsers(users.filter(u => u.userId !== user.id));
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('[Presence] User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('[Presence] User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            userId: user.id,
            userName: user.name,
            role: user.role,
            online_at: new Date().toISOString()
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  return (
    <div className="relative">
      <button
        onClick={() => setShowList(!showList)}
        className="relative p-2 hover:bg-accent rounded-full transition-colors"
        title={language === 'ar' ? 'المستخدمون المتصلون' : 'Online Users'}
      >
        <Users size={20} />
        {onlineUsers.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background">
            {onlineUsers.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showList && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowList(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className={`absolute ${language === 'ar' ? 'left-0' : 'right-0'} top-full mt-2 w-72 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden`}
            >
              <div className="p-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-[#D4AF37]" />
                  <h3 className="font-semibold text-foreground">
                    {language === 'ar' ? 'المتصلون الآن' : 'Online Now'}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {onlineUsers.length} {language === 'ar' ? 'مستخدم متصل' : 'users online'}
                </p>
              </div>

              <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                {onlineUsers.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users size={32} className="mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' 
                        ? 'لا يوجد مستخدمون متصلون'
                        : 'No users online'}
                    </p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {onlineUsers.map((onlineUser) => (
                      <motion.div
                        key={onlineUser.userId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#C49F27] flex items-center justify-center text-white font-bold">
                            {onlineUser.userName.charAt(0).toUpperCase()}
                          </div>
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card animate-pulse" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {onlineUser.userName}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Circle size={6} className="text-green-500 fill-green-500" />
                            <span className="text-xs text-muted-foreground capitalize">
                              {onlineUser.role?.replace('_', ' ') || 'User'}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(onlineUser.online_at).toLocaleTimeString(
                            language === 'ar' ? 'ar-EG' : 'en-US',
                            { hour: '2-digit', minute: '2-digit' }
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
