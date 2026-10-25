import { useCallback, useEffect, useState } from "react";
import { useToast } from "../../components/Toast.jsx";
import { errorMessage } from "../../api/client.js";
import { leaveTypes } from "../../api/org.js";
import {
  myLeaves,
  getBalance,
  applyLeave,
  cancelLeave,
} from "../../api/leave.js";
import Modal from "../../components/Modal.jsx";
import FormField, {
  inputClass,
  buttonClass,
} from "../../components/FormField.jsx";

export default function MyLeave() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);

  // Modal & Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const currentYear = new Date().getFullYear().toString();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [leaveRes, balanceRes, typesRes] = await Promise.all([
        myLeaves(),
        getBalance(currentYear).catch(() => []),
        leaveTypes.list().catch(() => []), // Updated to use leaveTypes.list()
      ]);
      setLeaves(leaveRes.items || leaveRes || []);
      setBalances(balanceRes.items || balanceRes || []);
      setLeaveTypes(typesRes.items || typesRes || []);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [currentYear]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await applyLeave(form);
      toast.success("Leave request submitted");
      setModalOpen(false);
      setForm({ leaveType: "", startDate: "", endDate: "", reason: "" });
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this leave request?"))
      return;
    try {
      await cancelLeave(id);
      toast.success("Leave request cancelled");
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  if (loading) return <p className="text-sm text-gray-500">Loading…</p>;
  if (error)
    return <div className="rounded bg-red-50 p-3 text-red-700">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">My Leaves</h1>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Apply for Leave
        </button>
      </div>

      {/* Balances Section */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {balances.map((b) => (
          <div
            key={b._id || b.leaveType}
            className="rounded border bg-white p-4 shadow-sm"
          >
            <div className="text-sm text-gray-500">
              {b.leaveTypeName || "Leave Type"}
            </div>
            <div className="mt-1 text-2xl font-bold">
              {b.remaining ?? b.allowed - b.used}{" "}
              <span className="text-xs font-normal text-gray-400">
                / {b.allowed} days
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Leaves Table */}
      <div className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700">
            <tr>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leaves.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  No leave requests found.
                </td>
              </tr>
            ) : (
              leaves.map((l) => (
                <tr key={l._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    {l.leaveType?.name || "Leave"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {l.startDate} to {l.endDate}
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                    {l.reason}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs font-semibold uppercase ${
                        l.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : l.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : l.status === "cancelled"
                              ? "bg-gray-100 text-gray-600"
                              : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {l.status === "pending" && (
                      <button
                        onClick={() => handleCancel(l._id)}
                        className="text-red-600 hover:underline text-xs font-medium"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <Modal title="Apply for Leave" onClose={() => setModalOpen(false)}>
          <form onSubmit={handleApply}>
            <FormField label="Leave Type">
              <select
                required
                className={inputClass}
                value={form.leaveType}
                onChange={(e) =>
                  setForm({ ...form, leaveType: e.target.value })
                }
              >
                <option value="">Select type...</option>
                {leaveTypes.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Start Date">
              <input
                type="date"
                required
                className={inputClass}
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
              />
            </FormField>
            <FormField label="End Date">
              <input
                type="date"
                required
                className={inputClass}
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </FormField>
            <FormField label="Reason">
              <textarea
                required
                rows={3}
                className={inputClass}
                placeholder="Reason for leave..."
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              />
            </FormField>
            <button className={buttonClass} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
