import React, { useState } from 'react';
import { X, Copy, Check, Code2, Download } from 'lucide-react';
import { DisparityIssue } from '../types';

interface SchemaJsonModalProps {
  issue: DisparityIssue | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SchemaJsonModal: React.FC<SchemaJsonModalProps> = ({ issue, isOpen, onClose }) => {
  if (!isOpen || !issue) return null;

  const [copied, setCopied] = useState(false);

  // Exact Schema 1 format representation
  const schemaPayload = {
    issue_id: issue.issue_id,
    geid: issue.geid,
    employee_name: issue.employee_name,
    category: issue.category,
    impact_score: issue.impact_score,
    priority: issue.priority,
    explanation: issue.explanation,
    current_values: issue.current_values.map((v) => ({
      source_system: v.source_system,
      record_id: v.record_id,
      field_name: v.field_name,
      value: v.value,
    })),
    suggested_fix: {
      target_field: issue.suggested_fix.target_field,
      proposed_value: issue.suggested_fix.proposed_value,
      source_rationale: issue.suggested_fix.source_rationale,
      confidence_score: issue.suggested_fix.confidence_score,
    },
    downstream_impact: {
      affected_systems: issue.downstream_impact.affected_systems,
      affected_reports: issue.downstream_impact.affected_reports,
      metric_delta_preview: issue.downstream_impact.metric_delta_preview,
    },
    audit_trail_entry: {
      timestamp: issue.audit_trail_entry.timestamp,
      action: issue.audit_trail_entry.action,
      requires_steward_approval: issue.audit_trail_entry.requires_steward_approval,
    },
  };

  const jsonString = JSON.stringify(schemaPayload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${issue.issue_id}_schema1.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-bold text-white">
              Schema 1: Anomaly Analysis & Impact Response ({issue.issue_id})
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-1.5 text-xs text-slate-300 hover:text-white rounded border border-slate-700 hover:bg-slate-800 flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="p-1.5 text-xs text-slate-300 hover:text-white rounded border border-slate-700 hover:bg-slate-800 flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-4 overflow-y-auto flex-1 bg-slate-950 font-mono text-xs text-slate-300">
          <pre className="text-[11px] leading-relaxed select-all">{jsonString}</pre>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Compliant with Emirates Group HR AI Schema 1 Specification</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
