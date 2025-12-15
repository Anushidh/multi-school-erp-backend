// import dotenv from "dotenv";
// dotenv.config({ path: ".env.test" });

import sequelize from "../../src/config/db.js";

beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync({ force: true }); // clean DB every run
});

afterAll(async () => {
  await sequelize.close();
});
