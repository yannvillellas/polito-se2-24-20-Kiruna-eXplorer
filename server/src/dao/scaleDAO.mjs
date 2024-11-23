import { db } from "../database/db.mjs"

export const getScales = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM Scale", (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const scales = rows.map((row) => row.name);
                resolve(scales);
            }
        });
    });
}

export const addScale = (newValue) => {
    return new Promise((resolve, reject) => {
        db.run("INSERT INTO Scale (name) VALUES (?)", [newValue], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve()
            }
        });
    });
};