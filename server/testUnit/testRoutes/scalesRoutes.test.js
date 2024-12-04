import request from "supertest";
import app from '../../server.mjs';
import { getScales, addScale } from "../../src/dao/scaleDAO.mjs";
import { isUrbanPlanner, isValidType } from '../../middleware.mjs';
import { validationResult } from 'express-validator';

jest.mock("../../middleware.mjs");
jest.mock('express-validator', () => ({
    ...jest.requireActual('express-validator'),
    validationResult: jest.fn(),
}));

jest.mock("../../src/dao/scaleDAO.mjs", () => ({
    getScales: jest.fn(),
    addScale: jest.fn(),
}));

describe("POST /api/documents/scales", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();

        isUrbanPlanner.mockImplementation((req, res, next) => {
            req.isAuthenticated = jest.fn(() => true);
            req.user = { role: 'urbanPlanner' };
            return next();
        });
    });

    it("should create a scale and return its ID with status 201", async () => {
        validationResult.mockReturnValue({
            isEmpty: () => true,
        });
        const mockScaleId = { id: 1 };
        addScale.mockResolvedValueOnce(mockScaleId);

        const response = await request(app)
            .post("/api/documents/scales")
            .send({ name: "Test Scale" })
            .set("Authorization", "Bearer valid-token");

        expect(response.status).toBe(201);
        expect(response.body).toEqual(mockScaleId);
        expect(addScale).toHaveBeenCalledWith("Test Scale");
    });

    it("should return 422 if name is not a string", async () => {
        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [{ msg: 'Invalid value', param: 'name' }],
        });
        const response = await request(app)
            .post("/api/documents/scales")
            .send({ name: 12345 })
            .set("Authorization", "Bearer valid-token");

        expect(response.status).toBe(422);
        expect(response.body.errors[0]).toMatchObject({
            param: "name",
            msg: "Invalid value",
        });
        expect(addScale).not.toHaveBeenCalled();
    });

    it("should return 422 if name is missing", async () => {
        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [{ msg: 'Invalid value', param: 'name' }],
        });
        const response = await request(app)
            .post("/api/documents/scales")
            .send({})
            .set("Authorization", "Bearer valid-token");

        expect(response.status).toBe(422);
        expect(response.body.errors[0]).toMatchObject({
            param: "name",
            msg: "Invalid value",
        });
        expect(addScale).not.toHaveBeenCalled();
    });

    /*it("should return 500 if addScale throws an error", async () => {
        validationResult.mockReturnValue({
            isEmpty: () => true,
        });
        addScale.mockRejectedValueOnce(new Error("Database error"));

        const response = await request(app)
            .post("/api/documents/scales")
            .send({ name: "Valid Scale" })
            .set("Authorization", "Bearer valid-token");

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: "Database error" });
        expect(addScale).toHaveBeenCalledWith("Valid Scale");
    });*/

    /*it("should return 403 if user is not authorized", async () => {
        const response = await request(app)
            .post("/api/documents/scales")
            .send({ name: "Test Scale" })
            .set("Authorization", "Bearer invalid-token");

        expect(response.status).toBe(403);
        expect(response.body).toEqual({ error: "Forbidden" });
        expect(addScale).not.toHaveBeenCalled();
    });*/
});

describe("GET /api/documents/scales", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();

        isUrbanPlanner.mockImplementation((req, res, next) => {
            req.isAuthenticated = jest.fn(() => true);
            req.user = { role: 'urbanPlanner' };
            return next();
        });

        validationResult.mockReturnValue({
            isEmpty: () => true,
        });
    });
    it("should return 200 and a list of scales", async () => {
        const mockScales = [
            { id: 1, name: "Scale A" },
            { id: 2, name: "Scale B" },
        ];
        getScales.mockResolvedValueOnce(mockScales);

        const response = await request(app).get("/api/documents/scales");

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockScales);
        expect(getScales).toHaveBeenCalledTimes(1);
    });

    it("should return 500 if getScales throws an error", async () => {
        getScales.mockRejectedValueOnce(new Error("Database error"));

        const response = await request(app).get("/api/documents/scales");

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: "Database error" });
        expect(getScales).toHaveBeenCalledTimes(1);
    });

    it("should return 200 and an empty array if no scales are available", async () => {
        getScales.mockResolvedValueOnce([]);

        const response = await request(app).get("/api/documents/scales");

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
        expect(getScales).toHaveBeenCalledTimes(1);
    });

    it("should call getScales only once", async () => {
        getScales.mockResolvedValueOnce([]);

        await request(app).get("/api/documents/scales");

        expect(getScales).toHaveBeenCalledTimes(1);
    });
});