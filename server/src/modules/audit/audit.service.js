import { AuditLog } from "./audit.model.js";

const plain = (v) =>
  v === undefined || v === null ? null : JSON.parse(JSON.stringify(v));

export async function log({ user, action, entity, entityId, before, after }) {
  await AuditLog.create({
    actor: user.id,
    actorRole: user.role,
    action,
    entity,
    entityId: entityId ? String(entityId) : undefined,
    before: plain(before),
    after: plain(after),
  });
}

export async function list({ page = 1, limit = 20, entity, action }) {
  const filter = {};
  if (entity) filter.entity = entity;
  if (action) filter.action = action;

  const [items, total] = await Promise.all([
    AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("actor", "name email"),
    AuditLog.countDocuments(filter),
  ]);

  return { items, total, page, limit };
}
