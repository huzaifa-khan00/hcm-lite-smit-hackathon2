import mongoose from "mongoose";
import { Holiday } from "./holidays.model.js";
import { badRequest, notFound } from "../../../utils/httpError.js";
import * as audit from "../../audit/audit.service.js";

const dupGuard = (err) => {
  if (err.code === 11000)
    throw badRequest("A holiday already exists on that date");
  throw err;
};

export function list(year) {
  const filter = /^\d{4}$/.test(year || "")
    ? { date: new RegExp(`^${year}-`) }
    : {};
  return Holiday.find(filter).sort({ date: 1 });
}

export async function create(user, data) {
  const doc = await Holiday.create(data).catch(dupGuard);
  await audit.log({
    user,
    action: "holiday.create",
    entity: "holiday",
    entityId: doc._id,
    after: doc,
  });
  return doc;
}

export async function update(user, id, data) {
  if (!mongoose.isValidObjectId(id)) throw notFound("Holiday not found");
  const doc = await Holiday.findById(id);
  if (!doc) throw notFound("Holiday not found");
  const before = doc.toObject();
  doc.set(data);
  await doc.save().catch(dupGuard);
  await audit.log({
    user,
    action: "holiday.update",
    entity: "holiday",
    entityId: doc._id,
    before,
    after: doc,
  });
  return doc;
}

export async function remove(user, id) {
  if (!mongoose.isValidObjectId(id)) throw notFound("Holiday not found");
  const doc = await Holiday.findByIdAndDelete(id);
  if (!doc) throw notFound("Holiday not found");
  await audit.log({
    user,
    action: "holiday.delete",
    entity: "holiday",
    entityId: doc._id,
    before: doc,
  });
}
