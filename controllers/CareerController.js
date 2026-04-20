/**
 * Career Controller
 * Handles career-related API operations
 */

const { Career } = require('../models');
const mongoose = require('mongoose');

/**
 * Get all careers with filtering and pagination
 * GET /careers?sector=tech&level=bachelor&page=1&limit=10
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getAllCareers(req, res) {
  try {
    const { sector, level, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (sector) filter.sector = sector;
    if (level) filter.minimumEducation = level;

    // Fetch careers with filter and pagination
    const careers = await Career.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ title: 1 });

    // Get total count for pagination
    const total = await Career.countDocuments(filter);

    // Return paginated results
    res.status(200).json({
      success: true,
      data: careers,
      pagination: {
        current: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching careers:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}

/**
 * Get career by ID
 * GET /careers/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getCareerById(req, res) {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid career ID format',
        message: 'Career ID must be a valid MongoDB ObjectId',
      });
    }

    // Fetch career from database
    const career = await Career.findById(id);

    // Return 404 if career not found
    if (!career) {
      return res.status(404).json({
        error: 'Career not found',
        message: `No career found with ID: ${id}`,
      });
    }

    // Return career data
    res.status(200).json({
      success: true,
      data: career,
    });
  } catch (error) {
    console.error('Error fetching career:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}

/**
 * Search careers by title or description
 * GET /careers/search?q=software
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function searchCareers(req, res) {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    // Validate search query
    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid query',
        message: 'Search query parameter is required',
      });
    }

    const skip = (page - 1) * limit;

    // Search careers by title or description
    const careers = await Career.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { sector: { $regex: q, $options: 'i' } },
      ],
    })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ title: 1 });

    // Get total count
    const total = await Career.countDocuments({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { sector: { $regex: q, $options: 'i' } },
      ],
    });

    // Return results
    res.status(200).json({
      success: true,
      data: careers,
      pagination: {
        current: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error searching careers:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}

/**
 * Get careers by sector
 * GET /careers/sector/:sector
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getCareersBySector(req, res) {
  try {
    const { sector } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Fetch careers by sector
    const careers = await Career.find({ sector })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ title: 1 });

    // Get total count
    const total = await Career.countDocuments({ sector });

    // Return results
    res.status(200).json({
      success: true,
      data: careers,
      pagination: {
        current: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching careers by sector:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}

module.exports = {
  getAllCareers,
  getCareerById,
  searchCareers,
  getCareersBySector,
};
