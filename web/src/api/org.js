import client from "./client.js";

const data = (p) => p.then((r) => r.data);

export const getSettings = () => data(client.get("/settings"));
export const updateSettings = (body) => data(client.put("/settings", body));

const crud = (path) => ({
  list: (params) => data(client.get(path, { params })),
  create: (body) => data(client.post(path, body)),
  update: (id, body) => data(client.put(`${path}/${id}`, body)),
  remove: (id) => data(client.delete(`${path}/${id}`)),
});

export const departments = crud("/departments");
export const designations = crud("/designations");
export const leaveTypes = crud("/leave-types");
export const holidays = crud("/holidays");
