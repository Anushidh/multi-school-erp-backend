import request from "supertest";
import app from "../../src/app.js";
import { seedBasicData } from "../helpers/seed.js";
import { login } from "../helpers/auth.js";

describe("Authorization - List users by school", () => {
  let superadminToken;
  let adminAToken;
  let userBToken;
  let schoolA;
  let schoolB;

  beforeAll(async () => {
    const seeded = await seedBasicData();
    schoolA = seeded.schoolA;
    schoolB = seeded.schoolB;

    superadminToken = await login("super@admin.com");
    adminAToken = await login("admin@schoola.com");
    userBToken = await login("user@schoolb.com");
  });

  it("should allow admin to list users of their own school", async () => {
    const res = await request(app)
      .get(`/schools/${schoolA.id}/users`)
      .set("Authorization", `Bearer ${adminAToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should block admin from listing users of another school", async () => {
    const res = await request(app)
      .get(`/schools/${schoolB.id}/users`)
      .set("Authorization", `Bearer ${adminAToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Cross-school access denied");
  });

  it("should block normal user from listing users of any school", async () => {
    const res = await request(app)
      .get(`/schools/${schoolB.id}/users`)
      .set("Authorization", `Bearer ${userBToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Not allowed");
  });

  it("should allow superadmin to list users of any school", async () => {
    const res = await request(app)
      .get(`/schools/${schoolB.id}/users`)
      .set("Authorization", `Bearer ${superadminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should return 401 if Authorization header is missing", async () => {
    const res = await request(app).get(`/schools/${schoolA.id}/users`);

    expect(res.status).toBe(401);
  });
});
