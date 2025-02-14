const request = require("supertest");
const app = require("../../app");
const { sequelizeInstance, HealthStatus } = require("../../models");
 
describe("Healthcheck API Integration Tests", () => {
  beforeAll(async () => {
    await sequelizeInstance.sync({});
  });
 
  afterAll(async () => {
    await sequelizeInstance.close();
  });
 
  beforeEach(async () => {
    await HealthStatus.destroy({ truncate: true });
  });
 
  describe("GET /healthz", () => {
    it("should return 200 for a valid request", async () => {
      const response = await request(app)
        .get("/healthz")
        // .set("Accept", "application/json");
 
      expect(response.status).toBe(200);
 
      // Verify database entry
      const healthChecks = await HealthStatus.findAll();
      expect(healthChecks).toHaveLength(1);
    });
 
    it("should return 400 when query parameters are present", async () => {
      const response = await request(app)
        .get("/healthz?param=value")
        .set("Accept", "application/json");
 
      expect(response.status).toBe(400);
    });
 
    it("should return 400 when custom headers are present", async () => {
      const response = await request(app)
        .get("/healthz")
        .set("Custom-Header", "value")
        .set("Accept", "application/json");
 
      expect(response.status).toBe(400);
    });
 
    it("should return 400 when body is present", async () => {
      const response = await request(app)
        .get("/healthz")
        .send({ data: "value" })
        .set("Accept", "application/json");
 
      expect(response.status).toBe(400);
    });
  });
 
  describe("Other HTTP Methods /healthz", () => {
    it("should return 405 for POST request", async () => {
      const response = await request(app)
        .post("/healthz")
        .set("Accept", "application/json");
 
      expect(response.status).toBe(405);
    });
 
    it("should return 405 for PUT request", async () => {
      const response = await request(app)
        .put("/healthz")
        .set("Accept", "application/json");
 
      expect(response.status).toBe(405);
    });
 
    it("should return 405 for DELETE request", async () => {
      const response = await request(app)
        .delete("/healthz")
        .set("Accept", "application/json");
 
      expect(response.status).toBe(405);
    });
  });
 
  describe("Common Headers", () => {
    it("should include required headers in response", async () => {
      const response = await request(app)
        .get("/healthz")
        .set("Accept", "application/json");
 
      expect(response.headers["cache-control"]).toBe(
        "no-cache, no-store, must-revalidate"
      );
      expect(response.headers["pragma"]).toBe("no-cache");
      expect(response.headers["x-content-type-options"]).toBe("nosniff");
    });
  });
});