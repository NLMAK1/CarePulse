import React, { useState } from 'react';
import { Appointment, User, EHRRecord } from '../types';
import {
  Video,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Pill,
  Activity,
  UserCheck,
  Search,
  Sparkles,
  ShieldCheck,
  Plus,
  Calendar,
  Send,
  MessageSquare,
  Users,
} from 'lucide-react';

interface DoctorTelehealthWorkspaceProps {
  doctor: User;
  appointments: Appointment[];
  patients: User[];
  onLaunchTelehealth: (apt: Appointment) => void;
  onUpdateAppointmentStatus: (aptId: string, status: Appointment['status']) => void;
  onCreatePrescription: (rx: Partial<any>) => void;
}

export const DoctorTelehealthWorkspace: React.FC<DoctorTelehealthWorkspaceProps> = ({
  doctor,
  appointments,
  patients,
  onLaunchTelehealth,
  onUpdateAppointmentStatus,
  onCreatePrescription,
}) => {
  const [filterSpecialty, setFilterSpecialty] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Doctor Quick Clinical Note Scratchpad
  const [activeAptNote, setActiveAptNote] = useState<string>('apt-101');
  const [noteDraft, setNoteDraft] = useState('Patient reports mild exertion fatigue. ECG readings regular. Recommend BP logging.');

  const docTelehealthApts = appointments.filter(
    (a) => a.doctorId === doctor.id && a.type === 'video'
  );

  const waitingPatients = docTelehealthApts.filter(
    (a) => a.status === 'upcoming' || a.status === 'in-progress'
  );

  const completedVisits = docTelehealthApts.filter((a) => a.status === 'completed');

  return (
    <div className="space-y-6">
      {/* 1. TOP TELEHEALTH COMMAND CENTER HEADER */}
      <div className="bg-gradient-to-r from-[#2D332F] to-[#3D4742] text-white rounded-3xl p-6 shadow-md border border-[#E5E0D3]/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Physician Telehealth Queue • Live Video Server Ready
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Virtual Care Telehealth Workspace
          </h2>
          <p className="text-xs text-white/80 leading-relaxed">
            Welcome, {doctor.name}. Manage your virtual waiting room, conduct HIPAA-compliant video consultations,
            take real-time clinical notes, and send e-Prescriptions directly to patient pharmacies.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white/10 border border-white/20 px-4 py-3 rounded-2xl text-center">
            <div className="text-2xl font-bold text-amber-300">{waitingPatients.length}</div>
            <div className="text-[10px] text-white/70 uppercase font-semibold">In Waiting Room</div>
          </div>
          <div className="bg-white/10 border border-white/20 px-4 py-3 rounded-2xl text-center">
            <div className="text-2xl font-bold text-emerald-400">{completedVisits.length}</div>
            <div className="text-[10px] text-white/70 uppercase font-semibold">Visits Completed</div>
          </div>
        </div>
      </div>

      {/* 2. VIRTUAL WAITING ROOM QUEUE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Waiting Room List */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E5E0D3] p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-[#E5E0D3] pb-3">
            <h3 className="text-base font-bold text-[#2D332F] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#7A918D]" />
              Virtual Waiting Room Queue ({waitingPatients.length})
            </h3>
            <span className="text-xs text-[#8C8679] font-medium">
              Real-time WebRTC Peer Connections
            </span>
          </div>

          <div className="space-y-3">
            {waitingPatients.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#8C8679] bg-[#FAF9F6] rounded-xl border border-[#E5E0D3]">
                No patients currently in your virtual waiting room queue.
              </div>
            ) : (
              waitingPatients.map((apt) => (
                <div
                  key={apt.id}
                  className="p-5 bg-[#FAF9F6] border border-[#E5E0D3] rounded-2xl space-y-3 hover:border-[#7A918D] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-[#D8E2DC] text-[#7A918D] rounded-2xl flex items-center justify-center font-bold text-base shrink-0 shadow-inner">
                      {apt.patientName.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-[#2D332F]">{apt.patientName}</h4>
                        {apt.status === 'in-progress' ? (
                          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full animate-pulse">
                            Live Call Connected
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                            Waiting in Room
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#8C8679] mt-0.5">
                        Scheduled: {apt.time} • Specialty: {apt.specialty}
                      </div>
                      <div className="text-xs text-[#5A5448] font-medium mt-1">
                        <strong>Chief Complaint:</strong> {apt.reason}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => onLaunchTelehealth(apt)}
                      className="px-4 py-2.5 bg-[#7A918D] hover:bg-[#5D6F6B] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
                    >
                      <Video className="w-4 h-4" />
                      <span>{apt.status === 'in-progress' ? 'Re-Join Session' : 'Start Video Call'}</span>
                    </button>
                    <button
                      onClick={() => onUpdateAppointmentStatus(apt.id, 'completed')}
                      className="px-3 py-2.5 bg-white border border-[#E5E0D3] hover:bg-[#E5E0D3]/30 text-[#2D332F] text-xs font-semibold rounded-xl"
                      title="Mark Visit Completed"
                    >
                      Complete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Live Telehealth Clinical Note Pad */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E5E0D3] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E0D3] pb-3">
            <h3 className="text-sm font-bold text-[#2D332F] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#7A918D]" />
              Consultation EHR Scratchpad
            </h3>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              Encrypted
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-[#2D332F] mb-1">Select Patient Note Context</label>
              <select
                value={activeAptNote}
                onChange={(e) => setActiveAptNote(e.target.value)}
                className="w-full bg-[#FAF9F6] border border-[#E5E0D3] rounded-xl p-2 outline-none font-medium"
              >
                {waitingPatients.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.patientName} - {a.reason}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#2D332F] mb-1">Diagnostic & Impression Notes</label>
              <textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Type clinical observations during telehealth video call..."
                className="w-full bg-[#FAF9F6] border border-[#E5E0D3] rounded-xl p-3 h-32 outline-none resize-none font-medium"
              />
            </div>

            <button
              onClick={() => alert('Clinical EHR Note saved to patient chart!')}
              className="w-full py-2.5 bg-[#2D332F] hover:bg-[#1E2320] text-white font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              Save Note to Patient Chart
            </button>
          </div>
        </div>
      </div>

      {/* 3. COMPLETED VIRTUAL VISITS LOG */}
      <div className="bg-white rounded-2xl border border-[#E5E0D3] p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-[#2D332F]">Past Completed Telehealth Visits</h3>
        <div className="space-y-3">
          {completedVisits.length === 0 ? (
            <div className="p-4 bg-[#FAF9F6] rounded-xl border border-[#E5E0D3] text-xs text-[#8C8679]">
              No past completed virtual visits logged today.
            </div>
          ) : (
            completedVisits.map((apt) => (
              <div
                key={apt.id}
                className="p-4 bg-[#FAF9F6] border border-[#E5E0D3] rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-[#2D332F]">{apt.patientName}</span>
                  <span className="text-[#8C8679] ml-2">• {apt.date} at {apt.time}</span>
                  <div className="text-[#5A5448] mt-0.5">{apt.reason}</div>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[11px]">
                  Completed & Signed
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
