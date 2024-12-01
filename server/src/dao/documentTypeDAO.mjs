import { db } from "../database/db.mjs"

export const getDocumentTypes = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM DocumentType", (err, rows) => {
            if (err) {
                reject(err);
            } else {
                /*const DocumentTypes = rows.map((row) => row.type);
                resolve(DocumentTypes);*/
                resolve(rows)
            }
        });
    });
}

export const addDocumentType = (newValue) => {
    return new Promise((resolve, reject) => {
        db.run("INSERT INTO DocumentType (type) VALUES (?)", [newValue], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID)
            }
        });
    });
};