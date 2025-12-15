import request from "supertest";
import app from "../../src/app.js";

export const login = async (email, password = "password123") => {
  const res = await request(app)
    .post("/auth/login")
    .send({ email, password });

  return res.body.accessToken;
};
