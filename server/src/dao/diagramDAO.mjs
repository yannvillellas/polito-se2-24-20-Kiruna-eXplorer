import { db } from "../database/db.mjs"

export const getTraslatedNodes = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM TraslatedNode';
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

export const addNodeTraslation = (node)=>{
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO TraslatedNode (docId,x,y) VALUES (?,?,?)'
        db.run(sql,[node.docId,node.x,node.y],(err, rows)=>{
            if(err){
                reject(err)
            }else{
                resolve()
            }
        })
    })
}

export const updateNodeTraslation = (node)=>{
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE TraslatedNode SET x=?, y=? WHERE docId=?'
        db.run(sql,[node.x,node.y,node.docId],(err, rows)=>{
            if(err){
                reject(err)
            }else{
                resolve()
            }
        })
    })
}

/*export const updateNodeTraslation = (node) => {
    return new Promise((resolve, reject) => {
        const selectSql = 'SELECT x, y FROM TraslatedNode WHERE docId = ?';
        db.get(selectSql, [node.docId], (err, row) => {
            if (err) {
                return reject(err);
            }

            if (!row) {
                return reject(new Error(`Node with docId ${node.docId} not found`));
            }

            // Calcola i nuovi valori sommando le traslazioni
            const newX = row.x + node.x;
            const newY = row.y + node.y;

            const updateSql = 'UPDATE TraslatedNode SET x = ?, y = ? WHERE docId = ?';
            db.run(updateSql, [newX, newY, node.docId], (updateErr) => {
                if (updateErr) {
                    return reject(updateErr);
                }
                resolve();
            });
        });
    });
};*/



/*export const getNodesPositions = () => {
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
};*/

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

/*export const updateNodePosition = (position) => {
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
};*/



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

export const getDimensions = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT name, value FROM Dimension WHERE name IN ("width", "height")';
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const result = rows.reduce((acc, row) => {
                    acc[row.name] = parseInt(row.value, 10);
                    return acc;
                }, {});
                resolve(result);
            }
        });
    });
};

// Aggiungi o aggiorna width e height
export const addDimensions = (width, height) => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO Dimension (name, value) VALUES (?, ?)
            ON CONFLICT(name) DO UPDATE SET value = excluded.value
        `;
        const insertPromises = [
            new Promise((innerResolve, innerReject) => {
                db.run(sql, ['width', width], (err) => {
                    if (err) {
                        innerReject(err);
                    } else {
                        innerResolve();
                    }
                });
            }),
            new Promise((innerResolve, innerReject) => {
                db.run(sql, ['height', height], (err) => {
                    if (err) {
                        innerReject(err);
                    } else {
                        innerResolve();
                    }
                });
            }),
        ];

        Promise.all(insertPromises)
            .then(() => resolve())
            .catch((err) => reject(err));
    });
};

// Aggiorna solo la larghezza
export const updateWidth = (width) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE Dimension SET value = ? WHERE name = 'width'`;
        db.run(sql, [width], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

// Aggiorna solo l'altezza
export const updateHeight = (height) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE Dimension SET value = ? WHERE name = 'height'`;
        db.run(sql, [height], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};
