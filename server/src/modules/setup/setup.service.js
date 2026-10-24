import bcrypt from "bcryptjs";
import { User } from "../auth/user.model.js";
import { Settings } from "../org/settings/settings.model.js";
import { conflict } from "../../utils/httpError.js";

export async function getStatus() {
  const adminExists = await User.exists({ role: "admin" });
  return { setupComplete: Boolean(adminExists) };
}

export async function runSetup({ companyName, name, email, password }) {
  const { setupComplete } = await getStatus();
  if (setupComplete) throw conflict("Setup already completed");

  const passwordHash = await bcrypt.hash(password, 10);
  await Settings.create({ companyName });
  const admin = await User.create({ name, email, passwordHash, role: "admin" });

  return {
    id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  };
}
