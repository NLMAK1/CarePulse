import React, { useState } from 'react';
import {
  HospitalBed,
  InventoryItem,
  StaffMember,
  AuditLog,
  BillingItem,
} from '../types';
import {
  BedDouble,
  Boxes,
  Users,
  BarChart3,
  ShieldCheck,
  Plus,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Activity,
  DollarSign,
  Search,
} from 'lucide-react';

interface AdminPortalProps {
  beds: HospitalBed[];
  inventory: InventoryItem[];
  staff: StaffMember[];
  auditLogs: AuditLog[];
  billing: BillingItem[];
  activeTab: string;
  onUpdateBedStatus: (
    bedId: string,
    status: HospitalBed['status'],
    patientName?: string
  ) => void;
  onRestockInventory: (itemId: string, qtyToAdd: number) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  beds,
  inventory,
  staff,
  auditLogs,
  billing,
  activeTab,
  onUpdateBedStatus,
  onRestockInventory,
}) => {
  const [wardFilter, setWardFilter] = useState<string>('All');

  const filteredBeds = beds.filter(
    (b) => wardFilter === 'All' || b.ward === wardFilter
  );

  const totalRevenue = billing.reduce((acc, curr) => acc + curr.amount, 0);
  const occupiedBedsCount = beds.filter((b) => b.status === 'Occupied').length;
  const criticalStockCount = inventory.filter(
    (i) => i.status === 'Critical' || i.status === 'Low Stock'
  ).length;

  return (
    <div className="flex-1 p-4 md:p-6 bg-[#FAF9F6] overflow-y-auto space-y-6">
      {/* Overview Analytics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#E5E0D3] p-4 shadow-sm">
          <div className="text-[11px] font-bold text-[#8C8679] uppercase tracking-wider mb-2">
            Bed Occupancy Rate
          </div>
          <div className="text-2xl font-bold text-[#7A918D]">
            {Math.round((occupiedBedsCount / beds.length) * 100)}%
          </div>
          <div className="text-[11px] text-[#8C8679] mt-1">
            {beds.length - occupiedBedsCount} Beds Available
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E0D3] p-4 shadow-sm">
          <div className="text-[11px] font-bold text-[#8C8679] uppercase tracking-wider mb-2">
            Total Revenue Cycle
          </div>
          <div className="text-2xl font-bold text-[#2D332F]">
            ${totalRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            Processed & Claims Filed
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E0D3] p-4 shadow-sm">
          <div className="text-[11px] font-bold text-[#8C8679] uppercase tracking-wider mb-2">
            Supply Alerts
          </div>
          <div className="text-2xl font-bold text-rose-600">
            {criticalStockCount} Items
          </div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">
            Action Required
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E0D3] p-4 shadow-sm">
          <div className="text-[11px] font-bold text-[#8C8679] uppercase tracking-wider mb-2">
            Staff On Duty
          </div>
          <div className="text-2xl font-bold text-[#2D332F]">
            {staff.filter((s) => s.status === 'On Duty').length} / {staff.length}
          </div>
          <div className="text-[11px] text-[#8C8679] mt-1">Active Shift Roster</div>
        </div>
      </div>

      {/* 1. BEDS & RESOURCE MANAGEMENT */}
      {(activeTab === 'beds' || !activeTab) && (
        <div className="bg-white rounded-2xl border border-[#E5E0D3] p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#2D332F]">
                Real-Time Hospital Bed & Capacity Tracker
              </h2>
              <p className="text-xs text-[#8C8679]">
                Monitor ICU, Emergency, General, and Surgical ward bed allocations.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {['All', 'ICU', 'General', 'Emergency', 'Surgical'].map((w) => (
                <button
                  key={w}
                  onClick={() => setWardFilter(w)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    wardFilter === w
                      ? 'bg-[#7A918D] text-white shadow-sm'
                      : 'bg-[#F1EDE4] text-[#2D332F] border border-[#E5E0D3]'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredBeds.map((bed) => (
              <div
                key={bed.id}
                className="p-4 bg-[#FAF9F6] border border-[#E5E0D3] rounded-2xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#2D332F]">
                    {bed.bedNumber}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full ${
                      bed.status === 'Available'
                        ? 'bg-emerald-100 text-emerald-800'
                        : bed.status === 'Occupied'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {bed.status}
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <div className="text-[#8C8679]">
                    Ward: <span className="font-bold text-[#2D332F]">{bed.ward}</span>
                  </div>
                  {bed.patientName && (
                    <div className="text-[#2D332F] font-semibold">
                      Patient: {bed.patientName}
                    </div>
                  )}
                  {bed.assignedDoctor && (
                    <div className="text-[#8C8679]">
                      Doctor: {bed.assignedDoctor}
                    </div>
                  )}
                </div>

                <div className="pt-2 flex gap-1">
                  {bed.status === 'Available' ? (
                    <button
                      onClick={() =>
                        onUpdateBedStatus(bed.id, 'Occupied', 'New Admission')
                      }
                      className="w-full py-1.5 bg-[#7A918D] text-white text-xs font-bold rounded-xl hover:bg-[#5D6F6B] transition-all"
                    >
                      Assign Patient
                    </button>
                  ) : bed.status === 'Occupied' ? (
                    <button
                      onClick={() => onUpdateBedStatus(bed.id, 'Cleaning')}
                      className="w-full py-1.5 bg-[#2D332F] text-white text-xs font-bold rounded-xl hover:bg-[#1E2320] transition-all"
                    >
                      Discharge & Sanitise
                    </button>
                  ) : (
                    <button
                      onClick={() => onUpdateBedStatus(bed.id, 'Available')}
                      className="w-full py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-xl hover:bg-emerald-800 transition-all"
                    >
                      Mark Ready
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. INVENTORY & PHARMACY */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-2xl border border-[#E5E0D3] p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-[#2D332F]">
                Pharmacy & Hospital Supply Inventory
              </h2>
              <p className="text-xs text-[#8C8679]">
                Automated stock monitoring for essential pharmaceuticals, PPE, and surgical tools.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F1EDE4] text-[#2D332F] font-bold">
                <tr>
                  <th className="p-3">Item Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Quantity In Stock</th>
                  <th className="p-3">Min Threshold</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E0D3]">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAF9F6]">
                    <td className="p-3 font-bold text-[#2D332F]">
                      {item.itemName}
                    </td>
                    <td className="p-3 text-[#8C8679]">{item.category}</td>
                    <td className="p-3 font-mono font-bold">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="p-3 text-[#8C8679]">{item.minThreshold}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          item.status === 'In Stock'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'Low Stock'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800 animate-pulse'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-[#8C8679]">{item.location}</td>
                    <td className="p-3">
                      <button
                        onClick={() => onRestockInventory(item.id, 100)}
                        className="px-3 py-1.5 bg-[#7A918D] text-white font-bold rounded-lg hover:bg-[#5D6F6B] transition-all"
                      >
                        + Restock 100
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. STAFF ROSTER */}
      {activeTab === 'staff' && (
        <div className="bg-white rounded-2xl border border-[#E5E0D3] p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-[#2D332F]">
                Staff Roster & Shift Schedules
              </h2>
              <p className="text-xs text-[#8C8679]">
                Doctor and nurse availability tracking across departments and shifts.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staff.map((s) => (
              <div
                key={s.id}
                className="p-4 bg-[#FAF9F6] border border-[#E5E0D3] rounded-2xl space-y-2 text-xs"
              >
                <div className="flex justify-between items-center font-bold text-[#2D332F]">
                  <span>{s.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] ${
                      s.status === 'On Duty'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
                <div className="text-[#8C8679]">
                  {s.role.toUpperCase()} • {s.department}
                </div>
                <div className="text-[#5A5448]">Shift: {s.shift}</div>
                <div className="text-[#8C8679]">Phone: {s.phone}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. HIPAA AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-[#E5E0D3] p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-[#2D332F]">
                HIPAA & Regulatory Audit Trail
              </h2>
              <p className="text-xs text-[#8C8679]">
                Cryptographic immutable access log for protected health information (PHI).
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full">
              Full Audit Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead className="bg-[#F1EDE4] text-[#2D332F] font-bold">
                <tr>
                  <th className="p-2.5">Log ID</th>
                  <th className="p-2.5">User</th>
                  <th className="p-2.5">Role</th>
                  <th className="p-2.5">Action</th>
                  <th className="p-2.5">Resource</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E0D3]">
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="p-2.5 font-bold text-[#7A918D]">{log.id}</td>
                    <td className="p-2.5">{log.userName}</td>
                    <td className="p-2.5 uppercase text-[10px]">{log.userRole}</td>
                    <td className="p-2.5 font-bold">{log.action}</td>
                    <td className="p-2.5">{log.resource}</td>
                    <td className="p-2.5 font-bold text-emerald-700">
                      {log.status}
                    </td>
                    <td className="p-2.5 text-[#8C8679]">{log.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
