# CarePulse Healthcare & Telehealth Virtual Command Platform — Technical Documentation

## 1. System Overview

**CarePulse** is an enterprise-grade, HIPAA-compliant Virtual Care, EHR, and Hospital Management Platform built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**. It provides a unified portal for Patients, Physicians/Doctors, and Hospital Administrators to interact seamlessly across virtual consultations, electronic prescriptions, medical record charting, ICU bed allocations, and interoperability standards (FHIR R4 and HL7 v2.5.1).

---

## 2. Architecture & System Stack

- **Framework**: React 18+ (Functional Components with Hooks)
- **Language**: TypeScript (Strict Typing)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v3 with custom neutral palettes (`#2D332F`, `#7A918D`, `#E5E0D3`, `#FAF9F6`)
- **Icons**: `lucide-react`
- **State Management & Persistence**: React State with `localStorage` persistence for multi-user registrations and active device sessions.
- **Interoperability**: FHIR R4 JSON Exporter & HL7 v2.5.1 ADT/ORU Engine

---

## 3. Directory & Codebase Structure

```
├── DOCUMENTATION.md                  # Comprehensive Technical Documentation (This File)
├── index.html                        # Application Root HTML Entrypoint
├── metadata.json                     # AI Studio Platform Metadata & Capabilities
├── package.json                      # Project Dependencies & Scripts
├── src/
│   ├── main.tsx                      # React DOM Rendering Entry Point
│   ├── App.tsx                       # Global Application Orchestrator & State Container
│   ├── index.css                     # Global Tailwind Imports & Base Styles
│   ├── types.ts                      # Shared TypeScript Interfaces, Types, and Enums
│   ├── data/
│   │   └── mockData.ts               # Initial EHR, Patients, Doctors, Vitals & Audit Logs Data
│   └── components/
│       ├── AdminPortal.tsx           # Hospital Admin Dashboard (Beds, Staff, Audit Trail)
│       ├── AuthModal.tsx             # Patient & Doctor Registration & Sign-In Gateway
│       ├── DoctorPortal.tsx          # Physician Command Center & Telehealth Workspace Navigation
│       ├── DoctorPrescriptionBuilder.tsx # EPCS Electronic Prescription Builder & Ledger
│       ├── DoctorTelehealthWorkspace.tsx # Doctor Virtual Waiting Room & Consultation Notes
│       ├── FhirHl7Modal.tsx          # FHIR R4 & HL7 v2.5.1 Message Generator & Exporter
│       ├── Header.tsx                # Universal Application Header & Session Badge
│       ├── PatientPortal.tsx         # Patient Dashboard, Records, Telehealth & Refill Tabs
│       ├── PrescriptionsAndRefills.tsx # Patient e-Prescription & Refill Manager
│       ├── Sidebar.tsx               # Dynamic Navigation Sidebar per Role
│       ├── SosModal.tsx              # Emergency Dispatch & SOS Alert System
│       ├── TelehealthRoom.tsx        # WebRTC Telehealth Video Consultation Room
│       └── VirtualCareConsultation.tsx # Patient Telehealth Room & Instant Provider Matching
```

---

## 4. User System & Registration Architecture

### 4.1 Multi-Device Authentication (`AuthModal.tsx`)
CarePulse features an authenticated registration and sign-in engine supporting both Patients and Physicians across devices.

1. **Sign-In Flow**:
   - Supports login via Email address or Name lookup.
   - Includes quick 1-click demo user profiles for instant role testing (e.g., Sarah Jenkins [Patient], Dr. Marcus Chen [Cardiologist], Chief Officer [Admin]).
2. **New Patient Registration (`register-patient`)**:
   - Captures: Legal Name, Email, Date of Birth, Gender, Blood Type, Phone Number, Insurance Provider, Emergency Contacts.
   - Generates a unique patient identifier (`pat-<timestamp>`) and persists the profile to local storage.
3. **New Physician Registration (`register-doctor`)**:
   - Captures: Doctor Name, Medical Email, Specialty (e.g., Cardiology, General Practice, Neurology), State License ID, Phone Number.
   - Generates a verified doctor profile (`doc-<timestamp>`) with electronic prescribing (EPCS) privileges.
4. **Device State Synchronization**:
   - Users and current authenticated session IDs are persisted in `localStorage` (`carepulse_users` & `carepulse_current_user_id`).

---

## 5. Core Feature Modules

