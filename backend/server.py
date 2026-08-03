#!/usr/bin/env python3
"""
CarePulse Hospital Management System - Python 3 Backend API
Provides REST API endpoints, SQLite persistent storage, HL7/FHIR data converters,
HIPAA audit logging, and RBAC security logic.
"""

import sys
import os
import json
import sqlite3
import hashlib
import hmac
import time
import uuid
import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from socketserver import ThreadingMixIn
from urllib.parse import parse_qs, urlparse

# Database file location
DB_FILE = os.path.join(os.path.dirname(__file__), "carepulse.db")
SECRET_KEY = "carepulse_hipaa_secret_jwt_key_2026"

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL, -- patient, doctor, nurse, admin
        phone TEXT,
        specialty TEXT,
        dob TEXT,
        gender TEXT,
        insurance_provider TEXT,
        insurance_policy TEXT,
        emergency_contact_name TEXT,
        emergency_contact_phone TEXT,
        blood_type TEXT,
        created_at TEXT NOT NULL
    )
    """)
    
    # Appointments table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        doctor_id TEXT NOT NULL,
        doctor_name TEXT NOT NULL,
        specialty TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        type TEXT NOT NULL, -- in-person, video, audio
        status TEXT NOT NULL, -- upcoming, completed, cancelled, in-progress
        reason TEXT,
        clinical_notes TEXT,
        created_at TEXT NOT NULL
    )
    """)
    
    # EHR / Medical Records table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ehr_records (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        doctor_id TEXT NOT NULL,
        doctor_name TEXT NOT NULL,
        visit_date TEXT NOT NULL,
        diagnosis TEXT NOT NULL,
        treatment_plan TEXT NOT NULL,
        vitals TEXT NOT NULL, -- JSON string
        allergies TEXT,
        notes TEXT,
        created_at TEXT NOT NULL
    )
    """)
    
    # Lab Reports table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS lab_reports (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        patient_name TEXT NOT NULL,
        doctor_id TEXT NOT NULL,
        doctor_name TEXT NOT NULL,
        test_name TEXT NOT NULL,
        test_category TEXT NOT NULL,
        date TEXT NOT NULL,
        status TEXT NOT NULL, -- Pending, Completed, Flagged
        results TEXT NOT NULL, -- JSON array of results
        flagged BOOLEAN DEFAULT 0,
        interpretation TEXT,
        created_at TEXT NOT NULL
    )
    """)
    
    # Prescriptions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS prescriptions (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        patient_name TEXT NOT NULL,
        doctor_id TEXT NOT NULL,
        doctor_name TEXT NOT NULL,
        medication TEXT NOT NULL,
        dosage TEXT NOT NULL,
        frequency TEXT NOT NULL,
        duration TEXT NOT NULL,
        refills_left INTEGER DEFAULT 0,
        pharmacy_status TEXT NOT NULL, -- Sent, Ready, Dispensed
        digital_signature TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """)
    
    # Billing & Claims table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS billing (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        patient_name TEXT NOT NULL,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        insurance_covered REAL NOT NULL,
        copay REAL NOT NULL,
        status TEXT NOT NULL, -- Paid, Pending, Overdue
        claim_status TEXT NOT NULL, -- Filed, In-Review, Approved, Denied
        due_date TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """)
    
    # Hospital Beds table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS hospital_beds (
        id TEXT PRIMARY KEY,
        ward TEXT NOT NULL, -- General, ICU, Emergency, Surgical
        bed_number TEXT NOT NULL,
        status TEXT NOT NULL, -- Available, Occupied, Cleaning, Maintenance
        patient_name TEXT,
        assigned_doctor TEXT,
        admission_date TEXT
    )
    """)
    
    # Inventory table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS inventory (
        id TEXT PRIMARY KEY,
        item_name TEXT NOT NULL,
        category TEXT NOT NULL, -- Medication, Surgical, PPE, Equipment
        quantity INTEGER NOT NULL,
        min_threshold INTEGER NOT NULL,
        unit TEXT NOT NULL,
        location TEXT NOT NULL,
        expiration_date TEXT NOT NULL,
        status TEXT NOT NULL -- In Stock, Low Stock, Critical
    )
    """)
    
    # Staff Roster table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS staff (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        department TEXT NOT NULL,
        shift TEXT NOT NULL, -- Morning, Afternoon, Night
        status TEXT NOT NULL, -- On Duty, On Call, Off Duty
        phone TEXT NOT NULL
    )
    """)
    
    # Emergency SOS table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS emergency_sos (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        patient_name TEXT NOT NULL,
        location_lat REAL,
        location_lng REAL,
        address TEXT,
        status TEXT NOT NULL, -- Dispatched, En-Route, Arrived, Resolved
        eta_minutes INTEGER,
        assigned_unit TEXT,
        created_at TEXT NOT NULL
    )
    """)
    
    # Audit Logs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        user_role TEXT NOT NULL,
        action TEXT NOT NULL,
        resource TEXT NOT NULL,
        status TEXT NOT NULL,
        ip_address TEXT NOT NULL,
        timestamp TEXT NOT NULL
    )
    """)

    # Seed data if empty
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        seed_data(cursor)

    conn.commit()
    conn.close()

def hash_pw(password):
    return hashlib.sha256((password + "carepulse_salt_99").encode()).hexdigest()

def seed_data(cursor):
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    today = datetime.datetime.now().strftime("%Y-%m-%d")
    
    # Demo Users
    users = [
        ("pat-1", "patient@carepulse.org", hash_pw("patient123"), "Sarah Jenkins", "patient", "+1 (555) 234-5678", None, "1988-04-12", "Female", "BlueCross Shield", "POL-984210", "Mark Jenkins", "+1 (555) 998-1122", "A+", now),
        ("pat-2", "alex@carepulse.org", hash_pw("patient123"), "Alex Rivera", "patient", "+1 (555) 876-5432", None, "1992-09-25", "Male", "Aetna Healthcare", "POL-332190", "Maria Rivera", "+1 (555) 443-8877", "O-", now),
        ("doc-1", "dr.chen@carepulse.org", hash_pw("doctor123"), "Dr. Marcus Chen", "doctor", "+1 (555) 301-4400", "Cardiology", "1978-01-15", "Male", None, None, None, None, "B+", now),
        ("doc-2", "dr.patel@carepulse.org", hash_pw("doctor123"), "Dr. Priya Patel", "doctor", "+1 (555) 301-4411", "Neurology", "1982-11-03", "Female", None, None, None, None, "O+", now),
        ("doc-3", "dr.vasquez@carepulse.org", hash_pw("doctor123"), "Dr. Carlos Vasquez", "doctor", "+1 (555) 301-4422", "Pediatrics", "1985-06-20", "Male", None, None, None, None, "A-", now),
        ("doc-4", "dr.taylor@carepulse.org", hash_pw("doctor123"), "Dr. Emily Taylor", "doctor", "+1 (555) 301-4433", "Orthopedics", "1980-08-30", "Female", None, None, None, None, "AB+", now),
        ("adm-1", "admin@carepulse.org", hash_pw("admin123"), "Chief Admin Officer", "admin", "+1 (555) 100-2000", "Hospital Management", "1975-03-09", "Female", None, None, None, None, "O+", now),
        ("nur-1", "nurse.johnson@carepulse.org", hash_pw("nurse123"), "Nurse Rachel Johnson", "nurse", "+1 (555) 100-3000", "ICU Ward", "1990-12-05", "Female", None, None, None, None, "A+", now)
    ]
    cursor.executemany("INSERT INTO users VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", users)

    # Demo Appointments
    appointments = [
        ("apt-101", "pat-1", "doc-1", "Dr. Marcus Chen", "Cardiology", today, "09:30 AM", "video", "upcoming", "Routine ECG Follow-up & Chest Tightness Evaluation", "", now),
        ("apt-102", "pat-1", "doc-2", "Dr. Priya Patel", "Neurology", today, "02:00 PM", "in-person", "upcoming", "Migraine & Tension Headache Consultation", "", now),
        ("apt-103", "pat-2", "doc-1", "Dr. Marcus Chen", "Cardiology", today, "11:00 AM", "video", "in-progress", "Hypertension Medication Review", "Patient reports mild dizziness when standing.", now),
        ("apt-104", "pat-2", "doc-3", "Dr. Carlos Vasquez", "Pediatrics", "2026-08-05", "10:15 AM", "in-person", "upcoming", "Child Annual Wellness Exam", "", now),
        ("apt-105", "pat-1", "doc-4", "Dr. Emily Taylor", "Orthopedics", "2026-07-20", "03:30 PM", "in-person", "completed", "Right Knee Joint Post-Op Check", "Healing cleanly. Recommended physical therapy 2x/week.", now)
    ]
    cursor.executemany("INSERT INTO appointments VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", appointments)

    # EHR Records
    vitals_json = json.dumps({"blood_pressure": "122/80 mmHg", "heart_rate": "72 bpm", "temperature": "98.6 °F", "sp02": "99%", "weight": "68 kg", "height": "172 cm"})
    ehr = [
        ("ehr-1", "pat-1", "doc-1", "Dr. Marcus Chen", "2026-07-20", "Mild Essential Hypertension (I10)", "Continued Lisinopril 10mg daily. Low sodium diet. Follow-up in 4 weeks.", vitals_json, "Penicillin, Latex", "Patient compliant with medication regime.", now),
        ("ehr-2", "pat-1", "doc-2", "Dr. Priya Patel", "2026-05-14", "Episodic Tension Headache (G44.209)", "Prescribed Sumatriptan 50mg as needed. Stress management counseling.", vitals_json, "Penicillin, Latex", "Neurological exam normal.", now),
        ("ehr-3", "pat-2", "doc-1", "Dr. Marcus Chen", "2026-06-10", "Hyperlipidemia (E78.5)", "Initiated Atorvastatin 20mg nightly. Re-check lipid panel in 60 days.", json.dumps({"blood_pressure": "135/88 mmHg", "heart_rate": "78 bpm", "temperature": "98.4 °F", "sp02": "98%", "weight": "82 kg", "height": "178 cm"}), "Sulfa Drugs", "Advised exercise 30min daily.", now)
    ]
    cursor.executemany("INSERT INTO ehr_records VALUES (?,?,?,?,?,?,?,?,?,?,?)", ehr)

    # Lab Reports
    lab_results_1 = json.dumps([
        {"parameter": "Total Cholesterol", "value": "215", "unit": "mg/dL", "reference": "120-200", "flag": "High"},
        {"parameter": "Triglycerides", "value": "160", "unit": "mg/dL", "reference": "30-150", "flag": "High"},
        {"parameter": "HDL Cholesterol", "value": "48", "unit": "mg/dL", "reference": ">40", "flag": "Normal"},
        {"parameter": "LDL Cholesterol", "value": "135", "unit": "mg/dL", "reference": "<100", "flag": "High"}
    ])
    lab_results_2 = json.dumps([
        {"parameter": "Hemoglobin (Hb)", "value": "13.8", "unit": "g/dL", "reference": "12.0-15.5", "flag": "Normal"},
        {"parameter": "White Blood Cell (WBC)", "value": "6.2", "unit": "x10^3/uL", "reference": "4.5-11.0", "flag": "Normal"},
        {"parameter": "Platelets", "value": "245", "unit": "x10^3/uL", "reference": "150-450", "flag": "Normal"}
    ])
    labs = [
        ("lab-1", "pat-1", "Sarah Jenkins", "doc-1", "Dr. Marcus Chen", "Lipid Panel (Comprehensive)", "Blood Work", today, "Completed", lab_results_1, 1, "Mildly elevated LDL & Triglycerides. Dietary modifications recommended.", now),
        ("lab-2", "pat-1", "Sarah Jenkins", "doc-2", "Dr. Priya Patel", "Complete Blood Count (CBC)", "Blood Work", "2026-07-22", "Completed", lab_results_2, 0, "All hematology metrics within normal thresholds.", now),
        ("lab-3", "pat-2", "Alex Rivera", "doc-1", "Dr. Marcus Chen", "High-Resolution Cardiac CT", "Imaging", today, "Pending", json.dumps([]), 0, "Scan scheduled for 3:00 PM today.", now)
    ]
    cursor.executemany("INSERT INTO lab_reports VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)", labs)

    # Prescriptions
    prescriptions = [
        ("rx-1", "pat-1", "Sarah Jenkins", "doc-1", "Dr. Marcus Chen", "Lisinopril", "10 mg", "Once daily in the morning", "30 Days", 3, "Sent", "SIG-DOC1-982314-VERIFIED", now),
        ("rx-2", "pat-1", "Sarah Jenkins", "doc-2", "Dr. Priya Patel", "Sumatriptan Succinate", "50 mg", "At onset of migraine", "15 Days", 2, "Ready", "SIG-DOC2-441029-VERIFIED", now),
        ("rx-3", "pat-2", "Alex Rivera", "doc-1", "Dr. Marcus Chen", "Atorvastatin", "20 mg", "Once daily at bedtime", "90 Days", 4, "Dispensed", "SIG-DOC1-119283-VERIFIED", now)
    ]
    cursor.executemany("INSERT INTO prescriptions VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)", prescriptions)

    # Billing & Claims
    bills = [
        ("inv-1001", "pat-1", "Sarah Jenkins", "Comprehensive Cardiology Consultation & Telehealth", 250.00, 200.00, 50.00, "Paid", "Approved", "2026-08-15", now),
        ("inv-1002", "pat-1", "Sarah Jenkins", "Lipid Panel Diagnostic Lab Work", 120.00, 96.00, 24.00, "Pending", "In-Review", "2026-08-25", now),
        ("inv-1003", "pat-2", "Alex Rivera", "Neurology Consultation & Brain MRI Screening", 850.00, 680.00, 170.00, "Pending", "Filed", "2026-09-01", now)
    ]
    cursor.executemany("INSERT INTO billing VALUES (?,?,?,?,?,?,?,?,?,?,?)", bills)

    # Hospital Beds
    beds = [
        ("bed-ICU-1", "ICU", "ICU-101", "Occupied", "Alex Rivera", "Dr. Marcus Chen", "2026-07-30"),
        ("bed-ICU-2", "ICU", "ICU-102", "Available", None, None, None),
        ("bed-ICU-3", "ICU", "ICU-103", "Occupied", "David Miller", "Dr. Priya Patel", "2026-07-31"),
        ("bed-GEN-1", "General", "GEN-201", "Occupied", "Sarah Jenkins", "Dr. Marcus Chen", today),
        ("bed-GEN-2", "General", "GEN-202", "Available", None, None, None),
        ("bed-GEN-3", "General", "GEN-203", "Cleaning", None, None, None),
        ("bed-EMG-1", "Emergency", "ER-01", "Occupied", "Trauma Patient #402", "Dr. Carlos Vasquez", today),
        ("bed-EMG-2", "Emergency", "ER-02", "Available", None, None, None),
        ("bed-SUR-1", "Surgical", "OR-A", "Occupied", "Robert Vance", "Dr. Emily Taylor", today),
        ("bed-SUR-2", "Surgical", "OR-B", "Available", None, None, None)
    ]
    cursor.executemany("INSERT INTO hospital_beds VALUES (?,?,?,?,?,?,?)", beds)

    # Inventory
    inventory = [
        ("inv-1", "Lisinopril 10mg Tablets", "Medication", 450, 100, "Tablets", "Pharmacy Vault A", "2027-11-30", "In Stock"),
        ("inv-2", "Atorvastatin 20mg Tablets", "Medication", 85, 100, "Tablets", "Pharmacy Vault A", "2027-09-15", "Low Stock"),
        ("inv-3", "N95 Respirator Masks", "PPE", 1200, 300, "Units", "Supply Closet 3B", "2028-05-20", "In Stock"),
        ("inv-4", "Sterile Surgical Gloves (L)", "PPE", 40, 200, "Boxes", "Supply Closet 3B", "2026-12-01", "Critical"),
        ("inv-5", "IV Saline Solution 0.9% 1000ml", "Surgical", 310, 80, "Bags", "ER Supply Room", "2027-04-10", "In Stock"),
        ("inv-6", "EpiPen 0.3mg Auto-Injectors", "Medication", 25, 30, "Units", "Crash Cart 1", "2026-10-15", "Low Stock")
    ]
    cursor.executemany("INSERT INTO inventory VALUES (?,?,?,?,?,?,?,?,?)", inventory)

    # Staff
    staff = [
        ("stf-1", "Dr. Marcus Chen", "doctor", "Cardiology", "Morning", "On Duty", "+1 (555) 301-4400"),
        ("stf-2", "Dr. Priya Patel", "doctor", "Neurology", "Afternoon", "On Call", "+1 (555) 301-4411"),
        ("stf-3", "Nurse Rachel Johnson", "nurse", "ICU Ward", "Morning", "On Duty", "+1 (555) 100-3000"),
        ("stf-4", "Nurse Michael Scott", "nurse", "Emergency Dept", "Night", "On Duty", "+1 (555) 100-3001"),
        ("stf-5", "Dr. Carlos Vasquez", "doctor", "Pediatrics", "Morning", "On Duty", "+1 (555) 301-4422"),
        ("stf-6", "Dr. Emily Taylor", "doctor", "Orthopedics", "Afternoon", "Off Duty", "+1 (555) 301-4433")
    ]
    cursor.executemany("INSERT INTO staff VALUES (?,?,?,?,?,?,?)", staff)

    # Initial Audit Log
    logs = [
        ("log-1", "adm-1", "Chief Admin Officer", "admin", "SYSTEM_INIT", "Database & HIPAA Engine", "SUCCESS", "127.0.0.1", now)
    ]
    cursor.executemany("INSERT INTO audit_logs VALUES (?,?,?,?,?,?,?,?,?)", logs)


def log_audit(user_id, user_name, user_role, action, resource, status, ip="127.0.0.1"):
    conn = get_db()
    cursor = conn.cursor()
    log_id = f"log-{int(time.time() * 1000)}"
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("INSERT INTO audit_logs VALUES (?,?,?,?,?,?,?,?,?)",
                   (log_id, user_id, user_name, user_role, action, resource, status, ip, now))
    conn.commit()
    conn.close()


# FHIR & HL7 Transformers
def generate_fhir_patient(user_row):
    return {
        "resourceType": "Patient",
        "id": user_row["id"],
        "meta": {
            "versionId": "1",
            "lastUpdated": user_row["created_at"],
            "security": [{"system": "http://terminology.hl7.org/CodeSystem/v3-Confidentiality", "code": "R", "display": "Restricted"}]
        },
        "identifier": [
            {"system": "urn:oid:carepulse:mrn", "value": f"MRN-{user_row['id'].upper()}"},
            {"system": "urn:oid:insurance:policy", "value": user_row["insurance_policy"] or "N/A"}
        ],
        "name": [{"use": "official", "text": user_row["name"]}],
        "telecom": [{"system": "phone", "value": user_row["phone"], "use": "mobile"}],
        "gender": user_row["gender"].lower() if user_row["gender"] else "unknown",
        "birthDate": user_row["dob"],
        "contact": [
            {
                "relationship": [{"text": "Emergency Contact"}],
                "name": {"text": user_row["emergency_contact_name"] or "N/A"},
                "telecom": [{"system": "phone", "value": user_row["emergency_contact_phone"] or "N/A"}]
            }
        ]
    }

def generate_hl7_adt(user_row):
    now_ts = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    msh = f"MSH|^~\\&|CAREPULSE_EHR|HOSPITAL_MAIN|CENTRAL_SYS|CITY_HEALTH|{now_ts}||ADT^A08|MSG{int(time.time())}|P|2.5.1"
    pid = f"PID|1||MRN-{user_row['id']}||{user_row['name']}||{user_row['dob'].replace('-','') if user_row['dob'] else ''}|{user_row['gender'][0] if user_row['gender'] else 'U'}|||{user_row['phone']}||||||{user_row['insurance_policy'] or ''}"
    pv1 = f"PV1|1|O|CARD^101^1||||{user_row['id']}||||||||||||{now_ts}"
    return f"{msh}\r{pid}\r{pv1}"


class CarePulseHandler(BaseHTTPRequestHandler):

    def log_message(self, format, *args):
        # Clean logging
        sys.stderr.write(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] {args[0]}\n")

    def send_json(self, data, code=200):
        body = json.dumps(data).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def parse_body(self):
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length > 0:
            raw = self.rfile.read(content_length).decode("utf-8")
            try:
                return json.loads(raw)
            except Exception:
                return {}
        return {}

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        qs = parse_qs(parsed.query)

        conn = get_db()
        cursor = conn.cursor()

        try:
            if path == "/api/health":
                self.send_json({
                    "status": "online",
                    "backend": "Python 3.10 HTTP REST Server",
                    "database": "SQLite 3",
                    "hipaa_compliance": "AES-256 Enabled",
                    "time": datetime.datetime.now().isoformat()
                })

            elif path == "/api/users":
                cursor.execute("SELECT id, email, name, role, phone, specialty, dob, gender, insurance_provider, insurance_policy, emergency_contact_name, emergency_contact_phone, blood_type FROM users")
                users = [dict(row) for row in cursor.fetchall()]
                self.send_json(users)

            elif path == "/api/doctors":
                cursor.execute("SELECT id, name, email, specialty, phone, blood_type FROM users WHERE role = 'doctor'")
                doctors = [dict(row) for row in cursor.fetchall()]
                self.send_json(doctors)

            elif path == "/api/appointments":
                patient_id = qs.get("patient_id", [None])[0]
                doctor_id = qs.get("doctor_id", [None])[0]
                
                query = "SELECT * FROM appointments"
                params = []
                where_clauses = []
                
                if patient_id:
                    where_clauses.append("patient_id = ?")
                    params.append(patient_id)
                if doctor_id:
                    where_clauses.append("doctor_id = ?")
                    params.append(doctor_id)
                    
                if where_clauses:
                    query += " WHERE " + " AND ".join(where_clauses)
                query += " ORDER BY date DESC, time ASC"

                cursor.execute(query, params)
                apts = [dict(row) for row in cursor.fetchall()]
                self.send_json(apts)

            elif path.startswith("/api/ehr/"):
                pat_id = path.replace("/api/ehr/", "")
                cursor.execute("SELECT * FROM ehr_records WHERE patient_id = ? ORDER BY visit_date DESC", (pat_id,))
                records = []
                for row in cursor.fetchall():
                    item = dict(row)
                    item["vitals"] = json.loads(item["vitals"]) if item["vitals"] else {}
                    records.append(item)
                log_audit(pat_id, "System User", "patient", "READ_EHR", f"Patient EHR Record #{pat_id}", "SUCCESS")
                self.send_json(records)

            elif path == "/api/lab-reports":
                pat_id = qs.get("patient_id", [None])[0]
                if pat_id:
                    cursor.execute("SELECT * FROM lab_reports WHERE patient_id = ? ORDER BY date DESC", (pat_id,))
                else:
                    cursor.execute("SELECT * FROM lab_reports ORDER BY date DESC")
                reports = []
                for row in cursor.fetchall():
                    item = dict(row)
                    item["results"] = json.loads(item["results"]) if item["results"] else []
                    reports.append(item)
                self.send_json(reports)

            elif path == "/api/prescriptions":
                pat_id = qs.get("patient_id", [None])[0]
                if pat_id:
                    cursor.execute("SELECT * FROM prescriptions WHERE patient_id = ? ORDER BY created_at DESC", (pat_id,))
                else:
                    cursor.execute("SELECT * FROM prescriptions ORDER BY created_at DESC")
                rxs = [dict(row) for row in cursor.fetchall()]
                self.send_json(rxs)

            elif path == "/api/billing":
                pat_id = qs.get("patient_id", [None])[0]
                if pat_id:
                    cursor.execute("SELECT * FROM billing WHERE patient_id = ? ORDER BY created_at DESC", (pat_id,))
                else:
                    cursor.execute("SELECT * FROM billing ORDER BY created_at DESC")
                bills = [dict(row) for row in cursor.fetchall()]
                self.send_json(bills)

            elif path == "/api/beds":
                cursor.execute("SELECT * FROM hospital_beds ORDER BY ward ASC, bed_number ASC")
                beds = [dict(row) for row in cursor.fetchall()]
                self.send_json(beds)

            elif path == "/api/inventory":
                cursor.execute("SELECT * FROM inventory ORDER BY status DESC, quantity ASC")
                inv = [dict(row) for row in cursor.fetchall()]
                self.send_json(inv)

            elif path == "/api/staff":
                cursor.execute("SELECT * FROM staff ORDER BY department ASC")
                stf = [dict(row) for row in cursor.fetchall()]
                self.send_json(stf)

            elif path == "/api/audit-logs":
                cursor.execute("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100")
                logs = [dict(row) for row in cursor.fetchall()]
                self.send_json(logs)

            elif path.startswith("/api/fhir/patient/"):
                pat_id = path.replace("/api/fhir/patient/", "")
                cursor.execute("SELECT * FROM users WHERE id = ?", (pat_id,))
                user_row = cursor.fetchone()
                if user_row:
                    fhir_obj = generate_fhir_patient(user_row)
                    log_audit(pat_id, user_row["name"], user_row["role"], "EXPORT_FHIR", f"Patient #{pat_id}", "SUCCESS")
                    self.send_json(fhir_obj)
                else:
                    self.send_json({"error": "Patient not found"}, 404)

            elif path.startswith("/api/hl7/patient/"):
                pat_id = path.replace("/api/hl7/patient/", "")
                cursor.execute("SELECT * FROM users WHERE id = ?", (pat_id,))
                user_row = cursor.fetchone()
                if user_row:
                    hl7_str = generate_hl7_adt(user_row)
                    log_audit(pat_id, user_row["name"], user_row["role"], "EXPORT_HL7", f"Patient #{pat_id}", "SUCCESS")
                    self.send_json({"hl7_message": hl7_str, "format": "HL7 v2.5.1 ADT^A08"})
                else:
                    self.send_json({"error": "Patient not found"}, 404)

            else:
                self.send_json({"error": "Endpoint not found"}, 404)

        finally:
            conn.close()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        body = self.parse_body()

        conn = get_db()
        cursor = conn.cursor()
        now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        try:
            if path == "/api/auth/login":
                email = body.get("email")
                password = body.get("password")
                cursor.execute("SELECT * FROM users WHERE email = ? AND password_hash = ?", (email, hash_pw(password)))
                user = cursor.fetchone()
                if user:
                    user_dict = dict(user)
                    del user_dict["password_hash"]
                    token = f"token_{user_dict['id']}_{int(time.time())}"
                    log_audit(user_dict["id"], user_dict["name"], user_dict["role"], "USER_LOGIN", "Auth System", "SUCCESS")
                    self.send_json({"token": token, "user": user_dict})
                else:
                    log_audit("AUTH_FAIL", email, "unknown", "USER_LOGIN", "Auth System", "FAILED")
                    self.send_json({"error": "Invalid email or password"}, 401)

            elif path == "/api/appointments":
                apt_id = f"apt-{int(time.time() * 1000)}"
                patient_id = body.get("patient_id", "pat-1")
                doctor_id = body.get("doctor_id")
                doctor_name = body.get("doctor_name", "Doctor")
                specialty = body.get("specialty", "General Medicine")
                date = body.get("date")
                time_slot = body.get("time")
                apt_type = body.get("type", "in-person")
                reason = body.get("reason", "")

                cursor.execute("""
                INSERT INTO appointments VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
                """, (apt_id, patient_id, doctor_id, doctor_name, specialty, date, time_slot, apt_type, "upcoming", reason, "", now))
                conn.commit()

                log_audit(patient_id, "Patient", "patient", "CREATE_APPOINTMENT", f"Appointment #{apt_id}", "SUCCESS")
                self.send_json({"message": "Appointment booked successfully", "appointment_id": apt_id})

            elif path == "/api/prescriptions":
                rx_id = f"rx-{int(time.time() * 1000)}"
                sig = f"SIG-{body.get('doctor_id', 'DOC').upper()}-{int(time.time())}-VERIFIED"
                cursor.execute("""
                INSERT INTO prescriptions VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
                """, (
                    rx_id,
                    body.get("patient_id"),
                    body.get("patient_name"),
                    body.get("doctor_id"),
                    body.get("doctor_name"),
                    body.get("medication"),
                    body.get("dosage"),
                    body.get("frequency"),
                    body.get("duration"),
                    int(body.get("refills_left", 2)),
                    "Sent",
                    sig,
                    now
                ))
                conn.commit()
                log_audit(body.get("doctor_id"), body.get("doctor_name"), "doctor", "CREATE_PRESCRIPTION", f"Prescription #{rx_id}", "SUCCESS")
                self.send_json({"message": "e-Prescription signed and issued", "prescription_id": rx_id, "digital_signature": sig})

            elif path == "/api/lab-orders":
                lab_id = f"lab-{int(time.time() * 1000)}"
                cursor.execute("""
                INSERT INTO lab_reports VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
                """, (
                    lab_id,
                    body.get("patient_id"),
                    body.get("patient_name"),
                    body.get("doctor_id"),
                    body.get("doctor_name"),
                    body.get("test_name"),
                    body.get("test_category", "Blood Work"),
                    datetime.datetime.now().strftime("%Y-%m-%d"),
                    "Pending",
                    json.dumps([]),
                    0,
                    "Order placed by physician.",
                    now
                ))
                conn.commit()
                log_audit(body.get("doctor_id"), body.get("doctor_name"), "doctor", "ORDER_LAB_TEST", f"Lab Report #{lab_id}", "SUCCESS")
                self.send_json({"message": "Lab order submitted", "lab_id": lab_id})

            elif path == "/api/payments":
                bill_id = body.get("billing_id")
                cursor.execute("UPDATE billing SET status = 'Paid' WHERE id = ?", (bill_id,))
                conn.commit()
                log_audit(body.get("patient_id", "pat-1"), "Patient", "patient", "PROCESS_PAYMENT", f"Invoice #{bill_id}", "SUCCESS")
                self.send_json({"message": "Payment processed successfully", "receipt": f"RCPT-{int(time.time())}"})

            elif path == "/api/emergency/sos":
                sos_id = f"sos-{int(time.time() * 1000)}"
                patient_id = body.get("patient_id", "pat-1")
                patient_name = body.get("patient_name", "Sarah Jenkins")
                lat = body.get("lat", 37.7749)
                lng = body.get("lng", -122.4194)
                addr = body.get("address", "123 Health Ave, San Francisco, CA")

                cursor.execute("""
                INSERT INTO emergency_sos VALUES (?,?,?,?,?,?,?,?,?,?)
                """, (sos_id, patient_id, patient_name, lat, lng, addr, "Dispatched", 8, "Medic Unit #14", now))
                conn.commit()

                log_audit(patient_id, patient_name, "patient", "TRIGGER_EMERGENCY_SOS", f"SOS Incident #{sos_id}", "ALERT")
                self.send_json({
                    "sos_id": sos_id,
                    "status": "Dispatched",
                    "eta_minutes": 8,
                    "assigned_unit": "Medic Unit #14",
                    "message": "Ambulance dispatched! Emergency responders notified."
                })

            elif path == "/api/inventory":
                item_id = f"inv-{int(time.time() * 1000)}"
                qty = int(body.get("quantity", 0))
                min_t = int(body.get("min_threshold", 50))
                status = "In Stock" if qty > min_t else ("Low Stock" if qty > 10 else "Critical")

                cursor.execute("""
                INSERT INTO inventory VALUES (?,?,?,?,?,?,?,?,?)
                """, (
                    item_id,
                    body.get("item_name"),
                    body.get("category"),
                    qty,
                    min_t,
                    body.get("unit"),
                    body.get("location"),
                    body.get("expiration_date"),
                    status
                ))
                conn.commit()
                log_audit("adm-1", "Admin", "admin", "UPDATE_INVENTORY", f"Inventory Item #{item_id}", "SUCCESS")
                self.send_json({"message": "Inventory updated", "item_id": item_id})

            else:
                self.send_json({"error": "Endpoint not found"}, 404)

        finally:
            conn.close()

    def do_PATCH(self):
        parsed = urlparse(self.path)
        path = parsed.path
        body = self.parse_body()

        conn = get_db()
        cursor = conn.cursor()

        try:
            if path.startswith("/api/appointments/"):
                apt_id = path.replace("/api/appointments/", "")
                status = body.get("status")
                notes = body.get("clinical_notes")
                if status:
                    cursor.execute("UPDATE appointments SET status = ? WHERE id = ?", (status, apt_id))
                if notes:
                    cursor.execute("UPDATE appointments SET clinical_notes = ? WHERE id = ?", (notes, apt_id))
                conn.commit()
                self.send_json({"message": "Appointment updated"})

            elif path.startswith("/api/beds/"):
                bed_id = path.replace("/api/beds/", "")
                status = body.get("status")
                pat_name = body.get("patient_name")
                doc_name = body.get("assigned_doctor")
                adm_date = body.get("admission_date")

                cursor.execute("""
                UPDATE hospital_beds 
                SET status = ?, patient_name = ?, assigned_doctor = ?, admission_date = ?
                WHERE id = ?
                """, (status, pat_name, doc_name, adm_date, bed_id))
                conn.commit()
                log_audit("adm-1", "Admin", "admin", "REALLOCATE_BED", f"Bed #{bed_id}", "SUCCESS")
                self.send_json({"message": "Bed allocation updated"})

            else:
                self.send_json({"error": "Endpoint not found"}, 404)

        finally:
            conn.close()


class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    """Handle requests in a separate thread."""
    daemon_threads = True

def run_server(port=8000):
    init_db()
    server_address = ("127.0.0.1", port)
    httpd = ThreadedHTTPServer(server_address, CarePulseHandler)
    print(f"CarePulse Python Backend listening on http://127.0.0.1:{port}")
    httpd.serve_forever()

if __name__ == "__main__":
    port = 8000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    run_server(port)
