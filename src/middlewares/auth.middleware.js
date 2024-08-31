import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies.token || req.header("Authorization")?.replace("Bearer", "");

    if (!token) {
      throw new ApiError(401, "unauthorized request");
    }
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -token"
    );

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid token");
  }
});

//@dec ---is admin middleware---
const isAdmin = asyncHandler((req, res, next) => {
  console.log(req.user);
  req.user && req.user.isAdmin === true
    ? next()
    : res.status(401).json("not authorized as admin");
});

export { verifyJWT, isAdmin };
