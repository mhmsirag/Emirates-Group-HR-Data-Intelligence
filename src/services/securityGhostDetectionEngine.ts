import {
  CoreHRRecord,
  PayrollRecord,
  AccessDirectoryRecord,
  DisparityIssue,
  SourceFieldRecord,
  SuggestedFix,
  DownstreamImpact,
  AuditTrailEntry,
} from '../types';
import { getDependencyForRule } from '../data/dependencies';
import { calculateImpactScore, getPriorityFromScore } from './reconciliationEngine';

export interface SecurityGhostScanInput {
  coreHR: CoreHRRecord[];
  payroll: PayrollRecord[];
  accessDirectory: AccessDirectoryRecord[];
}

/**
 * Specialized Detection Routine for SECURITY_GHOST Anomalies
 * Cross-references employee lifecycle status between core_hr (termination status)
 * and access_directory and payroll (active status).
 * Prioritizes Severity=5 and formulates deterministic alignment with core_hr.
 */
export function detectSecurityGhostAnomalies(
  data: SecurityGhostScanInput,
  idGenerator: () => string
): DisparityIssue[] {
  const ghostIssues: DisparityIssue[] = [];

  // Index core_hr records by GEID
  const coreMap = new Map<string, CoreHRRecord>();
  data.coreHR.forEach((rec) => {
    // If duplicate in core_hr, prefer terminated or latest
    if (!coreMap.has(rec.geid) || rec.contract_status === 'Terminated') {
      coreMap.set(rec.geid, rec);
    }
  });

  // Index payroll records by GEID
  const payrollMap = new Map<string, PayrollRecord[]>();
  data.payroll.forEach((rec) => {
    if (!payrollMap.has(rec.geid)) payrollMap.set(rec.geid, []);
    payrollMap.get(rec.geid)!.push(rec);
  });

  // Index access_directory records by GEID
  const accessMap = new Map<string, AccessDirectoryRecord[]>();
  data.accessDirectory.forEach((rec) => {
    if (!accessMap.has(rec.geid)) accessMap.set(rec.geid, []);
    accessMap.get(rec.geid)!.push(rec);
  });

  // Cross-reference all core_hr terminated or inactive employees
  coreMap.forEach((coreRec, geid) => {
    const isTerminated = coreRec.contract_status === 'Terminated' || coreRec.contract_status === 'Inactive';
    if (!isTerminated) return;

    const adRecords = accessMap.get(geid) || [];
    const payrollRecords = payrollMap.get(geid) || [];

    const activeAdRecords = adRecords.filter(
      (ad) => ad.active_directory_status === 'Active' || ad.building_badge_status === 'Active'
    );
    const activePayrollRecords = payrollRecords.filter((p) => p.payroll_status === 'Active');

    // Case 1: Dual Ghost (Both Access Directory AND Payroll active post-termination)
    if (activeAdRecords.length > 0 && activePayrollRecords.length > 0) {
      const primaryAd = activeAdRecords[0];
      const primaryPay = activePayrollRecords[0];

      const severity = 5; // Mandated Severity 5
      const financialExposure = 10; // Active monthly salary disbursement
      const regulatoryCriticality = primaryAd.physical_airport_access_level === 'LEVEL_4_FLIGHT_DECK' ? 10 : 9;
      const depRule = getDependencyForRule('contract_status');
      const fanout = 9; // High fanout across both IT security and financial banking
      const impactScore = calculateImpactScore(severity, financialExposure, regulatoryCriticality, fanout);

      const monthlyLeakedWage = primaryPay.basic_salary_aed + primaryPay.housing_allowance_aed;
      const annualizedExposure = monthlyLeakedWage * 12;

      ghostIssues.push({
        issue_id: idGenerator(),
        geid,
        employee_name: coreRec.employee_name,
        department: coreRec.department,
        category: 'SECURITY_GHOST',
        impact_score: impactScore,
        priority: getPriorityFromScore(impactScore),
        explanation: `Critical Dual Security & Financial Ghost: Employee was officially terminated in core_hr.csv on ${coreRec.termination_date || 'N/A'}, yet retains BOTH active IT/Airside credentials in access_directory.csv (${primaryAd.physical_airport_access_level}) AND ongoing monthly salary disbursal in payroll.csv (AED ${monthlyLeakedWage.toLocaleString()}/mo to IBAN ${primaryPay.iban}). Recent badge swipe recorded on ${primaryAd.last_badge_swipe || 'recent'}.`,
        current_values: [
          {
            source_system: 'core_hr.csv',
            record_id: coreRec.record_id,
            field_name: 'contract_status',
            value: coreRec.contract_status,
            last_modified_timestamp: coreRec.last_modified_timestamp,
            system_trust_level: 'PRIMARY',
          },
          {
            source_system: 'access_directory.csv',
            record_id: primaryAd.record_id,
            field_name: 'active_directory_status',
            value: primaryAd.active_directory_status,
            last_modified_timestamp: primaryAd.last_modified_timestamp,
            system_trust_level: 'SECONDARY',
          },
          {
            source_system: 'access_directory.csv',
            record_id: primaryAd.record_id,
            field_name: 'physical_airport_access_level',
            value: primaryAd.physical_airport_access_level,
            last_modified_timestamp: primaryAd.last_modified_timestamp,
            system_trust_level: 'SECONDARY',
          },
          {
            source_system: 'payroll.csv',
            record_id: primaryPay.record_id,
            field_name: 'payroll_status',
            value: primaryPay.payroll_status,
            last_modified_timestamp: primaryPay.last_modified_timestamp,
            system_trust_level: 'SECONDARY',
          },
        ],
        suggested_fix: {
          target_field: 'enterprise_lifecycle_status',
          proposed_value: 'Terminated',
          source_rationale: `core_hr.csv is the governing Source of Truth (Rank 1). Synchronously disable Active Directory account, revoke DXB Airside biometric pass (${primaryAd.physical_airport_access_level}), and halt WPS bank auto-disbursement in payroll.`,
          confidence_score: 0.99,
          governing_source: 'core_hr.csv',
        },
        downstream_impact: {
          affected_systems: [
            ...depRule.direct_systems,
            'WPS Central Bank Direct Remittance Generator',
            'First Abu Dhabi Bank Disbursal Gateway',
          ],
          affected_reports: [
            ...depRule.executive_reports,
            'Executive Monthly Payroll Summary',
            'Central Bank Wage Protection Compliance Audit',
          ],
          metric_delta_preview: `Eliminates high-priority airside breach risk (${primaryAd.physical_airport_access_level}) and halts recurring cash leak of AED ${monthlyLeakedWage.toLocaleString()}/month.`,
          financial_exposure_aed: annualizedExposure,
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
      return;
    }

    // Case 2: IT / Airport Airside Security Ghost
    if (activeAdRecords.length > 0) {
      const primaryAd = activeAdRecords[0];
      const severity = 5; // Mandated Severity 5
      const financialExposure = 4; // IT SaaS license waste + liability
      const isCockpitOrRamp =
        primaryAd.physical_airport_access_level === 'LEVEL_4_FLIGHT_DECK' ||
        primaryAd.physical_airport_access_level === 'LEVEL_2_RAMP';
      const regulatoryCriticality = isCockpitOrRamp ? 10 : 8; // GCAA Aviation Security violation
      const depRule = getDependencyForRule('contract_status');
      const fanout = depRule.blast_radius_multiplier;
      const impactScore = calculateImpactScore(severity, financialExposure, regulatoryCriticality, fanout);

      const securityRiskText =
        primaryAd.physical_airport_access_level === 'LEVEL_4_FLIGHT_DECK'
          ? 'Severe Flight Deck Breach Risk: Former pilot possesses live unescorted cockpit and secure airfield biometric credentials post-separation.'
          : primaryAd.physical_airport_access_level === 'LEVEL_2_RAMP'
          ? 'Airside Apron & Ramp Violation: Separated staff maintains physical airside gate badge at Dubai International Airport (DXB).'
          : 'Corporate Identity Threat: Terminated staff maintains live Single Sign-On (SSO) session, Microsoft 365, and corporate VPN access.';

      ghostIssues.push({
        issue_id: idGenerator(),
        geid,
        employee_name: coreRec.employee_name,
        department: coreRec.department,
        category: 'SECURITY_GHOST',
        impact_score: impactScore,
        priority: getPriorityFromScore(impactScore),
        explanation: `Security Ghost (Physical Airside / IT Access): Employee marked '${coreRec.contract_status}' in core_hr.csv on ${coreRec.termination_date || 'N/A'}, yet retains 'Active' status in access_directory.csv with Airside Clearance Level '${primaryAd.physical_airport_access_level}'. ${securityRiskText} Recent swipe recorded on ${primaryAd.last_badge_swipe || 'recent'}.`,
        current_values: [
          {
            source_system: 'core_hr.csv',
            record_id: coreRec.record_id,
            field_name: 'contract_status',
            value: coreRec.contract_status,
            last_modified_timestamp: coreRec.last_modified_timestamp,
            system_trust_level: 'PRIMARY',
          },
          {
            source_system: 'access_directory.csv',
            record_id: primaryAd.record_id,
            field_name: 'active_directory_status',
            value: primaryAd.active_directory_status,
            last_modified_timestamp: primaryAd.last_modified_timestamp,
            system_trust_level: 'SECONDARY',
          },
          {
            source_system: 'access_directory.csv',
            record_id: primaryAd.record_id,
            field_name: 'physical_airport_access_level',
            value: primaryAd.physical_airport_access_level,
            last_modified_timestamp: primaryAd.last_modified_timestamp,
            system_trust_level: 'SECONDARY',
          },
        ],
        suggested_fix: {
          target_field: 'active_directory_status',
          proposed_value: 'Disabled',
          source_rationale: `core_hr.csv is the Primary Authority (Rank 1) for employment lifecycle status. Airside clearance and Active Directory token must be immediately revoked to enforce GCAA CAR-SEC compliance.`,
          confidence_score: 0.99,
          governing_source: 'core_hr.csv',
        },
        downstream_impact: {
          affected_systems: depRule.direct_systems,
          affected_reports: depRule.executive_reports,
          metric_delta_preview: `Revokes live ${primaryAd.physical_airport_access_level} badge credentials at DXB Nedap turnstiles; decreases active enterprise identity count from 4,120 to 4,119.`,
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

    // Case 3: Payroll Ghost (Terminated in Core HR, but still active in Payroll)
    if (activePayrollRecords.length > 0) {
      const primaryPay = activePayrollRecords[0];
      const severity = 5; // Mandated Severity 5
      const financialExposure = 10; // Ongoing unearned salary drain
      const regulatoryCriticality = 9; // Ministry Tawteen / Central Bank WPS violations
      const fanout = 8;
      const impactScore = calculateImpactScore(severity, financialExposure, regulatoryCriticality, fanout);

      const monthlyLeakedWage = primaryPay.basic_salary_aed + primaryPay.housing_allowance_aed;
      const annualizedExposure = monthlyLeakedWage * 12;

      ghostIssues.push({
        issue_id: idGenerator(),
        geid,
        employee_name: coreRec.employee_name,
        department: coreRec.department,
        category: 'SECURITY_GHOST',
        impact_score: impactScore,
        priority: getPriorityFromScore(impactScore),
        explanation: `Security Ghost (Unauthorized Payroll Disbursal): Employee marked '${coreRec.contract_status}' in core_hr.csv on ${coreRec.termination_date || 'N/A'}, yet payroll.csv maintains 'Active' status disbursing AED ${monthlyLeakedWage.toLocaleString()}/month to bank IBAN ${primaryPay.iban}. Creates severe corporate financial leakage and false reporting under UAE Central Bank WPS guidelines.`,
        current_values: [
          {
            source_system: 'core_hr.csv',
            record_id: coreRec.record_id,
            field_name: 'contract_status',
            value: coreRec.contract_status,
            last_modified_timestamp: coreRec.last_modified_timestamp,
            system_trust_level: 'PRIMARY',
          },
          {
            source_system: 'payroll.csv',
            record_id: primaryPay.record_id,
            field_name: 'payroll_status',
            value: primaryPay.payroll_status,
            last_modified_timestamp: primaryPay.last_modified_timestamp,
            system_trust_level: 'SECONDARY',
          },
          {
            source_system: 'payroll.csv',
            record_id: primaryPay.record_id,
            field_name: 'monthly_gross_remittance',
            value: `AED ${monthlyLeakedWage.toLocaleString()}`,
            last_modified_timestamp: primaryPay.last_modified_timestamp,
            system_trust_level: 'SECONDARY',
          },
        ],
        suggested_fix: {
          target_field: 'payroll_status',
          proposed_value: 'Terminated',
          source_rationale: `core_hr.csv is the governing Primary Authority (Rank 1) for contract termination. Discontinue automatic monthly salary routing in payroll.csv and flag for recovery of unearned post-separation disbursements.`,
          confidence_score: 0.98,
          governing_source: 'core_hr.csv',
        },
        downstream_impact: {
          affected_systems: [
            'WPS Central Bank Direct Remittance Generator',
            'First Abu Dhabi Bank Host-to-Host Gateway',
            'SAP S/4HANA Finance General Ledger',
          ],
          affected_reports: [
            'Executive Monthly Payroll Summary',
            'Central Bank Wage Protection Compliance Audit',
            'Internal Financial Controls Discrepancy Ledger',
          ],
          metric_delta_preview: `Halts recurring unearned salary disbursement of AED ${monthlyLeakedWage.toLocaleString()}/month; prevents annual budget variance of AED ${annualizedExposure.toLocaleString()}.`,
          financial_exposure_aed: annualizedExposure,
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

  return ghostIssues;
}
