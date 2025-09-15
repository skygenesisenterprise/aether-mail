import request from 'supertest';
import express from 'express';
import folderRoutes from '../routes/folder.Routes';

// Add Jest type definitions
import '@types/jest';

// Using a dummy token for tests
const fakeJwt = 'Bearer faketoken';

describe('Folder API', () => {
  const app = express();
  app.use(express.json());
  app.use('/folders', folderRoutes);

  it('should list folders successfully', async () => {
    const res = await request(app)
      .get('/folders')
      .set('Authorization', fakeJwt);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.folders)).toBe(true);
  });

  it('should create folder', async () => {
    const res = await request(app)
      .post('/folders/create')
      .set('Authorization', fakeJwt)
      .send({ name: 'TestFolder' });
    expect(res.statusCode).toBe(201);
    expect(res.body.folder).toBe('TestFolder');
  });
});
