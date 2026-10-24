import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as employeesApi from "../../api/employees.js";
import { departments } from "../../api/org.js";
import { errorMessage } from "../../api/client.js";
import { useToast } from "../../components/Toast.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import Pagination from "../../components/Pagination.jsx";
import Loader from "../../components/Loader.jsx";
import ErrorState from "../../components/ErrorState.jsx";
import EmptyState from "../../components/EmptyState.jsx";

const LIMIT = 10;
const inputCls =
  "rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";

export default function Employees() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [deptList, setDeptList] = useState([]);
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    departments
      .list()
      .then(setDeptList)
      .catch(() => setDeptList([]));
  }, []);

  const load = useCallback(async () => {
    setError("");
    try {
      setData(
        await employeesApi.list({
          page,
          limit: LIMIT,
          search: debounced || undefined,
          department: department || undefined,
          status: status || undefined,
        }),
      );
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [page, debounced, department, status]);

  useEffect(() => {
    load();
  }, [load]);

  const confirmToggle = async () => {
    setBusy(true);
    try {
      await employeesApi.setStatus(target._id, !target.isActive);
      toast.success(
        target.isActive ? "Employee deactivated" : "Employee activated",
      );
      setTarget(null);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Employees</h1>
        <Link
          to="/hr/employees/new"
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add employee
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          className={`${inputCls} w-64`}
          placeholder="Search name, email or code"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={inputCls}
          value={department}
          onChange={(e) => {
            setDepartment(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All departments</option>
          {deptList.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>
        <select
          className={inputCls}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="mt-4">
        {error ? (
          <ErrorState message={error} onRetry={load} />
        ) : !data ? (
          <Loader />
        ) : data.items.length === 0 ? (
          <EmptyState message="No employees found" />
        ) : (
          <>
            <div className="overflow-x-auto rounded bg-white shadow">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Code</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Department</th>
                    <th className="px-4 py-3 font-medium">Designation</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((e) => (
                    <tr key={e._id} className="border-b last:border-0">
                      <td className="px-4 py-3">{e.employeeCode}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{e.name}</div>
                        <div className="text-xs text-gray-500">{e.email}</div>
                      </td>
                      <td className="px-4 py-3">{e.department?.name || "—"}</td>
                      <td className="px-4 py-3">
                        {e.designation?.title || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded px-2 py-0.5 text-xs ${
                            e.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {e.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="space-x-3 px-4 py-3 text-right">
                        <Link
                          className="text-blue-600 hover:underline"
                          to={`/hr/employees/${e._id}/edit`}
                        >
                          Edit
                        </Link>
                        <button
                          className={
                            e.isActive
                              ? "text-red-600 hover:underline"
                              : "text-green-700 hover:underline"
                          }
                          onClick={() => setTarget(e)}
                        >
                          {e.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={data.page}
              limit={data.limit}
              total={data.total}
              onChange={setPage}
            />
          </>
        )}
      </div>

      {target && (
        <ConfirmDialog
          title={
            target.isActive ? "Deactivate employee?" : "Activate employee?"
          }
          message={
            target.isActive
              ? `${target.name} will no longer be able to log in.`
              : `${target.name} will be able to log in again.`
          }
          confirmText={target.isActive ? "Deactivate" : "Activate"}
          busy={busy}
          onConfirm={confirmToggle}
          onCancel={() => setTarget(null)}
        />
      )}
    </div>
  );
}
