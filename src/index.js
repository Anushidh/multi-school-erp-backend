// import dotenv from "dotenv";
// dotenv.config();


import app from "./app.js";
import { sequelize } from "./models/index.js";
import { seedSuperAdmin } from "./seed/seedSuperAdmin.js";

const PORT = process.env.PORT || 3000;
console.log(process.env.PORT);

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
    process.exit(1);
  }
})();
