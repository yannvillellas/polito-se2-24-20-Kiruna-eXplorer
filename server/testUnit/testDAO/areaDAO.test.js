import { test, expect, jest, describe, beforeEach } from "@jest/globals";
import { addArea, listAreas, listAreaAssociations } from "../../src/dao/areaDAO.mjs";
import { db } from "../../src/database/db.mjs";
import { Area, AreaAssociation } from "../../src/models/areas.mjs";

jest.mock("../../src/database/db.mjs");

describe("areaDAO Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe("addArea", () => {
    test("should resolve with areaId if area already exists", async () => {
      db.get.mockImplementation((sql, params, callback) => callback(null, { areaId: 123 }));
      db.run.mockImplementation((sql, params, callback) => callback(null));

      const result = await addArea(1, "type1", "coordinates");
      expect(result).toBe(123);
      expect(db.get).toHaveBeenCalledTimes(1);
      expect(db.run).toHaveBeenCalledTimes(1);
    });

    test("should insert a new area and resolve with its ID", async () => {
      db.get.mockImplementationOnce((sql, params, callback) => callback(null, null));
      
      db.run.mockImplementationOnce(function (sql, params, callback) {
        callback.call({ lastID: 456 }, null);
      });
      db.run.mockImplementationOnce((sql, params, callback) => callback(null)); // Insert AreaAssociation

      const result = await addArea(1, "type1", "coordinates");
      expect(result).toBe(456);
      expect(db.get).toHaveBeenCalledTimes(1);
      expect(db.run).toHaveBeenCalledTimes(2);
    });

    test("should reject on database error during area lookup", async () => {
      db.get.mockImplementation((sql, params, callback) => callback(new Error("DB error"), null));

      await expect(addArea(1, "type1", "coordinates")).rejects.toThrow("DB error");
      expect(db.get).toHaveBeenCalledTimes(1);
    });

    test("should reject on database error during AreaAssociation insertion for existing area", async () => {
      db.get.mockImplementation((sql, params, callback) => callback(null, { areaId: 123 }));
      db.run.mockImplementation((sql, params, callback) => callback(new Error("Association error"), null));

      await expect(addArea(1, "type1", "coordinates")).rejects.toThrow("Association error");
      expect(db.get).toHaveBeenCalledTimes(1);
      expect(db.run).toHaveBeenCalledTimes(1);
    });

    test("should reject on database error during new area insertion", async () => {
      db.get.mockImplementation((sql, params, callback) => callback(null, null));
      db.run.mockImplementation((sql, params, callback) => callback(new Error("Insert error"), null));

      await expect(addArea(1, "type1", "coordinates")).rejects.toThrow("Insert error");
      expect(db.get).toHaveBeenCalledTimes(1);
      expect(db.run).toHaveBeenCalledTimes(1);
    });

    test("should reject on database error during AreaAssociation insertion for new area", async () => {
      db.get.mockImplementation((sql, params, callback) => callback(null, null));
      
      db.run.mockImplementationOnce(function (sql, params, callback) {
        callback.call({ lastID: 456}, null);
      });
      db.run.mockImplementationOnce((sql, params, callback) => callback(new Error("Association error"), null)); // Insert AreaAssociation

      await expect(addArea(1, "type1", "coordinates")).rejects.toThrow("Association error");
      expect(db.get).toHaveBeenCalledTimes(1);
      expect(db.run).toHaveBeenCalledTimes(2);
    });
  });

  describe("listAreas", () => {
    test("should return a list of Area instances", async () => {
      const mockRows = [
        { areaId: 1, areaType: "type1", coordinates: JSON.stringify({ x: 10, y: 20 }) },
      ];
      db.all.mockImplementation((sql, callback) => callback(null, mockRows));

      const result = await listAreas();
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Area);
      expect(result[0].coordinates).toEqual({ x: 10, y: 20 });
      expect(db.all).toHaveBeenCalledTimes(1);
    });

    test("should return an empty array if no areas exist", async () => {
      db.all.mockImplementation((sql, callback) => callback(null, []));

      const result = await listAreas();
      expect(result).toEqual([]);
      expect(db.all).toHaveBeenCalledTimes(1);
    });

    test("should reject on database error", async () => {
      db.all.mockImplementation((sql, callback) => callback(new Error("DB error"), null));

      await expect(listAreas()).rejects.toThrow("DB error");
      expect(db.all).toHaveBeenCalledTimes(1);
    });
  });

  describe("listAreaAssociations", () => {
    test("should return a list of AreaAssociation instances", async () => {
      const mockRows = [{ areaId: 1, docId: 2 }];
      db.all.mockImplementation((sql, callback) => callback(null, mockRows));

      const result = await listAreaAssociations();
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(AreaAssociation);
      expect(result[0].docId).toBe(2);
      expect(db.all).toHaveBeenCalledTimes(1);
    });

    test("should return an empty array if no associations exist", async () => {
      db.all.mockImplementation((sql, callback) => callback(null, []));

      const result = await listAreaAssociations();
      expect(result).toEqual([]);
      expect(db.all).toHaveBeenCalledTimes(1);
    });

    test("should reject on database error", async () => {
      db.all.mockImplementation((sql, callback) => callback(new Error("DB error"), null));

      await expect(listAreaAssociations()).rejects.toThrow("DB error");
      expect(db.all).toHaveBeenCalledTimes(1);
    });
  });
});
