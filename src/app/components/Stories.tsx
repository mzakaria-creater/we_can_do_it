import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, ChevronRight, ChevronLeft, Volume2, VolumeX, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../../lib/store';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Story {
  id: string;
  userId: string;
  userName: string;
  userImage: string | null;
  title: string;
  content: string;
  type: 'info' | 'alert' | 'success' | 'warning';
  imageUrl: string | null;
  createdAt: string;
  expiresAt: string;
}

export const Stories = () => {
  const { language, auth } = useStore();
  const isRTL = language === 'ar';
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newStoryContent, setNewStoryContent] = useState('');
  const [newStoryTitle, setNewStoryTitle] = useState('');

  const fetchStories = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b/stories`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'apikey': publicAnonKey,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        console.error('[Stories] API error:', response.status, response.statusText);
        return;
      }
      
      const data = await response.json();
      if (data.stories) {
        setStories(data.stories);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleCreateStory = async () => {
    if (!newStoryContent.trim()) {
      toast.error(isRTL ? 'يرجى إدخال محتوى القصة' : 'Please enter story content');
      return;
    }

    try {
      const { data: { session } } = await (await import('../../lib/supabase')).supabase.auth.getSession();
      const token = session?.access_token || publicAnonKey;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b/stories`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: newStoryTitle || (isRTL ? 'تحديث جديد' : 'New Update'),
            content: newStoryContent,
            type: 'info'
          })
        }
      );

      if (response.ok) {
        toast.success(isRTL ? 'تم نشر القصة الملكية بنجاح' : 'Royal Story published successfully');
        setIsCreating(false);
        setNewStoryContent('');
        setNewStoryTitle('');
        fetchStories();
      }
    } catch (error) {
      toast.error(isRTL ? 'فشل في نشر القصة' : 'Failed to publish story');
    }
  };

  if (loading && stories.length === 0) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="min-w-[80px] space-y-2">
            <div className="w-16 h-16 rounded-full bg-muted animate-pulse border-2 border-border" />
            <div className="h-2 w-12 bg-muted animate-pulse rounded mx-auto" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="flex gap-5 overflow-x-auto pb-6 pt-2 no-scrollbar px-1">
        {/* Create Story Button */}
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex flex-col items-center gap-2 cursor-pointer min-w-[70px]"
          onClick={() => setIsCreating(true)}
        >
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#AA8B2E] p-[2px]">
            <div className="w-full h-full rounded-full bg-[#0B0F14] flex items-center justify-center">
              <Plus className="text-[#D4AF37]" size={24} />
            </div>
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#D4AF37] rounded-full border-2 border-[#0B0F14] flex items-center justify-center">
              <Plus className="text-black" size={12} strokeWidth={4} />
            </div>
          </div>
          <span className="text-[11px] font-bold text-muted-foreground truncate w-full text-center">
            {isRTL ? 'قصتك' : 'Your Story'}
          </span>
        </motion.div>

        {/* Stories List */}
        {stories.map((story) => (
          <motion.div 
            key={story.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-2 cursor-pointer min-w-[70px]"
            onClick={() => setActiveStory(story)}
          >
            <div className={`relative w-16 h-16 rounded-full p-[2px] ${
              story.type === 'alert' ? 'bg-red-500' : 
              story.type === 'success' ? 'bg-emerald-500' : 'bg-gradient-to-tr from-[#D4AF37] via-yellow-200 to-[#AA8B2E]'
            }`}>
              <div className="w-full h-full rounded-full bg-[#0B0F14] p-1">
                {story.userImage ? (
                  <img src={story.userImage} className="w-full h-full rounded-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full rounded-full bg-muted flex items-center justify-center text-[#D4AF37] font-black text-xs">
                    {story.userName.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <span className="text-[11px] font-bold text-foreground truncate w-full text-center max-w-[70px]">
              {story.userName}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Story Viewer Modal */}
      <AnimatePresence>
        {activeStory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <div className="relative w-full max-w-md aspect-[9/16] bg-[#0B0F14] rounded-3xl overflow-hidden border border-[#D4AF37]/30 shadow-2xl">
              {/* Progress Bar */}
              <div className="absolute top-4 left-4 right-4 z-20 flex gap-1">
                <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 5, ease: 'linear' }}
                    onAnimationComplete={() => setActiveStory(null)}
                    className="h-full bg-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Header */}
              <div className="absolute top-8 left-4 right-4 z-20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-[#D4AF37] p-0.5">
                    {activeStory.userImage ? (
                      <img src={activeStory.userImage} className="w-full h-full rounded-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-muted flex items-center justify-center text-[#D4AF37] font-bold text-[10px]">
                        {activeStory.userName.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-white font-black text-sm">{activeStory.userName}</h4>
                    <p className="text-white/60 text-[10px]">{new Date(activeStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <button onClick={() => setActiveStory(null)} className="p-2 text-white/80 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-transparent via-[#0B0F14]/50 to-[#0B0F14]">
                {activeStory.imageUrl && (
                  <img src={activeStory.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="" />
                )}
                <div className="relative z-10 space-y-6">
                  <motion.h3 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-2xl font-black text-[#D4AF37] tracking-tight uppercase"
                  >
                    {activeStory.title}
                  </motion.h3>
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-white font-medium leading-relaxed"
                  >
                    {activeStory.content}
                  </motion.p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="absolute bottom-8 left-0 right-0 z-20 px-8 flex justify-center">
                <button className="w-full py-4 bg-[#D4AF37] text-black font-black rounded-xl shadow-lg hover:bg-white transition-colors">
                  {isRTL ? 'تواصل مع التاجر' : 'Contact Merchant'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Story Modal */}
      <AnimatePresence>
        {isCreating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md bg-[#161B22] border border-[#D4AF37]/30 rounded-3xl p-6 space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-[#D4AF37]">
                  {isRTL ? 'نشر قصة ملكية' : 'Publish Royal Story'}
                </h3>
                <button onClick={() => setIsCreating(false)} className="p-2 text-muted-foreground hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
                    {isRTL ? 'العنوان' : 'Title'}
                  </label>
                  <input 
                    type="text"
                    value={newStoryTitle}
                    onChange={(e) => setNewStoryTitle(e.target.value)}
                    placeholder={isRTL ? 'مثال: تحديث النظام' : 'e.g., System Update'}
                    className="w-full bg-[#0B0F14] border border-border rounded-xl px-4 py-3 focus:border-[#D4AF37] outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
                    {isRTL ? 'المحتوى' : 'Content'}
                  </label>
                  <textarea 
                    value={newStoryContent}
                    onChange={(e) => setNewStoryContent(e.target.value)}
                    rows={4}
                    placeholder={isRTL ? 'ماذا تريد أن تشارك مع التجار؟' : 'What do you want to share with merchants?'}
                    className="w-full bg-[#0B0F14] border border-border rounded-xl px-4 py-3 focus:border-[#D4AF37] outline-none transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-4 border border-border rounded-xl font-bold hover:bg-muted transition-colors"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button 
                  onClick={handleCreateStory}
                  className="flex-1 py-4 bg-[#D4AF37] text-black rounded-xl font-black shadow-lg hover:bg-[#AA8B2E] transition-colors"
                >
                  {isRTL ? 'نشر الآن' : 'Publish Now'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};