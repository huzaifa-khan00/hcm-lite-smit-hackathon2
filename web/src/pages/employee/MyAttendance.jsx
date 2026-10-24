import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DataTable from "../../components/DataTable.jsx";
import { errorMessage } from "../../api/client.js";
import { getMonth } from "../../api/attendance.js";
import { todayStr } from "../../utils/time.js";
import {
  fmtTime,
  fmtMinutes,
  fmtDay,
  STATUS_LABEL,
  STATUS_BADGE,
} from "../../utils/format.js";

const SUMMARY = ["present", "late", "half_day", "on_leave", "absent"];
const FIXABLE = ["absent", "late", "half_day"];

export default function MyAttendance() {
  const [month, setMonth] = useState(todayStr().slice(0, 7));
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError("");
    getMonth(month)
      .then((d) => !cancelled && setData(d))
      .catch((err) => !cancelled && setError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [month]);

  const columns = [
    { key: "date", label: "Date", render: (r) => fmtDay(r.date) },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <div>
          <span
            className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[r.status] || ""}`}
          >
            {STATUS_LABEL[r.status] || r.status}
          </span>
          {r.note && <div className="mt-1 text-xs text-gray-500">{r.note}</div>}
        </div>
      ),
    },
    { key: "checkIn", label: "Check-in", render: (r) => fmtTime(r.checkIn) },
    { key: "checkOut", label: "Check-out", render: (r) => fmtTime(r.checkOut) },
    {
      key: "worked",
      label: "Worked",
      render: (r) => (r.checkOut ? fmtMinutes(r.workedMinutes) : "—"),
    },
    {
      key: "actions",
      label: "",
      render: (r) =>
        FIXABLE.includes(r.status) && (
          <Link
            to={`/my/corrections?date=${r.date}`}
            className="text-xs text-blue-600 hover:underline"
          >
            Request correction
          </Link>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">My attendance</h1>
        <input
          type="month"
          value={month}
          max={todayStr().slice(0, 7)}
          onChange={(e) => e.target.value && setMonth(e.target.value)}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm"
        />
      </div>

      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {SUMMARY.map((k) => (
              <div key={k} className="rounded border border-gray-200 bg-white p-4">
                <div className="text-xs text-gray-500">{STATUS_LABEL[k]}</div>
                <div className="text-2xl font-semibold">{data.summary[k]}</div>
              </div>
            ))}
          </div>
          <DataTable
            columns={columns}
            rows={[...data.days].reverse()}
            rowKey="date"
            empty="No days to show for this month"
          />
        </>
      )}
      {!data && !error && <p className="text-sm text-gray-500">Loading…</p>}
    </div>
  );
}
