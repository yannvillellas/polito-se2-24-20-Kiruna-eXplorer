import { test, expect, jest, describe, beforeEach } from "@jest/globals";
import { getDocumentTypes, addDocumentType } from "../../src/dao/documentTypeDAO.mjs";
import { db } from "../../src/database/db.mjs";

jest.mock("../../src/database/db.mjs");

describe("documentTypeDAO Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe("getDocumentTypes", () => {
    test("should return a list of document types", async () => {
      const mockRows = [
        { type: "Report" },
        { type: "Specification" },
      ];

      db.all.mockImplementation((sql, callback) => callback(null, mockRows));

      const result = await getDocumentTypes();
      expect(result).toEqual(mockRows);
      expect(db.all).toHaveBeenCalledTimes(1);
    });

    test("should return an empty list if no document types exist", async () => {
      db.all.mockImplementation((sql, callback) => callback(null, []));

      const result = await getDocumentTypes();
      expect(result).toEqual([]);
      expect(db.all).toHaveBeenCalledTimes(1);
    });

    test("should reject on database error", async () => {
      db.all.mockImplementation((sql, callback) => callback(new Error("DB error"), null));

      await expect(getDocumentTypes()).rejects.toThrow("DB error");
      expect(db.all).toHaveBeenCalledTimes(1);
    });
  });

  describe("addDocumentType", () => {
    test("should add a new document type and return its ID", async () => {
      db.run.mockImplementationOnce(function (sql, params, callback) {
        callback.call({ lastID: 123 }, null);
      });

      const result = await addDocumentType("NewType");
      expect(result).toBe(123);
      expect(db.run).toHaveBeenCalledTimes(1);
    });

    test("should reject on database error", async () => {
      db.run.mockImplementation((sql, params, callback) => callback(new Error("Insert error"), null));

      await expect(addDocumentType("NewType")).rejects.toThrow("Insert error");
      expect(db.run).toHaveBeenCalledTimes(1);
    });
  });
});
