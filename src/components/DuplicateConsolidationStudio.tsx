import React, { useState } from 'react';
import {
  Copy,
  Layers,
  ArrowRight,
  GitMerge,
  ShieldCheck,
  CheckCircle,
  Clock,
  ChevronRight,
  Sparkles,
  FileCheck2,
} from 'lucide-react';
import { DisparityIssue } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface DuplicateConsolidationStudioProps {
  issues: DisparityIssue[];
  onOpenStewardModal: (issue: DisparityIssue) => void;
  onSelectIssueForLineage: (issue: DisparityIssue) => void;
}

export const DuplicateConsolidationStudio: React.FC<DuplicateConsolidationStudioProps> = ({
  issues,
  onOpenStewardModal,
  onSelectIssueForLineage,
}) => {
  const { t, locale, isRtl } = useLanguage();
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'core_hr.csv' | 'payroll.csv' | 'access_directory.csv'>('ALL');

  const duplicateIssues = issues.filter((i) => i.category === 'DUPLICATE');

  const filteredDuplicates = duplicateIssues.filter((dup) => {
    if (sourceFilter === 'ALL') return true;
    return dup.suggested_fix.governing_source === sourceFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-slate-950 p-6 rounded-xl border border-blue-900/60 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-mono text-blue-400 font-bold tracking-wider uppercase">
              <GitMerge className="w-4 h-4 text-blue-400" />
              <span>Specialized Detection Routine · Entity Consolidation</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {t.duplicateStudioTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {t.duplicateStudioSub}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-slate-950/80 border border-blue-800/60 px-4 py-2 rounded-lg text-start">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">{t.detectedDuplicatesCount}</span>
              <span className="text-2xl font-mono font-bold text-blue-300 tabular-nums">
                {duplicateIssues.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Source System Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {[
            { id: 'ALL', label: t.allCategories, count: duplicateIssues.length },
            {
              id: 'core_hr.csv',
              label: 'core_hr.csv',
              count: duplicateIssues.filter((d) => d.suggested_fix.governing_source === 'core_hr.csv').length,
            },
            {
              id: 'payroll.csv',
              label: 'payroll.csv',
              count: duplicateIssues.filter((d) => d.suggested_fix.governing_source === 'payroll.csv').length,
            },
            {
              id: 'access_directory.csv',
              label: 'access_directory.csv',
              count: duplicateIssues.filter((d) => d.suggested_fix.governing_source === 'access_directory.csv').length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSourceFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors ${
                sourceFilter === tab.id
                  ? 'bg-blue-900/60 text-blue-200 border border-blue-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 font-mono">
          {t.tieBreakerNotice}
        </span>
      </div>

      {/* Duplicate Cards */}
      <div className="space-y-5">
        {filteredDuplicates.map((dup) => (
          <div
            key={dup.issue_id}
            className="bg-slate-900/70 rounded-xl border border-blue-900/40 p-5 space-y-4 hover:border-blue-700/60 transition-all shadow-sm"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-mono text-[10px] font-bold border border-blue-800/60">
                    DUPLICATE · {dup.priority}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-300">{dup.issue_id}</span>
                  <span className="text-slate-600">·</span>
                  <span className="font-mono text-xs text-blue-400 font-bold">{dup.geid}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs font-bold text-white">{dup.employee_name}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {locale === 'ar' ? 'المصدر: ' : 'Source: '}
                  <span className="text-blue-300 font-mono">{dup.suggested_fix.governing_source}</span>
                  {' · '}
                  {locale === 'ar' ? 'القطاع: ' : 'Division: '}
                  <span className="text-slate-300">{dup.department}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className="text-start mr-2 hidden sm:block">
                  <span className="text-[10px] text-slate-400 font-mono block">Impact Score</span>
                  <span className="text-base font-mono font-bold text-amber-400 tabular-nums">
                    {dup.impact_score.toFixed(1)} / 100
                  </span>
                </div>
                <button
                  onClick={() => onSelectIssueForLineage(dup)}
                  className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors"
                >
                  {t.navLineage}
                </button>
                <button
                  onClick={() => onOpenStewardModal(dup)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-red-700 hover:bg-red-600 rounded-md transition-colors shadow-sm"
                >
                  {t.approveConsolidationBtn}
                </button>
              </div>
            </div>

            {/* Explanation */}
            <p className="text-xs text-slate-200 leading-relaxed">{dup.explanation}</p>

            {/* Candidate Records Comparison Grid */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider block">
                {t.candidateRecordsTitle} ({dup.current_values.length}):
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dup.current_values.map((cand, idx) => {
                  const isAuthoritativeWinner =
                    cand.record_id === String(dup.suggested_fix.proposed_value);
                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-lg border transition-all ${
                        isAuthoritativeWinner
                          ? 'bg-blue-950/30 border-blue-600/70 shadow-sm'
                          : 'bg-slate-950/80 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white text-xs">
                            {locale === 'ar' ? 'السجل: ' : 'Record: '} {cand.record_id}
                          </span>
                          {isAuthoritativeWinner && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-mono text-[9px] font-bold">
                              {t.survivingMasterBadge}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {cand.source_system}
                        </span>
                      </div>
                      <div className="font-mono text-[11px] text-slate-300 bg-slate-900/80 p-2 rounded border border-slate-800/80">
                        {String(cand.value)}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-2">
                        <span>Timestamp: {cand.last_modified_timestamp || 'N/A'}</span>
                        <span className={isAuthoritativeWinner ? 'text-emerald-400' : 'text-slate-400'}>
                          {isAuthoritativeWinner ? t.tieBreakerMostRecent : t.actionMergeArchive}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Proposed Consolidation Strategy */}
            <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-emerald-300">
                  {t.recConsolidationTitle}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  Confidence: {(dup.suggested_fix.confidence_score * 100).toFixed(0)}%
                </span>
              </div>
              <div className="text-slate-200 text-xs">
                {dup.suggested_fix.source_rationale}
              </div>
              <div className="pt-1 text-[11px] text-slate-400 font-mono flex items-center justify-between flex-wrap gap-2">
                <span>
                  {t.targetAction}{' '}
                  <code className="text-emerald-300 font-bold">
                    Retain {dup.suggested_fix.proposed_value}
                  </code>
                </span>
                <span className="text-amber-400">{t.stewardSignOffReq}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
