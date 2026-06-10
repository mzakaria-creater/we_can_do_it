import React from 'react';
import { cn } from './ui/utils';
import { useTranslation } from 'react-i18next';

interface DataField {
  label: string;
  value: string | number | React.ReactNode;
  required?: boolean;
  highlight?: boolean;
  type?: 'text' | 'number' | 'percentage' | 'currency';
}

interface DataReviewGridProps {
  title?: string;
  fields: DataField[];
  className?: string;
}

export function DataReviewGrid({ title, fields, className }: DataReviewGridProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const formatValue = (field: DataField) => {
    if (React.isValidElement(field.value)) {
      return field.value;
    }

    const value = field.value;

    switch (field.type) {
      case 'percentage':
        return `${value}%`;
      case 'currency':
        return typeof value === 'number' 
          ? new Intl.NumberFormat(isRTL ? 'ar-EG' : 'en-US', {
              style: 'currency',
              currency: 'EGP',
            }).format(value)
          : value;
      case 'number':
        return typeof value === 'number'
          ? new Intl.NumberFormat(isRTL ? 'ar-EG' : 'en-US').format(value)
          : value;
      default:
        return value;
    }
  };

  return (
    <div className={cn('glossy-card rounded-xl p-6', className)}>
      {title && (
        <h3 className="text-lg font-bold mb-6 gold-text">
          {title}
        </h3>
      )}
      
      <div className="space-y-1">
        {fields.map((field, index) => (
          <div
            key={index}
            className={cn(
              'grid grid-cols-2 gap-4 py-3 px-4 rounded-lg transition-colors',
              'hover:bg-primary/5 dark:hover:bg-primary/10',
              field.highlight && 'bg-primary/10 dark:bg-primary/20',
              index !== fields.length - 1 && 'border-b border-border/20'
            )}
          >
            {/* Field Label */}
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span>{field.label}</span>
              {field.required && (
                <span className="text-destructive text-lg" title="Required field">
                  *
                </span>
              )}
            </div>

            {/* Field Value */}
            <div className={cn(
              'text-sm font-semibold text-foreground',
              field.highlight && 'text-primary font-bold'
            )}>
              {formatValue(field)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
