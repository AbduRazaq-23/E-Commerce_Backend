import { Product } from "../models/product.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

//@dec ---creating Product controller---
const createProduct = asyncHandler(async (req, res) => {
  const { name, category, brand, quantity, description, price, countInStock } =
    req.body;
  if (!(name, category, brand, quantity, description, price, countInStock)) {
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

  const updatedProducts = await Product.findByIdAndUpdate(
    productId,
    {
      ...req.body,
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
//@dec ---get Products by search controller---
const getProductsBySearch = asyncHandler(async (req, res) => {
  const findKeyword = await Product.find({
    name: {
      $regex: req.query.keyword,
      $options: "i",
    },
  }).limit(10);
  if (!findKeyword) {
    return res.status(404).json(new ApiResponse(404, "not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, findKeyword, "matched product"));
});
//@dec ---addProductReview controller---
const addProductReview = asyncHandler(async (req, res) => {
  const { rating } = req.body;
  const { productId } = req.params;
  const userId = req.user?._id;

  // Aggregation pipeline to find the product and check if the user has already reviewed it
  const product = await Product.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(productId) } },
    {
      $project: {
        reviews: 1,
        alreadyReviewed: {
          $in: [new mongoose.Types.ObjectId(userId), "$reviews.user"],
        },
      },
    },
  ]);
  if (!product.length) {
    return res.status(404).json({ message: "Product not found" });
  }
  if (product[0].alreadyReviewed) {
    return res.status(400).json({ message: "Product already reviewed" });
  }

  // Proceed to add the review
  const review = {
    name: req.user?.name,
    rating: Number(rating),
    user: userId,
  };

  // Push the new review to the reviews array
  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    {
      $push: { reviews: review },
      $inc: { numReviews: 1 },
    },
    { new: true }
  );

  // Recalculate the average rating using the aggregation pipeline
  const [ratingData] = await Product.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(productId) } },
    { $unwind: "$reviews" },
    {
      $group: {
        _id: "$_id",
        averageRating: { $avg: "$reviews.rating" },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  // Update the product's rating
  updatedProduct.rating = ratingData.averageRating;
  updatedProduct.numReviews = ratingData.numReviews;
  await updatedProduct.save();

  res.status(201).json(new ApiResponse(201, "Review added"));
});
//@dec ---addCommentToProducts controller---
const addCommentToProducts = asyncHandler(async (req, res) => {
  const { comment } = req.body;
  const { productId } = req.params;
  const userId = req.user?._id;

  // Proceed to add the review
  const comments = {
    name: req.user?.name,
    comment,
    user: userId,
  };

  // Push the new review to the reviews array
  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    {
      $push: { comments },
      $inc: { numComments: 1 },
    },
    { new: true }
  );

  res.status(201).json(new ApiResponse(201, updatedProduct, "comment added"));
});
//@dec ---getProductById controller---
const getProductById = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const getProduct = await Product.findById(productId);

  res.status(200).json(new ApiResponse(200, getProduct, "comment added"));
});

export {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getNewProducts,
  getProductsBySearch,
  addProductReview,
  addCommentToProducts,
  getProductById,
};
