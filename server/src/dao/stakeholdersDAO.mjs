import { db } from "../database/db.mjs"

export const getStakeholders = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM Stakeholder", (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const stakeholders = rows.map((row) => row.name);
                resolve(stakeholders);
            }
        });
    });
}

export const addStakeholder = (newValue) => {
    return new Promise((resolve, reject) => {
        db.run("INSERT INTO Stakeholder (name) VALUES (?)", [newValue], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve()
            }
        });
    });
};