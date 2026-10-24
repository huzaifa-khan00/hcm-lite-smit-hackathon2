import { useCallback, useEffect, useState } from "react";
import { useToast } from "../../components/Toast.jsx";
import { errorMessage } from "../../api/client.js";
import { getToday, checkIn, checkOut } from "../../api/attendance.js";
import { fmtTime, fmtMinutes, STATUS_LABEL } from "../../utils/format.js";

// Resolves with {lat,lng}, or null if the browser can't / won't share it.
function getLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  });
}

export default function CheckIn() {
  const toast = useToast();
  const [today, setToday] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setError("");
      setToday(await getToday());
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (fn, okMessage) => {
    setBusy(true);
    try {
      await fn();
      toast.success(okMessage);
      await load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const onCheckIn = () =>
    run(async () => checkIn(await getLocation()), "Checked in");
  const onCheckOut = () => run(() => checkOut(), "Checked out");

  if (error)
    return <div className="rounded bg-red-50 p-3 text-red-700">{error}</div>;
  if (!today) return <p className="text-sm text-gray-500">Loading…</p>;

  const rec = today.record;
  const done = rec?.checkIn && rec?.checkOut;
  const notice = !today.working
    ? `Not a working day: ${today.reason}`
    : today.onLeave && !rec
      ? "You are on approved leave today."
      : null;

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-xl font-semibold">Check-in</h1>

      <div className="rounded border border-gray-200 bg-white p-5">
        <div className="text-sm text-gray-500">{today.date}</div>
        <div className="text-xs text-gray-400">
          Office starts {today.officeStart} · grace {today.graceMinutes} min
        </div>

        {notice ? (
          <p className="mt-4 rounded bg-gray-50 p-3 text-gray-700">{notice}</p>
        ) : (
          <>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-gray-500">Check-in</dt>
                <dd className="font-medium">{fmtTime(rec?.checkIn)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Check-out</dt>
                <dd className="font-medium">{fmtTime(rec?.checkOut)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Status</dt>
                <dd className="font-medium">
                  {rec ? STATUS_LABEL[rec.status] || rec.status : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Worked</dt>
                <dd className="font-medium">
                  {rec?.checkOut ? fmtMinutes(rec.workedMinutes) : "—"}
                </dd>
              </div>
            </dl>

            <div className="mt-5">
              {!rec?.checkIn && (
                <button
                  type="button"
                  onClick={onCheckIn}
                  disabled={busy}
                  className="w-full rounded bg-green-600 py-2 text-white hover:bg-green-700 disabled:opacity-60"
                >
                  {busy ? "Checking in…" : "Check in"}
                </button>
              )}
              {rec?.checkIn && !rec?.checkOut && (
                <button
                  type="button"
                  onClick={onCheckOut}
                  disabled={busy}
                  className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {busy ? "Checking out…" : "Check out"}
                </button>
              )}
              {done && (
                <p className="rounded bg-green-50 p-3 text-center text-sm text-green-800">
                  You're done for today.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
