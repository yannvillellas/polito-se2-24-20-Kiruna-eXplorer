import {db} from '../database/db.mjs'
import crypto from 'crypto';
import User from '../models/User.mjs'

export const getUser = (username, password) => {
    return new Promise((resolve, reject) => {
      const getUserQuery = `SELECT * FROM user WHERE username = ?`;
      db.get(getUserQuery, [username], (err, row) => {
          if (err) {
              reject(err);
              return;
          }
          
          if (!row) {
              resolve(false);
            } else {
              resolve(user);
            }
          });
        }
      });
    });
};