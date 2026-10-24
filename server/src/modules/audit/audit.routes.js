import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/requireRole.js";
import * as controller from "./audit.controller.js";

const router = Router();

router.get("/", authenticate, requireRole("admin"), controller.list);

export default router;
