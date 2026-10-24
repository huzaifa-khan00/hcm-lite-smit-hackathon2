import { asyncHandler } from "../../utils/asyncHandler.js";
import * as service from "./auth.service.js";

export const login = asyncHandler(async (req, res) => {
  res.json(await service.login(req.body));
});

export const me = asyncHandler(async (req, res) => {
  res.json(await service.getMe(req.user.id));
});

export const changePassword = asyncHandler(async (req, res) => {
  await service.changePassword(req.user.id, req.body);
  res.json({ message: "Password changed" });
});
