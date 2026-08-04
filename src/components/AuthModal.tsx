import React, { useState } from 'react';
import { User, UserRole } from '../types';
import {
  Activity,
  UserCheck,
  ShieldCheck,
  UserPlus,
  LogIn,
  Stethoscope,
  Heart,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  Calendar,
  CreditCard,
  Building,
  CheckCircle2,
  X,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  allUsers: User[];
  currentUser: User | null;
  onLogin: (user: User) => void;
  onRegister: (newUser: User) => void;
  canClose?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  allUsers,
  currentUser,
  onLogin,
  onRegister,
  canClose = true,
}) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'register-patient' | 'register-doctor'>('signin');

  // Sign In State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Patient Registration State
  const [pName, setPName] = useState('');
  const [pEmail, setPEmail] = useState('');
  const [pPassword, setPPassword] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pDob, setPDob] = useState('1992-05-14');
  const [pGender, setPGender] = useState('Female');
  const [pBloodType, setPBloodType] = useState('A+');
  const [pInsurance, setPInsurance] = useState('BlueCross CarePulse Shield');
  const [pEmergName, setPEmergName] = useState('');
  const [pEmergPhone, setPEmergPhone] = useState('');

  // Doctor Registration State
  const [dName, setDName] = useState('');
  const [dEmail, setDEmail] = useState('');
  const [dPassword, setDPassword] = useState('');
  const [dSpecialty, setDSpecialty] = useState('General Practice');
  const [dPhone, setDPhone] = useState('');
  const [dLicense, setDLicense] = useState('MD-98421-CA');

  if (!isOpen) return null;

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Find user by email or name match
    const found = allUsers.find(
      (u) =>
        u.email.toLowerCase() === email.trim().toLowerCase() ||
        u.name.toLowerCase().includes(email.trim().toLowerCase())
    );

    if (found) {
      if (found.password && found.password !== password) {
        setErrorMsg('Incorrect password for this account. Please check your credentials and try again.');
        return;
      }
      onLogin(found);
      if (onClose && canClose) onClose();
    } else {
      setErrorMsg('No user account found matching that email or username. You can register a new account below or select a demo account.');
    }
  };

  const handlePatientRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pEmail || !pPassword) return;

    const newPatient: User = {
      id: `pat-${Date.now()}`,
      name: pName,
      email: pEmail,
      password: pPassword,
      role: 'patient',
      phone: pPhone || '(555) 019-2834',
      dob: pDob,
      gender: pGender,
      bloodType: pBloodType,
      insuranceProvider: pInsurance,
      emergencyContactName: pEmergName || 'Family Member',
      emergencyContactPhone: pEmergPhone || '(555) 999-0000',
    };

    onRegister(newPatient);
    if (onClose && canClose) onClose();
  };

  const handleDoctorRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dName || !dEmail || !dPassword) return;

    const newDoctor: User = {
      id: `doc-${Date.now()}`,
      name: dName.startsWith('Dr.') ? dName : `Dr. ${dName}`,
      email: dEmail,
      password: dPassword,
      role: 'doctor',
      specialty: dSpecialty,
      phone: dPhone || '(555) 302-1920',
    };

    onRegister(newDoctor);
    if (onClose && canClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FAF9F6] w-full max-w-2xl rounded-3xl border border-[#E5E0D3] p-6 shadow-2xl relative my-8 space-y-6">
        {/* Close button if optional */}
        {canClose && onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#E5E0D3]/50 hover:bg-[#E5E0D3] text-[#2D332F] flex items-center justify-center font-bold text-sm"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#7A918D] text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Activity className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-[#2D332F] tracking-tight">
            CarePulse Medical Access Gateway
          </h2>
          <p className="text-xs text-[#8C8679] max-w-md mx-auto">
            HIPAA & FHIR compliant unified portal authentication. Sign in to your patient dashboard or medical staff portal on this device.
          </p>
        </div>

        {/* Tab Selection Switcher */}
        <div className="grid grid-cols-3 gap-1 bg-[#E5E0D3]/40 p-1.5 rounded-2xl border border-[#E5E0D3]">
          <button
            type="button"
            onClick={() => setActiveTab('signin')}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'signin'
                ? 'bg-[#2D332F] text-white shadow-sm'
                : 'text-[#5A5448] hover:bg-white/60'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('register-patient')}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'register-patient'
                ? 'bg-[#7A918D] text-white shadow-sm'
                : 'text-[#5A5448] hover:bg-white/60'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>New Patient</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('register-doctor')}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'register-doctor'
                ? 'bg-[#7A918D] text-white shadow-sm'
                : 'text-[#5A5448] hover:bg-white/60'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>New Physician</span>
          </button>
        </div>

        {/* TAB 1: SIGN IN */}
        {activeTab === 'signin' && (
          <div className="space-y-6">
            <form onSubmit={handleSignInSubmit} className="space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-[#2D332F] mb-1">Email or Patient/Doctor Name</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-[#8C8679]" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. sarah.jenkins@carepulse.org or Sarah Jenkins"
                    className="w-full bg-white border border-[#E5E0D3] rounded-xl pl-9 pr-3 py-2.5 text-xs outline-none font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#2D332F] mb-1">Account Passcode / PIN</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-[#8C8679]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-[#E5E0D3] rounded-xl pl-9 pr-3 py-2.5 text-xs outline-none font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#2D332F] hover:bg-[#1E2320] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to Dashboard</span>
              </button>
            </form>

            {/* Quick Demo Instant Logins Bar */}
            <div className="pt-2 border-t border-[#E5E0D3] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#2D332F]">Quick 1-Click Demo Profiles</span>
                <span className="text-[10px] text-[#8C8679]">Select to access device view</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onLogin(u);
                      if (onClose && canClose) onClose();
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                      currentUser?.id === u.id
                        ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-400'
                        : 'bg-white border-[#E5E0D3] hover:border-[#7A918D]'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-[#2D332F]">{u.name}</div>
                      <div className="text-[10px] text-[#8C8679] capitalize">
                        {u.role === 'doctor' ? `Physician • ${u.specialty}` : u.role}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#E5E0D3]/60 text-[#2D332F]">
                      Login
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REGISTER PATIENT */}
        {activeTab === 'register-patient' && (
          <form onSubmit={handlePatientRegisterSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Registering a new Patient Profile with digital health card ID on this device.</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-[#2D332F] mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full bg-white border border-[#E5E0D3] rounded-xl p-2.5 outline-none font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#2D332F] mb-1">Email Address</label>
                <input
                  type="email"
                  value={pEmail}
                  onChange={(e) => setPEmail(e.target.value)}
                  placeholder="eleanor@example.com"
                  className="w-full bg-white border border-[#E5E0D3] rounded-xl p-2.5 outline-none font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#2D332F] mb-1">Account Password</label>
                <input
                  type="password"
                  value={pPassword}
                  onChange={(e) => setPPassword(e.target.value)}
                  placeholder="Set account password"
                  className="w-full bg-white border border-[#E5E0D3] rounded-xl p-2.5 outline-none font-medium"
                  required
                  minLength={4}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-[#2D332F] mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={pDob}
                  onChange={(e) => setPDob(e.target.value)}
                  className="w-full bg-white border border-[#E5E0D3] rounded-xl p-2.5 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2D332F] mb-1">Gender</label>
                <select
                  value={pGender}
                  onChange={(e) => setPGender(e.target.value)}
                  className="w-full bg-white border border-[#E5E0D3] rounded-xl p-2.5 outline-none font-medium"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#2D332F] mb-1">Blood Type</label>
                <select
                  value={pBloodType}
                  onChange={(e) => setPBloodType(e.target.value)}
                  className="w-full bg-white border border-[#E5E0D3] rounded-xl p-2.5 outline-none font-medium"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#2D332F] mb-1">Phone Number</label>
                <input
                  type="text"
                  value={pPhone}
                  onChange={(e) => setPPhone(e.target.value)}
                  placeholder="(555) 012-3456"
                  className="w-full bg-white border border-[#E5E0D3] rounded-xl p-2.5 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2D332F] mb-1">Insurance Provider</label>
                <input
                  type="text"
                  value={pInsurance}
                  onChange={(e) => setPInsurance(e.target.value)}
                  placeholder="BlueCross Shield / Aetna"
                  className="w-full bg-white border border-[#E5E0D3] rounded-xl p-2.5 outline-none font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#7A918D] hover:bg-[#5D6F6B] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Patient Account & Open Dashboard</span>
            </button>
          </form>
        )}

        {/* TAB 3: REGISTER DOCTOR */}
        {activeTab === 'register-doctor' && (
          <form onSubmit={handleDoctorRegisterSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Registering a verified Physician/Doctor credential with e-Prescribing rights.</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-[#2D332F] mb-1">Doctor Name</label>
                <input
                  type="text"
                  value={dName}
                  onChange={(e) => setDName(e.target.value)}
                  placeholder="e.g. Dr. Emily Vance"
                  className="w-full bg-white border border-[#E5E0D3] rounded-xl p-2.5 outline-none font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#2D332F] mb-1">Medical Email</label>
                <input
                  type="email"
                  value={dEmail}
                  onChange={(e) => setDEmail(e.target.value)}
                  placeholder="emily.vance@carepulse.org"
                  className="w-full bg-white border border-[#E5E0D3] rounded-xl p-2.5 outline-none font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#2D332F] mb-1">Account Password</label>
                <input
                  type="password"
                  value={dPassword}
                  onChange={(e) => setDPassword(e.target.value)}
                  placeholder="Set account password"
                  className="w-full bg-white border border-[#E5E0D3] rounded-xl p-2.5 outline-none font-medium"
                  required
                  minLength={4}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#2D332F] mb-1">Medical Specialty</label>
                <select
                  value={dSpecialty}
                  onChange={(e) => setDSpecialty(e.target.value)}
                  className="w-full bg-white border border-[#E5E0D3] rounded-xl p-2.5 outline-none font-medium"
                >
                  <option value="General Practice">General Practice / Family Medicine</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Psychiatry">Psychiatry</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#2D332F] mb-1">State License ID</label>
                <input
                  type="text"
                  value={dLicense}
                  onChange={(e) => setDLicense(e.target.value)}
                  placeholder="e.g. MD-98421-CA"
                  className="w-full bg-white border border-[#E5E0D3] rounded-xl p-2.5 outline-none font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#7A918D] hover:bg-[#5D6F6B] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Doctor Credentials & Launch Telehealth Workspace</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
