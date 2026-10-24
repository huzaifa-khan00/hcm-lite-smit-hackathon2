import { Designation } from "./designations.model.js";
import { badRequest, notFound } from "../../../utils/httpError.js";
import * as audit from "../../audit/audit.service.js";

const dupGuard = (err) => {
  if (err.code === 11000) throw badRequest("Designation already exists");
  throw err;
};

export const list = () =>
  Designation.find().sort({ title: 1 }).populate("department", "name");

export async function create(user, data) {
  const doc = await Designation.create(data).catch(dupGuard);
  await audit.log({
    user,
    action: "designation.create",
    entity: "designation",
    entityId: doc._id,
    after: doc,
  });
  return doc;
}

export async function update(user, id, data) {
  if (!mongoose.isValidObjectId(id)) throw notFound("Department not found");
  const doc = await Designation.findById(id);
  if (!doc) throw notFound("Designation not found");
  const before = doc.toObject();
  doc.set(data);
  await doc.save().catch(dupGuard);
  await audit.log({
    user,
    action: "designation.update",
    entity: "designation",
    entityId: doc._id,
    before,
    after: doc,
  });
  return doc;
}

export async function remove(user, id) {
  if (!mongoose.isValidObjectId(id)) throw notFound("Designation not found");
  const doc = await Designation.findByIdAndDelete(id);
  if (!doc) throw notFound("Designation not found");
  await audit.log({
    user,
    action: "designation.delete",
    entity: "designation",
    entityId: doc._id,
    before: doc,
  });
}
