import { asyncHandler } from "../../utils/asyncHandler.js";
import * as service from "./setup.service.js";

export const status = asyncHandler(async (req, res) => {
  res.json(await service.getStatus());
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json(await service.runSetup(req.body));
});
