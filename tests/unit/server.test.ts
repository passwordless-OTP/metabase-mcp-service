import request from 'supertest';
import express from 'express';

describe('Server Health Check', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.get('/health', (req, res) => {
      res.json({ status: 'healthy', version: '0.1.0' });
    });
  });

  it('should return health status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toEqual({
      status: 'healthy',
      version: '0.1.0'
    });
  });
});