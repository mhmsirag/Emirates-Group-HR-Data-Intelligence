import { DependencyRule } from '../types';

export const SYSTEM_DEPENDENCY_RULES: DependencyRule[] = [
  {
    field_key: 'contract_status',
    system: 'core_hr.csv',
    field_name: 'Employment Lifecycle & Contract Status',
    direct_systems: [
      'Azure Active Directory / Okta SSO',
      'Airport Pass & Biometrics API',
      'Flight Crew Roster System (Jeppesen)',
      'Group Medical Insurance Gateway (Daman)',
      'Emirates HQ Turnstiles (Nedap Security)',
    ],
    executive_reports: [
      'Executive Monthly Headcount Report',
      'IT License Optimization & Dormant Account Audit',
      'Aviation Security GCAA Airside Clearance Audit',
      'UAE Tawteen Compliance Register',
    ],
    blast_radius_multiplier: 9,
    description:
      'Core HR status determines enterprise authentication, physical airside gates, medical coverage, and official corporate headcount.',
  },
  {
    field_key: 'grade_level',
    system: 'payroll.csv',
    field_name: 'Grade Level & Remuneration Scale',
    direct_systems: [
      'SAP S/4HANA Finance General Ledger',
      'UAE GPSSA Statutory Pension Gateway',
      'Annual Bonus & Profit Share Accrual Engine',
      'Global Travel Concession Ticketing System',
    ],
    executive_reports: [
      'Executive Monthly Payroll Summary',
      'UAE Pension Compliance Export',
      'Annual Staff Cost Variance Analysis',
      'Group Financial Audit Trial Balance',
    ],
    blast_radius_multiplier: 8,
    description:
      'Grade levels drive basic salary limits, statutory pension formulas, management bonuses, and airline duty travel ticketing classes.',
  },
  {
    field_key: 'emiratisation_status',
    system: 'core_hr.csv',
    field_name: 'UAE National Tawteen Identification',
    direct_systems: [
      'MOHRE Nafis / Tawteen National Gateway',
      'UAE GPSSA Statutory Retirement Gateway',
      'Emirates National Cadet & Scholarship DB',
    ],
    executive_reports: [
      'UAE National Emiratisation Quota Filing',
      'Ministry of Human Resources (MOHRE) Semi-Annual Audit',
      'Executive Board Diversity & Nationalization Scorecard',
    ],
    blast_radius_multiplier: 6,
    description:
      'National status determines federal quota compliance, Nafis subsidies, and mandatory pension withholdings.',
  },
  {
    field_key: 'compliance_status',
    system: 'learning.csv',
    field_name: 'Flight Safety & Recurrent Crew Certification',
    direct_systems: [
      'Sabre Crew Pairing & Roster Dispatch Engine',
      'GCAA Electronic Safety Register',
      'ICAO International Safety Audit Database (IOSA)',
    ],
    executive_reports: [
      'Flight Operations Safety Clearance Report',
      'GCAA Air Operator Certificate (AOC) Audit Filing',
      'Chief Operations Officer Daily Readiness Summary',
    ],
    blast_radius_multiplier: 6,
    description:
      'Safety recurrent certifications gate cockpit and cabin crew pairing; non-compliant status triggers legal flight dispatch grounding.',
  },
  {
    field_key: 'active_directory_status',
    system: 'access_directory.csv',
    field_name: 'IT Identity & Airport Airside Access',
    direct_systems: [
      'Microsoft 365 & Copilot Workspace Gateway',
      'DXB Airside Vehicle Driving Permit DB',
      'Skywards & Loyalty Staff Tool Access',
    ],
    executive_reports: [
      'Corporate Cybersecurity Access Governance Matrix',
      'IT Software License Billing Reconciliation',
    ],
    blast_radius_multiplier: 5,
    description:
      'Controls active directory tokens, airport gate access credentials, and enterprise SaaS license costs.',
  },
  {
    field_key: 'pension_scheme',
    system: 'payroll.csv',
    field_name: 'Statutory Pension & Gratuity Allocation',
    direct_systems: [
      'UAE GPSSA Pension Gateway',
      'WPS Central Bank Direct Remittance Generator',
      'Group Gratuity Actuarial Valuation System',
    ],
    executive_reports: [
      'UAE Pension Compliance Export',
      'Executive Monthly Payroll Summary',
      'End of Service Gratuity Liability Audit',
    ],
    blast_radius_multiplier: 6,
    description:
      'Directly dictates pension deductions vs end-of-service gratuity reserve calculation.',
  },
];

export function getDependencyForRule(fieldKey: string): DependencyRule {
  const match = SYSTEM_DEPENDENCY_RULES.find((r) => r.field_key === fieldKey);
  if (match) return match;
  return {
    field_key: fieldKey,
    system: 'core_hr.csv',
    field_name: fieldKey,
    direct_systems: ['Enterprise Data Warehouse', 'Group Integration Bus'],
    executive_reports: ['HR Master Data Operational Report'],
    blast_radius_multiplier: 2,
    description: 'General downstream operational feed.',
  };
}
