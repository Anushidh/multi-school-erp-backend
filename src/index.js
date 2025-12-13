import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cookieParser from "cookie-parser";
import { sequelize } from "./models/index.js";
import authRoutes from "./routes/auth.routes.js";
import schoolRoutes from "./routes/school.routes.js";
import userRoutes from "./routes/user.routes.js";
import studentRoutes from "./routes/student.routes.js";
import { seedSuperAdmin } from "./seed/seedSuperAdmin.js";
import errorHandler from './middlewares/error.middleware.js'

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/schools", schoolRoutes);
app.use("/", userRoutes);
app.use("/", studentRoutes);

app.use(errorHandler);

(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("Database connected");
    await seedSuperAdmin();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Unable to start server:", err);
  }
})();
