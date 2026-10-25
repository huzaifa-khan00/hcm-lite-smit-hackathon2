import client from "./client.js";

const data = (p) => p.then((r) => r.data);

export const getAnnouncements = () => data(client.get("/announcements"));
export const createAnnouncement = (body) =>
  data(client.post("/announcements", body));
export const deleteAnnouncement = (id) =>
  data(client.delete(`/announcements/${id}`));
