/**
 * MongoDB Models Tests
 * Unit tests for Student, Career, and Assessment models
 */

const mongoose = require('mongoose');
const { Student, Career, Assessment } = require('../models');

// Mock MongoDB connection
jest.mock('mongoose');

describe('MongoDB Models', () => {
  describe('Student Model', () => {
    test('Student schema should have required fields', () => {
      const studentSchema = Student.schema;
      
      expect(studentSchema.paths.name.isRequired).toBe(true);
      expect(studentSchema.paths.email.isRequired).toBe(true);
      expect(studentSchema.paths.passwordHash.isRequired).toBe(true);
    });

    test('Student email should be unique and lowercase', () => {
      const studentSchema = Student.schema;
      
      expect(studentSchema.paths.email.options.unique).toBe(true);
      expect(studentSchema.paths.email.options.lowercase).toBe(true);
    });

    test('Student interests should default to empty array', () => {
      const studentSchema = Student.schema;
      
      expect(studentSchema.paths.interests.defaultValue).toEqual([]);
    });

    test('Student assessments should reference Assessment model', () => {
      const studentSchema = Student.schema;
      const assessmentPath = studentSchema.paths.assessments;
      
      expect(assessmentPath.options.type[0].type.name).toBe('ObjectId');
      expect(assessmentPath.options.ref).toBe('Assessment');
    });

    test('Student should have timestamps', () => {
      const studentSchema = Student.schema;
      
      expect(studentSchema.paths.createdAt).toBeDefined();
      expect(studentSchema.paths.updatedAt).toBeDefined();
    });
  });

  describe('Career Model', () => {
    test('Career schema should have required fields', () => {
      const careerSchema = Career.schema;
      
      expect(careerSchema.paths.title.isRequired).toBe(true);
      expect(careerSchema.paths.description.isRequired).toBe(true);
    });

    test('Career requiredSkills should default to empty array', () => {
      const careerSchema = Career.schema;
      
      expect(careerSchema.paths.requiredSkills.defaultValue).toEqual([]);
    });

    test('Career moroccoJobMarketDemand should have enum values', () => {
      const careerSchema = Career.schema;
      const demandPath = careerSchema.paths.moroccoJobMarketDemand;
      
      expect(demandPath.enumValues).toEqual(['High', 'Medium', 'Low']);
      expect(demandPath.defaultValue).toBe('Medium');
    });

    test('Career growthPotential should have enum values', () => {
      const careerSchema = Career.schema;
      const growthPath = careerSchema.paths.growthPotential;
      
      expect(growthPath.enumValues).toEqual(['High', 'Medium', 'Low']);
    });

    test('Career should have timestamps', () => {
      const careerSchema = Career.schema;
      
      expect(careerSchema.paths.createdAt).toBeDefined();
      expect(careerSchema.paths.updatedAt).toBeDefined();
    });
  });

  describe('Assessment Model', () => {
    test('Assessment schema should have required fields', () => {
      const assessmentSchema = Assessment.schema;
      
      expect(assessmentSchema.paths.type.isRequired).toBe(true);
      expect(assessmentSchema.paths.questions.isRequired).toBe(true);
      expect(assessmentSchema.paths.studentId.isRequired).toBe(true);
    });

    test('Assessment type should have enum values', () => {
      const assessmentSchema = Assessment.schema;
      const typePath = assessmentSchema.paths.type;
      
      expect(typePath.enumValues).toEqual(['skills', 'interests', 'personality']);
    });

    test('Assessment status should default to pending', () => {
      const assessmentSchema = Assessment.schema;
      
      expect(assessmentSchema.paths.status.defaultValue).toBe('pending');
    });

    test('Assessment score should have min/max constraints', () => {
      const assessmentSchema = Assessment.schema;
      const scorePath = assessmentSchema.paths.score;
      
      expect(scorePath.options.min).toBe(0);
      expect(scorePath.options.max).toBe(100);
    });

    test('Assessment studentId should reference Student model', () => {
      const assessmentSchema = Assessment.schema;
      const studentIdPath = assessmentSchema.paths.studentId;
      
      expect(studentIdPath.options.type.name).toBe('ObjectId');
      expect(studentIdPath.options.ref).toBe('Student');
    });

    test('Assessment should have timestamps', () => {
      const assessmentSchema = Assessment.schema;
      
      expect(assessmentSchema.paths.createdAt).toBeDefined();
      expect(assessmentSchema.paths.updatedAt).toBeDefined();
    });
  });

  describe('Database Connection', () => {
    test('Models should be properly exported', () => {
      expect(Student).toBeDefined();
      expect(Career).toBeDefined();
      expect(Assessment).toBeDefined();
    });

    test('Models should be Mongoose models', () => {
      expect(Student.collection).toBeDefined();
      expect(Career.collection).toBeDefined();
      expect(Assessment.collection).toBeDefined();
    });
  });
});
