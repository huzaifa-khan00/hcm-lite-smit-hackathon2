import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";

connectDB()
  .then(() =>
    app.listen(env.port, () =>
      console.log(`API on http://localhost:${env.port}`),
    ),
  )
  .catch((err) => {
    console.error("Failed to start:", err.message);
    process.exit(1);
  });
