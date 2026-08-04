import React, { useState } from 'react';
import { Transaction, CountryConfig } from '../types';
import { Search, Download, AlertCircle, CheckCircle, Clock, X, FileText } from 'lucide-react';

interface TransactionHistoryProps {
  lang: 'ar' | 'en';
  transactions: Transaction[];
  selectedCountry: CountryConfig;
}

export default function TransactionHistory({
  lang,
  transactions,
  selectedCountry
}: TransactionHistoryProps) {
  const isAr = lang === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'sync' | 'convert' | 'withdraw' | 'transfer'>('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const t = {
    title: isAr ? 'سجل العمليات والتقارير' : 'Transaction Logs & Reports',
    subtitle: isAr ? 'عرض كشوفات حساب تفصيلية لنقاط المزامنة والتحويلات المالية الصادرة والواردة' : 'Audit detailed balance statements for points sync, cash cashouts, and logs',
    searchPlaceholder: isAr ? 'البحث عن منصة أو تفاصيل المحفظة...' : 'Search platform or wallet details...',
    filterAll: isAr ? 'الكل' : 'All',
    filterSync: isAr ? 'مزامنة النقاط' : 'Sync Logs',
    filterConvert: isAr ? 'التحويل المالي' : 'Conversions',
    filterWithdraw: isAr ? 'سحوبات المحافظ' : 'Withdrawals',
    filterTransfer: isAr ? 'حوالات صادرة 💸' : 'Outbound Transfers 💸',
    thType: isAr ? 'النوع' : 'Type',
    thDetail: isAr ? 'التفاصيل / المنصة' : 'Details / Platform',
    thPoints: isAr ? 'النقاط' : 'Points',
    thAmount: isAr ? 'القيمة المالية' : 'Amount',
    thDate: isAr ? 'التاريخ' : 'Date',
    thStatus: isAr ? 'الحالة' : 'Status',
    noResults: isAr ? 'لم يتم العثور على أي عمليات مطابقة للبحث' : 'No matching transactions found',
    success: isAr ? 'مكتملة' : 'Successful',
    pending: isAr ? 'قيد المعالجة' : 'Processing',
    failed: isAr ? 'فشلت' : 'Failed',
    
    // Receipt overlay
    receiptTitle: isAr ? 'فاتورة مالية معتمدة' : 'Official Financial Receipt',
    txId: isAr ? 'رقم المعاملة الفريد:' : 'Transaction Reference:',
    dateLabel: isAr ? 'تاريخ الاستحقاق الدقيق:' : 'Transaction Timestamp:',
    statusLabel: isAr ? 'حالة السداد الحالية:' : 'Current Status:',
    receiptDesc: isAr ? 'تعتبر هذه الوثيقة إقرارًا إلكترونيًا رسميًا بإجراء العملية المذكورة أعلاه.' : 'This document constitutes an official transaction voucher for the services listed above.',
    printBtn: isAr ? 'تصدير وتحميل الفاتورة PDF 📥' : 'Export & Download PDF Receipt 📥',
    pdfGenerating: isAr ? 'جاري توليد ملف الـ PDF...' : 'Generating secure PDF file...',
    pdfSuccess: isAr ? 'تم تحميل الفاتورة بنجاح!' : 'Receipt PDF downloaded successfully!',
    egp: isAr ? selectedCountry.currencySymbol : selectedCountry.currencyCode
  };

  // Filtering + Searching logic
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      (tx.platformName && tx.platformName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.platformNameAr && tx.platformNameAr.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.walletDetails && tx.walletDetails.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.walletType && tx.walletType.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === 'all' || tx.type === filterType;

    return matchesSearch && matchesType;
  });

  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadPdf = (tx: Transaction) => {
    setGeneratingPdf(true);
    setTimeout(() => {
      setGeneratingPdf(false);
      setDownloadSuccess(true);
      
      // Simulate virtual file download anchor triggers
      setTimeout(() => setDownloadSuccess(false), 2000);
    }, 1500);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50';
      case 'pending':
        return 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/50';
      default:
        return 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900/50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and overview */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{t.title}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{t.subtitle}</p>
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-indigo-500"
            placeholder={t.searchPlaceholder}
          />
        </div>

        {/* Tab Filters */}
        <div className="flex gap-1 overflow-x-auto pb-1 md:pb-0">
          {(['all', 'sync', 'convert', 'withdraw', 'transfer'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                filterType === type
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {type === 'all' && t.filterAll}
              {type === 'sync' && t.filterSync}
              {type === 'convert' && t.filterConvert}
              {type === 'withdraw' && t.filterWithdraw}
              {type === 'transfer' && t.filterTransfer}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-16 text-slate-400 dark:text-slate-500 text-sm">
            <AlertCircle className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
            <p>{t.noResults}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs text-slate-400 uppercase font-mono bg-slate-50/50 dark:bg-slate-950/20">
                  <th className={`px-6 py-4 ${isAr ? 'text-right' : 'text-left'}`}>{t.thType}</th>
                  <th className={`px-6 py-4 ${isAr ? 'text-right' : 'text-left'}`}>{t.thDetail}</th>
                  <th className="px-6 py-4 text-center">{t.thPoints}</th>
                  <th className={`px-6 py-4 ${isAr ? 'text-left' : 'text-right'}`}>{t.thAmount}</th>
                  <th className={`px-6 py-4 ${isAr ? 'text-right' : 'text-left'}`}>{t.thDate}</th>
                  <th className="px-6 py-4 text-center">{t.thStatus}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40 text-sm text-slate-600 dark:text-slate-300">
                {filteredTransactions.map(tx => (
                  <tr 
                    key={tx.id} 
                    onClick={() => setSelectedTx(tx)}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors cursor-pointer"
                  >
                    <td className={`px-6 py-4 font-semibold ${isAr ? 'text-right' : 'text-left'}`}>
                      {tx.type === 'sync' && (
                        <span className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded text-xs">
                          {isAr ? 'مزامنة نقاط' : 'Sync'}
                        </span>
                      )}
                      {tx.type === 'convert' && (
                        <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded text-xs">
                          {isAr ? 'تحويل مالي' : 'Convert'}
                        </span>
                      )}
                      {tx.type === 'withdraw' && (
                        <span className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded text-xs">
                          {isAr ? 'سحب محفظة' : 'Withdraw'}
                        </span>
                      )}
                      {tx.type === 'transfer' && (
                        <span className="text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-1 rounded text-xs">
                          {isAr ? 'تحويل مالي 💸' : 'Transfer 💸'}
                        </span>
                      )}
                    </td>
                    <td className={`px-6 py-4 ${isAr ? 'text-right' : 'text-left'}`}>
                      {tx.type === 'withdraw' ? (
                        <span className="font-mono text-xs">
                          {tx.walletType === 'zain_cash' && (isAr ? 'زين كاش' : 'Zain Cash')}
                          {tx.walletType === 'qi_card' && (isAr ? 'كي كارد' : 'Qi Card')}
                          {tx.walletType === 'vodafone_cash' && (isAr ? 'فودافون كاش' : 'Vodafone Cash')}
                          {tx.walletType === 'stc_pay' && (isAr ? 'إس تي سي باي' : 'STC Pay')}
                          {tx.walletType === 'usdt_trc20' && 'USDT (TRC-20)'}
                          {tx.walletType === 'asiapay' && (isAr ? 'آسيا باي' : 'AsiaPay')}
                          {tx.walletType === 'fastpay' && (isAr ? 'فاست باي' : 'FastPay')}
                          {tx.walletType === 'paypal' && 'PayPal'}
                          {tx.walletType === 'payeer' && 'Payeer'}
                          {tx.walletType === 'bank_transfer' && (isAr ? 'تحويل بنكي' : 'Bank Transfer')}
                          {tx.walletType === 'flight_booking' && (isAr ? 'حجز تذكرة طيران ✈️' : 'Flight Ticket Booking ✈️')}
                          {!['zain_cash', 'qi_card', 'vodafone_cash', 'stc_pay', 'usdt_trc20', 'asiapay', 'fastpay', 'paypal', 'payeer', 'bank_transfer', 'flight_booking'].includes(tx.walletType || '') && tx.walletType} ({tx.walletDetails})
                        </span>
                      ) : tx.type === 'transfer' ? (
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                          {isAr 
                            ? `تحويل إلى ${tx.recipientName} (${tx.recipientCountry})` 
                            : `Transfer to ${tx.recipientName} (${tx.recipientCountry})`}
                        </span>
                      ) : (
                        <span>{isAr ? (tx.platformNameAr || tx.platformName) : tx.platformName}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {tx.points ? `${tx.type === 'sync' ? '+' : '-'}${tx.points.toLocaleString()}` : '-'}
                    </td>
                    <td className={`px-6 py-4 font-mono font-bold text-sm ${isAr ? 'text-left' : 'text-right'} ${(tx.type === 'withdraw' || tx.type === 'transfer') ? 'text-red-500' : 'text-emerald-500'}`}>
                      {(tx.type === 'withdraw' || tx.type === 'transfer') ? '-' : '+'}{tx.amount.toLocaleString()} {isAr ? selectedCountry.currencySymbol : tx.currency}
                    </td>
                    <td className={`px-6 py-4 text-xs text-slate-400 font-mono ${isAr ? 'text-right' : 'text-left'}`}>
                      {new Date(tx.date).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(tx.status)}`}>
                        {tx.status === 'success' && t.success}
                        {tx.status === 'pending' && t.pending}
                        {tx.status === 'failed' && t.failed}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Receipt Modal overlay */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-6 relative">
            <button
              onClick={() => setSelectedTx(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Receipt layout */}
            <div className="text-center space-y-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="mx-auto w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-md font-bold text-slate-900 dark:text-white">{t.receiptTitle}</h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">{selectedTx.id}</p>
            </div>

            {/* Financial Details */}
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex justify-between font-bold text-base bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <span>{isAr ? 'المبلغ الإجمالي:' : 'Total Amount:'}</span>
                <span className={(selectedTx.type === 'withdraw' || selectedTx.type === 'transfer') ? 'text-red-500' : 'text-emerald-500'}>
                  {(selectedTx.type === 'withdraw' || selectedTx.type === 'transfer') ? '-' : '+'}{selectedTx.amount.toLocaleString()} {isAr ? selectedCountry.currencySymbol : selectedTx.currency}
                </span>
              </div>

              {selectedTx.points && (
                <div className="flex justify-between">
                  <span>{isAr ? 'عدد النقاط المحتسبة:' : 'Points Factored:'}</span>
                  <span className="font-mono text-xs">{selectedTx.points.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>{isAr ? 'طريقة / وسيلة المعاملة:' : 'Transaction Method:'}</span>
                <span className="font-semibold text-slate-900 dark:text-white text-xs">
                  {selectedTx.type === 'sync' && (isAr ? 'مزامنة نقاط' : 'Sync')}
                  {selectedTx.type === 'convert' && (isAr ? 'تحويل نقاط' : 'Points Cashout')}
                  {selectedTx.type === 'transfer' && (isAr ? 'تحويل مالي دولي 💸' : 'Global Money Transfer 💸')}
                  {selectedTx.type === 'withdraw' && (
                    <>
                      {isAr ? 'سحب أو دفع مباشر' : 'Debit/Withdrawal'} ({
                        selectedTx.walletType === 'zain_cash' ? (isAr ? 'زين كاش' : 'Zain Cash') :
                        selectedTx.walletType === 'qi_card' ? (isAr ? 'كي كارد' : 'Qi Card') :
                        selectedTx.walletType === 'vodafone_cash' ? (isAr ? 'فودافون كاش' : 'Vodafone Cash') :
                        selectedTx.walletType === 'stc_pay' ? (isAr ? 'إس تي سي باي' : 'STC Pay') :
                        selectedTx.walletType === 'usdt_trc20' ? 'USDT (TRC-20)' :
                        selectedTx.walletType === 'asiapay' ? (isAr ? 'آسيا باي' : 'AsiaPay') :
                        selectedTx.walletType === 'fastpay' ? (isAr ? 'فاست باي' : 'FastPay') :
                        selectedTx.walletType === 'paypal' ? 'PayPal' :
                        selectedTx.walletType === 'payeer' ? 'Payeer' :
                        selectedTx.walletType === 'bank_transfer' ? (isAr ? 'تحويل بنكي' : 'Bank Transfer') :
                        selectedTx.walletType === 'flight_booking' ? (isAr ? 'حجز تذكرة طيران ✈️' : 'Flight Ticket Booking ✈️') :
                        selectedTx.walletType
                      })
                    </>
                  )}
                </span>
              </div>

              {selectedTx.type === 'transfer' && (
                <div className="space-y-2 border border-slate-100 dark:border-slate-800/80 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 text-xs">
                  <div className="flex justify-between">
                    <span>{isAr ? 'المستلم:' : 'Recipient:'}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedTx.recipientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{isAr ? 'بلد المستلم:' : 'Recipient Country:'}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedTx.recipientCountry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{isAr ? 'المستلم يستلم بالكامل:' : 'Recipient Receives:'}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {selectedTx.recipientAmount?.toLocaleString()} {selectedTx.recipientCurrency}
                    </span>
                  </div>
                  {selectedTx.feeUsd !== undefined && (
                    <div className="flex justify-between">
                      <span>{isAr ? 'الرسوم الإدارية:' : 'Admin Fees:'}</span>
                      <span className="font-mono text-slate-500">${selectedTx.feeUsd.toFixed(2)} USD</span>
                    </div>
                  )}
                </div>
              )}

              {selectedTx.walletDetails && (
                <div className="flex justify-between">
                  <span>{isAr ? 'تفاصيل الحساب المستهدف:' : 'Destination Details:'}</span>
                  <span className="font-mono text-xs">{selectedTx.walletDetails}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>{t.dateLabel}</span>
                <span className="font-mono text-xs">
                  {new Date(selectedTx.date).toLocaleString(isAr ? 'ar-EG' : 'en-US')}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span>{t.statusLabel}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyle(selectedTx.status)}`}>
                  {selectedTx.status === 'success' && t.success}
                  {selectedTx.status === 'pending' && t.pending}
                  {selectedTx.status === 'failed' && t.failed}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed text-center border-t border-slate-100 dark:border-slate-800 pt-3">
              {t.receiptDesc}
            </p>

            {/* Print/Download Trigger Button */}
            <div className="space-y-2">
              <button
                type="button"
                disabled={generatingPdf}
                onClick={() => handleDownloadPdf(selectedTx)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-99 cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>{generatingPdf ? t.pdfGenerating : t.printBtn}</span>
              </button>
              {downloadSuccess && (
                <p className="text-[11px] text-emerald-500 font-bold text-center animate-bounce">
                  {t.pdfSuccess}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
