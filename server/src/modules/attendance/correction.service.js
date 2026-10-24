import { Correction } from "./correction.model.js";
import { Attendance } from "./attendance.model.js";
import { Settings } from "../org/settings/settings.model.js";
import { Holiday } from "../org/holidays/holidays.model.js";
import { Employee } from "../employees/employees.model.js";
import * as audit from "../audit/audit.service.js";
import { badRequest, forbidden, notFound } from "../../utils/httpError.js";
import {
  localParts,
  todayStr,
  hhmmToMinutes,
  weekdayOf,
} from "../../utils/time.js";

const MAX_AGE_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;
const OBJECT_ID = /^[a-f\d]{24}$/i;

const utcMidnight = (date) => Date.parse(`${date}T00:00:00Z`);

async function loadSettings() {
  const settings = await Settings.findOne();
  if (!settings) throw notFound("Company is not set up yet");
  return settings;
}

function requireEmployee(user) {
  if (!user.employeeId)
    throw forbidden("Only employees can request corrections");
  return user.employeeId;
}

// Turns a local date ("2026-10-25") and time ("09:30") into a real Date,
// using whatever time zone localParts() uses.
function atLocalTime(date, hhmm) {
  const target = hhmmToMinutes(hhmm);
  let guess = utcMidnight(date) + target * 60000;
  for (let i = 0; i < 2; i++) {
    const shown = localParts(new Date(guess));
    const offset =
      (utcMidnight(shown.date) - utcMidnight(date)) / 60000 +
      shown.minutes -
      target;
    guess -= offset * 60000;
  }
  return new Date(guess);
}

// Requested times win; anything not sent is kept from the existing record.
function mergeTimes(date, record, { checkIn, checkOut }) {
  return {
    inAt: checkIn ? atLocalTime(date, checkIn) : record?.checkIn || null,
    outAt: checkOut ? atLocalTime(date, checkOut) : record?.checkOut || null,
  };
}

function checkTimes(inAt, outAt) {
  if (!inAt)
    throw badRequest(
      "That day has no check-in yet, so send a check-in time too",
    );
  if (outAt && outAt <= inAt)
    throw badRequest("Check-out must be after check-in");
  const now = new Date();
  if (inAt > now || (outAt && outAt > now))
    throw badRequest("Times cannot be in the future");
}

// Same rules as check-in / check-out in attendance.service.js
function statusFor(inAt, outAt, workedMinutes, settings) {
  const lateAfter = hhmmToMinutes(settings.officeStart) + settings.graceMinutes;
  let status = localParts(inAt).minutes > lateAfter ? "late" : "present";
  if (outAt && workedMinutes < settings.halfDayHours * 60) status = "half_day";
  return status;
}

export async function createRequest(user, { date, checkIn, checkOut, reason }) {
  const employeeId = requireEmployee(user);
  const [settings, employee] = await Promise.all([
    loadSettings(),
    Employee.findById(employeeId),
  ]);
  if (!employee) throw notFound("Employee not found");

  const today = todayStr();
  if (date > today) throw badRequest("You cannot correct a future date");
  if ((utcMidnight(today) - utcMidnight(date)) / DAY_MS > MAX_AGE_DAYS)
    throw badRequest(
      `Corrections are limited to the last ${MAX_AGE_DAYS} days`,
    );
  if (date < employee.joiningDate)
    throw badRequest(
      `That date is before your joining date (${employee.joiningDate})`,
    );

  if (settings.weekend.includes(weekdayOf(date)))
    throw badRequest("Cannot request a correction: Weekend");
  const holiday = await Holiday.findOne({ date });
  if (holiday)
    throw badRequest(`Cannot request a correction: Holiday: ${holiday.name}`);

  const record = await Attendance.findOne({ employee: employeeId, date });
  const { inAt, outAt } = mergeTimes(date, record, { checkIn, checkOut });
  checkTimes(inAt, outAt);

  let doc;
  try {
    doc = await Correction.create({
      employee: employeeId,
      date,
      checkIn,
      checkOut,
      reason,
    });
  } catch (err) {
    if (err.code === 11000)
      throw badRequest("You already have a pending request for this date");
    throw err;
  }

  await audit.log({
    user,
    action: "correction.request",
    entity: "correction",
    entityId: doc._id,
    before: null,
    after: doc,
  });
  return doc;
}

async function paged(filter, page, limit) {
  const [items, total] = await Promise.all([
    Correction.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("employee", "name employeeCode")
      .populate("decidedBy", "name"),
    Correction.countDocuments(filter),
  ]);
  return { items, total, page, limit };
}

export async function listMine(user, { page = 1, limit = 20, status }) {
  const employeeId = requireEmployee(user);
  return paged({ employee: employeeId, ...(status && { status }) }, page, limit);
}

export async function listAll({ page = 1, limit = 20, status }) {
  return paged(status ? { status } : {}, page, limit);
}

async function applyToAttendance(user, correction) {
  const settings = await loadSettings();
  const record = await Attendance.findOne({
    employee: correction.employee,
    date: correction.date,
  });
  const { inAt, outAt } = mergeTimes(correction.date, record, correction);
  checkTimes(inAt, outAt);

  const before = record ? record.toObject() : null;
  const attendance =
    record ||
    new Attendance({ employee: correction.employee, date: correction.date });
  attendance.checkIn = inAt;
  if (outAt) attendance.checkOut = outAt;
  attendance.workedMinutes = outAt
    ? Math.max(Math.round((outAt - inAt) / 60000), 0)
    : 0;
  attendance.status = statusFor(inAt, outAt, attendance.workedMinutes, settings);
  await attendance.save();

  await audit.log({
    user,
    action: "attendance.correct",
    entity: "attendance",
    entityId: attendance._id,
    before,
    after: attendance,
  });
  return attendance;
}

export async function decide(user, id, { decision, note }) {
  if (!OBJECT_ID.test(id)) throw notFound("Correction request not found");
  const correction = await Correction.findById(id);
  if (!correction) throw notFound("Correction request not found");
  if (correction.status !== "pending")
    throw badRequest(`This request is already ${correction.status}`);
  if (user.employeeId && String(user.employeeId) === String(correction.employee))
    throw forbidden("You cannot decide your own request");

  const before = correction.toObject();

  // Update attendance first: if the times are invalid, the request stays pending.
  const attendance =
    decision === "approved" ? await applyToAttendance(user, correction) : null;

  correction.status = decision;
  correction.decidedBy = user.id;
  correction.decidedAt = new Date();
  if (note) correction.decisionNote = note;
  await correction.save();

  await audit.log({
    user,
    action: decision === "approved" ? "correction.approve" : "correction.reject",
    entity: "correction",
    entityId: correction._id,
    before,
    after: correction,
  });
  return { correction, attendance };
}
