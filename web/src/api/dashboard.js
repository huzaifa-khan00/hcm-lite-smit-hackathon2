import client from "./client.js";

const data = (p) => p.then((r) => r.data);

export const getDashboardStats = () => data(client.get("/dashboard/stats"));
