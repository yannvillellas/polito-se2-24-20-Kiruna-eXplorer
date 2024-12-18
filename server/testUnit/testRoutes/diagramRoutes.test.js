import request from 'supertest';
import app from '../../server.mjs';
import { listPositions } from '../../src/dao/positionDAO.mjs';
import { isUrbanPlanner } from '../../middleware.mjs';
import { validationResult } from 'express-validator';
import { getTraslatedNodes, updateNodeTraslation, addNodeTraslation } from '../../src/dao/diagramDAO.mjs';

jest.mock('../../src/dao/diagramDAO.mjs');
jest.mock("../../middleware.mjs");

jest.mock('express-validator', () => ({
  ...jest.requireActual('express-validator'),
  validationResult: jest.fn(),
}));


// Test della GET /api/diagram/nodes
describe("GET /api/diagram/nodes", () => {
    isUrbanPlanner.mockImplementation((req, res, next) => {
        req.isAuthenticated = jest.fn(() => true);
        req.user = { role: 'urbanPlanner' };
        return next();
      });
  it("should return positions and status 200", async () => {
    const mockPositions = [{ id: 1, x: 100, y: 200 }];
    getTraslatedNodes.mockResolvedValue(mockPositions);

    const response = await request(app).get("/api/diagram/nodes");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockPositions);
    expect(getTraslatedNodes).toHaveBeenCalled();
  });

  it("should return 500 on error", async () => {
    getTraslatedNodes.mockRejectedValue(new Error("Database error"));

    const response = await request(app).get("/api/diagram/nodes");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Database error" });
    expect(getTraslatedNodes).toHaveBeenCalled();
  });
});

// Test della POST /api/diagram/nodes
describe("POST /api/diagram/nodes", () => {
  it("should save node translation and return status 200", async () => {
    addNodeTraslation.mockResolvedValue();

    const newNode = { id: 2, x: 150, y: 250 };
    const response = await request(app)
      .post("/api/diagram/nodes")
      .send(newNode);

    expect(response.status).toBe(200);
    expect(addNodeTraslation).toHaveBeenCalledWith(newNode);
  });

  it("should return 500 on error", async () => {
    addNodeTraslation.mockRejectedValue(new Error("Save error"));

    const response = await request(app)
      .post("/api/diagram/nodes")
      .send({ id: 3, x: 300, y: 400 });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Error saving nodes positions" });
    expect(addNodeTraslation).toHaveBeenCalled();
  });
});

// Test della PUT /api/diagram/nodes
describe("PUT /api/diagram/nodes", () => {
  it("should update node translation and return status 200", async () => {
    updateNodeTraslation.mockResolvedValue();

    const updatedNode = { id: 1, x: 200, y: 300 };
    const response = await request(app)
      .put("/api/diagram/nodes")
      .send(updatedNode);

    expect(response.status).toBe(200);
    expect(updateNodeTraslation).toHaveBeenCalledWith(updatedNode);
  });

  it("should return 500 on error", async () => {
    updateNodeTraslation.mockRejectedValue(new Error("Update error"));

    const response = await request(app)
      .put("/api/diagram/nodes")
      .send({ id: 2, x: 250, y: 350 });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Error updating node position" });
    expect(updateNodeTraslation).toHaveBeenCalled();
  });

  /*it("should prevent access if isUrbanPlanner middleware fails", async () => {
    const mockIsUrbanPlanner = jest.fn((req, res, next) => {
      res.status(403).end();
    });

    app.put("/api/diagram/nodes", mockIsUrbanPlanner, async (req, res) => {
      res.status(200).end();
    });

    const response = await request(app)
      .put("/api/diagram/nodes")
      .send({ id: 2, x: 250, y: 350 });

    expect(response.status).toBe(403);
  });*/
});
