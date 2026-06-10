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

interface BulkTransactionUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BulkTransactionUpload = ({ isOpen, onClose, onSuccess }: BulkTransactionUploadProps) => {
  const { language, user } = useStore();
  const isRTL = language === 'ar';
  
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
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
      formData.append('merchant_id', user?.id || 'admin');

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b/upload-transactions`, {
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
      toast.success(isRTL ? `تم رفع الملف بنجاح. جاري معالجة ${result.rowCount} عملية.` : `File uploaded successfully. Processing ${result.rowCount} transactions.`);
      
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
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-blue-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {isRTL ? 'رفع معاملات بالجملة' : 'Bulk Transaction Upload'}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {isRTL ? 'رفع ملف CSV يحتوي على عدة عمليات دفع' : 'Upload a CSV file containing multiple transactions'}
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
          {/* Dropzone */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group ${
              file 
                ? 'border-blue-500/50 bg-blue-500/5' 
                : 'border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5'
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
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FileCheck className="w-8 h-8 text-blue-400" />
                </div>
                <div className="font-bold text-white text-sm truncate max-w-[200px] mx-auto">
                  {file.name}
                </div>
                <div className="text-[10px] text-gray-400 uppercase tracking-widest">
                  {(file.size / 1024).toFixed(1)} KB • READY
                </div>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <FileText className="w-8 h-8 text-gray-400 group-hover:text-blue-400 transition-colors" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-white mb-1">
                    {isRTL ? 'انقر أو اسحب ملف CSV هنا' : 'Click or drag CSV file here'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isRTL ? 'يجب أن يحتوي الملف على أعمدة: الرقم، المبلغ، الهاتف' : 'File must contain: reference, amount, phone'}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Template Info */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  {isRTL ? 'تنبيه الأمان' : 'Security Alert'}
                </p>
                <p className="text-[11px] text-amber-300/70 leading-relaxed">
                  {isRTL 
                    ? 'سيتم معالجة العمليات فوراً. يرجى التأكد من صحة البيانات قبل الرفع لتجنب الأخطاء في أرصدة المحافظ.'
                    : 'Transactions will be processed immediately. Please verify data before uploading to prevent wallet balance errors.'
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
            className="flex-[2] py-3 px-4 rounded-xl bg-blue-600 text-white font-black text-sm shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{isRTL ? 'جاري الرفع...' : 'Uploading...'}</span>
              </>
            ) : (
              <>
                <span>{isRTL ? 'رفع ومعالجة' : 'Upload & Process'}</span>
                <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
