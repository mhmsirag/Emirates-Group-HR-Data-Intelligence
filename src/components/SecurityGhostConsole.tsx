import React from 'react';
import {
  ShieldAlert,
  AlertOctagon,
  Radio,
  Coins,
  CheckCircle,
  Clock,
  ArrowRight,
  ChevronRight,
  Plane,
  Building2,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { DisparityIssue } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface SecurityGhostConsoleProps {
  issues: DisparityIssue[];
  onOpenStewardModal: (issue: DisparityIssue) => void;
  onSelectIssueForLineage: (issue: DisparityIssue) => void;
}

export const SecurityGhostConsole: React.FC<SecurityGhostConsoleProps> = ({
  issues,
  onOpenStewardModal,
  onSelectIssueForLineage,
}) => {
  const { t, locale, isRtl } = useLanguage();
  const ghostIssues = issues.filter((i) => i.category === 'SECURITY_GHOST');

  const airsideGhosts = ghostIssues.filter((i) =>
    i.current_values.some((v) => v.source_system === 'access_directory.csv')
  );

  const payrollGhosts = ghostIssues.filter((i) =>
    i.current_values.some((v) => v.source_system === 'payroll.csv')
  );

  const dualGhosts = ghostIssues.filter(
    (i) =>
      i.current_values.some((v) => v.source_system === 'access_directory.csv') &&
      i.current_values.some((v) => v.source_system === 'payroll.csv')
  );

  const totalFinancialLeak = ghostIssues.reduce(
    (acc, curr) => acc + (curr.downstream_impact.financial_exposure_aed || 0),
    0
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-950 p-6 rounded-xl border border-red-900/60 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-mono text-red-400 font-bold tracking-wider uppercase">
              <AlertOctagon className="w-4 h-4 text-red-500 animate-pulse" />
              <span>Specialized Detection Routine · Severity = 5 Priority</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {t.ghostConsoleTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {t.ghostConsoleSub}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <div className="bg-slate-950/80 border border-red-800/60 px-3.5 py-2 rounded-lg text-start">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">{t.criticalGhostsCount}</span>
              <span className="text-2xl font-mono font-bold text-red-400 tabular-nums">
                {ghostIssues.length}
              </span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 px-3.5 py-2 rounded-lg text-start">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">{t.annualWageLeak}</span>
              <span className="text-xl font-mono font-bold text-amber-300 tabular-nums">
                AED {(totalFinancialLeak / 1000).toFixed(0)}k
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Routine Detection KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Plane className="w-3.5 h-3.5 text-red-400" />
              <span>{t.airsideGhostsTitle}</span>
            </span>
            <span className="font-mono text-red-400 font-bold">{airsideGhosts.length}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {t.airsideGhostsDesc}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.payrollGhostsTitle}</span>
            </span>
            <span className="font-mono text-amber-300 font-bold">{payrollGhosts.length}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {t.payrollGhostsDesc}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              <span>{t.dualGhostsTitle}</span>
            </span>
            <span className="font-mono text-purple-300 font-bold">{dualGhosts.length}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {t.dualGhostsDesc}
          </p>
        </div>
      </div>

      {/* Active Ghost Anomaly Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">
            {locale === 'ar' ? `حسابات أشباح الأمان المرصودة (${ghostIssues.length})` : `Detected Security Ghost Anomalies (${ghostIssues.length})`}
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Severity = 5 · core_hr.csv
          </span>
        </div>

        {ghostIssues.map((ghost) => (
          <div
            key={ghost.issue_id}
            className="bg-slate-900/80 rounded-xl border border-red-900/40 p-5 space-y-4 hover:border-red-700/60 transition-all shadow-sm"
          >
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 font-mono text-[10px] font-bold border border-red-800/60">
                    SEVERITY 5 · {ghost.priority}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-300">{ghost.issue_id}</span>
                  <span className="text-slate-600">·</span>
                  <span className="font-mono text-xs text-red-400">{ghost.geid}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs font-bold text-white">{ghost.employee_name}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {locale === 'ar' ? 'القطاع: ' : 'Division: '}
                  <span className="text-slate-300">{ghost.department}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className="text-start mr-2 hidden sm:block">
                  <span className="text-[10px] text-slate-400 font-mono block">Impact Score</span>
                  <span className="text-base font-mono font-bold text-red-400 tabular-nums">
                    {ghost.impact_score.toFixed(1)} / 100
                  </span>
                </div>
                <button
                  onClick={() => onSelectIssueForLineage(ghost)}
                  className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors"
                >
                  {t.navLineage}
                </button>
                <button
                  onClick={() => onOpenStewardModal(ghost)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-red-700 hover:bg-red-600 rounded-md transition-colors shadow-sm"
                >
                  {t.reviewBtn}
                </button>
              </div>
            </div>

            {/* Risk & Explanation */}
            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
              <span className="text-[10px] uppercase font-mono font-bold text-red-400 tracking-wider block">
                {t.riskAssessmentTitle}
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">{ghost.explanation}</p>
            </div>

            {/* Conflicting Status Comparison Table */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider block">
                {t.conflictingStatusTitle}
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {ghost.current_values.map((val, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400">{val.source_system}</span>
                      <span
                        className={
                          val.system_trust_level === 'PRIMARY'
                            ? 'text-emerald-400 font-semibold'
                            : 'text-amber-400'
                        }
                      >
                        {val.system_trust_level}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 font-sans">
                      {val.field_name}:
                    </div>
                    <div className="text-xs font-mono font-bold text-white">
                      {String(val.value)}
                    </div>
                    {val.last_modified_timestamp && (
                      <div className="text-[10px] text-slate-500 font-mono pt-0.5">
                        Modified: {val.last_modified_timestamp}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Proposed Fix & Stewardship Requirement */}
            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="space-y-0.5">
                <span className="font-semibold text-emerald-300">
                  {t.targetFixTitle}
                </span>
                <div className="font-mono text-slate-200 text-xs">
                  Set <code className="text-emerald-400 font-bold">{ghost.suggested_fix.target_field}</code> ➔{' '}
                  <code className="text-amber-300 font-bold">"{String(ghost.suggested_fix.proposed_value)}"</code>
                </div>
              </div>
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>{t.stewardSignOffReq}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
