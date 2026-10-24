import { asyncHandler } from "../../utils/asyncHandler.js";
import * as service from "./attendance.service.js";

export const checkIn = asyncHandler(async (req, res) => {
  res.status(201).json(await service.checkIn(req.user, req.body.location));
});

export const checkOut = asyncHandler(async (req, res) => {
  res.json(await service.checkOut(req.user));
});

export const today = asyncHandler(async (req, res) => {
  res.json(await service.today(req.user));
});

export const myMonth = asyncHandler(async (req, res) => {
  res.json(await service.myMonth(req.user, req.query.month));
});

export const board = asyncHandler(async (req, res) => {
  res.json(await service.board(req.query.date));
});
