import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.token || req.headers("Authorization")?.replace("Bearer", "");

    if (!token) {
      throw new ApiError(401, "unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);

    const user = await User.findByid(decodedToken?._id).select(
      "-password -token"
    );

    if (!user) {
      throw new ApiError(401, "invalid token");
    }

    user.token = user;
    next();
  } catch (error) {
    throw new ApiError(401, "invalid token");
  }
});
