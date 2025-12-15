import request from "supertest";
import app from "../../src/app.js";
import  sequelize  from "../../src/config/db.js";
import { seedBasicData } from "../helpers/seed.js";
import { generateToken } from "../helpers/token.js";

describe("Student Permissions - POST /schools/:schoolId/students", () => {
  let users;
  let school1;
  let school2;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    const seed = await seedBasicData();

    superadmin = seed.superadmin;
    adminA = seed.adminA;
    userB = seed.userB;

    school1 = seed.schoolA;
    school2 = seed.schoolB;
  });

  const payload = {
    name: "John Student",
    dob: "2015-01-01",
  };

  it("should deny normal user (no edit permission)", async () => {
    const token = generateToken(userB);

    const res = await request(app)
      .post(`/schools/${school1.id}/students`)
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    expect(res.status).toBe(403);
    + expect(res.body.message).toBe("Cross-school access denied");
  });

  it("should allow admin with canEditStudents in same school", async () => {
    const token = generateToken(adminA);

    const res = await request(app)
      .post(`/schools/${school1.id}/students`)
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(Number(res.body.schoolId)).toBe(school1.id);
  });

  it("should deny admin with edit permission for another school", async () => {
    const token = generateToken(adminA);

    const res = await request(app)
      .post(`/schools/${school2.id}/students`)
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Cross-school access denied");
  });

  it("should allow superadmin to create student in any school", async () => {
    const token = generateToken(superadmin);

    const res = await request(app)
      .post(`/schools/${school2.id}/students`)
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    expect(res.status).toBe(201);
  });
});
