# Emirates Group HR Master Data Dictionary & Valid Enumerations

This document defines the strict, authoritative enumerations and validation constraints across all 50+ Emirates Group HR systems. Any value outside these specifications must be classified as an `INVALID_CODE` issue.

---

## 1. Operating Departments (`department`)
Authoritative Source: `core_hr`
- `Flight Operations` — Flight Deck, Fleet Captains, First Officers, Flight Dispatch.
- `Emirates Engineering` — Aircraft Maintenance, Avionics, Overhaul, Airframe Certifications.
- `Inflight Services` — Cabin Crew, Purser Services, Inflight Service Training.
- `dnata Ground Handling` — Airport Ramp Operations, Baggage Handling, Cargo Terminal Logistics.
- `Group IT` — Infrastructure, Cybersecurity, Enterprise Systems, Aviation Tech.
- `Corporate Communications` — Brand, Marketing, Public Relations, Sponsorships.
- `SkyCargo` — Global Freight Logistics, CoolChain Pharma, Dangerous Goods Handling.
- `Human Resources` — Employee Relations, Talent Acquisition, Group Remuneration & Benefits.
- `Commercial Operations` — Revenue Management, Network Planning, Outstation Stations.

---

## 2. Standard Grade Hierarchy (`grade` / `grade_level`)
Authoritative Source: `payroll` (for compensation structure), `core_hr` (for job profile)
- **General Ground & Support Staff**: `EK.01`, `EK.02`, `EK.03`, `EK.04`
- **Professional & Technical Specialists**: `EK.05`, `EK.06`, `EK.07`
- **Management & Senior Specialists**: `EK.08`, `EK.09`, `EK.10`
- **Senior Executive Leadership**: `SE.01` (VP), `SE.02` (SVP), `SE.03` (EVP / Board)
- **Flight Deck Cockpit Crew**: `FD.01` (Cadet Pilot), `FD.02` (Second Officer), `FD.03` (First Officer), `FD.04` (Captain / Fleet Examiner)

---

## 3. Official Contract & Employment Lifecycle (`contract_status`)
Authoritative Source: `core_hr`
- `Permanent` — Standard indefinite group employment contract.
- `Contract` — Fixed-term specialist or expatriate secondment contract.
- `Probation` — First 180 days evaluation period.
- `Inactive` — Approved sabbatical, extended unpaid leave, military reserve duty.
- `Terminated` — End of service, resignation, retirement, or contract conclusion.

---

## 4. Allowance Codes (`flight_allowance_code`)
Authoritative Source: `payroll`
- `HOUSING_EXEC` — Executive Tier Housing Allowance (SE.01 - SE.03, EK.09 - EK.10).
- `HOUSING_STD` — Standard Group Housing Allowance (EK.01 - EK.08).
- `FLIGHT_DUTY_A380` — Block hour flight duty allowance for Airbus A380 crew.
- `FLIGHT_DUTY_B777` — Block hour flight duty allowance for Boeing 777 crew.
- `TRANSPORT_EXEC` — Executive Chauffeur & Vehicle Remuneration Scheme.
- `SHIFT_PREMIUM` — 24/7 Ramp, Engineering, and Airport Shift Differential.
- `OVERTIME_TECH` — Aircraft on Ground (AOG) & Maintenance Technical Overtime.
- `PER_DIEM_INTL` — International Outstation Layover Meal & Incidental Allowance.

---

## 5. Pension & End of Service Schemes (`pension_scheme`)
Authoritative Source: `payroll`
- `UAE_PENSION_GPSSA` — Mandatory UAE General Pension and Social Security Authority scheme for UAE National employees (20% total: 5% employee, 15% employer / government).
- `GCC_PENSION` — GCC Nationals Retirement Protection Exchange Scheme.
- `EXPAT_EOSB_GRATUITY` — UAE Federal Decree-Law End of Service Gratuity & Group Workplace Savings Trust.

---

## 6. Airport & Physical Security Clearances (`physical_airport_access_level`)
Authoritative Source: `access_directory`
- `LEVEL_1_TERMINAL` — Dubai International Airport (DXB) Passenger Concourse Zones.
- `LEVEL_2_RAMP` — DXB Airside Ramp, Aircraft Stands, Apron Vehicles.
- `LEVEL_3_CARGO` — DWC & DXB Mega Cargo Terminal Restricted Freight Zones.
- `LEVEL_4_FLIGHT_DECK` — Aircraft Cockpit & Secure Aviation Gateways.
- `NONE` — Ground Headquarters / Remote Office Only (Zero Airside Clearance).
