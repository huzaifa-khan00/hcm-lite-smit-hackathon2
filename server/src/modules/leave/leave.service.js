import mongoose from "mongoose";
import { LeaveRequest } from "./leaveRequest.model.js";
import { LeaveType } from "../org/leaveTypes/leaveTypes.model.js";
import { Settings } from "../org/settings/settings.model.js";
import { Holiday } from "../org/holidays/holidays.model.js";
import { Employee } from "../employees/employees.model.js";
import { Attendance } from "../attendance/attendance.model.js";
import { User } from "../auth/user.model.js";
import * as audit from "../audit/audit.service.js";
import {
  badRequest,
  forbidden,
  notFound,
  unprocessable,
} from "../../utils/httpError.js";
import { todayStr, weekdayOf } from "../../utils/time.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_SPAN_DAYS = 60;
const MAX_PAST_DAYS = 30;
const ACTIVE = ["pending", "approved"];

const utc = (date) => Date.parse(`${date}T00:00:00Z`);

function dateRange(start, end) {
  const out = [];
  for (let t = utc(start); t <= utc(end); t += DAY_MS)
    out.push(new Date(t).toISOString().slice(0, 10));
  return out;
}

async function loadSettings() {
  const settings = await Settings.findOne();
  if (!settings) throw notFound("Company is not set up yet");
  return settings;
}

function requireEmployee(user) {
  if (!user.employeeId)
    throw forbidden("Only employees can apply for or manage their own leave");
  return user.employeeId;
}

// Working days only: weekends and public holidays are skipped.
async function workingDatesBetween(start, end, settings) {
  const holidays = await Holiday.find({ date: { $gte: start, $lte: end } });
  const off = new Set(holidays.map((h) => h.date));
  return dateRange(start, end).filter(
    (d) => !settings.weekend.includes(weekdayOf(d)) && !off.has(d),
  );
}

function countByYear(dates) {
  const out = {};
  for (const d of dates) out[d.slice(0, 4)] = (out[d.slice(0, 4)] || 0) + 1;
  return out;
}

async function usageInYear(employeeId, leaveTypeId, year) {
  const requests = await LeaveRequest.find({
    employee: employeeId,
    leaveType: leaveTypeId,
    status: { $in: ACTIVE },
    workingDates: new RegExp(`^${year}-`),
  });
  let approved = 0;
  let pending = 0;
  for (const r of requests) {
    const n = r.workingDates.filter((d) => d.startsWith(`${year}-`)).length;
    if (r.status === "approved") approved += n;
    else pending += n;
  }
  return { approved, pending };
}

async function findRequest(id) {
  if (!mongoose.isValidObjectId(id)) throw notFound("Leave request not found");
  const doc = await LeaveRequest.findById(id);
  if (!doc) throw notFound("Leave request not found");
  return doc;
}

// ---------- employee ----------

export async function balance(user, yearInput) {
  const employeeId = requireEmployee(user);
  const year = /^\d{4}$/.test(yearInput || "")
    ? yearInput
    : todayStr().slice(0, 4);

  const [types, requests] = await Promise.all([
    LeaveType.find().sort({ name: 1 }),
    LeaveRequest.find({
      employee: employeeId,
      status: { $in: ACTIVE },
      workingDates: new RegExp(`^${year}-`),
    }),
  ]);

  const balances = types.map((t) => {
    let approved = 0;
    let pending = 0;
    for (const r of requests) {
      if (String(r.leaveType) !== String(t._id)) continue;
      const n = r.workingDates.filter((d) => d.startsWith(`${year}-`)).length;
      if (r.status === "approved") approved += n;
      else pending += n;
    }
    const unlimited = !t.isPaid;
    return {
      leaveType: {
        _id: t._id,
        name: t.name,
        isPaid: t.isPaid,
        daysPerYear: t.daysPerYear,
      },
      quota: unlimited ? null : t.daysPerYear,
      used: approved,
      pending,
      remaining: unlimited
        ? null
        : Math.max(t.daysPerYear - approved - pending, 0),
    };
  });
  return { year, balances };
}

