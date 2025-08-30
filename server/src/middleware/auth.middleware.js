import User from "../models/user.model.js";
import { ErrorHandler } from "./error.middleware.js";
import jwt from "jsonwebtoken";
export const protectRoute = async(req, res, next) => {
  try{
    const token = req.cookies.jwt;
    if(!token){
      return next(new ErrorHandler('Unauthorized - No token provided', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if(!decoded){
      return next(new ErrorHandler('Unauthorized - Invalid token', 401));
    }

    const user = await User.findById(decoded.userId).select("-password");
    if(!user){
      return next(new ErrorHandler('Unauthorized - User not found', 401));
    }

    req.user = user;
    next();
  }
  catch(error){
    console.error("Error in protectRoute middleware: " + error);
    return next(new ErrorHandler('Internal Server Error', 500));
  }
}