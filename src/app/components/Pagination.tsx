import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number);
  onPrevPage: () => void;
  onNextPage: () => void;
  isRTL?: boolean;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  itemLabel?: string;
  itemLabelAr?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  onPrevPage,
  onNextPage,
  isRTL = false,
  startIndex,
  endIndex,
  totalItems,
  itemLabel = 'items',
  itemLabelAr = 'عنصر'
}) => {
  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="p-4 sm:p-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-sm text-gray-400">
        {isRTL ? 'عرض' : 'Showing'}{' '}
        <span className="font-bold text-white">{startIndex + 1}</span>{' '}
        {isRTL ? 'إلى' : 'to'}{' '}
        <span className="font-bold text-white">{Math.min(endIndex, totalItems)}</span>{' '}
        {isRTL ? 'من' : 'of'}{' '}
        <span className="font-bold text-white">{totalItems}</span>{' '}
        {isRTL ? itemLabelAr : itemLabel}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={onPrevPage}
          disabled={currentPage === 1}
          className={`px-3 py-2 rounded-lg text-sm transition-all ${
            currentPage === 1
              ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/10'
              : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'
          }`}
        >
          {isRTL ? 'السابق' : 'Previous'}
        </button>
        {getPageNumbers().map((page, idx) => (
          <button
            key={idx}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={`px-3 py-2 rounded-lg text-sm transition-all ${
              page === currentPage
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#C49F27] text-[#0B0F14] font-bold shadow-lg shadow-[#D4AF37]/20'
                : page === '...'
                ? 'bg-transparent text-gray-400 cursor-default'
                : 'bg-white/5 hover:bg-[#D4AF37]/10 border border-white/10 text-white hover:border-[#D4AF37]/30'
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 rounded-lg text-sm transition-all ${
            currentPage === totalPages
              ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/10'
              : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'
          }`}
        >
          {isRTL ? 'التالي' : 'Next'}
        </button>
      </div>
    </div>
  );
};
