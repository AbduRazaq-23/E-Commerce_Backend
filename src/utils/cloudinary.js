import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env._NAME,
  api_key: process.env._KEY,
  api_secret: process.env._SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    fs.unlinkSync(localFilePath); // Delete local file after successful upload
    return response;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath); // Ensure the file exists before deleting
    }
    return null;
  }
};

export { uploadOnCloudinary };
