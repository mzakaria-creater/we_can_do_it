import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  FileCheck,
  Building2,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { supabase, publicAnonKey } from '../../lib/supabase';
import { projectId } from '../../../utils/supabase/info';
import { toast } from 'sonner';

interface SettlementFileUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SettlementFileUpload = ({ isOpen, onClose, onSuccess }: SettlementFileUploadProps) => {
  const { language } = useStore();
  const isRTL = language === 'ar';
  
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [provider, setProvider] = useState('vodafone');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast.error(isRTL ? 'يرجى اختيار ملف CSV فقط' : 'Please select a CSV file only');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authHeader = session ? `Bearer ${session.access_token}` : '';

      const formData = new FormData();
      formData.append('file', file);
      formData.append('provider', provider);

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b/upload-settlement`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader || `Bearer ${publicAnonKey}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      toast.success(isRTL ? 'تم رفع ملف التسوية بنجاح' : 'Settlement file uploaded successfully');
      
      if (onSuccess) onSuccess();
      onClose();
      setFile(null);
    } catch (err: any) {
      console.error('[Upload] Error:', err);
      toast.error(isRTL ? `فشل الرفع: ${err.message}` : `Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[#14181D] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#D4AF37]/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#D4AF37]/20 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {isRTL ? 'استيراد ملف تسوية' : 'Import Settlement File'}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {isRTL ? 'دعم ملفات Vodafone و Fawry و Aman' : 'Supports Vodafone, Fawry, and Aman files'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Provider Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-300">
              {isRTL ? 'مزود الخدمة (PSP)' : 'Payment Provider (PSP)'}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'vodafone', name: 'Vodafone', color: 'bg-red-500' },
                { id: 'fawry', name: 'Fawry', color: 'bg-yellow-500' },
                { id: 'aman', name: 'Aman', color: 'bg-blue-500' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProvider(p.id)}
                  className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                    provider === p.id 
                      ? 'bg-white/5 border-[#D4AF37] ring-1 ring-[#D4AF37]/50' 
                      : 'bg-transparent border-white/5 hover:border-white/10 hover:bg-white/5'
                  }`}
                >
                  <div className={`w-8 h-8 ${p.color} rounded-full flex items-center justify-center text-white text-[10px] font-bold`}>
                    {p.name[0]}
                  </div>
                  <span className="text-xs font-bold text-gray-300">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dropzone */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group ${
              file 
                ? 'border-green-500/50 bg-green-500/5' 
                : 'border-white/10 hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/5'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv"
              className="hidden" 
            />
            
            {file ? (
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FileCheck className="w-8 h-8 text-green-400" />
                </div>
                <div className="font-bold text-white text-sm truncate max-w-[200px] mx-auto">
                  {file.name}
                </div>
                <div className="text-[10px] text-gray-400 uppercase tracking-widest">
                  {(file.size / 1024).toFixed(1)} KB • READY TO SYNC
                </div>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-[#D4AF37]/20 transition-colors">
                  <FileText className="w-8 h-8 text-gray-400 group-hover:text-[#D4AF37] transition-colors" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-white mb-1">
                    {isRTL ? 'انقر أو اسحب ملف CSV هنا' : 'Click or drag CSV file here'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isRTL ? 'الحد الأقصى للملف: 50 ميجابايت' : 'Maximum file size: 50MB'}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Guidelines */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 shrink-0" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  {isRTL ? 'إرشادات الاستيراد' : 'Import Guidelines'}
                </p>
                <p className="text-[11px] text-blue-300/70 leading-relaxed">
                  {isRTL 
                    ? 'تأكد من أن الملف يحتوي على أعمدة (رقم المرجع، المبلغ، التاريخ، الحالة). سيقوم النظام تلقائياً بمطابقة العمليات وتحديث أرصدة التجار.'
                    : 'Ensure file contains columns (Reference, Amount, Date, Status). System will auto-match transactions and update merchant balances.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-black/20 border-t border-white/10 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-gray-400 font-bold text-sm hover:bg-white/5 transition-all"
          >
            {isRTL ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex-[2] py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C49F27] text-[#0B0F14] font-black text-sm shadow-lg shadow-[#D4AF37]/20 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{isRTL ? 'جاري الرفع...' : 'Uploading...'}</span>
              </>
            ) : (
              <>
                <span>{isRTL ? 'بدء الاستيراد' : 'Start Import'}</span>
                <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
