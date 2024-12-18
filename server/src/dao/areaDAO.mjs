import { db } from "../database/db.mjs"
import { Area, AreaAssociation } from "../models/areas.mjs"


export const addArea = (docId, areaType, coordinates) => {
    return new Promise((resolve, reject) => {
        // Prima di inserire l'area controllo il caso in cui ci sia gia' (caso di set pre-existing area)
        // lo vedo se c'è già areaType e coordinates
        db.get("SELECT areaId FROM Area WHERE areaType = ? AND coordinates = ?", [areaType, coordinates], (err, row) => {
            if (err) {
                reject(err);
            } else {
                if (row) {

                    // Ed aggiungi row.areaId a AreaAssociation
                    db.run("INSERT INTO AreaAssociation (areaId, docId) VALUES (?, ?)",
                        [
                            row.areaId,
                            docId
                        ],
                        function (err) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(row.areaId);
                            }
                        }
                    );


                } else {
                    // Altrimenti inserisco l'area
                    db.run("INSERT INTO Area (areaType, coordinates) VALUES (?, ?)",
                        [
                            areaType,
                            coordinates
                        ],
                        function (err) { // I need it for enable this.lastID
                            if (err) {
                                reject(err);
                            } else {
                                const areaId = this.lastID;
                                db.run("INSERT INTO AreaAssociation (areaId, docId) VALUES (?, ?)",
                                    [
                                        areaId,
                                        docId
                                    ],
                                    function (err) {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            resolve(areaId);
                                        }
                                    }
                                );

                            }
                        }
                    );
                }
            }
        });

    });
}


export const listAreas = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM Area", (err, rows) => {
            if (err) {
                reject(err);
            } else {
                if (rows) {
                    const areas = rows.map(row => new Area(row.areaId, row.areaType, JSON.parse(row.coordinates)));
                    resolve(areas);
                } else {
                    resolve([]);
                }
            }
        });
    });
}


export const listAreaAssociations = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM AreaAssociation", (err, rows) => {
            if (err) {
                reject(err);
            } else {
                if (rows) {
                    const associations = rows.map(row => new AreaAssociation(row.areaId, row.docId));
                    resolve(associations);
                } else {
                    resolve([]);
                }
            }
        });
    });
}


export const addAreaAssociation = (areaId, docId) => {
    return new Promise((resolve, reject) => {
        db.run("INSERT INTO AreaAssociation (areaId, docId) VALUES (?, ?)",
            [
                areaId,
                docId
            ],
            function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            }
        );
    });
}


export const deleteAreaAssociation = (docId) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM AreaAssociation WHERE  docId = ?", [docId], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}