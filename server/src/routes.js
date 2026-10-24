import { Router } from "express";
import setupRoutes from "./modules/setup/setup.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";

const router = Router();

router.use("/setup", setupRoutes);
router.use("/auth", authRoutes);

export default router;