### 5.1 Patient Portal (`PatientPortal.tsx`)
- **Dashboard & Vitals**: Displays real-time heart rate, blood pressure, SpO2, glucose, and active risk scores.
- **Virtual Care Telehealth (`VirtualCareConsultation.tsx`)**: Allows patients to view upcoming video calls, check into virtual waiting rooms, and launch live video calls.
- **e-Prescriptions & Refills (`PrescriptionsAndRefills.tsx`)**: Shows active medications, SIG dosage instructions, refill counts, and single-click pharmacy refill requests.
- **EHR Records & Lab Results**: View historical visit summaries, diagnostic lab reports, flagged abnormal values, and discharge instructions.
- **Billing & Insurance**: Displays claims status, copays, deductible progress, and digital insurance cards.

### 5.2 Doctor Telehealth Workspace (`DoctorTelehealthWorkspace.tsx` & `DoctorPortal.tsx`)
- **Virtual Waiting Room Queue**: Real-time waiting room dashboard showing waiting patients, scheduled time, specialty, and chief complaints.
- **Consultation EHR Scratchpad**: Real-time diagnostic and impression note editor synchronized directly with patient charts.
- **Live Video Launch**: Connects directly with patients via the WebRTC consultation overlay.

### 5.3 Electronic Prescribing System - EPCS (`DoctorPrescriptionBuilder.tsx`)
- **Formulary Quick-Pick**: Common drug selectors (e.g., Lisinopril, Atorvastatin, Metformin, Amoxicillin).
- **SIG Builder**: Customized dosage strength, frequency, supply duration (15/30/90 days), and refill authorization.
- **Drug Interaction & Allergy Safety Checks**: Automatic verification against patient chart allergies (e.g., Penicillin warnings).
- **Cryptographic Signature**: Computes DEA-verified digital signatures (`SIG-<DOC_ID>-<TIMESTAMP>`) transmitted to retail pharmacies (CVS, Walgreens, CarePulse Central).
- **Master Ledger**: Master audit table of all issued e-Prescriptions.

### 5.4 WebRTC Telehealth Room (`TelehealthRoom.tsx`)
- Interactive video consultation screen with:
  - Video Mute / Unmute
  - Audio Mute / Unmute
  - Screen Sharing Toggle
  - In-Call Chat & Clinical Notes Drawer
  - Live Connection Metrics (Bitrate, Encryption status, Call duration)
  - Call Termination & Post-Visit Summary Generation

### 5.5 Interoperability Gateway (`FhirHl7Modal.tsx`)
- **FHIR R4 JSON Generation**: Converts active patient vitals, observations, and EHR charts into standardized `Observation` and `Patient` FHIR R4 bundle JSON objects.
- **HL7 v2.5.1 Message Generator**: Formats clinical encounters into standard `ADT^A08` (Patient Information Update) and `ORU^R01` (Unsolicited Observation Result) pipe-delimited HL7 strings.
- **1-Click Copy & Export**: File download options for healthcare system integration.

### 5.6 Emergency SOS System (`SosModal.tsx`)
- Instant dispatch modal for acute patient emergencies.
- Shares real-time GPS location coordinates, blood type, allergies, and emergency contacts directly with 911 EMS responders.

---

## 6. Key Data Models (`types.ts`)

| Type Name | Key Properties | Purpose |
| :--- | :--- | :--- |
| `User` | `id`, `name`, `email`, `role`, `specialty`, `bloodType`, `insuranceProvider` | Unified User Account Model (Patient/Doctor/Admin) |
| `Appointment` | `id`, `patientId`, `doctorId`, `date`, `time`, `type`, `status`, `reason` | Scheduled Visits & Telehealth Queue Items |
| `Prescription` | `id`, `medication`, `dosage`, `frequency`, `duration`, `refillsLeft`, `digitalSignature` | EPCS Prescription Ledger Object |
| `EHRRecord` | `id`, `patientId`, `diagnosis`, `vitals`, `treatmentPlan`, `allergies` | Electronic Health Record Chart |
| `HospitalBed` | `id`, `roomNumber`, `ward`, `status`, `patientName`, `acuityLevel` | Hospital ICU & Ward Occupancy Tracker |
| `AuditLog` | `id`, `userId`, `action`, `resource`, `status`, `ipAddress`, `timestamp` | HIPAA Compliance Security Audit Trail |

---

## 7. Development & Maintenance Commands

- **Development Server**: `npm run dev` (Runs Vite on port 3000)
- **TypeScript & Code Quality Check**: `npm run lint`
- **Production Build**: `npm run build` (Outputs optimized production bundle to `dist/`)

---
*CarePulse Medical System — Confidential & Secure Healthcare Platform.*
