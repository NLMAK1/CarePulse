import React from 'react';
import { User, UserRole } from '../types';
import { Activity, ShieldCheck, AlertCircle, LogOut, UserPlus, LogIn, UserCheck } from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  onSwitchRole: (role: UserRole) => void;
  onOpenSos: () => void;
  onOpenFhirHl7: () => void;
  onOpenAuth: () => void;
  onSignOut: () => void;
  allUsers: User[];
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSwitchRole,
  onOpenSos,
  onOpenFhirHl7,
  onOpenAuth,
  onSignOut,
  allUsers,
}) => {
  return (
    <header className="h-16 bg-[#7A918D] px-4 md:px-6 flex items-center justify-between shadow-sm z-20 text-white shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-white/95 rounded-xl flex items-center justify-center shadow-inner">
          <Activity className="w-5 h-5 text-[#7A918D]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-white font-bold text-lg md:text-xl tracking-tight leading-none">
              CarePulse
            </h1>
            <span className="px-2 py-0.5 bg-white/20 text-white text-[10px] font-semibold uppercase tracking-widest rounded-md">
              HIPAA & FHIR v4
            </span>
          </div>
          <p className="text-[11px] text-white/80 hidden sm:block">
            Integrated Healthcare Operations System
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Live Status Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-black/10 rounded-full border border-white/10 text-xs text-white/90">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
          <span>HL7 Gateway Active</span>
        </div>

        {/* FHIR/HL7 Interoperability Export Button */}
        <button
          onClick={onOpenFhirHl7}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-medium rounded-lg transition-all border border-white/20"
          title="Export FHIR R4 & HL7 v2.5.1 Data"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-300" />
          <span className="hidden sm:inline">FHIR Export</span>
        </button>

        {/* Active Authenticated User Badge & Switch/Auth Button */}
        <div className="flex items-center gap-2 bg-[#5D6F6B] px-3 py-1.5 rounded-xl border border-white/20">
          <div className="w-7 h-7 bg-white text-[#7A918D] rounded-lg flex items-center justify-center font-bold text-xs shadow-sm">
            {currentUser.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white truncate max-w-[120px]">
                {currentUser.name}
              </span>
              <span className="px-1.5 py-0.2 bg-white/20 text-[9px] font-bold uppercase rounded text-white">
                {currentUser.role}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-white/80">
              <button
                onClick={onOpenAuth}
                className="hover:underline text-emerald-300 font-semibold flex items-center gap-1"
              >
                <UserCheck className="w-3 h-3" />
                <span>Switch / Register</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={onSignOut}
          className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-rose-600/80 text-white font-semibold text-xs rounded-xl transition-all border border-white/20"
          title="Sign Out of Device Session"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>

        {/* Quick Emergency SOS Button */}
        {currentUser.role === 'patient' && (
          <button
            onClick={onOpenSos}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all animate-pulse"
          >
            <AlertCircle className="w-4 h-4" />
            <span>SOS</span>
          </button>
        )}
      </div>
    </header>
  );
};

