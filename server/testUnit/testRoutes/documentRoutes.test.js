import request from 'supertest';
import app from '../../server.mjs';
import { listDocuments } from '../../src/dao/documentDAO.mjs';

jest.mock('../../src/dao/documentDAO.mjs');

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