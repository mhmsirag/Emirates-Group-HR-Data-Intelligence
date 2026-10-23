# Emirates Group HR System Dependencies & Downstream Lineage Graph

This reference models the direct and indirect downstream systems, interfaces, and executive reports consuming HR fields across Emirates Group. It governs the calculation of **Downstream Fanout** and the **Blast Radius** previews.

---

## 1. Domain Field Dependency Rules

### Rule D-01: Employment Lifecycle & Contract Status (`core_hr.contract_status`)
- **Governing Authority:** `core_hr`
- **Direct Downstream Systems:**
  1. `Azure Active Directory / Okta SSO` (User account provisioning / suspension)
  2. `Airport Pass & Biometrics API` (DXB Airside Access Security Gates)
  3. `Flight Crew Roster System (Jeppesen / Sabre)` (Duty scheduling & flight assignment)
  4. `Group Medical Insurance Gateway` (Daman / Bupa Health Coverage Enrollment)
  5. `Emirates Headquarters Turnstiles (Nedap Security)` (Physical turnstile access)
- **Impacted Executive Reports:**
  1. `Executive Monthly Headcount Report`
  2. `IT License Optimization & Dormant Account Audit`
  3. `Aviation Security GCAA Airside Clearance Audit`
  4. `UAE Tawteen Compliance Register`
- **Downstream Fanout Score:** 9 (5 systems + 4 reports)
- **Blast Radius Preview Template:**
  "Dubai Active IT Accounts count alters by {delta}; Airside physical badge credentials revoked across {systems_count} security checkpoints."

---

### Rule D-02: Compensation Structure & Grade Levels (`payroll.grade_level`)
- **Governing Authority:** `payroll`
- **Direct Downstream Systems:**
  1. `SAP S/4HANA Finance General Ledger` (Cost center staff expense postings)
  2. `UAE GPSSA Pension Gateway` (Statutory pension contribution computation)
  3. `Annual Bonus & Profit Share Accrual Engine` (Management incentive calculations)
  4. `Global Travel Concession Engine` (Staff flight ticket sub-category allocations)
- **Impacted Executive Reports:**
  1. `Executive Monthly Payroll Summary`
  2. `UAE Pension Compliance Export`
  3. `Annual Staff Cost Variance Analysis`
  4. `Group Financial Audit Trial Balance`
- **Downstream Fanout Score:** 8 (4 systems + 4 reports)
- **Blast Radius Preview Template:**
  "Monthly payroll baseline adjusts by AED {variance_aed}; GPSSA pension statutory accrual variance reconciled."

---

### Rule D-03: UAE National Status & National ID (`core_hr.emiratisation_status`)
- **Governing Authority:** `core_hr`
- **Direct Downstream Systems:**
  1. `MOHRE Nafis / Tawteen National Gateway` (Federal quota tracking API)
  2. `UAE GPSSA Statutory Retirement Gateway` (Mandatory pension deductions)
  3. `Emirates Group Emiratisation Scholarship Database` (Cadet & National trainee records)
- **Impacted Executive Reports:**
  1. `UAE National Emiratisation Quota Filing`
  2. `Ministry of Human Resources & Emiratisation (MOHRE) Semi-Annual Audit`
  3. `Executive Board Diversity & Nationalization Scorecard`
- **Downstream Fanout Score:** 6 (3 systems + 3 reports)
- **Blast Radius Preview Template:**
  "Group Emiratisation ratio adjusted by {percentage_delta}%; regulatory penalty risk mitigated."

---

### Rule D-04: Aviation Safety Certifications & Recurrent Training (`learning.compliance_status`)
- **Governing Authority:** `learning`
- **Direct Downstream Systems:**
  1. `Sabre Crew Pairing & Roster Dispatch Engine` (Blocks non-compliant crew from pairing)
  2. `GCAA Electronic Safety Register` (UAE General Civil Aviation Authority feed)
  3. `ICAO International Safety Audit Database` (IOSA compliance ledger)
- **Impacted Executive Reports:**
  1. `Flight Operations Safety Clearance Report`
  2. `GCAA Air Operator Certificate (AOC) Audit Filing`
  3. `Chief Operations Officer Daily Readiness Summary`
- **Downstream Fanout Score:** 6 (3 systems + 3 reports)
- **Blast Radius Preview Template:**
  "Flight deck legal clearance status toggled; crew roster legality lock {status}."

---

### Rule D-05: IT Identity & Airport Airside Clearance (`access_directory.active_directory_status`)
- **Governing Authority:** `access_directory` (for access state), `core_hr` (for authorization basis)
- **Direct Downstream Systems:**
  1. `Microsoft 365 & Copilot Workspace Gateway`
  2. `DXB Airside Vehicle Driving Permit DB`
  3. `Skywards & Loyalty Staff Tool Access`
- **Impacted Executive Reports:**
  1. `Corporate Cybersecurity Access Governance Matrix`
  2. `IT Software License Billing Reconciliation`
- **Downstream Fanout Score:** 5 (3 systems + 2 reports)
- **Blast Radius Preview Template:**
  "Enterprise M365 active seats count altered; airside vehicle authorization synchronized."
