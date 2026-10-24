import { useCallback, useEffect, useState } from "react";
import { errorMessage } from "../api/client.js";
import { useToast } from "./Toast.jsx";
import Modal from "./Modal.jsx";
import ConfirmDialog from "./ConfirmDialog.jsx";
import Loader from "./Loader.jsx";
import ErrorState from "./ErrorState.jsx";
import EmptyState from "./EmptyState.jsx";

const inputCls =
  "mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";

const blankForm = (fields) =>
  Object.fromEntries(
    fields.map((f) => [
      f.key,
      f.default ?? (f.type === "checkbox" ? false : ""),
    ]),
  );

const rowToForm = (fields, row) =>
  Object.fromEntries(
    fields.map((f) => {
      const v = row[f.key];
      if (f.type === "select") return [f.key, v?._id ?? v ?? ""];
      if (f.type === "checkbox") return [f.key, !!v];
      return [f.key, v == null ? "" : String(v)];
    }),
  );

const formToPayload = (fields, form) => {
  const payload = {};
  for (const f of fields) {
    const v = form[f.key];
    if (f.type === "number") payload[f.key] = Number(v);
    else if (f.type === "select") payload[f.key] = v || null;
    else if (f.type === "checkbox") payload[f.key] = !!v;
    else payload[f.key] = typeof v === "string" ? v.trim() : v;
  }
  return payload;
};

export default function CrudPanel({ noun, api, fields, columns }) {
  const toast = useToast();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setError("");
    try {
      setRows(await api.list());
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setForm(blankForm(fields));
    setEditing({});
  };

  const openEdit = (row) => {
    setForm(rowToForm(fields, row));
    setEditing(row);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = formToPayload(fields, form);
      if (editing._id) await api.update(editing._id, payload);
      else await api.create(payload);
      toast.success(`${noun} saved`);
      setEditing(null);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setSaving(true);
    try {
      await api.remove(deleting._id);
      toast.success(`${noun} deleted`);
      setDeleting(null);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const setField = (key, value) => setForm({ ...form, [key]: value });

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!rows) return <Loader />;

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          onClick={openNew}
        >
          Add {noun.toLowerCase()}
        </button>
      </div>

      {rows.length === 0 ? (
        <EmptyState message={`No ${noun.toLowerCase()}s yet`} />
      ) : (
        <div className="overflow-x-auto rounded bg-white shadow">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-gray-600">
              <tr>
                {columns.map((c) => (
                  <th key={c.label} className="px-4 py-3 font-medium">
                    {c.label}
                  </th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row._id} className="border-b last:border-0">
                  {columns.map((c) => (
                    <td key={c.label} className="px-4 py-3">
                      {c.render(row)}
                    </td>
                  ))}
                  <td className="space-x-3 px-4 py-3 text-right">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => openEdit(row)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => setDeleting(row)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal
          title={
            editing._id
              ? `Edit ${noun.toLowerCase()}`
              : `Add ${noun.toLowerCase()}`
          }
          onClose={() => setEditing(null)}
        >
          <form onSubmit={submit} className="space-y-4">
            {fields.map((f) => (
              <label key={f.key} className="block">
                {f.type === "checkbox" ? (
                  <span className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!form[f.key]}
                      onChange={(e) => setField(f.key, e.target.checked)}
                    />
                    {f.label}
                  </span>
                ) : (
                  <>
                    <span className="text-sm font-medium text-gray-700">
                      {f.label}
                    </span>
                    {f.type === "select" ? (
                      <select
                        className={inputCls}
                        value={form[f.key]}
                        onChange={(e) => setField(f.key, e.target.value)}
                      >
                        <option value="">— None —</option>
                        {(f.options || []).map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={f.type || "text"}
                        className={inputCls}
                        value={form[f.key]}
                        min={f.type === "number" ? 0 : undefined}
                        onChange={(e) => setField(f.key, e.target.value)}
                      />
                    )}
                  </>
                )}
              </label>
            ))}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                className="rounded border px-4 py-2 text-sm"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          message={`Delete this ${noun.toLowerCase()}? This cannot be undone.`}
          busy={saving}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
