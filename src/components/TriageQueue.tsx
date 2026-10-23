import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Eye,
  GitFork,
  FileCheck,
  ChevronRight,
  Code2,
  CheckCircle,
  XCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { DisparityIssue, IssueCategory, PriorityLevel } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface TriageQueueProps {
  issues: DisparityIssue[];
  initialCategory?: string;
  initialPriority?: string;
  onSelectIssueForLineage: (issue: DisparityIssue) => void;
  onSelectIssueForSteward: (issue: DisparityIssue) => void;
  onViewSchemaJson: (issue: DisparityIssue) => void;
}

export const TriageQueue: React.FC<TriageQueueProps> = ({
  issues,
  initialCategory,
  initialPriority,
  onSelectIssueForLineage,
  onSelectIssueForSteward,
  onViewSchemaJson,
}) => {
  const { t, locale, isRtl } = useLanguage();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategory || 'ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>(initialPriority || 'ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');

  React.useEffect(() => {
    if (initialCategory) setCategoryFilter(initialCategory);
  }, [initialCategory]);

  React.useEffect(() => {
    if (initialPriority) setPriorityFilter(initialPriority);
  }, [initialPriority]);

  // Extract unique departments
  const departments = useMemo(() => {
    const set = new Set(issues.map((i) => i.department));
    return Array.from(set);
  }, [issues]);

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      // Search
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = issue.employee_name.toLowerCase().includes(query);
        const matchesGeid = issue.geid.toLowerCase().includes(query);
        const matchesId = issue.issue_id.toLowerCase().includes(query);
        const matchesExpl = issue.explanation.toLowerCase().includes(query);
        if (!matchesName && !matchesGeid && !matchesId && !matchesExpl) return false;
      }
      // Category
      if (categoryFilter !== 'ALL' && issue.category !== categoryFilter) return false;
      // Priority
      if (priorityFilter !== 'ALL' && issue.priority !== priorityFilter) return false;
      // Status
      if (statusFilter !== 'ALL' && issue.status !== statusFilter) return false;
      // Department
      if (selectedDepartment !== 'ALL' && issue.department !== selectedDepartment) return false;

      return true;
    });
  }, [issues, search, categoryFilter, priorityFilter, statusFilter, selectedDepartment]);

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case 'CRITICAL':
        return 'text-red-400 font-semibold';
      case 'HIGH':
        return 'text-amber-400 font-medium';
      case 'MEDIUM':
        return 'text-blue-400 font-medium';
      case 'LOW':
        return 'text-slate-400 font-normal';
    }
  };

  const getCategoryLabel = (cat: IssueCategory) => {
    switch (cat) {
      case 'SECURITY_GHOST':
        return t.catSecurityGhost;
      case 'CROSS_SYSTEM_MISMATCH':
        return t.catCrossMismatch;
      case 'DUPLICATE':
        return t.catDuplicate;
      case 'INVALID_CODE':
        return t.catInvalidCode;
      case 'TEMPORAL_PARADOX':
        return t.catTemporalParadox;
    }
  };

  const getPriorityLabel = (prio: PriorityLevel) => {
    switch (prio) {
      case 'CRITICAL':
        return t.prioCritical;
      case 'HIGH':
        return t.prioHigh;
      case 'MEDIUM':
        return t.prioMedium;
      case 'LOW':
        return t.prioLow;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return t.statApproved;
      case 'REJECTED':
        return t.statRejected;
      case 'OVERRIDDEN':
        return t.statOverridden;
      default:
        return t.statPending;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Filter Bar */}
      <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-2.5 w-4 h-4 text-slate-500`} />
            <input
              type="text"
              placeholder={t.filterSearchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full ${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-600 transition-colors`}
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>{t.showingCount}</span>
            <span className="font-mono font-bold text-white tabular-nums">
              {filteredIssues.length}
            </span>
            <span>{t.ofCount}</span>
            <span className="font-mono text-slate-300 tabular-nums">{issues.length}</span>
            <span>{t.disparitiesCount}</span>
          </div>
        </div>

        {/* Filter Chips & Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-800/60">
          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
              {t.filterCategory}
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-200 focus:outline-none focus:border-red-600"
            >
              <option value="ALL">{t.allCategories}</option>
              <option value="SECURITY_GHOST">{t.catSecurityGhost}</option>
              <option value="CROSS_SYSTEM_MISMATCH">{t.catCrossMismatch}</option>
              <option value="DUPLICATE">{t.catDuplicate}</option>
              <option value="INVALID_CODE">{t.catInvalidCode}</option>
              <option value="TEMPORAL_PARADOX">{t.catTemporalParadox}</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
              {t.filterPriority}
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-200 focus:outline-none focus:border-red-600"
            >
              <option value="ALL">{t.allPriorities}</option>
              <option value="CRITICAL">{t.prioCritical} (≥ 80)</option>
              <option value="HIGH">{t.prioHigh} (60 - 79)</option>
              <option value="MEDIUM">{t.prioMedium} (40 - 59)</option>
              <option value="LOW">{t.prioLow} (&lt; 40)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
              {t.filterDepartment}
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-200 focus:outline-none focus:border-red-600"
            >
              <option value="ALL">{t.allDivisions}</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
              {t.filterStatus}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-200 focus:outline-none focus:border-red-600"
            >
              <option value="ALL">{t.allStatuses}</option>
              <option value="PENDING_REVIEW">{t.statPending}</option>
              <option value="APPROVED">{t.statApproved}</option>
              <option value="REJECTED">{t.statRejected}</option>
              <option value="OVERRIDDEN">{t.statOverridden}</option>
            </select>
          </div>
        </div>
      </div>

      {/* High Density Disparity Table */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs text-slate-300">
            <thead className="bg-slate-950/90 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 w-28">{t.colScoreRank}</th>
                <th className="py-3 px-4 w-36">{t.colIssueCategory}</th>
                <th className="py-3 px-4 w-48">{t.colEmployeeGeid}</th>
                <th className="py-3 px-4 w-40">{t.colDepartment}</th>
                <th className="py-3 px-4 min-w-[260px]">{t.colDiscrepancyFix}</th>
                <th className="py-3 px-4 w-28">{t.colStatus}</th>
                <th className="py-3 px-4 text-end w-44">{t.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-normal">
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <p className="text-sm">{t.noDisparitiesFound}</p>
                    <button
                      onClick={() => {
                        setSearch('');
                        setCategoryFilter('ALL');
                        setPriorityFilter('ALL');
                        setStatusFilter('ALL');
                        setSelectedDepartment('ALL');
                      }}
                      className="mt-2 text-xs text-red-400 hover:underline"
                    >
                      {t.clearFilters}
                    </button>
                  </td>
                </tr>
              ) : (
                filteredIssues.map((issue) => (
                  <tr
                    key={issue.issue_id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Score / Rank */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-sm tabular-nums">
                          {issue.impact_score.toFixed(1)}
                        </span>
                        <span className={`text-[11px] ${getPriorityBadge(issue.priority)}`}>
                          {getPriorityLabel(issue.priority)}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {t.fanout} {issue.impact_factors?.downstream_fanout || 6}
                      </div>
                    </td>

                    {/* Issue ID & Category */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-slate-200 font-medium">{issue.issue_id}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {getCategoryLabel(issue.category)}
                      </div>
                    </td>

                    {/* Employee / GEID */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white group-hover:text-red-300 transition-colors">
                        {issue.employee_name}
                      </div>
                      <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                        {issue.geid}
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="truncate max-w-[140px]" title={issue.department}>
                        {issue.department}
                      </div>
                    </td>

                    {/* Explanation & Proposed Fix */}
                    <td className="py-3.5 px-4">
                      <p className="text-slate-300 line-clamp-2 leading-relaxed text-xs">
                        {issue.explanation}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400 flex-wrap">
                        <span className="text-slate-400">{t.proposedFix}</span>
                        <code className="bg-slate-950 px-1 py-0.5 rounded text-amber-300 font-mono text-[10px]">
                          {issue.suggested_fix.target_field} = "{String(issue.suggested_fix.proposed_value)}"
                        </code>
                        <span className="text-slate-400">{t.via}</span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {issue.suggested_fix.governing_source}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {issue.status === 'APPROVED' ? (
                        <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{t.statApproved}</span>
                        </div>
                      ) : issue.status === 'REJECTED' ? (
                        <div className="flex items-center gap-1 text-red-400 text-xs font-medium">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{t.statRejected}</span>
                        </div>
                      ) : issue.status === 'OVERRIDDEN' ? (
                        <div className="flex items-center gap-1 text-purple-400 text-xs font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{t.statOverridden}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-amber-300 text-xs font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{t.statPending}</span>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-end">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectIssueForLineage(issue)}
                          title="Trace downstream blast radius and affected systems"
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                        >
                          <GitFork className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onViewSchemaJson(issue)}
                          title="View exact Schema 1 JSON format"
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                        >
                          <Code2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSelectIssueForSteward(issue)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-red-700 hover:text-white rounded border border-slate-700 transition-colors flex items-center gap-1"
                        >
                          <span>{t.reviewBtn}</span>
                          <ChevronRight className={`w-3 h-3 ${isRtl ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
