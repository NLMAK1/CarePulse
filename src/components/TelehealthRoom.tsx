import React, { useState, useEffect } from 'react';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Send,
  User,
  Shield,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Appointment } from '../types';

interface TelehealthRoomProps {
  appointment: Appointment;
  onClose: () => void;
  userRole: 'patient' | 'doctor';
}

export const TelehealthRoom: React.FC<TelehealthRoomProps> = ({
  appointment,
  onClose,
  userRole,
}) => {
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [messages, setMessages] = useState<
    { sender: string; text: string; time: string }[]
  >([
    {
      sender: 'System',
      text: 'Encrypted HIPAA-compliant telehealth room initialized. Peer-to-peer web connection established.',
      time: 'Just now',
    },
    {
      sender: 'Dr. Marcus Chen',
      text: 'Hello! I am reviewing your recent ECG reports. How are you feeling today?',
      time: '1 min ago',
    },
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [notes, setNotes] = useState(appointment.clinicalNotes || '');
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setDuration((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    const nowStr = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    const senderName =
      userRole === 'doctor' ? appointment.doctorName : appointment.patientName;
    setMessages((prev) => [
      ...prev,
      { sender: senderName, text: inputMsg.trim(), time: nowStr },
    ]);
    setInputMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#FAF9F6] w-full max-w-5xl h-[90vh] rounded-3xl border border-[#E5E0D3] shadow-2xl flex flex-col overflow-hidden">
        {/* Telehealth Top Bar */}
        <div className="h-14 bg-[#7A918D] px-6 flex items-center justify-between text-white border-b border-[#5D6F6B]">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
            <span className="font-bold text-sm tracking-tight">
              Virtual Care Room • {appointment.specialty}
            </span>
            <span className="px-2.5 py-0.5 bg-black/20 text-white/90 text-xs rounded-full font-mono">
              {formatDuration(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-white/90">
            <Shield className="w-4 h-4 text-emerald-300" />
            <span className="hidden sm:inline">256-Bit E2E Encrypted</span>
          </div>
        </div>

        {/* Main Consultation Canvas & Sidebar */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Video Stream Container */}
          <div className="flex-1 bg-[#1E2320] p-4 flex flex-col justify-between relative overflow-hidden">
            {/* Primary Remote Video Simulation */}
            <div className="absolute inset-0 flex items-center justify-center">
              {videoOn ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#2B3531] to-[#121614] text-white">
                  <div className="w-28 h-28 rounded-full bg-[#7A918D] border-4 border-white/20 flex items-center justify-center text-3xl font-bold shadow-2xl mb-4">
                    {userRole === 'doctor' ? 'SJ' : 'MC'}
                  </div>
                  <h3 className="text-xl font-bold">
                    {userRole === 'doctor'
                      ? appointment.patientName
                      : appointment.doctorName}
                  </h3>
                  <p className="text-sm text-emerald-400 font-medium mt-1 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Live Video Stream Connected
                  </p>
                </div>
              ) : (
                <div className="text-white/60 flex flex-col items-center gap-2">
                  <VideoOff className="w-12 h-12" />
                  <span>Camera Paused</span>
                </div>
              )}
            </div>

            {/* Self Overlay Picture-in-Picture */}
            <div className="absolute bottom-6 right-6 w-40 h-28 bg-[#2D332F] rounded-2xl border-2 border-white/20 shadow-xl overflow-hidden flex items-center justify-center text-white text-xs">
              <div className="text-center">
                <User className="w-6 h-6 mx-auto mb-1 text-[#7A918D]" />
                <span className="font-semibold">You ({userRole})</span>
              </div>
            </div>

            {/* Floating Video Controls Bar */}
            <div className="relative z-10 mt-auto mx-auto bg-[#2D332F]/90 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-4 shadow-2xl">
              <button
                onClick={() => setMicOn(!micOn)}
                className={`p-3 rounded-full transition-all ${
                  micOn
                    ? 'bg-white/15 hover:bg-white/25 text-white'
                    : 'bg-rose-600 text-white'
                }`}
              >
                {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setVideoOn(!videoOn)}
                className={`p-3 rounded-full transition-all ${
                  videoOn
                    ? 'bg-white/15 hover:bg-white/25 text-white'
                    : 'bg-rose-600 text-white'
                }`}
              >
                {videoOn ? (
                  <Video className="w-5 h-5" />
                ) : (
                  <VideoOff className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={onClose}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg transition-all"
              >
                <PhoneOff className="w-5 h-5" />
                <span>End Call</span>
              </button>
            </div>
          </div>

          {/* Right Panel: Chat & Doctor Clinical Notes */}
          <div className="w-80 bg-[#FAF9F6] border-l border-[#E5E0D3] flex flex-col overflow-hidden">
            {/* Tab Selector for Right Panel */}
            <div className="p-3 bg-[#F1EDE4] border-b border-[#E5E0D3] flex items-center justify-between text-xs font-semibold text-[#2D332F]">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#7A918D]" />
                <span>Live Chat & Notes</span>
              </div>
              <span className="text-[10px] text-[#8C8679]">HIPAA Compliant</span>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border ${
                    m.sender === 'System'
                      ? 'bg-amber-50 border-amber-200 text-amber-800 text-[11px]'
                      : 'bg-white border-[#E5E0D3] text-[#2D332F]'
                  }`}
                >
                  <div className="flex justify-between font-bold text-[10px] text-[#8C8679] mb-1">
                    <span>{m.sender}</span>
                    <span>{m.time}</span>
                  </div>
                  <p>{m.text}</p>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-2 border-t border-[#E5E0D3] bg-[#F1EDE4] flex gap-2"
            >
              <input
                type="text"
                placeholder="Type encrypted message..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                className="flex-1 bg-white border border-[#E5E0D3] rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-[#7A918D] outline-none"
              />
              <button
                type="submit"
                className="p-2 bg-[#7A918D] text-white rounded-xl hover:bg-[#5D6F6B] transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Doctor Clinical Notes Editor */}
            {userRole === 'doctor' && (
              <div className="p-3 bg-white border-t border-[#E5E0D3]">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D332F] mb-1">
                  <FileText className="w-4 h-4 text-[#7A918D]" />
                  <span>Clinical EHR Note</span>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Type diagnostic notes..."
                  className="w-full h-20 bg-[#FAF9F6] border border-[#E5E0D3] rounded-xl p-2 text-xs focus:ring-1 focus:ring-[#7A918D] outline-none resize-none"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
