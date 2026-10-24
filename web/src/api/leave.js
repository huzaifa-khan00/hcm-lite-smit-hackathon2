import client from "./client.js";

const data = (p) => p.then((r) => r.data);

export const getBalance = (year) =>
  data(client.get("/leave/balance", { params: { year } }));
export const applyLeave = (body) => data(client.post("/leave", body));
export const myLeaves = (params) => data(client.get("/leave/mine", { params }));
export const cancelLeave = (id) => data(client.patch(`/leave/${id}/cancel`));
export const listLeaves = (params) => data(client.get("/leave", { params }));
export const decideLeave = (id, body) =>
  data(client.patch(`/leave/${id}/decision`, body));
