import {db} from "../database/db.mjs"
import Position  from "../models/position.mjs"

export const listPositions = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM Position ORDER BY docId", (err, rows) => {
            if (err) {
                reject(err);
            } else {
                if(rows){
                    const positions = rows.map(row => new Position(row.posId, row.docId, row.latitude, row.longitude));
                    resolve(positions);
                }else{
                    resolve([]);
                }
            }
        });
    });
}


export const addPosition = (docId, lat, lng) => {
    return new Promise((resolve, reject) => {
        db.run("INSERT INTO Position (docId, latitude, longitude) VALUES (?, ?, ?)", [docId, lat, lng], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}


export const updatePosition = (docId, lat, lng) => {
    return new Promise((resolve, reject) => {
        db.run("UPDATE Position SET latitude = ?, longitude = ? WHERE docId = ?", [lat, lng, docId], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}