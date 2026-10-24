import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as employeesApi from "../../api/employees.js";
import { departments, designations } from "../../api/org.js";
import { errorMessage } from "../../api/client.js";
import { useAuth } from "../../auth/useAuth.js";
import { useToast } from "../../components/Toast.jsx";
import Loader from "../../components/Loader.jsx";
import ErrorState from "../../components/ErrorState.jsx";

const inputCls =
  "mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100";

const blank = {
  name: "",
  email: "",
  phone: "",
  department: "",
  designation: "",
  joiningDate: "",
  role: "employee",
};

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}

export default function EmployeeForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState(blank);
  const [deptList, setDeptList] = useState([]);
  const [desigList, setDesigList] = useState([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [d, g, emp] = await Promise.all([
          departments.list(),
          designations.list(),
          isEdit ? employeesApi.getOne(id) : Promise.resolve(null),
        ]);
        if (cancelled) return;
        setDeptList(d);
        setDesigList(g);
        if (emp) {
          setForm({
            name: emp.name,
            email: emp.email,
            phone: emp.phone || "",
            department: emp.department?._id || "",
            designation: emp.designation?._id || "",
            joiningDate: emp.joiningDate,
            role: "employee",
          });
        }
        setReady(true);
      } catch (err) {
        if (!cancelled) setError(errorMessage(err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      department: form.department || null,
      designation: form.designation || null,
      joiningDate: form.joiningDate,
    };
    try {
      if (isEdit) {
        await employeesApi.update(id, body);
        toast.success("Employee updated");
        navigate("/hr/employees");
      } else {
        const result = await employeesApi.create({
          ...body,
          email: form.email.trim(),
          role: form.role,
        });
        setCreated(result);
      }
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(created.tempPassword);
      toast.success("Password copied");
    } catch {
      toast.error("Could not copy, select it manually");
    }
  };

  if (error) return <ErrorState message={error} />;
  if (!ready) return <Loader />;

  if (created) {
    return (
      <div className="max-w-lg rounded bg-white p-6 shadow">
        <h1 className="text-xl font-bold">Employee created</h1>
        <p className="mt-2 text-sm text-gray-600">
          {created.employee.name} ({created.employee.employeeCode}) can log in
          with {created.employee.email} and this temporary password. It is shown
          only once, and they must change it at first login.
        </p>
        <div className="mt-4 flex items-center gap-3 rounded border bg-gray-50 p-3">
          <code className="flex-1 text-lg">{created.tempPassword}</code>
          <button
            className="text-sm text-blue-600 hover:underline"
            onClick={copyPassword}
          >
            Copy
          </button>
        </div>
        <div className="mt-5 flex gap-3">
          <button
            className="rounded border px-4 py-2 text-sm"
            onClick={() => {
              setCreated(null);
              setForm(blank);
            }}
          >
            Add another
          </button>
          <Link
            to="/hr/employees"
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Back to list
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold">
        {isEdit ? "Edit employee" : "Add employee"}
      </h1>

      <form
        onSubmit={submit}
        className="mt-6 space-y-4 rounded bg-white p-6 shadow"
      >
        <Field label="Full name">
          <input
            className={inputCls}
            value={form.name}
            onChange={set("name")}
            required
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            className={inputCls}
            value={form.email}
            onChange={set("email")}
            disabled={isEdit}
            required
          />
        </Field>
        <Field label="Phone">
          <input
            className={inputCls}
            value={form.phone}
            onChange={set("phone")}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Department">
            <select
              className={inputCls}
              value={form.department}
              onChange={set("department")}
            >
              <option value="">— None —</option>
              {deptList.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Designation">
            <select
              className={inputCls}
              value={form.designation}
              onChange={set("designation")}
            >
              <option value="">— None —</option>
              {desigList.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.title}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Joining date">
          <input
            type="date"
            className={inputCls}
            value={form.joiningDate}
            onChange={set("joiningDate")}
            required
          />
        </Field>
        {!isEdit && user.role === "admin" && (
          <Field label="Account type">
            <select
              className={inputCls}
              value={form.role}
              onChange={set("role")}
            >
              <option value="employee">Employee</option>
              <option value="hr">HR</option>
            </select>
          </Field>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Link to="/hr/employees" className="rounded border px-4 py-2 text-sm">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : isEdit ? "Save changes" : "Create employee"}
          </button>
        </div>
      </form>
    </div>
  );
}
