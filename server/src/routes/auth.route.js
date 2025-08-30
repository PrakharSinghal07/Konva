import express from "express";
import { getCurrentUserDetails, loginHandler, logoutHandler, onboardHandler, signUpHandler } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signUpHandler);
router.post("/login", loginHandler);
router.post("/logout", logoutHandler);
router.post("/onboarding", protectRoute, onboardHandler);
router.get("/me", protectRoute, getCurrentUserDetails)
export default router;