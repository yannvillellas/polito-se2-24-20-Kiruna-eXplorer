import {db} from '../database/db.mjs'
import crypto from 'crypto';
import User from '../models/User.mjs'

export const getUser = (username, password) => {
    return new Promise((resolve, reject) => {
      const getUserQuery = `SELECT * FROM user WHERE username = ?`;
      db.get(getUserQuery, [username], (err, row) => {
        if (err) {
          console.error('Errore nella query getUser:', err);
          reject(err);
        }
  
        if (row === undefined) {
          resolve(false);
        } else {
          const user = new User(row.userId, row.username, row.password, row.salt, row.role);
  
          // Convert user.password from hex to buffer
          const storedPasswordBuffer = Buffer.from(user.password, 'hex');
  
          crypto.scrypt(password, user.salt, 32, (err, hashedPassword) => {
            if (err) reject(err);
  
            // Compare the buffers
            if (!crypto.timingSafeEqual(storedPasswordBuffer, hashedPassword)) {
              resolve(false);
            } else {
              resolve(user);
            }
          });
        }
      });
    });
};

export const createUser = (username, password, role) => {
    return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(16).toString('hex');
        crypto.scrypt(password, salt, 32, (err, hashedPassword) => {
            if (err) reject(err);

            const insertUserQuery = `INSERT INTO user (username, password, salt, role) VALUES (?, ?, ?, ?)`;
            db.run(insertUserQuery, [username, hashedPassword.toString('hex'), salt, role], function (err) {
                if (err) {
                    reject(err);
                } else {
                  const user = new User(this.lastID, username, hashedPassword.toString('hex'), salt, role);
                  resolve(user);
                }
            });
        });
    });
}