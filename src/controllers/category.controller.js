import { Category } from "../models/category.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

//@dec ---createCategory controller---
const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new ApiError(401, "name is required");
  }

  const ifAvailable = await Category.aggregate([
    {
      $match: { name: name },
    },
  ]);

  if (ifAvailable.length > 0) {
    return res.json(new ApiResponse(401, {}, "already available"));
  }

  const create = await Category.create({ name });

  return res
    .status(201)
    .json(new ApiResponse(201, create, "created successfuly"));
});

//@dec ---updateCategory controller---
const updateCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const { categoryId } = req.params;

  const categoryUpdate = await Category.findByIdAndUpdate(
    categoryId,
    {
      name,
    },
    { new: true }
  );

  if (!categoryUpdate) {
    throw new ApiError(500, "failled to update");
  }
  return res
    .status(201)
    .json(
      new ApiResponse(201, categoryUpdate, "category updated successfully")
    );
});
//@dec ---updateCategory controller---
const deleteCategroy = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  await Category.findByIdAndDelete(categoryId);

  const updatedCategory = await Category.find();
  return res
    .status(200)
    .json(new ApiResponse(200, updatedCategory, "deleted successfully"));
});
//@dec ---listOfCategroy controller---
const listOfCategroy = asyncHandler(async (req, res) => {
  const allCategory = await Category.find();

  if (!allCategory) {
    throw new ApiError(500, "category not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, allCategory, "list of category"));
});

export { createCategory, updateCategory, deleteCategroy, listOfCategroy };
