import request from "supertest";
import app from '../../server.mjs';
import { getDocumentTypes,addDocumentType} from "../../src/dao/documentTypeDAO.mjs";
import { isUrbanPlanner, isValidType } from '../../middleware.mjs';
import { validationResult } from 'express-validator';

jest.mock("../../middleware.mjs");
jest.mock('express-validator', () => ({
    ...jest.requireActual('express-validator'),
    validationResult: jest.fn(),
}));

jest.mock("../../src/dao/documentTypeDAO.mjs", () => ({
    getDocumentTypes: jest.fn(),
    addDocumentType: jest.fn(),
}));

describe("POST /api/documents/types", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();

        isUrbanPlanner.mockImplementation((req, res, next) => {
            req.isAuthenticated = jest.fn(() => true);
            req.user = { role: 'urbanPlanner' };
            return next();
        });
    });
    it("should return 201 and the document type ID when data is valid", async () => {
        validationResult.mockReturnValue({
            isEmpty: () => true,
        });
        const mockDocumentTypeId = 123;
        addDocumentType.mockResolvedValueOnce(mockDocumentTypeId);

        const response = await request(app)
            .post("/api/documents/types")
            .send({ type: "report" })
            .set("Authorization", "Bearer valid-token");

        expect(response.status).toBe(201);
        expect(response.body).toBe(mockDocumentTypeId);
        expect(addDocumentType).toHaveBeenCalledTimes(1);
        expect(addDocumentType).toHaveBeenCalledWith("report");
    });

    it("should return 422 if type is missing", async () => {
        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [{ msg: 'Invalid value', param: 'type' }],
        });
        const response = await request(app)
            .post("/api/documents/types")
            .send({})
            .set("Authorization", "Bearer valid-token");

        expect(response.status).toBe(422);
        expect(response.body.errors[0]).toMatchObject({
            param: "type",
            msg: "Invalid value",
        });
        expect(addDocumentType).not.toHaveBeenCalled();
    });

    it("should return 422 if type is not a string", async () => {
        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [{ msg: 'Invalid value', param: 'type' }],
        });
        const response = await request(app)
            .post("/api/documents/types")
            .send({ type: 123 })
            .set("Authorization", "Bearer valid-token");

        expect(response.status).toBe(422);
        expect(response.body.errors[0]).toMatchObject({
            param: "type",
            msg: "Invalid value",
        });
        expect(addDocumentType).not.toHaveBeenCalled();
    });

    /*it("should return 500 if addDocumentType throws an error", async () => {
        validationResult.mockReturnValue({
            isEmpty: () => true,
        });
        addDocumentType.mockRejectedValueOnce(new Error("Database error"));

        const response = await request(app)
            .post("/api/documents/types")
            .send({ type: "report" })
            .set("Authorization", "Bearer valid-token");

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: "Database error" });
        expect(addDocumentType).toHaveBeenCalledTimes(1);
    });*/

    it("should call addDocumentType with the correct type", async () => {
        validationResult.mockReturnValue({
            isEmpty: () => true,
        });
        const mockDocumentTypeId = 456;
        addDocumentType.mockResolvedValueOnce(mockDocumentTypeId);

        await request(app)
            .post("/api/documents/types")
            .send({ type: "contract" })
            .set("Authorization", "Bearer valid-token");

        expect(addDocumentType).toHaveBeenCalledWith("contract");
    });
});

describe("GET /api/documents/types", () => {
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
    it("should return 200 and a list of document types", async () => {
        const mockDocumentTypes = [
            { id: 1, type: "report" },
            { id: 2, type: "contract" },
        ];
        getDocumentTypes.mockResolvedValueOnce(mockDocumentTypes);

        const response = await request(app).get("/api/documents/types");

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockDocumentTypes);
        expect(getDocumentTypes).toHaveBeenCalledTimes(1);
    });

    it("should return 200 and an empty array if no document types are available", async () => {
        getDocumentTypes.mockResolvedValueOnce([]);

        const response = await request(app).get("/api/documents/types");

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
        expect(getDocumentTypes).toHaveBeenCalledTimes(1);
    });

    it("should return 500 if getDocumentTypes throws an error", async () => {
        getDocumentTypes.mockRejectedValueOnce(new Error("Database error"));

        const response = await request(app).get("/api/documents/types");

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: "Database error" });
        expect(getDocumentTypes).toHaveBeenCalledTimes(1);
    });

    it("should call getDocumentTypes only once", async () => {
        getDocumentTypes.mockResolvedValueOnce([]);

        await request(app).get("/api/documents/types");

        expect(getDocumentTypes).toHaveBeenCalledTimes(1);
    });
});