import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/requireRole.js";
import { validate } from "../../middleware/validate.js";
import { createCorrectionSchema, decisionSchema } from "./correction.schema.js";
import * as controller from "./correction.controller.js";

const router = Router();

router.use(authenticate);

// Any user with an employee record (employees and HR) can ask for a fix.
router.post("/", validate(createCorrectionSchema), controller.create);
router.get("/mine", controller.mine);

// HR and Admin review requests.
router.get("/", requireRole("hr", "admin"), controller.list);
router.patch(
  "/:id/decision",
  requireRole("hr", "admin"),
  validate(decisionSchema),
  controller.decide,
);

export default router;
