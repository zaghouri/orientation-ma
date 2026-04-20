/**
 * Career Model
 * Represents career information and opportunities in Morocco
 */

const mongoose = require('mongoose');

const careerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Career title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Career description is required'],
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    recommendedFields: {
      type: [String],
      default: [],
    },
    moroccoJobMarketDemand: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    averageSalary: {
      type: Number,
      description: 'Average salary in MAD',
    },
    growthPotential: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    industry: {
      type: String,
      trim: true,
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

module.exports = mongoose.model('Career', careerSchema);
