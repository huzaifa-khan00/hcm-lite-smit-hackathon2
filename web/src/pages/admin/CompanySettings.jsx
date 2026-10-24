import { useEffect, useState } from "react";
import { getSettings, updateSettings } from "../../api/org.js";
import { errorMessage } from "../../api/client.js";
import { useToast } from "../../components/Toast.jsx";
import Loader from "../../components/Loader.jsx";
import ErrorState from "../../components/ErrorState.jsx";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toForm = (s) => ({
  companyName: s.companyName ?? "",
  officeStart: s.officeStart ?? "09:00",
  graceMinutes: String(s.graceMinutes ?? 15),
  halfDayHours: String(s.halfDayHours ?? 5),
  weekend: s.weekend ?? [0, 6],
  lat: s.office?.lat ?? "",
  lng: s.office?.lng ?? "",
  radiusMeters: String(s.office?.radiusMeters ?? 150),
});

const inputCls =
  "mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
    </label>
  );
}

export default function CompanySettings() {
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setError("");
    try {
      setForm(toForm(await getSettings()));
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!form) return <Loader />;

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const toggleDay = (day) =>
    setForm({
      ...form,
      weekend: form.weekend.includes(day)
        ? form.weekend.filter((d) => d !== day)
        : [...form.weekend, day].sort(),
    });

  const submit = async (e) => {
    e.preventDefault();
    const office = { radiusMeters: Number(form.radiusMeters) };
    if (form.lat !== "") office.lat = Number(form.lat);
    if (form.lng !== "") office.lng = Number(form.lng);

    setSaving(true);
    try {
      const saved = await updateSettings({
        companyName: form.companyName,
        officeStart: form.officeStart,
        graceMinutes: Number(form.graceMinutes),
        halfDayHours: Number(form.halfDayHours),
        weekend: form.weekend,
        office,
      });
      setForm(toForm(saved));
      toast.success("Settings saved");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return toast.error("Location is not available");
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setForm({
          ...form,
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
        }),
      () => toast.error("Could not get your location"),
    );
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">Company Settings</h1>
      <p className="mt-1 text-sm text-gray-600">
        These rules decide who is marked present, late or half day.
      </p>

      <form
        onSubmit={submit}
        className="mt-6 space-y-5 rounded bg-white p-6 shadow"
      >
        <Field label="Company name">
          <input
            className={inputCls}
            value={form.companyName}
            onChange={set("companyName")}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Office start time">
            <input
              type="time"
              className={inputCls}
              value={form.officeStart}
              onChange={set("officeStart")}
            />
          </Field>
          <Field label="Grace (minutes)" hint="Late after start + grace">
            <input
              type="number"
              min="0"
              max="120"
              className={inputCls}
              value={form.graceMinutes}
              onChange={set("graceMinutes")}
            />
          </Field>
          <Field label="Half day (hours)" hint="Fewer hours = half day">
            <input
              type="number"
              min="1"
              max="12"
              step="0.5"
              className={inputCls}
              value={form.halfDayHours}
              onChange={set("halfDayHours")}
            />
          </Field>
        </div>

        <div>
          <span className="text-sm font-medium text-gray-700">
            Weekend days
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {DAYS.map((name, day) => (
              <label
                key={name}
                className={`cursor-pointer rounded border px-3 py-1 text-sm ${
                  form.weekend.includes(day)
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={form.weekend.includes(day)}
                  onChange={() => toggleDay(day)}
                />
                {name}
              </label>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Office location
            </span>
            <button
              type="button"
              className="text-sm text-blue-600 hover:underline"
              onClick={useMyLocation}
            >
              Use my current location
            </button>
          </div>
          <div className="mt-1 grid gap-4 sm:grid-cols-3">
            <Field label="Latitude">
              <input
                type="number"
                step="any"
                className={inputCls}
                value={form.lat}
                onChange={set("lat")}
              />
            </Field>
            <Field label="Longitude">
              <input
                type="number"
                step="any"
                className={inputCls}
                value={form.lng}
                onChange={set("lng")}
              />
            </Field>
            <Field label="Radius (meters)">
              <input
                type="number"
                min="10"
                max="5000"
                className={inputCls}
                value={form.radiusMeters}
                onChange={set("radiusMeters")}
              />
            </Field>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save settings"}
        </button>
      </form>
    </div>
  );
}
