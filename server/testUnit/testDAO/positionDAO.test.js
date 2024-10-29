import { test, expect, jest } from "@jest/globals";
import { listPositions } from "../../src/dao/positionDAO.mjs"; // Assicurati che il percorso sia corretto
import Position from "../../src/models/position.mjs"; // Importa la classe Position
import sqlite3 from "sqlite3";
const { Database } = sqlite3.verbose();

describe("Position DAO Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    describe("listPositions", () => {
        test("should return a list of Position instances", async () => {
            const mockRows = [
                { posId: 1, docId: 1, latitude: 45.0, longitude: 9.0 },
                { posId: 2, docId: 1, latitude: 46.0, longitude: 10.0 }
            ];

            jest.spyOn(Database.prototype, "all").mockImplementation((sql, callback) => {
                callback(null, mockRows); // Simula il recupero di righe dal database
            });

            const result = await listPositions();
            expect(result).toHaveLength(2);
            expect(result[0]).toBeInstanceOf(Position); // Controlla che il risultato sia un'istanza di Position
            expect(result[0].latitude).toBe(45.0);
            expect(result[1].latitude).toBe(46.0);
            expect(Database.prototype.all).toHaveBeenCalledTimes(1);
        });

        test("should return an empty array if no positions exist", async () => {
            jest.spyOn(Database.prototype, "all").mockImplementation((sql, callback) => {
                callback(null, []); // Simula il recupero di un array vuoto
            });

            const result = await listPositions();
            expect(result).toHaveLength(0);
            expect(Database.prototype.all).toHaveBeenCalledTimes(1);
        });

        test("should reject on database error", async () => {
            jest.spyOn(Database.prototype, "all").mockImplementation((sql, callback) => {
                callback(new Error("Database error"), null); // Simula un errore nel database
            });

            await expect(listPositions()).rejects.toThrow("Database error");
        });
    });
});
