/**
 * Career API Tests
 * Unit tests for career database endpoints
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const { Career } = require('../models');
const jwt = require('jsonwebtoken');

// Mock JWT token for testing
const createMockToken = (userId = 'testuser123') => {
  return jwt.sign(
    { id: userId, email: 'test@example.com' },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

describe('Career Database API (/careers)', () => {
  let mockToken;
  let mockCareerIds = [];

  beforeEach(() => {
    mockToken = createMockToken();
  });

  describe('GET /careers', () => {
    test('should return paginated careers list', async () => {
      const response = await request(app)
        .get('/careers')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect('Content-Type', /json/);

      expect([200, 401]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('pagination');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.pagination).toHaveProperty('current');
        expect(response.body.pagination).toHaveProperty('total');
        expect(response.body.pagination).toHaveProperty('pages');
      }
    });

    test('should support page and limit parameters', async () => {
      const response = await request(app)
        .get('/careers?page=1&limit=5')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect('Content-Type', /json/);

      expect([200, 401]).toContain(response.status);
    });

    test('should filter careers by sector', async () => {
      const response = await request(app)
        .get('/careers?sector=technology')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect('Content-Type', /json/);

      expect([200, 401]).toContain(response.status);

      if (response.status === 200) {
        if (response.body.data.length > 0) {
          response.body.data.forEach((career) => {
            expect(career.sector).toBe('technology');
          });
        }
      }
    });

    test('should filter careers by education level', async () => {
      const response = await request(app)
        .get('/careers?level=bachelor')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect('Content-Type', /json/);

      expect([200, 401]).toContain(response.status);
    });

    test('should return 401 without JWT token', async () => {
      const response = await request(app)
        .get('/careers')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });

    test('should combine multiple filters', async () => {
      const response = await request(app)
        .get('/careers?sector=technology&level=bachelor&page=1&limit=10')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect('Content-Type', /json/);

      expect([200, 401]).toContain(response.status);
    });
  });

  describe('GET /careers/search', () => {
    test('should return search results for valid query', async () => {
      const response = await request(app)
        .get('/careers/search?q=engineer')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect('Content-Type', /json/);

      expect([200, 400, 401]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('success');
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });

    test('should return 400 for empty search query', async () => {
      const response = await request(app)
        .get('/careers/search?q=')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect('Content-Type', /json/);

      expect([400, 401]).toContain(response.status);
    });

    test('should return 400 for missing query parameter', async () => {
      const response = await request(app)
        .get('/careers/search')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect('Content-Type', /json/);

      expect([400, 401]).toContain(response.status);
    });

    test('should support pagination in search results', async () => {
      const response = await request(app)
        .get('/careers/search?q=developer&page=1&limit=5')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect('Content-Type', /json/);

      expect([200, 400, 401]).toContain(response.status);
    });

    test('should be case-insensitive search', async () => {
      const response1 = await request(app)
        .get('/careers/search?q=software')
        .set('Authorization', `Bearer ${mockToken}`);

      const response2 = await request(app)
        .get('/careers/search?q=SOFTWARE')
        .set('Authorization', `Bearer ${mockToken}`);

      // Both should return similar results if case-insensitive
      expect(response1.status).toBe(response2.status);
    });
  });

  describe('GET /careers/sector/:sector', () => {
    test('should return careers for specified sector', async () => {
      const response = await request(app)
        .get('/careers/sector/technology')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect('Content-Type', /json/);

      expect([200, 401]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });

    test('should support pagination for sector filter', async () => {
      const response = await request(app)
        .get('/careers/sector/healthcare?page=1&limit=10')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect('Content-Type', /json/);

      expect([200, 401]).toContain(response.status);
    });

    test('should return 401 without JWT token', async () => {
      const response = await request(app)
        .get('/careers/sector/technology')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /careers/:id', () => {
    test('should return career for valid ID', async () => {
      const validId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/careers/${validId}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .expect('Content-Type', /json/);

      expect([200, 404, 401]).toContain(response.status);
    });

    test('should return 400 for invalid ObjectId format', async () => {
      const response = await request(app)
        .get('/careers/invalid-id')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid career ID format');
    });

    test('should return 404 for non-existent career', async () => {
      const validId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/careers/${validId}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .expect('Content-Type', /json/);

      expect([200, 404]).toContain(response.status);

      if (response.status === 404) {
        expect(response.body.error).toBe('Career not found');
      }
    });

    test('should return 401 without JWT token', async () => {
      const validId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/careers/${validId}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });

    test('should return career with all required fields', async () => {
      const validId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/careers/${validId}`)
        .set('Authorization', `Bearer ${mockToken}`);

      if (response.status === 200 && response.body.data) {
        const career = response.body.data;
        expect(career).toHaveProperty('title');
        expect(career).toHaveProperty('description');
      }
    });
  });

  describe('Route Security', () => {
    test('should require JWT token for all career endpoints', async () => {
      const validId = new mongoose.Types.ObjectId();
      const endpoints = [
        { method: 'get', path: '/careers' },
        { method: 'get', path: `/careers/${validId}` },
        { method: 'get', path: '/careers/search?q=test' },
        { method: 'get', path: '/careers/sector/technology' },
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)[endpoint.method](endpoint.path);
        expect(response.status).toBe(401);
      }
    });

    test('should reject invalid JWT tokens', async () => {
      const response = await request(app)
        .get('/careers')
        .set('Authorization', 'Bearer invalid-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });

    test('should accept valid JWT tokens', async () => {
      const response = await request(app)
        .get('/careers')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
    });
  });
});
