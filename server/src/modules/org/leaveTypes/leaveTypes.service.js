import mongoose from "mongoose";
import { LeaveType } from "./leaveTypes.model.js";
import { badRequest, notFound } from "../../../utils/httpError.js";
import * as audit from "../../audit/audit.service.js";

const dupGuard = (err) => {
  if (err.code === 11000) throw badRequest("Leave type already exists");
  throw err;
};

export const list = () => LeaveType.find().sort({ name: 1 });

export async function create(user, data) {
  const doc = await LeaveType.create(data).catch(dupGuard);
  await audit.log({
    user,
    action: "leaveType.create",
    entity: "leaveType",
    entityId: doc._id,
    after: doc,
  });
  return doc;
}

export async function update(user, id, data) {
  if (!mongoose.isValidObjectId(id)) throw notFound("Leave type not found");
  const doc = await LeaveType.findById(id);
  if (!doc) throw notFound("Leave type not found");
  const before = doc.toObject();
  doc.set(data);
  await doc.save().catch(dupGuard);
  await audit.log({
    user,
    action: "leaveType.update",
    entity: "leaveType",
    entityId: doc._id,
    before,
    after: doc,
  });
  return doc;
}

export async function remove(user, id) {
  if (!mongoose.isValidObjectId(id)) throw notFound("Leave type not found");
  const doc = await LeaveType.findByIdAndDelete(id);
  if (!doc) throw notFound("Leave type not found");
  await audit.log({
    user,
    action: "leaveType.delete",
    entity: "leaveType",
    entityId: doc._id,
    before: doc,
  });
}
