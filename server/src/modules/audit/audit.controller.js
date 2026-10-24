import { asyncHandler } from "../../utils/asyncHandler.js";
import * as service from "./audit.service.js";

export const list = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  res.json(
    await service.list({
      page,
      limit,
      entity: req.query.entity,
      action: req.query.action,
    }),
  );
});
