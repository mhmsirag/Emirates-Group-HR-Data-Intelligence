import React from 'react';
import {
  GitFork,
  Server,
  FileSpreadsheet,
  TrendingDown,
  Layers,
  ShieldCheck,
  Building,
  Radio,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { DisparityIssue } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface BlastRadiusViewProps {
  issues: DisparityIssue[];
  selectedIssueId?: string;
  onSelectIssue: (issue: DisparityIssue) => void;
  onOpenStewardModal: (issue: DisparityIssue) => void;
}

export const BlastRadiusView: React.FC<BlastRadiusViewProps> = ({
  issues,
  selectedIssueId,
  onSelectIssue,
  onOpenStewardModal,
}) => {
  const { t, locale, isRtl } = useLanguage();
  const currentIssue =
    issues.find((i) => i.issue_id === selectedIssueId) || issues[0] || null;

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Issue Selector */}
      <div className="bg-slate-900/70 p-5 rounded-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-red-400 font-semibold uppercase tracking-wider">
              {locale === 'ar' ? 'محرك شجرة التبعيات والروابط' : 'Lineage Dependency Engine'}
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              {t.lineageTitle}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {t.lineageSub}
            </p>
          </div>

          {/* Quick Issue Picker */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 whitespace-nowrap">{t.selectedEntityLabel}</label>
            <select
              value={currentIssue?.issue_id || ''}
              onChange={(e) => {
                const found = issues.find((i) => i.issue_id === e.target.value);
                if (found) onSelectIssue(found);
              }}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-white focus:outline-none focus:border-red-600 font-mono"
            >
              {issues.map((i) => (
                <option key={i.issue_id} value={i.issue_id}>
                  {i.issue_id} — {i.employee_name} ({i.category})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {currentIssue ? (
        <div className="space-y-6">
          {/* Active Context Card */}
          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-semibold text-red-400">
                    {currentIssue.issue_id}
                  </span>
                  <span className="text-xs text-slate-500">·</span>
                  <span className="font-mono text-xs text-slate-300">{currentIssue.geid}</span>
                  <span className="text-xs text-slate-500">·</span>
                  <span className="text-xs font-semibold text-white">
                    {currentIssue.employee_name}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{currentIssue.explanation}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-start">
                  <div className="text-[10px] text-slate-400 font-mono">Impact Score</div>
                  <div className="text-xl font-bold font-mono text-amber-400 tabular-nums">
                    {currentIssue.impact_score.toFixed(1)} / 100
                  </div>
                </div>
                <button
                  onClick={() => onOpenStewardModal(currentIssue)}
                  className="px-3 py-2 text-xs font-medium text-white bg-red-700 hover:bg-red-600 rounded-md transition-colors"
                >
                  {t.reviewBtn}
                </button>
              </div>
            </div>

            {/* Lineage Graph Visualizer */}
            <div className="pt-6">
              <div className="text-xs font-mono font-semibold uppercase text-slate-400 mb-4 tracking-wider">
                {locale === 'ar' ? 'رسم تخطيطي لتشعب التبعيات ونطاق التأثير' : 'Full-Graph Blast Radius & Dependency Lineage'}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                {/* Stage 1: Conflict Node */}
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                    <Radio className="w-4 h-4 text-red-400" />
                    <span>{t.conflictOriginTitle}</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    {currentIssue.current_values.map((v, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded bg-slate-900/80 border border-slate-800/80 space-y-0.5"
                      >
                        <div className="font-mono text-[10px] text-slate-400">
                          {v.source_system} ({v.record_id})
                        </div>
                        <div className="font-medium text-slate-200">
                          {v.field_name}:{' '}
                          <span className="text-amber-300 font-mono">
                            {String(v.value)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stage 2: Proposed Fix Node */}
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>{t.deterministicFixTitle}</span>
                  </div>
                  <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-900/40 space-y-1 text-xs">
                    <div className="text-[10px] text-emerald-400 font-mono">
                      Target: {currentIssue.suggested_fix.target_field}
                    </div>
                    <div className="font-bold text-emerald-200 text-sm font-mono">
                      "{String(currentIssue.suggested_fix.proposed_value)}"
                    </div>
                    <div className="text-[11px] text-slate-300 pt-1">
                      {currentIssue.suggested_fix.source_rationale}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 pt-1">
                      Confidence:{' '}
                      <span className="text-emerald-300 font-bold">
                        {(currentIssue.suggested_fix.confidence_score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stage 3: Direct Downstream Systems */}
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                    <Server className="w-4 h-4 text-blue-400" />
                    <span>
                      {t.affectedSystemsTitle} ({currentIssue.downstream_impact.affected_systems.length})
                    </span>
                  </div>
                  <ul className="space-y-1.5 text-xs">
                    {currentIssue.downstream_impact.affected_systems.map((sys, idx) => (
                      <li
                        key={idx}
                        className="p-1.5 rounded bg-slate-900/80 border border-slate-800 text-slate-300 flex items-center gap-1.5 text-[11px]"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span className="truncate">{sys}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Stage 4: Executive Reports & Delta */}
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                    <FileSpreadsheet className="w-4 h-4 text-purple-400" />
                    <span>{t.executiveReportsTitle}</span>
                  </div>
                  <ul className="space-y-1.5 text-xs">
                    {currentIssue.downstream_impact.affected_reports.map((rep, idx) => (
                      <li
                        key={idx}
                        className="p-1.5 rounded bg-slate-900/80 border border-slate-800 text-slate-300 flex items-center gap-1.5 text-[11px]"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        <span className="truncate">{rep}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Delta Preview Box */}
              <div className="mt-4 p-4 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.metricDeltaPreviewTitle}</span>
                </div>
                <div className="p-3 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-amber-300">
                  {currentIssue.downstream_impact.metric_delta_preview}
                </div>
                {currentIssue.downstream_impact.financial_exposure_aed && (
                  <div className="text-xs text-slate-400">
                    {t.financialExposureMitigation}{' '}
                    <span className="text-white font-mono font-semibold">
                      AED {currentIssue.downstream_impact.financial_exposure_aed.toLocaleString()}
                    </span>{' '}
                    {locale === 'ar' ? 'فارق سنوي متدارك.' : 'annualized variance.'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Aggregate Fanout Heatmap */}
          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
            <h3 className="text-sm font-semibold text-white mb-1">
              {t.topDownstreamExposures}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {locale === 'ar'
                ? 'الحالات التي يتشعب تناقضها إلى أكبر عدد من الأنظمة التنفيذية وملفات التدقيق الرقابي'
                : 'Entities whose unresolved disparity branches into the greatest number of downstream applications and regulatory filings'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {issues.slice(0, 3).map((iss) => (
                <div
                  key={iss.issue_id}
                  onClick={() => onSelectIssue(iss)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                    iss.issue_id === currentIssue.issue_id
                      ? 'bg-slate-900 border-red-700/80'
                      : 'bg-slate-950 hover:border-slate-700 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-red-400 font-semibold">{iss.issue_id}</span>
                    <span className="font-mono text-white font-bold">{iss.impact_score.toFixed(1)}</span>
                  </div>
                  <div className="font-semibold text-slate-200 text-xs truncate">
                    {iss.employee_name}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    {iss.downstream_impact.affected_systems.length} {locale === 'ar' ? 'أنظمة' : 'systems'} ·{' '}
                    {iss.downstream_impact.affected_reports.length} {locale === 'ar' ? 'تقارير' : 'reports'}
                  </div>
                  <div className="text-[11px] text-amber-400/90 truncate mt-1">
                    {iss.downstream_impact.metric_delta_preview}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/40 p-12 text-center rounded-xl border border-slate-800 text-slate-400">
          {locale === 'ar' ? 'لم يتم تحديد أي سجل للتناقض.' : 'No disparity issue selected.'}
        </div>
      )}
    </div>
  );
};
