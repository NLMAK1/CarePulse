import React, { useState } from 'react';
import { Appointment, User } from '../types';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Plus,
  ShieldCheck,
  Activity,
  UserCheck,
  FileText,
  ChevronRight,
  Info,
  Send,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';

interface VirtualCareConsultationProps {
  patient: User;
  appointments: Appointment[];
  doctors: User[];
  onLaunchTelehealth: (apt: Appointment) => void;
  onBookAppointment: (aptData: Partial<Appointment>) => void;
}

export const VirtualCareConsultation: React.FC<VirtualCareConsultationProps> = ({
  patient,
  appointments,
  doctors,
  onLaunchTelehealth,
  onBookAppointment,
}) => {
  // Device Hardware Check State
  const [camTested, setCamTested] = useState(true);
  const [micTested, setMicTested] = useState(true);
  const [isTestingHardware, setIsTestingHardware] = useState(false);
  const [hardwareStatusMsg, setHardwareStatusMsg] = useState<string | null>(null);

  // Express Instant Queue State
  const [isExpressQueueOpen, setIsExpressQueueOpen] = useState(false);
  const [selectedExpressDoc, setSelectedExpressDoc] = useState(doctors[0]?.id || '');
  const [symptomsText, setSymptomsText] = useState('');
  const [symptomSeverity, setSymptomSeverity] = useState('Mild');
  const [queueSubmitted, setQueueSubmitted] = useState(false);

  // Selected Tab for Virtual Care Center
  const [viewTab, setViewTab] = useState<'upcoming' | 'express' | 'history' | 'device-check'>('upcoming');

  const upcomingVirtualApts = appointments.filter(
    (a) => a.type === 'video' && (a.status === 'upcoming' || a.status === 'in-progress')
  );

  const pastVirtualApts = appointments.filter(
    (a) => a.type === 'video' && a.status === 'completed'
  );

  const runHardwareTest = () => {
    setIsTestingHardware(true);
    setHardwareStatusMsg('Diagnostic check in progress: Testing webcam sensor, microphone level, & web RTC latency...');
    setTimeout(() => {
      setCamTested(true);
      setMicTested(true);
      setIsTestingHardware(false);
      setHardwareStatusMsg('Hardware check passed! Camera & Microphone are fully calibrated for HD telehealth calls.');
    }, 1500);
  };

  const handleExpressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const doc = doctors.find((d) => d.id === selectedExpressDoc) || doctors[0];
    onBookAppointment({
      patientId: patient.id,
      patientName: patient.name,
      doctorId: doc.id,
      doctorName: doc.name,
      specialty: doc.specialty || 'General Practice',
      date: new Date().toISOString().split('T')[0],
      time: 'Immediate Queue',
      type: 'video',
      status: 'in-progress',
      reason: `[Express Virtual Visit] Severity: ${symptomSeverity} - ${symptomsText || 'General Symptoms'}`,
    });
    setQueueSubmitted(true);
    setTimeout(() => {
      setIsExpressQueueOpen(false);
      setQueueSubmitted(false);
      setSymptomsText('');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. HERO VIRTUAL CARE CENTER BANNER */}
      <div className="bg-gradient-to-r from-[#2D332F] to-[#3D4742] text-white rounded-3xl p-6 shadow-md border border-[#E5E0D3]/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Virtual Care Portal Active • 256-Bit Encrypted
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Virtual Care Consultation Center
            </h2>
            <p className="text-xs text-white/80 leading-relaxed">
              Connect face-to-face with board-certified physicians, cardiologists, and specialists from anywhere.
              HD video consultations, instant digital triage, and encrypted e-Prescription delivery.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => setIsExpressQueueOpen(true)}
              className="px-5 py-3 bg-[#7A918D] hover:bg-[#5D6F6B] text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>Instant Virtual Visit</span>
            </button>
            <button
              onClick={() => setViewTab('device-check')}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold transition-all border border-white/20 flex items-center justify-center gap-2"
            >
              <Video className="w-4 h-4" />
              <span>Test Camera & Mic</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-[#E5E0D3] pb-2 overflow-x-auto">
        <button
          onClick={() => setViewTab('upcoming')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            viewTab === 'upcoming'
              ? 'bg-[#7A918D] text-white shadow-sm'
              : 'bg-white border border-[#E5E0D3] text-[#5A5448] hover:bg-[#E5E0D3]/30'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Scheduled Consultations ({upcomingVirtualApts.length})</span>
        </button>

        <button
          onClick={() => setViewTab('express')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            viewTab === 'express'
              ? 'bg-[#7A918D] text-white shadow-sm'
              : 'bg-white border border-[#E5E0D3] text-[#5A5448] hover:bg-[#E5E0D3]/30'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Express Waiting Room</span>
        </button>

        <button
          onClick={() => setViewTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            viewTab === 'history'
              ? 'bg-[#7A918D] text-white shadow-sm'
              : 'bg-white border border-[#E5E0D3] text-[#5A5448] hover:bg-[#E5E0D3]/30'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Consultation Summaries ({pastVirtualApts.length})</span>
        </button>

        <button
          onClick={() => setViewTab('device-check')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            viewTab === 'device-check'
              ? 'bg-[#7A918D] text-white shadow-sm'
              : 'bg-white border border-[#E5E0D3] text-[#5A5448] hover:bg-[#E5E0D3]/30'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Hardware & Device Test</span>
        </button>
      </div>

      {/* 3. TAB CONTENT VIEWS */}

      {/* TAB A: UPCOMING VIRTUAL CONSULTATIONS */}
      {viewTab === 'upcoming' && (
        <div className="space-y-4">
          {upcomingVirtualApts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E5E0D3] p-8 text-center space-y-3">
              <Video className="w-12 h-12 text-[#8C8679] mx-auto opacity-40" />
              <h3 className="font-bold text-[#2D332F] text-base">No Scheduled Video Consultations</h3>
              <p className="text-xs text-[#8C8679] max-w-md mx-auto">
                You currently have no upcoming virtual appointments. Request an instant express visit or schedule a video call with a specialist.
              </p>
              <button
                onClick={() => setIsExpressQueueOpen(true)}
                className="mt-2 px-5 py-2.5 bg-[#7A918D] text-white rounded-xl text-xs font-bold hover:bg-[#5D6F6B] transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Request Virtual Appointment</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingVirtualApts.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white rounded-2xl border border-[#E5E0D3] p-5 shadow-sm space-y-4 hover:border-[#7A918D] transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#7A918D] text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm">
                          {apt.doctorName.split(' ').pop()?.[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[#2D332F]">{apt.doctorName}</h4>
                          <span className="text-xs font-semibold text-[#7A918D]">
                            {apt.specialty}
                          </span>
                        </div>
                      </div>
                      {apt.status === 'in-progress' ? (
                        <span className="px-3 py-1 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full animate-pulse flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-amber-600" /> In Session
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                          Scheduled
                        </span>
                      )}
                    </div>

                    <div className="p-3 bg-[#FAF9F6] border border-[#E5E0D3] rounded-xl text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-[#2D332F]">
                        <span className="font-semibold flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#7A918D]" /> {apt.date}
                        </span>
                        <span className="font-semibold flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#7A918D]" /> {apt.time}
                        </span>
                      </div>
                      <div className="text-[#5A5448] pt-1">
                        <strong>Reason:</strong> {apt.reason}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => onLaunchTelehealth(apt)}
                      className="flex-1 py-3 bg-[#7A918D] hover:bg-[#5D6F6B] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      <Video className="w-4 h-4" />
                      <span>Launch Encrypted Call</span>
                    </button>
                    <button
                      onClick={() => setViewTab('device-check')}
                      className="px-3 py-3 bg-[#FAF9F6] border border-[#E5E0D3] hover:bg-[#E5E0D3]/30 text-[#2D332F] rounded-xl text-xs font-semibold"
                      title="Test Audio/Video"
                    >
                      Test Gear
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB B: EXPRESS WAITING ROOM */}
      {viewTab === 'express' && (
        <div className="bg-white rounded-2xl border border-[#E5E0D3] p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E0D3] pb-4">
            <div>
              <h3 className="text-lg font-bold text-[#2D332F]">
                Express On-Demand Virtual Queue
              </h3>
              <p className="text-xs text-[#8C8679] mt-0.5">
                Join our live digital triage queue to speak with the first available attending physician.
              </p>
            </div>
            <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Est. Wait Time: &lt; 5 mins</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                className="p-4 bg-[#FAF9F6] border border-[#E5E0D3] rounded-2xl space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#7A918D] text-white rounded-xl flex items-center justify-center font-bold text-sm">
                      {doc.name.split(' ').pop()?.[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#2D332F]">{doc.name}</h4>
                      <span className="text-xs text-[#7A918D] font-semibold">{doc.specialty}</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#8C8679]">
                    Available for video triage, prescription refills, and acute symptom consultation.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedExpressDoc(doc.id);
                    setIsExpressQueueOpen(true);
                  }}
                  className="w-full py-2 bg-[#2D332F] hover:bg-[#1E2320] text-white rounded-xl text-xs font-bold transition-all"
                >
                  Request Express Visit
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB C: PAST CONSULTATION SUMMARIES */}
      {viewTab === 'history' && (
        <div className="bg-white rounded-2xl border border-[#E5E0D3] p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-[#2D332F]">
            Completed Consultation Summaries & AI Notes
          </h3>
          <p className="text-xs text-[#8C8679]">
            Access recorded clinical notes, physician recommendations, and follow-up directives from past sessions.
          </p>

          <div className="space-y-4 pt-2">
            {pastVirtualApts.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#8C8679] bg-[#FAF9F6] rounded-xl border border-[#E5E0D3]">
                No completed virtual consultation records found in your primary EHR log.
              </div>
            ) : (
              pastVirtualApts.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 bg-[#FAF9F6] border border-[#E5E0D3] rounded-2xl space-y-3"
                >
                  <div className="flex justify-between items-center text-xs font-bold text-[#2D332F]">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-[#7A918D]" />
                      <span>{apt.doctorName} ({apt.specialty})</span>
                    </div>
                    <span className="text-[#8C8679]">{apt.date} • {apt.time}</span>
                  </div>

                  <div className="text-xs text-[#5A5448] space-y-1">
                    <div><strong>Visit Reason:</strong> {apt.reason}</div>
                    <div>
                      <strong>Physician Clinical Summary:</strong>{' '}
                      {apt.clinicalNotes || 'Patient demonstrated satisfactory response to treatment. Recommended ongoing blood pressure monitoring and follow-up in 30 days.'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 text-[11px] border-t border-[#E5E0D3]/60">
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> EHR Synced & Signed
                    </span>
                    <button className="text-[#7A918D] font-bold hover:underline flex items-center gap-1">
                      <span>Download Visit Summary PDF</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB D: HARDWARE & DEVICE TEST */}
      {viewTab === 'device-check' && (
        <div className="bg-white rounded-2xl border border-[#E5E0D3] p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-[#E5E0D3] pb-4">
            <div>
              <h3 className="text-lg font-bold text-[#2D332F]">
                Telehealth Audio & Video Diagnostics
              </h3>
              <p className="text-xs text-[#8C8679]">
                Verify camera feed, microphone sensitivity, and connection speed before joining your doctor.
              </p>
            </div>
            <button
              onClick={runHardwareTest}
              disabled={isTestingHardware}
              className="px-4 py-2.5 bg-[#7A918D] hover:bg-[#5D6F6B] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isTestingHardware ? 'animate-spin' : ''}`} />
              <span>{isTestingHardware ? 'Testing Hardware...' : 'Run Diagnostics'}</span>
            </button>
          </div>

          {hardwareStatusMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{hardwareStatusMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Camera Test Box */}
            <div className="bg-[#1E2320] rounded-2xl p-4 text-white flex flex-col justify-between h-56 relative overflow-hidden">
              <div className="flex justify-between items-center text-xs font-bold z-10">
                <span>HD Camera Sensor Test</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px]">
                  1080p @ 30fps
                </span>
              </div>

              <div className="my-auto text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-[#7A918D] mx-auto flex items-center justify-center font-bold text-xl shadow-lg border-2 border-white/20">
                  {patient.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="text-xs font-medium text-emerald-400 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Live WebCam Stream Active
                </div>
              </div>

              <div className="text-[11px] text-white/60 text-center z-10">
                Facing camera check optimal. Ensure adequate room lighting.
              </div>
            </div>

            {/* Microphone Test Box */}
            <div className="bg-[#FAF9F6] border border-[#E5E0D3] rounded-2xl p-5 space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-sm text-[#2D332F] mb-1">Microphone Audio Meter</h4>
                <p className="text-xs text-[#8C8679]">
                  Speak out loud to confirm audio level sensitivity.
                </p>

                <div className="mt-4 space-y-2">
                  <div className="text-xs font-semibold text-[#2D332F] flex justify-between">
                    <span>Input Volume Signal:</span>
                    <span className="text-emerald-700">Optimal (78%)</span>
                  </div>
                  <div className="w-full bg-[#E5E0D3] h-3 rounded-full overflow-hidden flex gap-1 p-0.5">
                    <div className="bg-emerald-500 h-full w-[20%] rounded-sm" />
                    <div className="bg-emerald-500 h-full w-[20%] rounded-sm" />
                    <div className="bg-emerald-500 h-full w-[20%] rounded-sm" />
                    <div className="bg-emerald-500 h-full w-[18%] rounded-sm" />
                    <div className="bg-[#E5E0D3] h-full w-[22%] rounded-sm" />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white border border-[#E5E0D3] rounded-xl text-xs text-[#5A5448] flex items-center gap-2">
                <Info className="w-4 h-4 text-[#7A918D] shrink-0" />
                <span>Noise cancellation filters and echo suppression are automatically active.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EXPRESS VISIT MODAL */}
      {isExpressQueueOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF9F6] w-full max-w-lg rounded-3xl border border-[#E5E0D3] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E0D3] pb-3">
              <h3 className="text-lg font-bold text-[#2D332F] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#7A918D]" />
                Express Virtual Visit Triage
              </h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">
                Live Doctor On Standby
              </span>
            </div>

            {queueSubmitted ? (
              <div className="p-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-[#2D332F]">Joined Virtual Waiting Room!</h4>
                <p className="text-xs text-[#8C8679]">
                  Your triage request was transmitted. The physician will connect to your video room shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleExpressSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[#2D332F] mb-1">
                    Select Attending Physician
                  </label>
                  <select
                    value={selectedExpressDoc}
                    onChange={(e) => setSelectedExpressDoc(e.target.value)}
                    className="w-full bg-white border border-[#E5E0D3] rounded-xl p-2.5 outline-none font-medium"
                  >
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.specialty})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#2D332F] mb-1">
                    Symptom Severity
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Mild', 'Moderate', 'Acute'].map((sev) => (
                      <button
                        type="button"
                        key={sev}
                        onClick={() => setSymptomSeverity(sev)}
                        className={`py-2 rounded-xl font-bold border transition-all ${
                          symptomSeverity === sev
                            ? 'bg-[#7A918D] text-white border-[#7A918D]'
                            : 'bg-white text-[#2D332F] border-[#E5E0D3]'
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#2D332F] mb-1">
                    Current Medical Concern / Symptoms
                  </label>
                  <textarea
                    value={symptomsText}
                    onChange={(e) => setSymptomsText(e.target.value)}
                    placeholder="Describe what you are experiencing today..."
                    className="w-full bg-white border border-[#E5E0D3] rounded-xl p-2.5 h-20 outline-none resize-none"
                    required
                  />
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-[11px] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    For medical emergencies, severe chest pain, or trauma, please use the Emergency SOS button or call 911 immediately.
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#7A918D] hover:bg-[#5D6F6B] text-white font-bold rounded-xl shadow-sm"
                  >
                    Enter Virtual Waiting Room
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsExpressQueueOpen(false)}
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
    </div>
  );
};
