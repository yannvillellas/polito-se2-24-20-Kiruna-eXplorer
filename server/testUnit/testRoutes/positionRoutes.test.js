import request from 'supertest';
import app from '../../server.mjs';
import { listPositions } from '../../src/dao/positionDAO.mjs';
import { isUrbanPlanner } from '../../middleware.mjs';
import { validationResult } from 'express-validator';

jest.mock('../../src/dao/positionDAO.mjs');
jest.mock('../../src/dao/documentDAO.mjs');
jest.mock('../../src/dao/associationDAO.mjs');
jest.mock('../../src/dao/linkTypeDAO.mjs');
jest.mock("../../middleware.mjs");

jest.mock('express-validator', () => ({
  ...jest.requireActual('express-validator'),
  validationResult: jest.fn(),
}));

describe('GET /api/positions', () => {

    it('should return 200 and a list of positions', async () => {
        const mockPositions = [
            {
                posId: 1,
                docId: 1,
                latitude: 45.0,
                longitude: 9.0
            },
            {
                posId: 2,
                docId: 1,
                latitude: 46.0,
                longitude: 10.0
            },
        ];

        listPositions.mockResolvedValue(mockPositions);

        const response = await request(app).get('/api/positions');

        expect(response.status).toBe(200);

        // Check that the response body matches the mockPositions
        expect(response.body).toEqual(mockPositions);
    });

    it('should return 200 and an empty list when no positions are available', async () => {
        listPositions.mockResolvedValue([]);

        const response = await request(app).get('/api/positions');

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]); // Expecting an empty array
    });

    it('should return 500 when there is a database error', async () => {
        const errorMessage = "Database error";
        listPositions.mockRejectedValue(new Error(errorMessage));

        const response = await request(app).get('/api/positions');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: errorMessage });
    });
});


describe ('POST /api/positions', () => {
    it('should return 201 and add a position to the database', async () => {
        const mockPosition = {
            docId: 1,
            latitude: 45.0,
            longitude: 9.0
        };


        isUrbanPlanner.mockImplementation((req, res, next) => {
            req.isAuthenticated = jest.fn(() => true);
            req.user = { role: 'urbanPlanner' };
            return next();
          });

        validationResult.mockReturnValue({
            isEmpty: () => true, // Simula nessun errore di validazione
        });

        const response = await request(app)
            .post('/api/positions')
            .send(mockPosition);

        expect(response.status).toBe(201);
    });

    it('should return 400 when the request body is invalid', async () => {
        const mockPosition = {
            docId: 1,
            latitude: 45.0,
            longitude: '9.0' // Invalid value, should be a number
        };


        isUrbanPlanner.mockImplementation((req, res, next) => {
            req.isAuthenticated = jest.fn(() => true);
            req.user = { role: 'urbanPlanner' };
            return next();
        });

        validationResult.mockReturnValue({
            isEmpty: () => false, // Simula un errore di validazione
            array: () => [{ msg: 'Invalid longitude', param: 'longitude' }]
        });

        const response = await request(app)
            .post('/api/positions')
            .send({});

        expect(response.status).toBe(400);
    });

    it('should return 401 when the user is not authorized', async () => {
        const mockPosition = {
            docId: 1,
            latitude: 45.0,
            longitude: 9.0
        };

        isUrbanPlanner.mockImplementation((req, res, next) => {
            req.isAuthenticated = jest.fn(() => true);
            req.user = { role: 'citizen' }; // Not an urban planner
            return res.status(401).json({ error: 'Not authorized' });
          });

        const response = await request(app)
            .post('/api/positions')
            .send(mockPosition);

        expect(response.status).toBe(401);
    });


    it('should return 500 when there is a database error', async () => {
        const errorMessage = "Database error";
        listPositions.mockRejectedValue(new Error(errorMessage));

        const response = await request(app).get('/api/positions');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: errorMessage });
    });
});



describe('PUT /api/positions/:posId', () => {
    it('should return 200 and update a position in the database', async () => {
        const mockPosition = {
            posId: 1,
            docId: 1,
            latitude: 45.0,
            longitude: 9.0
        };

        isUrbanPlanner.mockImplementation((req, res, next) => {
            req.isAuthenticated = jest.fn(() => true);
            req.user = { role: 'urbanPlanner' };
            return next();
          });

        validationResult.mockReturnValue({
            isEmpty: () => true, // Simula nessun errore di validazione
        });

        const response = await request(app)
            .put(`/api/positions/${mockPosition.posId}`)
            .send(mockPosition);

        expect(response.status).toBe(200);
    });

    it('should return 400 when the request body is invalid', async () => {
        const mockPosition = {
            posId: 1,
            docId: 1,
            latitude: 45.0,
            longitude: '9.0' // Invalid value, should be a number
        };

        isUrbanPlanner.mockImplementation((req, res, next) => {
            req.isAuthenticated = jest.fn(() => true);
            req.user = { role: 'urbanPlanner' };
            return next();
        });

        validationResult.mockReturnValue({
            isEmpty: () => false, // Simula un errore di validazione
            array: () => [{ msg: 'Invalid longitude', param: 'longitude' }]
        });

        const response = await request(app)
            .put(`/api/positions/${mockPosition.posId}`)
            .send({});

        expect(response.status).toBe(400);
    });

    it('should return 401 when the user is not authorized', async () => {
        const mockPosition = {
            posId: 1,
            docId: 1,
            latitude: 45.0,
            longitude: 9.0
        };

        isUrbanPlanner.mockImplementation((req, res, next) => {
            req.isAuthenticated = jest.fn(() => true);
            req.user = { role: 'citizen' }; // Not an urban planner
            return res.status(401).json({ error: 'Not authorized' });
          });

        const response = await request(app)
            .put(`/api/positions/${mockPosition.posId}`)
            .send(mockPosition);

        expect(response.status).toBe(401);
    });

});