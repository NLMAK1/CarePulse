import React, { useState } from 'react';
import {
  User,
  Appointment,
  EHRRecord,
  LabReport,
  Prescription,
} from '../types';
import {
  Calendar,
  Video,
  FileText,
  Pill,
  Plus,
  Clock,
  CheckCircle2,
  Activity,
  Send,
  AlertTriangle,
  UserCheck,
  Search,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { DoctorTelehealthWorkspace } from './DoctorTelehealthWorkspace';
import { DoctorPrescriptionBuilder } from './DoctorPrescriptionBuilder';

interface DoctorPortalProps {
  doctor: User;
  appointments: Appointment[];
  patients: User[];
  ehrRecords: EHRRecord[];
  labReports: LabReport[];
  prescriptions: Prescription[];
  activeTab: string;
  onLaunchTelehealth: (apt: Appointment) => void;
  onCreatePrescription: (rx: Partial<Prescription>) => void;
  onCreateLabOrder: (lab: Partial<LabReport>) => void;
  onUpdateAppointmentStatus: (aptId: string, status: Appointment['status']) => void;
}

export const DoctorPortal: React.FC<DoctorPortalProps> = ({
  doctor,
  appointments,
  patients,
  ehrRecords,
  labReports,
  prescriptions,
  activeTab,
  onLaunchTelehealth,
  onCreatePrescription,
  onCreateLabOrder,
  onUpdateAppointmentStatus,
}) => {
  // Prescription modal state
  const [isRxModalOpen, setIsRxModalOpen] = useState(false);
  const [rxPatientId, setRxPatientId] = useState(patients[0]?.id || '');
  const [rxMedication, setRxMedication] = useState('Lisinopril');
  const [rxDosage, setRxDosage] = useState('10 mg');
  const [rxFrequency, setRxFrequency] = useState('Once daily in the morning');
  const [rxDuration, setRxDuration] = useState('30 Days');

  // Lab Order modal state
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [labPatientId, setLabPatientId] = useState(patients[0]?.id || '');
  const [labTestName, setLabTestName] = useState('Comprehensive Lipid Panel');
  const [labCategory, setLabCategory] = useState('Blood Work');

  const docAppointments = appointments.filter((a) => a.doctorId === doctor.id);

  const handleRxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === rxPatientId) || patients[0];
    onCreatePrescription({
      patientId: pat.id,
      patientName: pat.name,
      doctorId: doctor.id,
      doctorName: doctor.name,
      medication: rxMedication,
      dosage: rxDosage,
      frequency: rxFrequency,
      duration: rxDuration,
      refillsLeft: 3,
      pharmacyStatus: 'Sent',
      digitalSignature: `SIG-${doctor.id.toUpperCase()}-${Date.now()}-VERIFIED`,
    });
    setIsRxModalOpen(false);
  };

  const handleLabSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === labPatientId) || patients[0];
    onCreateLabOrder({
      patientId: pat.id,
      patientName: pat.name,
      doctorId: doctor.id,
      doctorName: doctor.name,
      testName: labTestName,
      testCategory: labCategory,
      status: 'Pending',
      flagged: false,
    });
    setIsLabModalOpen(false);
  };

  return (
    <div className="flex-1 p-4 md:p-6 bg-[#FAF9F6] overflow-y-auto space-y-6">
      {/* Top Physician Workspace Header */}
      <div className="bg-white rounded-2xl border border-[#E5E0D3] p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#7A918D] text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-md">
            {doctor.name.split(' ').pop()?.[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#2D332F]">{doctor.name}</h2>
              <span className="px-2.5 py-0.5 bg-[#E5E0D3] text-[#2D332F] text-xs font-semibold rounded-full">
                {doctor.specialty}
              </span>
            </div>
            <p className="text-xs text-[#8C8679] mt-0.5">
              Attending Physician • Central Hospital Clinical Queue
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRxModalOpen(true)}
            className="px-4 py-2.5 bg-[#7A918D] hover:bg-[#5D6F6B] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <Pill className="w-4 h-4" />
            <span>Write e-Prescription</span>
          </button>
          <button
            onClick={() => setIsLabModalOpen(true)}
            className="px-4 py-2.5 bg-[#2D332F] hover:bg-[#1E2320] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            <span>Order Lab Test</span>
          </button>
        </div>
      </div>

      {/* QUEUE & SCHEDULE VIEW */}
      {(activeTab === 'queue' || !activeTab) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Patient Consultation Queue */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E5E0D3] p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-[#2D332F]">
                Active Clinical Consultation Queue
              </h3>
              <span className="text-xs font-semibold text-[#7A918D]">
                {docAppointments.length} Patient Appointments
              </span>
            </div>

            <div className="space-y-3">
              {docAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 bg-[#FAF9F6] border border-[#E5E0D3] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#D8E2DC] text-[#7A918D] rounded-xl flex items-center justify-center font-bold text-sm">
                      {apt.patientName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[#2D332F]">
                        {apt.patientName}
                      </div>
                      <div className="text-xs text-[#8C8679]">
                        {apt.time} • {apt.reason}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {apt.status === 'in-progress' ? (
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full animate-pulse">
                        In Session
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                        {apt.status}
                      </span>
                    )}

                    {apt.type === 'video' && (
                      <button
                        onClick={() => onLaunchTelehealth(apt)}
                        className="px-3 py-2 bg-[#7A918D] hover:bg-[#5D6F6B] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <Video className="w-4 h-4" />
                        <span>Start Video Call</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick EHR Snapshot */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E5E0D3] p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#8C8679] uppercase tracking-wider">
              Patient EHR Quick Lookup
            </h3>

            {ehrRecords.map((rec) => (
              <div
                key={rec.id}
                className="p-3 bg-[#FAF9F6] border border-[#E5E0D3] rounded-xl space-y-2 text-xs"
              >
                <div className="font-bold text-[#2D332F]">{rec.diagnosis}</div>
                <div className="text-[#8C8679]">
                  Last Visit: {rec.visitDate} • {rec.doctorName}
                </div>
                <div className="text-[#5A5448]">Plan: {rec.treatmentPlan}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WORKSPACE: TELEHEALTH COMMAND CENTER VIEW */}
      {activeTab === 'workspace' && (
        <DoctorTelehealthWorkspace
          doctor={doctor}
          appointments={appointments}
          patients={patients}
          onLaunchTelehealth={onLaunchTelehealth}
          onUpdateAppointmentStatus={onUpdateAppointmentStatus}
          onCreatePrescription={onCreatePrescription}
        />
      )}

      {/* PRESCRIBE: e-PRESCRIPTION BUILDER VIEW */}
      {activeTab === 'prescribe' && (
        <DoctorPrescriptionBuilder
          doctor={doctor}
          patients={patients}
          prescriptions={prescriptions}
          onCreatePrescription={onCreatePrescription}
        />
      )}

      {/* EHR: CLINICAL HISTORY VIEW */}
      {activeTab === 'ehr' && (
        <div className="bg-white rounded-2xl border border-[#E5E0D3] p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-[#E5E0D3] pb-3">
            <div>
              <h3 className="text-lg font-bold text-[#2D332F]">Electronic Health Records (EHR) & Clinical Charting</h3>
              <p className="text-xs text-[#8C8679]">Master patient chart history, diagnoses, and treatment plans.</p>
            </div>
            <span className="text-xs font-bold text-[#7A918D] bg-[#E5E0D3]/50 px-3 py-1 rounded-full">
              HIPAA Compliant Record Vault
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {ehrRecords.map((rec) => (
              <div key={rec.id} className="p-4 bg-[#FAF9F6] border border-[#E5E0D3] rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-[#2D332F]">
                  <span className="text-sm">{rec.diagnosis}</span>
                  <span className="text-[#8C8679]">{rec.visitDate} • {rec.doctorName}</span>
                </div>
                <div className="text-xs text-[#5A5448]">
                  <strong>Treatment Plan:</strong> {rec.treatmentPlan}
                </div>
                <div className="p-3 bg-white border border-[#E5E0D3] rounded-xl text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div><span className="text-[#8C8679]">BP:</span> <span className="font-semibold">{rec.vitals.bloodPressure}</span></div>
                  <div><span className="text-[#8C8679]">HR:</span> <span className="font-semibold">{rec.vitals.heartRate}</span></div>
                  <div><span className="text-[#8C8679]">SpO2:</span> <span className="font-semibold">{rec.vitals.sp02}</span></div>
                  <div><span className="text-[#8C8679]">Allergies:</span> <span className="font-semibold text-rose-600">{rec.allergies}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LAB ORDERS VIEW */}
      {activeTab === 'lab-orders' && (
        <div className="bg-white rounded-2xl border border-[#E5E0D3] p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-[#E5E0D3] pb-3">
            <div>
              <h3 className="text-lg font-bold text-[#2D332F]">Diagnostic Laboratory Orders & Review</h3>
              <p className="text-xs text-[#8C8679]">Review submitted blood panels, pathology, and diagnostic imaging orders.</p>
            </div>
            <button
              onClick={() => setIsLabModalOpen(true)}
              className="px-4 py-2 bg-[#2D332F] hover:bg-[#1E2320] text-white text-xs font-bold rounded-xl flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Order New Lab Test
            </button>
          </div>

          <div className="space-y-4 pt-2">
            {labReports.map((lab) => (
              <div key={lab.id} className="p-4 bg-[#FAF9F6] border border-[#E5E0D3] rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-sm text-[#2D332F]">{lab.testName}</h4>
                    <span className="text-xs text-[#8C8679]">Patient: {lab.patientName} • Date: {lab.date}</span>
                  </div>
                  {lab.flagged ? (
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                      Flagged Abnormal Result
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                      Normal Result
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#5A5448]">
                  <strong>Interpretation:</strong> {lab.interpretation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* e-PRESCRIPTION MODAL */}
      {isRxModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF9F6] w-full max-w-lg rounded-3xl border border-[#E5E0D3] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E0D3] pb-3">
              <h3 className="text-lg font-bold text-[#2D332F] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#7A918D]" />
                e-Prescription Generator
              </h3>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2.5 py-1 rounded-full">
                DEA & HIPAA Cryptographically Signed
              </span>
            </div>

            <form onSubmit={handleRxSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#2D332F] mb-1">
                  Select Patient
                </label>
                <select
                  value={rxPatientId}
                  onChange={(e) => setRxPatientId(e.target.value)}
                  className="w-full bg-white border border-[#E5E0D3] rounded-xl p-2.5 outline-none font-medium"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (DOB: {p.dob})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2D332F] mb-1">
                    Medication Name
                  </label>
                  <input
                    type="text"
                    value={rxMedication}
                    onChange={(e) => setRxMedication(e.target.value)}
                    className="w-full bg-white border border-[#E5E0D3] rounded-xl p-2.5 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#2D332F] mb-1">
                    Dosage
                  </label>
                  <input
                    type="text"
                    value={rxDosage}
                    onChange={(e) => setRxDosage(e.target.value)}
                    className="w-full bg-white border border-[#E5E0D3] rounded-xl p-2.5 outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#2D332F] mb-1">
                  Sig / Intake Instructions
                </label>
                <input
                  type="text"
                  value={rxFrequency}
                  onChange={(e) => setRxFrequency(e.target.value)}
                  className="w-full bg-white border border-[#E5E0D3] rounded-xl p-2.5 outline-none font-medium"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#7A918D] hover:bg-[#5D6F6B] text-white font-bold rounded-xl shadow-sm"
                >
                  Sign & Send to Pharmacy
                </button>
                <button
                  type="button"
                  onClick={() => setIsRxModalOpen(false)}
                  className="px-5 py-3 bg-white border border-[#E5E0D3] text-[#2D332F] font-bold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LAB ORDER MODAL */}
      {isLabModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF9F6] w-full max-w-md rounded-3xl border border-[#E5E0D3] p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-[#2D332F]">
              Order Diagnostic Lab Test
            </h3>

            <form onSubmit={handleLabSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#2D332F] mb-1">
                  Select Patient
                </label>
                <select
                  value={labPatientId}
                  onChange={(e) => setLabPatientId(e.target.value)}
                  className="w-full bg-white border border-[#E5E0D3] rounded-xl p-2.5 outline-none font-medium"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#2D332F] mb-1">
                  Test Name
                </label>
                <input
                  type="text"
                  value={labTestName}
                  onChange={(e) => setLabTestName(e.target.value)}
                  className="w-full bg-white border border-[#E5E0D3] rounded-xl p-2.5 outline-none font-medium"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#2D332F] hover:bg-[#1E2320] text-white font-bold rounded-xl shadow-sm"
                >
                  Transmit Order
                </button>
                <button
                  type="button"
                  onClick={() => setIsLabModalOpen(false)}
                  className="px-5 py-3 bg-white border border-[#E5E0D3] text-[#2D332F] font-bold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
