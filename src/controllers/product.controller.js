import { Product } from "../models/product.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

//@dec ---creating Product controller---
const createProduct = asyncHandler(async (req, res) => {
  const { name, brand, quantity, description, price } = req.body;
  if (!(name, brand, quantity, description, price)) {
    throw new ApiError(401, "fill the field");
  }
  const imageLocalPath = req.file?.path;
  if (!imageLocalPath) {
    throw new ApiError(401, "image is required");
  }

  const cloudImage = await uploadOnCloudinary(imageLocalPath);
  if (!cloudImage) {
    throw new ApiError(500, "error while uploading image");
  }

  const createProducts = await Product.create({
    ...req.body,
    image: cloudImage?.url,
  });

  return res.json(new ApiResponse(201, createProducts, "created successfully"));
});

export { createProduct };
