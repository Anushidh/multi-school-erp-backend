import { jest } from "@jest/globals";

jest.unstable_mockModule("../../src/services/email.service.js", () => ({
  sendUserPassword: jest.fn(),
}));

const request = (await import("supertest")).default;
const app = (await import("../../src/app.js")).default;
const { seedBasicData } = await import("../helpers/seed.js");
const { login } = await import("../helpers/auth.js");
const { User } = await import("../../src/models/index.js");
const { sendUserPassword } = await import(
  "../../src/services/email.service.js"
);

describe("User Creation - POST /schools/:schoolId/users", () => {
  let superadminToken;
  let adminToken;
  let userToken;
  let schoolA;
  let schoolB;

  beforeAll(async () => {
    const seeded = await seedBasicData();
    schoolA = seeded.schoolA;
    schoolB = seeded.schoolB;

    superadminToken = await login("super@admin.com");
    adminToken = await login("admin@schoola.com");
    userToken = await login("user@schoolb.com");
  });

  const userPayload = {
    name: "New User",
    email: "newuser@schoola.com",
    phone: "6666666666",
    role: "user",
    canEditStudents: false,
  };

  it("should block normal user from creating users", async () => {
    const res = await request(app)
      .post(`/schools/${schoolA.id}/users`)
      .set("Authorization", `Bearer ${userToken}`)
      .send(userPayload);

    expect(res.status).toBe(403);
  });

  it("should allow admin to create user in same school", async () => {
    const res = await request(app)
      .post(`/schools/${schoolA.id}/users`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send(userPayload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.email).toBe(userPayload.email);

    expect(sendUserPassword).toHaveBeenCalledTimes(1);
  });

  it("should prevent admin from creating another admin", async () => {
    const res = await request(app)
      .post(`/schools/${schoolA.id}/users`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ ...userPayload, role: "admin" });

    expect(res.status).toBe(403);
  });

  it("should prevent admin from creating user in another school", async () => {
    const res = await request(app)
      .post(`/schools/${schoolB.id}/users`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send(userPayload);

    expect(res.status).toBe(403);
  });

  it("should allow superadmin to create user in any school", async () => {
    const res = await request(app)
      .post(`/schools/${schoolB.id}/users`)
      .set("Authorization", `Bearer ${superadminToken}`)
      .send({
        ...userPayload,
        email: "supercreated@schoolb.com",
      });

    expect(res.status).toBe(201);
  });

  it("should store hashed password and require password change", async () => {
    const user = await User.findOne({
      where: { email: userPayload.email },
    });

    expect(user).toBeTruthy();
    expect(user.password_hash).toBeTruthy();
    expect(user.mustChangePassword).toBe(true);
  });

//   it("should send password email", async () => {
//     expect(sendUserPassword).toHaveBeenCalled();
//   });
});
