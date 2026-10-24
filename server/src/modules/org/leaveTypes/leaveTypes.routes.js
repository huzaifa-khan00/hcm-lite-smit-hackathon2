import { Router } from "express";
import { authenticate } from "../../../middleware/auth.js";
import { requireRole } from "../../../middleware/requireRole.js";
import { validate } from "../../../middleware/validate.js";
import { leaveTypeSchema } from "./leaveTypes.schema.js";
import * as controller from "./leaveTypes.controller.js";

const router = Router();

router.use(authenticate);
router.get("/", requireRole("admin", "hr"), controller.list);
router.post(
  "/",
  requireRole("admin"),
  validate(leaveTypeSchema),
  controller.create,
);
router.put(
  "/:id",
  requireRole("admin"),
  validate(leaveTypeSchema),
  controller.update,
);
router.delete("/:id", requireRole("admin"), controller.remove);

export default router;
