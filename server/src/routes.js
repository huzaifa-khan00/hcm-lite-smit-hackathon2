import { Router } from "express";
import setupRoutes from "./modules/setup/setup.routes.js";

const router = Router();

router.use("/setup", setupRoutes);

export default router;
