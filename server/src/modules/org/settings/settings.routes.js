import { Router } from "express";
import { authenticate } from "../../../middleware/auth.js";
import { requireRole } from "../../../middleware/requireRole.js";
import { validate } from "../../../middleware/validate.js";
import { updateSettingsSchema } from "./settings.schema.js";
import * as controller from "./settings.controller.js";

const router = Router();

router.use(authenticate);
router.get("/", requireRole("admin", "hr"), controller.get);
router.put(
  "/",
  requireRole("admin"),
  validate(updateSettingsSchema),
  controller.update,
);

export default router;
