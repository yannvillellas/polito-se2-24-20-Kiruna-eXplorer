import { test, expect, jest, describe, beforeEach } from "@jest/globals";
import {
  getAllAssociations,
  getAssociations,
  insertAssociation,
  deleteAssociation,
  UpdateAssociation,
  CheckAssociation,
} from "../../src/dao/associationDAO.mjs";
import { db } from "../../src/database/db.mjs";
import Association from "../../src/models/association.mjs";
import { getTypeIdByType } from "../../src/dao/linkTypeDAO.mjs";

jest.mock("../../src/database/db.mjs");
jest.mock("../../src/dao/linkTypeDAO.mjs");

describe("associationDAO Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe("getAllAssociations", () => {
    test("should return all associations", async () => {
      const mockRows = [
        { aId: 1, doc1: 101, doc2: 102, typeId: 5 },
        { aId: 2, doc1: 103, doc2: 104, typeId: 6 },
      ];
      db.all.mockImplementation((sql, params, callback) => callback(null, mockRows));

      const result = await getAllAssociations();
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Association);
      expect(result[0].doc1).toBe(101);
      expect(db.all).toHaveBeenCalledTimes(1);
    });

    test("should reject on database error", async () => {
      db.all.mockImplementation((sql, params, callback) => callback(new Error("DB error"), null));

      await expect(getAllAssociations()).rejects.toThrow("DB error");
      expect(db.all).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAssociations", () => {
    test("should return associations for a given docId", async () => {
      const mockRows = [{ aId: 1, doc1: 101, doc2: 102, typeId: 5 }];
      db.all.mockImplementation((sql, params, callback) => callback(null, mockRows));

      const result = await getAssociations(101);
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Association);
      expect(result[0].doc1).toBe(101);
      expect(db.all).toHaveBeenCalledTimes(1);
    });

    test("should reject on database error", async () => {
      db.all.mockImplementation((sql, params, callback) => callback(new Error("DB error"), null));

      await expect(getAssociations(101)).rejects.toThrow("DB error");
      expect(db.all).toHaveBeenCalledTimes(1);
    });
  });

  describe("insertAssociation", () => {
    test("should insert an association and return its ID", async () => {
      getTypeIdByType.mockResolvedValue(42);
      db.run
        .mockImplementationOnce((sql, params, callback) => callback(null)) // Update connections
        .mockImplementationOnce((sql, params, callback) => callback(null, { lastID: 123 })); // Insert association

      const association = { doc1: 101, doc2: 102, type: "LinkType" };

      const result = await insertAssociation(association);
      expect(result).toBe(123);
      expect(getTypeIdByType).toHaveBeenCalledWith("LinkType");
      expect(db.run).toHaveBeenCalledTimes(2);
    });

    test("should reject if type ID is not found", async () => {
      getTypeIdByType.mockRejectedValue(new Error("Type not found"));

      const association = { doc1: 101, doc2: 102, type: "InvalidType" };

      await expect(insertAssociation(association)).rejects.toThrow("Type not found");
      expect(getTypeIdByType).toHaveBeenCalledTimes(1);
    });

    test("should reject on database error during connection update", async () => {
      getTypeIdByType.mockResolvedValue(42);
      db.run.mockImplementation((sql, params, callback) => callback(new Error("Update error")));

      const association = { doc1: 101, doc2: 102, type: "LinkType" };

      await expect(insertAssociation(association)).rejects.toThrow("Update error");
      expect(db.run).toHaveBeenCalledTimes(1);
    });

    test("should reject on database error during association insert", async () => {
      getTypeIdByType.mockResolvedValue(42);
      db.run
        .mockImplementationOnce((sql, params, callback) => callback(null)) // Update connections
        .mockImplementationOnce((sql, params, callback) => callback(new Error("Insert error"))); // Insert association

      const association = { doc1: 101, doc2: 102, type: "LinkType" };

      await expect(insertAssociation(association)).rejects.toThrow("Insert error");
      expect(db.run).toHaveBeenCalledTimes(2);
    });
  });

  describe("deleteAssociation", () => {
    test("should delete an association successfully", async () => {
      db.run.mockImplementation((sql, params, callback) => callback(null));

      await expect(deleteAssociation(1)).resolves.toBeUndefined();
      expect(db.run).toHaveBeenCalledTimes(1);
    });

    test("should reject on database error", async () => {
      db.run.mockImplementation((sql, params, callback) => callback(new Error("Delete error")));

      await expect(deleteAssociation(1)).rejects.toThrow("Delete error");
      expect(db.run).toHaveBeenCalledTimes(1);
    });
  });

  describe("UpdateAssociation", () => {
    test("should update an association successfully", async () => {
      getTypeIdByType.mockResolvedValue(42);
      db.run.mockImplementation((sql, params, callback) => callback(null));

      const association = { aId: 1, doc1: 101, doc2: 102, type: "LinkType" };

      await expect(UpdateAssociation(association)).resolves.toBeUndefined();
      expect(getTypeIdByType).toHaveBeenCalledWith("LinkType");
      expect(db.run).toHaveBeenCalledTimes(1);
    });

    test("should reject if type ID is not found", async () => {
      getTypeIdByType.mockRejectedValue(new Error("Type not found"));

      const association = { aId: 1, doc1: 101, doc2: 102, type: "InvalidType" };

      await expect(UpdateAssociation(association)).rejects.toThrow("Type not found");
      expect(getTypeIdByType).toHaveBeenCalledTimes(1);
    });

    test("should reject on database error during update", async () => {
      getTypeIdByType.mockResolvedValue(42);
      db.run.mockImplementation((sql, params, callback) => callback(new Error("Update error")));

      const association = { aId: 1, doc1: 101, doc2: 102, type: "LinkType" };

      await expect(UpdateAssociation(association)).rejects.toThrow("Update error");
      expect(db.run).toHaveBeenCalledTimes(1);
    });
  });

  describe("CheckAssociation", () => {
    test("should return rows if association exists", async () => {
      const mockRows = [{ aId: 1, doc1: 101, doc2: 102, typeId: 42 }];
      getTypeIdByType.mockResolvedValue(42);
      db.all.mockImplementation((sql, params, callback) => callback(null, mockRows));

      const association = { doc1: 101, doc2: 102, type: "LinkType" };

      const result = await CheckAssociation(association);
      expect(result).toEqual(mockRows);
      expect(getTypeIdByType).toHaveBeenCalledWith("LinkType");
      expect(db.all).toHaveBeenCalledTimes(1);
    });

    test("should reject on database error", async () => {
      getTypeIdByType.mockResolvedValue(42);
      db.all.mockImplementation((sql, params, callback) => callback(new Error("DB error"), null));

      const association = { doc1: 101, doc2: 102, type: "LinkType" };

      await expect(CheckAssociation(association)).rejects.toThrow("DB error");
      expect(getTypeIdByType).toHaveBeenCalledWith("LinkType");
      expect(db.all).toHaveBeenCalledTimes(1);
    });

    test("should reject if type ID is not found", async () => {
      getTypeIdByType.mockRejectedValue(new Error("Type not found"));

      const association = { doc1: 101, doc2: 102, type: "InvalidType" };

      await expect(CheckAssociation(association)).rejects.toThrow("Type not found");
      expect(getTypeIdByType).toHaveBeenCalledTimes(1);
    });
  });
});
