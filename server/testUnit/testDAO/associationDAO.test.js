import { test, expect, jest } from "@jest/globals"
import sqlite3 from 'sqlite3';
const { Database } = sqlite3.verbose();

import { getAssociations, insertAssociation, deleteAssociation, UpdateAssociation } from "../../src/dao/associationDAO.mjs";
import * as LinkTypeDAO from "../../src/dao/LinkTypeDAO.mjs";
//import { getTypeIdByType } from "../../src/dao/LinkTypeDAO.mjs";
import Association from "../../src/models/association.mjs";

describe("getAssociations", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    test("correct getAssociations DAO", async () => {
        const DBdata=[
            {aId:"a1",doc1:"docA",doc2:"docB",typeId:"t1"},
            {aId:"a2",doc1:"docA",doc2:"docB",typeId:"t2"},
            {aId:"a3",doc1:"docC",doc2:"docB",typeId:"t2"},
            {aId:"a4",doc1:"docD",doc2:"docC",typeId:"t4"},
        ]

        const resultData=[
            new Association("a1","docA","docB","t1"),
            new Association("a2","docA","docB","t2"),
            new Association("a3","docC","docB","t2"),
            new Association("a4","docD","docC","t4"),
        ]
        
        jest.spyOn(Database.prototype, "all").mockImplementation((sql, params, callback) => {
            callback(null, DBdata);
            return ({});
        });

        await expect(getAssociations()).resolves.toStrictEqual(resultData);
        expect(Database.prototype.all).toHaveBeenCalledTimes(1);
    });

    test("getAssociations DAO - Error from DB", async () => {
        
        jest.spyOn(Database.prototype, "all").mockImplementation((sql, params, callback) => {
            callback(Error);
            return ({});
        });

        await expect(getAssociations()).rejects.toBe(Error);
        expect(Database.prototype.all).toHaveBeenCalledTimes(1);
    });
});


describe("insertAssociation", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    test("correct insertAssociation DAO", async () => {
        const association={doc1:"docA",doc2:"docB",type:"direct consequence"}
        const typeId="t1"

        jest.spyOn(LinkTypeDAO,"getTypeIdByType").mockResolvedValueOnce(typeId)
        jest.spyOn(Database.prototype, "run").mockImplementation((sql, params, callback) => {
            callback(null);
            return ({});
        });

        await expect(insertAssociation(association)).resolves.toBe();
        expect(Database.prototype.run).toHaveBeenCalledTimes(1);
    });

    test("insertAssociation DAO - Error from DB", async () => {
        const association={doc1:"docA",doc2:"docB",type:"direct consequence"}
        const typeId="t1"

        jest.spyOn(LinkTypeDAO,"getTypeIdByType").mockResolvedValueOnce(typeId)
        jest.spyOn(Database.prototype, "run").mockImplementation((sql, params, callback) => {
            callback(Error);
            return ({});
        });

        await expect(insertAssociation(association)).rejects.toBe(Error);
        expect(Database.prototype.run).toHaveBeenCalledTimes(1);
    });

    test("insertAssociation DAO - Error from getTypeIdByType", async () => {
        const association={doc1:"docA",doc2:"docB",type:"direct consequence"}

        jest.spyOn(LinkTypeDAO,"getTypeIdByType").mockRejectedValueOnce(Error)

        await expect(insertAssociation(association)).rejects.toBe(Error);
        expect(Database.prototype.run).toHaveBeenCalledTimes(0);
    });
});

describe("deleteAssociation", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    test("correct deleteAssociation DAO", async () => {
        const aId="a1"

        jest.spyOn(Database.prototype, "run").mockImplementation((sql, params, callback) => {
            callback(null);
            return ({});
        });

        await expect(deleteAssociation(aId)).resolves.toBe();
        expect(Database.prototype.run).toHaveBeenCalledTimes(1);
    });

    test("insertAssociation DAO - Error from DB", async () => {
        const aId="a1"

        jest.spyOn(Database.prototype, "run").mockImplementation((sql, params, callback) => {
            callback(Error);
            return ({});
        });

        await expect(deleteAssociation(aId)).rejects.toBe(Error);
        expect(Database.prototype.run).toHaveBeenCalledTimes(1);
    });
});

describe("UpdateAssociation", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    test("correct UpdateAssociation DAO", async () => {
        const association={doc1:"docA",doc2:"docB",type:"direct consequence"}
        const typeId="t1"

        jest.spyOn(LinkTypeDAO,"getTypeIdByType").mockResolvedValueOnce(typeId)
        jest.spyOn(Database.prototype, "run").mockImplementation((sql, params, callback) => {
            callback(null);
            return ({});
        });

        await expect(UpdateAssociation(association)).resolves.toBe();
        expect(Database.prototype.run).toHaveBeenCalledTimes(1);
    });

    test("UpdateAssociation DAO - Error from DB", async () => {
        const association={doc1:"docA",doc2:"docB",type:"direct consequence"}
        const typeId="t1"

        jest.spyOn(LinkTypeDAO,"getTypeIdByType").mockResolvedValueOnce(typeId)
        jest.spyOn(Database.prototype, "run").mockImplementation((sql, params, callback) => {
            callback(Error);
            return ({});
        });

        await expect(UpdateAssociation(association)).rejects.toBe(Error);
        expect(Database.prototype.run).toHaveBeenCalledTimes(1);
    });

    test("UpdateAssociation DAO - Error from getTypeIdByType", async () => {
        const association={doc1:"docA",doc2:"docB",type:"direct consequence"}

        jest.spyOn(LinkTypeDAO,"getTypeIdByType").mockRejectedValueOnce(Error)

        await expect(UpdateAssociation(association)).rejects.toBe(Error);
        expect(Database.prototype.run).toHaveBeenCalledTimes(0);
    });
});