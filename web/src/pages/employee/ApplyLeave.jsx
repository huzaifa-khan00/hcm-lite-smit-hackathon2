import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useToast } from "../../components/Toast.jsx";
import { errorMessage } from "../../api/client.js";
import { applyLeave, getBalance } from "../../api/leave.js";
import { todayStr } from "../../utils/time.js";

const inputCls = "mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm";

export default function ApplyLeave() {
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [balances, setBalances] = useState([]);
  const [loadError, setLoadError] = useState("");

  // The query string can pre-fill the form (the smart-leave assistant will use this).
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      leaveTypeId: params.get("type") || "",
      startDate: params.get("start") || todayStr(),
      endDate: params.get("end") || todayStr(),
      reason: params.get("reason") || "",
    },
  });

  useEffect(() => {
    getBalance()
      .then((d) => {
        setBalances(d.balances);
        if (!watch("leaveTypeId") && d.balances[0])
          setValue("leaveTypeId", d.balances[0].leaveType._id);
      })
      .catch((err) => setLoadError(errorMessage(err)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = balances.find((b) => b.leaveType._id === watch("leaveTypeId"));

  const onSubmit = async (v) => {
    try {
      const res = await applyLeave({
        leaveTypeId: v.leaveTypeId,
        startDate: v.startDate,
        endDate: v.endDate,
        reason: v.reason.trim(),
      });
      toast.success(
        `Leave requested for ${res.days} working day${res.days === 1 ? "" : "s"}`,
      );
      navigate("/my/leave");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Apply for leave</h1>
        <Link to="/my/leave" className="text-sm text-blue-600 hover:underline">
          Back to my leave
        </Link>
      </div>

      {loadError && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-3 rounded border border-gray-200 bg-white p-5"
      >
        <label className="block text-sm">
          Leave type
          <select
            className={inputCls}
            {...register("leaveTypeId", { required: "Pick a leave type" })}
          >
            <option value="">Select…</option>
            {balances.map((b) => (
              <option key={b.leaveType._id} value={b.leaveType._id}>
                {b.leaveType.name}
              </option>
            ))}
          </select>
          {errors.leaveTypeId && (
            <span className="text-xs text-red-600">
              {errors.leaveTypeId.message}
            </span>
          )}
        </label>
        {selected && (
          <p className="text-xs text-gray-500">
            {selected.remaining === null
              ? "Unpaid leave has no yearly limit."
              : `${selected.remaining} of ${selected.quota} day(s) left this year.`}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            From
            <input
              type="date"
              className={inputCls}
              {...register("startDate", { required: "Pick a start date" })}
            />
            {errors.startDate && (
              <span className="text-xs text-red-600">
                {errors.startDate.message}
              </span>
            )}
          </label>
          <label className="block text-sm">
            To
            <input
              type="date"
              className={inputCls}
              {...register("endDate", {
                required: "Pick an end date",
                validate: (v) =>
                  v >= watch("startDate") || "End must be on or after start",
              })}
            />
            {errors.endDate && (
              <span className="text-xs text-red-600">
                {errors.endDate.message}
              </span>
            )}
          </label>
        </div>
        <p className="text-xs text-gray-500">
          Weekends and public holidays are not counted.
        </p>

        <label className="block text-sm">
          Reason
          <textarea
            rows={3}
            maxLength={500}
            className={inputCls}
            {...register("reason", {
              required: "Give a reason",
              minLength: { value: 3, message: "At least 3 characters" },
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
          {isSubmitting ? "Sending…" : "Submit request"}
        </button>
      </form>
    </div>
  );
}
