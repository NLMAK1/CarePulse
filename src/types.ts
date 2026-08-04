export type UserRole = 'patient' | 'doctor' | 'admin' | 'nurse';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone: string;
  specialty?: string;
  dob?: string;
  gender?: string;
  insuranceProvider?: string;
  insurancePolicy?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  bloodType?: string;
  password?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  type: 'in-person' | 'video' | 'audio';
  status: 'upcoming' | 'completed' | 'cancelled' | 'in-progress';
  reason: string;
  clinicalNotes?: string;
  googleMeetLink?: string;
  googleMeetSpaceName?: string;
}

export interface EHRRecord {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  visitDate: string;
  diagnosis: string;
  treatmentPlan: string;
  vitals: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    sp02: string;
    weight: string;
    height: string;
  };
  allergies: string;
  notes: string;
}

export interface LabResult {
  parameter: string;
  value: string;
  unit: string;
  reference: string;
  flag: 'Normal' | 'High' | 'Low' | 'Critical';
}

export interface LabReport {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  testName: string;
  testCategory: string;
  date: string;
  status: 'Pending' | 'Completed' | 'Flagged';
  results: LabResult[];
  flagged: boolean;
  interpretation?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  refillsLeft: number;
  pharmacyStatus: 'Sent' | 'Ready' | 'Dispensed';
  digitalSignature: string;
  createdAt: string;
}

export interface BillingItem {
  id: string;
  patientId: string;
  patientName: string;
  description: string;
  amount: number;
  insuranceCovered: number;
  copay: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  claimStatus: 'Filed' | 'In-Review' | 'Approved' | 'Denied';
  dueDate: string;
}

export interface HospitalBed {
  id: string;
  ward: 'General' | 'ICU' | 'Emergency' | 'Surgical';
  bedNumber: string;
  status: 'Available' | 'Occupied' | 'Cleaning' | 'Maintenance';
  patientName?: string;
  assignedDoctor?: string;
  admissionDate?: string;
}

export interface InventoryItem {
  id: string;
  itemName: string;
  category: 'Medication' | 'Surgical' | 'PPE' | 'Equipment';
  quantity: number;
  minThreshold: number;
  unit: string;
  location: string;
  expirationDate: string;
  status: 'In Stock' | 'Low Stock' | 'Critical';
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'doctor' | 'nurse' | 'admin' | 'technician';
  department: string;
  shift: 'Morning' | 'Afternoon' | 'Night';
  status: 'On Duty' | 'On Call' | 'Off Duty';
  phone: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  status: 'SUCCESS' | 'FAILED' | 'ALERT';
  ipAddress: string;
  timestamp: string;
}

export interface EmergencySOS {
  id: string;
  patientId: string;
  patientName: string;
  address: string;
  status: 'Dispatched' | 'En-Route' | 'Arrived' | 'Resolved';
  etaMinutes: number;
  assignedUnit: string;
  createdAt: string;
}
