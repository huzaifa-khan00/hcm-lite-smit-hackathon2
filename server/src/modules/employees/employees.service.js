import crypto from "crypto";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { Employee } from "./employees.model.js";
import { User } from "../auth/user.model.js";
import { Department } from "../org/departments/departments.model.js";
import { Designation } from "../org/designations/designations.model.js";
import { badRequest, notFound, forbidden } from "../../utils/httpError.js";
import * as audit from "../audit/audit.service.js";

const populate = [
  { path: "department", select: "name" },
  { path: "designation", select: "title" },
];

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function checkRefs({ department, designation }) {
  if (department && !(await Department.exists({ _id: department }))) {
    throw badRequest("Department not found");
  }
  if (designation && !(await Designation.exists({ _id: designation }))) {
    throw badRequest("Designation not found");
  }
}

async function findOrFail(id) {
  if (!mongoose.isValidObjectId(id)) throw notFound("Employee not found");
  const doc = await Employee.findById(id);
  if (!doc) throw notFound("Employee not found");
  return doc;
}

export async function list({ page, limit, search, department, status }) {
  const filter = {};
  if (search) {
    const rx = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ name: rx }, { email: rx }, { employeeCode: rx }];
  }
  if (department && mongoose.isValidObjectId(department))
    filter.department = department;
  if (status === "active") filter.isActive = true;
  if (status === "inactive") filter.isActive = false;

  const [items, total] = await Promise.all([
    Employee.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate(populate),
    Employee.countDocuments(filter),
  ]);
  return { items, total, page, limit };
}

export async function getOne(id) {
  const doc = await findOrFail(id);
  return doc.populate(populate);
}

export async function create(user, data) {
  const { role = "employee", ...rest } = data;
  if (role === "hr" && user.role !== "admin") {
    throw forbidden("Only admin can create HR users");
  }
  if (await User.exists({ email: rest.email }))
    throw badRequest("Email already in use");
  await checkRefs(rest);

  const count = await Employee.countDocuments();
  const employee = await Employee.create({
    ...rest,
    employeeCode: `EMP-${String(count + 1).padStart(4, "0")}`,
  });

  const tempPassword = crypto.randomBytes(5).toString("hex");
  try {
    const account = await User.create({
      name: employee.name,
      email: employee.email,
      passwordHash: await bcrypt.hash(tempPassword, 10),
      role,
      employeeId: employee._id,
      mustChangePassword: true,
    });
    employee.user = account._id;
    await employee.save();
  } catch (err) {
    await Employee.findByIdAndDelete(employee._id);
    if (err.code === 11000) throw badRequest("Email already in use");
    throw err;
  }

  await audit.log({
    user,
    action: "employee.create",
    entity: "employee",
    entityId: employee._id,
    after: employee,
  });
  await employee.populate(populate);
  return { employee, tempPassword };
}

export async function update(user, id, data) {
  const doc = await findOrFail(id);
  await checkRefs(data);
  const before = doc.toObject();
  doc.set(data);
  await doc.save();
  if (data.name && doc.user)
    await User.updateOne({ _id: doc.user }, { name: data.name });
  await audit.log({
    user,
    action: "employee.update",
    entity: "employee",
    entityId: doc._id,
    before,
    after: doc,
  });
  return doc.populate(populate);
}

export async function setStatus(user, id, isActive) {
  const doc = await findOrFail(id);
  const before = doc.toObject();
  doc.isActive = isActive;
  await doc.save();
  if (doc.user) await User.updateOne({ _id: doc.user }, { isActive });
  await audit.log({
    user,
    action: isActive ? "employee.activate" : "employee.deactivate",
    entity: "employee",
    entityId: doc._id,
    before,
    after: doc,
  });
  return doc.populate(populate);
}
