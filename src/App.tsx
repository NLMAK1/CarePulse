import React, { useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Appointment,
  EHRRecord,
  LabReport,
  Prescription,
  BillingItem,
  HospitalBed,
  InventoryItem,
  StaffMember,
  AuditLog,
} from './types';
import {
  INITIAL_USERS,
  INITIAL_APPOINTMENTS,
  INITIAL_EHR,
  INITIAL_LABS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_BILLING,
  INITIAL_BEDS,
  INITIAL_INVENTORY,
  INITIAL_STAFF,
  INITIAL_AUDIT_LOGS,
} from './data/mockData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PatientPortal } from './components/PatientPortal';
import { DoctorPortal } from './components/DoctorPortal';
import { AdminPortal } from './components/AdminPortal';
import { SosModal } from './components/SosModal';
import { FhirHl7Modal } from './components/FhirHl7Modal';
import { AuthModal } from './components/AuthModal';

export default function App() {
  // Global User Registration & Authentication State with localStorage persistence
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('carepulse_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load saved users', e);
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const savedId = localStorage.getItem('carepulse_current_user_id');
      if (savedId) {
        const found = users.find((u) => u.id === savedId);
        if (found) return found;
      }
    } catch (e) {
      console.error('Failed to load current active user ID', e);
    }
    return users[0] || INITIAL_USERS[0];
  });

  const [activeTab, setActiveTab] = useState<string>('overview');

  const [appointments, setAppointments] =
    useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [ehrRecords, setEhrRecords] = useState<EHRRecord[]>(INITIAL_EHR);
  const [labReports, setLabReports] = useState<LabReport[]>(INITIAL_LABS);
  const [prescriptions, setPrescriptions] =
    useState<Prescription[]>(INITIAL_PRESCRIPTIONS);
  const [billing, setBilling] = useState<BillingItem[]>(INITIAL_BILLING);
  const [beds, setBeds] = useState<HospitalBed[]>(INITIAL_BEDS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Modals & Registration Gateway
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isSosOpen, setIsSosOpen] = useState<boolean>(false);
  const [isFhirHl7Open, setIsFhirHl7Open] = useState<boolean>(false);

  // Sync users to device localStorage
  useEffect(() => {
    try {
      localStorage.setItem('carepulse_users', JSON.stringify(users));
    } catch (e) {
      console.error('Error saving users to storage', e);
    }
  }, [users]);

  // Sync active user ID to device localStorage
  useEffect(() => {
    try {
      if (currentUser?.id) {
        localStorage.setItem('carepulse_current_user_id', currentUser.id);
      }
    } catch (e) {
      console.error('Error saving current user ID', e);
    }
  }, [currentUser]);

  // Authentication & Sign-In Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'patient') setActiveTab('overview');
    else if (user.role === 'doctor') setActiveTab('queue');
    else setActiveTab('beds');

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'USER_AUTHENTICATED',
      resource: `Device Sign-In - ${user.name} (${user.role.toUpperCase()})`,
      status: 'SUCCESS',
      ipAddress: '127.0.0.1',
      timestamp: new Date().toLocaleString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleRegisterUser = (newUser: User) => {
    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    if (newUser.role === 'patient') setActiveTab('overview');
    else if (newUser.role === 'doctor') setActiveTab('queue');
    else setActiveTab('beds');

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      userId: newUser.id,
      userName: newUser.name,
      userRole: newUser.role,
      action: 'REGISTER_NEW_ACCOUNT',
      resource: `Created New ${newUser.role.toUpperCase()} Account - ${newUser.name}`,
      status: 'SUCCESS',
      ipAddress: '127.0.0.1',
      timestamp: new Date().toLocaleString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleSignOut = () => {
    localStorage.removeItem('carepulse_current_user_id');
    setIsAuthModalOpen(true);
  };

  // Legacy Role switching helper
  const handleSwitchRole = (role: UserRole) => {
    const nextUser = users.find((u) => u.role === role) || users[0];
    handleLogin(nextUser);
  };

  // Patient Actions
  const handleBookAppointment = (aptData: Partial<Appointment>) => {
    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      patientId: aptData.patientId || currentUser.id,
      patientName: aptData.patientName || currentUser.name,
      doctorId: aptData.doctorId || 'doc-1',
      doctorName: aptData.doctorName || 'Dr. Marcus Chen',
      specialty: aptData.specialty || 'General Practice',
      date: aptData.date || '2026-08-05',
      time: aptData.time || '10:00 AM',
      type: aptData.type || 'video',
      status: 'upcoming',
      reason: aptData.reason || 'General Consultation',
    };
    setAppointments((prev) => [newApt, ...prev]);

    // Add audit log
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'BOOK_APPOINTMENT',
      resource: `Appointment #${newApt.id} with ${newApt.doctorName}`,
      status: 'SUCCESS',
      ipAddress: '127.0.0.1',
      timestamp: new Date().toLocaleString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleUpdateAppointmentMeetLink = (
    appointmentId: string,
    googleMeetLink: string,
    googleMeetSpaceName: string
  ) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === appointmentId
          ? { ...apt, googleMeetLink, googleMeetSpaceName }
          : apt
      )
    );

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'CREATE_GOOGLE_MEET_SPACE',
      resource: `Google Meet Link Created: ${googleMeetSpaceName} for Appointment #${appointmentId}`,
      status: 'SUCCESS',
      ipAddress: '127.0.0.1',
      timestamp: new Date().toLocaleString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handlePayBill = (billId: string) => {
    setBilling((prev) =>
      prev.map((b) => (b.id === billId ? { ...b, status: 'Paid' } : b))
    );
  };

  const handleRequestRefill = (rxId: string) => {
    setPrescriptions((prev) =>
      prev.map((rx) =>
        rx.id === rxId
          ? {
              ...rx,
              pharmacyStatus: 'Sent',
              refillsLeft: Math.max(0, rx.refillsLeft - 1),
            }
          : rx
      )
    );
  };

  // Doctor Actions
  const handleCreatePrescription = (rxData: Partial<Prescription>) => {
    const newRx: Prescription = {
      id: `rx-${Date.now()}`,
      patientId: rxData.patientId || 'pat-1',
      patientName: rxData.patientName || 'Sarah Jenkins',
      doctorId: currentUser.id,
      doctorName: currentUser.name,
      medication: rxData.medication || 'Lisinopril',
      dosage: rxData.dosage || '10 mg',
      frequency: rxData.frequency || 'Once daily',
      duration: rxData.duration || '30 Days',
      refillsLeft: 3,
      pharmacyStatus: 'Sent',
      digitalSignature: `SIG-${currentUser.id.toUpperCase()}-${Date.now()}-VERIFIED`,
      createdAt: new Date().toLocaleString(),
    };
    setPrescriptions((prev) => [newRx, ...prev]);
  };

  const handleCreateLabOrder = (labData: Partial<LabReport>) => {
    const newLab: LabReport = {
      id: `lab-${Date.now()}`,
      patientId: labData.patientId || 'pat-1',
      patientName: labData.patientName || 'Sarah Jenkins',
      doctorId: currentUser.id,
      doctorName: currentUser.name,
      testName: labData.testName || 'Lipid Panel',
      testCategory: labData.testCategory || 'Blood Work',
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      results: [],
      flagged: false,
      interpretation: 'Order submitted to laboratory portal.',
    };
    setLabReports((prev) => [newLab, ...prev]);
  };

  const handleUpdateAppointmentStatus = (
    aptId: string,
    status: Appointment['status']
  ) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === aptId ? { ...a, status } : a))
    );
  };

  // Admin Actions
  const handleUpdateBedStatus = (
    bedId: string,
    status: HospitalBed['status'],
    patientName?: string
  ) => {
    setBeds((prev) =>
      prev.map((b) =>
        b.id === bedId
          ? {
              ...b,
              status,
              patientName:
                status === 'Occupied'
                  ? patientName || 'Admitted Patient'
                  : undefined,
            }
          : b
      )
    );
  };

  const handleRestockInventory = (itemId: string, qtyToAdd: number) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newQty = item.quantity + qtyToAdd;
          const status =
            newQty > item.minThreshold
              ? 'In Stock'
              : newQty > 10
              ? 'Low Stock'
              : 'Critical';
          return { ...item, quantity: newQty, status };
        }
        return item;
      })
    );
  };

  return (
    <div className="h-screen w-screen bg-[#FAF9F6] text-[#2D332F] font-sans flex flex-col overflow-hidden select-none">
      {/* Header */}
      <Header
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        onOpenSos={() => setIsSosOpen(true)}
        onOpenFhirHl7={() => setIsFhirHl7Open(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        allUsers={users}
      />

      {/* Main App Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          currentRole={currentUser.role}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenSos={() => setIsSosOpen(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onSignOut={handleSignOut}
        />

        {/* Dynamic Portal View Container */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {currentUser.role === 'patient' && (
            <PatientPortal
              patient={currentUser}
              appointments={appointments}
              ehrRecords={ehrRecords}
              labReports={labReports}
              prescriptions={prescriptions}
              billing={billing}
              doctors={users.filter((u) => u.role === 'doctor')}
              activeTab={activeTab}
              onBookAppointment={handleBookAppointment}
              onLaunchTelehealth={(apt) => {
                const link = apt.googleMeetLink || 'https://meet.google.com/new';
                window.open(link, '_blank');
              }}
              onPayBill={handlePayBill}
              onRequestRefill={handleRequestRefill}
              onOpenSos={() => setIsSosOpen(true)}
              onUpdateAppointmentMeetLink={handleUpdateAppointmentMeetLink}
            />
          )}

          {currentUser.role === 'doctor' && (
            <DoctorPortal
              doctor={currentUser}
              appointments={appointments}
              patients={users.filter((u) => u.role === 'patient')}
              ehrRecords={ehrRecords}
              labReports={labReports}
              prescriptions={prescriptions}
              activeTab={activeTab}
              onLaunchTelehealth={(apt) => {
                const link = apt.googleMeetLink || 'https://meet.google.com/new';
                window.open(link, '_blank');
              }}
              onCreatePrescription={handleCreatePrescription}
              onCreateLabOrder={handleCreateLabOrder}
              onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
              onUpdateAppointmentMeetLink={handleUpdateAppointmentMeetLink}
            />
          )}

          {(currentUser.role === 'admin' || currentUser.role === 'nurse') && (
            <AdminPortal
              beds={beds}
              inventory={inventory}
              staff={staff}
              auditLogs={auditLogs}
              billing={billing}
              activeTab={activeTab}
              onUpdateBedStatus={handleUpdateBedStatus}
              onRestockInventory={handleRestockInventory}
            />
          )}
        </main>
      </div>

      {/* Auth & Registration Gateway Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        allUsers={users}
        currentUser={currentUser}
        onLogin={handleLogin}
        onRegister={handleRegisterUser}
        canClose={true}
      />

      {/* Global Emergency SOS Modal */}
      {isSosOpen && (
        <SosModal
          onClose={() => setIsSosOpen(false)}
          patientName={currentUser.name}
        />
      )}

      {/* Global FHIR / HL7 Interoperability Data Exporter Modal */}
      {isFhirHl7Open && (
        <FhirHl7Modal
          user={currentUser}
          onClose={() => setIsFhirHl7Open(false)}
        />
      )}

      {/* Footer Bar */}
      <footer className="h-8 bg-[#F1EDE4] border-t border-[#E5E0D3] px-6 flex items-center justify-between text-[11px] text-[#8C8679] font-medium shrink-0">
        <div>
          CarePulse Hospital Engine • Node Cluster: Central-Medical-01 • E2E
          Encryption Active
        </div>
        <div className="flex gap-4">
          <span>v2.4.0-release</span>
          <span>HIPAA Audit Compliant</span>
          <span>FHIR R4 Gateway</span>
        </div>
      </footer>
    </div>
  );
}
