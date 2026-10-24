import { asyncHandler } from "../../utils/asyncHandler.js";
import * as service from "./correction.service.js";

const STATUSES = ["pending", "approved", "rejected"];

function listParams(req) {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const status = STATUSES.includes(req.query.status)
    ? req.query.status
    : undefined;
  return { page, limit, status };
}

export const create = asyncHandler(async (req, res) => {
  res.status(201).json(await service.createRequest(req.user, req.body));
});

export const mine = asyncHandler(async (req, res) => {
  res.json(await service.listMine(req.user, listParams(req)));
});

export const list = asyncHandler(async (req, res) => {
  res.json(await service.listAll(listParams(req)));
});

export const decide = asyncHandler(async (req, res) => {
  res.json(await service.decide(req.user, req.params.id, req.body));
});
