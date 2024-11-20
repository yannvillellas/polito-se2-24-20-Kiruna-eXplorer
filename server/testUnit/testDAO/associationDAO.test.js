import { test, expect, jest } from "@jest/globals"
import sqlite3 from 'sqlite3';
const { Database } = sqlite3.verbose();

import { getAssociations, insertAssociation, deleteAssociation, UpdateAssociation } from "../../src/dao/associationDAO.mjs";
//import { getTypeIdByType } from "../../src/dao/LinkTypeDAO.mjs";
import Association from "../../src/models/association.mjs";
import { getTypeIdByType } from "../../src/dao/LinkTypeDAO.mjs";
import * as LinkTypeDAO from "../../src/dao/LinkTypeDAO.mjs";

describe("Association DAO Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    describe("getAssociations", () => {
        
        test("should return a list of Association instances", async () => {
            const mockRows = [
                { aId: 1, doc1: 1, doc2: 2, typeId: 1 },
                { aId: 2, doc1: 2, doc2: 3, typeId: 2 }
            ];

            jest.spyOn(Database.prototype, "all").mockImplementation((sql, params, callback) => {
                callback(null, mockRows); // Simula il recupero di righe dal database
            });

            const result = await getAssociations(1);
            expect(result).toHaveLength(2);
            expect(result[0]).toBeInstanceOf(Association); // Controlla che il risultato sia un'istanza di Association
            expect(result[0].doc1).toBe(1);
            expect(result[1].doc1).toBe(2);
            expect(Database.prototype.all).toHaveBeenCalledTimes(1);
        });
        

        test("should return an empty array if no associations exist", async () => {
            jest.spyOn(Database.prototype, "all").mockImplementation((sql, params, callback) => {
                callback(null, []); // Simula il recupero di un array vuoto
            });

            const result = await getAssociations(1);
            expect(result).toHaveLength(0);
            expect(Database.prototype.all).toHaveBeenCalledTimes(1);
        });

        test("should reject on database error", async () => {
            jest.spyOn(Database.prototype, "all").mockImplementation((sql, params, callback) => {
                callback(new Error("Database error"), null); // Simula un errore nel database
            });

            await expect(getAssociations(1)).rejects.toThrow("Database error");
        });
    });

    
    describe("insertAssociation", () => {
        test("should correctly add an association to the database (no error) ", async () => {
            const validAssociation = {
                doc1: 1,
                doc2: 2,
                type: "direct consequence"
            };

            const typeId = await getTypeIdByType(validAssociation.type);

            jest.spyOn(Database.prototype, "run").mockImplementation((sql, params, callback) => {
                callback(null); // Simula l'aggiornamento di una riga nel database
            });

            jest.spyOn(Database.prototype, "all").mockImplementation((sql, params, callback) => {
                callback(null, [{ typeId: 1 }]); // Simula il recupero di un typeId dal database
            });

            const result = await insertAssociation(validAssociation).catch((err) => console.log(err)); // cannt use expect because of this.lastId
            expect(Database.prototype.run).toHaveBeenCalledTimes(2);
            
        })
    });
    

    describe("deleteAssociation", () => {
        test("should correctly delete an association from the database (no error) ", async () => {
            jest.spyOn(Database.prototype, "run").mockImplementation((sql, params, callback) => {
                callback(null); // Simula la cancellazione di una riga dal database
            });

            await deleteAssociation(1);
            expect(Database.prototype.run).toHaveBeenCalledTimes(1);
        });

        test("should reject on database error", async () => {
            jest.spyOn(Database.prototype, "run").mockImplementation((sql, params, callback) => {
                callback(new Error("Database error")); // Simula un errore nel database
            });

            await expect(deleteAssociation(1)).rejects.toThrow("Database error");
        });
    });

    describe("UpdateAssociation", () => {
        test("should correctly update an association in the database (no error) ", async () => {
            const validAssociation = {
                doc1: 1,
                doc2: 2,
                type: "direct consequence"
            };

            jest.spyOn(Database.prototype, "run").mockImplementation((sql, params, callback) => {
                callback(null); // Simula l'aggiornamento di una riga nel database
            });

            jest.spyOn(Database.prototype, "all").mockImplementation((sql, params, callback) => {
                callback(null, [{ typeId: 1 }]); // Simula il recupero di un typeId dal database
            });

            await UpdateAssociation(validAssociation);
            expect(Database.prototype.run).toHaveBeenCalledTimes(1);
        });

        test("should reject on database error", async () => {
            const invalidAssociation = {
                aId: 1,
                doc1: 1,
                doc2: 2,
                type: "direct consequence"
            };

            const typeId = await getTypeIdByType(invalidAssociation.type);

            jest.spyOn(Database.prototype, "run").mockImplementation((sql, params, callback) => {
                callback(new Error("Database error")); // Simula un errore nel database
            });

            await expect(UpdateAssociation(invalidAssociation)).rejects.toThrow("Database error");
            expect(Database.prototype.run).toHaveBeenCalledTimes(1);
        });
    });

});
