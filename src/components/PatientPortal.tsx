import React, { useState } from 'react';
import {
  User,
  Appointment,
  EHRRecord,
  LabReport,
  Prescription,
  BillingItem,
} from '../types';
import {
  HeartPulse,
  Calendar,
  Video,
  FileText,
  Pill,
  CreditCard,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  ShieldCheck,
  UserCheck,
  DollarSign,
  Download,
  Activity,
  ArrowRight,
  Send,
} from 'lucide-react';
import { VirtualCareConsultation } from './VirtualCareConsultation';
import { PrescriptionsAndRefills } from './PrescriptionsAndRefills';

interface PatientPortalProps {
  patient: User;
  appointments: Appointment[];
  ehrRecords: EHRRecord[];
  labReports: LabReport[];
  prescriptions: Prescription[];
  billing: BillingItem[];
  doctors: User[];
  activeTab: string;
  onBookAppointment: (apt: Partial<Appointment>) => void;
  onLaunchTelehealth: (apt: Appointment) => void;
  onPayBill: (billId: string) => void;
  onRequestRefill: (rxId: string) => void;
  onOpenSos: () => void;
  onUpdateAppointmentMeetLink?: (appointmentId: string, meetLink: string, spaceName: string) => void;
}

export const PatientPortal: React.FC<PatientPortalProps> = ({
  patient,
  appointments,
  ehrRecords,
  labReports,
  prescriptions,
  billing,
  doctors,
  activeTab,
  onBookAppointment,
  onLaunchTelehealth,
  onPayBill,
  onRequestRefill,
  onOpenSos,
  onUpdateAppointmentMeetLink,
}) => {
  // Appointment Booking Modal state
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedDocId, setSelectedDocId] = useState(doctors[0]?.id || '');
  const [bookingDate, setBookingDate] = useState('2026-08-05');
  const [bookingTime, setBookingTime] = useState('10:00 AM');
  const [bookingType, setBookingType] = useState<'video' | 'in-person'>('video');
  const [bookingReason, setBookingReason] = useState('');

  // Payment Modal state
  const [payingBill, setPayingBill] = useState<BillingItem | null>(null);

  const filteredDoctors = doctors.filter(
    (d) => selectedSpecialty === 'All' || d.specialty === selectedSpecialty
  );

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const doc = doctors.find((d) => d.id === selectedDocId) || doctors[0];
    onBookAppointment({
      patientId: patient.id,
      patientName: patient.name,
      doctorId: doc.id,
      doctorName: doc.name,
      specialty: doc.specialty || 'General Practice',
      date: bookingDate,
      time: bookingTime,
      type: bookingType,
      status: 'upcoming',
      reason: bookingReason || 'General Medical Consultation',
    });
    setIsBookingOpen(false);
    setBookingReason('');
  };

  return (
    <div className="flex-1 p-4 md:p-6 bg-[#FAF9F6] overflow-y-auto space-y-6">
      {/* 1. OVERVIEW & VITALS DASHBOARD */}
      {(activeTab === 'overview' || !activeTab) && (
        <div className="space-y-6">
          {/* Top Patient Greeting Card */}
          <div className="bg-white rounded-2xl border border-[#E5E0D3] p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#D8E2DC] rounded-2xl flex items-center justify-center font-bold text-xl text-[#7A918D] shadow-inner">
                {patient.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#2D332F]">
                  Welcome back, {patient.name}
                </h2>
                <p className="text-xs text-[#8C8679] mt-0.5">
                  DOB: {patient.dob} • Insurance: {patient.insuranceProvider} (
                  {patient.insurancePolicy})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsBookingOpen(true)}
                className="px-4 py-2.5 bg-[#7A918D] hover:bg-[#5D6F6B] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Book Appointment</span>
              </button>
              <button
                onClick={onOpenSos}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm animate-pulse"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>SOS Dispatch</span>
              </button>
            </div>
          </div>

          {/* Vitals Summary Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-[#E5E0D3] p-4 shadow-sm">
              <div className="text-[11px] font-bold text-[#8C8679] uppercase tracking-wider mb-2">
                Blood Pressure
              </div>
              <div className="text-2xl font-bold text-[#2D332F]">122/80</div>
              <div className="text-[11px] text-emerald-700 font-medium mt-1">
                Optimal Threshold
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E0D3] p-4 shadow-sm">
              <div className="text-[11px] font-bold text-[#8C8679] uppercase tracking-wider mb-2">
                Heart Rate
              </div>
              <div className="text-2xl font-bold text-[#2D332F]">
                72 <span className="text-sm font-normal text-[#8C8679]">bpm</span>
              </div>
              <div className="text-[11px] text-emerald-700 font-medium mt-1">
                Resting Normal
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E0D3] p-4 shadow-sm">
              <div className="text-[11px] font-bold text-[#8C8679] uppercase tracking-wider mb-2">
                Oxygen (SpO2)
              </div>
              <div className="text-2xl font-bold text-[#2D332F]">99%</div>
              <div className="text-[11px] text-emerald-700 font-medium mt-1">
                Excellent Oxygenation
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E0D3] p-4 shadow-sm">
              <div className="text-[11px] font-bold text-[#8C8679] uppercase tracking-wider mb-2">
                Blood Type
              </div>
              <div className="text-2xl font-bold text-[#7A918D]">
                {patient.bloodType || 'A+'}
              </div>
              <div className="text-[11px] text-[#8C8679] font-medium mt-1">
                On Medical Record
              </div>
            </div>
          </div>

          {/* Active Appointments & Upcoming Telehealth */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Appointments Column */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E5E0D3] p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#2D332F]">
                  Upcoming Consultations
                </h3>
                <span className="text-xs text-[#8C8679]">
                  {appointments.filter((a) => a.status === 'upcoming').length} scheduled
                </span>
              </div>

              <div className="space-y-3">
                {appointments
                  .filter((a) => a.status === 'upcoming' || a.status === 'in-progress')
                  .map((apt) => (
                    <div
                      key={apt.id}
                      className="p-4 bg-[#FAF9F6] rounded-xl border border-[#E5E0D3] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#7A918D] text-white rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                          {apt.doctorName
                            .split(' ')
                            .pop()?.[0]}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-[#2D332F]">
                            {apt.doctorName}
                          </div>
                          <div className="text-xs text-[#8C8679]">
                            {apt.specialty} • {apt.date} at {apt.time}
                          </div>
                          <div className="text-[11px] text-[#5A5448] mt-1 font-medium">
                            Reason: {apt.reason}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {apt.type === 'video' ? (
                          <button
                            onClick={() => onLaunchTelehealth(apt)}
                            className="px-3 py-2 bg-[#7A918D] hover:bg-[#5D6F6B] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
                          >
                            <Video className="w-4 h-4" />
                            <span>Join Video Call</span>
                          </button>
                        ) : (
                          <span className="px-3 py-1 bg-[#E5E0D3] text-[#2D332F] text-xs font-semibold rounded-full">
                            In-Person Clinic
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Prescriptions & Reminders Column */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E5E0D3] p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#2D332F]">
                  Active Prescriptions
                </h3>
                <Pill className="w-4 h-4 text-[#7A918D]" />
              </div>

              <div className="space-y-3">
                {prescriptions.map((rx) => (
                  <div
                    key={rx.id}
                    className="p-3 bg-[#FAF9F6] rounded-xl border border-[#E5E0D3] space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#2D332F]">
                        {rx.medication} ({rx.dosage})
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                        {rx.pharmacyStatus}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#8C8679]">
                      {rx.frequency} • {rx.refillsLeft} refills left
                    </div>
                    <button
                      onClick={() => onRequestRefill(rx.id)}
                      className="mt-2 w-full py-1.5 bg-white border border-[#E5E0D3] hover:bg-[#E5E0D3]/30 text-[#2D332F] text-xs font-semibold rounded-lg transition-all"
                    >
                      Request Pharmacy Refill
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. APPOINTMENT MANAGEMENT TAB */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-2xl border border-[#E5E0D3] p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#2D332F]">
                Book & Manage Appointments
              </h2>
              <p className="text-xs text-[#8C8679]">
                Find specialists, select date and time, choose video or clinic visit.
              </p>
            </div>
            <button
              onClick={() => setIsBookingOpen(true)}
              className="px-4 py-2.5 bg-[#7A918D] text-white rounded-xl text-xs font-bold hover:bg-[#5D6F6B] flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Appointment</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                className="p-4 bg-[#FAF9F6] border border-[#E5E0D3] rounded-2xl space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#7A918D] text-white rounded-xl flex items-center justify-center font-bold text-base">
                    {doc.name.split(' ').pop()?.[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#2D332F]">{doc.name}</h4>
                    <span className="text-xs text-[#7A918D] font-semibold">
                      {doc.specialty}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-[#8C8679]">
                  Available for In-Person & Telehealth video sessions.
                </div>
                <button
                  onClick={() => {
                    setSelectedDocId(doc.id);
                    setIsBookingOpen(true);
                  }}
                  className="w-full py-2 bg-[#2D332F] text-white text-xs font-bold rounded-xl hover:bg-[#1E2320] transition-all"
                >
                  Book Consultation
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIRTUAL CARE CONSULTATION TAB */}
      {activeTab === 'telehealth' && (
        <VirtualCareConsultation
          patient={patient}
          appointments={appointments}
          doctors={doctors}
          onLaunchTelehealth={onLaunchTelehealth}
          onBookAppointment={onBookAppointment}
          onUpdateAppointmentMeetLink={onUpdateAppointmentMeetLink}
        />
      )}

      {/* 3. MEDICAL RECORDS & LAB RESULTS TAB */}
      {activeTab === 'records' && (
        <div className="space-y-6">
          {/* EHR Visit Records */}
          <div className="bg-white rounded-2xl border border-[#E5E0D3] p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[#2D332F]">
              Electronic Health Records (EHR) & Visit Summaries
            </h3>
            <div className="space-y-4">
              {ehrRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 bg-[#FAF9F6] border border-[#E5E0D3] rounded-xl space-y-2"
                >
                  <div className="flex justify-between items-center text-xs font-bold text-[#2D332F]">
                    <span>{rec.diagnosis}</span>
                    <span className="text-[#8C8679]">{rec.visitDate}</span>
                  </div>
                  <p className="text-xs text-[#5A5448]">
                    <strong>Treatment Plan:</strong> {rec.treatmentPlan}
                  </p>
                  <div className="p-3 bg-white border border-[#E5E0D3] rounded-lg text-xs grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div>
                      <span className="text-[#8C8679]">BP:</span>{' '}
                      <span className="font-semibold">{rec.vitals.bloodPressure}</span>
                    </div>
                    <div>
                      <span className="text-[#8C8679]">HR:</span>{' '}
                      <span className="font-semibold">{rec.vitals.heartRate}</span>
                    </div>
                    <div>
                      <span className="text-[#8C8679]">SpO2:</span>{' '}
                      <span className="font-semibold">{rec.vitals.sp02}</span>
                    </div>
                    <div>
                      <span className="text-[#8C8679]">Allergies:</span>{' '}
                      <span className="font-semibold text-rose-600">
                        {rec.allergies}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Diagnostic Lab Reports */}
          <div className="bg-white rounded-2xl border border-[#E5E0D3] p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[#2D332F]">
              Diagnostic Lab Reports
            </h3>
            <div className="space-y-4">
              {labReports.map((lab) => (
                <div
                  key={lab.id}
                  className="p-4 bg-[#FAF9F6] border border-[#E5E0D3] rounded-xl space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm text-[#2D332F]">
                        {lab.testName}
                      </h4>
                      <span className="text-xs text-[#8C8679]">
                        Ordered by {lab.doctorName} • {lab.date}
                      </span>
                    </div>
                    {lab.flagged ? (
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                        Flagged Result
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                        Normal Threshold
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#5A5448]">
                    <strong>Physician Interpretation:</strong> {lab.interpretation}
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#E5E0D3]/50 text-[#2D332F] font-bold">
                        <tr>
                          <th className="p-2">Parameter</th>
                          <th className="p-2">Value</th>
                          <th className="p-2">Reference Bounds</th>
                          <th className="p-2">Flag</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E0D3]">
                        {lab.results.map((r, idx) => (
                          <tr key={idx}>
                            <td className="p-2 font-medium">{r.parameter}</td>
                            <td className="p-2 font-bold">
                              {r.value} {r.unit}
                            </td>
                            <td className="p-2 text-[#8C8679]">{r.reference}</td>
                            <td className="p-2 font-bold">
                              {r.flag === 'High' || r.flag === 'Low' ? (
                                <span className="text-amber-700">{r.flag}</span>
                              ) : (
                                <span className="text-emerald-700">{r.flag}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* e-PRESCRIPTIONS & REFILLS TAB */}
      {activeTab === 'prescriptions' && (
        <PrescriptionsAndRefills
          patient={patient}
          prescriptions={prescriptions}
          doctors={doctors}
          onRequestRefill={onRequestRefill}
        />
      )}

      {/* 4. BILLING & INSURANCE CLAIMS TAB */}
      {activeTab === 'billing' && (
        <div className="bg-white rounded-2xl border border-[#E5E0D3] p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-[#2D332F]">
                Billing Statements & Insurance Claims
              </h2>
              <p className="text-xs text-[#8C8679]">
                Review patient copays, insurance claims, and process digital payments.
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#8C8679]">Total Outstanding Copay</div>
              <div className="text-2xl font-bold text-rose-700">
                $
                {billing
                  .filter((b) => b.status === 'Pending')
                  .reduce((acc, curr) => acc + curr.copay, 0)
                  .toFixed(2)}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {billing.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-[#FAF9F6] border border-[#E5E0D3] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="font-bold text-sm text-[#2D332F]">
                    {item.description}
                  </div>
                  <div className="text-xs text-[#8C8679] mt-0.5">
                    Invoice #{item.id} • Due {item.dueDate}
                  </div>
                  <div className="text-xs text-[#5A5448] mt-1">
                    Insurance Covered: ${item.insuranceCovered.toFixed(2)} | Claim
                    Status:{' '}
                    <span className="font-semibold text-emerald-700">
                      {item.claimStatus}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-[#8C8679]">Copay Due</div>
                    <div className="text-lg font-bold text-[#2D332F]">
                      ${item.copay.toFixed(2)}
                    </div>
                  </div>

                  {item.status === 'Paid' ? (
                    <span className="px-4 py-2 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Paid
                    </span>
                  ) : (
                    <button
                      onClick={() => setPayingBill(item)}
                      className="px-4 py-2 bg-[#7A918D] hover:bg-[#5D6F6B] text-white text-xs font-bold rounded-xl transition-all"
                    >
                      Pay Copay
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BOOKING MODAL */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF9F6] w-full max-w-lg rounded-3xl border border-[#E5E0D3] p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-[#2D332F]">
              Book Online Consultation
            </h3>

            <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#2D332F] mb-1">
                  Select Physician / Specialty
                </label>
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="w-full bg-white border border-[#E5E0D3] rounded-xl p-2.5 outline-none font-medium"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2D332F] mb-1">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-white border border-[#E5E0D3] rounded-xl p-2.5 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#2D332F] mb-1">
                    Time Slot
                  </label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full bg-white border border-[#E5E0D3] rounded-xl p-2.5 outline-none font-medium"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="04:15 PM">04:15 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#2D332F] mb-1">
                  Consultation Type
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setBookingType('video')}
                    className={`flex-1 py-2 rounded-xl font-bold border transition-all ${
                      bookingType === 'video'
                        ? 'bg-[#7A918D] text-white border-[#7A918D]'
                        : 'bg-white text-[#2D332F] border-[#E5E0D3]'
                    }`}
                  >
                    Virtual Video Call
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingType('in-person')}
                    className={`flex-1 py-2 rounded-xl font-bold border transition-all ${
                      bookingType === 'in-person'
                        ? 'bg-[#7A918D] text-white border-[#7A918D]'
                        : 'bg-white text-[#2D332F] border-[#E5E0D3]'
                    }`}
                  >
                    In-Person Clinic Visit
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#2D332F] mb-1">
                  Reason for Visit / Symptoms
                </label>
                <textarea
                  value={bookingReason}
                  onChange={(e) => setBookingReason(e.target.value)}
                  placeholder="Describe your current medical concern..."
                  className="w-full bg-white border border-[#E5E0D3] rounded-xl p-2.5 h-20 outline-none resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#7A918D] hover:bg-[#5D6F6B] text-white font-bold rounded-xl shadow-sm"
                >
                  Confirm Appointment
                </button>
                <button
                  type="button"
                  onClick={() => setIsBookingOpen(false)}
                  className="px-5 py-3 bg-white border border-[#E5E0D3] text-[#2D332F] font-bold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {payingBill && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF9F6] w-full max-w-md rounded-3xl border border-[#E5E0D3] p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-[#2D332F]">
              Process Payment for Copay
            </h3>
            <p className="text-xs text-[#8C8679]">
              {payingBill.description} — Total Copay: ${payingBill.copay.toFixed(2)}
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#2D332F] mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  defaultValue={patient.name}
                  className="w-full bg-white border border-[#E5E0D3] rounded-xl p-2.5 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2D332F] mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  defaultValue="4532 •••• •••• 8891"
                  className="w-full bg-white border border-[#E5E0D3] rounded-xl p-2.5 outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2D332F] mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    defaultValue="08/28"
                    className="w-full bg-white border border-[#E5E0D3] rounded-xl p-2.5 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#2D332F] mb-1">
                    CVC
                  </label>
                  <input
                    type="text"
                    defaultValue="382"
                    className="w-full bg-white border border-[#E5E0D3] rounded-xl p-2.5 outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  onPayBill(payingBill.id);
                  setPayingBill(null);
                }}
                className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                Pay ${payingBill.copay.toFixed(2)}
              </button>
              <button
                onClick={() => setPayingBill(null)}
                className="px-5 py-3 bg-white border border-[#E5E0D3] text-[#2D332F] font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
