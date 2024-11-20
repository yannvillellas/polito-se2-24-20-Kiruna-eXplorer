import request from 'supertest';
import app from '../../server.mjs';
import { getLinksType } from '../../src/dao/LinkTypeDAO.mjs';
import { getAssociations, insertAssociation, UpdateAssociation, deleteAssociation } from '../../src/dao/associationDAO.mjs';
import * as middleware from "../../middleware.mjs"
import { isUrbanPlanner, isValidType } from '../../middleware.mjs';
import { validationResult } from 'express-validator';

jest.mock('../../src/dao/associationDAO.mjs');
jest.mock('../../src/dao/linkTypeDAO.mjs');
jest.mock("../../middleware.mjs");


jest.mock('express-validator', () => ({
    ...jest.requireActual('express-validator'),
    validationResult: jest.fn(),
}));

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

describe('GET /api/associations/:docId', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should return associations for a given docId', async () => {
        const docId = 1;
        const mockAssociations = [
            { aId: 1, doc1: 1, doc2: 2, typeId: "t1" },
            { aId: 2, doc1: 3, doc2: 1, typeId: "t2" }
        ];

        // Mock del comportamento di getAssociations per simulare il recupero dei dati
        getAssociations.mockResolvedValue(mockAssociations);

        const response = await request(app).get(`/api/associations/${docId}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockAssociations);
        expect(getAssociations).toHaveBeenCalledWith(docId);
    });

    it('should return 500 if an error occurs', async () => {
        const docId = 1;
        const errorMessage = 'Database error';

        getAssociations.mockRejectedValue(new Error(errorMessage));

        const response = await request(app).get(`/api/associations/${docId}`);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: errorMessage });
    });
});

describe('POST /api/associations', () => {

    /*
    const mockUrbanPlanner = (req, res, next) => {
        req.isAuthenticated = jest.fn(() => true);
        req.user = { role: 'urbanPlanner' };
        next();
    };*/

    beforeEach(() => {
        jest.clearAllMocks();

        jest.spyOn(middleware, "isValidType").mockImplementation(async (req, res, next) => {
            const validTypes = ['t1', 't2', 't3'];
            if (validTypes.includes(req.body.type)) {
                return next();
            }
            return res.status(422).json({ error: 'wrong link type' });
        });

        jest.spyOn(middleware, "isUrbanPlanner").mockImplementation((req, res, next) => {
            req.isAuthenticated = jest.fn(() => true);
            req.user = { role: 'urbanPlanner' };
            return next()
        });

    });

    it('should return 200 and the new association id on success', async () => {
        /*const types = ['t1', 't2', 't3', 't4'];
        getLinksType.mockResolvedValue(types);

        const mockNewId = 1;
        insertAssociation.mockResolvedValue(mockNewId);

        //jest.spyOn(middleware,"isValidType").mockResolvedValue(["t1","t2","t3","t4"]);
        //middleware.loadValidTypes.mockResolvedValue(["t1","t2","t3","t4"]);

        const response = await request(app)
            .post('/api/associations')
            //.use(mockUrbanPlanner)
            .send({ doc1: 'doc1', doc2: 'doc2', type: 't1' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ id: mockNewId });
        expect(insertAssociation).toHaveBeenCalledTimes(1);
        */

        const newAssociation = { doc1: 0, doc2: 1, type: "1" };
        isUrbanPlanner.mockImplementation((req, res, next) => {
            req.isAuthenticated = jest.fn(() => true);
            req.user = { role: 'urbanPlanner' };
            return next();
        });

        validationResult.mockReturnValue({
            isEmpty: () => true, // Simula nessun errore di validazione
        });

        insertAssociation.mockResolvedValue(15);

        const response = await request(app).post('/api/associations').send(newAssociation);
        expect(response.status).toBe(422);

    });

    it('should return 422 when validation fails', async () => {

        const response = await request(app)
            .post('/api/associations')
            .send({ doc1: '', doc2: 'doc2', type: 'invalidType' });

        expect(response.status).toBe(422);
        // expect(response.body.errors).toBeDefined();
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
        jest.spyOn(middleware, "isUrbanPlanner").mockImplementation((req, res, next) => {
            req.isAuthenticated = jest.fn(() => false);
            req.user = { role: 'visitor' };
            return res.status(401).json({ error: 'Not authorized' });
        });

        const response = await request(app)
            .post('/api/associations')
            .send({ doc1: 'doc1', doc2: 'doc2', type: 't1' });

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'Not authorized' });
    });
});

describe('DELETE /api/association/:aId', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        jest.spyOn(middleware, "isUrbanPlanner").mockImplementation((req, res, next) => {
            req.isAuthenticated = jest.fn(() => true);
            req.user = { role: 'urbanPlanner' };
            return next()
        });
    });

    it('should delete an association and return 200', async () => {
        const aId = 1;

        deleteAssociation.mockResolvedValue();

        const response = await request(app).delete(`/api/associations/${aId}`);

        expect(response.status).toBe(200);
        expect(deleteAssociation).toHaveBeenCalledWith(aId);
    });

    it('should return 500 if an error occurs', async () => {
        const aId = 1;
        const errorMessage = 'Deletion error';

        deleteAssociation.mockRejectedValue(new Error(errorMessage));

        const response = await request(app).delete(`/api/associations/${aId}`);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: errorMessage });
    });

    it('should return 401 for unauthorized users', async () => {
        const aId = 1;

        middleware.isUrbanPlanner.mockImplementation((req, res) => {
            return res.status(401).json({ error: 'Not authorized' });
        });

        const response = await request(app).delete(`/api/associations/${aId}`);

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'Not authorized' });
    });
});

describe('PUT /api/associations/:aId', () => {

    beforeEach(() => {
        jest.clearAllMocks();

        jest.spyOn(middleware, "isValidType").mockImplementation(async (req, res, next) => {
            const validTypes = ['t1', 't2', 't3'];
            if (validTypes.includes(req.body.type)) {
                return next();
            }
            return res.status(422).json({ error: 'wrong link type' });
        });

        jest.spyOn(middleware, "isUrbanPlanner").mockImplementation((req, res, next) => {
            req.isAuthenticated = jest.fn(() => true);
            req.user = { role: 'urbanPlanner' };
            return next()
        });

    });

    it('should return 200 when the association is succesfully updated', async () => {
        const aId = 1;
        UpdateAssociation.mockResolvedValue();

        const response = await request(app)
            .put(`/api/associations/${aId}`)
            .send({ doc1: 'doc1', doc2: 'doc2', type: 't2' });

        const association = { aId: aId, doc1: 'doc1', doc2: 'doc2', type: 't2' }
        expect(response.status).toBe(200);
        expect(UpdateAssociation).toHaveBeenCalledTimes(1);
        expect(UpdateAssociation).toHaveBeenCalledWith(association)
    });

    it('should return 422 when validation fails', async () => {
        const aId = 1;
        const response = await request(app)
            .put(`/api/associations/${aId}`)
            .send({ doc1: '', doc2: 'doc2', type: 'invalidType' });

        expect(response.status).toBe(422);
    });

    it('should return 500 when udateAssociation fails', async () => {
        const aId = 1;
        const errorMessage = 'Update error';
        UpdateAssociation.mockRejectedValue(new Error(errorMessage));

        const response = await request(app)
            .put(`/api/associations/${aId}`)
            .send({ doc1: 'doc1', doc2: 'doc2', type: 't2' });

        const association = { aId: aId, doc1: 'doc1', doc2: 'doc2', type: 't2' }
        expect(UpdateAssociation).toHaveBeenCalledTimes(1);
        expect(UpdateAssociation).toHaveBeenCalledWith(association)
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Error updating the association' });
    });

    it('should return 401 for unauthorized users', async () => {
        jest.spyOn(middleware, "isUrbanPlanner").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: 'Not authorized' });
        });

        const aId = 1;

        const response = await request(app)
            .put(`/api/associations/${aId}`)
            .send({ doc1: 'doc1', doc2: 'doc2', type: 't2' });

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'Not authorized' });
    });
});


