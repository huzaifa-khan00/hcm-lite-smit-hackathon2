import { useEffect, useState } from "react";
import Modal from "../../components/Modal.jsx";
import DataTable from "../../components/DataTable.jsx";
import { useToast } from "../../components/Toast.jsx";
import { useAuth } from "../../auth/useAuth.js";
import { errorMessage } from "../../api/client.js";
import { listLeaves, decideLeave } from "../../api/leave.js";

const TABS = ["pending", "approved", "rejected", "cancelled"];
const BADGE = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-600",
};

const range = (r) =>
  r.startDate === r.endDate ? r.startDate : `${r.startDate} → ${r.endDate}`;

export default function LeaveInbox() {
  const toast = useToast();
  const { user } = useAuth();
  const [status, setStatus] = useState("pending");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  const [active, setActive] = useState(null); // { item, decision }
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    listLeaves({ status, page })
      .then((d) => !cancelled && setData(d))
      .catch((err) => !cancelled && setError(errorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [status, page, reload]);

  const pages = Math.max(Math.ceil(data.total / data.limit), 1);

  // HR decides employee requests; Admin decides requests made by HR.
  const canDecide = (r) =>
    r.status === "pending" &&
    ((user.role === "hr" && r.requesterRole !== "hr") ||
      (user.role === "admin" && r.requesterRole === "hr"));

  const changeTab = (t) => {
    setStatus(t);
    setPage(1);
  };

  const open = (item, decision) => {
    setActive({ item, decision });
    setNote("");
  };

  const close = () => {
    if (!saving) setActive(null);
  };

  const submit = async () => {
    const trimmed = note.trim();
    if (active.decision === "rejected" && trimmed.length < 3) {
      toast.error("Add a comment (at least 3 characters) when rejecting");
      return;
    }
    setSaving(true);
    try {
      await decideLeave(active.item._id, {
        decision: active.decision,
        ...(trimmed && { note: trimmed }),
      });
      toast.success(
        active.decision === "approved" ? "Leave approved" : "Leave rejected",
      );
      setActive(null);
      setReload((n) => n + 1);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: "employee",
      label: "Employee",
      render: (r) => (
        <div>
          <div className="font-medium">{r.employee?.name || "—"}</div>
          <div className="text-xs text-gray-500">{r.employee?.employeeCode}</div>
        </div>
      ),
    },
    { key: "type", label: "Type", render: (r) => r.leaveType?.name || "—" },
    { key: "dates", label: "Dates", render: range },
    { key: "days", label: "Days" },
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
        canDecide(r) ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => open(r, "approved")}
              className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700"
            >
              Approve
            </button>
            <button
              type="button"
              onClick={() => open(r, "rejected")}
              className="rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
            >
              Reject
            </button>
          </div>
        ) : (
          r.status === "pending" && (
            <span className="text-xs text-gray-400">
              {r.requesterRole === "hr" ? "Admin decides" : "HR decides"}
            </span>
          )
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Leave requests</h1>

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => changeTab(t)}
            className={`rounded px-3 py-1.5 text-sm capitalize ${
              status === t
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <DataTable
          columns={columns}
          rows={data.items}
          empty={`No ${status} requests`}
        />
      )}

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          {data.total} request{data.total === 1 ? "" : "s"}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded border px-3 py-1 disabled:opacity-40"
          >
            Prev
          </button>
          <span>
            Page {page} of {pages}
          </span>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded border px-3 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {active && (
        <Modal
          title={active.decision === "approved" ? "Approve leave" : "Reject leave"}
          onClose={close}
        >
          <div className="space-y-3 text-sm">
            <div className="rounded bg-gray-50 p-3">
              <div className="font-medium">
                {active.item.employee?.name} · {active.item.leaveType?.name}
              </div>
              <div>
                {range(active.item)} ({active.item.days} working day
                {active.item.days === 1 ? "" : "s"})
              </div>
              <div className="mt-1 text-gray-600">{active.item.reason}</div>
            </div>

            <label className="block">
              <span className="mb-1 block font-medium">
                Comment{" "}
                {active.decision === "rejected" ? "(required)" : "(optional)"}
              </span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full rounded border border-gray-300 p-2"
              />
            </label>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={close}
                disabled={saving}
                className="rounded border px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={saving}
                className={`rounded px-4 py-2 text-white disabled:opacity-60 ${
                  active.decision === "approved"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {saving
                  ? "Saving…"
                  : active.decision === "approved"
                    ? "Approve"
                    : "Reject"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
