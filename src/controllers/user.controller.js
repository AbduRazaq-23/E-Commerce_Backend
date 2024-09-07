import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

//********************************************************************************//
//@dec Registration Controller
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!(name, email, password)) {
    throw new ApiError(400, "fill all the field");
  }

  const existedUser = await User.findOne({ email });
  if (existedUser) {
    throw new ApiError(409, "User already exist with email");
  }

  //@dec pick avatar local file path
  const avatarLocalPath = req.file?.path;

  //@dec if not available path throw error
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar localpath required");
  }

  //@dec upload on cloudinary store on variable that path
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  //@dec check if not availabe throw error
  if (!avatar) {
    throw new ApiError(400, "avatar file required");
  }

  //@dec store data on mongodb
  const user = await User.create({
    name,
    avatar: avatar?.url,
    email,
    password,
  });

  //@dec find that store data by id then store that on variable
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //@dec if not find that data throw error
  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registration");
  }

  //@dec return that as json
  return res
    .status(200)
    .json(new ApiResponse(201, "user registered successfully", createdUser));
});

//********************************************************************************//
//@dec LogIn controller
const logInUser = asyncHandler(async (req, res) => {
  //@dec get data from req.body
  const { email, password } = req.body;

  //@dec if not available throw error
  if (!(email, password)) {
    throw new ApiError(400, "fill the field");
  }
  //@dec find email and username on database
  const user = await User.findOne({ email });

  //@dec if not availabe throw error
  if (!user) {
    throw new ApiError(401, "user doesn't exist");
  }

  //@dec then compare password is that valid
  const isPasswordValid = await user.isPasswordCorrect(password);

  //@dec if not valid throw error
  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid Credentials");
  }

  //@dec call a function to generate token by user id
  const token = user.generateToken();
  user.token = token;
  await user.save({ validateBeforeSave: false });

  //@dec then store that data on a variable remove password and refreshToken
  const userLogedIn = await User.findById(user._id).select("-password ");

  //@dec Setting a cookie without options
  const options = {
    httpOnly: false,
  };
  //@dec store token on cookie then send that all in response
  return res.status(200).cookie("token", token, options).json(
    new ApiResponse(
      200,
      userLogedIn,

      "User logged In Successfully"
    )
  );
});

//********************************************************************************//
//@dec LogOut Controller
const logOutUser = asyncHandler(async (req, res) => {
  //@dec find by id and the unset that token.
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        token: 1,
      },
    },
    {
      new: true,
    }
  );

  //@dec Setting a cookie without options
  const options = {
    httpOnly: true,
    secure: true,
  };
  //@dec return that res and clear coookies
  return res
    .status(200)
    .clearCookie("token", options)

    .json(new ApiResponse(200, "user logOut succesfully"));
});

//********************************************************************************//
//@dec change current password
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!(oldPassword, newPassword)) {
    throw new ApiError(400, "fill the field");
  }

  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "invalid old password");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, "Password changed successfully"));
});

//********************************************************************************//
//@dec get current user
const getCurrentUser = asyncHandler((req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "user fetched successfully"));
});
//********************************************************************************//
//@dec update username and email
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  if (!(email, name)) {
    throw new ApiError(400, "fill the field");
  }

  const user = await User.findByIdAndUpdate(
    req?.user._id,

    {
      $set: {
        name,
        email,
      },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated"));
});

//********************************************************************************//
//@dec update avatar
const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  await User.findByIdAndUpdate(
    req.user?._id,

    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "avatar updated successfully"));
});
//@dec getAllUser
const getAllUser = asyncHandler(async (req, res) => {
  const allUser = await User.find();
  if (!allUser) {
    throw new ApiError(404, "user not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, allUser, "get the all users"));
});

//********************************************************************************//
//@dec export the controller
export {
  registerUser,
  logInUser,
  logOutUser,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatar,
  getAllUser,
};
