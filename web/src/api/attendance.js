import client from "./client.js";

// ---- Attendance ----
export const getToday = () => client.get("/attendance/today").then((r) => r.data);

export const checkIn = (location) =>
  client
    .post("/attendance/check-in", location ? { location } : {})
    .then((r) => r.data);

export const checkOut = () =>
  client.post("/attendance/check-out", {}).then((r) => r.data);

export const getMonth = (month) =>
  client.get("/attendance/me", { params: { month } }).then((r) => r.data);

export const getBoard = (date) =>
  client.get("/attendance/board", { params: { date } }).then((r) => r.data);

// ---- Corrections ----
export const createCorrection = (body) =>
  client.post("/corrections", body).then((r) => r.data);

export const myCorrections = (params) =>
  client.get("/corrections/mine", { params }).then((r) => r.data);

export const listCorrections = (params) =>
  client.get("/corrections", { params }).then((r) => r.data);

export const decideCorrection = (id, body) =>
  client.patch(`/corrections/${id}/decision`, body).then((r) => r.data);
