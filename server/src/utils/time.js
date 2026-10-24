const TZ = "Asia/Karachi";

export function localParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type).value;
  const hour = get("hour") === "24" ? 0 : Number(get("hour"));
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: hour * 60 + Number(get("minute")),
  };
}

export const todayStr = () => localParts().date;

export const hhmmToMinutes = (s) => {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
};

export const weekdayOf = (dateStr) =>
  new Date(`${dateStr}T00:00:00Z`).getUTCDay();

export function monthDays(month) {
  const [y, m] = month.split("-").map(Number);
  const count = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return Array.from(
    { length: count },
    (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`,
  );
}
