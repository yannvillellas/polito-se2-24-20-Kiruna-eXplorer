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

    // Testing saveNodesPosition function
    describe("saveNodesPosition", () => {
        test("should save node positions", async () => {
            const positions = {
                1: { x: 10, y: 20 },
                2: { x: 30, y: 40 }
            };

            jest.spyOn(Database.prototype, "run").mockImplementation((sql, params, callback) => {
                callback(null); // Simulate successful save
            });

            const result = await saveNodesPosition(positions);
            expect(result).toBeUndefined();
            expect(Database.prototype.run).toHaveBeenCalledTimes(2); // Two inserts
        });

        test("should reject on insert error", async () => {
            const positions = {
                1: { x: 10, y: 20 }
            };

            jest.spyOn(Database.prototype, "run").mockImplementation((sql, params, callback) => {
                callback(new Error("Insert error")); // Simulate error
            });

            await expect(saveNodesPosition(positions)).rejects.toThrow("Insert error");
        });
    });

    // Testing clearAllPositions function
    describe("clearAllPositions", () => {
        test("should clear all positions", async () => {
            jest.spyOn(Database.prototype, "run").mockImplementation((sql, params, callback) => {
                callback(null); // Simulate successful clear
            });

            const result = await clearAllPositions();
            expect(result).toBeUndefined();
            expect(Database.prototype.run).toHaveBeenCalledTimes(1);
        });

        test("should reject on delete error", async () => {
            jest.spyOn(Database.prototype, "run").mockImplementation((sql, params, callback) => {
                callback(new Error("Delete error")); // Simulate error
            });

            await expect(clearAllPositions()).rejects.toThrow("Delete error");
        });
    });

    // Testing updateNodePosition function
    describe("updateNodePosition", () => {
        test("should update node position", async () => {
            const position = { docId: 1, x: 50, y: 60 };

            jest.spyOn(Database.prototype, "run").mockImplementation((sql, params, callback) => {
                callback(null); // Simulate successful update
            });

            const result = await updateNodePosition(position);
            expect(result).toBeUndefined();
            expect(Database.prototype.run).toHaveBeenCalledTimes(1);
        });

        test("should reject on update error", async () => {
            const position = { docId: 1, x: 50, y: 60 };

            jest.spyOn(Database.prototype, "run").mockImplementation((sql, params, callback) => {
                callback(new Error("Update error")); // Simulate error
            });

            await expect(updateNodePosition(position)).rejects.toThrow("Update error");
        });
    });

    // Testing getXValues function
    describe("getXValues", () => {
        test("should return x values", async () => {
            const mockRows = [{ value: 10 }, { value: 20 }];

            jest.spyOn(Database.prototype, "all").mockImplementation((sql, params, callback) => {
                callback(null, mockRows); // Simulate fetching x values
            });

            const result = await getXValues();
            expect(result).toEqual([10, 20]);
            expect(Database.prototype.all).toHaveBeenCalledTimes(1);
        });

        test("should reject on database error", async () => {
            jest.spyOn(Database.prototype, "all").mockImplementation((sql, params, callback) => {
                callback(new Error("Database error"), null); // Simulate error
            });

            await expect(getXValues()).rejects.toThrow("Database error");
            expect(Database.prototype.all).toHaveBeenCalledTimes(1);
        });
    });

    // Testing getYValues function
    describe("getYValues", () => {
        test("should return y values", async () => {
            const mockRows = [{ value: 100 }, { value: 200 }];

            jest.spyOn(Database.prototype, "all").mockImplementation((sql, params, callback) => {
                callback(null, mockRows); // Simulate fetching y values
            });

            const result = await getYValues();
            expect(result).toEqual([100, 200]);
            expect(Database.prototype.all).toHaveBeenCalledTimes(1);
        });

        test("should reject on database error", async () => {
            jest.spyOn(Database.prototype, "all").mockImplementation((sql, params, callback) => {
                callback(new Error("Database error"), null); // Simulate error
            });

            await expect(getYValues()).rejects.toThrow("Database error");
            expect(Database.prototype.all).toHaveBeenCalledTimes(1);
        });
    });

    // Testing addNewX function
    describe("addNewX", () => {
        test("should add new x values", async () => {
            const xToAdd = [10, 20];

            jest.spyOn(Database.prototype, "run").mockImplementation((sql, params, callback) => {
                callback(null); // Simulate successful insert
            });

            const result = await addNewX(xToAdd);
            expect(result).toBeUndefined();
            expect(Database.prototype.run).toHaveBeenCalledTimes(2); // Two inserts
        });

        test("should reject on insert error", async () => {
            const xToAdd = [10, 20];

            jest.spyOn(Database.prototype, "run").mockImplementation((sql, params, callback) => {
                callback(new Error("Insert error")); // Simulate error
            });

            await expect(addNewX(xToAdd)).rejects.toThrow("Insert error");
        });
    });

    // Testing addNewY function
    describe("addNewY", () => {
        test("should add new y values", async () => {
            const yToAdd = [30, 40];

            jest.spyOn(Database.prototype, "run").mockImplementation((sql, params, callback) => {
                callback(null); // Simulate successful insert
            });

            const result = await addNewY(yToAdd);
            expect(result).toBeUndefined();
            expect(Database.prototype.run).toHaveBeenCalledTimes(2); // Two inserts
        });

        test("should reject on insert error", async () => {
            const yToAdd = [30, 40];

            jest.spyOn(Database.prototype, "run").mockImplementation((sql, params, callback) => {
                callback(new Error("Insert error")); // Simulate error
            });

            await expect(addNewY(yToAdd)).rejects.toThrow("Insert error");
        });
    });
});
