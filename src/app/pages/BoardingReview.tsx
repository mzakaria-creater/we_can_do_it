import React, { useState, useMemo } from 'react';
import { Calendar, Filter, Search, Download, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { DataReviewGrid } from '../components/DataReviewGrid';
import { BoardingActionBar } from '../components/BoardingActionBar';
import { PageHeader } from '../components/PageHeader';
import { Badge } from '../components/ui/badge';
import { cn } from '../components/ui/utils';

interface BoardingRecord {
  id: string;
  merchant: string;
  type: 'deposit' | 'merchant' | 'rolling_reserve';
  status: 'pending_review' | 'approved' | 'rejected';
  submittedDate: string;
  reviewedBy?: string;
  data: Record<string, any>;
}

// Mock data for demonstration
const mockBoardingRecords: BoardingRecord[] = [
  {
    id: 'BR-2026-001',
    merchant: 'ElitePay Egypt',
    type: 'deposit',
    status: 'pending_review',
    submittedDate: '2026-02-15',
    data: {
      depositMethod: 'Bank Transfer',
      processingFee: 2.5,
      fixedFee: 5.0,
      settlementCycle: 'T+1',
      minAmount: 100,
      maxAmount: 1000000,
      currency: 'EGP',
      merchantCategory: 'E-commerce',
      monthlyVolume: 5000000,
      tierPricing: 'Enabled',
      rollingReserve: 10,
    },
  },
  {
    id: 'BR-2026-002',
    merchant: 'TechMall Arabia',
    type: 'merchant',
    status: 'pending_review',
    submittedDate: '2026-02-14',
    data: {
      legalName: 'TechMall Arabia LLC',
      tradeName: 'TechMall',
      taxId: '123-456-789',
      registrationNumber: 'CR-987654',
      businessType: 'E-commerce',
      website: 'https://techmall.ae',
      monthlyVolume: 8000000,
      expectedTransactions: 5000,
      averageTicket: 1600,
      currency: 'AED',
    },
  },
  {
    id: 'BR-2026-003',
    merchant: 'GrandRetail KSA',
    type: 'rolling_reserve',
    status: 'pending_review',
    submittedDate: '2026-02-13',
    data: {
      reservePercentage: 15,
      reservePeriod: 90,
      releaseSchedule: 'Monthly',
      currency: 'SAR',
      estimatedHoldAmount: 750000,
      riskCategory: 'Medium',
      justification: 'New merchant with high-risk category',
    },
  },
];

export default function BoardingReview() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // State
  const [selectedRecord, setSelectedRecord] = useState<BoardingRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'deposit' | 'merchant' | 'rolling_reserve'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending_review' | 'approved' | 'rejected'>('all');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return mockBoardingRecords.filter(record => {
      const matchesSearch = record.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           record.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || record.type === filterType;
      const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [searchQuery, filterType, filterStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / entriesPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  // Handlers
  const handleApprove = () => {
    if (selectedRecord) {
      console.log('Approving record:', selectedRecord.id);
      // TODO: Implement API call
      setSelectedRecord(null);
    }
  };

  const handleReject = () => {
    if (selectedRecord) {
      console.log('Rejecting record:', selectedRecord.id);
      // TODO: Implement API call
      setSelectedRecord(null);
    }
  };

  const handleClose = () => {
    setSelectedRecord(null);
  };

  const handleViewRecord = (record: BoardingRecord) => {
    setSelectedRecord(record);
  };

  // Convert record data to DataReviewGrid fields
  const getDataFields = (record: BoardingRecord | null) => {
    if (!record) return [];

    const fields = Object.entries(record.data).map(([key, value]) => {
      const isRequired = ['currency', 'merchantCategory', 'legalName'].includes(key);
      const isHighlight = ['processingFee', 'fixedFee', 'reservePercentage'].includes(key);
      
      let type: 'text' | 'number' | 'percentage' | 'currency' = 'text';
      if (key.includes('Fee') || key.includes('Amount') || key.includes('Volume') || key.includes('Ticket')) {
        type = 'currency';
      } else if (key.includes('Percentage') || key.includes('Reserve')) {
        type = 'percentage';
      } else if (typeof value === 'number') {
        type = 'number';
      }

      return {
        label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        value: value,
        required: isRequired,
        highlight: isHighlight,
        type,
      };
    });

    return fields;
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'deposit':
        return t('boardingTypeDeposit', 'Deposit Configuration');
      case 'merchant':
        return t('boardingTypeMerchant', 'Merchant Data');
      case 'rolling_reserve':
        return t('boardingTypeRollingReserve', 'Rolling Reserve');
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_review':
        return <Badge className="bg-warning/20 text-warning border-warning/30">{t('pending', 'Pending')}</Badge>;
      case 'approved':
        return <Badge className="bg-success/20 text-success border-success/30">{t('approved', 'Approved')}</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30">{t('rejected', 'Rejected')}</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <PageHeader
        title={t('boardingReview', 'Boarding Review & Approval')}
        description={t('boardingReviewDesc', 'Review and approve merchant boarding data, deposit configurations, and rolling reserve settings')}
      />

      {/* Filter Bar */}
      <div className="glossy-card rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder={t('searchBoarding', 'Search by merchant or ID...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="h-10 px-3 py-2 rounded-md border border-input bg-input-background text-sm"
          >
            <option value="all">{t('allTypes', 'All Types')}</option>
            <option value="deposit">{t('boardingTypeDeposit', 'Deposit')}</option>
            <option value="merchant">{t('boardingTypeMerchant', 'Merchant')}</option>
            <option value="rolling_reserve">{t('boardingTypeRollingReserve', 'Rolling Reserve')}</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="h-10 px-3 py-2 rounded-md border border-input bg-input-background text-sm"
          >
            <option value="all">{t('allStatuses', 'All Statuses')}</option>
            <option value="pending_review">{t('pending', 'Pending Review')}</option>
            <option value="approved">{t('approved', 'Approved')}</option>
            <option value="rejected">{t('rejected', 'Rejected')}</option>
          </select>

          {/* Date Range */}
          <Button variant="outline" className="gap-2">
            <Calendar className="size-4" />
            <span>{t('dateRange', 'Date Range')}</span>
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="glossy-card rounded-xl p-6 mb-6">
        {/* Table Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t('showEntries', 'Show')}</span>
            <select
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(Number(e.target.value))}
              className="h-8 px-2 py-1 rounded-md border border-input bg-input-background text-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-muted-foreground">{t('entries', 'entries')}</span>
          </div>

          <Button variant="outline" size="sm" className="gap-2">
            <Download className="size-4" />
            <span>{t('export', 'Export')}</span>
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                  {t('boardingId', 'Boarding ID')}
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                  {t('merchant', 'Merchant')}
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                  {t('type', 'Type')}
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                  {t('status', 'Status')}
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                  {t('submittedDate', 'Submitted Date')}
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-foreground">
                  {t('actions', 'Actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.map((record) => (
                <tr
                  key={record.id}
                  className="border-b border-border/20 hover:bg-primary/5 transition-colors"
                >
                  <td className="py-3 px-4 text-sm font-mono text-foreground">
                    {record.id}
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-foreground">
                    {record.merchant}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {getTypeLabel(record.type)}
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(record.status)}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {new Date(record.submittedDate).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Button
                      variant="gold-outline"
                      size="sm"
                      onClick={() => handleViewRecord(record)}
                      disabled={record.status !== 'pending_review'}
                    >
                      {t('review', 'Review')}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
          <div className="text-sm text-muted-foreground">
            {t('showing', 'Showing')} {((currentPage - 1) * entriesPerPage) + 1} {t('to', 'to')}{' '}
            {Math.min(currentPage * entriesPerPage, filteredRecords.length)} {t('of', 'of')}{' '}
            {filteredRecords.length} {t('results', 'results')}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              {t('previous', 'Previous')}
            </Button>
            <span className="text-sm font-medium px-2">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              {t('next', 'Next')}
            </Button>
          </div>
        </div>
      </div>

      {/* Detail Review Panel */}
      {selectedRecord && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-screen py-8 px-4">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="glossy-card rounded-xl p-6 mb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold gold-text mb-2">
                      {selectedRecord.merchant}
                    </h2>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {t('boardingId', 'Boarding ID')}: <span className="font-mono font-semibold">{selectedRecord.id}</span>
                      </span>
                      <Badge className="bg-primary/20 text-primary border-primary/30">
                        {getTypeLabel(selectedRecord.type)}
                      </Badge>
                      {getStatusBadge(selectedRecord.status)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Review Grid */}
              <DataReviewGrid
                title={t('reviewDetails', 'Review Details')}
                fields={getDataFields(selectedRecord)}
                className="mb-24"
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Bar (Fixed Bottom) */}
      {selectedRecord && (
        <BoardingActionBar
          onApprove={handleApprove}
          onReject={handleReject}
          onClose={handleClose}
        />
      )}
    </div>
  );
}