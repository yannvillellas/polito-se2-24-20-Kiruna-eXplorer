import { test, expect, jest, describe, beforeEach } from "@jest/globals";
import { db } from "../../src/database/db.mjs";
import {
  getTraslatedNodes,
  addNodeTraslation,
  updateNodeTraslation,
  clearAllPositions,
  getXValues,
  getYValues,
  addNewX,
  addNewY,
  getDimensions,
  addDimensions,
  updateWidth,
  updateHeight,
} from "../../src/dao/diagramDAO.mjs";

jest.mock("../../src/database/db.mjs");

describe("diagramDAO Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe("getTraslatedNodes", () => {
    test("should return translated nodes as a dictionary", async () => {
      const mockRows = [{ docId: 1, x: 10, y: 20 }];
      db.all.mockImplementationOnce((sql, params, callback) =>
        callback(null, mockRows)
      );

      const result = await getTraslatedNodes();
      expect(result).toEqual({ 1: { x: 10, y: 20 } });
      expect(db.all).toHaveBeenCalledTimes(1);
    });

    test("should reject on database error", async () => {
      db.all.mockImplementationOnce((sql, params, callback) =>
        callback(new Error("DB Error"), null)
      );

      await expect(getTraslatedNodes()).rejects.toThrow("DB Error");
      expect(db.all).toHaveBeenCalledTimes(1);
    });
  });

  describe("addNodeTraslation", () => {
    test("should resolve when node is added successfully", async () => {
      db.run.mockImplementationOnce((sql, params, callback) => callback(null));

      const node = { docId: 1, x: 10, y: 20 };
      await expect(addNodeTraslation(node)).resolves.toBeUndefined();
      expect(db.run).toHaveBeenCalledTimes(1);
    });

    test("should reject on database error", async () => {
      db.run.mockImplementationOnce((sql, params, callback) =>
        callback(new Error("Insert Error"))
      );

      const node = { docId: 1, x: 10, y: 20 };
      await expect(addNodeTraslation(node)).rejects.toThrow("Insert Error");
      expect(db.run).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateNodeTraslation", () => {
    test("should resolve when node is updated successfully", async () => {
      db.run.mockImplementationOnce((sql, params, callback) => callback(null));

      const node = { docId: 1, x: 30, y: 40 };
      await expect(updateNodeTraslation(node)).resolves.toBeUndefined();
      expect(db.run).toHaveBeenCalledTimes(1);
    });

    test("should reject on database error", async () => {
      db.run.mockImplementationOnce((sql, params, callback) =>
        callback(new Error("Update Error"))
      );

      const node = { docId: 1, x: 30, y: 40 };
      await expect(updateNodeTraslation(node)).rejects.toThrow("Update Error");
      expect(db.run).toHaveBeenCalledTimes(1);
    });
  });

  describe("clearAllPositions", () => {
    test("should resolve when all positions are cleared", async () => {
      db.run.mockImplementationOnce((sql, params, callback) => callback(null));

      await expect(clearAllPositions()).resolves.toBeUndefined();
      expect(db.run).toHaveBeenCalledTimes(1);
    });
  });

  describe("getXValues", () => {
    test("should return X values", async () => {
      const mockRows = [{ value: 10 }, { value: 20 }];
      db.all.mockImplementationOnce((sql, params, callback) =>
        callback(null, mockRows)
      );

      const result = await getXValues();
      expect(result).toEqual([10, 20]);
      expect(db.all).toHaveBeenCalledTimes(1);
    });
  });

  describe("getYValues", () => {
    test("should return Y values", async () => {
      const mockRows = [{ value: 30 }, { value: 40 }];
      db.all.mockImplementationOnce((sql, params, callback) =>
        callback(null, mockRows)
      );

      const result = await getYValues();
      expect(result).toEqual([30, 40]);
      expect(db.all).toHaveBeenCalledTimes(1);
    });
  });

  describe("addNewX", () => {
    test("should add new X values", async () => {
      db.run.mockImplementation((sql, params, callback) => callback(null));

      const xValues = [10, 20];
      await expect(addNewX(xValues)).resolves.toBeUndefined();
      expect(db.run).toHaveBeenCalledTimes(2);
    });
  });

  describe("addNewY", () => {
    test("should add new Y values", async () => {
      db.run.mockImplementation((sql, params, callback) => callback(null));

      const yValues = [30, 40];
      await expect(addNewY(yValues)).resolves.toBeUndefined();
      expect(db.run).toHaveBeenCalledTimes(2);
    });
  });

  describe("getDimensions", () => {
    test("should return dimensions as an object", async () => {
      const mockRows = [
        { name: "width", value: 100 },
        { name: "height", value: 200 },
      ];
      db.all.mockImplementationOnce((sql, params, callback) =>
        callback(null, mockRows)
      );

      const result = await getDimensions();
      expect(result).toEqual({ width: 100, height: 200 });
      expect(db.all).toHaveBeenCalledTimes(1);
    });
  });

  describe("addDimensions", () => {
    test("should add dimensions successfully", async () => {
      db.run.mockImplementation((sql, params, callback) => callback(null));

      await expect(addDimensions(100, 200)).resolves.toBeUndefined();
      expect(db.run).toHaveBeenCalledTimes(2);
    });
  });

  describe("updateWidth", () => {
    test("should update width successfully", async () => {
      db.run.mockImplementationOnce((sql, params, callback) => callback(null));

      await expect(updateWidth(300)).resolves.toBeUndefined();
      expect(db.run).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateHeight", () => {
    test("should update height successfully", async () => {
      db.run.mockImplementationOnce((sql, params, callback) => callback(null));

      await expect(updateHeight(400)).resolves.toBeUndefined();
      expect(db.run).toHaveBeenCalledTimes(1);
    });
  });
});
