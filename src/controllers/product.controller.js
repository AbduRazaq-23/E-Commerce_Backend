import { Product } from "../models/product.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

//@dec ---creating Product controller---
const createProduct = asyncHandler(async (req, res) => {
  const { name, category, brand, quantity, description, price } = req.body;
  if (!(name, category, brand, quantity, description, price)) {
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
//@dec ---update Product controller---
const updateProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cloudImage = await uploadOnCloudinary(req.file?.path);

  const updatedProducts = await Product.findByIdAndUpdate(
    productId,
    {
      ...req.body,
      image: cloudImage?.url,
    },
    { new: true }
  );

  return res.json(
    new ApiResponse(200, updatedProducts, "updated successfully")
  );
});
//@dec ---delete Product controller---
const deleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  await Product.findByIdAndDelete(productId);

  return res.json(new ApiResponse(200, "deleted successfully"));
});
//@dec ---get all Products controller---
const getAllProducts = asyncHandler(async (req, res) => {
  const allProduct = await Product.find()
    .populate("category")
    .limit(10)
    .sort({ createdAt: -1 });

  return res.json(
    new ApiResponse(200, allProduct, "all product fetch successfully")
  );
});
//@dec ---get new Products controller---
const getNewProducts = asyncHandler(async (req, res) => {
  const newProduct = await Product.find().sort({ createdAt: -1 }).limit(10);
  return res.json(
    new ApiResponse(200, newProduct, "new product fetch successfully")
  );
});

export {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getNewProducts,
};
