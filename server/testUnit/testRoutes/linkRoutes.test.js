import request from 'supertest';
import app from '../../server.mjs';
import { getLinksType } from '../../src/dao/LinkTypeDAO.mjs';
import { getAssociations,insertAssociation,UpdateAssociation,deleteAssociation } from '../../src/dao/associationDAO.mjs';

jest.mock('../../src/dao/associationDAO.mjs');
jest.mock('../../src/dao/linkTypeDAO.mjs');

describe('GET /api/linkTypes', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should return 200 and the list of link types on success', async () => {
        const Types = ['t1', 't2', 't3', 't4'];
        getLinksType.mockResolvedValue(Types);


        const response = await request(app).get('/api/linkTypes');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(Types);
        expect(getLinksType).toHaveBeenCalledTimes(1);
    });

    it('should return 500 and an error message on failure', async () => {
        getLinksType.mockRejectedValue(new Error('Database error'));

        const response = await request(app).get('/api/linkTypes');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Database error' });
        expect(getLinksType).toHaveBeenCalledTimes(1);
    });

});

describe('POST /api/associations', () => {
    let validTypes;

    const mockUrbanPlanner = (req, res, next) => {
        console.log("ciao")
        req.isAuthenticated = jest.fn(() => true);
        req.user = { role: 'urbanPlanner' };
        next();
    };

    beforeAll(async () => {
        validTypes = ['t1', 't2', 't3', 't4'];
        getLinksType.mockResolvedValue(validTypes);

    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 200 and the new association id on success', async () => {
        const mockNewId = 1;
        insertAssociation.mockResolvedValue(mockNewId);

        /*jest.spyOn(isUrbanPlanner,'call').mockImplementation((req, res, next) => {
            req.isAuthenticated = () => true; // Simula che l'utente sia autenticato
            req.user = { role: 'urbanPlanner' }; // Simula il ruolo dell'utente
            next(); // Passa al prossimo middleware
        });*/

        const response = await request(app)
            .post('/api/associations')
            .use(mockUrbanPlanner)
            .send({ doc1: 'doc1', doc2: 'doc2', type: 't1' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ id: mockNewId });
        expect(insertAssociation).toHaveBeenCalledTimes(1);
    });

    /*it('should return 422 when validation fails', async () => {
        const response = await request(app)
            .post('/api/associations')
            .send({ doc1: '', doc2: 'doc2', type: 'invalidType' });

        expect(response.status).toBe(422);
        expect(response.body.errors).toBeDefined();
    });

    it('should return 500 when insertAssociation fails', async () => {
        insertAssociation.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .post('/api/associations')
            .send({ doc1: 'doc1', doc2: 'doc2', type: 't1' });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Error adding a new link between documents' });
    });

    it('should return 401 for unauthorized users', async () => {
        const unauthorizedMock = (req, res, next) => {
            req.isAuthenticated = jest.fn(() => false);
            next();
        };

        app.use(unauthorizedMock);

        const response = await request(app)
            .post('/api/associations')
            .send({ doc1: 'doc1', doc2: 'doc2', type: 't1' });

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'Not authorized' });
    });*/


});

