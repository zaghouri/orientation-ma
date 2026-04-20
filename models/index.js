/**
 * Models Index
 * Centralized export for all Mongoose models
 */

const Student = require('./Student');
const Career = require('./Career');
const Assessment = require('./Assessment');

module.exports = {
  Student,
  Career,
  Assessment,
};
