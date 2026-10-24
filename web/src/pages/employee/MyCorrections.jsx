import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import DataTable from "../../components/DataTable.jsx";
import { useToast } from "../../components/Toast.jsx";
import { errorMessage } from "../../api/client.js";
import { createCorrection, myCorrections } from "../../api/attendance.js";
import { todayStr } from "../../utils/time.js";

const BADGE = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const inputCls = "mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm";

export default function MyCorrections() {
  const toast = useToast();
  const [params] = useSearchParams();
  const prefill = /^\d{4}-\d{2}-\d{2}$/.test(params.get("date") || "")
    ? params.get("date")
    : todayStr();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { date: prefill } });

  const load = useCallback(async () => {
    try {
      const d = await myCorrections({ limit: 50 });
      setItems(d.items);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const onSubmit = async (v) => {
    if (!v.checkIn && !v.checkOut) {
      setError("checkIn", {
        message: "Enter a check-in time, a check-out time, or both",
      });
      return;
    }
    try {
      await createCorrection({
        date: v.date,
        reason: v.reason.trim(),
        ...(v.checkIn && { checkIn: v.checkIn }),
        ...(v.checkOut && { checkOut: v.checkOut }),
      });
      toast.success("Correction request sent");
      reset({ date: todayStr(), checkIn: "", checkOut: "", reason: "" });
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const columns = [
    { key: "date", label: "Date" },
    {
      key: "times",
      label: "Requested times",
      render: (r) => (
        <div>
          {r.checkIn && <div>Check-in: {r.checkIn}</div>}
          {r.checkOut && <div>Check-out: {r.checkOut}</div>}
        </div>
      ),
    },
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
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">My attendance corrections</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-lg space-y-3 rounded border border-gray-200 bg-white p-5"
        noValidate
      >
        <h2 className="font-medium">Request a correction</h2>

        <label className="block text-sm">
          Date
          <input
            type="date"
            max={todayStr()}
            className={inputCls}
            {...register("date", { required: "Pick a date" })}
          />
          {errors.date && (
            <span className="text-xs text-red-600">{errors.date.message}</span>
          )}
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            Correct check-in
            <input type="time" className={inputCls} {...register("checkIn")} />
          </label>
          <label className="block text-sm">
            Correct check-out
            <input type="time" className={inputCls} {...register("checkOut")} />
          </label>
        </div>
        {errors.checkIn && (
          <span className="block text-xs text-red-600">
            {errors.checkIn.message}
          </span>
        )}

        <label className="block text-sm">
          Reason
          <textarea
            rows={3}
            maxLength={500}
            className={inputCls}
            {...register("reason", {
              required: "Give a reason",
              minLength: { value: 5, message: "At least 5 characters" },
            })}
          />
          {errors.reason && (
            <span className="text-xs text-red-600">{errors.reason.message}</span>
          )}
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {isSubmitting ? "Sending…" : "Send request"}
        </button>
      </form>

      <div>
        <h2 className="mb-2 font-medium">My requests</h2>
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : (
          <DataTable columns={columns} rows={items} empty="No requests yet" />
        )}
      </div>
    </div>
  );
}
