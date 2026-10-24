import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/requireRole.js";
import { validate } from "../../middleware/validate.js";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  statusSchema,
} from "./employees.schema.js";
import * as controller from "./employees.controller.js";

const router = Router();

router.use(authenticate, requireRole("admin", "hr"));
router.get("/", controller.list);
router.get("/:id", controller.getOne);
router.post("/", validate(createEmployeeSchema), controller.create);
router.put("/:id", validate(updateEmployeeSchema), controller.update);
router.patch("/:id/status", validate(statusSchema), controller.setStatus);

export default router;
