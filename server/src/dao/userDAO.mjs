import {db} from '../database/db.mjs'
import User from '../models/User.mjs'

export const getUser = (username, password) => {
  return new Promise((resolve, reject) => {
      const getUserQuery = `SELECT userId, username, password, role FROM user WHERE username = ?`;
      db.get(getUserQuery, [username], (err, row) => {
          if (err) {
              console.error('Errore nella query getUser:', err);
              reject(err);
              return;
          }
          
          if (!row) {
              resolve(false);
          } else {
              const user = new User(row.userId, row.username, row.password, row.role);
              user.password === password ? resolve(user) : resolve(false);
          }
      });
  });
};