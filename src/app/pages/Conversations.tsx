/**
 * 💬 Press2Pay - Conversations Component
 * Full-featured chat with file attachments
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  X, 
  Download,
  Trash2,
  File,
  Smile,
  MoreVertical,
  Check,
  CheckCheck,
  Loader2,
  AlertCircle,
  Users,
  Search,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { 
  uploadAttachment, 
  getAttachmentUrl, 
  deleteAttachment,
  downloadAttachment,
  validateFile,
  formatFileSize,
  getFileIcon,
  isImage
} from '../../lib/storage-manager';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';

// ✅ Types
interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  type: 'text' | 'file' | 'image' | 'system';
  metadata: any;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  sender?: User;
  attachments?: Attachment[];
}

interface Attachment {
  id: string;
  message_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  url?: string;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
}

interface Conversation {
  id: string;
  title: string;
  type: 'direct' | 'group' | 'support' | 'internal';
  metadata: any;
  is_archived: boolean;
  created_at: string;
}

export default function ConversationsPage() {
  const { t } = useTranslation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ Fetch current user
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('app_users')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();
      
      if (data) setCurrentUser(data);
    }
  };

  // ✅ Fetch conversations
  useEffect(() => {
    if (currentUser) {
      fetchConversations();
      subscribeToConversations();
    }
  }, [currentUser]);

  const fetchConversations = async () => {
    if (!currentUser) return;

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        conversation_members!inner(user_id)
      `)
      .eq('conversation_members.user_id', currentUser.id)
      .eq('is_archived', false)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      toast.error('فشل تحميل المحادثات');
      return;
    }

    setConversations(data || []);
    
    // Auto-select first conversation
    if (data && data.length > 0 && !selectedConversation) {
      setSelectedConversation(data[0]);
    }
  };

  // ✅ Subscribe to real-time conversation updates
  const subscribeToConversations = () => {
    const channel = supabase
      .channel('conversations-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  // ✅ Fetch messages for selected conversation
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [selectedConversation]);

  const fetchMessages = async () => {
    if (!selectedConversation) return;

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:app_users!sender_id(id, full_name, email, avatar_url),
        attachments:message_attachments(*)
      `)
      .eq('conversation_id', selectedConversation.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    // Get signed URLs for attachments
    const messagesWithUrls = await Promise.all(
      (data || []).map(async (msg) => {
        if (msg.attachments && msg.attachments.length > 0) {
          const attachmentsWithUrls = await Promise.all(
            msg.attachments.map(async (att: Attachment) => {
              const url = await getAttachmentUrl(att.file_path);
              return { ...att, url };
            })
          );
          return { ...msg, attachments: attachmentsWithUrls };
        }
        return msg;
      })
    );

    setMessages(messagesWithUrls);
    scrollToBottom();
  };

  // ✅ Subscribe to real-time messages
  const subscribeToMessages = () => {
    if (!selectedConversation) return;

    const channel = supabase
      .channel(`messages-${selectedConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation.id}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  // ✅ Scroll to bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // ✅ Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate each file
    const validFiles = files.filter((file) => {
      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error(`${file.name}: ${validation.error}`);
        return false;
      }
      return true;
    });

    setAttachments((prev) => [...prev, ...validFiles]);
  };

  // ✅ Remove attachment from queue
  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ Send message
  const sendMessage = async () => {
    if (!selectedConversation || !currentUser) return;
    if (!messageText.trim() && attachments.length === 0) return;

    setUploading(true);

    try {
      // Upload attachments first
      const uploadedAttachments = [];
      
      for (const file of attachments) {
        const result = await uploadAttachment(
          file,
          selectedConversation.id,
          currentUser.id
        );

        if (result.success && result.data) {
          uploadedAttachments.push({
            conversation_id: selectedConversation.id,
            ...result.data,
            uploaded_by: currentUser.id,
          });
        }
      }

      // Create message
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: currentUser.id,
          content: messageText.trim(),
          type: uploadedAttachments.length > 0 ? 'file' : 'text',
          metadata: {},
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Link attachments to message
      if (uploadedAttachments.length > 0 && messageData) {
        const attachmentRecords = uploadedAttachments.map((att) => ({
          ...att,
          message_id: messageData.id,
        }));

        const { error: attachError } = await supabase
          .from('message_attachments')
          .insert(attachmentRecords);

        if (attachError) console.error('Attachment link error:', attachError);
      }

      // Clear inputs
      setMessageText('');
      setAttachments([]);
      
      toast.success('تم إرسال الرسالة');
      fetchMessages();
    } catch (error: any) {
      console.error('Send message error:', error);
      toast.error('فشل إرسال الرسالة');
    } finally {
      setUploading(false);
    }
  };

  // ✅ Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-gray-900 to-black">
      {/* Sidebar - Conversations List */}
      <div className="w-80 border-r border-gold-500/20 bg-black/50 flex flex-col">
        <div className="p-4 border-b border-gold-500/20">
          <h2 className="text-xl font-bold text-gold-500 mb-3">
            {t('conversations')}
          </h2>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="بحث في المحادثات..."
              className="pr-10 bg-black/50 border-gold-500/30"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <motion.div
              key={conv.id}
              whileHover={{ x: -4 }}
              onClick={() => setSelectedConversation(conv)}
              className={`p-4 border-b border-gold-500/10 cursor-pointer transition-colors ${
                selectedConversation?.id === conv.id
                  ? 'bg-gold-500/10 border-r-2 border-gold-500'
                  : 'hover:bg-gold-500/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-gold-500 text-black">
                    {conv.title.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm truncate">
                      {conv.title}
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {conv.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 truncate">
                    آخر نشاط: {new Date(conv.updated_at).toLocaleDateString('ar')}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="p-4 border-t border-gold-500/20">
          <Button className="w-full bg-gold-600 hover:bg-gold-700">
            <Plus className="w-4 h-4 ml-2" />
            محادثة جديدة
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-gold-500/20 bg-black/50 flex items-center justify-between px-6">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-gold-500 text-black">
                    {selectedConversation.title.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-bold text-gold-500">
                    {selectedConversation.title}
                  </h2>
                  <p className="text-xs text-gray-400">
                    <Users className="w-3 h-3 inline ml-1" />
                    {messages.length} رسالة
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <AnimatePresence>
                {messages.map((message) => {
                  const isOwn = message.sender_id === currentUser?.id;
                  
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                    >
                      <Avatar className="mt-1">
                        {message.sender?.avatar_url ? (
                          <AvatarImage src={message.sender.avatar_url} />
                        ) : (
                          <AvatarFallback className="bg-gray-700">
                            {message.sender?.full_name?.charAt(0) || '?'}
                          </AvatarFallback>
                        )}
                      </Avatar>

                      <div className={`max-w-[60%] ${isOwn ? 'items-end' : ''}`}>
                        {!isOwn && (
                          <p className="text-xs text-gray-400 mb-1">
                            {message.sender?.full_name}
                          </p>
                        )}

                        <Card
                          className={`${
                            isOwn
                              ? 'bg-gold-600 border-gold-500'
                              : 'bg-gray-800 border-gray-700'
                          }`}
                        >
                          <CardContent className="p-3">
                            {message.content && (
                              <p className="text-sm whitespace-pre-wrap">
                                {message.content}
                              </p>
                            )}

                            {/* Attachments */}
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {message.attachments.map((att) => (
                                  <div
                                    key={att.id}
                                    className="flex items-center gap-2 p-2 bg-black/20 rounded"
                                  >
                                    <span className="text-2xl">
                                      {getFileIcon(att.mime_type)}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium truncate">
                                        {att.file_name}
                                      </p>
                                      <p className="text-xs text-gray-400">
                                        {formatFileSize(att.file_size)}
                                      </p>
                                    </div>
                                    {att.url && (
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8"
                                        onClick={() =>
                                          downloadAttachment(att.file_path, att.file_name)
                                        }
                                      >
                                        <Download className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-500">
                            {new Date(message.created_at).toLocaleTimeString('ar', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          {isOwn && (
                            <CheckCheck className="w-3 h-3 text-green-500" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gold-500/20 bg-black/50 p-4">
              {/* Attachments Preview */}
              {attachments.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center gap-2 bg-gray-800 rounded-lg p-2 border border-gold-500/30"
                    >
                      <span className="text-xl">{getFileIcon(file.type)}</span>
                      <div className="text-xs">
                        <p className="font-medium truncate max-w-[150px]">
                          {file.name}
                        </p>
                        <p className="text-gray-400">{formatFileSize(file.size)}</p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="flex items-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Paperclip className="w-5 h-5" />
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />

                <Textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="اكتب رسالتك..."
                  className="flex-1 min-h-[44px] max-h-[120px] bg-black/50 border-gold-500/30"
                  disabled={uploading}
                />

                <Button
                  onClick={sendMessage}
                  disabled={uploading || (!messageText.trim() && attachments.length === 0)}
                  className="bg-gold-600 hover:bg-gold-700"
                >
                  {uploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">اختر محادثة للبدء</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
