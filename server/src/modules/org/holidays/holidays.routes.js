import { Router } from "express";
import { authenticate } from "../../../middleware/auth.js";
import { requireRole } from "../../../middleware/requireRole.js";
import { validate } from "../../../middleware/validate.js";
import { holidaySchema } from "./holidays.schema.js";
import * as controller from "./holidays.controller.js";

const router = Router();

router.use(authenticate);
router.get("/", requireRole("admin", "hr"), controller.list);
router.post(
  "/",
  requireRole("admin"),
  validate(holidaySchema),
  controller.create,
);
router.put(
  "/:id",
  requireRole("admin"),
  validate(holidaySchema),
  controller.update,
);
router.delete("/:id", requireRole("admin"), controller.remove);

export default router;
