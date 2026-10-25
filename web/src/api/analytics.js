import client from "./client.js";

const data = (p) => p.then((r) => r.data);

export const getAuditLogs = (params) =>
  data(client.get("/audit-logs", { params }));
