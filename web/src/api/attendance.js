import client from "./client.js";

// ---- Corrections ----
export const createCorrection = (body) =>
  client.post("/corrections", body).then((r) => r.data);

export const myCorrections = (params) =>
  client.get("/corrections/mine", { params }).then((r) => r.data);

export const listCorrections = (params) =>
  client.get("/corrections", { params }).then((r) => r.data);

export const decideCorrection = (id, body) =>
  client.patch(`/corrections/${id}/decision`, body).then((r) => r.data);
