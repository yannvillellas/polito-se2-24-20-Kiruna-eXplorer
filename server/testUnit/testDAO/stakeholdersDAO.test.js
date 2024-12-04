import { test, expect, jest, describe, beforeEach } from "@jest/globals";
import { getStakeholders, addStakeholder } from "../../src/dao/stakeholdersDAO.mjs";
import { db } from "../../src/database/db.mjs";

jest.mock("../../src/database/db.mjs");

describe("stakeholdersDAO Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe("getStakeholders", () => {
    test("should return a list of stakeholders", async () => {
      const mockRows = [
        { shId: 1, name: "Stakeholder1" },
        { shId: 2, name: "Stakeholder2" },
      ];

      db.all.mockImplementation((sql, callback) => callback(null, mockRows));

      const result = await getStakeholders();
      expect(result).toEqual(mockRows);
      expect(db.all).toHaveBeenCalledTimes(1);
    });

    test("should return an empty list if no stakeholders exist", async () => {
      db.all.mockImplementation((sql, callback) => callback(null, []));

      const result = await getStakeholders();
      expect(result).toEqual([]);
      expect(db.all).toHaveBeenCalledTimes(1);
    });

    test("should reject on database error", async () => {
      db.all.mockImplementation((sql, callback) => callback(new Error("DB error"), null));

      await expect(getStakeholders()).rejects.toThrow("DB error");
      expect(db.all).toHaveBeenCalledTimes(1);
    });
  });

  describe("addStakeholder", () => {
    test("should add a new stakeholder and return its ID", async () => {
      db.run.mockImplementation((sql, params, callback) => callback(null, { lastID: 123 }));

      const result = await addStakeholder("Stakeholder3");
      expect(result).toBe(123);
      expect(db.run).toHaveBeenCalledTimes(1);
    });

    test("should reject on database error during insertion", async () => {
      db.run.mockImplementation((sql, params, callback) => callback(new Error("Insert error"), null));

      await expect(addStakeholder("Stakeholder3")).rejects.toThrow("Insert error");
      expect(db.run).toHaveBeenCalledTimes(1);
    });
  });
});
