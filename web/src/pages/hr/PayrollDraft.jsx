import { useState } from "react";
import { useToast } from "../../components/Toast.jsx";
import { errorMessage } from "../../api/client.js";
import { getPayrollDraft, runPayroll } from "../../api/payroll.js";
import FormField, {
  inputClass,
  buttonClass,
} from "../../components/FormField.jsx";

export default function PayrollDraft() {
  const toast = useToast();
  const [month, setMonth] = useState(() =>
    new Date().toISOString().slice(0, 7),
  );
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState(null);
  const [running, setRunning] = useState(false);

  const handleFetchDraft = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await getPayrollDraft({ month });
      setDraft(res);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRunPayroll = async () => {
    if (!window.confirm(`Are you sure you want to run payroll for ${month}?`))
      return;
    try {
      setRunning(true);
      await runPayroll({ month });
      toast.success(`Payroll successfully generated for ${month}`);
      const res = await getPayrollDraft({ month });
      setDraft(res);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Payroll Draft & Calculation</h1>

      <form
        onSubmit={handleFetchDraft}
        className="flex items-end gap-3 rounded bg-white p-4 shadow-sm border border-gray-200"
      >
        <div className="flex-1">
          <FormField label="Select Month">
            <input
              type="month"
              required
              className={inputClass}
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </FormField>
        </div>
        <div className="pb-4">
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Calculating..." : "Preview Draft"}
          </button>
        </div>
      </form>

      {draft && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded bg-white p-4 shadow-sm border border-gray-200">
            <div>
              <div className="text-sm text-gray-500">
                Draft Status for {month}
              </div>
              <div className="text-lg font-bold capitalize">
                {draft.status || "Ready to Run"}
              </div>
            </div>
            {draft.status !== "finalized" && (
              <button
                onClick={handleRunPayroll}
                disabled={running}
                className="rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
              >
                {running ? "Running Payroll..." : "Run Payroll for Month"}
              </button>
            )}
          </div>

          <div className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Basic</th>
                  <th className="px-4 py-3">Allowances</th>
                  <th className="px-4 py-3">Deductions</th>
                  <th className="px-4 py-3 font-bold">Net Pay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(draft.items || draft.payslips || []).map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">
                      {item.employeeName || item.employee?.name || "Employee"}
                    </td>
                    <td className="px-4 py-3">
                      ${item.basic?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-4 py-3 text-green-600">
                      +${item.allowances?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-4 py-3 text-red-600">
                      -${item.deductions?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900">
                      ${item.netPay?.toFixed(2) || "0.00"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
