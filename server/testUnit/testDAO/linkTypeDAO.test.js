import { test, expect, jest, describe, beforeEach } from "@jest/globals";
import { db } from "../../src/database/db.mjs"; // Database mock
import { getLinksType, getTypeIdByType, getTypeByTypeId } from "../../src/dao/LinkTypeDAO.mjs"; // DAO functions

// Mocking the `db` object to simulate database behavior
jest.mock("../../src/database/db.mjs");

describe("getLinksType", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    test("should return a list of link types", async () => {
        const mockRows = [
            { typeId: "t1", type: "collateral consequence" },
            { typeId: "t2", type: "direct consequence" },
            { typeId: "t3", type: "projection" },
            { typeId: "t4", type: "update" }
        ];

        const expectedResult = [
            "collateral consequence",
            "direct consequence",
            "projection",
            "update"
        ];

        // Mocking the `db.all` method to simulate successful database response
        db.all.mockImplementationOnce((sql, params, callback) => callback(null, mockRows));

        // Call the DAO function and check the result
        await expect(getLinksType()).resolves.toStrictEqual(expectedResult);
        expect(db.all).toHaveBeenCalledTimes(1);
    });

    test("should reject on database error", async () => {
        // Mocking the `db.all` method to simulate a database error
        db.all.mockImplementationOnce((sql, params, callback) => callback(new Error("Database error")));

        // Call the DAO function and expect it to throw an error
        await expect(getLinksType()).rejects.toThrow("Database error");
        expect(db.all).toHaveBeenCalledTimes(1);
    });
});

describe("getTypeIdByType", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    test("should return typeId for a given type", async () => {
        const mockRow = { typeId: "t2", type: "direct consequence" };
        const typeParameter = "direct consequence";
        const expectedResult = "t2";

        // Mocking the `db.get` method to simulate successful database response
        db.get.mockImplementationOnce((sql, params, callback) => callback(null, mockRow));

        // Call the DAO function and check the result
        await expect(getTypeIdByType(typeParameter)).resolves.toStrictEqual(expectedResult);
        expect(db.get).toHaveBeenCalledTimes(1);
    });

    test("should reject on database error", async () => {
        const typeParameter = "direct consequence";

        // Mocking the `db.get` method to simulate a database error
        db.get.mockImplementationOnce((sql, params, callback) => callback(new Error("Database error")));

        // Call the DAO function and expect it to throw an error
        await expect(getTypeIdByType(typeParameter)).rejects.toThrow("Database error");
        expect(db.get).toHaveBeenCalledTimes(1);
    });

    test("should reject if type not found", async () => {
        const typeParameter = "nonexistent type";

        // Mocking the `db.get` method to simulate no result found
        db.get.mockImplementationOnce((sql, params, callback) => callback(null, null));

        // Call the DAO function and expect it to throw a "Type not found" error
        await expect(getTypeIdByType(typeParameter)).rejects.toThrow("Type not found");
        expect(db.get).toHaveBeenCalledTimes(1);
    });
});

describe("getTypeByTypeId", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    test("should return type for a given typeId", async () => {
        const mockRow = { typeId: "t2", type: "direct consequence" };
        const typeId = "t2";
        const expectedResult = "direct consequence";

        // Mocking the `db.get` method to simulate successful database response
        db.get.mockImplementationOnce((sql, params, callback) => callback(null, mockRow));

        // Call the DAO function and check the result
        await expect(getTypeByTypeId(typeId)).resolves.toStrictEqual(expectedResult);
        expect(db.get).toHaveBeenCalledTimes(1);
    });

    test("should reject on database error", async () => {
        const typeId = "t2";

        // Mocking the `db.get` method to simulate a database error
        db.get.mockImplementationOnce((sql, params, callback) => callback(new Error("Database error")));

        // Call the DAO function and expect it to throw an error
        await expect(getTypeByTypeId(typeId)).rejects.toThrow("Database error");
        expect(db.get).toHaveBeenCalledTimes(1);
    });

    test("should reject if typeId not found", async () => {
        const typeId = "nonexistent typeId";

        // Mocking the `db.get` method to simulate no result found
        db.get.mockImplementationOnce((sql, params, callback) => callback(null, null));

        // Call the DAO function and expect it to throw a "Type not found" error
        await expect(getTypeByTypeId(typeId)).rejects.toThrow("Type not found");
        expect(db.get).toHaveBeenCalledTimes(1);
    });
});

