import { asyncHandler } from "../../../utils/asyncHandler.js";
import * as service from "./holidays.service.js";

export const list = asyncHandler(async (req, res) => {
  res.json(await service.list(req.query.year));
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json(await service.create(req.user, req.body));
});

export const update = asyncHandler(async (req, res) => {
  res.json(await service.update(req.user, req.params.id, req.body));
});

export const remove = asyncHandler(async (req, res) => {
  await service.remove(req.user, req.params.id);
  res.json({ message: "Holiday deleted" });
});
