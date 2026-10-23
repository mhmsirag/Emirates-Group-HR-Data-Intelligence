import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Coins,
  Scale,
  CheckCircle2,
  Database,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { DisparityIssue } from '../types';
import { SOURCE_TRUST_HIERARCHY } from '../data/data_dictionary';
import { useLanguage } from '../i18n/LanguageContext';

interface OverviewProps {
  issues: DisparityIssue[];
  totalGeidsCount: number;
  onNavigate: (tab: string, filter?: string) => void;
  auditCount: number;
}

export const Overview: React.FC<OverviewProps> = ({
  issues,
  totalGeidsCount,
  onNavigate,
  auditCount,
}) => {
  const { t, locale, isRtl } = useLanguage();

  const securityGhosts = issues.filter((i) => i.category === 'SECURITY_GHOST');
  const criticalIssues = issues.filter((i) => i.priority === 'CRITICAL');
  const highIssues = issues.filter((i) => i.priority === 'HIGH');
  const approvedIssues = issues.filter((i) => i.status === 'APPROVED');

  const totalFinancialExposure = issues.reduce(
    (acc, curr) => acc + (curr.downstream_impact.financial_exposure_aed || 0),
    0
  );

  const regulatoryIssues = issues.filter(
    (i) => (i.impact_factors?.regulatory_criticality || 0) >= 8
  );

  const categoryCounts = {
    SECURITY_GHOST: issues.filter((i) => i.category === 'SECURITY_GHOST').length,
    CROSS_SYSTEM_MISMATCH: issues.filter((i) => i.category === 'CROSS_SYSTEM_MISMATCH').length,
    DUPLICATE: issues.filter((i) => i.category === 'DUPLICATE').length,
    INVALID_CODE: issues.filter((i) => i.category === 'INVALID_CODE').length,
    TEMPORAL_PARADOX: issues.filter((i) => i.category === 'TEMPORAL_PARADOX').length,
  };

  const getSourceAuthorityTranslation = (source: string) => {
    if (locale === 'ar') {
      if (source === 'core_hr.csv') return 'المرجع الأساسي لبيانات الهوية والتعيين وتاريخ الخدمة والتوطين';
      if (source === 'payroll.csv') return 'المرجع الأساسي لهيكل الرواتب والدرجات والحسابات البنكية والبدلات';
      if (source === 'access_directory.csv') return 'المرجع الأساسي لحسابات الدليل وتصاريح بوابات ساحة المطار';
      if (source === 'learning.csv') return 'المرجع المساند لشهادات تدريب السلامة وكفاءات الطيران الجوي';
    }
    return '';
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Executive Intro Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 rounded-xl p-6 border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-2">
            <div className="text-xs font-mono text-red-400 font-semibold tracking-wider uppercase">
              {t.tagline}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {t.overviewTitle}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {t.overviewDesc}
            </p>
          </div>
          <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
            <button
              onClick={() => onNavigate('triage')}
              className="px-4 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-600 rounded-md transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <span>{t.reviewQueueBtn} ({issues.filter((i) => i.status === 'PENDING_REVIEW').length})</span>
              <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={() => onNavigate('query')}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <span>{t.askAiBtn}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stat Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/80 rounded-lg p-4 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">{t.entitiesAnalyzed}</div>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            {totalGeidsCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{t.entitiesAnalyzedSub}</div>
        </div>

        <div className="bg-slate-900/80 rounded-lg p-4 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">{t.activeDisparities}</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
            {issues.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {criticalIssues.length} {t.prioCritical} · {highIssues.length} {t.prioHigh}
          </div>
        </div>

        <div className="bg-slate-900/80 rounded-lg p-4 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">{t.securityGhostsKpi}</div>
          <div className="text-2xl font-bold font-mono text-red-400 mt-1 tabular-nums">
            {securityGhosts.length}
          </div>
          <div className="text-[11px] text-red-400/80 mt-1">{t.securityGhostsSub}</div>
        </div>

        <div className="bg-slate-900/80 rounded-lg p-4 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">{t.netFinancialExposure}</div>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            {totalFinancialExposure > 0
              ? `AED ${(totalFinancialExposure / 1000).toFixed(0)}k`
              : 'AED 0'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{t.netFinancialExposureSub}</div>
        </div>

        <div className="bg-slate-900/80 rounded-lg p-4 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">{t.regulatoryRisks}</div>
          <div className="text-2xl font-bold font-mono text-purple-400 mt-1 tabular-nums">
            {regulatoryIssues.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{t.regulatoryRisksSub}</div>
        </div>

        <div className="bg-slate-900/80 rounded-lg p-4 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">{t.stewardDecisions}</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            {approvedIssues.length + auditCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{t.stewardDecisionsSub}</div>
        </div>
      </div>

      {/* Main Grid: Issue Taxonomy & Trust Hierarchy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Issue Taxonomy & Impact Distribution */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-white">{t.taxonomyTitle}</h2>
                <p className="text-xs text-slate-400">{t.taxonomySubtitle}</p>
              </div>
              <button
                onClick={() => onNavigate('triage')}
                className="text-xs text-red-400 hover:text-red-300 font-medium flex items-center gap-1"
              >
                <span>{t.viewAll}</span>
                <ArrowRight className={`w-3 h-3 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <div className="space-y-3.5">
              {[
                {
                  id: 'SECURITY_GHOST',
                  label: t.catSecurityGhost,
                  count: categoryCounts.SECURITY_GHOST,
                  color: 'bg-red-500',
                  desc: t.catSecurityGhostDesc,
                  severity: 'Severity 5',
                },
                {
                  id: 'CROSS_SYSTEM_MISMATCH',
                  label: t.catCrossMismatch,
                  count: categoryCounts.CROSS_SYSTEM_MISMATCH,
                  color: 'bg-amber-500',
                  desc: t.catCrossMismatchDesc,
                  severity: 'Severity 3-4',
                },
                {
                  id: 'DUPLICATE',
                  label: t.catDuplicate,
                  count: categoryCounts.DUPLICATE,
                  color: 'bg-blue-500',
                  desc: t.catDuplicateDesc,
                  severity: 'Severity 3',
                },
                {
                  id: 'INVALID_CODE',
                  label: t.catInvalidCode,
                  count: categoryCounts.INVALID_CODE,
                  color: 'bg-purple-500',
                  desc: t.catInvalidCodeDesc,
                  severity: 'Severity 2',
                },
                {
                  id: 'TEMPORAL_PARADOX',
                  label: t.catTemporalParadox,
                  count: categoryCounts.TEMPORAL_PARADOX,
                  color: 'bg-pink-500',
                  desc: t.catTemporalParadoxDesc,
                  severity: 'Severity 3',
                },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'SECURITY_GHOST') onNavigate('security_ghosts');
                    else if (item.id === 'DUPLICATE') onNavigate('duplicates');
                    else onNavigate('triage', item.id);
                  }}
                  className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-200 group-hover:text-red-300 transition-colors">
                      {item.label}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-400 font-mono">{item.severity}</span>
                      <span className="font-mono font-bold text-white tabular-nums bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                        {item.count} {t.issuesCount}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{item.desc}</p>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full`}
                      style={{
                        width: `${issues.length > 0 ? (item.count / issues.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Business Impact Formula Card */}
          <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-800">
            <h2 className="text-sm font-semibold text-white mb-1">
              {t.formulaTitle}
            </h2>
            <p className="text-xs text-slate-400 mb-3">
              {t.formulaSubtitle}
            </p>

            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed" dir="ltr">
              <span className="text-red-400 font-semibold">Impact Score</span> = (
              <span className="text-amber-300 font-semibold">10</span> × Severity) + (
              <span className="text-emerald-300 font-semibold">2.5</span> × Financial Exposure) + (
              <span className="text-purple-300 font-semibold">2.5</span> × Regulatory Criticality) + (
              <span className="text-cyan-300 font-semibold">2.0</span> × Downstream Fanout)
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-[11px]">
              <div className="p-2 rounded bg-slate-950/40 border border-slate-800">
                <span className="text-slate-400 block">{t.formulaSeverity}</span>
                <span className="text-slate-200 font-medium">{t.formulaSeverityDesc}</span>
              </div>
              <div className="p-2 rounded bg-slate-950/40 border border-slate-800">
                <span className="text-slate-400 block">{t.formulaFinancial}</span>
                <span className="text-slate-200 font-medium">{t.formulaFinancialDesc}</span>
              </div>
              <div className="p-2 rounded bg-slate-950/40 border border-slate-800">
                <span className="text-slate-400 block">{t.formulaRegulatory}</span>
                <span className="text-slate-200 font-medium">{t.formulaRegulatoryDesc}</span>
              </div>
              <div className="p-2 rounded bg-slate-950/40 border border-slate-800">
                <span className="text-slate-400 block">{t.formulaFanout}</span>
                <span className="text-slate-200 font-medium">{t.formulaFanoutDesc}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Source Trust Hierarchy & Governance Rules */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-800">
            <h2 className="text-sm font-semibold text-white mb-1">
              {t.trustTitle}
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              {t.trustSubtitle}
            </p>

            <div className="space-y-3">
              {SOURCE_TRUST_HIERARCHY.map((item) => (
                <div
                  key={item.source}
                  className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center text-xs font-bold font-mono shrink-0">
                    {item.rank}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-white">
                        {item.source}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {t.weight} {item.domain_weight}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-normal">
                      {t.primaryAuthorityFor}{' '}
                      <span className="text-slate-400">
                        {locale === 'ar' ? getSourceAuthorityTranslation(item.source) : item.authority_scope.join(', ')}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-lg bg-slate-950/50 border border-slate-800 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-200">{t.tieBreakerRuleTitle}</span>
              {t.tieBreakerRuleDesc}
            </div>
          </div>

          {/* Responsible AI & Steward Guardrails */}
          <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>{t.guardrailsTitle}</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">1.</span>
                <span>
                  <strong>{t.guardrail1Title}</strong> {t.guardrail1Desc}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">2.</span>
                <span>
                  <strong>{t.guardrail2Title}</strong> {t.guardrail2Desc}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">3.</span>
                <span>
                  <strong>{t.guardrail3Title}</strong> {t.guardrail3Desc}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
