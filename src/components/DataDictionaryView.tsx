import React, { useState } from 'react';
import {
  BookOpen,
  FileCode,
  Table,
  GitFork,
  Upload,
  CheckCircle,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { DATA_DICTIONARY } from '../data/data_dictionary';
import { SYSTEM_DEPENDENCY_RULES } from '../data/dependencies';
import {
  SAMPLE_CORE_HR,
  SAMPLE_PAYROLL,
  SAMPLE_ACCESS_DIRECTORY,
  SAMPLE_LEARNING,
} from '../data/sample_datasets';
import { useLanguage } from '../i18n/LanguageContext';

export const DataDictionaryView: React.FC = () => {
  const { locale, isRtl } = useLanguage();
  const [activeTab, setActiveTab] = useState<'dictionary' | 'dependencies' | 'raw_datasets'>(
    'dictionary'
  );
  const [datasetView, setDatasetView] = useState<'core_hr' | 'payroll' | 'access' | 'learning'>(
    'core_hr'
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/70 p-5 rounded-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-950 border border-red-800/60 flex items-center justify-center text-red-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono text-red-400 font-semibold uppercase tracking-wider">
                {locale === 'ar' ? 'المخططات والمحددات المرجعية المعتمدة' : 'Authoritative Master Schemas'}
              </div>
              <h2 className="text-lg font-bold text-white">
                {locale === 'ar'
                  ? 'قاموس البيانات، قواعد التبعيات وتغذيات السجلات الخام'
                  : 'Data Dictionary, Lineage Specifications & Raw Feeds'}
              </h2>
              <p className="text-xs text-slate-400">
                {locale === 'ar'
                  ? 'المحددات المرجعية وقواعد التبعية المتبادلة الحاكمة لمجموعة طيران الإمارات'
                  : 'Authoritative constraints and cross-system dependency rules governing Emirates Group HR'}
              </p>
            </div>
          </div>

          {/* Sub-tab Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('dictionary')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'dictionary'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {locale === 'ar' ? 'قاموس البيانات' : 'Data Dictionary'}
            </button>
            <button
              onClick={() => setActiveTab('dependencies')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'dependencies'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {locale === 'ar' ? 'قواعد التبعية والتأثير' : 'Lineage Rules'}
            </button>
            <button
              onClick={() => setActiveTab('raw_datasets')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'raw_datasets'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {locale === 'ar'
                ? `السجلات الخام (${SAMPLE_CORE_HR.length + SAMPLE_PAYROLL.length} سجل)`
                : `Raw Datasets (${SAMPLE_CORE_HR.length + SAMPLE_PAYROLL.length} rows)`}
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Data Dictionary */}
      {activeTab === 'dictionary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Departments */}
          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-white">Operating Departments</span>
              <span className="text-[10px] font-mono text-slate-400">core_hr.department</span>
            </div>
            <ul className="space-y-1.5 text-xs">
              {DATA_DICTIONARY.departments.map((dept) => (
                <li
                  key={dept}
                  className="p-2 rounded bg-slate-950 border border-slate-800/80 text-slate-300 font-mono text-[11px]"
                >
                  {dept}
                </li>
              ))}
            </ul>
          </div>

          {/* Grades */}
          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-white">Grade Hierarchy</span>
              <span className="text-[10px] font-mono text-slate-400">payroll.grade_level</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
              {DATA_DICTIONARY.grades.map((grade) => (
                <div
                  key={grade}
                  className="p-2 rounded bg-slate-950 border border-slate-800/80 text-center text-slate-300 text-[11px]"
                >
                  {grade}
                </div>
              ))}
            </div>
            <div className="text-[11px] text-slate-400 pt-1">
              EK.01 - EK.10 (Ground/Specialist), SE.01 - SE.03 (Executive), FD.01 - FD.04 (Flight Deck)
            </div>
          </div>

          {/* Allowances */}
          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-white">Authorized Allowance Codes</span>
              <span className="text-[10px] font-mono text-slate-400">flight_allowance_code</span>
            </div>
            <ul className="space-y-1.5 text-xs">
              {DATA_DICTIONARY.allowance_codes.map((code) => (
                <li
                  key={code}
                  className="p-2 rounded bg-slate-950 border border-slate-800/80 text-slate-300 font-mono text-[11px]"
                >
                  {code}
                </li>
              ))}
            </ul>
          </div>

          {/* Contract Statuses */}
          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-white">Employment Status Lifecycle</span>
              <span className="text-[10px] font-mono text-slate-400">contract_status</span>
            </div>
            <ul className="space-y-1.5 text-xs">
              {DATA_DICTIONARY.contract_statuses.map((st) => (
                <li
                  key={st}
                  className="p-2 rounded bg-slate-950 border border-slate-800/80 text-slate-300 font-mono text-[11px]"
                >
                  {st}
                </li>
              ))}
            </ul>
          </div>

          {/* Pension Schemes */}
          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-white">Statutory Pension Schemes</span>
              <span className="text-[10px] font-mono text-slate-400">pension_scheme</span>
            </div>
            <ul className="space-y-1.5 text-xs">
              {DATA_DICTIONARY.pension_schemes.map((p) => (
                <li
                  key={p}
                  className="p-2 rounded bg-slate-950 border border-slate-800/80 text-slate-300 font-mono text-[11px]"
                >
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Airport Access Levels */}
          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-white">Airside Airport Clearances</span>
              <span className="text-[10px] font-mono text-slate-400">physical_airport_access</span>
            </div>
            <ul className="space-y-1.5 text-xs">
              {DATA_DICTIONARY.airport_access_levels.map((lvl) => (
                <li
                  key={lvl}
                  className="p-2 rounded bg-slate-950 border border-slate-800/80 text-slate-300 font-mono text-[11px]"
                >
                  {lvl}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tab 2: Dependencies & Lineage Rules */}
      {activeTab === 'dependencies' && (
        <div className="space-y-4">
          {SYSTEM_DEPENDENCY_RULES.map((rule) => (
            <div
              key={rule.field_key}
              className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                <div>
                  <span className="font-mono text-xs font-semibold text-red-400">
                    {rule.system} ➔ {rule.field_key}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-0.5">{rule.field_name}</h3>
                </div>
                <div className="text-xs font-mono text-slate-400">
                  Downstream Fanout Weight:{' '}
                  <span className="font-bold text-amber-300">
                    {rule.blast_radius_multiplier} targets
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300">{rule.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                  <div className="text-[11px] font-mono font-semibold uppercase text-blue-400 mb-2">
                    Direct Downstream Systems ({rule.direct_systems.length})
                  </div>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {rule.direct_systems.map((s, idx) => (
                      <li key={idx} className="flex items-center gap-1.5 text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                  <div className="text-[11px] font-mono font-semibold uppercase text-purple-400 mb-2">
                    Executive Reports & Regulatory Filings ({rule.executive_reports.length})
                  </div>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {rule.executive_reports.map((r, idx) => (
                      <li key={idx} className="flex items-center gap-1.5 text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Raw Datasets View */}
      {activeTab === 'raw_datasets' && (
        <div className="bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden space-y-4 p-4">
          {/* Sub-selector for datasets */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              {[
                { id: 'core_hr', label: 'core_hr.csv', count: SAMPLE_CORE_HR.length },
                { id: 'payroll', label: 'payroll.csv', count: SAMPLE_PAYROLL.length },
                { id: 'access', label: 'access_directory.csv', count: SAMPLE_ACCESS_DIRECTORY.length },
                { id: 'learning', label: 'learning.csv', count: SAMPLE_LEARNING.length },
              ].map((ds) => (
                <button
                  key={ds.id}
                  onClick={() => setDatasetView(ds.id as any)}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
                    datasetView === ds.id
                      ? 'bg-red-700 text-white font-semibold'
                      : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  {ds.label} ({ds.count})
                </button>
              ))}
            </div>
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              Simulated Ingestion Feeds
            </span>
          </div>

          {/* Raw Table */}
          <div className="overflow-x-auto">
            {datasetView === 'core_hr' && (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">Record ID</th>
                    <th className="p-2.5">GEID</th>
                    <th className="p-2.5">Employee Name</th>
                    <th className="p-2.5">National ID</th>
                    <th className="p-2.5">Department</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Hire Date</th>
                    <th className="p-2.5">Term Date</th>
                    <th className="p-2.5">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {SAMPLE_CORE_HR.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-slate-400">{r.record_id}</td>
                      <td className="p-2.5 text-red-300 font-semibold">{r.geid}</td>
                      <td className="p-2.5 text-white font-sans">{r.employee_name}</td>
                      <td className="p-2.5 text-slate-400">{r.national_id}</td>
                      <td className="p-2.5 text-slate-300 font-sans">{r.department}</td>
                      <td className="p-2.5">
                        <span
                          className={
                            r.contract_status === 'Terminated' ? 'text-red-400' : 'text-emerald-400'
                          }
                        >
                          {r.contract_status}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-400">{r.hire_date}</td>
                      <td className="p-2.5 text-slate-400">{r.termination_date || '—'}</td>
                      <td className="p-2.5 text-amber-300 font-bold">{r.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {datasetView === 'payroll' && (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">Record ID</th>
                    <th className="p-2.5">GEID</th>
                    <th className="p-2.5">Employee Name</th>
                    <th className="p-2.5">IBAN</th>
                    <th className="p-2.5">Grade Level</th>
                    <th className="p-2.5">Basic Salary AED</th>
                    <th className="p-2.5">Allowance</th>
                    <th className="p-2.5">Pension Scheme</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {SAMPLE_PAYROLL.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-slate-400">{r.record_id}</td>
                      <td className="p-2.5 text-red-300 font-semibold">{r.geid}</td>
                      <td className="p-2.5 text-white font-sans">{r.employee_name}</td>
                      <td className="p-2.5 text-slate-400">{r.iban.slice(0, 12)}...</td>
                      <td className="p-2.5 text-amber-300 font-bold">{r.grade_level}</td>
                      <td className="p-2.5 text-emerald-300 tabular-nums">
                        {r.basic_salary_aed.toLocaleString()}
                      </td>
                      <td className="p-2.5 text-slate-300">{r.flight_allowance_code}</td>
                      <td className="p-2.5 text-slate-400">{r.pension_scheme}</td>
                      <td className="p-2.5">
                        <span
                          className={
                            r.payroll_status === 'Active' ? 'text-emerald-400' : 'text-red-400'
                          }
                        >
                          {r.payroll_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {datasetView === 'access' && (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">Record ID</th>
                    <th className="p-2.5">GEID</th>
                    <th className="p-2.5">UPN Username</th>
                    <th className="p-2.5">AD Status</th>
                    <th className="p-2.5">Airport Access Level</th>
                    <th className="p-2.5">Badge Status</th>
                    <th className="p-2.5">Last Swipe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {SAMPLE_ACCESS_DIRECTORY.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-slate-400">{r.record_id}</td>
                      <td className="p-2.5 text-red-300 font-semibold">{r.geid}</td>
                      <td className="p-2.5 text-white">{r.upn_username}</td>
                      <td className="p-2.5">
                        <span
                          className={
                            r.active_directory_status === 'Active'
                              ? 'text-emerald-400'
                              : 'text-slate-500'
                          }
                        >
                          {r.active_directory_status}
                        </span>
                      </td>
                      <td className="p-2.5 text-amber-300">{r.physical_airport_access_level}</td>
                      <td className="p-2.5 text-slate-300">{r.building_badge_status}</td>
                      <td className="p-2.5 text-slate-400">{r.last_badge_swipe || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {datasetView === 'learning' && (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">Record ID</th>
                    <th className="p-2.5">GEID</th>
                    <th className="p-2.5">Certification Code</th>
                    <th className="p-2.5">Certification Name</th>
                    <th className="p-2.5">Completion Date</th>
                    <th className="p-2.5">Expiry Date</th>
                    <th className="p-2.5">Compliance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {SAMPLE_LEARNING.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-slate-400">{r.record_id}</td>
                      <td className="p-2.5 text-red-300 font-semibold">{r.geid}</td>
                      <td className="p-2.5 text-amber-300">{r.certification_code}</td>
                      <td className="p-2.5 text-white font-sans">{r.certification_name}</td>
                      <td className="p-2.5 text-slate-400">{r.completion_date}</td>
                      <td className="p-2.5 text-slate-400">{r.expiry_date}</td>
                      <td className="p-2.5">
                        <span
                          className={
                            r.compliance_status === 'Compliant'
                              ? 'text-emerald-400'
                              : 'text-red-400 font-bold'
                          }
                        >
                          {r.compliance_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
