import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Coins,
  ShieldAlert,
  GitFork,
  Radio,
  FileCheck2,
  Download,
  Filter,
  Layers,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Database,
  Building2,
  CheckCircle2,
  Plane,
  Scale,
  Users,
} from 'lucide-react';
import { DisparityIssue, PriorityLevel, IssueCategory } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface AnalyticsViewProps {
  issues: DisparityIssue[];
  totalGeidsCount: number;
  auditCount: number;
  onNavigateToTriage: (categoryFilter?: string, priorityFilter?: string) => void;
  onSelectIssueForLineage: (issue: DisparityIssue) => void;
  onSelectIssueForSteward: (issue: DisparityIssue) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  issues,
  totalGeidsCount,
  auditCount,
  onNavigateToTriage,
  onSelectIssueForLineage,
  onSelectIssueForSteward,
}) => {
  const { t, locale, isRtl } = useLanguage();

  // Filters state
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [activeHistogramBucket, setActiveHistogramBucket] = useState<string | null>(null);
  const [hoveredDonutSlice, setHoveredDonutSlice] = useState<IssueCategory | null>(null);
  const [selectedScatterPoint, setSelectedScatterPoint] = useState<DisparityIssue | null>(null);

  // Filtered issues based on division and priority
  const filteredIssues = useMemo(() => {
    return issues.filter((iss) => {
      const matchDivision = selectedDivision === 'ALL' || iss.department === selectedDivision;
      const matchPriority = selectedPriority === 'ALL' || iss.priority === selectedPriority;
      return matchDivision && matchPriority;
    });
  }, [issues, selectedDivision, selectedPriority]);

  // Unique divisions list
  const divisions = useMemo(() => {
    const set = new Set<string>();
    issues.forEach((i) => {
      if (i.department) set.add(i.department);
    });
    return Array.from(set).sort();
  }, [issues]);

  // Aggregate Metrics
  const totalFinancialExposure = useMemo(() => {
    return filteredIssues.reduce(
      (sum, i) => sum + (i.downstream_impact.financial_exposure_aed || 0),
      0
    );
  }, [filteredIssues]);

  const resolvedIssues = useMemo(() => {
    return issues.filter((i) => i.status === 'APPROVED');
  }, [issues]);

  const mitigatedExposure = useMemo(() => {
    return resolvedIssues.reduce(
      (sum, i) => sum + (i.downstream_impact.financial_exposure_aed || 0),
      0
    );
  }, [resolvedIssues]);

  const avgBisScore = useMemo(() => {
    if (filteredIssues.length === 0) return 0;
    const total = filteredIssues.reduce((sum, i) => sum + i.impact_score, 0);
    return Number((total / filteredIssues.length).toFixed(1));
  }, [filteredIssues]);

  const avgFanout = useMemo(() => {
    if (filteredIssues.length === 0) return 0;
    const total = filteredIssues.reduce(
      (sum, i) =>
        sum +
        (i.downstream_impact.affected_systems.length +
          i.downstream_impact.affected_reports.length),
      0
    );
    return Number((total / filteredIssues.length).toFixed(1));
  }, [filteredIssues]);

  const criticalAndHighCount = useMemo(() => {
    return filteredIssues.filter((i) => i.priority === 'CRITICAL' || i.priority === 'HIGH').length;
  }, [filteredIssues]);

  // 1. Histogram Data (BIS score buckets: 0-25, 26-50, 51-75, 76-100)
  const histogramBuckets = useMemo(() => {
    const buckets = [
      {
        id: 'LOW',
        label: locale === 'ar' ? 'منخفض (0 - 25)' : 'Low (0 - 25)',
        range: [0, 25],
        color: 'from-emerald-600 to-emerald-400',
        borderColor: 'border-emerald-500/40',
        textColor: 'text-emerald-400',
        bgColor: 'bg-emerald-950/40',
        items: [] as DisparityIssue[],
      },
      {
        id: 'MEDIUM',
        label: locale === 'ar' ? 'متوسط (26 - 50)' : 'Medium (26 - 50)',
        range: [26, 50],
        color: 'from-yellow-600 to-yellow-400',
        borderColor: 'border-yellow-500/40',
        textColor: 'text-yellow-400',
        bgColor: 'bg-yellow-950/40',
        items: [] as DisparityIssue[],
      },
      {
        id: 'HIGH',
        label: locale === 'ar' ? 'مرتفع (51 - 75)' : 'High (51 - 75)',
        range: [51, 75],
        color: 'from-amber-600 to-amber-400',
        borderColor: 'border-amber-500/40',
        textColor: 'text-amber-400',
        bgColor: 'bg-amber-950/40',
        items: [] as DisparityIssue[],
      },
      {
        id: 'CRITICAL',
        label: locale === 'ar' ? 'حرج للغاية (76 - 100)' : 'Critical (76 - 100)',
        range: [76, 100],
        color: 'from-red-600 to-red-400',
        borderColor: 'border-red-500/50',
        textColor: 'text-red-400',
        bgColor: 'bg-red-950/40',
        items: [] as DisparityIssue[],
      },
    ];

    filteredIssues.forEach((issue) => {
      const score = issue.impact_score;
      if (score <= 25) buckets[0].items.push(issue);
      else if (score <= 50) buckets[1].items.push(issue);
      else if (score <= 75) buckets[2].items.push(issue);
      else buckets[3].items.push(issue);
    });

    return buckets;
  }, [filteredIssues, locale]);

  // Max bucket count for relative height
  const maxBucketCount = Math.max(1, ...histogramBuckets.map((b) => b.items.length));

  // 2. Division Breakdown (Exposure & Count)
  const divisionBreakdown = useMemo(() => {
    const map = new Map<
      string,
      {
        division: string;
        count: number;
        exposure: number;
        criticalCount: number;
        ghostCount: number;
      }
    >();

    filteredIssues.forEach((iss) => {
      const div = iss.department || 'Emirates Group';
      if (!map.has(div)) {
        map.set(div, {
          division: div,
          count: 0,
          exposure: 0,
          criticalCount: 0,
          ghostCount: 0,
        });
      }
      const entry = map.get(div)!;
      entry.count += 1;
      entry.exposure += iss.downstream_impact.financial_exposure_aed || 0;
      if (iss.priority === 'CRITICAL') entry.criticalCount += 1;
      if (iss.category === 'SECURITY_GHOST') entry.ghostCount += 1;
    });

    return Array.from(map.values()).sort((a, b) => b.exposure - a.exposure);
  }, [filteredIssues]);

  const maxDivisionExposure = Math.max(1, ...divisionBreakdown.map((d) => d.exposure));

  // 3. Taxonomy breakdown for Donut Chart
  const taxonomyData = useMemo(() => {
    const categories: {
      category: IssueCategory;
      label: string;
      color: string;
      hex: string;
      count: number;
      exposure: number;
    }[] = [
      {
        category: 'SECURITY_GHOST',
        label: t.catSecurityGhost,
        color: 'text-red-400',
        hex: '#ef4444',
        count: 0,
        exposure: 0,
      },
      {
        category: 'CROSS_SYSTEM_MISMATCH',
        label: t.catCrossMismatch,
        color: 'text-amber-400',
        hex: '#f59e0b',
        count: 0,
        exposure: 0,
      },
      {
        category: 'DUPLICATE',
        label: t.catDuplicate,
        color: 'text-blue-400',
        hex: '#3b82f6',
        count: 0,
        exposure: 0,
      },
      {
        category: 'INVALID_CODE',
        label: t.catInvalidCode,
        color: 'text-purple-400',
        hex: '#a855f7',
        count: 0,
        exposure: 0,
      },
      {
        category: 'TEMPORAL_PARADOX',
        label: t.catTemporalParadox,
        color: 'text-emerald-400',
        hex: '#10b981',
        count: 0,
        exposure: 0,
      },
    ];

    filteredIssues.forEach((issue) => {
      const match = categories.find((c) => c.category === issue.category);
      if (match) {
        match.count += 1;
        match.exposure += issue.downstream_impact.financial_exposure_aed || 0;
      }
    });

    return categories;
  }, [filteredIssues, t]);

  // Donut chart path calculations
  const totalTaxonomyCount = filteredIssues.length || 1;
  let accumulatedAngle = 0;
  const donutSlices = taxonomyData.map((slice) => {
    const fraction = slice.count / totalTaxonomyCount;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + fraction * 360;
    accumulatedAngle = endAngle;

    return {
      ...slice,
      startAngle,
      endAngle,
      fraction,
    };
  });

  // 4. Source Conflict Heatmap (4x4 matrix)
  const systemMatrix = ['core_hr.csv', 'payroll.csv', 'access_directory.csv', 'learning.csv'] as const;

  const heatmapMatrix = useMemo(() => {
    const matrix: Record<string, Record<string, { count: number; issues: DisparityIssue[] }>> = {};

    systemMatrix.forEach((s1) => {
      matrix[s1] = {};
      systemMatrix.forEach((s2) => {
        matrix[s1][s2] = { count: 0, issues: [] };
      });
    });

    filteredIssues.forEach((issue) => {
      const sources = Array.from(new Set(issue.current_values.map((v) => v.source_system)));
      if (sources.length >= 2) {
        for (let i = 0; i < sources.length; i++) {
          for (let j = 0; j < sources.length; j++) {
            if (i !== j) {
              const s1 = sources[i] as string;
              const s2 = sources[j] as string;
              if (matrix[s1] && matrix[s1][s2]) {
                matrix[s1][s2].count += 1;
                matrix[s1][s2].issues.push(issue);
              }
            }
          }
        }
      } else if (sources.length === 1 && issue.category === 'DUPLICATE') {
        const s = sources[0] as string;
        if (matrix[s] && matrix[s][s]) {
          matrix[s][s].count += 1;
          matrix[s][s].issues.push(issue);
        }
      }
    });

    return matrix;
  }, [filteredIssues]);

  // 5. Downstream Fanout vs Severity Scatter Points
  const scatterPoints = useMemo(() => {
    return filteredIssues.map((issue) => {
      const fanout =
        issue.impact_factors?.downstream_fanout ||
        issue.downstream_impact.affected_systems.length +
          issue.downstream_impact.affected_reports.length ||
        4;
      const severity = issue.impact_factors?.severity || (issue.category === 'SECURITY_GHOST' ? 5 : 3);
      const exposure = issue.downstream_impact.financial_exposure_aed || 0;

      // Classify quadrant
      let quadrant: 'Q1' | 'Q2' | 'Q3' | 'Q4' = 'Q4';
      if (severity >= 4 && fanout >= 6) quadrant = 'Q1';
      else if (severity >= 4 && fanout < 6) quadrant = 'Q2';
      else if (severity < 4 && fanout >= 6) quadrant = 'Q3';
      else quadrant = 'Q4';

      return {
        issue,
        fanout,
        severity,
        exposure,
        quadrant,
      };
    });
  }, [filteredIssues]);

  // Export Analytics Summary CSV
  const handleExportCsv = () => {
    const headers = [
      'Issue_ID',
      'GEID',
      'Employee_Name',
      'Department',
      'Category',
      'Priority',
      'Impact_Score',
      'Severity',
      'Financial_Exposure_AED',
      'Regulatory_Criticality',
      'Downstream_Fanout',
      'Status',
    ];

    const rows = filteredIssues.map((iss) => [
      iss.issue_id,
      iss.geid,
      `"${iss.employee_name}"`,
      `"${iss.department}"`,
      iss.category,
      iss.priority,
      iss.impact_score.toFixed(1),
      iss.impact_factors?.severity ?? 3,
      iss.downstream_impact.financial_exposure_aed || 0,
      iss.impact_factors?.regulatory_criticality ?? 5,
      iss.impact_factors?.downstream_fanout ?? 4,
      iss.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `emirates_hr_analytics_telemetry_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header Banner & Filter Strip */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 rounded-xl border border-slate-800 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-mono text-red-400 font-bold tracking-wider uppercase">
              <BarChart3 className="w-4 h-4 text-red-500" />
              <span>Multi-System Telemetry & Mathematical Diagnostics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {t.analyticsTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {t.analyticsSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start lg:self-center shrink-0">
            {/* Division Filter */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <select
                aria-label={t.filterAllDivisions}
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900">
                  {t.filterAllDivisions}
                </option>
                {divisions.map((div) => (
                  <option key={div} value={div} className="bg-slate-900">
                    {div}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                aria-label={t.filterAllPriorities}
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900">
                  {t.filterAllPriorities}
                </option>
                <option value="CRITICAL" className="bg-slate-900 text-red-400">
                  {t.prioCritical}
                </option>
                <option value="HIGH" className="bg-slate-900 text-amber-400">
                  {t.prioHigh}
                </option>
                <option value="MEDIUM" className="bg-slate-900 text-yellow-400">
                  {t.prioMedium}
                </option>
                <option value="LOW" className="bg-slate-900 text-emerald-400">
                  {t.prioLow}
                </option>
              </select>
            </div>

            {/* Export Report CSV */}
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-red-700 hover:bg-red-600 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.exportAnalyticsReport}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top-Line Executive KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Net Financial Exposure */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{t.netFinancialExposure}</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-amber-300 tabular-nums">
            AED {(totalFinancialExposure / 1000).toFixed(0)}k
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>{t.unmitigatedLeak}</span>
            <span className="text-red-400 font-mono font-medium">Active</span>
          </div>
        </div>

        {/* Average BIS Score */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{t.avgBisScore}</span>
            <TrendingUp className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white tabular-nums">
            {avgBisScore} <span className="text-xs text-slate-500 font-normal">/ 100</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>{t.criticalScoreRatio}</span>
            <span className="text-amber-400 font-mono font-medium">
              {criticalAndHighCount} of {filteredIssues.length}
            </span>
          </div>
        </div>

        {/* Downstream Fanout Multiplier */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{t.avgDownstreamFanout}</span>
            <GitFork className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-blue-300 tabular-nums">
            {avgFanout}x
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {locale === 'ar' ? 'أنظمة وتقارير لكل تناقض' : 'Cascading systems/reports'}
          </div>
        </div>

        {/* Human-in-the-Loop Decisions */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{t.stewardDecisions}</span>
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {resolvedIssues.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>{t.mitigatedExposure}:</span>
            <span className="text-emerald-300 font-mono">
              AED {(mitigatedExposure / 1000).toFixed(0)}k
            </span>
          </div>
        </div>

        {/* Analyzed GEIDs */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{t.entitiesAnalyzed}</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-purple-300 tabular-nums">
            {totalGeidsCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {locale === 'ar' ? '4 أنظمة مؤسسية رئيسية' : 'Across 4 master systems'}
          </div>
        </div>
      </div>

      {/* 3. Row A: BIS Distribution Histogram & Taxonomy Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: BIS Score Distribution Histogram (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/70 p-6 rounded-xl border border-slate-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-red-500" />
                <span>{t.scoreHistogramTitle}</span>
              </h2>
              <p className="text-xs text-slate-400">{t.scoreHistogramSub}</p>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
              {filteredIssues.length} {locale === 'ar' ? 'حالة نشطة' : 'Active Issues'}
            </span>
          </div>

          {/* Histogram Bar Display */}
          <div className="grid grid-cols-4 gap-3 pt-4">
            {histogramBuckets.map((bucket) => {
              const count = bucket.items.length;
              const heightPercent = Math.max(12, Math.round((count / maxBucketCount) * 100));
              const isSelected = activeHistogramBucket === bucket.id;

              return (
                <div
                  key={bucket.id}
                  onClick={() =>
                    setActiveHistogramBucket(isSelected ? null : bucket.id)
                  }
                  className={`cursor-pointer rounded-lg p-3 transition-all flex flex-col justify-between border ${
                    isSelected
                      ? `${bucket.borderColor} ${bucket.bgColor} ring-1 ring-white/20 shadow-lg`
                      : 'border-slate-800/80 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-300 block truncate">
                      {bucket.label}
                    </span>
                    <span className={`text-xl font-bold font-mono tabular-nums ${bucket.textColor}`}>
                      {count}
                    </span>
                  </div>

                  {/* Vertical bar visual */}
                  <div className="mt-4 h-24 bg-slate-900 rounded-md p-1 flex items-end">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded bg-gradient-to-t ${bucket.color} transition-all duration-500 shadow-sm`}
                    />
                  </div>

                  <div className="mt-2 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                    <span>{((count / (filteredIssues.length || 1)) * 100).toFixed(0)}%</span>
                    <span className="text-slate-500">{t.clickToDrilldown}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Drilldown details when a bucket is selected */}
          {activeHistogramBucket && (
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">
                  {locale === 'ar' ? 'السجلات المشمولة في النطاق المحدد:' : 'Records in Selected Score Range:'}
                </span>
                <button
                  onClick={() => onNavigateToTriage(undefined, activeHistogramBucket)}
                  className="text-xs text-red-400 hover:text-red-300 font-mono flex items-center gap-1"
                >
                  <span>{t.reviewQueueBtn}</span>
                  <ArrowRight className={`w-3 h-3 ${isRtl ? 'rotate-180' : ''}`} />
                </button>
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {histogramBuckets
                  .find((b) => b.id === activeHistogramBucket)
                  ?.items.map((iss) => (
                    <div
                      key={iss.issue_id}
                      onClick={() => onSelectIssueForLineage(iss)}
                      className="p-2 rounded bg-slate-900 hover:bg-slate-850 border border-slate-800 cursor-pointer flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-red-400 font-bold">{iss.geid}</span>
                        <span className="text-slate-200 font-medium">{iss.employee_name}</span>
                        <span className="text-[10px] text-slate-400">· {iss.department}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-amber-300 font-bold">
                          Score: {iss.impact_score.toFixed(1)}
                        </span>
                        <ChevronRight className={`w-3.5 h-3.5 text-slate-500 ${isRtl ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Chart 2: Taxonomy Composition Donut (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/70 p-6 rounded-xl border border-slate-800 space-y-5 flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-red-500" />
              <span>{t.taxonomyTitle}</span>
            </h2>
            <p className="text-xs text-slate-400">{t.taxonomySubtitle}</p>
          </div>

          {/* SVG Donut Visual with Central Metric */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
            <div className="relative w-44 h-44 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {donutSlices.map((slice) => {
                  if (slice.count === 0) return null;
                  const strokeWidth = 14;
                  const radius = 50 - strokeWidth / 2;
                  const circumference = 2 * Math.PI * radius;
                  const strokeDasharray = `${circumference * slice.fraction} ${circumference * (1 - slice.fraction)}`;
                  const strokeDashoffset = -circumference * (slice.startAngle / 360);
                  const isHovered = hoveredDonutSlice === slice.category;

                  return (
                    <circle
                      key={slice.category}
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="transparent"
                      stroke={slice.hex}
                      strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="cursor-pointer transition-all duration-300 opacity-90 hover:opacity-100"
                      onMouseEnter={() => setHoveredDonutSlice(slice.category)}
                      onMouseLeave={() => setHoveredDonutSlice(null)}
                      onClick={() => onNavigateToTriage(slice.category)}
                    />
                  );
                })}
              </svg>

              {/* Center Donut Readout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
                <span className="text-2xl font-bold font-mono text-white tabular-nums">
                  {hoveredDonutSlice
                    ? taxonomyData.find((t) => t.category === hoveredDonutSlice)?.count
                    : filteredIssues.length}
                </span>
                <span className="text-[10px] text-slate-400 font-mono leading-tight">
                  {hoveredDonutSlice
                    ? taxonomyData.find((t) => t.category === hoveredDonutSlice)?.label
                    : locale === 'ar'
                    ? 'إجمالي التناقضات'
                    : 'Disparities'}
                </span>
              </div>
            </div>

            {/* Legend & Breakdown */}
            <div className="space-y-2 w-full text-xs">
              {taxonomyData.map((item) => (
                <div
                  key={item.category}
                  onMouseEnter={() => setHoveredDonutSlice(item.category)}
                  onMouseLeave={() => setHoveredDonutSlice(null)}
                  onClick={() => onNavigateToTriage(item.category)}
                  className={`p-2 rounded-lg cursor-pointer transition-colors flex items-center justify-between border ${
                    hoveredDonutSlice === item.category
                      ? 'bg-slate-800/80 border-slate-700 text-white'
                      : 'bg-slate-950/40 border-slate-850 hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.hex }}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono shrink-0">
                    <span className="font-bold text-white tabular-nums">{item.count}</span>
                    <span className="text-[10px] text-slate-500">
                      ({((item.count / totalTaxonomyCount) * 100).toFixed(0)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Row B: Financial Exposure by Division & Cross-System Conflict Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 3: Division Wage Leak & Financial Exposure Bar Chart (6 Cols) */}
        <div className="lg:col-span-6 bg-slate-900/70 p-6 rounded-xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>{t.divisionLeakTitle}</span>
              </h2>
              <p className="text-xs text-slate-400">{t.divisionLeakSub}</p>
            </div>
          </div>

          <div className="space-y-3.5">
            {divisionBreakdown.map((item) => {
              const widthPct = Math.max(8, Math.round((item.exposure / maxDivisionExposure) * 100));

              return (
                <div
                  key={item.division}
                  onClick={() => {
                    setSelectedDivision(item.division);
                  }}
                  className="space-y-1.5 cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                      {item.division}
                    </span>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-slate-400 text-[11px]">
                        {item.count} {locale === 'ar' ? 'سجلات' : 'issues'}
                      </span>
                      <span className="text-amber-300 font-bold tabular-nums">
                        AED {item.exposure.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Dual color progress bar */}
                  <div className="h-4 bg-slate-950 rounded-md overflow-hidden p-0.5 border border-slate-800 flex">
                    <div
                      style={{ width: `${widthPct}%` }}
                      className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 rounded-sm transition-all duration-500 shadow-sm"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 4: Cross-System Conflict Heatmap (6 Cols) */}
        <div className="lg:col-span-6 bg-slate-900/70 p-6 rounded-xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400" />
                <span>{t.conflictHeatmapTitle}</span>
              </h2>
              <p className="text-xs text-slate-400">{t.conflictHeatmapSub}</p>
            </div>
            <span className="text-[10px] font-mono text-slate-400">4×4 Matrix</span>
          </div>

          {/* Matrix Visual */}
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse text-xs">
              <thead>
                <tr>
                  <th className="p-2 text-start text-slate-400 font-mono text-[11px] font-medium">
                    {locale === 'ar' ? 'النظام / المصدر' : 'Source \\ Target'}
                  </th>
                  {systemMatrix.map((s) => (
                    <th key={s} className="p-2 text-slate-300 font-mono text-[10px] truncate max-w-[80px]">
                      {s.replace('.csv', '')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {systemMatrix.map((s1) => (
                  <tr key={s1} className="border-t border-slate-850">
                    <td className="p-2 text-start font-mono text-slate-300 text-[11px] font-medium truncate max-w-[100px]">
                      {s1.replace('.csv', '')}
                    </td>
                    {systemMatrix.map((s2) => {
                      const cell = heatmapMatrix[s1]?.[s2];
                      const count = cell?.count || 0;
                      const isSelf = s1 === s2;

                      let cellBg = 'bg-slate-950/40 text-slate-500';
                      if (count > 0) {
                        if (count >= 3) cellBg = 'bg-red-950/70 text-red-300 border border-red-800/60 font-bold';
                        else if (count === 2) cellBg = 'bg-amber-950/70 text-amber-300 border border-amber-800/60 font-semibold';
                        else cellBg = 'bg-blue-950/60 text-blue-300 border border-blue-800/40';
                      }

                      return (
                        <td key={s2} className="p-1.5">
                          <div
                            onClick={() => {
                              if (cell && cell.issues.length > 0) {
                                onSelectIssueForLineage(cell.issues[0]);
                              }
                            }}
                            title={`${s1} vs ${s2}: ${count} disparities`}
                            className={`p-2.5 rounded-lg font-mono text-xs cursor-pointer transition-all hover:scale-105 ${cellBg}`}
                          >
                            {count}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-800">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-blue-950 border border-blue-800" />
              1 Mismatch
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-950 border border-amber-800" />
              2 Mismatches
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-red-950 border border-red-800" />
              3+ Critical Mismatches
            </span>
          </div>
        </div>
      </div>

      {/* 5. Row C: Blast Radius Fanout vs Severity Scatter Quadrants */}
      <div className="bg-slate-900/70 p-6 rounded-xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-purple-400" />
              <span>{t.scatterQuadrantTitle}</span>
            </h2>
            <p className="text-xs text-slate-400">{t.scatterQuadrantSub}</p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-red-400 font-semibold">{t.quadrant1Label.split(':')[0]}</span>
            <span className="text-slate-600">·</span>
            <span className="text-amber-400 font-semibold">{t.quadrant2Label.split(':')[0]}</span>
            <span className="text-slate-600">·</span>
            <span className="text-blue-400 font-semibold">{t.quadrant3Label.split(':')[0]}</span>
          </div>
        </div>

        {/* 2x2 Interactive Quadrant Grid */}
        <div className="relative border border-slate-800 rounded-xl p-6 bg-slate-950/80 min-h-[380px] flex flex-col justify-between overflow-hidden">
          {/* Axis Guidelines */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-800/80 border-dashed border-t border-slate-700 pointer-events-none" />
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-800/80 border-dashed border-l border-slate-700 pointer-events-none" />

          {/* Quadrant Labels in corners */}
          <div className="flex justify-between items-start pointer-events-none text-[11px] font-mono text-slate-400 z-0">
            <span className="bg-slate-900/90 px-2.5 py-1 rounded border border-amber-900/40 text-amber-300">
              {t.quadrant2Label}
            </span>
            <span className="bg-slate-900/90 px-2.5 py-1 rounded border border-red-900/40 text-red-300">
              {t.quadrant1Label}
            </span>
          </div>

          {/* Bubble Points Container */}
          <div className="relative w-full h-64 z-10">
            {scatterPoints.map(({ issue, fanout, severity, exposure }) => {
              // Normalize positions:
              // X: Fanout (1 to 10) -> 5% to 95%
              const xPos = Math.min(95, Math.max(5, (fanout / 10) * 100));
              // Y: Severity (1 to 5) -> invert for top is high severity (90% down to 10%)
              const yPos = Math.min(90, Math.max(10, 100 - (severity / 5) * 85));

              // Bubble radius proportional to financial exposure
              const bubbleSize = exposure > 200000 ? 32 : exposure > 50000 ? 24 : 16;
              const isGhost = issue.category === 'SECURITY_GHOST';

              return (
                <div
                  key={issue.issue_id}
                  style={{
                    left: `${xPos}%`,
                    top: `${yPos}%`,
                    width: `${bubbleSize}px`,
                    height: `${bubbleSize}px`,
                  }}
                  onClick={() => setSelectedScatterPoint(issue)}
                  title={`${issue.employee_name} (${issue.geid}) - ${issue.category} | BIS: ${issue.impact_score}`}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer transition-all duration-300 flex items-center justify-center font-mono text-[9px] font-bold shadow-md hover:scale-125 hover:z-30 ${
                    isGhost
                      ? 'bg-red-500/90 text-white ring-2 ring-red-400 animate-pulse'
                      : issue.priority === 'CRITICAL'
                      ? 'bg-amber-500/90 text-slate-950 ring-2 ring-amber-300'
                      : issue.priority === 'HIGH'
                      ? 'bg-yellow-500/90 text-slate-950'
                      : 'bg-blue-500/90 text-white'
                  }`}
                >
                  {severity}
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-end pointer-events-none text-[11px] font-mono text-slate-400 z-0">
            <span className="bg-slate-900/90 px-2.5 py-1 rounded border border-slate-800 text-slate-400">
              {t.quadrant4Label}
            </span>
            <span className="bg-slate-900/90 px-2.5 py-1 rounded border border-blue-900/40 text-blue-300">
              {t.quadrant3Label}
            </span>
          </div>

          {/* Axis Labels */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
            <span>← Low Severity (1 - 3)</span>
            <span className="text-white font-semibold">Downstream Blast Radius (Fanout) →</span>
            <span>High Severity (4 - 5) →</span>
          </div>
        </div>

        {/* Selected Scatter Node Inspector */}
        {selectedScatterPoint && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 font-mono text-[10px] font-bold border border-red-800/60">
                  {selectedScatterPoint.category}
                </span>
                <span className="font-mono text-xs font-bold text-white">
                  {selectedScatterPoint.geid}
                </span>
                <span className="text-slate-300 font-semibold">
                  {selectedScatterPoint.employee_name}
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-xs text-slate-400">{selectedScatterPoint.department}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                {selectedScatterPoint.explanation}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onSelectIssueForLineage(selectedScatterPoint)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-md transition-colors flex items-center gap-1.5"
              >
                <GitFork className="w-3.5 h-3.5" />
                <span>{t.navLineage}</span>
              </button>

              <button
                onClick={() => onSelectIssueForSteward(selectedScatterPoint)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-red-700 hover:bg-red-600 rounded-md transition-colors flex items-center gap-1.5"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>{t.reviewBtn}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. Row D: Regulatory Compliance Radar & Trust Invariant Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900/70 p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Plane className="w-4 h-4 text-red-400" />
              <span>GCAA Airside Security Mandate</span>
            </span>
            <span className="font-mono text-xs text-red-400 font-bold">Severity 5</span>
          </div>
          <p className="text-xs text-slate-400">
            {locale === 'ar'
              ? 'إلزامية سحب تصاريح دخول قمرة القيادة وساحة المطار فور إنهاء خدمة الموظف'
              : 'Immediate biometric and ramp clearance revocation for terminated airside crew.'}
          </p>
          <div className="pt-2 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Security Ghosts:</span>
            <span className="text-red-400 font-bold">
              {issues.filter((i) => i.category === 'SECURITY_GHOST').length} active leaks
            </span>
          </div>
        </div>

        <div className="bg-slate-900/70 p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-amber-400" />
              <span>UAE National Tawteen & GPSSA</span>
            </span>
            <span className="font-mono text-xs text-amber-300 font-bold">Reg. 10/10</span>
          </div>
          <p className="text-xs text-slate-400">
            {locale === 'ar'
              ? 'مطابقة بيانات اشتراكات هيئة المعاشات وتصنيفات التوطين بين الموارد البشرية والرواتب'
              : 'GPSSA pension contribution & Emiratisation identity synchronization.'}
          </p>
          <div className="pt-2 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Regulatory Flags:</span>
            <span className="text-amber-400 font-bold">
              {issues.filter((i) => (i.impact_factors?.regulatory_criticality || 0) >= 8).length} flagged
            </span>
          </div>
        </div>

        <div className="bg-slate-900/70 p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Source Trust Rank 1 Compliance</span>
            </span>
            <span className="font-mono text-xs text-emerald-400 font-bold">100% Deterministic</span>
          </div>
          <p className="text-xs text-slate-400">
            {locale === 'ar'
              ? 'الامتثال الصارم لهرمية المصادر: core_hr للهوية وعقد العمل و payroll للدرجة المالية'
              : 'Deterministic priority ranking with last_modified_timestamp tie-breakers.'}
          </p>
          <div className="pt-2 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Resolved by Stewards:</span>
            <span className="text-emerald-400 font-bold">{resolvedIssues.length} approved</span>
          </div>
        </div>
      </div>
    </div>
  );
};
