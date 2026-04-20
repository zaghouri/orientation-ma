/**
 * Student Routes
 * API endpoints for student profile management
 */

const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/authMiddleware');
const {
  getStudentById,
  getAllStudents,
  updateStudent,
} = require('../controllers/StudentController');

/**
 * GET /students/:id
 * Retrieve student profile by ID
 * Protected: Yes (JWT required)
 */
router.get('/:id', authenticateJWT, getStudentById);

/**
 * GET /students
 * Retrieve all students (paginated)
 * Protected: Yes (JWT required)
 */
router.get('/', authenticateJWT, getAllStudents);

/**
 * PUT /students/:id
 * Update student profile
 * Protected: Yes (JWT required, user can only update own profile)
 */
router.put('/:id', authenticateJWT, updateStudent);

module.exports = router;
