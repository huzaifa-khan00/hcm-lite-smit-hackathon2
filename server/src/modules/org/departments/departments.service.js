import mongoose from "mongoose";
import { Department } from "./departments.model.js";
import { badRequest, notFound } from "../../../utils/httpError.js";
import * as audit from "../../audit/audit.service.js";

const dupGuard = (err) => {
  if (err.code === 11000) throw badRequest("Department already exists");
  throw err;
};

export const list = () => Department.find().sort({ name: 1 });

export async function create(user, data) {
  const doc = await Department.create(data).catch(dupGuard);
  await audit.log({
    user,
    action: "department.create",
    entity: "department",
    entityId: doc._id,
    after: doc,
  });
  return doc;
}

export async function update(user, id, data) {
  if (!mongoose.isValidObjectId(id)) throw notFound("Department not found");
  const doc = await Department.findById(id);
  if (!doc) throw notFound("Department not found");
  const before = doc.toObject();
  doc.set(data);
  await doc.save().catch(dupGuard);
  await audit.log({
    user,
    action: "department.update",
    entity: "department",
    entityId: doc._id,
    before,
    after: doc,
  });
  return doc;
}

export async function remove(user, id) {
  if (!mongoose.isValidObjectId(id)) throw notFound("Department not found");
  const doc = await Department.findByIdAndDelete(id);
  if (!doc) throw notFound("Department not found");
  await audit.log({
    user,
    action: "department.delete",
    entity: "department",
    entityId: doc._id,
    before: doc,
  });
}
