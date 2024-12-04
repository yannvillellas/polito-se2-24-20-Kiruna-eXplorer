import request from "supertest";
import app from '../../server.mjs';
import { addArea, listAreas, listAreaAssociations } from "../../src/dao/areaDAO.mjs";
import { isUrbanPlanner, isValidType } from '../../middleware.mjs';
import { validationResult } from 'express-validator';

jest.mock("../../middleware.mjs");
jest.mock('express-validator', () => ({
    ...jest.requireActual('express-validator'),
    validationResult: jest.fn(),
}));

jest.mock("../../src/dao/areaDAO.mjs", () => ({
    addArea: jest.fn(),
    listAreas: jest.fn(),
    listAreaAssociations: jest.fn(),
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

describe("GET /api/areas", () => {
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
    });

    it("should return a list of areas with status 200", async () => {
        // Mock di aree simulate
        const mockAreas = [
            { id: 1, type: "polygon", coordinates: "[[...]]" },
            { id: 2, type: "circlemarker", coordinates: "{...}" },
        ];

        listAreas.mockResolvedValueOnce(mockAreas); // Simula il risultato della funzione

        const response = await request(app).get("/api/areas");

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockAreas);
        expect(listAreas).toHaveBeenCalled(); // Assicura che listAreas sia stata chiamata
    });

    it("should return 500 if listAreas throws an error", async () => {
        listAreas.mockRejectedValueOnce(new Error("Database error"));
    
        const response = await request(app).get("/api/areas");
    
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: "Database error" });
        expect(listAreas).toHaveBeenCalled(); // Assicura che listAreas sia stata chiamata
    });

    it("should return an empty array if no areas are available", async () => {
        listAreas.mockResolvedValueOnce([]); // Simula una lista vuota
    
        const response = await request(app).get("/api/areas");
    
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]); // Controlla che il corpo sia un array vuoto
        expect(listAreas).toHaveBeenCalled(); // Assicura che listAreas sia stata chiamata
    });

    /*it("should call listAreas only once", async () => {
        listAreas.mockResolvedValueOnce([]);
    
        await request(app).get("/api/areas");
    
        expect(listAreas).toHaveBeenCalledTimes(1);
    });*/
});


describe("GET /api/areaAssociations", () => {
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
    });

    it("should return a list of area associations with status 200", async () => {
        const mockAreaAssociations = [
            { id: 1, areaId: 101, associationType: "typeA" },
            { id: 2, areaId: 102, associationType: "typeB" },
        ];

        listAreaAssociations.mockResolvedValueOnce(mockAreaAssociations);

        const response = await request(app).get("/api/areaAssociations");

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockAreaAssociations);
        expect(listAreaAssociations).toHaveBeenCalled();
    });

    it("should return 500 if listAreaAssociations throws an error", async () => {
        listAreaAssociations.mockRejectedValueOnce(new Error("Database error"));

        const response = await request(app).get("/api/areaAssociations");

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: "Database error" });
        expect(listAreaAssociations).toHaveBeenCalled();
    });

    it("should return an empty array if no area associations are available", async () => {
        listAreaAssociations.mockResolvedValueOnce([]);

        const response = await request(app).get("/api/areaAssociations");

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
        expect(listAreaAssociations).toHaveBeenCalled();
    });

    it("should call listAreaAssociations only once", async () => {
        listAreaAssociations.mockResolvedValueOnce([]);

        await request(app).get("/api/areaAssociations");

        expect(listAreaAssociations).toHaveBeenCalledTimes(1);
    });
});

