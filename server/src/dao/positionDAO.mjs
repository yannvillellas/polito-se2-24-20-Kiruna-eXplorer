import {db} from "../database/db.mjs"
import Position  from "../models/position.mjs"

export const listPositions = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM Position", (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const positions = rows.map(row => new Position(row.posId, row.docId, row.latitude, row.longitude));
                resolve(positions);
            }
        });
    });
}