export async function apply(user, { leaveTypeId, startDate, endDate, reason }) {
  const employeeId = requireEmployee(user);
  const [settings, employee, type] = await Promise.all([
    loadSettings(),
    Employee.findById(employeeId),
    LeaveType.findById(leaveTypeId),
  ]);
  if (!employee) throw notFound("Employee not found");
  if (!type) throw notFound("Leave type not found");

  const today = todayStr();
  if (startDate < employee.joiningDate)
    throw badRequest(
      `Leave cannot start before your joining date (${employee.joiningDate})`,
    );
  if ((utc(today) - utc(startDate)) / DAY_MS > MAX_PAST_DAYS)
    throw badRequest(
      `Leave can start at most ${MAX_PAST_DAYS} days in the past`,
    );
  if ((utc(endDate) - utc(startDate)) / DAY_MS >= MAX_SPAN_DAYS)
    throw badRequest(`One request can cover at most ${MAX_SPAN_DAYS} days`);

  const workingDates = await workingDatesBetween(startDate, endDate, settings);
  if (workingDates.length === 0)
    throw unprocessable(
      "Those dates have no working days (weekends and holidays are skipped)",
    );

  const overlap = await LeaveRequest.findOne({
    employee: employeeId,
    status: { $in: ACTIVE },
    workingDates: { $in: workingDates },
  });
  if (overlap)
    throw unprocessable(
      `Overlaps with your ${overlap.status} leave from ${overlap.startDate} to ${overlap.endDate}`,
    );

  const clash = await Attendance.findOne({
    employee: employeeId,
    date: { $in: workingDates },
  });
  if (clash)
    throw unprocessable(`You already have attendance recorded on ${clash.date}`);

  // Unpaid leave has no quota; paid types are checked per calendar year.
  if (type.isPaid) {
    for (const [year, requested] of Object.entries(countByYear(workingDates))) {
      const { approved, pending } = await usageInYear(
        employeeId,
        type._id,
        year,
      );
      const remaining = type.daysPerYear - approved - pending;
      if (requested > remaining)
        throw unprocessable(
          `Not enough ${type.name} balance for ${year}: ${Math.max(remaining, 0)} day(s) left, ${requested} requested`,
        );
    }
  }

  const doc = await LeaveRequest.create({
    employee: employeeId,
    leaveType: type._id,
    startDate,
    endDate,
    workingDates,
    days: workingDates.length,
    reason,
  });

  await audit.log({
    user,
    action: "leave.request",
    entity: "leave",
    entityId: doc._id,
    before: null,
    after: doc,
  });
  return doc;
}

export async function cancel(user, id) {
  const employeeId = requireEmployee(user);
  const doc = await findRequest(id);
  if (String(doc.employee) !== String(employeeId))
    throw notFound("Leave request not found");
  if (!ACTIVE.includes(doc.status))
    throw badRequest(`This request is already ${doc.status}`);
  if (doc.status === "approved" && doc.workingDates[0] <= todayStr())
    throw badRequest("Leave that has already started cannot be cancelled");

  const before = doc.toObject();
  doc.status = "cancelled";
  await doc.save();

  await audit.log({
    user,
    action: "leave.cancel",
    entity: "leave",
    entityId: doc._id,
    before,
    after: doc,
  });
  return doc;
}

// ---------- lists ----------

async function paged(filter, page, limit) {
  const [items, total] = await Promise.all([
    LeaveRequest.find(filter)
      .select("-workingDates")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("leaveType", "name isPaid")
      .populate("employee", "name employeeCode")
      .populate("decidedBy", "name"),
    LeaveRequest.countDocuments(filter),
  ]);

  // The inbox needs to know whose request is whose (HR requests go to Admin).
  const ids = items.map((i) => i.employee?._id).filter(Boolean);
  const owners = await User.find({ employeeId: { $in: ids } }).select(
    "employeeId role",
  );
  const roleOf = new Map(owners.map((u) => [String(u.employeeId), u.role]));

  return {
    items: items.map((i) => ({
      ...i.toObject(),
      requesterRole: roleOf.get(String(i.employee?._id)) || "employee",
    })),
    total,
    page,
    limit,
  };
}

export async function listMine(user, { page = 1, limit = 20, status }) {
  const employeeId = requireEmployee(user);
  return paged({ employee: employeeId, ...(status && { status }) }, page, limit);
}

export async function listAll({ page = 1, limit = 20, status }) {
  return paged(status ? { status } : {}, page, limit);
}

// ---------- approval ----------

export async function decide(user, id, { decision, note }) {
  const doc = await findRequest(id);
  if (doc.status !== "pending")
    throw badRequest(`This request is already ${doc.status}`);
  if (user.employeeId && String(user.employeeId) === String(doc.employee))
    throw forbidden("You cannot decide your own request");

  // HR decides employee requests; Admin decides requests made by HR.
  const owner = await User.findOne({ employeeId: doc.employee }).select("role");
  const requesterRole = owner?.role || "employee";
  if (requesterRole === "hr" && user.role !== "admin")
    throw forbidden("HR leave requests are decided by Admin");
  if (requesterRole !== "hr" && user.role !== "hr")
    throw forbidden("Only HR decides employee leave requests");

  const before = doc.toObject();
  doc.status = decision;
  doc.decidedBy = user.id;
  doc.decidedAt = new Date();
  if (note) doc.decisionNote = note;
  await doc.save();

  await audit.log({
    user,
    action: decision === "approved" ? "leave.approve" : "leave.reject",
    entity: "leave",
    entityId: doc._id,
    before,
    after: doc,
  });
  return doc;
}
