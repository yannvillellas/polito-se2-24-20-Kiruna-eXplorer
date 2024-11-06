import {db} from "../database/db.mjs"
import Document from "../models/document.mjs"

export const listDocuments = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM Document", (err, rows) => {
            if (err) {
                reject(err);
            } else {
                if(rows){
                    const documents = rows.map(row => new Document(row.docId, row.title, row.description, row.stackeholders, row.scale, row.issuanceDate, row.type, row.connections, row.language, row.pages));
                    resolve(documents);
                }else{
                    resolve([]);
                }
            }
        });
    });
}


export const addDocument = (document) => {
    return new Promise((resolve, reject) => {
        // controllo pirma se c'è già un documento con lo stesso id
        db.get("SELECT * FROM Document WHERE docId = ?", [document.id], (err, row) => {
            if (err) {
                reject(err);
            } else if (row) {
                reject(new Error("Document already exists"));
            } else {
                db.run("INSERT INTO Document (docId, title, description, stackeholders, scale, issuanceDate, type, connections, language, pages) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [document.id, document.title, document.description, document.stakeholders, document.scale, document.issuanceDate, document.type, document.connections, document.language, document.pages], (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            }
        });

    });
}