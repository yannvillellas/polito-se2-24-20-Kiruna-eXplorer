import request from "supertest";
import app from '../../server.mjs';
import { addArea } from "../../src/dao/areaDAO.mjs";
import { isUrbanPlanner, isValidType } from '../../middleware.mjs';
import { validationResult } from 'express-validator';

jest.mock("../../middleware.mjs");
jest.mock('express-validator', () => ({
    ...jest.requireActual('express-validator'),
    validationResult: jest.fn(),
}));

jest.mock("../../src/dao/areaDAO.mjs", () => ({
    addArea: jest.fn(),
}));

describe("POST /api/:docId/areas", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();

        isUrbanPlanner.mockImplementation((req, res, next) => {
            req.isAuthenticated = jest.fn(() => true);
            req.user = { role: 'urbanPlanner' };
            return next();
        });

        validationResult.mockReturnValue({
            isEmpty: () => true, // Simula nessun errore di validazione
        });



        //addDocument.mockResolvedValue();

    });

    it("should add a polygon area and return its ID", async () => {
        const mockAreaId = 123;
        addArea.mockResolvedValueOnce(mockAreaId); // Mock della funzione addArea

        const response = await request(app)
            .post("/api/1/areas")
            .send({
                type: "polygon",
                latlngs: [
                    [
                        { lat: 67.85923341814025, lng: 20.202684405958284 },
                        { lat: 67.85320538037035, lng: 20.198907855665315 },
                        { lat: 67.85002869054144, lng: 20.234785083448518 },
                        { lat: 67.85677053723843, lng: 20.250406268751252 },
                    ],
                ],
            });

        expect(response.status).toBe(201);
        expect(response.body).toBe(mockAreaId);
        expect(addArea).toHaveBeenCalledWith(
            "1",
            "polygon",
            JSON.stringify([
                [
                    { lat: 67.85923341814025, lng: 20.202684405958284 },
                    { lat: 67.85320538037035, lng: 20.198907855665315 },
                    { lat: 67.85002869054144, lng: 20.234785083448518 },
                    { lat: 67.85677053723843, lng: 20.250406268751252 },
                ],
            ])
        );
    });

    it("should return 400 for unsupported area type", async () => {
        const response = await request(app)
            .post("/api/1/areas")
            .send({
                type: "unsupported",
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: "Invalid area type" });
        expect(addArea).not.toHaveBeenCalled(); // Non deve chiamare addArea
    });

    it("should return 400 for missing area data", async () => {
        const response = await request(app)
            .post("/api/1/areas")
            .send({});

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: "Invalid area type" });
        expect(addArea).not.toHaveBeenCalled();
    });

    /*it("should handle database errors gracefully", async () => {
        addArea.mockRejectedValueOnce(new Error("Database error"));

        const response = await request(app)
            .post("/api/1/areas")
            .send({
                type: "polygon",
                latlngs: [
                    [
                        { lat: 67.85923341814025, lng: 20.202684405958284 },
                        { lat: 67.85320538037035, lng: 20.198907855665315 },
                        { lat: 67.85002869054144, lng: 20.234785083448518 },
                        { lat: 67.85677053723843, lng: 20.250406268751252 },
                    ],
                ],
            });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: "Internal Server Error" });
        expect(addArea).toHaveBeenCalled();
    });*/
});


