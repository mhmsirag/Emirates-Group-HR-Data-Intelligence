/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Overview } from './components/Overview';
import { TriageQueue } from './components/TriageQueue';
import { BlastRadiusView } from './components/BlastRadiusView';
import { SecurityGhostConsole } from './components/SecurityGhostConsole';
import { DuplicateConsolidationStudio } from './components/DuplicateConsolidationStudio';
import { StewardWorkspace } from './components/StewardWorkspace';
import { StewardReviewModal } from './components/StewardReviewModal';
import { LeadershipQuery } from './components/LeadershipQuery';
import { DataDictionaryView } from './components/DataDictionaryView';
import { SchemaJsonModal } from './components/SchemaJsonModal';
import {
  SAMPLE_CORE_HR,
  SAMPLE_PAYROLL,
  SAMPLE_ACCESS_DIRECTORY,
  SAMPLE_LEARNING,
} from './data/sample_datasets';
import { runReconciliationEngine } from './services/reconciliationEngine';
import { DisparityIssue } from './types';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';

function AppContent() {
  const { t, locale, isRtl } = useLanguage();
  const [issues, setIssues] = useState<DisparityIssue[]>([]);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [triageCategoryFilter, setTriageCategoryFilter] = useState<string>('ALL');
  const [selectedLineageIssue, setSelectedLineageIssue] = useState<DisparityIssue | null>(null);
  const [selectedStewardIssue, setSelectedStewardIssue] = useState<DisparityIssue | null>(null);
  const [selectedSchemaIssue, setSelectedSchemaIssue] = useState<DisparityIssue | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isReconciling, setIsReconciling] = useState<boolean>(false);

  // Initialize engine data
  const initializeReconciliation = () => {
    setIsReconciling(true);
    try {
      const computedIssues = runReconciliationEngine({
        coreHR: SAMPLE_CORE_HR,
        payroll: SAMPLE_PAYROLL,
        accessDirectory: SAMPLE_ACCESS_DIRECTORY,
        learning: SAMPLE_LEARNING,
      });
      setIssues(computedIssues);
      if (computedIssues.length > 0 && !selectedLineageIssue) {
        setSelectedLineageIssue(computedIssues[0]);
      }
    } catch (e) {
      console.error('Reconciliation error:', e);
    } finally {
      setIsReconciling(false);
    }
  };

  // Fetch persistent audit logs from backend API
  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/audit-log');
      const data = await res.json();
      if (data.audit_logs) {
        setAuditLogs(data.audit_logs);
      }
    } catch (e) {
      console.log('Local standalone mode, using internal audit log cache');
    }
  };

  useEffect(() => {
    initializeReconciliation();
    fetchAuditLogs();
  }, []);

  // Save Steward Decision (Human-in-the-Loop)
  const handleSaveDecision = async (
    issueId: string,
    action: 'APPROVED' | 'REJECTED' | 'OVERRIDDEN',
    stewardData: {
      steward_id: string;
      steward_name: string;
      steward_notes: string;
      custom_value?: string;
    }
  ) => {
    const timestamp = new Date().toISOString();

    setIssues((prev) =>
      prev.map((iss) => {
        if (iss.issue_id === issueId) {
          const updatedProposed =
            action === 'OVERRIDDEN' && stewardData.custom_value
              ? stewardData.custom_value
              : iss.suggested_fix.proposed_value;

          return {
            ...iss,
            status: action,
            suggested_fix: {
              ...iss.suggested_fix,
              proposed_value: updatedProposed,
            },
            audit_trail_entry: {
              timestamp,
              action,
              requires_steward_approval: false,
              steward_id: stewardData.steward_id,
              steward_name: stewardData.steward_name,
              steward_notes: stewardData.steward_notes,
              reviewed_at: timestamp.replace('T', ' ').slice(0, 19),
            },
          };
        }
        return iss;
      })
    );

    // Commit to server-side audit log
    const targetIssue = issues.find((i) => i.issue_id === issueId);
    const newAuditEntry = {
      timestamp,
      issue_id: issueId,
      geid: targetIssue?.geid || 'GEID-UNKNOWN',
      employee_name: targetIssue?.employee_name || 'Staff Member',
      action,
      steward_id: stewardData.steward_id,
      steward_name: stewardData.steward_name,
      steward_notes: stewardData.steward_notes,
      target_field: targetIssue?.suggested_fix.target_field || 'status',
      resolved_value:
        action === 'OVERRIDDEN' && stewardData.custom_value
          ? stewardData.custom_value
          : targetIssue?.suggested_fix.proposed_value,
      source_rationale: targetIssue?.suggested_fix.source_rationale,
    };

    try {
      await fetch('/api/audit-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAuditEntry),
      });
      setAuditLogs((prev) => [newAuditEntry, ...prev]);
    } catch (e) {
      setAuditLogs((prev) => [newAuditEntry, ...prev]);
    }
  };

  // Export full audit log JSON file
  const handleExportAuditLog = () => {
    const combinedAuditTrail = [
      ...issues
        .filter((i) => i.status !== 'PENDING_REVIEW')
        .map((i) => ({
          timestamp: i.audit_trail_entry.timestamp,
          issue_id: i.issue_id,
          geid: i.geid,
          employee_name: i.employee_name,
          category: i.category,
          action: i.status,
          steward_id: i.audit_trail_entry.steward_id,
          steward_name: i.audit_trail_entry.steward_name,
          steward_notes: i.audit_trail_entry.steward_notes,
          suggested_fix: i.suggested_fix,
        })),
      ...auditLogs,
    ];

    const jsonString = JSON.stringify(combinedAuditTrail, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emirates_hr_audit_log_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleNavigate = (tab: string, categoryFilter?: string) => {
    if (categoryFilter) {
      setTriageCategoryFilter(categoryFilter);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pendingCount = issues.filter((i) => i.status === 'PENDING_REVIEW').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingCount}
        onExportAuditLog={handleExportAuditLog}
        onResetData={initializeReconciliation}
        isReconciling={isReconciling}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'overview' && (
          <Overview
            issues={issues}
            totalGeidsCount={SAMPLE_CORE_HR.length}
            onNavigate={handleNavigate}
            auditCount={auditLogs.length}
          />
        )}

        {activeTab === 'triage' && (
          <TriageQueue
            issues={issues}
            initialCategory={triageCategoryFilter}
            onSelectIssueForLineage={(iss) => {
              setSelectedLineageIssue(iss);
              setActiveTab('lineage');
            }}
            onSelectIssueForSteward={(iss) => setSelectedStewardIssue(iss)}
            onViewSchemaJson={(iss) => setSelectedSchemaIssue(iss)}
          />
        )}

        {activeTab === 'security_ghosts' && (
          <SecurityGhostConsole
            issues={issues}
            onOpenStewardModal={(iss) => setSelectedStewardIssue(iss)}
            onSelectIssueForLineage={(iss) => {
              setSelectedLineageIssue(iss);
              setActiveTab('lineage');
            }}
          />
        )}

        {activeTab === 'duplicates' && (
          <DuplicateConsolidationStudio
            issues={issues}
            onOpenStewardModal={(iss) => setSelectedStewardIssue(iss)}
            onSelectIssueForLineage={(iss) => {
              setSelectedLineageIssue(iss);
              setActiveTab('lineage');
            }}
          />
        )}

        {activeTab === 'lineage' && (
          <BlastRadiusView
            issues={issues}
            selectedIssueId={selectedLineageIssue?.issue_id}
            onSelectIssue={(iss) => setSelectedLineageIssue(iss)}
            onOpenStewardModal={(iss) => setSelectedStewardIssue(iss)}
          />
        )}

        {activeTab === 'steward' && (
          <StewardWorkspace
            issues={issues}
            auditLogs={auditLogs}
            onOpenStewardModal={(iss) => setSelectedStewardIssue(iss)}
            onExportAuditLog={handleExportAuditLog}
          />
        )}

        {activeTab === 'query' && (
          <LeadershipQuery
            issues={issues}
            onSelectIssueForLineage={(iss) => {
              setSelectedLineageIssue(iss);
              setActiveTab('lineage');
            }}
          />
        )}

        {activeTab === 'dictionary' && <DataDictionaryView />}
      </main>

      {/* Steward Human-in-the-Loop Review Modal */}
      <StewardReviewModal
        issue={selectedStewardIssue}
        isOpen={Boolean(selectedStewardIssue)}
        onClose={() => setSelectedStewardIssue(null)}
        onSaveDecision={handleSaveDecision}
      />

      {/* Strict Schema 1 Format Modal */}
      <SchemaJsonModal
        issue={selectedSchemaIssue}
        isOpen={Boolean(selectedSchemaIssue)}
        onClose={() => setSelectedSchemaIssue(null)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 text-xs text-slate-500 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">{t.brandName}</span>
            <span>·</span>
            <span>{t.brandSubtitle}</span>
            <span>·</span>
            <span className="font-mono text-[11px] text-slate-400">{t.footerCompliance}</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
            <span>{t.footerSources}</span>
            <span>·</span>
            <span>{t.footerGovernance}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
