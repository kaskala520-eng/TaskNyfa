import React, { useState, useEffect } from 'react';
import { Platform, CountryConfig } from '../types';
import { ArrowRightLeft, Sparkles, CheckCircle, AlertTriangle, Coins } from 'lucide-react';
import { formatCurrencyValue } from '../utils/currency';

interface ConversionHubProps {
  lang: 'ar' | 'en';
  platforms: Platform[];
  onConvertPoints: (platformId: string, points: number, cashAmount: number) => void;
  selectedCountry: CountryConfig;
}

export default function ConversionHub({
  lang,
  platforms,
  onConvertPoints,
  selectedCountry
}: ConversionHubProps) {
  const isAr = lang === 'ar';
  const activePlatforms = platforms.filter(p => p.connected && p.points > 0);

  const [selectedId, setSelectedId] = useState(activePlatforms[0]?.id || '');
  const [pointsInput, setPointsInput] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [successTx, setSuccessTx] = useState<{ id: string; points: number; cash: number } | null>(null);

  // Keep selected ID in sync if active platforms update
  useEffect(() => {
    if (!selectedId && activePlatforms.length > 0) {
      setSelectedId(activePlatforms[0].id);
    }
  }, [platforms]);

  const selectedPlatform = platforms.find(p => p.id === selectedId);
  const pointsMax = selectedPlatform?.points || 0;
  const exchangeRate = selectedPlatform?.rate || 100;
  
  // Calculate cash value
  const numPoints = parseInt(pointsInput) || 0;
  const calculatedCash = numPoints > 0 && exchangeRate > 0 ? numPoints * exchangeRate : 0;

  const handleConvert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || numPoints <= 0 || numPoints > pointsMax) return;

    setIsConverting(true);
    
    // Simulate smart secure conversion
    setTimeout(() => {
      onConvertPoints(selectedId, numPoints, calculatedCash);
      setSuccessTx({
        id: 'tx_conv_' + Math.floor(Math.random() * 900000 + 100000),
        points: numPoints,
        cash: calculatedCash
      });
      setIsConverting(false);
      setPointsInput('');
    }, 1500);
  };

  const handleSelectMax = () => {
    if (selectedPlatform) {
      setPointsInput(selectedPlatform.points.toString());
    }
  };

  const t = {
    title: isAr ? 'محول النقاط الذكي' : 'Smart Points Converter',
    subtitle: isAr ? 'حول رصيد نقاطك المتراكم إلى رصيد نقدي حقيقي فوري' : 'Convert accumulated points instantly into real spendable cash',
    selectPlatform: isAr ? 'اختر المنصة أو التطبيق' : 'Select Reward Platform',
    noActive: isAr ? 'لا توجد تطبيقات نشطة بها نقاط حاليًا. يرجى ربط حساب ومزامنته أولاً.' : 'No active platforms with points. Please link and sync an account first.',
    available: isAr ? 'النقاط المتاحة في هذا الحساب:' : 'Available points in this account:',
    pointsToConvert: isAr ? 'عدد النقاط المراد تحويلها' : 'Points to Convert',
    maxBtn: isAr ? 'الحد الأقصى' : 'MAX',
    rateInfo: isAr ? 'سعر صرف هذه المنصة:' : 'Platform rate:',
    rateDetail: isAr ? `${selectedCountry.currencySymbol} لكل نقطة` : `${selectedCountry.currencyCode} per point`,
    youReceive: isAr ? 'المبلغ الذي ستحصل عليه' : 'Cash You Will Receive',
    convertBtn: isAr ? 'تحويل النقاط الآن كاش ⚡' : 'Convert Points to Cash Now ⚡',
    converting: isAr ? 'جاري معالجة التحويل الآمن...' : 'Processing secure conversion...',
    limitError: isAr ? 'النقاط المدخلة تتجاوز رصيدك المتاح!' : 'Input points exceed your available balance!',
    zeroError: isAr ? 'يرجى إدخال عدد نقاط أكبر من الصفر' : 'Please enter a valid amount greater than zero',
    
    // Success Dialog
    successTitle: isAr ? 'تم التحويل بنجاح! 🎉' : 'Conversion Successful! 🎉',
    successMsg: isAr ? 'تم خصم النقاط وإيداع الرصيد النقدي في محفظتك الإلكترونية على المنصة بنجاح.' : 'Points subtracted and cash added to your internal balance successfully.',
    convertedLabel: isAr ? 'النقاط المحولة:' : 'Points Converted:',
    earnedLabel: isAr ? 'الكاش المضاف:' : 'Cash Deposited:',
    txIdLabel: isAr ? 'رقم العملية:' : 'Transaction ID:',
    closeBtn: isAr ? 'العودة للمحول' : 'Back to Converter',
    iqd: isAr ? selectedCountry.currencySymbol : selectedCountry.currencyCode
  };

  return (
    <div className="max-w-2xl mx-auto">
      {successTx ? (
        <div className="bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/60 p-8 rounded-3xl text-center space-y-6 shadow-xl animate-fade-in">
          <div className="mx-auto w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.successTitle}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t.successMsg}</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3 font-medium text-sm text-slate-700 dark:text-slate-300">
            <div className="flex justify-between">
              <span>{t.convertedLabel}</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400">
                {successTx.points.toLocaleString()} {isAr ? 'نقطة' : 'pts'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t.earnedLabel}</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 text-base font-bold">
                +{formatCurrencyValue(successTx.cash, selectedCountry.currencyCode)} {t.iqd}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-3 text-xs text-slate-400 font-mono">
              <span>{t.txIdLabel}</span>
              <span>{successTx.id}</span>
            </div>
          </div>

          <button
            onClick={() => setSuccessTx(null)}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl cursor-pointer"
          >
            {t.closeBtn}
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-md space-y-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5.5 h-5.5 text-indigo-500 animate-pulse" />
              <span>{t.title}</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t.subtitle}</p>
          </div>

          {activePlatforms.length === 0 ? (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-6 rounded-2xl text-center text-amber-800 dark:text-amber-400 space-y-3">
              <AlertTriangle className="w-10 h-10 mx-auto" />
              <p className="text-sm leading-relaxed">{t.noActive}</p>
            </div>
          ) : (
            <form onSubmit={handleConvert} className="space-y-6">
              {/* Select App */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t.selectPlatform}
                </label>
                <select
                  value={selectedId}
                  onChange={e => {
                    setSelectedId(e.target.value);
                    setPointsInput('');
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 font-semibold text-sm focus:outline-none focus:border-indigo-500"
                >
                  {activePlatforms.map(p => (
                    <option key={p.id} value={p.id}>
                      {isAr ? p.nameAr : p.name} ({p.points.toLocaleString()} {isAr ? 'نقطة' : 'pts'})
                    </option>
                  ))}
                </select>
                {selectedPlatform && (
                  <span className="text-xs text-slate-400 block mt-1">
                    {t.available} <strong className="text-indigo-600 dark:text-indigo-400 font-mono">{pointsMax.toLocaleString()}</strong> {isAr ? 'نقطة' : 'points'}
                  </span>
                )}
              </div>

              {/* Number of Points to convert with Quick Slider/Actions */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t.pointsToConvert}
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectMax}
                    className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    {t.maxBtn}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    required
                    min="1"
                    max={pointsMax}
                    value={pointsInput}
                    onChange={e => setPointsInput(e.target.value)}
                    className="w-full pl-4 pr-16 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-indigo-500 font-mono font-semibold"
                    placeholder={isAr ? 'مثال: 5000' : 'e.g. 5000'}
                  />
                  <div className={`absolute inset-y-0 ${isAr ? 'left-4' : 'right-4'} flex items-center pointer-events-none text-slate-400 text-xs font-semibold`}>
                    {isAr ? 'نقطة' : 'points'}
                  </div>
                </div>

                {/* Balance validation alert */}
                {numPoints > pointsMax && (
                  <span className="text-xs text-red-500 font-semibold flex items-center gap-1 mt-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{t.limitError}</span>
                  </span>
                )}
              </div>

              {/* Central exchange conversion indicator */}
              <div className="flex items-center justify-center gap-3 bg-slate-50 dark:bg-slate-950/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <Coins className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {t.rateInfo} <strong>{exchangeRate}</strong> {t.rateDetail}
                </span>
              </div>

              {/* Conversion Preview Card */}
              <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-950/40 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                    {t.youReceive}
                  </span>
                  <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                    {formatCurrencyValue(calculatedCash, selectedCountry.currencyCode)}
                  </span>
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 ml-1">
                    {t.iqd}
                  </span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-100 dark:border-slate-800">
                  <ArrowRightLeft className="w-6 h-6 text-indigo-500" />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isConverting || numPoints <= 0 || numPoints > pointsMax}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg hover:opacity-95 active:scale-99 transition-all cursor-pointer disabled:opacity-50"
              >
                {isConverting ? t.converting : t.convertBtn}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
