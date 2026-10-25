import { useCallback, useEffect, useState } from "react";
import { useToast } from "../../components/Toast.jsx";
import { errorMessage } from "../../api/client.js";
import { listLeaves, decideLeave } from "../../api/leave.js";
import Modal from "../../components/Modal.jsx";
import FormField, {
  inputClass,
  buttonClass,
} from "../../components/FormField.jsx";

export default function LeaveInbox() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [leaves, setLeaves] = useState([]);
  const [statusFilter, setStatusFilter] = useState("pending");

  // Decision Modal
  const [selected, setSelected] = useState(null);
  const [decision, setDecision] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await listLeaves({ status: statusFilter });
      setLeaves(res.items || res || []);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDecision = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await decideLeave(selected._id, { decision, note });
      toast.success(`Leave request ${decision}`);
      setSelected(null);
      setNote("");
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-sm text-gray-500">Loading…</p>;
  if (error)
    return <div className="rounded bg-red-50 p-3 text-red-700">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Leave Inbox</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700">
            <tr>
              <th className="px-4 py-3">Employee</th>
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
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  No requests found.
                </td>
              </tr>
            ) : (
              leaves.map((l) => (
                <tr key={l._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    {l.employee?.name}{" "}
                    <span className="text-xs text-gray-400">
                      ({l.employee?.employeeCode})
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
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
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {l.status === "pending" && (
                      <>
                        <button
                          onClick={() => {
                            setSelected(l);
                            setDecision("approved");
                          }}
                          className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelected(l);
                            setDecision("rejected");
                          }}
                          className="rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <Modal
          title={`${decision === "approved" ? "Approve" : "Reject"} Leave Request`}
          onClose={() => setSelected(null)}
        >
          <form onSubmit={handleDecision}>
            <p className="text-sm text-gray-600 mb-4">
              Reviewing request from{" "}
              <span className="font-semibold">{selected.employee?.name}</span> (
              {selected.startDate} to {selected.endDate}).
            </p>
            <FormField label="Decision Note (Optional)">
              <textarea
                rows={3}
                className={inputClass}
                placeholder="Add note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </FormField>
            <button className={buttonClass} disabled={submitting}>
              {submitting ? "Processing..." : `Confirm ${decision}`}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
