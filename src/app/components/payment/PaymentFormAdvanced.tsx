/**
 * 💳 Press2Pay - نموذج الدفع المتقدم
 * يستخدم جميع المكتبات الحديثة للـ Payment Gateway
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Cards from 'react-credit-cards-2';
import 'react-credit-cards-2/dist/es/styles-compiled.css';
import CurrencyInput from 'react-currency-input-field';
import { PatternFormat } from 'react-number-format';
import { motion } from 'motion/react';
import { CreditCard, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

// ✅ Zod Schema للتحقق من البيانات
const paymentSchema = z.object({
  cardNumber: z.string()
    .min(16, 'رقم البطاقة يجب أن يكون 16 رقم')
    .max(19, 'رقم البطاقة غير صحيح'),
  cardName: z.string().min(3, 'أدخل الاسم كما هو على البطاقة'),
  expiry: z.string()
    .regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, 'صيغة غير صحيحة (MM/YY)'),
  cvc: z.string()
    .min(3, 'CVV يجب أن يكون 3 أرقام')
    .max(4, 'CVV يجب أن يكون 3-4 أرقام'),
  amount: z.number()
    .positive('المبلغ يجب أن يكون أكبر من صفر')
    .min(1, 'الحد الأدنى 1 جنيه'),
  email: z.string().email('بريد إلكتروني غير صحيح'),
  phone: z.string()
    .regex(/^\+20[0-9]{10}$/, 'رقم هاتف مصري غير صحيح')
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export default function PaymentFormAdvanced() {
  const [focus, setFocus] = useState<'number' | 'expiry' | 'cvc' | 'name' | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      cardNumber: '',
      cardName: '',
      expiry: '',
      cvc: '',
      email: '',
      phone: ''
    }
  });

  // مراقبة القيم للعرض على البطاقة
  const cardNumber = watch('cardNumber');
  const cardName = watch('cardName');
  const expiry = watch('expiry');
  const cvc = watch('cvc');
  const amount = watch('amount');

  const onSubmit = async (data: PaymentFormData) => {
    setIsProcessing(true);

    try {
      // محاكاة API Call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // إظهار إشعار نجاح
      toast.success('تم الدفع بنجاح! 🎉', {
        description: `المبلغ: ${data.amount.toLocaleString('ar-EG')} جنيه`,
        duration: 5000,
      });

      setPaymentSuccess(true);
    } catch (error) {
      toast.error('فشلت عملية الدفع', {
        description: 'يرجى المحاولة مرة أخرى',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center justify-center gap-6 p-12 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <CheckCircle2 className="w-24 h-24 text-green-500" />
        </motion.div>
        <h2 className="text-3xl font-bold text-gold-500">تم الدفع بنجاح!</h2>
        <p className="text-gray-400">
          تم خصم {amount.toLocaleString('ar-EG')} جنيه من بطاقتك
        </p>
        <Button
          onClick={() => setPaymentSuccess(false)}
          className="bg-gold-600 hover:bg-gold-700"
        >
          دفع جديد
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8 p-6">
      {/* عرض البطاقة التفاعلي */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="flex flex-col gap-6"
      >
        <Card className="bg-gradient-to-br from-gray-900 to-black border-gold-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gold-500">
              <CreditCard className="w-5 h-5" />
              معاينة البطاقة
            </CardTitle>
            <CardDescription>شاهد بطاقتك أثناء الإدخال</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            {/* ✅ استخدام React Credit Cards 2 */}
            <Cards
              number={cardNumber || ''}
              expiry={expiry || ''}
              cvc={cvc || ''}
              name={cardName || ''}
              focused={focus}
              locale={{ valid: 'صالحة حتى' }}
              placeholders={{ name: 'اسمك هنا' }}
            />
          </CardContent>
        </Card>

        {/* معلومات الأمان */}
        <Card className="bg-gray-900/50 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-green-500 mt-1" />
              <div>
                <h4 className="font-semibold text-green-500 mb-1">
                  معاملة آمنة 100%
                </h4>
                <p className="text-sm text-gray-400">
                  جميع البيانات محمية بتشفير SSL 256-bit. نحن لا نحتفظ ببيانات بطاقتك.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* نموذج الدفع */}
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        <Card className="bg-gradient-to-br from-gray-900 to-black border-gold-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-gold-500">
              أدخل بيانات الدفع
            </CardTitle>
            <CardDescription>املأ جميع الحقول لإتمام العملية</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* المبلغ */}
              <div>
                <Label htmlFor="amount" className="text-gold-400">
                  المبلغ المطلوب *
                </Label>
                {/* ✅ استخدام React Currency Input */}
                <CurrencyInput
                  id="amount"
                  placeholder="0.00"
                  prefix="EGP "
                  decimalsLimit={2}
                  className="w-full px-4 py-3 bg-black/50 border border-gold-500/30 rounded-lg 
                           text-2xl font-bold text-gold-500 focus:border-gold-500 
                           focus:ring-2 focus:ring-gold-500/20 transition-all"
                  onValueChange={(value) => {
                    setValue('amount', parseFloat(value || '0'));
                  }}
                />
                {errors.amount && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.amount.message}
                  </p>
                )}
              </div>

              {/* رقم البطاقة */}
              <div>
                <Label htmlFor="cardNumber" className="text-gold-400">
                  رقم البطاقة *
                </Label>
                {/* ✅ استخدام React Number Format */}
                <PatternFormat
                  id="cardNumber"
                  format="#### #### #### ####"
                  mask="_"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 bg-black/50 border border-gold-500/30 rounded-lg 
                           focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
                  onFocus={() => setFocus('number')}
                  onBlur={() => setFocus(undefined)}
                  onValueChange={(values) => {
                    setValue('cardNumber', values.value);
                  }}
                />
                {errors.cardNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.cardNumber.message}</p>
                )}
              </div>

              {/* اسم حامل البطاقة */}
              <div>
                <Label htmlFor="cardName" className="text-gold-400">
                  اسم حامل البطاقة *
                </Label>
                <Input
                  id="cardName"
                  placeholder="أحمد محمد"
                  {...register('cardName')}
                  onFocus={() => setFocus('name')}
                  onBlur={() => setFocus(undefined)}
                  className="bg-black/50 border-gold-500/30 focus:border-gold-500"
                />
                {errors.cardName && (
                  <p className="text-red-500 text-sm mt-1">{errors.cardName.message}</p>
                )}
              </div>

              {/* تاريخ الانتهاء و CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry" className="text-gold-400">
                    تاريخ الانتهاء *
                  </Label>
                  <PatternFormat
                    id="expiry"
                    format="##/##"
                    placeholder="MM/YY"
                    mask="_"
                    className="w-full px-4 py-3 bg-black/50 border border-gold-500/30 rounded-lg 
                             focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
                    onFocus={() => setFocus('expiry')}
                    onBlur={() => setFocus(undefined)}
                    onValueChange={(values) => {
                      setValue('expiry', values.value);
                    }}
                  />
                  {errors.expiry && (
                    <p className="text-red-500 text-sm mt-1">{errors.expiry.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="cvc" className="text-gold-400">
                    CVV *
                  </Label>
                  <PatternFormat
                    id="cvc"
                    format="###"
                    mask="_"
                    placeholder="123"
                    className="w-full px-4 py-3 bg-black/50 border border-gold-500/30 rounded-lg 
                             focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
                    onFocus={() => setFocus('cvc')}
                    onBlur={() => setFocus(undefined)}
                    onValueChange={(values) => {
                      setValue('cvc', values.value);
                    }}
                  />
                  {errors.cvc && (
                    <p className="text-red-500 text-sm mt-1">{errors.cvc.message}</p>
                  )}
                </div>
              </div>

              {/* البريد الإلكتروني */}
              <div>
                <Label htmlFor="email" className="text-gold-400">
                  البريد الإلكتروني *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  {...register('email')}
                  className="bg-black/50 border-gold-500/30 focus:border-gold-500"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* رقم الهاتف */}
              <div>
                <Label htmlFor="phone" className="text-gold-400">
                  رقم الهاتف *
                </Label>
                <PatternFormat
                  id="phone"
                  format="+20 ### ### ####"
                  mask="_"
                  placeholder="+20 100 123 4567"
                  className="w-full px-4 py-3 bg-black/50 border border-gold-500/30 rounded-lg 
                           focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
                  onValueChange={(values) => {
                    setValue('phone', values.formattedValue);
                  }}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>

              {/* زر الدفع */}
              <Button
                type="submit"
                disabled={isProcessing}
                className="w-full py-6 text-lg font-bold bg-gradient-to-r from-gold-600 to-gold-500 
                         hover:from-gold-700 hover:to-gold-600 transition-all"
              >
                {isProcessing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    ادفع {amount.toLocaleString('ar-EG')} جنيه بأمان
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
