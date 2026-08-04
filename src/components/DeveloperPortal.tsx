import React, { useState } from 'react';
import { Code, Copy, Check, Send, Terminal, Link2, Sparkles } from 'lucide-react';

interface DeveloperPortalProps {
  lang: 'ar' | 'en';
  onTriggerWebhook: (appName: string, points: number) => void;
}

export default function DeveloperPortal({
  lang,
  onTriggerWebhook
}: DeveloperPortalProps) {
  const isAr = lang === 'ar';
  
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  
  // Sandbox Simulator State
  const [appName, setAppName] = useState('My Custom App');
  const [pointsToSend, setPointsToSend] = useState('500');
  const [sendingWebhook, setSendingWebhook] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  const webhookToken = 'usr_token_kaskala_9103x';
  const apiEndpoint = 'https://ais-dev-ih25wfe25bbe4otr3nr5li-380915066888.europe-west2.run.app/api/webhooks/points';

  const curlCommand = `curl -X POST "${apiEndpoint}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${webhookToken}" \\
  -d '{
    "platform": "${appName}",
    "points": ${pointsToSend},
    "action": "add_reward"
  }'`;

  const handleCopyToken = () => {
    navigator.clipboard.writeText(webhookToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleTestWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    const points = parseInt(pointsToSend) || 0;
    if (points <= 0) return;

    setSendingWebhook(true);
    setTerminalLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] > Initializing HTTP POST to ${apiEndpoint}...`,
      `[${new Date().toLocaleTimeString()}] > Header: Authorization: Bearer ${webhookToken.substring(0, 10)}...`,
      `[${new Date().toLocaleTimeString()}] > Body: { platform: "${appName}", points: ${points} }`
    ]);

    setTimeout(() => {
      onTriggerWebhook(appName, points);
      setTerminalLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] < Received response status: 200 OK`,
        `[${new Date().toLocaleTimeString()}] < Response: { success: true, platform_synced: "${appName}", points_added: ${points}, message: "Balance updated successfully" }`,
        `[${new Date().toLocaleTimeString()}] 🎉 Success! Go check your Dashboard or Linked Accounts to see the new points!`
      ]);
      setSendingWebhook(false);
    }, 1500);
  };

  const clearLogs = () => {
    setTerminalLogs([]);
  };

  const t = {
    title: isAr ? 'بوابة المطورين والربط البرمجي' : 'Developer Portal & API Webhooks',
    subtitle: isAr ? 'اربط أي موقع أو تطبيق خاص بك برمجياً لإرسال النقاط تلقائيًا للمنصة عبر الـ Webhook' : 'Integrate your custom website or app programmatically to push points automatically via Webhooks',
    desc: isAr ? 'توفر المنصة واجهة برمجية آمنة (API) تتيح لك إرسال النقاط من أي لعبة، تطبيق، أو موقع تملكه إلى حسابك مباشرة، ليتم تحويلها لاحقًا إلى كاش.' : 'Our platform provides secure API hooks to stream points in real-time from any mobile game, web application, or custom dashboard you operate directly to your user wallet.',
    credentials: isAr ? 'بيانات الربط الخاصة بحسابك' : 'Your Unique Webhook Credentials',
    endpointLabel: isAr ? 'رابط الـ Webhook المستهدف (POST)' : 'Webhook Endpoint URL (POST)',
    tokenLabel: isAr ? 'رمز التفويض السري (Bearer Token)' : 'Secret Authorization Token (Bearer)',
    copyBtn: isAr ? 'نسخ' : 'Copy',
    copiedBtn: isAr ? 'تم النسخ!' : 'Copied!',
    curlTitle: isAr ? 'مثال على طلب الإرسال (cURL Command)' : 'Request Payload Example (cURL)',
    sandboxTitle: isAr ? 'لوحة محاكاة إرسال النقاط (صندوق الرمل)' : 'Interactive Webhook Playground (Sandbox)',
    sandboxDesc: isAr ? 'استخدم هذا النموذج لمحاكاة إرسال نقاط من موقعك الخارجي للمنصة مباشرة وتجربة سرعة المزامنة!' : 'Simulate sending reward points from your external platform right now and watch them sync in real-time!',
    appNameInput: isAr ? 'اسم موقعك أو تطبيقك الخارجي' : 'External Application Name',
    pointsInput: isAr ? 'النقاط المراد إرسالها' : 'Points to Disburse',
    triggerBtn: isAr ? 'إرسال طلب تجريبي (POST) 🚀' : 'Send Test Payload (POST) 🚀',
    sending: isAr ? 'جاري إرسال البيانات للـ Webhook...' : 'Sending request to endpoint...',
    consoleTitle: isAr ? 'شاشة مراقبة الاتصال البرمجي (Console Output)' : 'Developer Connection Console Log',
    clearBtn: isAr ? 'مسح السجل' : 'Clear',
    consolePlaceholder: isAr ? 'بانتظار إرسال طلب تجريبي لـ Webhooks...' : 'Waiting for mock requests or triggers...'
  };

  return (
    <div className="space-y-8">
      {/* Header and intro */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl text-white space-y-4">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Code className="w-6 h-6 text-indigo-400" />
          <span>{t.title}</span>
        </h1>
        <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
          {t.desc}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Connection Setup and curl */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-md font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Link2 className="w-5 h-5 text-indigo-500" />
              <span>{t.credentials}</span>
            </h2>

            {/* API Endpoint field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.endpointLabel}</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={apiEndpoint}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-left"
                />
              </div>
            </div>

            {/* Secret token field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.tokenLabel}</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  readOnly
                  value={webhookToken}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-left"
                />
                <button
                  type="button"
                  onClick={handleCopyToken}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copiedToken ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedToken ? t.copiedBtn : t.copyBtn}</span>
                </button>
              </div>
            </div>
          </div>

          {/* cURL Example */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.curlTitle}</h2>
              <button
                type="button"
                onClick={handleCopyCurl}
                className="text-xs text-indigo-500 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedCurl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCurl ? t.copiedBtn : t.copyBtn}</span>
              </button>
            </div>
            <pre className="bg-slate-950 text-slate-300 p-4 rounded-xl text-xs font-mono overflow-x-auto text-left leading-relaxed">
              {curlCommand}
            </pre>
          </div>
        </div>

        {/* Webhook Sandbox Playground */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h2 className="text-md font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
                <span>{t.sandboxTitle}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.sandboxDesc}</p>
            </div>

            <form onSubmit={handleTestWebhook} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.appNameInput}</label>
                  <input
                    type="text"
                    required
                    value={appName}
                    onChange={e => setAppName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-indigo-500 font-semibold"
                    placeholder="e.g. FitTrack Run"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.pointsInput}</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={pointsToSend}
                    onChange={e => setPointsToSend(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-indigo-500 font-mono font-semibold"
                    placeholder="e.g. 500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={sendingWebhook}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-99 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sendingWebhook ? t.sending : t.triggerBtn}</span>
              </button>
            </form>
          </div>

          {/* Terminal Console Logs */}
          <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 space-y-3 shadow-lg">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span>{t.consoleTitle}</span>
              </div>
              {terminalLogs.length > 0 && (
                <button
                  onClick={clearLogs}
                  className="text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {t.clearBtn}
                </button>
              )}
            </div>

            <div className="h-36 overflow-y-auto font-mono text-xs text-indigo-300 space-y-1 text-left scrollbar-thin scrollbar-thumb-slate-800">
              {terminalLogs.length === 0 ? (
                <div className="text-slate-600 italic text-center pt-8">
                  {t.consolePlaceholder}
                </div>
              ) : (
                terminalLogs.map((log, index) => (
                  <div key={index} className="leading-relaxed">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
