import { test, expect, jest } from "@jest/globals"
import sqlite3 from 'sqlite3';
const { Database } = sqlite3.verbose();

import { getLinksType,getTypeIdByType } from "../../src/dao/LinkTypeDAO.mjs";

describe("getLinksType", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    test("correct getLinksType DAO", async () => {
        const DBdata=[
            {typeId:"t1",type:"collateral consequence"},
            {typeId:"t2",type:"direct consequence"},
            {typeId:"t3",type:"projection"},
            {typeId:"t4",type:"update"},
        ]

        const resultData=[
            "collateral consequence",
            "direct consequence",
            "projection",
            "update",
        ]

        jest.spyOn(Database.prototype, "all").mockImplementation((sql, params, callback) => {
            callback(null, DBdata);
            return ({});
        });

        await expect(getLinksType()).resolves.toStrictEqual(resultData);
        expect(Database.prototype.all).toHaveBeenCalledTimes(1);
    });
    
    test("getLinksType DAO - Error from DB", async () => {

        jest.spyOn(Database.prototype, "all").mockImplementation((sql, params, callback) => {
            callback(Error);
            return ({});
        });

        await expect(getLinksType()).rejects.toBe(Error);
        expect(Database.prototype.all).toHaveBeenCalledTimes(1);
    });
});


describe("getTypeIdByType", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    test("correct getLinksType DAO", async () => {
        const DBdata={typeId:"t2",type:"direct consequence"}
        const resultData="t2"
        const typeParameter="direct consequence"

        jest.spyOn(Database.prototype, "get").mockImplementation((sql, params, callback) => {
            callback(null, DBdata);
            return ({});
        });

        await expect(getTypeIdByType(typeParameter)).resolves.toStrictEqual(resultData);
        expect(Database.prototype.get).toHaveBeenCalledTimes(1);
    });

    test("getTypeIdByType DAO - Error from DB", async () => {

        const typeParameter="direct consequence"

        jest.spyOn(Database.prototype, "get").mockImplementation((sql, params, callback) => {
            callback(Error);
            return ({});
        });

        await expect(getTypeIdByType(typeParameter)).rejects.toBe(Error);
        expect(Database.prototype.get).toHaveBeenCalledTimes(1);
    });

    test("getTypeIdByType DAO - Error: type not found", async () => {

        const typeParameter="aueubfhe"    //wrong type passed

        jest.spyOn(Database.prototype, "get").mockImplementation((sql, params, callback) => {
            callback(null,null);    //the db doesn't find nothing
            return ({});
        });

        await expect(getTypeIdByType(typeParameter)).rejects.toStrictEqual(new Error("Type not found"));
        expect(Database.prototype.get).toHaveBeenCalledTimes(1);
    });
});


