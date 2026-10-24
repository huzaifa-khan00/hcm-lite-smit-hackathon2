const TZ = "Asia/Karachi";

export const fmtTime = (iso) =>
  iso
    ? new Intl.DateTimeFormat("en-GB", {
        timeZone: TZ,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date(iso))
    : "—";

export const fmtMinutes = (mins = 0) =>
  `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, "0")}m`;

// "2026-10-23" -> "Fri, 23 Oct"
export const fmtDay = (dateStr) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(new Date(`${dateStr}T00:00:00Z`));

export const STATUS_LABEL = {
  present: "Present",
  late: "Late",
  half_day: "Half day",
  absent: "Absent",
  off: "Off",
  not_checked_in: "Not checked in",
};

export const STATUS_BADGE = {
  present: "bg-green-100 text-green-800",
  late: "bg-amber-100 text-amber-800",
  half_day: "bg-orange-100 text-orange-800",
  absent: "bg-red-100 text-red-800",
  off: "bg-gray-100 text-gray-600",
  not_checked_in: "bg-blue-100 text-blue-800",
};
