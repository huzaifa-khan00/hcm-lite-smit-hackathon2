import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/requireRole.js";
import { validate } from "../../middleware/validate.js";
import { checkSchema } from "./attendance.schema.js";
import * as controller from "./attendance.controller.js";

const router = Router();

router.use(authenticate);
router.post("/check-in", validate(checkSchema), controller.checkIn);
router.post("/check-out", validate(checkSchema), controller.checkOut);
router.get("/today", controller.today);
router.get("/me", controller.myMonth);
router.get("/board", requireRole("admin", "hr"), controller.board);

export default router;
