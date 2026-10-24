import "dotenv/config";

for (const key of ["MONGO_URI", "JWT_SECRET"]) {
  if (!process.env[key]) throw new Error(`Missing env variable: ${key}`);
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  adminEmail: process.env.ADMIN_EMAIL || "",
  adminPassword: process.env.ADMIN_PASSWORD || "",
  ai: {
    provider: process.env.AI_PROVIDER || "groq",
    key: process.env.AI_API_KEY || "",
    model: process.env.AI_MODEL || "",
  },
};
