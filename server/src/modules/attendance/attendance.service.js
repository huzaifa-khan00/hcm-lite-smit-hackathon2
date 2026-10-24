import { Attendance } from "./attendance.model.js";
import { verifyLocation } from "./attendance.geo.js";
import { Settings } from "../org/settings/settings.model.js";
import { Holiday } from "../org/holidays/holidays.model.js";
import { Employee } from "../employees/employees.model.js";
import { badRequest, forbidden, notFound } from "../../utils/httpError.js";
import {
  localParts,
  todayStr,
  hhmmToMinutes,
  weekdayOf,
  monthDays,
} from "../../utils/time.js";

async function loadSettings() {
  const settings = await Settings.findOne();
  if (!settings) throw notFound("Company is not set up yet");
  return settings;
}

function requireEmployee(user) {
  if (!user.employeeId) throw forbidden("Only employees can record attendance");
  return user.employeeId;
}

async function holidayMap(filter) {
  const list = await Holiday.find(filter);
  return new Map(list.map((h) => [h.date, h.name]));
}

const offReason = (date, settings, holidays) => {
  if (settings.weekend.includes(weekdayOf(date))) return "Weekend";
  const name = holidays.get(date);
  return name ? `Holiday: ${name}` : null;
};

async function dayInfo(date, settings) {
  const reason = offReason(date, settings, await holidayMap({ date }));
  return reason ? { working: false, reason } : { working: true };
}

export async function checkIn(user, location) {
  const employeeId = requireEmployee(user);
  const settings = await loadSettings();
  verifyLocation(settings.office, location);

  const now = new Date();
  const { date, minutes } = localParts(now);
  const info = await dayInfo(date, settings);
  if (!info.working) throw badRequest(`Cannot check in: ${info.reason}`);

  const lateAfter = hhmmToMinutes(settings.officeStart) + settings.graceMinutes;
  try {
    return await Attendance.create({
      employee: employeeId,
      date,
      checkIn: now,
      status: minutes > lateAfter ? "late" : "present",
      checkInLocation: location,
    });
  } catch (err) {
    if (err.code === 11000) throw badRequest("Already checked in today");
    throw err;
  }
}

export async function checkOut(user) {
  const employeeId = requireEmployee(user);
  const settings = await loadSettings();
  const now = new Date();
  const { date } = localParts(now);

  const record = await Attendance.findOne({ employee: employeeId, date });
  if (!record) throw badRequest("You have not checked in today");
  if (record.checkOut) throw badRequest("Already checked out today");

  record.checkOut = now;
  record.workedMinutes = Math.max(
    Math.round((now - record.checkIn) / 60000),
    0,
  );
  if (record.workedMinutes < settings.halfDayHours * 60)
    record.status = "half_day";
  await record.save();
  return record;
}

export async function today(user) {
  const settings = await loadSettings();
  const date = todayStr();
  const info = await dayInfo(date, settings);
  const record = user.employeeId
    ? await Attendance.findOne({ employee: user.employeeId, date })
    : null;
  return {
    date,
    ...info,
    record,
    officeStart: settings.officeStart,
    graceMinutes: settings.graceMinutes,
  };
}

export async function myMonth(user, month) {
  const employeeId = requireEmployee(user);
  const settings = await loadSettings();
  const current = todayStr();
  const m = /^\d{4}-(0[1-9]|1[0-2])$/.test(month || "")
    ? month
    : current.slice(0, 7);
  const prefix = new RegExp(`^${m}-`);

  const [employee, records, holidays] = await Promise.all([
    Employee.findById(employeeId),
    Attendance.find({ employee: employeeId, date: prefix }),
    holidayMap({ date: prefix }),
  ]);
  if (!employee) throw notFound("Employee not found");

  const byDate = new Map(records.map((r) => [r.date, r]));
  const summary = { present: 0, late: 0, half_day: 0, absent: 0 };
  const days = [];

  for (const date of monthDays(m)) {
    if (date > current || date < employee.joiningDate) continue;
    const record = byDate.get(date) || null;
    const off = offReason(date, settings, holidays);

    let status;
    if (record) status = record.status;
    else if (off) status = "off";
    else status = date === current ? "not_checked_in" : "absent";

    if (summary[status] !== undefined) summary[status] += 1;
    days.push({
      date,
      status,
      note: off,
      checkIn: record?.checkIn || null,
      checkOut: record?.checkOut || null,
      workedMinutes: record?.workedMinutes || 0,
    });
  }
  return { month: m, summary, days };
}

export async function board(dateInput) {
  const settings = await loadSettings();
  const current = todayStr();
  const date = /^\d{4}-\d{2}-\d{2}$/.test(dateInput || "")
    ? dateInput
    : current;
  if (date > current) throw badRequest("Date is in the future");

  const info = await dayInfo(date, settings);
  const [employees, records] = await Promise.all([
    Employee.find({ isActive: true, joiningDate: { $lte: date } })
      .populate("department", "name")
      .sort({ name: 1 }),
    Attendance.find({ date }),
  ]);
  const byEmployee = new Map(records.map((r) => [String(r.employee), r]));

  const summary = {
    present: 0,
    late: 0,
    half_day: 0,
    absent: 0,
    not_checked_in: 0,
  };
  const rows = employees.map((e) => {
    const record = byEmployee.get(String(e._id)) || null;
    let status;
    if (record) status = record.status;
    else if (!info.working) status = "off";
    else status = date === current ? "not_checked_in" : "absent";

    if (summary[status] !== undefined) summary[status] += 1;
    return {
      employee: {
        _id: e._id,
        name: e.name,
        employeeCode: e.employeeCode,
        department: e.department?.name || null,
      },
      status,
      checkIn: record?.checkIn || null,
      checkOut: record?.checkOut || null,
      workedMinutes: record?.workedMinutes || 0,
    };
  });

  return { date, ...info, summary, rows };
}
