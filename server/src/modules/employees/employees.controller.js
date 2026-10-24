import { asyncHandler } from "../../utils/asyncHandler.js";
import * as service from "./employees.service.js";

export const list = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const { search, department, status } = req.query;
  res.json(await service.list({ page, limit, search, department, status }));
});

export const getOne = asyncHandler(async (req, res) => {
  res.json(await service.getOne(req.params.id));
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json(await service.create(req.user, req.body));
});

export const update = asyncHandler(async (req, res) => {
  res.json(await service.update(req.user, req.params.id, req.body));
});

export const setStatus = asyncHandler(async (req, res) => {
  res.json(await service.setStatus(req.user, req.params.id, req.body.isActive));
});
