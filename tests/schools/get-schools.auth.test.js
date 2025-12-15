import request from "supertest";
import app from "../../src/app.js";
import { seedBasicData } from "../helpers/seed.js";
import { login } from "../helpers/auth.js";

describe("Auth Middleware - GET /schools", () => {
  let superadminToken;

  beforeAll(async () => {
    await seedBasicData();
    superadminToken = await login("super@admin.com");
  });

  it("should return 401 if Authorization header is missing", async () => {
    const res = await request(app).get("/schools");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });

  it("should return 401 if token is invalid", async () => {
    const res = await request(app)
      .get("/schools")
      .set("Authorization", "Bearer invalid_token");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid access token");
  });

  it("should allow access if token is valid", async () => {
    const res = await request(app)
      .get("/schools")
      .set("Authorization", `Bearer ${superadminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
