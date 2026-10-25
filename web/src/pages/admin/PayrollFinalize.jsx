import { useCallback, useEffect, useState } from "react";
import { useToast } from "../../components/Toast.jsx";
import { errorMessage } from "../../api/client.js";
import { listPayrolls, finalizePayroll } from "../../api/payroll.js";

export default function PayrollFinalize() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payrolls, setPayrolls] = useState([]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await listPayrolls();
      setPayrolls(res.items || res || []);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleFinalize = async (id, month) => {
    if (
      !window.confirm(
        `Finalize payroll for ${month}? This will lock the payslips.`,
      )
    )
      return;
    try {
      await finalizePayroll(id, { status: "finalized" });
      toast.success("Payroll finalized successfully");
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
      <h1 className="text-xl font-semibold">
        Payroll Finalization & Management
      </h1>

      <div className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700">
            <tr>
              <th className="px-4 py-3">Month</th>
              <th className="px-4 py-3">Total Employees</th>
              <th className="px-4 py-3">Total Payout</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {payrolls.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  No payroll records found.
                </td>
              </tr>
            ) : (
              payrolls.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{p.month}</td>
                  <td className="px-4 py-3">
                    {p.totalEmployees || p.items?.length || 0}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    ${p.totalNetPay?.toFixed(2) || "0.00"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs font-semibold uppercase ${
                        p.status === "finalized"
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {p.status || "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.status !== "finalized" && (
                      <button
                        onClick={() => handleFinalize(p._id, p.month)}
                        className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
                      >
                        Finalize
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
