import { Router } from "express";
import setupRoutes from "./modules/setup/setup.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import settingsRoutes from "./modules/org/settings/settings.routes.js";
import auditRoutes from "./modules/audit/audit.routes.js";
import departmentRoutes from "./modules/org/departments/departments.routes.js";
import designationRoutes from "./modules/org/designations/designations.routes.js";
import leaveTypeRoutes from "./modules/org/leaveTypes/leaveTypes.routes.js";
import holidayRoutes from "./modules/org/holidays/holidays.routes.js";
import employeeRoutes from "./modules/employees/employees.routes.js";
import attendanceRoutes from "./modules/attendance/attendance.routes.js";
import correctionRoutes from "./modules/attendance/correction.routes.js";

const router = Router();

router.use("/setup", setupRoutes);
router.use("/auth", authRoutes);
router.use("/settings", settingsRoutes);
router.use("/audit", auditRoutes);
router.use("/departments", departmentRoutes);
router.use("/designations", designationRoutes);
router.use("/leave-types", leaveTypeRoutes);
router.use("/holidays", holidayRoutes);
router.use("/employees", employeeRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/corrections", correctionRoutes);

export default router;
