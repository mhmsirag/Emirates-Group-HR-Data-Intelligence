import {
  CoreHRRecord,
  PayrollRecord,
  AccessDirectoryRecord,
  LearningRecord,
  DisparityIssue,
  SourceFieldRecord,
  SuggestedFix,
  DownstreamImpact,
  AuditTrailEntry,
} from '../types';
import { calculateImpactScore, getPriorityFromScore } from './reconciliationEngine';

export interface DuplicateScanInput {
  coreHR: CoreHRRecord[];
  payroll: PayrollRecord[];
  accessDirectory: AccessDirectoryRecord[];
  learning: LearningRecord[];
}

/**
 * Specialized Detection Routine for Duplicate Employee Records
 * Scans individual source files (core_hr.csv, payroll.csv, access_directory.csv)
 * to identify multiple records associated with the same Global Entity ID (GEID).
 * Formulates consolidation strategy based on Source Trust Hierarchy & timestamp tie-breaker.
 */
export function detectDuplicateRecords(
  data: DuplicateScanInput,
  idGenerator: () => string
): DisparityIssue[] {
  const duplicateIssues: DisparityIssue[] = [];

  // 1. Scan core_hr.csv for duplicates
  const coreHrByGeid = new Map<string, CoreHRRecord[]>();
  data.coreHR.forEach((rec) => {
    if (!coreHrByGeid.has(rec.geid)) coreHrByGeid.set(rec.geid, []);
    coreHrByGeid.get(rec.geid)!.push(rec);
  });

  coreHrByGeid.forEach((records, geid) => {
    if (records.length > 1) {
      // Sort descending by last_modified_timestamp to identify authoritative record
      const sorted = [...records].sort(
        (a, b) => new Date(b.last_modified_timestamp).getTime() - new Date(a.last_modified_timestamp).getTime()
      );
      const survivingRecord = sorted[0];
      const redundantRecords = sorted.slice(1);

      const severity = 3; // Duplicate active contract is Severity 3
      const financialExposure = 5; // Risk of dual benefits, leave accruals, double salary accrual
      const regulatoryCriticality = 7; // Dual contract regulatory violation under UAE labor law
      const fanout = 6;
      const impactScore = calculateImpactScore(severity, financialExposure, regulatoryCriticality, fanout);

      const fieldValues: SourceFieldRecord[] = records.map((r, index) => ({
        source_system: 'core_hr.csv',
        record_id: r.record_id,
        field_name: `contract_record_${r.record_id}`,
        value: `Hire: ${r.hire_date} | Grade: ${r.grade} | Status: ${r.contract_status} | Timestamp: ${r.last_modified_timestamp}`,
        last_modified_timestamp: r.last_modified_timestamp,
        system_trust_level: index === 0 ? 'PRIMARY' : 'SECONDARY',
      }));

      const issueId = idGenerator();
      const consolidationStrategy = `Retain authoritative record '${survivingRecord.record_id}' (most recent timestamp: ${survivingRecord.last_modified_timestamp}) as the active master contract in core_hr.csv. Merge cumulative tenure starting from earliest hire date (${records.map(r => r.hire_date).sort()[0]}) and decommission redundant contract record(s): ${redundantRecords.map(r => `'${r.record_id}'`).join(', ')}.`;

      duplicateIssues.push({
        issue_id: issueId,
        geid,
        employee_name: survivingRecord.employee_name,
        department: survivingRecord.department,
        category: 'DUPLICATE',
        impact_score: impactScore,
        priority: getPriorityFromScore(impactScore),
        explanation: `Duplicate Records in core_hr.csv: ${records.length} active employment contract profiles (${records.map((r) => r.record_id).join(', ')}) mapped to GEID ${geid}. Differing hire dates (${records.map((r) => r.hire_date).join(' vs ')}). Violates single-employee entity uniqueness invariant.`,
        current_values: fieldValues,
        suggested_fix: {
          target_field: 'master_contract_record_id',
          proposed_value: survivingRecord.record_id,
          source_rationale: `core_hr is the Primary Authority (Rank 1) for employment records. Applying deterministic tie-breaker: Record '${survivingRecord.record_id}' has the most recent update (${survivingRecord.last_modified_timestamp}).`,
          confidence_score: 0.96,
          governing_source: 'core_hr.csv',
        },
        downstream_impact: {
          affected_systems: [
            'Oracle HCM Cloud Master Repository',
            'SAP S/4HANA Finance General Ledger',
            'Workday Identity Federation',
          ],
          affected_reports: [
            'Executive Monthly Headcount Report',
            'Dubai Labor Ministry Dual-Contract Audit',
            'Group Seniority & Gratuity Liability Ledger',
          ],
          metric_delta_preview: `Eliminates 1 duplicate FTE; adjusts Emirates Group headcount baseline and resolves tenure seniority accrual.`,
        },
        audit_trail_entry: {
          timestamp: new Date().toISOString(),
          action: 'RECOMMEND_FIX',
          requires_steward_approval: true,
        },
        impact_factors: {
          severity,
          financial_exposure: financialExposure,
          regulatory_criticality: regulatoryCriticality,
          downstream_fanout: fanout,
        },
        status: 'PENDING_REVIEW',
      });
    }
  });

  // 2. Scan payroll.csv for duplicates
  const payrollByGeid = new Map<string, PayrollRecord[]>();
  data.payroll.forEach((rec) => {
    if (!payrollByGeid.has(rec.geid)) payrollByGeid.set(rec.geid, []);
    payrollByGeid.get(rec.geid)!.push(rec);
  });

  payrollByGeid.forEach((records, geid) => {
    if (records.length > 1) {
      const sorted = [...records].sort(
        (a, b) => new Date(b.last_modified_timestamp).getTime() - new Date(a.last_modified_timestamp).getTime()
      );
      const survivingRecord = sorted[0];
      const redundantRecords = sorted.slice(1);

      const severity = 4; // Multiple payroll records causes duplicate wage disbursals
      const financialExposure = 9; // High risk of duplicate banking WPS remittances
      const regulatoryCriticality = 8; // Central Bank UAE WPS compliance
      const fanout = 6;
      const impactScore = calculateImpactScore(severity, financialExposure, regulatoryCriticality, fanout);

      const fieldValues: SourceFieldRecord[] = records.map((r, index) => ({
        source_system: 'payroll.csv',
        record_id: r.record_id,
        field_name: `payroll_profile_${r.record_id}`,
        value: `IBAN: ${r.iban} | Basic: AED ${r.basic_salary_aed} | Grade: ${r.grade_level} | Modified: ${r.last_modified_timestamp}`,
        last_modified_timestamp: r.last_modified_timestamp,
        system_trust_level: index === 0 ? 'PRIMARY' : 'SECONDARY',
      }));

      const issueId = idGenerator();
      const consolidationStrategy = `Consolidate payroll profile into master record '${survivingRecord.record_id}' with active verified IBAN (${survivingRecord.iban}) and basic salary AED ${survivingRecord.basic_salary_aed.toLocaleString()}. Archive duplicate remittance profile(s): ${redundantRecords.map(r => `'${r.record_id}'`).join(', ')}.`;

      duplicateIssues.push({
        issue_id: issueId,
        geid,
        employee_name: survivingRecord.employee_name,
        department: 'Emirates Group Remuneration',
        category: 'DUPLICATE',
        impact_score: impactScore,
        priority: getPriorityFromScore(impactScore),
        explanation: `Duplicate Active Payroll Records in payroll.csv: ${records.length} disbursement profiles (${records.map((r) => r.record_id).join(', ')}) mapped to GEID ${geid} with conflicting IBANs (${records.map(r => r.iban).join(' vs ')}). High risk of dual bank wire transfers.`,
        current_values: fieldValues,
        suggested_fix: {
          target_field: 'master_payroll_record_id',
          proposed_value: survivingRecord.record_id,
          source_rationale: `payroll.csv is Primary Authority (Rank 2) for financial structures. Applying deterministic tie-breaker: Record '${survivingRecord.record_id}' carries the newest timestamp (${survivingRecord.last_modified_timestamp}).`,
          confidence_score: 0.95,
          governing_source: 'payroll.csv',
        },
        downstream_impact: {
          affected_systems: [
            'WPS Central Bank Direct Remittance Generator',
            'First Abu Dhabi Bank Host-to-Host Gateway',
            'SAP Finance General Ledger',
          ],
          affected_reports: [
            'Executive Monthly Payroll Summary',
            'Central Bank WPS Compliance Verification',
            'Group Salary Wire Variance Audit',
          ],
          metric_delta_preview: `Halts duplicate bank routing; secures monthly salary remittance against AED ${(redundantRecords.reduce((acc, r) => acc + r.basic_salary_aed, 0)).toLocaleString()} unauthorized double payment.`,
          financial_exposure_aed: redundantRecords.reduce((acc, r) => acc + (r.basic_salary_aed + r.housing_allowance_aed) * 12, 0),
        },
        audit_trail_entry: {
          timestamp: new Date().toISOString(),
          action: 'RECOMMEND_FIX',
          requires_steward_approval: true,
        },
        impact_factors: {
          severity,
          financial_exposure: financialExposure,
          regulatory_criticality: regulatoryCriticality,
          downstream_fanout: fanout,
        },
        status: 'PENDING_REVIEW',
      });
    }
  });

  // 3. Scan access_directory.csv for duplicates
  const adByGeid = new Map<string, AccessDirectoryRecord[]>();
  data.accessDirectory.forEach((rec) => {
    if (!adByGeid.has(rec.geid)) adByGeid.set(rec.geid, []);
    adByGeid.get(rec.geid)!.push(rec);
  });

  adByGeid.forEach((records, geid) => {
    if (records.length > 1) {
      const sorted = [...records].sort(
        (a, b) => new Date(b.last_modified_timestamp).getTime() - new Date(a.last_modified_timestamp).getTime()
      );
      const survivingRecord = sorted[0];
      const redundantRecords = sorted.slice(1);

      const severity = 3;
      const financialExposure = 3;
      const regulatoryCriticality = 7;
      const fanout = 5;
      const impactScore = calculateImpactScore(severity, financialExposure, regulatoryCriticality, fanout);

      const fieldValues: SourceFieldRecord[] = records.map((r, index) => ({
        source_system: 'access_directory.csv',
        record_id: r.record_id,
        field_name: `access_account_${r.record_id}`,
        value: `UPN: ${r.upn_username} | Clearance: ${r.physical_airport_access_level} | Badge: ${r.building_badge_status}`,
        last_modified_timestamp: r.last_modified_timestamp,
        system_trust_level: index === 0 ? 'PRIMARY' : 'SECONDARY',
      }));

      const issueId = idGenerator();

      duplicateIssues.push({
        issue_id: issueId,
        geid,
        employee_name: survivingRecord.upn_username,
        department: 'Group IT & Aviation Security',
        category: 'DUPLICATE',
        impact_score: impactScore,
        priority: getPriorityFromScore(impactScore),
        explanation: `Duplicate IT / Airport Security Credentials in access_directory.csv: ${records.length} accounts (${records.map((r) => r.record_id).join(', ')}) registered to GEID ${geid} with conflicting UPNs (${records.map((r) => r.upn_username).join(' vs ')}).`,
        current_values: fieldValues,
        suggested_fix: {
          target_field: 'master_upn_username',
          proposed_value: survivingRecord.upn_username,
          source_rationale: `access_directory is Primary Authority for IT Access Status (Rank 3). Applying deterministic tie-breaker: Record '${survivingRecord.record_id}' (${survivingRecord.upn_username}) has newest timestamp (${survivingRecord.last_modified_timestamp}). Decommission duplicate badge ${redundantRecords.map(r => r.record_id).join(', ')}.`,
          confidence_score: 0.94,
          governing_source: 'access_directory.csv',
        },
        downstream_impact: {
          affected_systems: [
            'Azure Active Directory',
            'Dubai International Airport Airside Badge Gateways',
            'Microsoft 365 License Manager',
          ],
          affected_reports: [
            'IT License Optimization & Dormant Account Audit',
            'Cybersecurity Identity Hygiene Report',
          ],
          metric_delta_preview: `Consolidates multi-identity footprint; disables orphan airport credential and recovers 1 redundant M365 SaaS enterprise seat.`,
        },
        audit_trail_entry: {
          timestamp: new Date().toISOString(),
          action: 'RECOMMEND_FIX',
          requires_steward_approval: true,
        },
        impact_factors: {
          severity,
          financial_exposure: financialExposure,
          regulatory_criticality: regulatoryCriticality,
          downstream_fanout: fanout,
        },
        status: 'PENDING_REVIEW',
      });
    }
  });

  return duplicateIssues;
}
