/**
 * Emirates Group HR Data Intelligence & Trust Engine
 * Domain Types, Schemas, and Lineage Definitions
 */

export type SourceSystem = 'core_hr.csv' | 'payroll.csv' | 'access_directory.csv' | 'learning.csv';

export type IssueCategory =
  | 'SECURITY_GHOST'
  | 'CROSS_SYSTEM_MISMATCH'
  | 'DUPLICATE'
  | 'INVALID_CODE'
  | 'TEMPORAL_PARADOX';

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface SourceFieldRecord {
  source_system: SourceSystem | string;
  record_id: string;
  field_name: string;
  value: string | number | boolean;
  last_modified_timestamp?: string;
  system_trust_level?: 'PRIMARY' | 'SECONDARY' | 'AUXILIARY';
}

export interface SuggestedFix {
  target_field: string;
  proposed_value: string | number | boolean;
  source_rationale: string;
  confidence_score: number; // 0.00 - 1.00
  governing_source: SourceSystem;
}

export interface DownstreamImpact {
  affected_systems: string[];
  affected_reports: string[];
  metric_delta_preview: string;
  financial_exposure_aed?: number;
}

export interface AuditTrailEntry {
  timestamp: string;
  action: 'RECOMMEND_FIX' | 'APPROVED' | 'REJECTED' | 'OVERRIDDEN';
  requires_steward_approval: boolean;
  steward_id?: string;
  steward_name?: string;
  steward_notes?: string;
  reviewed_at?: string;
}

/**
 * Strict Schema 1 as mandated by instructions
 */
export interface DisparityIssue {
  issue_id: string;
  geid: string;
  employee_name: string;
  department: string;
  category: IssueCategory;
  impact_score: number; // 0 - 100
  priority: PriorityLevel;
  explanation: string;
  current_values: SourceFieldRecord[];
  suggested_fix: SuggestedFix;
  downstream_impact: DownstreamImpact;
  audit_trail_entry: AuditTrailEntry;

  // Impact score formula breakdown
  impact_factors?: {
    severity: number; // 1 - 5
    financial_exposure: number; // 0 - 10
    regulatory_criticality: number; // 0 - 10
    downstream_fanout: number; // 1 - N
  };
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'OVERRIDDEN';
}

// System Record Schemas
export interface CoreHRRecord {
  record_id: string;
  geid: string;
  employee_name: string;
  national_id: string;
  nationality: string;
  emiratisation_status: 'YES' | 'NO';
  department: string;
  job_title: string;
  contract_status: 'Permanent' | 'Contract' | 'Probation' | 'Inactive' | 'Terminated';
  hire_date: string; // YYYY-MM-DD
  termination_date?: string; // YYYY-MM-DD
  grade: string;
  last_modified_timestamp: string;
}

export interface PayrollRecord {
  record_id: string;
  geid: string;
  employee_name: string;
  iban: string;
  grade_level: string;
  basic_salary_aed: number;
  housing_allowance_aed: number;
  flight_allowance_code: string;
  pension_scheme: 'UAE_PENSION_GPSSA' | 'GCC_PENSION' | 'EXPAT_EOSB_GRATUITY';
  payroll_status: 'Active' | 'On_Hold' | 'Terminated';
  emiratisation_flag?: 'YES' | 'NO';
  last_modified_timestamp: string;
}

export interface AccessDirectoryRecord {
  record_id: string;
  geid: string;
  upn_username: string;
  active_directory_status: 'Active' | 'Suspended' | 'Disabled';
  physical_airport_access_level: 'LEVEL_1_TERMINAL' | 'LEVEL_2_RAMP' | 'LEVEL_3_CARGO' | 'LEVEL_4_FLIGHT_DECK' | 'NONE';
  building_badge_status: 'Active' | 'Revoked' | 'Lost';
  last_badge_swipe?: string;
  last_modified_timestamp: string;
}

export interface LearningRecord {
  record_id: string;
  geid: string;
  certification_code: string;
  certification_name: string;
  completion_date: string;
  expiry_date: string;
  compliance_status: 'Compliant' | 'Expired' | 'Pending_Recurrent';
  last_modified_timestamp: string;
}

export interface DataDictionaryEnum {
  departments: string[];
  grades: string[];
  contract_statuses: string[];
  allowance_codes: string[];
  pension_schemes: string[];
  airport_access_levels: string[];
}

export interface DependencyRule {
  field_key: string;
  system: SourceSystem;
  field_name: string;
  direct_systems: string[];
  executive_reports: string[];
  blast_radius_multiplier: number;
  description: string;
}
