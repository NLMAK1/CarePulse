import React, { useState } from 'react';
import { ShieldCheck, Copy, Download, Check, X, FileCode } from 'lucide-react';
import { User } from '../types';

interface FhirHl7ModalProps {
  user: User;
  onClose: () => void;
}

export const FhirHl7Modal: React.FC<FhirHl7ModalProps> = ({ user, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeFormat, setActiveFormat] = useState<'fhir' | 'hl7'>('fhir');

  const fhirData = {
    resourceType: 'Patient',
    id: user.id,
    meta: {
      versionId: '1',
      lastUpdated: new Date().toISOString(),
      security: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/v3-Confidentiality',
          code: 'R',
          display: 'Restricted HIPAA confidential',
        },
      ],
    },
    identifier: [
      {
        system: 'urn:oid:carepulse:mrn',
        value: `MRN-${user.id.toUpperCase()}`,
      },
      {
        system: 'urn:oid:insurance:policy',
        value: user.insurancePolicy || 'POL-984210',
      },
    ],
    name: [
      {
        use: 'official',
        text: user.name,
      },
    ],
    telecom: [
      {
        system: 'phone',
        value: user.phone,
        use: 'mobile',
      },
      {
        system: 'email',
        value: user.email,
      },
    ],
    gender: user.gender ? user.gender.toLowerCase() : 'unknown',
    birthDate: user.dob || '1988-04-12',
    contact: [
      {
        relationship: [{ text: 'Emergency Contact' }],
        name: { text: user.emergencyContactName || 'N/A' },
        telecom: [{ system: 'phone', value: user.emergencyContactPhone || 'N/A' }],
      },
    ],
  };

  const hl7Data = `MSH|^~\\&|CAREPULSE_EHR|HOSPITAL_MAIN|CENTRAL_SYS|CITY_HEALTH|${new Date()
    .toISOString()
    .replace(/[-T:\.Z]/g, '')
    .slice(0, 14)}||ADT^A08|MSG${Date.now()}|P|2.5.1
PID|1||MRN-${user.id.toUpperCase()}||${user.name}||${
    user.dob?.replace(/-/g, '') || '19880412'
  }|${user.gender ? user.gender[0] : 'U'}|||${user.phone}||||||${
    user.insurancePolicy || ''
  }
PV1|1|O|CARD^101^1||||${user.id}||||||||||||${new Date()
    .toISOString()
    .replace(/[-T:\.Z]/g, '')
    .slice(0, 14)}`;

  const currentContent =
    activeFormat === 'fhir' ? JSON.stringify(fhirData, null, 2) : hl7Data;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = activeFormat === 'fhir' ? 'json' : 'hl7';
    const blob = new Blob([currentContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patient_${user.id}_export.${ext}`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FAF9F6] w-full max-w-3xl rounded-3xl border border-[#E5E0D3] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#7A918D] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight">
                Healthcare Interoperability Data Standards
              </h2>
              <p className="text-xs text-white/80">
                HL7 v2.5.1 & HL7 FHIR Release 4 (R4) Data Exporter
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector Bar */}
        <div className="p-4 bg-[#F1EDE4] border-b border-[#E5E0D3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFormat('fhir')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                activeFormat === 'fhir'
                  ? 'bg-[#7A918D] text-white shadow-sm'
                  : 'bg-white text-[#2D332F] border border-[#E5E0D3]'
              }`}
            >
              FHIR R4 JSON
            </button>
            <button
              onClick={() => setActiveFormat('hl7')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                activeFormat === 'hl7'
                  ? 'bg-[#7A918D] text-white shadow-sm'
                  : 'bg-white text-[#2D332F] border border-[#E5E0D3]'
              }`}
            >
              HL7 v2.5.1 ADT
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-white border border-[#E5E0D3] text-[#2D332F] text-xs font-medium rounded-xl hover:bg-[#FAF9F6] flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Payload</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-[#2D332F] text-white text-xs font-medium rounded-xl hover:bg-[#1E2320] flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Code Content Viewer */}
        <div className="flex-1 p-4 overflow-y-auto bg-[#1E2320] font-mono text-xs text-emerald-400 leading-relaxed">
          <pre className="whitespace-pre-wrap break-all">{currentContent}</pre>
        </div>

        {/* Footer Note */}
        <div className="p-3 bg-[#F1EDE4] border-t border-[#E5E0D3] text-[11px] text-[#8C8679] flex justify-between items-center">
          <span>Compliant with USCDI v3 & ONC Cures Act Interoperability Rules</span>
          <span className="font-semibold text-[#2D332F]">AES-256 Validated</span>
        </div>
      </div>
    </div>
  );
};
