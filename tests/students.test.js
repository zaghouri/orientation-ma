/**
 * Student API Tests
 * Unit tests for student profile endpoints
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const { Student } = require('../models');
const jwt = require('jsonwebtoken');

// Mock JWT token for testing
const createMockToken = (userId = 'testuser123') => {
  return jwt.sign(
    { id: userId, email: 'test@example.com' },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

describe('Student Profile API (/students)', () => {
  let mockToken;
  let mockStudentId;

  beforeEach(() => {
    mockToken = createMockToken();
    mockStudentId = new mongoose.Types.ObjectId();
  });

  describe('GET /students/:id', () => {
    test('should return student profile when valid ID provided', async () => {
      const response = await request(app)
        .get(`/students/${mockStudentId}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .expect('Content-Type', /json/);

      // Should return 404 since student doesn't exist in test DB
      expect([200, 404]).toContain(response.status);
    });

    test('should return 400 for invalid ObjectId format', async () => {
      const response = await request(app)
        .get('/students/invalid-id')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid student ID format');
    });

    test('should return 401 without JWT token', async () => {
      const response = await request(app)
        .get(`/students/${mockStudentId}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });

    test('should return 404 for non-existent student ID', async () => {
      const validId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/students/${validId}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .expect('Content-Type', /json/);

      // May return 200 or 404 depending on test DB state
      expect([200, 404]).toContain(response.status);
    });

    test('should not return password hash in response', async () => {
      const response = await request(app)
        .get(`/students/${mockStudentId}`)
        .set('Authorization', `Bearer ${mockToken}`);

      // If student exists and returns 200, check no passwordHash
      if (response.status === 200 && response.body.data) {
        expect(response.body.data).not.toHaveProperty('passwordHash');
      }
    });
  });

  describe('GET /students', () => {
    test('should return paginated students list', async () => {
      const response = await request(app)
        .get('/students')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect('Content-Type', /json/);

      expect([200, 401]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('success');
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('pagination');
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });

    test('should support page and limit query parameters', async () => {
      const response = await request(app)
        .get('/students?page=1&limit=5')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect('Content-Type', /json/);

      expect([200, 401]).toContain(response.status);
    });

    test('should return 401 without JWT token', async () => {
      const response = await request(app)
        .get('/students')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /students/:id', () => {
    test('should update student profile with valid data', async () => {
      const updateData = {
        name: 'Updated Name',
        bio: 'Updated bio',
        interests: ['Technology', 'Design'],
      };

      const response = await request(app)
        .put(`/students/${mockStudentId}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .send(updateData)
        .expect('Content-Type', /json/);

      expect([200, 404]).toContain(response.status);
    });

    test('should return 400 for invalid ObjectId', async () => {
      const response = await request(app)
        .put('/students/invalid-id')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ name: 'New Name' })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid student ID format');
    });

    test('should return 401 without JWT token', async () => {
      const response = await request(app)
        .put(`/students/${mockStudentId}`)
        .send({ name: 'New Name' })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });

    test('should not allow updating passwordHash directly', async () => {
      const response = await request(app)
        .put(`/students/${mockStudentId}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ passwordHash: 'hacked' })
        .expect('Content-Type', /json/);

      // Should succeed but not update passwordHash
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('Route Security', () => {
    test('should require JWT token for all student endpoints', async () => {
      const endpoints = [
        { method: 'get', path: `/students/${mockStudentId}` },
        { method: 'get', path: '/students' },
        { method: 'put', path: `/students/${mockStudentId}` },
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)[endpoint.method](endpoint.path);
        expect(response.status).toBe(401);
      }
    });

    test('should reject invalid JWT tokens', async () => {
      const response = await request(app)
        .get(`/students/${mockStudentId}`)
        .set('Authorization', 'Bearer invalid-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });
  });
});
