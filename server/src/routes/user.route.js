import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMyFriends, getRecommendedUsers } from "../controllers/user.controller.js";

const router = express.Router();
router.use(protectRoute);
router.get("/", getRecommendedUsers)
router.get("/", getMyFriends)

export default router;