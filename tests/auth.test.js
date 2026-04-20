const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');

// Mock environment
process.env.JWT_SECRET = 'test-secret-key';

describe('Authentication Routes', () => {
  describe('POST /auth/login', () => {
    it('should reject login without email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('required');
    });

    it('should reject login without password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'student@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('required');
    });

    it('should reject login with invalid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ 
          email: 'invalid@example.com', 
          password: 'wrong' 
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid');
    });

    it('should return tokens on successful login', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ 
          email: 'student@example.com', 
          password: 'password123' 
        });

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body.expiresIn).toBe('24h');

      // Verify token is valid JWT
      const decoded = jwt.verify(
        response.body.accessToken, 
        process.env.JWT_SECRET
      );
      expect(decoded.email).toBe('student@example.com');
      expect(decoded.type).toBe('access');
    });
  });

  describe('POST /auth/refresh', () => {
    let refreshToken;

    beforeEach(async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ 
          email: 'student@example.com', 
          password: 'password123' 
        });
      refreshToken = response.body.refreshToken;
    });

    it('should reject refresh without token', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('required');
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(401);
    });

    it('should return new access token', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.expiresIn).toBe('24h');

      // Verify new token is valid
      const decoded = jwt.verify(
        response.body.accessToken, 
        process.env.JWT_SECRET
      );
      expect(decoded.type).toBe('access');
    });
  });
});

describe('Authentication Middleware', () => {
  let validToken;

  beforeEach(async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ 
        email: 'student@example.com', 
        password: 'password123' 
      });
    validToken = response.body.accessToken;
  });

  describe('GET /protected', () => {
    it('should reject request without authorization header', async () => {
      const response = await request(app)
        .get('/protected');

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Authorization');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });

    it('should allow access with valid token', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe('student@example.com');
    });

    it('should accept token without Bearer prefix', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', validToken);

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe('student@example.com');
    });
  });
});
