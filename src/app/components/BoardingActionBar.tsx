import React from 'react';
import { Check, X, XCircle } from 'lucide-react';
import { Button } from './ui/button';
import { useTranslation } from 'react-i18next';

interface BoardingActionBarProps {
  onApprove: () => void;
  onReject: () => void;
  onClose: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function BoardingActionBar({
  onApprove,
  onReject,
  onClose,
  isLoading = false,
  disabled = false,
}: BoardingActionBarProps) {
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/30 bg-card/95 backdrop-blur-lg shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-end gap-4" dir="ltr">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="lg"
            onClick={onClose}
            disabled={isLoading}
            className="min-w-[120px] hover:bg-muted/50"
          >
            <XCircle className="size-5" />
            <span>{t('close', 'Close')}</span>
          </Button>

          {/* Reject Button */}
          <Button
            variant="destructive"
            size="lg"
            onClick={onReject}
            disabled={disabled || isLoading}
            className="min-w-[140px] bg-destructive hover:bg-destructive/90 text-white shadow-lg shadow-destructive/20"
          >
            <X className="size-5" />
            <span>{t('boardingReject', 'Reject')}</span>
          </Button>

          {/* Approve Button */}
          <Button
            variant="luxury"
            size="lg"
            onClick={onApprove}
            disabled={disabled || isLoading}
            className="min-w-[140px] bg-success hover:bg-success/90 text-white shadow-lg shadow-success/30 gold-glow"
          >
            <Check className="size-5" />
            <span>{t('boardingApprove', 'Approve')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
