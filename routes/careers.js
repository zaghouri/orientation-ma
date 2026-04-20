/**
 * Career Routes
 * API endpoints for career browsing and search
 */

const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/authMiddleware');
const {
  getAllCareers,
  getCareerById,
  searchCareers,
  getCareersBySector,
} = require('../controllers/CareerController');

/**
 * GET /careers
 * Get all careers with optional filtering and pagination
 * Query params: sector, level, page, limit
 * Protected: Yes (JWT required)
 */
router.get('/', authenticateJWT, getAllCareers);

/**
 * GET /careers/search?q=query
 * Search careers by title, description, or sector
 * Protected: Yes (JWT required)
 */
router.get('/search', authenticateJWT, searchCareers);

/**
 * GET /careers/sector/:sector
 * Get careers filtered by sector
 * Protected: Yes (JWT required)
 */
router.get('/sector/:sector', authenticateJWT, getCareersBySector);

/**
 * GET /careers/:id
 * Get single career by ID
 * Protected: Yes (JWT required)
 */
router.get('/:id', authenticateJWT, getCareerById);

module.exports = router;
