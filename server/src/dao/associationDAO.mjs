import { db } from "../database/db.mjs"
import Association from "../models/association.mjs"
import { getTypeIdByType } from "./linkTypeDAO.mjs"

//get association for a specific docId
export const getAssociations = (docId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM Association WHERE doc1=? OR doc2=?'
        db.all(sql, [parseInt(docId, 10), parseInt(docId, 10)], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const result = rows.map(row => new Association(row.aId, row.doc1, row.doc2, row.typeId));
                resolve(result);
            }
        })
    });
}

// association={doc1,doc2,type}; where type is a string not the typeId--> we have to search it, where doc1, doc2 are the docId of the documents

export const insertAssociation = (association) => {
    return new Promise(async (resolve, reject) => {
        try {
            const typeId = await getTypeIdByType(association.type);
            // It should add +1 to the field connections where docId = docId1 or docId = docId2
            db.run('UPDATE Document SET connections = connections + 1 WHERE docId = ? OR docId = ?', [parseInt(association.doc1, 10), parseInt(association.doc2, 10)], function (err) {
                if (err) {
                    reject(err);
                } else {
                    try { // Inizio del blocco try interno
                        const insertSql = 'INSERT INTO Association (doc1, doc2, typeId) VALUES (?, ?, ?)';
                        db.run(insertSql, [parseInt(association.doc1, 10), parseInt(association.doc2, 10), parseInt(typeId, 10)], function (err) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(this.lastID);
                            }
                        });
                    } catch (err) { // Chiusura del blocco try-catch interno
                        reject(err);
                    }
                }
            });
        } catch (err) { // Chiusura del blocco try-catch esterno
            reject(err);
        }
    });
};


//assumption: i have to recive the association ID from the front end
export const deleteAssociation = (aId) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM Association where aId= ?'
        db.run(sql, [parseInt(aId, 10)], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        })
    });
}

export const UpdateAssociation = (association) => {
    return new Promise(async (resolve, reject) => {
        try {
            const typeId = await getTypeIdByType(association.type);
            const updateSql = 'UPDATE Association SET doc1=?, doc2=?, typeId=? WHERE aId=?';
            db.run(updateSql, [parseInt(association.doc1, 10), parseInt(association.doc2, 10), parseInt(typeId, 10), parseInt(association.aId, 10)], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        } catch (err) {
            reject(err);
        }
    });
};


/* to test */
export const CheckAssociation = (association)=>{
    return new Promise((resolve, reject) => {
        const executeAsyncLogic = async () => {
            try {
                const typeId = await getTypeIdByType(association.type);
                const sql = 'SELECT * FROM Association WHERE (doc1=? OR doc1=?) AND (doc2=? OR doc2=?) AND typeId=?';
                
                db.all(sql, [
                    parseInt(association.doc1, 10),
                    parseInt(association.doc2, 10),
                    parseInt(association.doc1, 10),
                    parseInt(association.doc2, 10),
                    parseInt(typeId, 10)
                ], (err, rows) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        console.log(rows);
                        resolve(rows); // Se `rows` è undefined, l'associazione non esiste
                    }
                });
            } catch (err) {
                reject(err);
            }
        };

        // Chiama la logica asincrona
        executeAsyncLogic();
    });
}