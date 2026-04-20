/**
 * Assessment Model
 * Represents student skill and interest assessments
 */

const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['skills', 'interests', 'personality'],
      required: [true, 'Assessment type is required'],
    },
    questions: {
      type: [
        {
          id: String,
          text: String,
          options: [String],
        },
      ],
      required: [true, 'Questions are required'],
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
    },
    answers: {
      type: Map,
      of: String,
      default: new Map(),
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    completedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Assessment', assessmentSchema);
