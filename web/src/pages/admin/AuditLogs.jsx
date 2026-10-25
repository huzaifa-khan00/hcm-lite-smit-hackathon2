import { useEffect, useState } from "react";
import { useToast } from "../../components/Toast.jsx";
import { errorMessage } from "../../api/client.js";
import { getAuditLogs } from "../../api/analytics.js";

export default function AuditLogs() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true);
        const res = await getAuditLogs().catch(() => []);
        setLogs(Array.isArray(res) ? res : res.items || []);
      } catch (err) {
        toast.error(errorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">System Audit Logs</h1>

      <div className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                  Loading activity logs…
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                  No system activity logged yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(log.createdAt || Date.now()).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {log.userName || log.userEmail || "System"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-800">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-sm truncate">
                    {log.details || log.description || "—"}
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
