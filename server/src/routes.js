import { Router } from "express";
import setupRoutes from "./modules/setup/setup.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import settingsRoutes from "./modules/org/settings/settings.routes.js";
import auditRoutes from "./modules/audit/audit.routes.js";

const router = Router();

router.use("/setup", setupRoutes);
router.use("/auth", authRoutes);
router.use("/settings", settingsRoutes);
router.use("/audit", auditRoutes);

export default router;
