import { useCallback, useEffect, useState } from "react";
import { useToast } from "../../components/Toast.jsx";
import { errorMessage } from "../../api/client.js";
import { getMyPayslips, getPayslipPdf } from "../../api/payroll.js";

export default function MyPayslips() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payslips, setPayslips] = useState([]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getMyPayslips();
      setPayslips(res.items || res || []);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDownloadPdf = async (id, month) => {
    try {
      const res = await getPayslipPdf(id);
      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `payslip-${month}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  if (loading) return <p className="text-sm text-gray-500">Loading…</p>;
  if (error)
    return <div className="rounded bg-red-50 p-3 text-red-700">{error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">My Payslips</h1>

      <div className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700">
            <tr>
              <th className="px-4 py-3">Month</th>
              <th className="px-4 py-3">Basic Salary</th>
              <th className="px-4 py-3">Allowances</th>
              <th className="px-4 py-3">Deductions</th>
              <th className="px-4 py-3 font-bold">Net Pay</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {payslips.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  No payslips generated yet.
                </td>
              </tr>
            ) : (
              payslips.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{p.month}</td>
                  <td className="px-4 py-3">
                    ${p.basic?.toFixed(2) || "0.00"}
                  </td>
                  <td className="px-4 py-3 text-green-600">
                    +${p.allowances?.toFixed(2) || "0.00"}
                  </td>
                  <td className="px-4 py-3 text-red-600">
                    -${p.deductions?.toFixed(2) || "0.00"}
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-900">
                    ${p.netPay?.toFixed(2) || "0.00"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDownloadPdf(p._id, p.month)}
                      className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
                    >
                      Download PDF
                    </button>
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
