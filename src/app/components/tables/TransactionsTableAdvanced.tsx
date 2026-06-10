/**
 * 📊 Press2Pay - جدول المعاملات المتقدم
 * يستخدم TanStack Table مع جميع الميزات
 */

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { motion } from 'motion/react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
  Calendar,
  X,
  User,
  Mail,
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { DayPicker } from 'react-day-picker';
import * as Popover from '@radix-ui/react-popover';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  TransactionStatus,
  getStatusConfig,
  getAllStatuses,
  STATUS_GROUPS,
  formatStatus,
  getStatusEmoji,
} from '../../constants/transactionStatuses';

// ✅ نوع البيانات
interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  date: string;
  method: string;
  reference: string;
  customer: string;
  customerEmail: string;
}

// ✅ تعريف الأعمدة
const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="text-gold-400 hover:text-gold-300"
        >
          رقم المعاملة
          {column.getIsSorted() === 'asc' && <ArrowUp className="mr-2 h-4 w-4" />}
          {column.getIsSorted() === 'desc' && <ArrowDown className="mr-2 h-4 w-4" />}
          {!column.getIsSorted() && <ArrowUpDown className="mr-2 h-4 w-4" />}
        </Button>
      );
    },
    cell: ({ row }) => (
      <span className="font-mono text-sm text-gold-500">
        #{row.getValue('id')}
      </span>
    ),
  },
  {
    accessorKey: 'merchant',
    header: 'التاجر',
    cell: ({ row }) => (
      <div className="font-semibold">{row.getValue('merchant')}</div>
    ),
  },
  {
    accessorKey: 'customer',
    header: 'العميل',
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="text-gold-400"
        >
          المبلغ
          <ArrowUpDown className="mr-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'));
      const currency = row.original.currency;
      return (
        <div className="font-bold text-gold-500">
          {amount.toLocaleString('ar-EG', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{' '}
          {currency}
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'الحالة',
    cell: ({ row }) => {
      const status = row.getValue('status') as TransactionStatus;
      const statusConfig = getStatusConfig(status);
      const Icon = statusConfig.icon;

      return (
        <Badge variant="outline" className={statusConfig.className}>
          <Icon className="w-3 h-3 ml-1" />
          {statusConfig.label}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'method',
    header: 'طريقة الدفع',
    cell: ({ row }) => (
      <span className="text-sm text-gray-400">{row.getValue('method')}</span>
    ),
  },
  {
    accessorKey: 'date',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="text-gold-400"
        >
          التاريخ
          <ArrowUpDown className="mr-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue('date'));
      return (
        <div className="text-sm">
          <div>{format(date, 'dd MMM yyyy', { locale: ar })}</div>
          <div className="text-gray-500 text-xs">
            {format(date, 'hh:mm a', { locale: ar })}
          </div>
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'الإجراءات',
    cell: ({ row }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            toast.info('عرض تفاصيل المعاملة', {
              description: `رقم المعاملة: ${row.getValue('id')}`,
            });
          }}
          className="text-gold-400 hover:text-gold-300"
        >
          <Eye className="w-4 h-4" />
        </Button>
      );
    },
  },
];

export default function TransactionsTableAdvanced() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  
  // ✅ NEW: Date range filter state
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  
  // ✅ NEW: Customer search state
  const [customerSearch, setCustomerSearch] = useState('');
  
  // ✅ NEW: Advanced filters visibility
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // ✅ استخدام TanStack Query لجلب البيانات
  const { data: transactions = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      // محاكاة API Call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // بيانات تجريبية
      const allStatuses = getAllStatuses();
      const mockData: Transaction[] = Array.from({ length: 50 }, (_, i) => ({
        id: `TXN${String(i + 1).padStart(6, '0')}`,
        merchant: ['متجر الإلكترونيات', 'مطعم البيتزا', 'صيدلية النور', 'سوبر ماركت'][i % 4],
        customer: ['أحمد محمد', 'فاطمة علي', 'محمود حسن', 'سارة خالد'][i % 4],
        customerEmail: ['ahmed@example.com', 'fatima@example.com', 'mohamed@example.com', 'sara@example.com'][i % 4],
        amount: Math.random() * 10000 + 100,
        currency: 'EGP',
        status: allStatuses[Math.floor(Math.random() * allStatuses.length)].value,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        method: ['بطاقة ائتمان', 'فودافون كاش', 'محفظة إلكترونية', 'تحويل بنكي'][i % 4],
        reference: `REF${String(i + 1).padStart(8, '0')}`,
      }));

      return mockData;
    },
    refetchInterval: 30000, // تحديث تلقائي كل 30 ثانية
  });

  // ✅ NEW: Filtered transactions with date range and customer search
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Apply date range filter
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        const from = dateRange.from ? new Date(dateRange.from.setHours(0, 0, 0, 0)) : null;
        const to = dateRange.to ? new Date(dateRange.to.setHours(23, 59, 59, 999)) : null;

        if (from && to) {
          return transactionDate >= from && transactionDate <= to;
        } else if (from) {
          return transactionDate >= from;
        } else if (to) {
          return transactionDate <= to;
        }
        return true;
      });
    }

    // Apply customer search filter
    if (customerSearch) {
      const searchLower = customerSearch.toLowerCase();
      filtered = filtered.filter((transaction) =>
        transaction.customer.toLowerCase().includes(searchLower) ||
        transaction.customerEmail.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [transactions, dateRange, customerSearch]);

  // ✅ NEW: Clear all filters
  const clearAllFilters = () => {
    setDateRange({ from: undefined, to: undefined });
    setCustomerSearch('');
    setGlobalFilter('');
    table.getColumn('status')?.setFilterValue(undefined);
    toast.success('تم مسح جميع الفلاتر');
  };

  // ✅ NEW: Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (dateRange.from || dateRange.to) count++;
    if (customerSearch) count++;
    if (globalFilter) count++;
    if (table.getColumn('status')?.getFilterValue()) count++;
    return count;
  }, [dateRange, customerSearch, globalFilter, table.getColumn('status')?.getFilterValue()]);

  // ✅ إنشاء الجدول باستخدام TanStack Table
  const table = useReactTable({
    data: filteredTransactions,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // ✅ تصدير PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // إعداد الخط العربي (محاكاة)
    doc.setFont('helvetica');
    doc.setFontSize(18);
    doc.text('Press2Pay - Transaction Report', 20, 20);
    doc.setFontSize(12);
    doc.text(format(new Date(), 'PPP', { locale: ar }), 20, 30);

    // إضافة الجدول
    (doc as any).autoTable({
      head: [['ID', 'Merchant', 'Amount', 'Status', 'Date']],
      body: table.getFilteredRowModel().rows.map((row) => [
        row.getValue('id'),
        row.getValue('merchant'),
        `${parseFloat(row.getValue('amount')).toFixed(2)} EGP`,
        row.getValue('status'),
        format(new Date(row.getValue('date')), 'dd/MM/yyyy'),
      ]),
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [212, 175, 55] },
    });

    doc.save(`transactions-${Date.now()}.pdf`);
    toast.success('تم تصدير التقرير بنجاح');
  };

  // ✅ إحصائيات سريعة
  const stats = useMemo(() => {
    const filtered = table.getFilteredRowModel().rows;
    return {
      total: filtered.length,
      success: filtered.filter((r) => r.getValue('status') === 'success').length,
      pending: filtered.filter((r) => r.getValue('status') === 'pending').length,
      failed: filtered.filter((r) => r.getValue('status') === 'failed').length,
      totalAmount: filtered.reduce((sum, r) => sum + parseFloat(r.getValue('amount')), 0),
    };
  }, [table.getFilteredRowModel().rows]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      {/* الإحصائيات السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-gray-900 to-black border-gold-500/20">
          <CardContent className="pt-6">
            <div className="text-sm text-gray-400">إجمالي المعاملات</div>
            <div className="text-3xl font-bold text-gold-500">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-900/20 to-black border-green-500/20">
          <CardContent className="pt-6">
            <div className="text-sm text-gray-400">ناجحة</div>
            <div className="text-3xl font-bold text-green-500">{stats.success}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-900/20 to-black border-yellow-500/20">
          <CardContent className="pt-6">
            <div className="text-sm text-gray-400">قيد المراجعة</div>
            <div className="text-3xl font-bold text-yellow-500">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-900/20 to-black border-red-500/20">
          <CardContent className="pt-6">
            <div className="text-sm text-gray-400">فاشلة</div>
            <div className="text-3xl font-bold text-red-500">{stats.failed}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gold-900/20 to-black border-gold-500/30">
          <CardContent className="pt-6">
            <div className="text-sm text-gray-400">إجمالي المبالغ</div>
            <div className="text-2xl font-bold text-gold-500">
              {stats.totalAmount.toLocaleString('ar-EG', { maximumFractionDigits: 0 })} EGP
            </div>
          </CardContent>
        </Card>
      </div>

      {/* أدوات التحكم */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-gold-500/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-gold-500">المعاملات المالية</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="border-gold-500/30 text-gold-400"
              >
                <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToPDF}
                className="border-gold-500/30 text-gold-400"
              >
                <Download className="w-4 h-4 ml-2" />
                تصدير PDF
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* ✅ NEW: Advanced Filters Toggle */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="border-gold-500/30 text-gold-400"
            >
              <Filter className="w-4 h-4 ml-2" />
              فلاتر متقدمة
              {activeFiltersCount > 0 && (
                <Badge className="mr-2 bg-gold-500 text-black">{activeFiltersCount}</Badge>
              )}
            </Button>

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-red-400 hover:text-red-300"
              >
                <X className="w-4 h-4 ml-2" />
                مسح الفلاتر
              </Button>
            )}
          </div>

          {/* ✅ NEW: Advanced Filters Panel */}
          {showAdvancedFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 bg-black/30 border border-gold-500/20 rounded-lg"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Search */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gold-400 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    البحث عن عميل
                  </label>
                  <div className="relative">
                    <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="اسم العميل أو البريد الإلكتروني..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="pr-10 bg-black/50 border-gold-500/30"
                    />
                  </div>
                  {customerSearch && (
                    <div className="text-xs text-gray-400">
                      جاري البحث عن: <span className="text-gold-400">{customerSearch}</span>
                    </div>
                  )}
                </div>

                {/* Date Range Picker */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gold-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    نطاق التاريخ
                  </label>
                  <div className="flex items-center gap-2">
                    {/* Start Date */}
                    <Popover.Root>
                      <Popover.Trigger asChild>
                        <Button
                          variant="outline"
                          className="flex-1 justify-start text-right bg-black/50 border-gold-500/30 hover:bg-gold-500/10"
                        >
                          <Calendar className="w-4 h-4 ml-2" />
                          {dateRange.from ? (
                            format(dateRange.from, 'dd MMM yyyy', { locale: ar })
                          ) : (
                            <span className="text-gray-500">من تاريخ</span>
                          )}
                        </Button>
                      </Popover.Trigger>
                      <Popover.Portal>
                        <Popover.Content
                          className="vip-card z-50 p-4"
                          align="start"
                          sideOffset={5}
                        >
                          <DayPicker
                            mode="single"
                            selected={dateRange.from}
                            onSelect={(date) =>
                              setDateRange({ ...dateRange, from: date })
                            }
                            locale={ar}
                            dir="rtl"
                            className="vip-calendar"
                          />
                        </Popover.Content>
                      </Popover.Portal>
                    </Popover.Root>

                    <span className="text-gray-500">-</span>

                    {/* End Date */}
                    <Popover.Root>
                      <Popover.Trigger asChild>
                        <Button
                          variant="outline"
                          className="flex-1 justify-start text-right bg-black/50 border-gold-500/30 hover:bg-gold-500/10"
                        >
                          <Calendar className="w-4 h-4 ml-2" />
                          {dateRange.to ? (
                            format(dateRange.to, 'dd MMM yyyy', { locale: ar })
                          ) : (
                            <span className="text-gray-500">إلى تاريخ</span>
                          )}
                        </Button>
                      </Popover.Trigger>
                      <Popover.Portal>
                        <Popover.Content
                          className="vip-card z-50 p-4"
                          align="start"
                          sideOffset={5}
                        >
                          <DayPicker
                            mode="single"
                            selected={dateRange.to}
                            onSelect={(date) =>
                              setDateRange({ ...dateRange, to: date })
                            }
                            locale={ar}
                            dir="rtl"
                            className="vip-calendar"
                            disabled={(date) =>
                              dateRange.from ? date < dateRange.from : false
                            }
                          />
                        </Popover.Content>
                      </Popover.Portal>
                    </Popover.Root>
                  </div>
                  {(dateRange.from || dateRange.to) && (
                    <div className="text-xs text-gray-400 flex items-center gap-2">
                      <span>التصفية حسب:</span>
                      {dateRange.from && (
                        <Badge className="bg-gold-500/10 text-gold-400 border-gold-500/30">
                          من {format(dateRange.from, 'dd/MM/yyyy', { locale: ar })}
                        </Badge>
                      )}
                      {dateRange.to && (
                        <Badge className="bg-gold-500/10 text-gold-400 border-gold-500/30">
                          إلى {format(dateRange.to, 'dd/MM/yyyy', { locale: ar })}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Basic Filters Row */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* البحث العام */}
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="ابحث في جميع الحقول..."
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pr-10 bg-black/50 border-gold-500/30"
              />
            </div>

            {/* فلتر الحالة */}
            <Select
              value={(table.getColumn('status')?.getFilterValue() as string[])?.join(',') || 'all'}
              onValueChange={(value) => {
                if (value === 'all') {
                  table.getColumn('status')?.setFilterValue(undefined);
                } else {
                  table.getColumn('status')?.setFilterValue(value.split(','));
                }
              }}
            >
              <SelectTrigger className="w-[200px] bg-black/50 border-gold-500/30">
                <Filter className="w-4 h-4 ml-2" />
                <SelectValue placeholder="فلتر الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                {getAllStatuses().map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {getStatusEmoji(status.value)} {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* الجدول */}
          <div className="rounded-lg border border-gold-500/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gold-500/10">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-4 py-3 text-right text-sm font-semibold text-gold-400"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row, i) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-t border-gold-500/10 hover:bg-gold-500/5 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3 text-sm">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* التنقل بين الصفحات */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-400">
              عرض {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} -{' '}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}{' '}
              من {table.getFilteredRowModel().rows.length}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="border-gold-500/30"
              >
                السابق
              </Button>
              <div className="text-sm text-gray-400">
                صفحة {table.getState().pagination.pageIndex + 1} من {table.getPageCount()}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="border-gold-500/30"
              >
                التالي
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}