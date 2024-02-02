import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { upload } from "../middlewares/multer.middlewares.js";

const registerUser = asyncHandler(async (req, res) => {
  /*
  res.status(200).json({
    message: "ok",
  });
  */

  // Get user Detail from Frontend
  const { username, email, fullName, password } = req.body;
  console.log(username);

  // Check if field is not Empty
  if (
    [username, email, fullName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are Required..!!");
  }

  // Check if Username or Email is exists or not
  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(
      409,
      "User with Email or Username is already Exists..!!"
    );
  }

  // Check for Image  & Check for Avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is Required..!!");
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

export { registerUser };
