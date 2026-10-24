import { Router } from "express";
import setupRoutes from "./modules/setup/setup.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import settingsRoutes from "./modules/org/settings/settings.routes.js";
import auditRoutes from "./modules/audit/audit.routes.js";
import departmentRoutes from "./modules/org/departments/departments.routes.js";
import designationRoutes from "./modules/org/designations/designations.routes.js";

const router = Router();

router.use("/setup", setupRoutes);
router.use("/auth", authRoutes);
router.use("/settings", settingsRoutes);
router.use("/audit", auditRoutes);
router.use("/departments", departmentRoutes);
router.use("/designations", designationRoutes);

export default router;
