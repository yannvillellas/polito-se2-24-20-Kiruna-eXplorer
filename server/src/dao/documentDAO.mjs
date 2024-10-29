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
