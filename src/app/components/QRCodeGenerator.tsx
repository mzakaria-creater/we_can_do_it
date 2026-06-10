import React, { useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { copyToClipboard } from '../../lib/clipboard';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
  showDownload?: boolean;
  showCopy?: boolean;
  fgColor?: string;
  bgColor?: string;
}

export function QRCodeGenerator({
  value,
  size = 256,
  level = 'M',
  includeMargin = true,
  showDownload = true,
  showCopy = true,
  fgColor = '#0b0f14',
  bgColor = '#ffffff'
}: QRCodeGeneratorProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (!qrRef.current) return;
    
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = size;
    canvas.height = size;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `qr-code-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast.success('QR Code downloaded successfully');
        }
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(value);
    if (success) {
      toast.success('QR Code value copied to clipboard');
    } else {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={qrRef} className="p-4 bg-white rounded-xl border-2 border-border shadow-lg">
        <QRCodeSVG
          value={value}
          size={size}
          level={level}
          includeMargin={includeMargin}
          fgColor={fgColor}
          bgColor={bgColor}
        />
      </div>
      
      {(showDownload || showCopy) && (
        <div className="flex items-center gap-2">
          {showDownload && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          )}
          {showCopy && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Value</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}