import { test, expect, jest } from "@jest/globals";
import { listDocuments } from "../../src/dao/documentDAO.mjs";
import Document from "../../src/models/document.mjs"; // Importa la classe Document
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
                { docId: 1, title: 'titolo1', description: 'descrizione1', stackeholders: null, scale: null, issuanceDate: null, type: null, connections: null, language: null, pages: null },
                { docId: 2, title: 'titolo2', description: 'descrizione2', stackeholders: null, scale: null, issuanceDate: null, type: null, connections: null, language: null, pages: null }
            ];

            jest.spyOn(Database.prototype, "all").mockImplementation((sql, callback) => {
                callback(null, mockRows); // Simula il recupero di righe dal database
            });

            const result = await listDocuments();
            expect(result).toHaveLength(2);
            expect(result[0]).toBeInstanceOf(Document); 
            expect(result[0].title).toBe('titolo1');
            expect(result[1].title).toBe('titolo2');
            expect(Database.prototype.all).toHaveBeenCalledTimes(1);
        });

        test("should return an empty array if no documents exist", async () => {
            jest.spyOn(Database.prototype, "all").mockImplementation((sql, callback) => {
                callback(null, []); 
            });

            const result = await listDocuments();
            expect(result).toHaveLength(0);
            expect(Database.prototype.all).toHaveBeenCalledTimes(1);
        });

        test("should reject on database error", async () => {
            jest.spyOn(Database.prototype, "all").mockImplementation((sql, callback) => {
                callback(new Error("Database error"), null); // Simulate a database error
            });

            await expect(listDocuments()).rejects.toThrow("Database error");
        });
    });
});
