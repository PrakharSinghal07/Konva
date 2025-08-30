import { upsertStreamUser } from "../lib/stream.js";
import { generateToken } from "../lib/utils.js";
import { ErrorHandler } from "../middleware/error.middleware.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs"
export const signUpHandler = async (req, res, next) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return next(new ErrorHandler('All fields are required', 400));
    }
    if (password.length < 6) {
      return next(new ErrorHandler('Password must be atleast 6 characters', 400));
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return next(new ErrorHandler('Invalid email format', 400));
    }
    const user = await User.findOne({ email });
    if (user) {
      return next(new ErrorHandler('Email already exists', 400));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassoword = await bcrypt.hash(password, salt);
    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}`
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassoword,
      profilePic: randomAvatar,
    })
    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePic || "",
      })
      console.log(`Stream user created for ${newUser._id}`);
    }
    catch (error) {
      console.error("Error creating stream user", error);
    }
    if (!newUser) {
      return next(new ErrorHandler('Invalid user data', 400));
    }

    const token = generateToken(newUser._id, res);

    res.status(201).json({
      status: "success",
      message: "User created successfully",
      data: {
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      }
    });

  }
  catch (err) {
    console.log("Error in signup controller: " + err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const loginHandler = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return next(new ErrorHandler('All fields are required', 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorHandler('Invalid credentials', 400));
    }

    const isPassowordCorrect = await bcrypt.compare(password, user.password);
    if (!isPassowordCorrect) {
      return next(new ErrorHandler('Invalid credentials', 400));
    }

    generateToken(user._id, res);

    res.status(200).json({
      status: "success",
      message: "User login successfull",
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
      }
    })
  }
  catch (err) {
    console.log("Error in login controller: " + err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const logoutHandler = async (req, res, next) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    })
  }
  catch (err) {
    console.log("Error in logout controller: " + err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

export const onboardHandler = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { fullName, bio, nativeLanguage, learningLanguage, location } = req.body;

    if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
      const message = "All fields are required";
      const missingFields = [
        !fullName && "Full Name",
        !bio && "Bio",
        !nativeLanguage && "Native Language",
        !learningLanguage && "Learning Language",
        !location && "location",
      ].filter(Boolean);

      return res.status(400).json({
        success: "false",
        message,
        missingFields,
      });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, {
      ...req.body,
      isOnboarded: true,
    }, { new: true });

    if (!updatedUser) {
      return next(new ErrorHandler('User not found', 404));
    }

    await upsertStreamUser({
      id: updatedUser._id.toString(),
      name: updatedUser.fullName,
      image: updatedUser.profilePic || "",
    })

    res.status(200).json({
      success: true,
      message: "User details registered successfully",
      data: {
        user: updatedUser,
      },
    })
  }

  catch (error) {
    console.log(error)
  }
}


export const getCurrentUserDetails = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user
    }
  })
}