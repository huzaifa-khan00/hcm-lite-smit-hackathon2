import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/requireRole.js";
import { validate } from "../../middleware/validate.js";
import { applyLeaveSchema, decisionSchema } from "./leave.schema.js";
import * as controller from "./leave.controller.js";

const router = Router();

router.use(authenticate);

// Anyone with an employee record (employees and HR) manages their own leave.
router.get("/balance", controller.balance);
router.get("/mine", controller.mine);
router.post("/", validate(applyLeaveSchema), controller.apply);
router.patch("/:id/cancel", controller.cancel);

// HR and Admin see every request; the service decides who may approve which.
router.get("/", requireRole("hr", "admin"), controller.list);
router.patch(
  "/:id/decision",
  requireRole("hr", "admin"),
  validate(decisionSchema),
  controller.decide,
);

export default router;
