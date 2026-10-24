import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { setupSchema } from "./setup.schema.js";
import * as controller from "./setup.controller.js";

const router = Router();

router.get("/status", controller.status);
router.post("/", validate(setupSchema), controller.create);

export default router;
