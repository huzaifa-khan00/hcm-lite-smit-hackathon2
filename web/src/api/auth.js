import client from "./client.js";

export const getSetupStatus = async () =>
  (await client.get("/setup/status")).data;
export const runSetup = async (payload) =>
  (await client.post("/setup", payload)).data;
export const login = async (email, password) =>
  (await client.post("/auth/login", { email, password })).data;
export const getMe = async () => (await client.get("/auth/me")).data;
export const changePassword = async (payload) =>
  (await client.post("/auth/change-password", payload)).data;
