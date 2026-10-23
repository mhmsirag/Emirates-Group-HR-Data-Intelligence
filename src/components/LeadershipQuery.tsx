import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  ShieldCheck,
  Radio,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Database,
} from 'lucide-react';
import { DisparityIssue } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface LeadershipQueryProps {
  issues: DisparityIssue[];
  onSelectIssueForLineage: (issue: DisparityIssue) => void;
}

export const LeadershipQuery: React.FC<LeadershipQueryProps> = ({
  issues,
  onSelectIssueForLineage,
}) => {
  const { t, locale, isRtl } = useLanguage();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [sourceModel, setSourceModel] = useState<string | null>(null);

  const sampleQueries = [
    t.sampleQ1,
    t.sampleQ2,
    t.sampleQ3,
    t.sampleQ4,
  ];

  const handleRunQuery = async (questionText: string) => {
    if (!questionText.trim()) return;
    setIsLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText,
          issuesContext: issues,
          locale,
        }),
      });

      const data = await res.json();
      if (data.answer) {
        setResponse(data.answer);
        setSourceModel(data.source || 'gemini-3.8-flash');
      } else {
        setResponse(
          locale === 'ar'
            ? 'تعذر إنشاء الإجابة في الوقت الحالي. يرجى إعادة المحاولة.'
            : 'Unable to synthesize response. Please retry.'
        );
      }
    } catch (err) {
      console.error('Error fetching query response:', err);
      setResponse(
        locale === 'ar'
          ? 'تعذر الاتصال بمحرك الذكاء الاصطناعي مؤقتاً. السجلات المحلية الحتمية متاحة في قائمة الفرز والمعالجة.'
          : 'Engine service temporarily unreachable. Deterministic local records remain available in Triage Queue.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/70 p-5 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-950 border border-red-800/60 flex items-center justify-center text-red-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono text-red-400 font-semibold uppercase tracking-wider">
              {locale === 'ar' ? 'منظومة الاستشارة القيادية الذكية' : 'Executive AI Advisory Console'}
            </div>
            <h2 className="text-lg font-bold text-white">
              {t.leadershipAiTitle}
            </h2>
            <p className="text-xs text-slate-400">
              {t.leadershipAiSub}
            </p>
          </div>
        </div>
      </div>

      {/* Query Input Box */}
      <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRunQuery(query);
          }}
          className="relative"
        >
          <textarea
            rows={3}
            placeholder={t.queryPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`w-full p-4 ${isRtl ? 'pl-14 pr-4' : 'pr-14 pl-4'} bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-600 transition-colors leading-relaxed`}
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className={`absolute ${isRtl ? 'left-3' : 'right-3'} bottom-3 p-2 text-white bg-red-700 hover:bg-red-600 disabled:opacity-40 disabled:hover:bg-red-700 rounded-md transition-colors`}
          >
            <Send className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
        </form>

        {/* Quick Sample Query Chips */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
            {t.suggestedQueriesTitle}
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleQueries.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(sample);
                  handleRunQuery(sample);
                }}
                className="text-xs px-3 py-1.5 rounded-md bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors text-start"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Response Display Area */}
      {isLoading && (
        <div className="p-8 rounded-xl bg-slate-900/40 border border-slate-800 text-center space-y-3 animate-in fade-in">
          <div className="inline-block animate-spin text-red-500">
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="text-xs text-slate-400 font-mono">
            {locale === 'ar'
              ? 'جارٍ مطابقة الاستفسار عبر مصادر الموارد البشرية الأربعة وحساب نطاق التأثير...'
              : 'Grounding inquiry across 4 core sources and calculating lineage blast radius...'}
          </p>
        </div>
      )}

      {response && !isLoading && (
        <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-800 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-white">{t.groundedSynthesisTitle}</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-slate-400 text-[11px]">
              <span>{locale === 'ar' ? 'المحرك:' : 'Engine:'}</span>
              <span className="text-red-400">{sourceModel || 'Gemini 3.8 Flash'}</span>
            </div>
          </div>

          {/* Render formatted response */}
          <div className="prose prose-invert prose-xs max-w-none text-slate-200 text-xs sm:text-sm leading-relaxed space-y-3 whitespace-pre-line font-sans">
            {response}
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {t.queryGroundingNotice}
            </span>
            <span>{t.allFixesRequireSteward}</span>
          </div>
        </div>
      )}

      {/* Source Trust Transparency Guide */}
      <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800">
        <h3 className="text-xs font-mono font-semibold text-slate-300 uppercase mb-3">
          {locale === 'ar' ? 'ثوابت الاستناد وضوابط الحوكمة القيادية' : 'Grounding Invariants & Leadership Guardrails'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
            <div className="font-semibold text-slate-200 mb-1">
              {locale === 'ar' ? 'المرتبة 1: الموارد البشرية الأساسية (core_hr)' : 'Domain Rank 1: Core HR'}
            </div>
            <p className="text-[11px]">
              {locale === 'ar'
                ? 'المرجع الرسمي الوحيد للبيانات الشخصية وحالة التعيين وتواريخ إنهاء الخدمة والتوطين.'
                : 'Authoritative for demographics, contract status, and employment dates. Always overrides secondary directories for lifecycle events.'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
            <div className="font-semibold text-slate-200 mb-1">
              {locale === 'ar' ? 'المرتبة 2: الرواتب والأجور (payroll)' : 'Domain Rank 2: Payroll'}
            </div>
            <p className="text-[11px]">
              {locale === 'ar'
                ? 'المرجع الرسمي لدرجات التعويض الوظيفي وهياكل الرواتب والتحويلات البنكية واشتراكات هيئة المعاشات.'
                : 'Authoritative for grade levels, salary bands, and allowance codes. Reconciles variances before statutory pension reporting.'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
            <div className="font-semibold text-slate-200 mb-1">
              {locale === 'ar' ? 'المرتبة 3 و4: تصاريح المطار والتدريب (access & learning)' : 'Domain Rank 3 & 4: Access & Safety'}
            </div>
            <p className="text-[11px]">
              {locale === 'ar'
                ? 'تتحكم بحسابات تقنية المعلومات وتصاريح بوابات المطار وشهادات السلامة الجوية IOSA/GCAA.'
                : 'Authoritative for active directory status and IOSA flight certifications. Non-compliant safety status triggers operational roster grounding.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
