import express from "express";
import dotenv from "dotenv";
import authRoute from "./src/routes/auth.route.js"
import userRoute from "./src/routes/user.route.js"
import { connectDB } from "./src/lib/db.js";
import { errorMiddleware } from "./src/middleware/error.middleware.js";
import cookieParser from "cookie-parser";
dotenv.config();
const app = express();
connectDB();

app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);

app.listen(process.env.PORT, () => {
  console.log(`Server started on PORT ${process.env.PORT}`)
  
})

app.use(errorMiddleware);