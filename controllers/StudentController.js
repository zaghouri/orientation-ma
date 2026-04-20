/**
 * Student Controller
 * Handles student-related API operations
 */

const { Student } = require('../models');
const mongoose = require('mongoose');

/**
 * Get student by ID
 * GET /students/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getStudentById(req, res) {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid student ID format',
        message: 'Student ID must be a valid MongoDB ObjectId',
      });
    }

    // Fetch student from database
    const student = await Student.findById(id)
      .select('-passwordHash') // Exclude password hash
      .populate('assessments');

    // Return 404 if student not found
    if (!student) {
      return res.status(404).json({
        error: 'Student not found',
        message: `No student found with ID: ${id}`,
      });
    }

    // Return student profile
    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error('Error fetching student:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}

/**
 * Get all students (admin only)
 * GET /students
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getAllStudents(req, res) {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Fetch students with pagination
    const students = await Student.find()
      .select('-passwordHash')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Get total count
    const total = await Student.countDocuments();

    // Return paginated results
    res.status(200).json({
      success: true,
      data: students,
      pagination: {
        current: page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching students:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}

/**
 * Update student profile
 * PUT /students/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function updateStudent(req, res) {
  try {
    const { id } = req.params;
    const { name, email, phone, bio, interests } = req.body;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid student ID format',
        message: 'Student ID must be a valid MongoDB ObjectId',
      });
    }

    // Build update object (only allow specific fields)
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;
    if (interests !== undefined) updateData.interests = interests;

    // Update student
    const student = await Student.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    // Return 404 if student not found
    if (!student) {
      return res.status(404).json({
        error: 'Student not found',
        message: `No student found with ID: ${id}`,
      });
    }

    // Return updated student
    res.status(200).json({
      success: true,
      data: student,
      message: 'Student profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating student:', error.message);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        message: Object.values(error.errors)
          .map((e) => e.message)
          .join(', '),
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}

module.exports = {
  getStudentById,
  getAllStudents,
  updateStudent,
};
