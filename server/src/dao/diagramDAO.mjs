import { db } from "../database/db.mjs"

export const getNodesPositions = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM NodesPositions';
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const result = rows.reduce((acc, row) => {
                    acc[row.docId] = { x: row.x, y: row.y };
                    return acc;
                }, {}); // Usa reduce per costruire il dizionario
                resolve(result);
            }
        });
    });
};

export const saveNodesPosition = (positions) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO NodesPositions (docId, x, y) VALUES (?, ?, ?)';
        const insertPromises = [];

        Object.entries(positions).forEach(([docId, { x, y }]) => {
            insertPromises.push(
                new Promise((innerResolve, innerReject) => {
                    db.run(sql, [docId, x, y], (err) => {
                        if (err) {
                            innerReject(err);
                        } else {
                            innerResolve();
                        }
                    });
                })
            );
        });

        // Esegui tutte le insert in parallelo
        Promise.all(insertPromises)
            .then(() => resolve())
            .catch((err) => reject(err));
    });
};

export const clearAllPositions = () => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM NodesPositions';
        db.run(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

export const updateNodePosition = (position) => {
    return new Promise(async (resolve, reject) => {
        try {
            const updateSql = 'UPDATE NodesPositions SET x=?, y=? WHERE docId=?';
            db.run(updateSql, [parseFloat(position.x, 10), parseFloat(position.y, 10), parseInt(position.docId, 10)], (err) => {
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



export const getXValues = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM XScale';
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const result = rows.map((row)=>row.value)
                resolve(result);
            }
        });
    });
};

export const getYValues = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM YScale';
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const result = rows.map((row)=>row.value)
                resolve(result);
            }
        });
    });
};

export const addNewX = (xToAdd) => {
    console.log("nel dao aggiungo alle x", xToAdd)
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO XScale (value) VALUES (?)';
        const insertPromises = [];

        // Itera sull'array di stringhe
        xToAdd.forEach((value) => {
            insertPromises.push(
                new Promise((innerResolve, innerReject) => {
                    db.run(sql, [value], (err) => {
                        if (err) {
                            innerReject(err);
                        } else {
                            innerResolve();
                        }
                    });
                })
            );
        });

        // Esegui tutte le insert in parallelo
        Promise.all(insertPromises)
            .then(() => resolve())
            .catch((err) => reject(err));
    });
};

export const addNewY = (yToAdd) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO YScale (value) VALUES (?)';
        const insertPromises = [];

        // Itera sull'array di stringhe
        yToAdd.forEach((value) => {
            insertPromises.push(
                new Promise((innerResolve, innerReject) => {
                    db.run(sql, [value], (err) => {
                        if (err) {
                            innerReject(err);
                        } else {
                            innerResolve();
                        }
                    });
                })
            );
        });

        // Esegui tutte le insert in parallelo
        Promise.all(insertPromises)
            .then(() => resolve())
            .catch((err) => reject(err));
    });
};