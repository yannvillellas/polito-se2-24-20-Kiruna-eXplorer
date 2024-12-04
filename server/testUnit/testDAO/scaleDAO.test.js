import { test, expect, jest, describe, beforeEach } from "@jest/globals";
import { getScales, addScale } from "../../src/dao/scaleDAO.mjs";
import { db } from "../../src/database/db.mjs";


jest.mock("../../src/database/db.mjs");

describe("scaleDAO Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe("getScales", () => {
    test("should return a list of scales", async () => {
      const mockRows = [
        { scaleId: 1, name: "1:100" },
        { scaleId: 2, name: "1:200" },
      ];

      db.all.mockImplementation((sql, callback) => callback(null, mockRows));

      const result = await getScales();
      expect(result).toEqual(mockRows);
      expect(db.all).toHaveBeenCalledTimes(1);
    });

    test("should return an empty list if no scales exist", async () => {
      db.all.mockImplementation((sql, callback) => callback(null, []));

      const result = await getScales();
      expect(result).toEqual([]);
      expect(db.all).toHaveBeenCalledTimes(1);
    });

    test("should reject on database error", async () => {
      db.all.mockImplementation((sql, callback) => callback(new Error("DB error"), null));

      await expect(getScales()).rejects.toThrow("DB error");
      expect(db.all).toHaveBeenCalledTimes(1);
    });
  });

  describe("addScale", () => {
    test("should add a new scale and return its ID", async () => {
      db.run.mockImplementation((sql, params, callback) => callback(null, { lastID: 123 }));

      const result = await addScale("1:300");
      expect(result).toBe(123);
      expect(db.run).toHaveBeenCalledTimes(1);
    });

    test("should reject on database error during insertion", async () => {
      db.run.mockImplementation((sql, params, callback) => callback(new Error("Insert error"), null));

      await expect(addScale("1:300")).rejects.toThrow("Insert error");
      expect(db.run).toHaveBeenCalledTimes(1);
    });
  });
});
