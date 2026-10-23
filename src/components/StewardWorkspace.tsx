import React, { useState } from 'react';
import {
  FileCheck2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Filter,
  UserCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { DisparityIssue } from '../types';

interface StewardWorkspaceProps {
  issues: DisparityIssue[];
  auditLogs: any[];
  onOpenStewardModal: (issue: DisparityIssue) => void;
  onExportAuditLog: () => void;
}

export const StewardWorkspace: React.FC<StewardWorkspaceProps> = ({
  issues,
  auditLogs,
  onOpenStewardModal,
  onExportAuditLog,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'audit_trail'>('pending');

  const pendingIssues = issues.filter((i) => i.status === 'PENDING_REVIEW');
  const reviewedIssues = issues.filter((i) => i.status !== 'PENDING_REVIEW');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/70 p-5 rounded-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-950 border border-red-800/60 flex items-center justify-center text-red-400 shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono text-red-400 font-semibold uppercase tracking-wider">
                Human-in-the-Loop Governance
              </div>
              <h2 className="text-lg font-bold text-white">
                HR Data Steward Approval & Audit Log Workspace
              </h2>
              <p className="text-xs text-slate-400">
                Authorized HR Stewards review deterministic fix proposals, apply manual overrides,
                and sign off on audit trail commitments
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onExportAuditLog}
              className="px-3 py-1.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download audit_log.json</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-tab selection */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('pending')}
          className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors ${
            activeSubTab === 'pending'
              ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Pending Steward Reviews ({pendingIssues.length})
        </button>
        <button
          onClick={() => setActiveSubTab('audit_trail')}
          className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors ${
            activeSubTab === 'audit_trail'
              ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Immutable Audit Log History ({auditLogs.length + reviewedIssues.length})
        </button>
      </div>

      {/* Content 1: Pending Reviews */}
      {activeSubTab === 'pending' && (
        <div className="space-y-4">
          {pendingIssues.length === 0 ? (
            <div className="bg-slate-900/40 p-12 text-center rounded-xl border border-slate-800 text-slate-400">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-semibold text-white">All discrepancies resolved!</p>
              <p className="text-xs text-slate-400 mt-1">
                Zero pending items require data steward approval at this time.
              </p>
            </div>
          ) : (
            pendingIssues.map((issue) => (
              <div
                key={issue.issue_id}
                className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-red-400">
                      {issue.issue_id}
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="font-mono text-xs text-slate-300">{issue.geid}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-xs font-semibold text-white">{issue.employee_name}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-xs text-slate-400">{issue.department}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-[11px] font-mono text-slate-400">
                      Impact:{' '}
                      <span className="text-amber-400 font-bold">
                        {issue.impact_score.toFixed(1)}
                      </span>{' '}
                      [{issue.priority}]
                    </div>
                    <button
                      onClick={() => onOpenStewardModal(issue)}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-red-700 hover:bg-red-600 rounded-md transition-colors flex items-center gap-1"
                    >
                      <span>Review & Decide</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{issue.explanation}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1 text-xs">
                    <div className="text-[10px] uppercase font-mono text-slate-400">
                      Current Multi-Source Evidence:
                    </div>
                    {issue.current_values.map((v, i) => (
                      <div key={i} className="flex items-center justify-between font-mono text-[11px]">
                        <span className="text-slate-400">
                          {v.source_system} ({v.field_name}):
                        </span>
                        <span className="text-amber-300 font-semibold">{String(v.value)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40 space-y-1 text-xs">
                    <div className="text-[10px] uppercase font-mono text-emerald-400">
                      Proposed Resolution:
                    </div>
                    <div className="font-mono text-slate-200">
                      Set{' '}
                      <span className="text-emerald-400 font-bold">
                        {issue.suggested_fix.target_field}
                      </span>{' '}
                      ➔{' '}
                      <span className="text-amber-300 font-bold">
                        "{String(issue.suggested_fix.proposed_value)}"
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      {issue.suggested_fix.source_rationale}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Content 2: Immutable Audit Log History */}
      {activeSubTab === 'audit_trail' && (
        <div className="bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <span className="text-xs font-mono uppercase text-slate-400">
              Audit Entries Recorded in audit_log.json
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Immutable Governance Log
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Issue ID & GEID</th>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Steward ID / Name</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Steward Justification Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {/* Dynamically signed off issues in current session */}
                {reviewedIssues.map((issue) => (
                  <tr key={issue.issue_id} className="hover:bg-slate-800/40">
                    <td className="p-3 text-slate-400">
                      {issue.audit_trail_entry.reviewed_at ||
                        issue.audit_trail_entry.timestamp.slice(0, 19).replace('T', ' ')}
                    </td>
                    <td className="p-3 text-red-300 font-semibold">
                      {issue.issue_id} ({issue.geid})
                    </td>
                    <td className="p-3 text-white font-sans">{issue.employee_name}</td>
                    <td className="p-3 text-slate-300 font-sans">
                      {issue.audit_trail_entry.steward_name || 'Amira Al-Hashemi'} (
                      {issue.audit_trail_entry.steward_id || 'STEWARD-DXB-07'})
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          issue.status === 'APPROVED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                            : issue.status === 'REJECTED'
                            ? 'bg-red-950 text-red-300 border border-red-800/40'
                            : 'bg-purple-950 text-purple-300 border border-purple-800/40'
                        }`}
                      >
                        {issue.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300 font-sans text-xs">
                      {issue.audit_trail_entry.steward_notes ||
                        'Reconciliation verified against source trust hierarchy.'}
                    </td>
                  </tr>
                ))}

                {/* Pre-existing persistent audit log items */}
                {auditLogs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="p-3 text-slate-400">
                      {log.timestamp ? log.timestamp.slice(0, 19).replace('T', ' ') : '2026-10-14 09:30:00'}
                    </td>
                    <td className="p-3 text-red-300 font-semibold">
                      {log.issue_id} ({log.geid})
                    </td>
                    <td className="p-3 text-white font-sans">{log.employee_name}</td>
                    <td className="p-3 text-slate-300 font-sans">
                      {log.steward_name} ({log.steward_id})
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300 font-sans text-xs">{log.steward_notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
