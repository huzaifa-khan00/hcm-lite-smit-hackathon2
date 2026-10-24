import { Settings } from "./settings.model.js";
import { notFound } from "../../../utils/httpError.js";
import * as audit from "../../audit/audit.service.js";

async function load() {
  const doc = await Settings.findOne();
  if (!doc) throw notFound("Company is not set up yet");
  return doc;
}

export async function getSettings() {
  return (await load()).toObject();
}

export async function updateSettings(user, patch) {
  const doc = await load();
  const before = doc.toObject();

  const { office, ...rest } = patch;
  doc.set(rest);
  if (office) {
    for (const [key, value] of Object.entries(office))
      doc.set(`office.${key}`, value);
  }
  await doc.save();

  const after = doc.toObject();
  await audit.log({
    user,
    action: "settings.update",
    entity: "settings",
    entityId: doc._id,
    before,
    after,
  });
  return after;
}
