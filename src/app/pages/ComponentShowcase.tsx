/**
 * 🎨 Press2Pay - VIP Component Showcase
 * عرض جميع المكونات الجاهزة للاستخدام
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import CurrencyInput from 'react-currency-input-field';
import { PatternFormat } from 'react-number-format';
import Cards from 'react-credit-cards-2';
import { QRCodeSVG } from 'qrcode.react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';
import * as Tabs from '@radix-ui/react-tabs';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Switch from '@radix-ui/react-switch';
import * as Slider from '@radix-ui/react-slider';
import { Command } from 'cmdk';
import {
  CreditCard,
  Wallet,
  QrCode,
  Calendar,
  DollarSign,
  Check,
  X,
  ChevronDown,
  Info,
} from 'lucide-react';
import 'react-credit-cards-2/dist/es/styles-compiled.css';

export default function ComponentShowcase() {
  const [selectedDemo, setSelectedDemo] = useState('forms');

  const demos = [
    { id: 'forms', label: 'النماذج المالية', icon: DollarSign },
    { id: 'cards', label: 'بطاقات الائتمان', icon: CreditCard },
    { id: 'qr', label: 'رموز QR', icon: QrCode },
    { id: 'dialogs', label: 'النوافذ المنبثقة', icon: Wallet },
    { id: 'dates', label: 'التواريخ', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#D4AF37] mb-2">
            Press2Pay Component Library
          </h1>
          <p className="text-gray-400">مكتبة المكونات الفاخرة للدفع الإلكتروني</p>
        </div>

        {/* Navigation Tabs */}
        <Tabs.Root value={selectedDemo} onValueChange={setSelectedDemo}>
          <Tabs.List className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {demos.map((demo) => (
              <Tabs.Trigger
                key={demo.id}
                value={demo.id}
                className="flex items-center gap-2 px-6 py-3 rounded-lg border border-[#D4AF37]/30 bg-black/50 hover:bg-[#D4AF37]/10 data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black transition-all"
              >
                <demo.icon className="w-4 h-4" />
                {demo.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {/* Demo Panels */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDemo}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Tabs.Content value="forms">
                <FormsDemo />
              </Tabs.Content>

              <Tabs.Content value="cards">
                <CreditCardsDemo />
              </Tabs.Content>

              <Tabs.Content value="qr">
                <QRCodeDemo />
              </Tabs.Content>

              <Tabs.Content value="dialogs">
                <DialogsDemo />
              </Tabs.Content>

              <Tabs.Content value="dates">
                <DatePickerDemo />
              </Tabs.Content>
            </motion.div>
          </AnimatePresence>
        </Tabs.Root>
      </div>
    </div>
  );
}

// ============================================
// 1. Forms Demo
// ============================================

function FormsDemo() {
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');

  const schema = z.object({
    merchant_name: z.string().min(3, 'الاسم قصير جداً'),
    amount: z.number().min(10, 'الحد الأدنى 10 جنيه').max(1000000),
  });

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: any) => {
    toast.success(`تم! المبلغ: ${amount} جنيه`);
    console.log(data);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Currency Input */}
      <div className="vip-card">
        <h3 className="text-xl font-bold text-[#D4AF37] mb-4">إدخال المبلغ</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">المبلغ (EGP)</label>
            <CurrencyInput
              prefix="EGP "
              decimalsLimit={2}
              value={amount}
              onValueChange={(value) => setAmount(value || '0')}
              className="vip-input w-full"
              placeholder="0.00"
            />
          </div>
          <div className="text-2xl font-bold text-[#D4AF37]">
            {amount ? `${parseFloat(amount).toLocaleString('ar-EG')} جنيه` : '0 جنيه'}
          </div>
        </div>
      </div>

      {/* Phone Input */}
      <div className="vip-card">
        <h3 className="text-xl font-bold text-[#D4AF37] mb-4">رقم الهاتف</h3>
        <div className="space-y-4">
          <PatternFormat
            format="+20 ### ### ####"
            mask="_"
            value={phone}
            onValueChange={(values) => setPhone(values.value)}
            className="vip-input w-full"
            placeholder="+20 ___ ___ ____"
          />
          <div className="text-sm text-gray-400">
            القيمة: {phone || 'لم يتم الإدخال'}
          </div>
        </div>
      </div>

      {/* Form with Validation */}
      <div className="vip-card md:col-span-2">
        <h3 className="text-xl font-bold text-[#D4AF37] mb-4">نموذج مع التحقق</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">اسم التاجر</label>
            <input
              {...register('merchant_name')}
              className="vip-input w-full"
              placeholder="أدخل اسم التاجر"
            />
            {errors.merchant_name && (
              <span className="text-red-500 text-sm">{errors.merchant_name.message as string}</span>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">المبلغ</label>
            <CurrencyInput
              prefix="EGP "
              decimalsLimit={2}
              onValueChange={(value) => setValue('amount', parseFloat(value || '0'))}
              className="vip-input w-full"
            />
            {errors.amount && (
              <span className="text-red-500 text-sm">{errors.amount.message as string}</span>
            )}
          </div>

          <button type="submit" className="vip-button-primary w-full">
            إرسال
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================
// 2. Credit Cards Demo
// ============================================

function CreditCardsDemo() {
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
    focus: '',
  });

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="vip-card">
        <h3 className="text-xl font-bold text-[#D4AF37] mb-6">بطاقة تفاعلية</h3>
        <div className="flex justify-center mb-6">
          <Cards
            number={cardData.number}
            expiry={cardData.expiry}
            cvc={cardData.cvc}
            name={cardData.name}
            focused={cardData.focus as any}
          />
        </div>
      </div>

      <div className="vip-card">
        <h3 className="text-xl font-bold text-[#D4AF37] mb-6">إدخال بيانات البطاقة</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">رقم البطاقة</label>
            <PatternFormat
              format="#### #### #### ####"
              mask="_"
              value={cardData.number}
              onValueChange={(values) => setCardData({ ...cardData, number: values.value })}
              onFocus={() => setCardData({ ...cardData, focus: 'number' })}
              className="vip-input w-full"
              placeholder="1234 5678 9012 3456"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">اسم حامل البطاقة</label>
            <input
              value={cardData.name}
              onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
              onFocus={() => setCardData({ ...cardData, focus: 'name' })}
              className="vip-input w-full"
              placeholder="AHMED MOHAMED"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">انتهاء الصلاحية</label>
              <PatternFormat
                format="##/##"
                mask="_"
                value={cardData.expiry}
                onValueChange={(values) => setCardData({ ...cardData, expiry: values.value })}
                onFocus={() => setCardData({ ...cardData, focus: 'expiry' })}
                className="vip-input w-full"
                placeholder="MM/YY"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">CVV</label>
              <PatternFormat
                format="###"
                mask="_"
                value={cardData.cvc}
                onValueChange={(values) => setCardData({ ...cardData, cvc: values.value })}
                onFocus={() => setCardData({ ...cardData, focus: 'cvc' })}
                className="vip-input w-full"
                placeholder="123"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 3. QR Code Demo
// ============================================

function QRCodeDemo() {
  const [qrValue, setQrValue] = useState('https://press2pay.com/pay/demo-123');

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="vip-card">
        <h3 className="text-xl font-bold text-[#D4AF37] mb-6">رمز QR</h3>
        <div className="flex flex-col items-center gap-6">
          <div className="bg-white p-4 rounded-xl">
            <QRCodeSVG
              value={qrValue}
              size={200}
              bgColor="#FFFFFF"
              fgColor="#000000"
              level="H"
              includeMargin
            />
          </div>
          <button
            onClick={() => toast.success('تم مسح الرمز!')}
            className="vip-button-secondary"
          >
            مسح الرمز
          </button>
        </div>
      </div>

      <div className="vip-card">
        <h3 className="text-xl font-bold text-[#D4AF37] mb-6">إعدادات الرمز</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">رابط الدفع</label>
            <input
              value={qrValue}
              onChange={(e) => setQrValue(e.target.value)}
              className="vip-input w-full"
            />
          </div>
          <div className="text-sm text-gray-400">
            يمكن للعميل مسح الرمز للوصول إلى صفحة الدفع مباشرة
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 4. Dialogs Demo
// ============================================

function DialogsDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="vip-card">
        <h3 className="text-xl font-bold text-[#D4AF37] mb-6">النوافذ المنبثقة</h3>
        <div className="flex gap-4">
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
              <button className="vip-button-primary">
                فتح نافذة التأكيد
              </button>
            </Dialog.Trigger>

            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
              <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 vip-card max-w-md w-full">
                <Dialog.Title className="text-2xl font-bold text-[#D4AF37] mb-4">
                  تأكيد العملية
                </Dialog.Title>
                <Dialog.Description className="text-gray-400 mb-6">
                  هل أنت متأكد من الموافقة على معاملة بقيمة 1,500.00 جنيه؟
                </Dialog.Description>

                <div className="flex gap-3">
                  <Dialog.Close asChild>
                    <button className="vip-button-secondary flex-1">
                      إلغاء
                    </button>
                  </Dialog.Close>
                  <button
                    onClick={() => {
                      toast.success('تمت الموافقة!');
                      setOpen(false);
                    }}
                    className="vip-button-primary flex-1"
                  >
                    موافق
                  </button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>

          <button
            onClick={() => toast.info('إشعار معلوماتي')}
            className="vip-button-secondary"
          >
            إشعار بسيط
          </button>

          <button
            onClick={() => toast.promise(
              new Promise((resolve) => setTimeout(resolve, 2000)),
              {
                loading: 'جاري المعالجة...',
                success: 'تم بنجاح!',
                error: 'حدث خطأ',
              }
            )}
            className="vip-button-secondary"
          >
            إشعار متقدم
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 5. Date Picker Demo
// ============================================

function DatePickerDemo() {
  const [selected, setSelected] = useState<Date>();

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="vip-card">
        <h3 className="text-xl font-bold text-[#D4AF37] mb-6">اختيار التاريخ</h3>
        <DayPicker
          mode="single"
          selected={selected}
          onSelect={setSelected}
          locale={ar}
          dir="rtl"
          className="vip-calendar"
        />
      </div>

      <div className="vip-card">
        <h3 className="text-xl font-bold text-[#D4AF37] mb-6">التاريخ المحدد</h3>
        <div className="space-y-4">
          {selected ? (
            <>
              <div className="text-3xl font-bold text-[#D4AF37]">
                {format(selected, 'PPP', { locale: ar })}
              </div>
              <div className="text-sm text-gray-400">
                {format(selected, 'EEEE', { locale: ar })}
              </div>
            </>
          ) : (
            <div className="text-gray-400">لم يتم اختيار تاريخ</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// VIP Styles (add to theme.css)
// ============================================

/*
.vip-card {
  @apply bg-gradient-to-br from-gray-900 to-black border border-[#D4AF37]/30 rounded-xl p-6 shadow-xl;
}

.vip-input {
  @apply w-full bg-black/50 border border-[#D4AF37]/30 rounded-lg px-4 py-3 text-white 
         focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all;
}

.vip-button-primary {
  @apply px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#F4E5C3] text-black font-bold 
         rounded-lg hover:scale-105 transition-transform shadow-lg shadow-[#D4AF37]/50;
}

.vip-button-secondary {
  @apply px-6 py-3 bg-black border border-[#D4AF37]/30 text-[#D4AF37] font-bold 
         rounded-lg hover:bg-[#D4AF37]/10 transition-all;
}

.vip-calendar {
  @apply text-white;
}

.vip-calendar .rdp-day_selected {
  @apply bg-[#D4AF37] text-black;
}
*/
