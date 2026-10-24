import { useEffect, useState } from "react";
import DataTable from "../../components/DataTable.jsx";
import { errorMessage } from "../../api/client.js";
import { getBoard } from "../../api/attendance.js";
import { todayStr } from "../../utils/time.js";
import {
  fmtTime,
  fmtMinutes,
  STATUS_LABEL,
  STATUS_BADGE,
} from "../../utils/format.js";

const SUMMARY = [
  "present",
  "late",
  "half_day",
  "on_leave",
  "absent",
  "not_checked_in",
];

export default function AttendanceBoard() {
  const [date, setDate] = useState(todayStr());
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError("");
    getBoard(date)
      .then((d) => !cancelled && setData(d))
      .catch((err) => !cancelled && setError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [date]);

  const columns = [
    {
      key: "employee",
      label: "Employee",
      render: (r) => (
        <div>
          <div className="font-medium">{r.employee.name}</div>
          <div className="text-xs text-gray-500">{r.employee.employeeCode}</div>
        </div>
      ),
    },
    {
      key: "department",
      label: "Department",
      render: (r) => r.employee.department || "—",
    },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <span
          className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[r.status] || ""}`}
        >
          {STATUS_LABEL[r.status] || r.status}
          {r.leaveType ? ` · ${r.leaveType}` : ""}
        </span>
      ),
    },
    { key: "checkIn", label: "Check-in", render: (r) => fmtTime(r.checkIn) },
    { key: "checkOut", label: "Check-out", render: (r) => fmtTime(r.checkOut) },
    {
      key: "worked",
      label: "Worked",
      render: (r) => (r.checkOut ? fmtMinutes(r.workedMinutes) : "—"),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Attendance board</h1>
        <input
          type="date"
          value={date}
          max={todayStr()}
          onChange={(e) => e.target.value && setDate(e.target.value)}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm"
        />
      </div>

      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {data && (
        <>
          {!data.working && (
            <div className="rounded bg-gray-100 p-3 text-sm text-gray-700">
              Not a working day: {data.reason}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
            {SUMMARY.map((k) => (
              <div key={k} className="rounded border border-gray-200 bg-white p-4">
                <div className="text-xs text-gray-500">{STATUS_LABEL[k]}</div>
                <div className="text-2xl font-semibold">{data.summary[k]}</div>
              </div>
            ))}
          </div>
          <DataTable
            columns={columns}
            rows={data.rows.map((r) => ({ ...r, _id: r.employee._id }))}
            empty="No employees to show"
          />
        </>
      )}
      {!data && !error && <p className="text-sm text-gray-500">Loading…</p>}
    </div>
  );
}
