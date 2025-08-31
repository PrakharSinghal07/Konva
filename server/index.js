import express from "express";
import dotenv from "dotenv";
import authRoute from "./src/routes/auth.route.js"
import userRoute from "./src/routes/user.route.js"
import chatRoutes from "./src/routes/chat.route.js";
import { connectDB } from "./src/lib/db.js";
import { errorMiddleware } from "./src/middleware/error.middleware.js";
import cookieParser from "cookie-parser";
import cors from "cors";
dotenv.config();
const app = express();
connectDB();
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use("/api/chat", chatRoutes);
app.listen(process.env.PORT, () => {
  console.log(`Server started on PORT ${process.env.PORT}`)
  
})

app.use(errorMiddleware);