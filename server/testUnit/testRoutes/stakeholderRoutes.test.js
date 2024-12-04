import request from "supertest";
import app from '../../server.mjs';
import {  getStakeholders,addStakeholder} from "../../src/dao/stakeholdersDAO.mjs";
import { isUrbanPlanner, isValidType } from '../../middleware.mjs';
import { validationResult } from 'express-validator';

jest.mock("../../middleware.mjs");
jest.mock('express-validator', () => ({
    ...jest.requireActual('express-validator'),
    validationResult: jest.fn(),
}));

jest.mock("../../src/dao/stakeholdersDAO.mjs", () => ({
    getStakeholders: jest.fn(),
    addStakeholder: jest.fn(),
}));

describe("POST /api/documents/stakeholders", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();

        isUrbanPlanner.mockImplementation((req, res, next) => {
            req.isAuthenticated = jest.fn(() => true);
            req.user = { role: 'urbanPlanner' };
            return next();
        });
    });

    it("should return 201 and the stakeholder ID when data is valid", async () => {
        validationResult.mockReturnValue({
            isEmpty: () => true,
        });
        const mockStakeholderId = 123;
        addStakeholder.mockResolvedValueOnce(mockStakeholderId);

        const response = await request(app)
            .post("/api/documents/stakeholders")
            .send({ name: "John Doe" })
            .set("Authorization", "Bearer valid-token");

        expect(response.status).toBe(201);
        expect(response.body).toBe(mockStakeholderId);
        expect(addStakeholder).toHaveBeenCalledTimes(1);
        expect(addStakeholder).toHaveBeenCalledWith("John Doe");
    });

    it("should return 422 if name is missing", async () => {
        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [{ msg: 'Invalid value', param: 'name' }],
        });
        const response = await request(app)
            .post("/api/documents/stakeholders")
            .send({})
            .set("Authorization", "Bearer valid-token");

        expect(response.status).toBe(422);
        expect(response.body.errors[0]).toMatchObject({
            param: "name",
            msg: "Invalid value",
        });
        expect(addStakeholder).not.toHaveBeenCalled();
    });

    it("should return 422 if name is not a string", async () => {
        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [{ msg: 'Invalid value', param: 'name' }],
        });
        const response = await request(app)
            .post("/api/documents/stakeholders")
            .send({ name: 123 })
            .set("Authorization", "Bearer valid-token");

        expect(response.status).toBe(422);
        expect(response.body.errors[0]).toMatchObject({
            param: "name",
            msg: "Invalid value",
        });
        expect(addStakeholder).not.toHaveBeenCalled();
    });

    /*it("should return 500 if addStakeholder throws an error", async () => {
        validationResult.mockReturnValue({
            isEmpty: () => true,
        });
        addStakeholder.mockRejectedValueOnce(new Error("Database error"));

        const response = await request(app)
            .post("/api/documents/stakeholders")
            .send({ name: "John Doe" })
            .set("Authorization", "Bearer valid-token");

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: "Database error" });
        expect(addStakeholder).toHaveBeenCalledTimes(1);
    });*/

    it("should call addStakeholder with the correct name", async () => {
        validationResult.mockReturnValue({
            isEmpty: () => true,
        });
        const mockStakeholderId = 456;
        addStakeholder.mockResolvedValueOnce(mockStakeholderId);

        await request(app)
            .post("/api/documents/stakeholders")
            .send({ name: "Jane Doe" })
            .set("Authorization", "Bearer valid-token");

        expect(addStakeholder).toHaveBeenCalledWith("Jane Doe");
    });
});

describe("GET /api/documents/stakeholders", () => {
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

    it("should return 200 and a list of stakeholders", async () => {
        const mockStakeholders = [
            { id: 1, name: "John Doe" },
            { id: 2, name: "Jane Smith" },
        ];
        getStakeholders.mockResolvedValueOnce(mockStakeholders);

        const response = await request(app).get("/api/documents/stakeholders");

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockStakeholders);
        expect(getStakeholders).toHaveBeenCalledTimes(1);
    });

    it("should return 200 and an empty array if no stakeholders are available", async () => {
        getStakeholders.mockResolvedValueOnce([]);

        const response = await request(app).get("/api/documents/stakeholders");

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
        expect(getStakeholders).toHaveBeenCalledTimes(1);
    });

    it("should return 500 if getStakeholders throws an error", async () => {
        getStakeholders.mockRejectedValueOnce(new Error("Database error"));

        const response = await request(app).get("/api/documents/stakeholders");

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: "Database error" });
        expect(getStakeholders).toHaveBeenCalledTimes(1);
    });

    it("should call getStakeholders only once", async () => {
        getStakeholders.mockResolvedValueOnce([]);

        await request(app).get("/api/documents/stakeholders");

        expect(getStakeholders).toHaveBeenCalledTimes(1);
    });
});