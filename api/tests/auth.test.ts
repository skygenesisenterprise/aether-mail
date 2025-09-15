import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth.Routes';

describe('Auth API', () => {
  const app = express();
  app.use(express.json());
  app.use('/auth', authRoutes);

  it('should login successfully and return a token', async () => {
    // Mock loginWithExternalAuth implementation on controller
    jest.mock('../services/authService', () => ({
      loginWithExternalAuth: async () => ({ token: 'fake-jwt' })
    }));
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'user', password: 'pass' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});
