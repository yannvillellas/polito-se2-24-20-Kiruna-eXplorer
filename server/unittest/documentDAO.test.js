import { test, expect, jest } from "@jest/globals";
import { listDocuments, addDocument, deleteDocument } from "../../src/dao/documentDAO.mjs";
import Document from "../../src/models/document.mjs";
import sqlite3 from "sqlite3";
const { Database } = sqlite3.verbose();

describe("Document DAO Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    describe("listDocuments", () => {
        test("should return a list of Document instances", async () => {
            const mockRows = [
                { docId: 1, title: 'titolo1', description: 'descrizione1', scale: '1:100', ASvalue: '100', issuanceDate: '2024-01-01', type: 'Report', connections: 'Connection1', language: 'EN', pages: 10 },
                { docId: 2, title: 'titolo2', description: 'descrizione2', scale: '1:200', ASvalue: '200', issuanceDate: '2024-02-01', type: 'Article', connections: 'Connection2', language: 'IT', pages: 20 }
            ];

            const mockStakeholders = [
                { docId: 1, name: 'Stakeholder1' },
                { docId: 1, name: 'Stakeholder2' },
                { docId: 2, name: 'Stakeholder3' }
            ];

            // Mock db.all for fetching documents
            jest.spyOn(Database.prototype, "all").mockImplementation((sql, params, callback) => {
                if (sql.includes("SELECT docId, title")) {
                    callback(null, mockRows); // Simulate document rows
                } else if (sql.includes("SELECT ds.docId, s.name")) {
                    callback(null, mockStakeholders); // Simulate stakeholder rows
                }
            });

            const result = await listDocuments();
            expect(result).toHaveLength(2);
            expect(result[0]).toBeInstanceOf(Document);
            expect(result[0].title).toBe('titolo1');
            expect(result[0].stakeholders).toBe('Stakeholder1, Stakeholder2');
            expect(result[1].stakeholders).toBe('Stakeholder3');
            expect(Database.prototype.all).toHaveBeenCalledTimes(2);
        });

        test("should return an empty array if no documents exist", async () => {
            jest.spyOn(Database.prototype, "all").mockImplementation((sql, callback) => {
                callback(null, []); // Simulate no documents
            });

            const result = await listDocuments();
            expect(result).toHaveLength(0);
            expect(Database.prototype.all).toHaveBeenCalledTimes(1);
        });

        test("should reject on database error", async () => {
            jest.spyOn(Database.prototype, "all").mockImplementation((sql, callback) => {
                callback(new Error("Database error"), null); // Simulate error
            });

            await expect(listDocuments()).rejects.toThrow("Database error");
        });
    });

    describe("addDocument", () => {
        test("should correctly add a document to the database (no error)", async () => {
            const validDocument = {
                title: 'Test Document',
                description: 'This is a test document.',
                scale: '1:100',
                issuanceDate: '2024-11-01',
                type: 'Report',
                connections: 'Connection1',
                language: 'EN',
                pages: 10,
                stakeholders: '1, 2' // Simulating stakeholders
            };

            // Mock db.run to simulate successful insertion into Document table
            jest.spyOn(Database.prototype, "run").mockImplementation((sql, params, callback) => {
                callback(null); // Simulate successful insert
            });

            // Mock db.run to simulate insertion into DocStakeholders table
            jest.spyOn(Database.prototype, "run").mockImplementation((sql, params, callback) => {
                callback(null); // Simulate successful insert for each stakeholder
            });

            const result = await addDocument(validDocument);
            expect(Database.prototype.run).toHaveBeenCalledTimes(2); // one for Document, one for DocStakeholders
        });

        test("should reject on insert error", async () => {
            const validDocument = {
                title: 'Test Document',
                description: 'This is a test document.',
                scale: '1:100',
                issuanceDate: '2024-11-01',
                type: 'Report',
                connections: 'Connection1',
                language: 'EN',
                pages: 10,
                stakeholders: '1, 2'
            };

            jest.spyOn(Database.prototype, "run").mockImplementation((sql, params, callback) => {
                callback(new Error("Insert error")); // Simulate insert error
            });

            await expect(addDocument(validDocument)).rejects.toThrow("Insert error");
        });
    });

    describe("deleteDocument", () => {
        test("should correctly delete a document from the database (no error)", async () => {
            jest.spyOn(Database.prototype, "run").mockImplementation((sql, params, callback) => {
                callback(null); // Simulate successful delete
            });

            const result = await deleteDocument(1);
            expect(result).toBeUndefined();
            expect(Database.prototype.run).toHaveBeenCalledTimes(1);
        });

        test("should reject on delete error", async () => {
            jest.spyOn(Database.prototype, "run").mockImplementation((sql, params, callback) => {
                callback(new Error("Delete error")); // Simulate delete error
            });

            await expect(deleteDocument(1)).rejects.toThrow("Delete error");
            expect(Database.prototype.run).toHaveBeenCalledTimes(1);
        });

        test("should reject on database error", async () => {
            jest.spyOn(Database.prototype, "run").mockImplementation((sql, params, callback) => {
                callback(new Error("Database error"), null); // Simulate database error
            });

            await expect(deleteDocument(1)).rejects.toThrow("Database error");
            expect(Database.prototype.run).toHaveBeenCalledTimes(1);
        });
    });
});
