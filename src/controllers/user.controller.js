import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from "fs";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findOne(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while Generating Refresh & Access Token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  /*
  res.status(200).json({
    message: "ok",
  });
  */

  // Get user Detail from Frontend
  const { username, email, fullName, password } = req.body;

  // Check if field is not Empty
  if (
    [username, email, fullName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are Required..!!");
  }

  // Check for Image  & Check for Avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is Required..!!");
  }

  // Check if Username or Email is exists or not
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    // Delete (Avatar & coverImage) file if user Exists
    fs.unlinkSync(avatarLocalPath);
    fs.unlinkSync(coverImageLocalPath);
    throw new ApiError(
      409,
      "User with Email or Username is already Exists..!!"
    );
  }

  // Upload on Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(
      400,
      "Avatar file is Required..( At the time of Upload on Cloudinary )!!"
    );
  }

  // Create user Object & Create Data Entry of User
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    password,
    email,
    username: username.toLowerCase(),
  });

  // Remove Password and Remove RefreshToken for Safety Reason
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while Registering the User");
  }

  // Return Success Flag
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered Successfully.."));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email) {
    throw new ApiError(400, "Username or Email is Required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(400, "User dose not exists");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Password Credential");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findOne(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .send(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User Logged in Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(200, {}, "User Logout SuccessFully");
});

export { registerUser, loginUser, logoutUser };
