import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  AlertOctagon,
  FileText,
  UserCheck,
  CheckCircle,
  XCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { DisparityIssue } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface StewardReviewModalProps {
  issue: DisparityIssue | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveDecision: (
    issueId: string,
    action: 'APPROVED' | 'REJECTED' | 'OVERRIDDEN',
    stewardData: {
      steward_id: string;
      steward_name: string;
      steward_notes: string;
      custom_value?: string;
    }
  ) => void;
}

export const StewardReviewModal: React.FC<StewardReviewModalProps> = ({
  issue,
  isOpen,
  onClose,
  onSaveDecision,
}) => {
  const { t, locale, isRtl } = useLanguage();

  if (!isOpen || !issue) return null;

  const [stewardId, setStewardId] = useState('STEWARD-DXB-07');
  const [stewardName, setStewardName] = useState(
    locale === 'ar' ? 'أميرة الهاشمي' : 'Amira Al-Hashemi'
  );
  const [stewardNotes, setStewardNotes] = useState(
    locale === 'ar'
      ? 'تم اعتماد التسوية الحتمية وفقاً للتسلسل الهرمي لمصداقية المصادر المعتمد لدى مجموعة طيران الإمارات.'
      : 'Deterministic reconciliation approved in accordance with Emirates Group HR Source Trust Hierarchy.'
  );
  const [actionType, setActionType] = useState<'APPROVED' | 'REJECTED' | 'OVERRIDDEN'>('APPROVED');
  const [customValue, setCustomValue] = useState(String(issue.suggested_fix.proposed_value));

  const handleConfirm = () => {
    onSaveDecision(issue.issue_id, actionType, {
      steward_id: stewardId,
      steward_name: stewardName,
      steward_notes: stewardNotes,
      custom_value: actionType === 'OVERRIDDEN' ? customValue : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-950 border border-red-800/60 flex items-center justify-center text-red-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-mono text-red-400 font-semibold uppercase">
                {locale === 'ar' ? 'إشراف وحوكمة العنصر البشري' : 'Human-in-the-Loop Governance'}
              </div>
              <h3 className="text-sm font-bold text-white">
                {t.stewardModalTitle}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-6">
          {/* Issue Summary */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-red-400 font-semibold">{issue.issue_id}</span>
              <span className="font-mono text-slate-400">{issue.geid}</span>
            </div>
            <div className="text-sm font-semibold text-white">{issue.employee_name}</div>
            <p className="text-xs text-slate-300 leading-relaxed">{issue.explanation}</p>
          </div>

          {/* Evidence Comparison Table */}
          <div className="space-y-2">
            <div className="text-xs font-mono font-semibold text-slate-400 uppercase">
              {t.evidenceComparisonTitle}
            </div>
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-start text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">{locale === 'ar' ? 'ملف المصدر' : 'Source File'}</th>
                    <th className="p-2.5">{locale === 'ar' ? 'رقم السجل' : 'Record ID'}</th>
                    <th className="p-2.5">{locale === 'ar' ? 'الحقل' : 'Field'}</th>
                    <th className="p-2.5">{locale === 'ar' ? 'القيمة المسجلة' : 'Recorded Value'}</th>
                    <th className="p-2.5">{locale === 'ar' ? 'المرتبة' : 'Trust Rank'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-900/50">
                  {issue.current_values.map((v, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-mono text-[11px] text-slate-200">
                        {v.source_system}
                      </td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-400">{v.record_id}</td>
                      <td className="p-2.5 text-slate-300">{v.field_name}</td>
                      <td className="p-2.5 font-mono font-bold text-amber-300">
                        {String(v.value)}
                      </td>
                      <td className="p-2.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                            v.system_trust_level === 'PRIMARY'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {v.system_trust_level || 'SECONDARY'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Proposed Fix & Rationale */}
          <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-300">{t.engineRecommendationTitle}</span>
              <span className="font-mono text-emerald-400 font-bold">
                Confidence: {(issue.suggested_fix.confidence_score * 100).toFixed(0)}%
              </span>
            </div>
            <div className="font-mono text-sm text-white">
              Target: <span className="text-emerald-400">{issue.suggested_fix.target_field}</span>{' '}
              ➔{' '}
              <span className="text-amber-300 font-bold">
                "{String(issue.suggested_fix.proposed_value)}"
              </span>
            </div>
            <p className="text-slate-300 text-[11px]">
              {issue.suggested_fix.source_rationale}
            </p>
          </div>

          {/* Action Choice */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-semibold text-slate-400 uppercase block">
              {t.stewardDecisionChoice}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setActionType('APPROVED')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  actionType === 'APPROVED'
                    ? 'bg-emerald-900/60 border-emerald-600 text-white shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{t.approveFixAction}</span>
              </button>

              <button
                type="button"
                onClick={() => setActionType('REJECTED')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  actionType === 'REJECTED'
                    ? 'bg-red-900/60 border-red-600 text-white shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>{t.rejectFixAction}</span>
              </button>

              <button
                type="button"
                onClick={() => setActionType('OVERRIDDEN')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  actionType === 'OVERRIDDEN'
                    ? 'bg-purple-900/60 border-purple-600 text-white shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.customOverrideAction}</span>
              </button>
            </div>
          </div>

          {/* Custom Override input if selected */}
          {actionType === 'OVERRIDDEN' && (
            <div className="space-y-1 animate-in fade-in">
              <label className="text-xs text-slate-300 font-medium block">
                {locale === 'ar' ? 'القيمة المخصصة المعتمدة:' : 'Custom Target Value Override:'}
              </label>
              <input
                type="text"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                placeholder={t.customOverridePlaceholder}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
          )}

          {/* Steward Metadata Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">{t.stewardIdLabel}</label>
              <input
                type="text"
                value={stewardId}
                onChange={(e) => setStewardId(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">{t.stewardNameLabel}</label>
              <input
                type="text"
                value={stewardName}
                onChange={(e) => setStewardName(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">
              {t.stewardNotesLabel}
            </label>
            <textarea
              rows={2}
              value={stewardNotes}
              onChange={(e) => setStewardNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-xs text-white focus:outline-none focus:border-red-600 leading-relaxed"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950 sticky bottom-0">
          <div className="text-[11px] text-slate-500">
            {t.immutableCommitNotice}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-300 hover:text-white rounded-md border border-slate-800 hover:bg-slate-800 transition-colors"
            >
              {locale === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-red-700 hover:bg-red-600 rounded-md transition-colors shadow-sm"
            >
              {t.signOffButton}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
