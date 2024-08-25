import { Schema, mongo } from "mongoose";

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

export const Category = mongoose.model("Category", categorySchema);
