import React, { useState } from 'react';
import { Prescription, User } from '../types';
import {
  Pill,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Plus,
  RefreshCw,
  FileText,
  Building,
  UserCheck,
  ChevronRight,
  Filter,
  Info,
} from 'lucide-react';

interface DoctorPrescriptionBuilderProps {
  doctor: User;
  patients: User[];
  prescriptions: Prescription[];
  onCreatePrescription: (rx: Partial<Prescription>) => void;
  onRequestRefill?: (rxId: string) => void;
}

export const DoctorPrescriptionBuilder: React.FC<DoctorPrescriptionBuilderProps> = ({
  doctor,
  patients,
  prescriptions,
  onCreatePrescription,
}) => {
  // Prescription Form State
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [medication, setMedication] = useState('Lisinopril');
  const [dosage, setDosage] = useState('10 mg');
  const [frequency, setRxFrequency] = useState('Once daily in the morning with water');
  const [duration, setDuration] = useState('30 Days');
  const [refills, setRefills] = useState(3);
  const [pharmacyRoute, setPharmacyRoute] = useState('CVS Pharmacy #4081 - Main St');

  // Success Notification Banner
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Search Filter for Master Ledger
  const [ledgerSearch, setLedgerSearch] = useState('');

  const commonDrugs = [
    { name: 'Lisinopril', defaultDosage: '10 mg', category: 'ACE Inhibitor' },
    { name: 'Atorvastatin', defaultDosage: '20 mg', category: 'Statin / Cholesterol' },
    { name: 'Metformin HCl', defaultDosage: '500 mg', category: 'Antidiabetic' },
    { name: 'Amoxicillin', defaultDosage: '500 mg', category: 'Antibiotic' },
    { name: 'Sumatriptan', defaultDosage: '50 mg', category: 'Migraine Relief' },
    { name: 'Albuterol HFA', defaultDosage: '90 mcg/actuation', category: 'Bronchodilator' },
    { name: 'Omeprazole', defaultDosage: '20 mg', category: 'Proton Pump Inhibitor' },
    { name: 'Amlodipine Besylate', defaultDosage: '5 mg', category: 'Calcium Channel Blocker' },
  ];

  const handleQuickDrugSelect = (drug: typeof commonDrugs[0]) => {
    setMedication(drug.name);
    setDosage(drug.defaultDosage);
  };

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreatePrescription({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      doctorId: doctor.id,
      doctorName: doctor.name,
      medication,
      dosage,
      frequency,
      duration,
      refillsLeft: refills,
      pharmacyStatus: 'Sent',
      digitalSignature: `SIG-${doctor.id.toUpperCase()}-${Date.now()}-VERIFIED`,
      createdAt: new Date().toLocaleString(),
    });

    setSuccessMsg(`e-Prescription for ${medication} (${dosage}) successfully transmitted to ${pharmacyRoute}!`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const filteredPrescriptions = prescriptions.filter(
    (rx) =>
      rx.medication.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      rx.patientName.toLowerCase().includes(ledgerSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 1. HEADER BANNER */}
      <div className="bg-gradient-to-r from-[#2D332F] to-[#3D4742] text-white rounded-3xl p-6 shadow-md border border-[#E5E0D3]/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            DEA & Surescripts Electronic Prescribing Gateway (EPCS)
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            e-Prescription Builder & Refill Approvals
          </h2>
          <p className="text-xs text-white/80 leading-relaxed">
            Draft, cryptographically sign, and transmit prescriptions for legend and controlled substances directly
            to participating retail and mail-order pharmacies.
          </p>
        </div>

        <div className="bg-white/10 border border-white/20 p-4 rounded-2xl text-center shrink-0">
          <div className="text-2xl font-bold text-white">{prescriptions.length}</div>
          <div className="text-[10px] text-white/70 uppercase font-semibold">Prescriptions Active</div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl font-bold text-xs flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 2. PRESCRIPTION GENERATOR FORM & DRUG PICKER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E5E0D3] p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-[#E5E0D3] pb-3">
            <h3 className="text-base font-bold text-[#2D332F] flex items-center gap-2">
              <Pill className="w-5 h-5 text-[#7A918D]" />
              New e-Prescription Draft
            </h3>
            <span className="text-xs text-[#8C8679] font-medium">
              DEA License Verified • Doctor ID: {doctor.id}
            </span>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            {/* Patient Picker */}
            <div>
              <label className="block font-bold text-[#2D332F] mb-1">Select Patient Chart</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full bg-[#FAF9F6] border border-[#E5E0D3] rounded-xl p-2.5 outline-none font-medium"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (DOB: {p.dob} • Insurance: {p.insuranceProvider || 'Primary'})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Drug Suggestions Carousel */}
            <div>
              <label className="block font-bold text-[#2D332F] mb-1.5">Quick Formulary Selection</label>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {commonDrugs.map((drug) => (
                  <button
                    type="button"
                    key={drug.name}
                    onClick={() => handleQuickDrugSelect(drug)}
                    className={`px-3 py-1.5 rounded-xl border text-[11px] font-semibold whitespace-nowrap transition-all ${
                      medication === drug.name
                        ? 'bg-[#7A918D] text-white border-[#7A918D]'
                        : 'bg-[#FAF9F6] border-[#E5E0D3] text-[#2D332F] hover:bg-[#E5E0D3]/30'
                    }`}
                  >
                    {drug.name} ({drug.defaultDosage})
                  </button>
                ))}
              </div>
            </div>

            {/* Drug Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#2D332F] mb-1">Medication Name</label>
                <input
                  type="text"
                  value={medication}
                  onChange={(e) => setMedication(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#E5E0D3] rounded-xl p-2.5 outline-none font-medium"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-[#2D332F] mb-1">Dosage Strength</label>
                <input
                  type="text"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#E5E0D3] rounded-xl p-2.5 outline-none font-medium"
                  required
                />
              </div>
            </div>

            {/* SIG Instructions */}
            <div>
              <label className="block font-bold text-[#2D332F] mb-1">Sig / Administration Instructions</label>
              <input
                type="text"
                value={frequency}
                onChange={(e) => setRxFrequency(e.target.value)}
                placeholder="e.g. Take 1 tablet daily with morning meal"
                className="w-full bg-[#FAF9F6] border border-[#E5E0D3] rounded-xl p-2.5 outline-none font-medium"
                required
              />
            </div>

            {/* Duration, Refills, Pharmacy */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-[#2D332F] mb-1">Supply Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#E5E0D3] rounded-xl p-2.5 outline-none font-medium"
                >
                  <option value="15 Days">15 Days</option>
                  <option value="30 Days">30 Days</option>
                  <option value="90 Days">90 Days</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#2D332F] mb-1">Refills Authorized</label>
                <select
                  value={refills}
                  onChange={(e) => setRefills(Number(e.target.value))}
                  className="w-full bg-[#FAF9F6] border border-[#E5E0D3] rounded-xl p-2.5 outline-none font-medium"
                >
                  <option value={0}>0 (No Refills)</option>
                  <option value={1}>1 Refill</option>
                  <option value={3}>3 Refills</option>
                  <option value={5}>5 Refills</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#2D332F] mb-1">Target Pharmacy</label>
                <select
                  value={pharmacyRoute}
                  onChange={(e) => setPharmacyRoute(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#E5E0D3] rounded-xl p-2.5 outline-none font-medium"
                >
                  <option value="CVS Pharmacy #4081 - Main St">CVS Pharmacy #4081</option>
                  <option value="Walgreens #1209 - Medical Blvd">Walgreens #1209</option>
                  <option value="CarePulse Central Pharmacy">CarePulse Central Hospital Pharmacy</option>
                </select>
              </div>
            </div>

            {/* Allergy Check Warning Indicator */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Automated Drug Interaction & Allergy Check: Clear</span>
              </div>
              <span className="text-[10px] font-bold uppercase text-emerald-700">No Conflict</span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#7A918D] hover:bg-[#5D6F6B] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Cryptographically Sign & Transmit e-Prescription</span>
            </button>
          </form>
        </div>

        {/* Right Column: Active Patient Safety Profile */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E5E0D3] p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#2D332F] border-b border-[#E5E0D3] pb-3">
            Patient Allergy & Chart Summary
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#E5E0D3] space-y-1">
              <div className="font-bold text-[#2D332F]">{selectedPatient.name}</div>
              <div className="text-[#8C8679]">DOB: {selectedPatient.dob}</div>
              <div className="text-[#8C8679]">Blood Type: {selectedPatient.bloodType || 'A+'}</div>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
              <div className="font-bold text-rose-800 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Known Drug Allergies
              </div>
              <div className="text-rose-700 font-semibold">Penicillin, Latex</div>
            </div>

            <div className="p-3 bg-white border border-[#E5E0D3] rounded-xl space-y-1">
              <div className="font-bold text-[#2D332F]">Active Prescriptions Count</div>
              <div className="text-xs text-[#8C8679]">
                Patient currently has {prescriptions.filter((r) => r.patientId === selectedPatient.id).length} active prescriptions on file.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ISSUED PRESCRIPTIONS MASTER LEDGER */}
      <div className="bg-white rounded-2xl border border-[#E5E0D3] p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-base font-bold text-[#2D332F]">Issued Prescription Master Ledger</h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8C8679]" />
            <input
              type="text"
              value={ledgerSearch}
              onChange={(e) => setLedgerSearch(e.target.value)}
              placeholder="Search medication or patient..."
              className="w-full bg-[#FAF9F6] border border-[#E5E0D3] rounded-xl pl-9 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-[#7A918D]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF9F6] text-[#2D332F] font-bold border-y border-[#E5E0D3]">
              <tr>
                <th className="p-3">Patient Name</th>
                <th className="p-3">Medication & Dosage</th>
                <th className="p-3">SIG / Instructions</th>
                <th className="p-3">Refills</th>
                <th className="p-3">Pharmacy Status</th>
                <th className="p-3">DEA Signature Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D3]">
              {filteredPrescriptions.map((rx) => (
                <tr key={rx.id} className="hover:bg-[#FAF9F6]/50">
                  <td className="p-3 font-bold text-[#2D332F]">{rx.patientName}</td>
                  <td className="p-3 font-semibold text-[#7A918D]">
                    {rx.medication} ({rx.dosage})
                  </td>
                  <td className="p-3 text-[#5A5448]">{rx.frequency}</td>
                  <td className="p-3 font-bold">{rx.refillsLeft} remaining</td>
                  <td className="p-3">
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full">
                      {rx.pharmacyStatus}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-[10px] text-[#8C8679]">
                    {rx.digitalSignature || `SIG-VERIFIED-${rx.id}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
