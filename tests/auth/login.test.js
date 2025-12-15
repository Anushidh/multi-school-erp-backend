import request from "supertest";
import app from "../../src/app.js";
import { seedBasicData } from "../helpers/seed.js";

describe("Auth - Login", () => {
  beforeAll(async () => {
    await seedBasicData();
  });

  it("should login successfully with valid credentials", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({
        email: "admin@schoola.com",
        password: "password123",
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
    expect(typeof res.body.accessToken).toBe("string");
  });

  it("should fail with wrong password", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({
        email: "admin@schoola.com",
        password: "wrongpassword",
      });

    expect(res.status).toBe(401);
  });

  it("should fail if email is missing", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({
        password: "password123",
      });

    expect(res.status).toBe(400);
  });
});
