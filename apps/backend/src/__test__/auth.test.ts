import request from "supertest";
import app from "../app";
import { sequelize } from "../config/db";
import User from "../models/user";

describe("Authentication API", () => {
  let expect: Chai.ExpectStatic;
  before(async () => {
    const chai = await import('chai');
    expect = chai.expect;
    await sequelize.sync({ force: true }); // Recreate the database schema
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const res = await request(app).post("/api/auth/register").send({
        username: "testuser",
        password: "testpassword",
      });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property("success", true);
      expect(res.body.data).to.have.property("id");
      expect(res.body.data).to.have.property("username", "testuser");
      expect(res.body.data).to.have.property("token");
    });

    it("should not register a user with an existing username", async () => {
      await request(app).post("/api/auth/register").send({
        username: "testuser",
        password: "testpassword",
      });

      const res = await request(app).post("/api/auth/register").send({
        username: "testuser",
        password: "anotherpassword",
      });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("success", false);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login an existing user", async () => {
      await User.create({
        username: "loginuser",
        password: "loginpassword",
      });

      const res = await request(app).post("/api/auth/login").send({
        username: "loginuser",
        password: "loginpassword",
      });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("success", true);
      expect(res.body.data).to.have.property("id");
      expect(res.body.data).to.have.property("username", "loginuser");
      expect(res.body.data).to.have.property("token");
    });

    it("should not login with incorrect credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        username: "loginuser",
        password: "wrongpassword",
      });

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property("success", false);
    });
  });

  describe("POST /api/auth/logout", () => {
    let token: string;

    before(async () => {
      const res = await request(app).post("/api/auth/login").send({
        username: "loginuser",
        password: "loginpassword",
      });

      token = res.body.data.token;
    });

    it("should logout an authenticated user", async () => {
      const res = await request(app)
        .post("/api/auth/logout")
        .set("Cookie", `token=${token}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("success", true);
    });

    it("should not access protected route after logout", async () => {
      const res = await request(app)
        .get("/api/protected-route") // Replace with an actual protected route
        .set("Cookie", `token=${token}`);

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property("success", false);
    });
  });
});
