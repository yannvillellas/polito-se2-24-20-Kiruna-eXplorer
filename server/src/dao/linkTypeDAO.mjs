import {db} from "../database/db.mjs"

export const getLinksType= () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM LinkType'
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const result= rows.map(row=>row.type);
                resolve(result)
            }
        })
    });
}

export const getTypeIdByType = (type) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT typeId FROM LinkType WHERE type = ?', [type], (err, row) => {
            if (err) {
                reject(err);
            } else if (!row) {
                reject(new Error("Type not found"));
            } else {
                resolve(row.typeId);
            }
        });
    });
};

export const getTypeByTypeId = (id) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT type FROM LinkType WHERE typeId = ?', [id], (err, row) => {
            if (err) {
                reject(err);
            } else if (!row) {
                reject(new Error("Type not found"));
            } else {
                resolve(row.type);
            }
        });
    });
};