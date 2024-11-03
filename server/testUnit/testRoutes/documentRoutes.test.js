import request from 'supertest';
import app from '../../server.mjs';
import { addDocument, listDocuments } from '../../src/dao/documentDAO.mjs';
import { isUrbanPlanner, isValidType } from '../../middleware.mjs';
import { validationResult } from 'express-validator';

jest.mock('../../src/dao/documentDAO.mjs');
jest.mock('../../src/dao/associationDAO.mjs');
jest.mock('../../src/dao/linkTypeDAO.mjs');
jest.mock("../../middleware.mjs");

jest.mock('express-validator', () => ({
  ...jest.requireActual('express-validator'),
  validationResult: jest.fn(),
}));


describe('GET /api/documents', () => {
    it('should return 200 and a list of documents', async () => {
        const mockDocuments = [
            {
              docId: 1,
              title: 'titolo1',
              description: null,
              stackeholders: null,
              scale: null,
              issuanceDate: null,
              type: null,
              connections: 0,
              language: null,
              pages: null
            },
            {
              docId: 2,
              title: 'titolo2',
              description: null,
              stackeholders: null,
              scale: null,
              issuanceDate: null,
              type: null,
              connections: 0,
              language: null,
              pages: null
            },
          ];
  
      listDocuments.mockResolvedValue(mockDocuments);
  
      const response = await request(app).get('/api/documents');
  
      expect(response.status).toBe(200);
  
      // Check that the response body matches the mockDocuments
      expect(response.body).toEqual(mockDocuments);
    });

    it('should return 200 and an empty list when no documents are available', async () => {
        listDocuments.mockResolvedValue([]);
      
        const response = await request(app).get('/api/documents');
      
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]); // Expecting an empty array
      });
      
});


describe('POST /api/documents', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();

  });


  it('should return 201 when a document is added', async () => {
          const document = {
            docId: 1,                     
            title: 'titolo1',             
            description: 'descrizione1',   
            stakeholders: 'stackeholders1', 
            scale: 'scale',                
            issuanceDate: 'date',         
            type: 't1',                   
            connections: '2',              
            language: 'italian',          
            pages: 10                      
          };

          isUrbanPlanner.mockImplementation((req, res, next) => {
            req.isAuthenticated = jest.fn(() => true);
            req.user = { role: 'urbanPlanner' };
            return next();
          });

          validationResult.mockReturnValue({
            isEmpty: () => true, // Simula nessun errore di validazione
          });
      


          addDocument.mockResolvedValue();

          const response = await request(app).post('/api/documents').send(document);
    
          expect(response.status).toBe(201);
      });

      it('should return 400 when the document has validation errors', async () => {
        const document = {
          docId: 1,                     
          title: 'titolo1',             
          description: 'descrizione1',   
          stakeholders: 'stackeholders1', 
          scale: 'scale',                
          issuanceDate: 'date',         
          type: 't1',                   
          connections: '2',              
          language: 'italian',          
          pages: '10' // the error is here , it should be a number                    
        };

        isUrbanPlanner.mockImplementation((req, res, next) => {
          req.isAuthenticated = jest.fn(() => true);
          req.user = { role: 'urbanPlanner' };
          return next();
        });

        validationResult.mockReturnValue({
          isEmpty: () => false, // Simula un errore di validazione
          array: () => [{ msg: 'Invalid value', param: 'pages' }],
        });

        addDocument.mockResolvedValue();

        const response = await request(app).post('/api/documents').send(document);

        expect(response.status).toBe(400);
    });

    it('should return 400 for missing parameters', async () => {
      const document = {
        docId: 1,                     
        title: 'titolo1',             
        description: 'descrizione1',   
        stakeholders: 'stackeholders1', 
        scale: 'scale',                
        issuanceDate: 'date',         
        type: 't1',                   
        connections: '2',

        // missing language and pages
      };

      isUrbanPlanner.mockImplementation((req, res, next) => {
        req.isAuthenticated = jest.fn(() => true);
        req.user = { role: 'urbanPlanner' };
        return next();
      });

      validationResult.mockReturnValue({
        isEmpty: () => false, // validation error 
        array: () => [{ msg: 'Missing parameter', param: 'language' }, { msg: 'Missing parameter', param: 'pages' }],
      });

      addDocument.mockResolvedValue();

      const response = await request(app).post('/api/documents').send(document);

      expect(response.status).toBe(400);

  });

  it('should return 401 when the user is not an urban planner', async () => {
    const document = {
      docId: 1,                     
      title: 'titolo1',             
      description: 'descrizione1',   
      stakeholders: 'stackeholders1', 
      scale: 'scale',                
      issuanceDate: 'date',         
      type: 't1',                   
      connections: '2',              
      language: 'italian',          
      pages: 10                      
    };

    isUrbanPlanner.mockImplementation((req, res, next) => {
      req.isAuthenticated = jest.fn(() => true);
      req.user = { role: 'citizen' }; // Not an urban planner
      return res.status(401).json({ error: 'Not authorized' });
    });

    validationResult.mockReturnValue({
      isEmpty: () => true, // no validation error
    });

    addDocument.mockResolvedValue();

    const response = await request(app).post('/api/documents').send(document);

    expect(response.status).toBe(401);

  });


  it('should return 500 when an error occurs', async () => {
    const document = {
      docId: 1,                     
      title: 'titolo1',             
      description: 'descrizione1',   
      stakeholders: 'stackeholders1', 
      scale: 'scale',                
      issuanceDate: 'date',         
      type: 't1',                   
      connections: '2',              
      language: 'italian',          
      pages: 10                      
    };

    isUrbanPlanner.mockImplementation((req, res, next) => {
      req.isAuthenticated = jest.fn(() => true);
      req.user = { role: 'urbanPlanner' };
      return next();
    });

    validationResult.mockReturnValue({
      isEmpty: () => true, // no validation error
    });
  
    addDocument.mockReturnValue(new Error('Database error'));

    try {
      await request(app).post('/api/documents').send(document);
    } catch (error) {
      expect(error.response.status).toBe(500);
      expect(error.response.body).toEqual({ error: 'Database error' });
    }
  
  });

});
