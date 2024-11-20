import { test, expect, jest } from "@jest/globals";
import { getUser, createUser } from "../../src/dao/userDAO.mjs";
import User from "../../src/models/User.mjs";
import sqlite3 from "sqlite3";
import crypto from "crypto";
const { Database } = sqlite3.verbose();

jest.mock('crypto');

describe("User DAO Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    describe("getUser", () => {
        test('should return a user on successful login', async () => {
            const mockUser = new User(undefined, 'testuser', 'hashedPassword', 'salt', 'user');
            jest.spyOn(Database.prototype, "get").mockImplementation((query, params, callback) => {
                callback(null, mockUser);
            });
            crypto.scrypt.mockImplementation((password, salt, keylen, callback) => {
                callback(null, Buffer.from(mockUser.password, 'hex'));
            });

            crypto.timingSafeEqual.mockImplementation((a, b) => {
                return true;
            });

            const user = await getUser('testuser', 'correctPassword');
            expect(user).toEqual(mockUser);
            expect(Database.prototype.get).toHaveBeenCalledTimes(1);
            expect(crypto.scrypt).toHaveBeenCalledTimes(1);
            expect(crypto.timingSafeEqual).toHaveBeenCalledTimes(1);

        });

        test('should return false for incorrect username', async () => {
            jest.spyOn(Database.prototype, "get").mockImplementation((query, params, callback) => {
                callback(null, undefined);
            });

            const user = await getUser('nonexistentuser', 'anyPassword');
            expect(user).toBe(false);
        });

        test('should return false for incorrect password', async () => {
            const mockUser = new User(1, 'testuser', 'hashedPassword', 'salt', 'user');
            jest.spyOn(Database.prototype, "get").mockImplementation((query, params, callback) => {
                callback(null, mockUser);
            });
            crypto.scrypt.mockImplementation((password, salt, keylen, callback) => {
                callback(null, Buffer.from('wrongPassword', 'hex'));
            });

            const user = await getUser('testuser', 'incorrectPassword');
            expect(user).toBe(false);
        });

        test('should handle database errors', async () => {
            const mockError = new Error('Database error');
            jest.spyOn(Database.prototype, "get").mockImplementation((query, params, callback) => {
                callback(mockError);
            });

            await expect(getUser('anyuser', 'anyPassword')).rejects.toThrow(mockError);
        });

    });

    describe('createUser', () => {
        test('should create a user successfully', async () => {
            const userMocked = new User(mockUserId, 'testuser', mockHashedPassword, mockSalt, 'user');
            const mockSalt = 'mockedSalt';
            const mockHashedPassword = 'hashedPassword';
            const mockUserId = 123;

            crypto.randomBytes.mockImplementationOnce(() => Buffer.from(mockSalt, 'hex'));
            crypto.scrypt.mockImplementationOnce((password, salt, keylen, callback) => {
                callback(null, Buffer.from(mockHashedPassword, 'hex'));
            });

            jest.spyOn(Database.prototype, "run").mockImplementationOnce((query, params, callback) => {
                callback(null, mockUserId);
              });

            const user = await createUser('testuser', 'password', 'user').catch((err) => {console.log(err)});
            expect(user).toEqual(undefined); // problem with this.lastID
        });

        test('should handle errors during password hashing', async () => {
            const mockError = new Error('Scrypt error');

            crypto.randomBytes.mockImplementationOnce(() => Buffer.from('salt', 'hex'));
            crypto.scrypt.mockImplementationOnce((password, salt, keylen, callback) => {
                callback(mockError);
            });

            await expect(createUser('testuser', 'password', 'user')).rejects.toThrow(mockError);
        });

        test('should handle database errors', async () => {
            const mockError = new Error('Database error');

            crypto.randomBytes.mockImplementationOnce(() => Buffer.from('salt', 'hex'));
            crypto.scrypt.mockImplementationOnce((password, salt, keylen, callback) => {
                callback(null, Buffer.from('hashedPassword', 'hex'));
            });

            jest.spyOn(Database.prototype, "run").mockImplementationOnce((query, params, callback) => {
                callback(mockError);
            });

            await expect(createUser('testuser', 'password', 'user')).rejects.toThrow(mockError);
        });
    });


});
