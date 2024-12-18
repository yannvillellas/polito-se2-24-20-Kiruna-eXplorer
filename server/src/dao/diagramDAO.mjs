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
