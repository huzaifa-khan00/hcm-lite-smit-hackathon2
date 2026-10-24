import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DataTable from "../../components/DataTable.jsx";
import { useToast } from "../../components/Toast.jsx";
import { errorMessage } from "../../api/client.js";
import { getBalance, myLeaves, cancelLeave } from "../../api/leave.js";

const BADGE = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-600",
};

const range = (r) =>
  r.startDate === r.endDate ? r.startDate : `${r.startDate} → ${r.endDate}`;

export default function MyLeave() {
  const toast = useToast();
  const [balance, setBalance] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      const [b, l] = await Promise.all([getBalance(), myLeaves({ limit: 50 })]);
      setBalance(b);
      setItems(l.items);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onCancel = async (r) => {
    if (!window.confirm(`Cancel your leave (${range(r)})?`)) return;
    setBusyId(r._id);
    try {
      await cancelLeave(r._id);
      toast.success("Leave cancelled");
      await load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusyId("");
    }
  };

  const columns = [
    { key: "type", label: "Type", render: (r) => r.leaveType?.name || "—" },
    { key: "dates", label: "Dates", render: range },
    { key: "days", label: "Working days" },
    { key: "reason", label: "Reason", className: "max-w-xs" },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <div>
          <span
            className={`rounded px-2 py-0.5 text-xs font-medium ${BADGE[r.status]}`}
          >
            {r.status}
          </span>
          {r.decisionNote && (
            <div className="mt-1 text-xs text-gray-500">{r.decisionNote}</div>
          )}
          {r.decidedBy?.name && (
            <div className="text-xs text-gray-400">by {r.decidedBy.name}</div>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (r) =>
        (r.status === "pending" || r.status === "approved") && (
          <button
            type="button"
            disabled={busyId === r._id}
            onClick={() => onCancel(r)}
            className="text-xs text-red-600 hover:underline disabled:opacity-50"
          >
            Cancel
          </button>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">My leave</h1>
        <Link
          to="/my/leave/apply"
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Apply for leave
        </Link>
      </div>

      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {balance && (
        <div>
          <h2 className="mb-2 text-sm font-medium text-gray-600">
            Balance for {balance.year}
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {balance.balances.map((b) => (
              <div
                key={b.leaveType._id}
                className="rounded border border-gray-200 bg-white p-4"
              >
                <div className="text-xs text-gray-500">{b.leaveType.name}</div>
                {b.remaining === null ? (
                  <div className="text-2xl font-semibold">Unlimited</div>
                ) : (
                  <div className="text-2xl font-semibold">
                    {b.remaining}
                    <span className="text-sm font-normal text-gray-500">
                      {" "}
                      / {b.quota}
                    </span>
                  </div>
                )}
                <div className="mt-1 text-xs text-gray-500">
                  {b.used} used
                  {b.pending > 0 && ` · ${b.pending} pending`}
                </div>
              </div>
            ))}
          </div>
          {balance.balances.length === 0 && (
            <p className="text-sm text-gray-500">
              No leave types have been set up yet. Ask Admin to add them.
            </p>
          )}
        </div>
      )}

      <div>
        <h2 className="mb-2 font-medium">History</h2>
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : (
          <DataTable columns={columns} rows={items} empty="No leave requests yet" />
        )}
      </div>
    </div>
  );
}
