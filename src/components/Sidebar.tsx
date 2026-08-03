import React from 'react';
import { UserRole } from '../types';
import {
  Calendar,
  FileText,
  Video,
  Pill,
  CreditCard,
  AlertTriangle,
  BedDouble,
  Boxes,
  Users,
  BarChart3,
  ShieldCheck,
  User,
  HeartPulse,
} from 'lucide-react';

interface SidebarProps {
  currentRole: UserRole;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenSos: () => void;
  onOpenAuth?: () => void;
  onSignOut?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activeTab,
  onTabChange,
  onOpenSos,
  onOpenAuth,
  onSignOut,
}) => {
  const patientTabs = [
    { id: 'overview', label: 'Dashboard & Vitals', icon: HeartPulse },
    { id: 'appointments', label: 'Appointment Booking', icon: Calendar },
    { id: 'telehealth', label: 'Virtual Care Consultation', icon: Video },
    { id: 'records', label: 'Medical Records & Labs', icon: FileText },
    { id: 'prescriptions', label: 'e-Prescriptions & Refills', icon: Pill },
    { id: 'billing', label: 'Billing & Insurance Claims', icon: CreditCard },
  ];

  const doctorTabs = [
    { id: 'queue', label: 'Patient Queue & Schedule', icon: Calendar },
    { id: 'workspace', label: 'Telehealth Workspace', icon: Video },
    { id: 'ehr', label: 'EHR / Clinical History', icon: FileText },
    { id: 'prescribe', label: 'e-Prescription Builder', icon: Pill },
    { id: 'lab-orders', label: 'Lab Test Orders & Review', icon: HeartPulse },
  ];

  const adminTabs = [
    { id: 'beds', label: 'Bed & Resource Management', icon: BedDouble },
    { id: 'inventory', label: 'Pharmacy & Stock Inventory', icon: Boxes },
    { id: 'staff', label: 'Staff Roster & Shifts', icon: Users },
    { id: 'analytics', label: 'Revenue & Operations Analytics', icon: BarChart3 },
    { id: 'audit', label: 'HIPAA Audit & Interoperability', icon: ShieldCheck },
  ];

  let currentTabs = patientTabs;
  let categoryTitle = 'Patient Portal';

  if (currentRole === 'doctor') {
    currentTabs = doctorTabs;
    categoryTitle = 'Physician Workspace';
  } else if (currentRole === 'admin' || currentRole === 'nurse') {
    currentTabs = adminTabs;
    categoryTitle = 'Hospital Administration';
  }

  return (
    <aside className="w-64 bg-[#F1EDE4] border-r border-[#E5E0D3] p-4 flex flex-col shrink-0 select-none">
      <div className="text-[11px] text-[#8C8679] uppercase tracking-widest font-bold px-2 mb-3">
        {categoryTitle}
      </div>

      <nav className="space-y-1 flex-1 overflow-y-auto pr-1">
        {currentTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs text-left transition-all ${
                isActive
                  ? 'bg-[#E5E0D3] text-[#2D332F] font-semibold shadow-sm border border-[#D8D2C2]'
                  : 'text-[#5A5448] hover:bg-[#E5E0D3]/50 hover:text-[#2D332F]'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive ? 'text-[#7A918D]' : 'text-[#8C8679]'
                }`}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* SOS Quick Button in Sidebar for Patients */}
      {currentRole === 'patient' && (
        <div
          onClick={onOpenSos}
          className="mt-auto p-3.5 bg-rose-50 border border-rose-200 rounded-2xl cursor-pointer hover:bg-rose-100 transition-all text-center group shadow-sm"
        >
          <div className="flex items-center justify-center gap-2 text-rose-700 font-bold text-sm mb-1">
            <AlertTriangle className="w-4 h-4 text-rose-600 animate-bounce" />
            <span>Emergency SOS</span>
          </div>
          <div className="text-[10px] text-rose-600 font-medium">
            One-tap Ambulance & ER Dispatch
          </div>
        </div>
      )}

      {/* Technical Compliance & Auth Footer Note */}
      <div className="mt-4 pt-3 border-t border-[#E5E0D3] text-[10px] text-[#8C8679] space-y-2">
        <div className="flex items-center justify-between">
          <span>Role RBAC:</span>
          <span className="font-bold text-[#2D332F] uppercase">{currentRole}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Device Session:</span>
          <span className="font-medium text-emerald-700">Authenticated</span>
        </div>

        {onOpenAuth && (
          <button
            onClick={onOpenAuth}
            className="w-full py-2 bg-white border border-[#E5E0D3] hover:bg-[#E5E0D3]/40 text-[#2D332F] rounded-xl text-xs font-bold transition-all"
          >
            Switch / Register User
          </button>
        )}
      </div>
    </aside>
  );
};
