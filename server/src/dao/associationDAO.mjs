import { db } from "../database/db.mjs"
import Association from "../models/association.mjs"
import { getTypeIdByType } from "./LinkTypeDAO.mjs";

//get association for a specific docId
export const getAssociations = (docId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM Association WHERE doc1=? OR doc2=?'
        db.all(sql, [docId,docId], (err, rows) => {
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
            const insertSql = 'INSERT INTO Association (doc1, doc2, typeId) VALUES (?, ?, ?)';
            db.run(insertSql, [association.doc1, association.doc2, typeId], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        } catch (err) {
            reject(err);
        }
    });
};


//assumption: i have to recive the association ID from the front end
export const deleteAssociation = (aId) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM Association where aId= ?'
        db.run(sql, [aId], (err, rows) => {
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
            db.run(updateSql, [association.doc1, association.doc2, typeId, association.aId], (err) => {
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