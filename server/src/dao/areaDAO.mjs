import { db } from "../database/db.mjs"
import { Area, AreaAssociation}  from "../models/areas.mjs"


export const addArea = (docId, areaType, coordinates) => {
    return new Promise((resolve, reject) => {

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
    });
}


export const listAreas = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM Area", (err, rows) => {
            if (err) {
                reject(err);
            } else {
                if (rows) {
                    const areas = rows.map(row => new Area(row.areaId, row.areaType, JSON.parse(row.coordinates) ));
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
