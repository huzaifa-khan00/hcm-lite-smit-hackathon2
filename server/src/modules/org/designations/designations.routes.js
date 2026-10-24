import { Router } from "express";
import { authenticate } from "../../../middleware/auth.js";
import { requireRole } from "../../../middleware/requireRole.js";
import { validate } from "../../../middleware/validate.js";
import { designationSchema } from "./designations.schema.js";
import * as controller from "./designations.controller.js";

const router = Router();

router.use(authenticate);
router.get("/", requireRole("admin", "hr"), controller.list);
router.post(
  "/",
  requireRole("admin"),
  validate(designationSchema),
  controller.create,
);
router.put(
  "/:id",
  requireRole("admin"),
  validate(designationSchema),
  controller.update,
);
router.delete("/:id", requireRole("admin"), controller.remove);

export default router;
