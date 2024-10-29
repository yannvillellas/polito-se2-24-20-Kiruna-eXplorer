import sqlite3 from "sqlite3";
import path from "path";


const dbPath = path.resolve("src", "database", "database.db"); 


export const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Errore during the database opening:", err);
        throw err;
    }else{
        // Enable foreign key constraints for the current session
        db.run("PRAGMA foreign_keys = ON;", (pragmaErr) => {
            if (pragmaErr) {
                console.error("Errore dering the foreign key constraints enable:", pragmaErr);
                throw pragmaErr;
            }
            //console.log("Connection to database successful.");
        });
    }
});