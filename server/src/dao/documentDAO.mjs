import { db } from "../database/db.mjs"
import Document from "../models/document.mjs"

export const listDocuments = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT docId, title, description, s.name as scale, ASvalue, issuanceDate, dt.type as type, connections, language, pages
                     FROM Document d, Scale s, DocumentType dt
                     WHERE d.scale=s.scaleId AND d.type=dt.dtId;`;
        db.all(sql, [], async (err, drows) => {
            if (err) {
                console.log("primo errore ", err);
                reject(err);
            } else {
                if (drows) {
                    try {
                        const srows = await getStakeholders();
                        const documents = drows.map(row => new Document(
                            row.docId,
                            row.title,
                            row.description,
                            srows.filter(s => s.docId == row.docId).map(s => s.name).join(', '), // stakeholders
                            row.scale,
                            row.ASvalue,
                            row.issuanceDate,
                            row.type,
                            row.connections,
                            row.language,
                            row.pages
                        ));
                        console.log(documents);
                        resolve(documents);
                    } catch (error) {
                        console.log("secondo errore");
                        reject(error);
                    }
                } else {
                    resolve([]);
                }
            }
        });
    });
};

const getStakeholders = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT ds.docId, s.name from Stakeholder s, DocStakeholders ds WHERE s.shId=ds.shId", [], (err, srows) => {
            if (err) {
                reject(err);
            } else {
                resolve(srows);
            }
        });
    });
};

const insertDocStakeholders = (docId, stakeholders) => {
    return new Promise((resolve, reject) => {
        const promises = stakeholders.split(', ').map(shId => {
            return new Promise((resolve, reject) => {
                db.run("INSERT INTO DocStakeholders (docId, shId) VALUES (?, ?)", [parseInt(docId, 10), parseInt(shId, 10)], (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        });
        Promise.all(promises)
            .then(() => resolve(docId))
            .catch(reject);
    });
};

export const addDocument = (document) => {
    return new Promise((resolve, reject) => {
        db.run("INSERT INTO Document (title, description, scale, ASvalue, issuanceDate, type, connections, language, pages) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", 
            [
                document.title, 
                document.description, 
                document.scale, 
                document.ASvalue,
                document.issuanceDate, 
                document.type, 
                document.connections, 
                document.language, 
                document.pages
            ],
            function (err) {
                if (err) {
                    reject(err);
                } else {
                    const docId = this.lastID;
                    insertDocStakeholders(docId, document.stakeholders)
                        .then(resolve)
                        .catch(reject);
                }
            }
        );
    });
};

export const deleteDocument = (docId) =>{
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM Document WHERE docId=?'
        db.run(sql,[docId],(err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        })
    })
}

