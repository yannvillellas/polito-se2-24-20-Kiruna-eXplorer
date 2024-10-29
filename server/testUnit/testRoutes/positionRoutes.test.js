import request from 'supertest';
import app from '../../server.mjs';
import { listPositions } from '../../src/dao/positionDAO.mjs';

jest.mock('../../src/dao/positionDAO.mjs');

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
