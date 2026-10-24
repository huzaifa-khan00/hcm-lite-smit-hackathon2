import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/auth.js";
import { loginSchema, changePasswordSchema } from "./auth.schema.js";
import * as controller from "./auth.controller.js";

const router = Router();

router.post("/login", validate(loginSchema), controller.login);
router.get("/me", authenticate, controller.me);
router.post(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  controller.changePassword,
);

export default router;
