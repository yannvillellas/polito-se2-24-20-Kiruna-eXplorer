import request from 'supertest';
import app from '../../server.mjs';
import fs from 'fs';
import path from 'path';
import { addDocument, listDocuments } from '../../src/dao/documentDAO.mjs';
import { isUrbanPlanner, isValidType } from '../../middleware.mjs';
import { validationResult } from 'express-validator';

jest.mock('../../src/dao/documentDAO.mjs');
jest.mock('../../src/dao/associationDAO.mjs');
jest.mock('../../src/dao/linkTypeDAO.mjs');
jest.mock("../../middleware.mjs");
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  mkdirSync: jest.fn(),
  existsSync: jest.fn(),
  readdirSync: jest.fn()
}));

jest.mock("express-fileupload", () => {
  return jest.fn(() => {
    return (req, res, next) => {
      req.files = {
        files: [{ name: "testfile.txt", mv: jest.fn((path, cb) => cb(null)) }]
      };
      next();
    };
  });
});

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
    expect(response.body).toEqual([]);   // Expecting an empty array
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

  it('should return 422 when the document has validation errors', async () => {
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
      pages: '10'  // the error is here, it should be a number
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

    expect(response.status).toBe(422);
  });

  it('should return 422 for missing parameters', async () => {
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
      isEmpty: () => false,// validation error 
      array: () => [{ msg: 'Missing parameter', param: 'language' }, { msg: 'Missing parameter', param: 'pages' }],
    });

    addDocument.mockResolvedValue();

    const response = await request(app).post('/api/documents').send(document);

    expect(response.status).toBe(422);

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
      req.user = { role: 'citizen' }; //  Not an urban planner
      return res.status(401).json({ error: 'Not authorized' });
    });

    validationResult.mockReturnValue({
      isEmpty: () => true,// no validation error
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

describe('DELETE /api/documents/:docId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should return 200 when a document is deleted', async () => {
    const mockDocId = 1;
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

    addDocument.mockResolvedValue();
    try {
      await request(app).delete(`/api/documents/${mockDocId}`);
    } catch (error) {
      expect(error.response.status).toBe(200);
    }
  });

  it('should return 401 when the user is not an urban planner', async () => {
    const mockDocId = 1;
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
      req.user = { role: 'citizen' }; //  Not an urban planner
      return res.status(401).json({ error: 'Not authorized' });
    });

    addDocument.mockResolvedValue();
    try {
      await request(app).delete(`/api/documents/${mockDocId}`);
    } catch (error) {
      expect(error.response.status).toBe(401);
    }
  });

  it('should return 500 when an error occurs', async () => {
    const mockDocId = 1;
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

    addDocument.mockReturnValue(new Error('Database error'));
    try {
      await request(app).delete(`/api/documents/${mockDocId}`);
    } catch (error) {
      expect(error.response.status).toBe(500);
      expect(error.response.body).toEqual({ error: 'Database error' });
    }
  });

});



/*
describe('POST /api/upload/:docId', () => {
  const mockDocId = '123';
  const uploadDir = path.join(__dirname, '../../uploads', mockDocId);

  beforeEach(() => {
    jest.clearAllMocks();
    fs.mkdirSync.mockReset();
    fs.existsSync.mockImplementation(() => false);
    fs.mkdirSync.mockImplementation(() => { });  // mock del comportamento di mkdirSync
  });

  it('should upload files successfully', async () => {
    const fileBuffer = Buffer.from('dummy content');

    //Mocking fs.mkdirSync to ensure it behaves as expected
    fs.existsSync.mockImplementation(() => false);  // Mock che simula l'assenza della cartella
    fs.mkdirSync.mockImplementation(() => { }); //  Mock che simula la creazione della cartella senza errori

    const response = await request(app)
      .post(`/api/upload/${mockDocId}`)
      .attach('file', fileBuffer, 'testFile.txt');  // Assicurati che il nome del campo "file" sia corretto

    expect(response.status).toBe(200);
  });

  it('should return 400 when no file is uploaded', async () => {
    const response = await request(app).post(`/api/upload/${mockDocId}`);

    //  Verifica che la risposta abbia un codice di stato 400
    expect(response.status).toBe(400);
    expect(response.text).toBe("No file uploaded."); //  Assicurati che il messaggio di errore corrisponda
  });

  it('should return 500 when an error occurs during file upload', async () => {
    const fileBuffer = Buffer.from('dummy content');

    // Mocking la funzione mkdirSync per lanciare un errore
    fs.mkdirSync.mockImplementation(() => {
      throw new Error('Error creating folder');
    });

    // Mocking la funzione mv per lanciare un errore
    const mockFile = {
      name: 'testFile.txt',
      mv: jest.fn((path, callback) => callback(new Error('Error saving file')))
    };

    //  Mockare req.files
    req.files = { files: mockFile };

    const response = await request(app)
      .post(`/api/upload/${mockDocId}`)
      .attach('file', fileBuffer, 'testFile.txt');  // Assicurati che il nome del campo "file" sia corretto

    // Verifica che la risposta abbia un codice di stato 500
    expect(response.status).toBe(500);
    expect(response.text).toBe('Error during file upload.');
  });

});


describe('GET /api/files/:docId', () => {
  const mockDocId = '123';
  const uploadDir = path.join(__dirname, '../../uploads', mockDocId);

  beforeEach(() => {
    jest.clearAllMocks();
    fs.readdirSync.mockReset();
    fs.existsSync.mockImplementation((path) => path === uploadDir);
  });

  it('should return a list of files for a valid docId', async () => {
    fs.readdirSync.mockImplementation(() => ['file1.txt', 'file2.txt']);

    const response = await request(app).get(`/api/files/${mockDocId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { name: 'file1.txt', path: `/uploads/${mockDocId}/file1.txt` },
      { name: 'file2.txt', path: `/uploads/${mockDocId}/file2.txt` },
    ]);
  });

  it('should return 400 for an invalid or non-existing docId', async () => {
    fs.existsSync.mockImplementation(() => false);

    const response = await request(app).get(`/api/files/${mockDocId}`);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Sottocartella non valida o non trovata.');
  });

  it('should handle empty directories gracefully', async () => {
    fs.readdirSync.mockImplementation(() => []);  // cartella vuota

    const response = await request(app).get(`/api/files/${mockDocId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('should return 500 when an error occurs while reading files', async () => {
    fs.readdirSync.mockImplementation(() => {
      throw new Error('File system error');
    });

    const response = await request(app).get(`/api/files/${mockDocId}`);

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error reading files.');
  });

});
*/