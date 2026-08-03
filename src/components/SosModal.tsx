import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  PhoneCall,
  MapPin,
  Ambulance,
  CheckCircle2,
  Clock,
  X,
  Navigation,
} from 'lucide-react';

interface SosModalProps {
  onClose: () => void;
  patientName: string;
}

export const SosModal: React.FC<SosModalProps> = ({
  onClose,
  patientName,
}) => {
  const [eta, setEta] = useState(8);
  const [unit, setUnit] = useState('Medic Ambulance Unit #14');
  const [step, setStep] = useState<'dispatching' | 'enroute'>('dispatching');

  useEffect(() => {
    const timer = setTimeout(() => {
      setStep('enroute');
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (step === 'enroute' && eta > 1) {
      const interval = setInterval(() => {
        setEta((prev) => Math.max(1, prev - 1));
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [step, eta]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FAF9F6] w-full max-w-lg rounded-3xl border border-rose-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Emergency Banner */}
        <div className="bg-rose-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl animate-pulse">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg tracking-tight">
                Emergency SOS Active
              </h2>
              <p className="text-xs text-white/90">
                GPS Position & Medical ID Broadcasted
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 transition-all text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dispatch Content */}
        <div className="p-6 space-y-5">
          {step === 'dispatching' ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-600 animate-spin">
                <Ambulance className="w-10 h-10" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#2D332F]">
                  Locating Nearest Paramedic Unit...
                </h3>
                <p className="text-xs text-[#8C8679] mt-1">
                  Connecting to Central City ER Dispatch Center
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* ETA Display Card */}
              <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                    Estimated Arrival
                  </div>
                  <div className="text-3xl font-extrabold text-rose-800 mt-1 flex items-baseline gap-1">
                    {eta} <span className="text-sm font-semibold">Minutes</span>
                  </div>
                  <div className="text-xs text-rose-600 font-medium mt-1">
                    Assigned: {unit}
                  </div>
                </div>
                <div className="w-14 h-14 bg-rose-600 text-white rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                  <Ambulance className="w-8 h-8" />
                </div>
              </div>

              {/* Nearest ER Map & Navigation Simulation */}
              <div className="p-4 bg-white border border-[#E5E0D3] rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#2D332F]">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#7A918D]" />
                    Nearest Hospital ER
                  </span>
                  <span className="text-emerald-700 font-semibold">1.4 miles away</span>
                </div>

                <div className="bg-[#F1EDE4] p-3 rounded-xl border border-[#E5E0D3] space-y-1 text-xs">
                  <div className="font-bold text-[#2D332F]">
                    St. Jude Memorial Hospital Emergency Dept
                  </div>
                  <div className="text-[#8C8679]">
                    1200 Healthcare Parkway, Building B Trauma Center
                  </div>
                  <div className="text-[11px] text-[#7A918D] font-medium flex items-center gap-1 pt-1">
                    <Navigation className="w-3.5 h-3.5" />
                    Turn-by-turn ER routes transmitted to responder GPS
                  </div>
                </div>
              </div>

              {/* Patient Vitals Summary Sent */}
              <div className="p-3 bg-white border border-[#E5E0D3] rounded-xl text-xs flex items-center justify-between">
                <div>
                  <span className="text-[#8C8679]">Patient: </span>
                  <span className="font-bold text-[#2D332F]">{patientName}</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-700 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Medical Record Shared</span>
                </div>
              </div>
            </div>
          )}

          {/* Hotline Action Bar */}
          <div className="pt-2 flex gap-3">
            <a
              href="tel:911"
              className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all text-center"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call 911 Hotline</span>
            </a>
            <button
              onClick={onClose}
              className="px-5 py-3 bg-white border border-[#E5E0D3] text-[#2D332F] font-semibold text-xs rounded-xl hover:bg-[#F1EDE4] transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
