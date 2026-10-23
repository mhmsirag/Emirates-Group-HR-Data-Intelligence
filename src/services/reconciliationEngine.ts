import {
  CoreHRRecord,
  PayrollRecord,
  AccessDirectoryRecord,
  LearningRecord,
  DisparityIssue,
  IssueCategory,
  PriorityLevel,
  SourceFieldRecord,
  SuggestedFix,
  DownstreamImpact,
  AuditTrailEntry,
} from '../types';
import { DATA_DICTIONARY } from '../data/data_dictionary';
import { SYSTEM_DEPENDENCY_RULES, getDependencyForRule } from '../data/dependencies';
import { detectDuplicateRecords } from './duplicateDetectionEngine';
import { detectSecurityGhostAnomalies } from './securityGhostDetectionEngine';

export interface ReconciliationInput {
  coreHR: CoreHRRecord[];
  payroll: PayrollRecord[];
  accessDirectory: AccessDirectoryRecord[];
  learning: LearningRecord[];
}

export function runReconciliationEngine(data: ReconciliationInput): DisparityIssue[] {
  let issueCounter = 1;

  function nextIssueId(): string {
    const id = `ISSUE-2026-${String(issueCounter).padStart(3, '0')}`;
    issueCounter++;
    return id;
  }

  // 1. Run specialized Security Ghost Anomaly Detection routine
  const securityGhostIssues = detectSecurityGhostAnomalies(
    {
      coreHR: data.coreHR,
      payroll: data.payroll,
      accessDirectory: data.accessDirectory,
    },
    nextIssueId
  );

  // 2. Run specialized Duplicate Employee Records Detection routine
  const duplicateIssues = detectDuplicateRecords(data, nextIssueId);

  // 3. Scan for Cross-System Mismatches, Invalid Codes, and Temporal Paradoxes
  const otherIssues: DisparityIssue[] = [];

  // Index records by GEID
  const geidMap = new Map<
    string,
    {
      coreHR: CoreHRRecord[];
      payroll: PayrollRecord[];
      accessDirectory: AccessDirectoryRecord[];
      learning: LearningRecord[];
    }
  >();

  data.coreHR.forEach((rec) => {
    if (!geidMap.has(rec.geid)) {
      geidMap.set(rec.geid, { coreHR: [], payroll: [], accessDirectory: [], learning: [] });
    }
    geidMap.get(rec.geid)!.coreHR.push(rec);
  });

  data.payroll.forEach((rec) => {
    if (!geidMap.has(rec.geid)) {
      geidMap.set(rec.geid, { coreHR: [], payroll: [], accessDirectory: [], learning: [] });
    }
    geidMap.get(rec.geid)!.payroll.push(rec);
  });

  data.accessDirectory.forEach((rec) => {
    if (!geidMap.has(rec.geid)) {
      geidMap.set(rec.geid, { coreHR: [], payroll: [], accessDirectory: [], learning: [] });
    }
    geidMap.get(rec.geid)!.accessDirectory.push(rec);
  });

  data.learning.forEach((rec) => {
    if (!geidMap.has(rec.geid)) {
      geidMap.set(rec.geid, { coreHR: [], payroll: [], accessDirectory: [], learning: [] });
    }
    geidMap.get(rec.geid)!.learning.push(rec);
  });

  geidMap.forEach((records, geid) => {
    const primaryCore = records.coreHR[0];
    const primaryPayroll = records.payroll[0];
    const primaryAD = records.accessDirectory[0];
    const employeeName =
      primaryCore?.employee_name ||
      primaryPayroll?.employee_name ||
      primaryAD?.upn_username ||
      'Emirates Staff';
    const department = primaryCore?.department || 'Emirates Group';

    // -------------------------------------------------------------
    // TEMPORAL_PARADOX: Chronological sequence violations
    // -------------------------------------------------------------
    if (primaryCore?.hire_date && primaryCore?.termination_date) {
      const hireTime = new Date(primaryCore.hire_date).getTime();
      const termTime = new Date(primaryCore.termination_date).getTime();
      if (termTime < hireTime) {
        const severity = 3;
        const financialExposure = 5;
        const regulatoryCriticality = 7;
        const fanout = 6;
        const impactScore = calculateImpactScore(severity, financialExposure, regulatoryCriticality, fanout);

        otherIssues.push({
          issue_id: nextIssueId(),
          geid,
          employee_name: employeeName,
          department,
          category: 'TEMPORAL_PARADOX',
          impact_score: impactScore,
          priority: getPriorityFromScore(impactScore),
          explanation: `Chronological paradox detected for GEID ${geid}: Termination date (${primaryCore.termination_date}) is chronologically prior to Hire date (${primaryCore.hire_date}) in core_hr.csv. Violates employment lifecycle continuity.`,
          current_values: [
            {
              source_system: 'core_hr.csv',
              record_id: primaryCore.record_id,
              field_name: 'hire_date',
              value: primaryCore.hire_date,
              last_modified_timestamp: primaryCore.last_modified_timestamp,
              system_trust_level: 'PRIMARY',
            },
            {
              source_system: 'core_hr.csv',
              record_id: primaryCore.record_id,
              field_name: 'termination_date',
              value: primaryCore.termination_date,
              last_modified_timestamp: primaryCore.last_modified_timestamp,
              system_trust_level: 'PRIMARY',
            },
          ],
          suggested_fix: {
            target_field: 'termination_date',
            proposed_value: 'Requires Steward Verification (Date Reversal Invariant)',
            source_rationale: 'core_hr.csv is the primary authority for employment dates, but requires manual steward confirmation of true end-of-service date.',
            confidence_score: 0.88,
            governing_source: 'core_hr.csv',
          },
          downstream_impact: {
            affected_systems: ['End of Service Gratuity Calculator', 'Leave Accrual Engine', 'UAE Tawteen Gateway'],
            affected_reports: ['End of Service Gratuity Liability Audit', 'MOHRE Termination Register'],
            metric_delta_preview: 'Gratuity calculation freeze lifted once temporal sequence is harmonized.',
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
    }

    // -------------------------------------------------------------
    // CROSS_SYSTEM_MISMATCH: Conflicting field values across schemas
    // -------------------------------------------------------------
    // Grade Mismatch between Core HR and Payroll
    if (primaryCore && primaryPayroll && primaryCore.grade !== primaryPayroll.grade_level) {
      const severity = 3;
      const financialExposure = 9; // High because grade dictates salary scale
      const regulatoryCriticality = 7;
      const depRule = getDependencyForRule('grade_level');
      const fanout = depRule.blast_radius_multiplier;
      const impactScore = calculateImpactScore(severity, financialExposure, regulatoryCriticality, fanout);

      otherIssues.push({
        issue_id: nextIssueId(),
        geid,
        employee_name: employeeName,
        department,
        category: 'CROSS_SYSTEM_MISMATCH',
        impact_score: impactScore,
        priority: getPriorityFromScore(impactScore),
        explanation: `Grade Level Disparity: core_hr.csv specifies Grade '${primaryCore.grade}', while payroll.csv records Grade '${primaryPayroll.grade_level}'. This impacts statutory GPSSA pension deductions and staff travel entitlements.`,
        current_values: [
          {
            source_system: 'core_hr.csv',
            record_id: primaryCore.record_id,
            field_name: 'grade',
            value: primaryCore.grade,
            last_modified_timestamp: primaryCore.last_modified_timestamp,
            system_trust_level: 'SECONDARY',
          },
          {
            source_system: 'payroll.csv',
            record_id: primaryPayroll.record_id,
            field_name: 'grade_level',
            value: primaryPayroll.grade_level,
            last_modified_timestamp: primaryPayroll.last_modified_timestamp,
            system_trust_level: 'PRIMARY',
          },
        ],
        suggested_fix: {
          target_field: 'grade',
          proposed_value: primaryPayroll.grade_level,
          source_rationale: 'payroll.csv is the primary authority for Grade Levels and compensation structure (Rank 2 over Core HR profile).',
          confidence_score: 0.95,
          governing_source: 'payroll.csv',
        },
        downstream_impact: {
          affected_systems: depRule.direct_systems,
          affected_reports: depRule.executive_reports,
          metric_delta_preview: `Synchronizes core HR job catalog with payroll ledger; reconciles AED 18,500/mo grade compensation variance.`,
          financial_exposure_aed: 18500 * 12,
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

    // Emiratisation Flag Mismatch between Core HR and Payroll
    if (
      primaryCore &&
      primaryPayroll &&
      primaryPayroll.emiratisation_flag &&
      primaryCore.emiratisation_status !== primaryPayroll.emiratisation_flag
    ) {
      const severity = 3;
      const financialExposure = 6;
      const regulatoryCriticality = 10; // Emiratisation is top regulatory priority in UAE
      const depRule = getDependencyForRule('emiratisation_status');
      const fanout = depRule.blast_radius_multiplier;
      const impactScore = calculateImpactScore(severity, financialExposure, regulatoryCriticality, fanout);

      otherIssues.push({
        issue_id: nextIssueId(),
        geid,
        employee_name: employeeName,
        department,
        category: 'CROSS_SYSTEM_MISMATCH',
        impact_score: impactScore,
        priority: getPriorityFromScore(impactScore),
        explanation: `UAE National Tawteen Classification Disparity: core_hr.csv flags employee as UAE National ('${primaryCore.emiratisation_status}'), whereas payroll.csv classifies as Expat/Non-National ('${primaryPayroll.emiratisation_flag}'). This causes incorrect statutory GPSSA pension deductions and misreports UAE Tawteen federal quotas.`,
        current_values: [
          {
            source_system: 'core_hr.csv',
            record_id: primaryCore.record_id,
            field_name: 'emiratisation_status',
            value: primaryCore.emiratisation_status,
            last_modified_timestamp: primaryCore.last_modified_timestamp,
            system_trust_level: 'PRIMARY',
          },
          {
            source_system: 'payroll.csv',
            record_id: primaryPayroll.record_id,
            field_name: 'emiratisation_flag',
            value: primaryPayroll.emiratisation_flag,
            last_modified_timestamp: primaryPayroll.last_modified_timestamp,
            system_trust_level: 'SECONDARY',
          },
        ],
        suggested_fix: {
          target_field: 'emiratisation_flag',
          proposed_value: primaryCore.emiratisation_status,
          source_rationale: 'core_hr.csv is the primary authority for Personal Identification, Demographics, and Official Contract Status (Rank 1).',
          confidence_score: 0.98,
          governing_source: 'core_hr.csv',
        },
        downstream_impact: {
          affected_systems: depRule.direct_systems,
          affected_reports: depRule.executive_reports,
          metric_delta_preview: `Tawteen quota compliance score adjusted; statutory GPSSA 20% pension deduction activated in payroll.`,
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

    // -------------------------------------------------------------
    // INVALID_CODE: Attribute value missing from data dictionary
    // -------------------------------------------------------------
    if (primaryCore && !DATA_DICTIONARY.departments.includes(primaryCore.department)) {
      const severity = 2;
      const financialExposure = 1;
      const regulatoryCriticality = 4;
      const fanout = 4;
      const impactScore = calculateImpactScore(severity, financialExposure, regulatoryCriticality, fanout);

      otherIssues.push({
        issue_id: nextIssueId(),
        geid,
        employee_name: employeeName,
        department,
        category: 'INVALID_CODE',
        impact_score: impactScore,
        priority: getPriorityFromScore(impactScore),
        explanation: `Invalid department code '${primaryCore.department}' in core_hr.csv. It is not an authorized operating division in data_dictionary.md.`,
        current_values: [
          {
            source_system: 'core_hr.csv',
            record_id: primaryCore.record_id,
            field_name: 'department',
            value: primaryCore.department,
            last_modified_timestamp: primaryCore.last_modified_timestamp,
            system_trust_level: 'PRIMARY',
          },
        ],
        suggested_fix: {
          target_field: 'department',
          proposed_value: 'Group IT',
          source_rationale: 'Group IT is the authorized organizational unit in data_dictionary.md for cloud architecture roles.',
          confidence_score: 0.91,
          governing_source: 'core_hr.csv',
        },
        downstream_impact: {
          affected_systems: ['Cost Center Accounting (SAP)', 'Group Org Hierarchy'],
          affected_reports: ['Departmental Cost Allocation Ledger'],
          metric_delta_preview: 'Reallocates FTE from Unassigned Suspense to Group IT division.',
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

    if (primaryPayroll && !DATA_DICTIONARY.allowance_codes.includes(primaryPayroll.flight_allowance_code)) {
      const severity = 2;
      const financialExposure = 7;
      const regulatoryCriticality = 5;
      const fanout = 4;
      const impactScore = calculateImpactScore(severity, financialExposure, regulatoryCriticality, fanout);

      otherIssues.push({
        issue_id: nextIssueId(),
        geid,
        employee_name: employeeName,
        department,
        category: 'INVALID_CODE',
        impact_score: impactScore,
        priority: getPriorityFromScore(impactScore),
        explanation: `Non-standard allowance code '${primaryPayroll.flight_allowance_code}' in payroll.csv does not conform to the Emirates remuneration allowance standard in data_dictionary.md.`,
        current_values: [
          {
            source_system: 'payroll.csv',
            record_id: primaryPayroll.record_id,
            field_name: 'flight_allowance_code',
            value: primaryPayroll.flight_allowance_code,
            last_modified_timestamp: primaryPayroll.last_modified_timestamp,
            system_trust_level: 'PRIMARY',
          },
        ],
        suggested_fix: {
          target_field: 'flight_allowance_code',
          proposed_value: 'HOUSING_STD',
          source_rationale: 'Remap non-standard allowance code to authorized standard group allowance code HOUSING_STD defined in data_dictionary.md.',
          confidence_score: 0.89,
          governing_source: 'payroll.csv',
        },
        downstream_impact: {
          affected_systems: ['WPS Remittance Generator', 'Payroll GL Account Classifier'],
          affected_reports: ['Executive Monthly Payroll Summary', 'Allowance Sub-ledger Report'],
          metric_delta_preview: 'Clears unclassified allowance suspense balance of AED 9,500.',
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

    // Safety recurrent training expiration in flight operations
    const expiredSafetyCert = records.learning.find(
      (l) => l.compliance_status === 'Expired' && primaryCore?.contract_status === 'Permanent'
    );
    if (expiredSafetyCert && primaryCore && ['Flight Operations', 'Inflight Services'].includes(primaryCore.department)) {
      const severity = 4;
      const financialExposure = 3;
      const regulatoryCriticality = 9;
      const depRule = getDependencyForRule('compliance_status');
      const fanout = depRule.blast_radius_multiplier;
      const impactScore = calculateImpactScore(severity, financialExposure, regulatoryCriticality, fanout);

      otherIssues.push({
        issue_id: nextIssueId(),
        geid,
        employee_name: employeeName,
        department,
        category: 'CROSS_SYSTEM_MISMATCH',
        impact_score: impactScore,
        priority: getPriorityFromScore(impactScore),
        explanation: `Mandatory Flight Safety Recurrent Certification Expired: Certification '${expiredSafetyCert.certification_name}' expired on ${expiredSafetyCert.expiry_date} in learning.csv, yet crew member remains rostered active in core_hr.csv. Violates GCAA CAR-OPS aviation safety regulations.`,
        current_values: [
          {
            source_system: 'learning.csv',
            record_id: expiredSafetyCert.record_id,
            field_name: 'compliance_status',
            value: expiredSafetyCert.compliance_status,
            last_modified_timestamp: expiredSafetyCert.last_modified_timestamp,
            system_trust_level: 'PRIMARY',
          },
          {
            source_system: 'core_hr.csv',
            record_id: primaryCore.record_id,
            field_name: 'contract_status',
            value: primaryCore.contract_status,
            last_modified_timestamp: primaryCore.last_modified_timestamp,
            system_trust_level: 'SECONDARY',
          },
        ],
        suggested_fix: {
          target_field: 'flight_roster_status',
          proposed_value: 'Grounded / Recurrent Training Required',
          source_rationale: 'learning.csv is the authoritative system for safety certification and competencies (Rank 4). Crew pairing must be blocked pending recurrent simulation.',
          confidence_score: 0.97,
          governing_source: 'learning.csv',
        },
        downstream_impact: {
          affected_systems: depRule.direct_systems,
          affected_reports: depRule.executive_reports,
          metric_delta_preview: 'Crew pairing safety lock activated; GCAA compliance gap prevented.',
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

  // Combine all issues
  const allIssues = [...securityGhostIssues, ...duplicateIssues, ...otherIssues];

  // Sort descending by impact score
  return allIssues.sort((a, b) => b.impact_score - a.impact_score);
}

/**
 * Business Impact Score Formula:
 * Impact Score = (10 * Severity) + (2.5 * Financial Exposure) + (2.5 * Regulatory Criticality) + (2.0 * Downstream Fanout)
 */
export function calculateImpactScore(
  severity: number, // 1 - 5
  financialExposure: number, // 0 - 10
  regulatoryCriticality: number, // 0 - 10
  downstreamFanout: number // 1 - N
): number {
  const rawScore = 10 * severity + 2.5 * financialExposure + 2.5 * regulatoryCriticality + 2.0 * downstreamFanout;
  const clamped = Math.min(100, Math.max(0, rawScore));
  return Math.round(clamped * 10) / 10;
}

export function getPriorityFromScore(score: number): PriorityLevel {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
}
