import client from "./client.js";

const data = (p) => p.then((r) => r.data);

export const list = (params) => data(client.get("/employees", { params }));
export const getOne = (id) => data(client.get(`/employees/${id}`));
export const create = (body) => data(client.post("/employees", body));
export const update = (id, body) => data(client.put(`/employees/${id}`, body));
export const setStatus = (id, isActive) =>
  data(client.patch(`/employees/${id}/status`, { isActive }));
