import { test, expect, jest } from "@jest/globals";
import { getUser } from "../../src/dao/userDAO.mjs";
import User from "../../src/models/User.mjs";
import sqlite3 from "sqlite3";
const { Database } = sqlite3.verbose();

describe("User DAO Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    describe("getUser", () => {
        test("should return a User instance if credentials match", async () => {
            const mockRow = {
                userId: 1,
                username: "testUser",
                password: "testPass",
                role: "admin"
            };

            jest.spyOn(Database.prototype, "get").mockImplementation((sql, params, callback) => {
                callback(null, mockRow); // Simulate a successful database query
            });

            const result = await getUser("testUser", "testPass");
            expect(result).toBeInstanceOf(User);
            expect(result.username).toBe("testUser");
            expect(result.password).toBe("testPass");
            expect(result.role).toBe("admin");
            expect(Database.prototype.get).toHaveBeenCalledTimes(1);
        });

        test("should return false if the username does not exist", async () => {
            jest.spyOn(Database.prototype, "get").mockImplementation((sql, params, callback) => {
                callback(null, null); // Simulate no user found
            });

            const result = await getUser("nonExistentUser", "password");
            expect(result).toBe(false);
            expect(Database.prototype.get).toHaveBeenCalledTimes(1);
        });

        test("should return false if the password does not match", async () => {
            const mockRow = {
                userId: 1,
                username: "testUser",
                password: "correctPass",
                role: "admin"
            };

            jest.spyOn(Database.prototype, "get").mockImplementation((sql, params, callback) => {
                callback(null, mockRow); // Simulate a user found with a different password
            });

            const result = await getUser("testUser", "wrongPass");
            expect(result).toBe(false);
            expect(Database.prototype.get).toHaveBeenCalledTimes(1);
        });

        test("should reject on database error", async () => {
            jest.spyOn(Database.prototype, "get").mockImplementation((sql, params, callback) => {
                callback(new Error("Database error"), null); // Simulate a database error
            });

            await expect(getUser("testUser", "testPass")).rejects.toThrow("Database error");
            expect(Database.prototype.get).toHaveBeenCalledTimes(1);
        });
    });
});
