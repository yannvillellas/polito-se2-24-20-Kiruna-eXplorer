import { test, expect, jest, describe, beforeEach } from "@jest/globals";
import { listDocuments, addDocument, deleteDocument } from "../../src/dao/documentDAO.mjs";
import { db } from "../../src/database/db.mjs";
import Document from "../../src/models/document.mjs";

jest.mock("../../src/database/db.mjs");

describe("documentDAO Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe("listDocuments", () => {
    test("should return a list of Document instances with stakeholders mapped", async () => {
      const mockDrows = [
        {
          docId: 1,
          title: "title1",
          description: "desc1",
          scale: "1:100",
          ASvalue: "AS1",
          issuanceDate: "2024-11-01",
          type: "Report",
          connections: 5,
          language: "EN",
          pages: 10,
        },
      ];
      const mockSrows = [{ docId: 1, name: "Stakeholder1" }];

      db.all
        .mockImplementationOnce((sql, params, callback) => callback(null, mockDrows)) // Fetch documents
        .mockImplementationOnce((sql, params, callback) => callback(null, mockSrows)); // Fetch stakeholders

      const result = await listDocuments();
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Document);
      expect(result[0].stakeholders).toBe("Stakeholder1");
      expect(db.all).toHaveBeenCalledTimes(2);
    });

    test("should return an empty array if no documents exist", async () => {
      db.all.mockImplementationOnce((sql, params, callback) => callback(null, []));
      const result = await listDocuments();
      expect(result).toEqual([]);
      expect(db.all).toHaveBeenCalledTimes(1);
    });

    test("should reject on first query database error", async () => {
      db.all.mockImplementationOnce((sql, params, callback) => callback(new Error("DB error"), null));

      await expect(listDocuments()).rejects.toThrow("DB error");
      expect(db.all).toHaveBeenCalledTimes(1);
    });

    test("should reject on second query database error", async () => {
      const mockDrows = [
        {
          docId: 1,
          title: "title1",
          description: "desc1",
          scale: "1:100",
          ASvalue: "AS1",
          issuanceDate: "2024-11-01",
          type: "Report",
          connections: 5,
          language: "EN",
          pages: 10,
        },
      ];

      db.all
        .mockImplementationOnce((sql, params, callback) => callback(null, mockDrows)) // Fetch documents
        .mockImplementationOnce((sql, params, callback) => callback(new Error("Stakeholder query error"), null)); // Fetch stakeholders

      await expect(listDocuments()).rejects.toThrow("Stakeholder query error");
      expect(db.all).toHaveBeenCalledTimes(2);
    });
  });

  describe("addDocument", () => {
    test("should add a new document and stakeholders, returning its ID", async () => {
      db.run.mockImplementationOnce(function (sql, params, callback) {
        callback.call({ lastID: 1 }, null);
      });

      db.run.mockImplementationOnce((sql, params, callback) => callback(null));

      const newDocument = {
        title: "title1",
        description: "desc1",
        scale: "1:100",
        issuanceDate: "2024-11-01",
        type: "Report",
        connections: 0,
        language: "EN",
        pages: 10,
        stakeholders: "1, 2",
      };

      const result = await addDocument(newDocument);
      expect(result).toBe(1);
      expect(db.run).toHaveBeenCalledTimes(3);
    });

    test("should reject on document insertion error", async () => {
      db.run.mockImplementationOnce((sql, params, callback) => callback(new Error("Insert error"), null));

      const newDocument = {
        title: "title1",
        description: "desc1",
        scale: "1:100",
        issuanceDate: "2024-11-01",
        type: "Report",
        connections: 0,
        language: "EN",
        pages: 10,
        stakeholders: "1, 2",
      };

      await expect(addDocument(newDocument)).rejects.toThrow("Insert error");
      expect(db.run).toHaveBeenCalledTimes(1);
    });

    test("should reject on stakeholders insertion error", async () => {
      
      db.run.mockImplementationOnce(function (sql, params, callback) {
        callback.call({ lastID: 1 }, null);
      });
      db.run.mockImplementationOnce((sql, params, callback) => callback(new Error("Stakeholder insert error"), null)); // Insert stakeholders

      const newDocument = {
        title: "title1",
        description: "desc1",
        scale: "1:100",
        issuanceDate: "2024-11-01",
        type: "Report",
        connections: 0,
        language: "EN",
        pages: 10,
        stakeholders: "1, 2",
      };

      await expect(addDocument(newDocument)).rejects.toThrow("Stakeholder insert error");
      expect(db.run).toHaveBeenCalledTimes(3);  //because we have 2 stakeholders--> 1 call for the document and 1 call for each stakeholder
    });
  });

  describe("deleteDocument", () => {
    test("should delete a document by ID", async () => {
      db.run.mockImplementation((sql, params, callback) => callback(null));

      await expect(deleteDocument(1)).resolves.toBeUndefined();
      expect(db.run).toHaveBeenCalledTimes(1);
    });

    test("should reject on database error", async () => {
      db.run.mockImplementation((sql, params, callback) => callback(new Error("Delete error"), null));

      await expect(deleteDocument(1)).rejects.toThrow("Delete error");
      expect(db.run).toHaveBeenCalledTimes(1);
    });
  });
});
