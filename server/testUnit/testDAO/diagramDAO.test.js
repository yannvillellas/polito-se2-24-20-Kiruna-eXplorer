import { test, expect, jest } from "@jest/globals";
import { 
    getNodesPositions, 
    saveNodesPosition, 
    clearAllPositions, 
    updateNodePosition, 
    getXValues, 
    getYValues, 
    addNewX, 
    addNewY 
} from "../../src/dao/diagramDAO.mjs";
import sqlite3 from "sqlite3";
const { Database } = sqlite3.verbose();

describe("Diagram DAO Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    // Testing getNodesPositions function
    describe("getNodesPositions", () => {
        test("should return a dictionary of node positions", async () => {
            const mockRows = [
                { docId: 1, x: 10, y: 20 },
                { docId: 2, x: 30, y: 40 }
            ];

            jest.spyOn(Database.prototype, "all").mockImplementation((sql, params, callback) => {
                callback(null, mockRows); // Simulate fetching node positions
            });

            const result = await getNodesPositions();
            expect(result).toEqual({
                1: { x: 10, y: 20 },
                2: { x: 30, y: 40 }
            });
            expect(Database.prototype.all).toHaveBeenCalledTimes(1);
        });

        test("should reject on database error", async () => {
            jest.spyOn(Database.prototype, "all").mockImplementation((sql, params, callback) => {
                callback(new Error("Database error"), null); // Simulate error
            });

            await expect(getNodesPositions()).rejects.toThrow("Database error");
            expect(Database.prototype.all).toHaveBeenCalledTimes(1);
        });
    });

    