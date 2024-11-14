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
        db.run("INSERT INTO Document (title, description, stackeholders, scale, issuanceDate, type, connections, language, pages) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", 
            [
                document.title, 
                document.description, 
                document.stakeholders, 
                document.scale, 
                document.issuanceDate, 
                document.type, 
                document.connections, 
                document.language, 
                document.pages
            ],

            function (err) { // I need it for enable this.lastID
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID);
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