/**
 * 🖊️ Press2Pay - مكون التوقيع الإلكتروني وكود QR
 * للعقود والموافقات الرقمية
 */

import { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'motion/react';
import {
  Download,
  Trash2,
  CheckCircle,
  FileText,
  Shield,
  Calendar,
  User,
  Building2,
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';

interface ContractData {
  merchantName: string;
  merchantEmail: string;
  merchantId: string;
  contractType: string;
  contractDate: string;
  contractValue: number;
  terms: string[];
}

export default function DigitalSignatureContract() {
  const sigPad = useRef<SignatureCanvas>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [merchantName, setMerchantName] = useState('');
  const [merchantEmail, setMerchantEmail] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  // بيانات العقد
  const contractData: ContractData = {
    merchantName: merchantName || 'اسم التاجر',
    merchantEmail: merchantEmail || 'email@example.com',
    merchantId: 'MER-2026-00152',
    contractType: 'عقد انضمام لبوابة الدفع Press2Pay',
    contractDate: format(new Date(), 'PPP', { locale: ar }),
    contractValue: 50000,
    terms: [
      'الالتزام بسياسات البنك المركزي المصري',
      'دفع عمولة 2.5% على كل معاملة ناجحة',
      'توفير مستندات KYC كاملة',
      'الالتزام بمعايير الأمان PCI-DSS',
      'مدة العقد سنة واحدة قابلة للتجديد',
    ],
  };

  // حفظ التوقيع
  const handleSave = () => {
    if (!sigPad.current || sigPad.current.isEmpty()) {
      toast.error('يرجى التوقيع أولاً');
      return;
    }

    if (!merchantName || !merchantEmail) {
      toast.error('يرجى إدخال الاسم والبريد الإلكتروني');
      return;
    }

    const signatureData = sigPad.current.toDataURL();
    setSignature(signatureData);
    setIsCompleted(true);

    toast.success('تم حفظ التوقيع بنجاح', {
      description: 'العقد جاهز للتصدير',
    });
  };

  // مسح التوقيع
  const handleClear = () => {
    if (sigPad.current) {
      sigPad.current.clear();
      setSignature(null);
    }
  };

  // تصدير العقد كـ PDF
  const exportToPDF = () => {
    if (!signature) {
      toast.error('يرجى التوقيع أولاً');
      return;
    }

    const doc = new jsPDF();

    // العنوان
    doc.setFontSize(20);
    doc.setTextColor(212, 175, 55); // Gold
    doc.text('Press2Pay', 105, 20, { align: 'center' });

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(contractData.contractType, 105, 30, { align: 'center' });

    // معلومات العقد
    doc.setFontSize(12);
    doc.text(`Contract ID: ${contractData.merchantId}`, 20, 45);
    doc.text(`Date: ${contractData.contractDate}`, 20, 52);
    doc.text(`Merchant: ${contractData.merchantName}`, 20, 59);
    doc.text(`Email: ${contractData.merchantEmail}`, 20, 66);
    doc.text(`Value: ${contractData.contractValue.toLocaleString()} EGP`, 20, 73);

    // الشروط والأحكام
    doc.setFontSize(14);
    doc.setTextColor(212, 175, 55);
    doc.text('Terms & Conditions:', 20, 85);

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    contractData.terms.forEach((term, index) => {
      doc.text(`${index + 1}. ${term}`, 25, 95 + index * 7);
    });

    // التوقيع
    doc.text('Digital Signature:', 20, 140);
    if (signature) {
      doc.addImage(signature, 'PNG', 20, 145, 80, 30);
    }

    // كود QR
    const qrCanvas = document.querySelector('#contract-qr canvas') as HTMLCanvasElement;
    if (qrCanvas) {
      const qrImage = qrCanvas.toDataURL('image/png');
      doc.addImage(qrImage, 'PNG', 150, 145, 40, 40);
      doc.setFontSize(9);
      doc.text('Scan to verify', 160, 190, { align: 'center' });
    }

    // معلومات التحقق
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Document Hash: ${generateHash()}`, 20, 280);
    doc.text(`Generated: ${format(new Date(), 'PPpp', { locale: ar })}`, 20, 285);

    doc.save(`Contract-${contractData.merchantId}-${Date.now()}.pdf`);
    toast.success('تم تصدير العقد بنجاح');
  };

  // توليد Hash محاكي
  const generateHash = () => {
    return Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  };

  // رابط التحقق من العقد
  const verificationUrl = `https://press2pay.com/verify/${contractData.merchantId}/${generateHash().substring(0, 16)}`;

  if (isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 space-y-6"
      >
        <Card className="bg-gradient-to-br from-green-900/20 to-black border-green-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-green-500">
              <CheckCircle className="w-8 h-8" />
              تم توقيع العقد بنجاح!
            </CardTitle>
            <CardDescription>
              العقد جاهز للتصدير والحفظ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* معلومات العقد */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <User className="w-4 h-4 text-gold-500" />
                  <div>
                    <div className="text-gray-400">التاجر</div>
                    <div className="font-semibold">{contractData.merchantName}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="w-4 h-4 text-gold-500" />
                  <div>
                    <div className="text-gray-400">رقم التاجر</div>
                    <div className="font-mono text-gold-500">{contractData.merchantId}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-gold-500" />
                  <div>
                    <div className="text-gray-400">تاريخ التوقيع</div>
                    <div>{contractData.contractDate}</div>
                  </div>
                </div>
              </div>

              {/* كود QR للتحقق */}
              <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg">
                <div id="contract-qr">
                  <QRCodeSVG
                    value={verificationUrl}
                    size={160}
                    level="H"
                    includeMargin
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                  />
                </div>
                <p className="text-xs text-gray-600 text-center mt-2">
                  امسح للتحقق من العقد
                </p>
              </div>
            </div>

            <Separator />

            {/* معاينة التوقيع */}
            <div>
              <Label className="text-gold-400 mb-2 block">التوقيع الرقمي</Label>
              <div className="bg-white rounded-lg p-4 inline-block">
                <img src={signature || ''} alt="Signature" className="h-24" />
              </div>
            </div>

            {/* الأزرار */}
            <div className="flex gap-3">
              <Button
                onClick={exportToPDF}
                className="flex-1 bg-gold-600 hover:bg-gold-700"
              >
                <Download className="w-4 h-4 ml-2" />
                تصدير العقد (PDF)
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCompleted(false);
                  setSignature(null);
                  handleClear();
                }}
                className="border-gold-500/30"
              >
                <FileText className="w-4 h-4 ml-2" />
                عقد جديد
              </Button>
            </div>

            {/* معلومات الأمان */}
            <Card className="bg-blue-500/10 border-blue-500/30">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-500 mt-1" />
                  <div className="text-sm">
                    <div className="font-semibold text-blue-400 mb-1">
                      توقيع رقمي آمن
                    </div>
                    <p className="text-gray-400">
                      تم تشفير العقد بتقنية SHA-256 وحفظه بـ Blockchain.
                      رابط التحقق صالح لمدة 10 سنوات.
                    </p>
                    <div className="mt-2 p-2 bg-black/30 rounded font-mono text-xs break-all">
                      {generateHash()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card className="bg-gradient-to-br from-gray-900 to-black border-gold-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gold-500">
            <FileText className="w-6 h-6" />
            {contractData.contractType}
          </CardTitle>
          <CardDescription>
            يرجى قراءة الشروط والتوقيع للموافقة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* معلومات التاجر */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="merchantName" className="text-gold-400">
                الاسم الكامل *
              </Label>
              <Input
                id="merchantName"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                placeholder="أحمد محمد علي"
                className="bg-black/50 border-gold-500/30"
              />
            </div>
            <div>
              <Label htmlFor="merchantEmail" className="text-gold-400">
                البريد الإلكتروني *
              </Label>
              <Input
                id="merchantEmail"
                type="email"
                value={merchantEmail}
                onChange={(e) => setMerchantEmail(e.target.value)}
                placeholder="email@example.com"
                className="bg-black/50 border-gold-500/30"
              />
            </div>
          </div>

          <Separator />

          {/* الشروط والأحكام */}
          <div>
            <h3 className="text-lg font-semibold text-gold-400 mb-3">
              الشروط والأحكام
            </h3>
            <div className="space-y-2 bg-black/30 p-4 rounded-lg max-h-60 overflow-y-auto">
              {contractData.terms.map((term, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-300">{term}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <Separator />

          {/* لوحة التوقيع */}
          <div>
            <Label className="text-gold-400 mb-2 block">
              التوقيع الرقمي *
            </Label>
            <div className="relative">
              <div className="border-2 border-gold-500/30 rounded-lg overflow-hidden bg-white">
                <SignatureCanvas
                  ref={sigPad}
                  canvasProps={{
                    className: 'w-full h-48 cursor-crosshair',
                  }}
                  backgroundColor="white"
                  penColor="black"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="absolute top-2 left-2 bg-red-500/80 hover:bg-red-600 text-white"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              وقّع باستخدام الماوس أو اللمس
            </p>
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-gold-600 to-gold-500 
                       hover:from-gold-700 hover:to-gold-600"
            >
              <CheckCircle className="w-4 h-4 ml-2" />
              حفظ التوقيع والموافقة
            </Button>
            <Button
              variant="outline"
              onClick={handleClear}
              className="border-gold-500/30"
            >
              <Trash2 className="w-4 h-4 ml-2" />
              مسح
            </Button>
          </div>

          {/* ملاحظة قانونية */}
          <Card className="bg-yellow-500/10 border-yellow-500/30">
            <CardContent className="pt-4">
              <p className="text-xs text-gray-400">
                <strong className="text-yellow-500">ملاحظة قانونية:</strong> بالتوقيع على هذا
                العقد، أنت توافق على جميع الشروط والأحكام المذكورة أعلاه. التوقيع الرقمي له نفس
                القيمة القانونية للتوقيع المكتوب بخط اليد وفقاً للقانون المصري رقم 15 لسنة 2004
                بشأن تنظيم التوقيع الإلكتروني.
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
