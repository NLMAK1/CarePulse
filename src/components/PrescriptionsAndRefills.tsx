import React, { useState } from 'react';
import { Prescription, User } from '../types';
import {
  Pill,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Store,
  Truck,
  QrCode,
  Download,
  FileText,
  ShieldCheck,
  Plus,
  Calendar,
  ChevronRight,
  Info,
  Check,
  Building,
} from 'lucide-react';

interface PrescriptionsAndRefillsProps {
  patient: User;
  prescriptions: Prescription[];
  doctors: User[];
  onRequestRefill: (rxId: string, pharmacyName?: string, notes?: string) => void;
}

export const PrescriptionsAndRefills: React.FC<PrescriptionsAndRefillsProps> = ({
  patient,
  prescriptions,
  doctors,
  onRequestRefill,
}) => {
  // Refill Modal state
  const [refillRx, setRefillRx] = useState<Prescription | null>(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState('CVS Pharmacy #4081 - Main St');
  const [fulfillmentType, setFulfillmentType] = useState<'pickup' | 'delivery'>('pickup');
  const [patientNotes, setPatientNotes] = useState('');
  const [refillSuccessMsg, setRefillSuccessMsg] = useState<string | null>(null);

  // Digital Rx QR Code Modal
  const [qrModalRx, setQrModalRx] = useState<Prescription | null>(null);

  // Daily Pill Tracker State
  const [takenMeds, setTakenMeds] = useState<Record<string, boolean>>({
    'rx-1': true, // Lisinopril taken
  });

  const toggleMedTaken = (rxId: string) => {
    setTakenMeds((prev) => ({ ...prev, [rxId]: !prev[rxId] }));
  };

  const handleRefillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refillRx) return;

    onRequestRefill(refillRx.id, selectedPharmacy, patientNotes);
    setRefillSuccessMsg(`Refill request for ${refillRx.medication} submitted to ${selectedPharmacy}!`);
    setTimeout(() => {
      setRefillRx(null);
      setRefillSuccessMsg(null);
      setPatientNotes('');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. HERO PRESCRIPTION & REFILLS BANNER */}
      <div className="bg-gradient-to-r from-[#2D332F] to-[#3D4742] text-white rounded-3xl p-6 shadow-md border border-[#E5E0D3]/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Surescripts & DEA Cryptographic Gateway Connected
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              e-Prescriptions & Pharmacy Refills
            </h2>
            <p className="text-xs text-white/80 leading-relaxed">
              Manage your active medications, track real-time pharmacy fulfillment, request instant refills,
              and view cryptographically signed e-Prescriptions verified by your physician.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0 text-center">
            <div className="bg-white/10 border border-white/20 p-3 rounded-2xl">
              <div className="text-2xl font-bold text-white">{prescriptions.length}</div>
              <div className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">Active Meds</div>
            </div>
            <div className="bg-white/10 border border-white/20 p-3 rounded-2xl">
              <div className="text-2xl font-bold text-emerald-400">
                {prescriptions.reduce((acc, curr) => acc + curr.refillsLeft, 0)}
              </div>
              <div className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">Refills Remaining</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DAILY MEDICATION TRACKER & PILL REMINDER */}
      <div className="bg-white rounded-2xl border border-[#E5E0D3] p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E0D3] pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#7A918D]" />
            <div>
              <h3 className="text-sm font-bold text-[#2D332F]">Today's Medication Intake Tracker</h3>
              <p className="text-[11px] text-[#8C8679]">Log your daily dosage adherence for your physician's EHR review.</p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#7A918D] bg-[#E5E0D3]/50 px-3 py-1 rounded-full">
            {Object.values(takenMeds).filter(Boolean).length} / {prescriptions.length} Taken
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {prescriptions.map((rx) => {
            const isTaken = !!takenMeds[rx.id];
            return (
              <div
                key={rx.id}
                onClick={() => toggleMedTaken(rx.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  isTaken
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                    : 'bg-[#FAF9F6] border-[#E5E0D3] hover:border-[#7A918D]'
                }`}
              >
                <div>
                  <div className="font-bold text-xs">{rx.medication}</div>
                  <div className="text-[11px] text-[#8C8679] mt-0.5">{rx.dosage} • {rx.frequency}</div>
                </div>
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    isTaken ? 'bg-emerald-600 text-white' : 'border border-[#E5E0D3] bg-white'
                  }`}
                >
                  {isTaken && <Check className="w-4 h-4" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. ACTIVE PRESCRIPTIONS & REFILL FULFILLMENT CARDS */}
      <div className="bg-white rounded-2xl border border-[#E5E0D3] p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[#2D332F]">Active Prescriptions & Pharmacy Status</h3>
            <p className="text-xs text-[#8C8679]">
              Digitally signed e-Prescriptions transmitted directly to your designated retail or mail-order pharmacy.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {prescriptions.map((rx) => (
            <div
              key={rx.id}
              className="p-5 bg-[#FAF9F6] border border-[#E5E0D3] rounded-2xl space-y-4 hover:border-[#7A918D] transition-all"
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E0D3] pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#7A918D] text-white rounded-2xl flex items-center justify-center shrink-0">
                    <Pill className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-[#2D332F]">{rx.medication}</h4>
                      <span className="px-2.5 py-0.5 bg-[#E5E0D3] text-[#2D332F] text-xs font-semibold rounded-full">
                        {rx.dosage}
                      </span>
                    </div>
                    <p className="text-xs text-[#8C8679] mt-0.5">
                      Prescribed by {rx.doctorName} • Issued {rx.createdAt || 'Recent'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> DEA Digital Signature Verified
                  </span>
                </div>
              </div>

              {/* Prescription Body Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-white p-3 rounded-xl border border-[#E5E0D3]">
                  <span className="text-[#8C8679] block font-medium mb-1">Sig Instructions / Dosage:</span>
                  <span className="font-bold text-[#2D332F]">{rx.frequency}</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-[#E5E0D3]">
                  <span className="text-[#8C8679] block font-medium mb-1">Refills Authorized:</span>
                  <span className="font-bold text-[#2D332F]">
                    {rx.refillsLeft} Refills Left
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-[#E5E0D3]">
                  <span className="text-[#8C8679] block font-medium mb-1">Current Pharmacy Status:</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <Store className="w-3.5 h-3.5" /> {rx.pharmacyStatus} at Retail Pharmacy
                  </span>
                </div>
              </div>

              {/* Pharmacy Fulfillment Timeline */}
              <div className="p-3.5 bg-white border border-[#E5E0D3] rounded-xl space-y-2">
                <div className="text-[11px] font-bold text-[#8C8679] uppercase tracking-wider">
                  Fulfillment Status Timeline
                </div>
                <div className="flex items-center justify-between text-xs text-[#2D332F] font-semibold gap-2 pt-1">
                  <div className="flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" /> <span>e-Rx Signed</span>
                  </div>
                  <div className="h-0.5 flex-1 bg-emerald-500" />
                  <div className="flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" /> <span>Transmitted</span>
                  </div>
                  <div className="h-0.5 flex-1 bg-emerald-500" />
                  <div className={`flex items-center gap-1.5 ${rx.pharmacyStatus === 'Ready' || rx.pharmacyStatus === 'Dispensed' ? 'text-emerald-700' : 'text-[#8C8679]'}`}>
                    <Store className="w-4 h-4" /> <span>{rx.pharmacyStatus === 'Ready' ? 'Ready for Pickup' : 'Processing at Pharmacy'}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                <div className="text-[11px] text-[#8C8679] font-mono">
                  DEA Signature ID: {rx.digitalSignature || `SIG-DOC1-${rx.id}-VERIFIED`}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQrModalRx(rx)}
                    className="px-3.5 py-2 bg-white border border-[#E5E0D3] hover:bg-[#E5E0D3]/30 text-[#2D332F] rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                  >
                    <QrCode className="w-4 h-4 text-[#7A918D]" />
                    <span>View Pharmacy QR</span>
                  </button>

                  <button
                    onClick={() => setRefillRx(rx)}
                    disabled={rx.refillsLeft <= 0}
                    className="px-4 py-2 bg-[#7A918D] hover:bg-[#5D6F6B] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{rx.refillsLeft > 0 ? 'Request Refill' : 'No Refills Remaining'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. REFILL REQUEST MODAL */}
      {refillRx && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF9F6] w-full max-w-lg rounded-3xl border border-[#E5E0D3] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E0D3] pb-3">
              <h3 className="text-lg font-bold text-[#2D332F] flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-[#7A918D]" />
                Request Pharmacy Refill
              </h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">
                {refillRx.refillsLeft} Refills Remaining
              </span>
            </div>

            {refillSuccessMsg ? (
              <div className="p-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-[#2D332F]">Refill Request Transmitted!</h4>
                <p className="text-xs text-[#8C8679]">{refillSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleRefillSubmit} className="space-y-4 text-xs">
                <div className="p-3 bg-white rounded-xl border border-[#E5E0D3] space-y-1">
                  <div className="font-bold text-[#2D332F]">{refillRx.medication} ({refillRx.dosage})</div>
                  <div className="text-[#8C8679]">SIG: {refillRx.frequency}</div>
                  <div className="text-[#8C8679]">Prescribing Doctor: {refillRx.doctorName}</div>
                </div>

                <div>
                  <label className="block font-bold text-[#2D332F] mb-1">
                    Select Target Pharmacy
                  </label>
                  <select
                    value={selectedPharmacy}
                    onChange={(e) => setSelectedPharmacy(e.target.value)}
                    className="w-full bg-white border border-[#E5E0D3] rounded-xl p-2.5 outline-none font-medium"
                  >
                    <option value="CVS Pharmacy #4081 - Main St">CVS Pharmacy #4081 - 124 Main St</option>
                    <option value="Walgreens #1209 - Medical Center Blvd">Walgreens #1209 - Medical Center Blvd</option>
                    <option value="Hospital Internal CarePulse Pharmacy">CarePulse Central Hospital In-House Pharmacy</option>
                    <option value="Express Scripts Mail-Order Home Delivery">Express Scripts Mail-Order (Home Delivery)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#2D332F] mb-1">
                    Fulfillment Preference
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setFulfillmentType('pickup')}
                      className={`flex-1 py-2.5 rounded-xl font-bold border transition-all flex items-center justify-center gap-2 ${
                        fulfillmentType === 'pickup'
                          ? 'bg-[#7A918D] text-white border-[#7A918D]'
                          : 'bg-white text-[#2D332F] border-[#E5E0D3]'
                      }`}
                    >
                      <Store className="w-4 h-4" /> In-Store Counter Pickup
                    </button>
                    <button
                      type="button"
                      onClick={() => setFulfillmentType('delivery')}
                      className={`flex-1 py-2.5 rounded-xl font-bold border transition-all flex items-center justify-center gap-2 ${
                        fulfillmentType === 'delivery'
                          ? 'bg-[#7A918D] text-white border-[#7A918D]'
                          : 'bg-white text-[#2D332F] border-[#E5E0D3]'
                      }`}
                    >
                      <Truck className="w-4 h-4" /> Home Express Delivery
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#2D332F] mb-1">
                    Special Pharmacist Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={patientNotes}
                    onChange={(e) => setPatientNotes(e.target.value)}
                    placeholder="e.g. Please use easy-open caps, notify via SMS when ready..."
                    className="w-full bg-white border border-[#E5E0D3] rounded-xl p-2.5 outline-none font-medium"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#7A918D] hover:bg-[#5D6F6B] text-white font-bold rounded-xl shadow-sm"
                  >
                    Submit Refill Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setRefillRx(null)}
                    className="px-5 py-3 bg-white border border-[#E5E0D3] text-[#2D332F] font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 5. PHARMACY QR CODE MODAL */}
      {qrModalRx && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF9F6] w-full max-w-sm rounded-3xl border border-[#E5E0D3] p-6 shadow-2xl space-y-4 text-center">
            <h3 className="text-base font-bold text-[#2D332F]">Digital e-Prescription QR</h3>
            <p className="text-xs text-[#8C8679]">
              Scan this barcode at any participating retail pharmacy counter for quick retrieval.
            </p>

            <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-[#E5E0D3] inline-block shadow-inner my-2">
              <QrCode className="w-36 h-36 text-[#2D332F] mx-auto" />
            </div>

            <div className="text-xs font-bold text-[#2D332F]">
              {qrModalRx.medication} ({qrModalRx.dosage})
            </div>
            <div className="text-[11px] text-[#8C8679] font-mono">
              DEA SIG: {qrModalRx.digitalSignature}
            </div>

            <button
              onClick={() => setQrModalRx(null)}
              className="w-full py-2.5 bg-[#2D332F] text-white font-bold text-xs rounded-xl"
            >
              Close Barcode View
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
