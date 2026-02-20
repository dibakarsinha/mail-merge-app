import express from 'express';
import googleSheetsService from '../services/googleSheetsService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get all students
router.get('/', async (req, res) => {
  try {
    const result = await googleSheetsService.getStudents();
    res.json(result);
  } catch (error) {
    logger.error('Error fetching students:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch students' 
    });
  }
});

// Add new student
router.post('/', async (req, res) => {
  try {
    const { studentName, registrationNo, semester, cgpa, credits, email } = req.body;
    
    // Validation
    if (!studentName || !registrationNo || !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, Registration No, and Email are required' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid email format' 
      });
    }

    const result = await googleSheetsService.addStudent({
      studentName,
      registrationNo,
      semester,
      cgpa,
      credits,
      email
    });

    res.status(201).json(result);
  } catch (error) {
    logger.error('Error adding student:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to add student' 
    });
  }
});

// Update student
router.put('/:rowIndex', async (req, res) => {
  try {
    const { rowIndex } = req.params;
    const updates = req.body;
    
    const result = await googleSheetsService.updateStudent(parseInt(rowIndex), updates);
    res.json(result);
  } catch (error) {
    logger.error('Error updating student:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update student' 
    });
  }
});

// Delete student
router.delete('/:rowIndex', async (req, res) => {
  try {
    const { rowIndex } = req.params;
    const result = await googleSheetsService.deleteStudent(parseInt(rowIndex));
    res.json(result);
  } catch (error) {
    logger.error('Error deleting student:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete student' 
    });
  }
});

// Get statistics
router.get('/stats', async (req, res) => {
  try {
    const result = await googleSheetsService.getStats();
    res.json(result);
  } catch (error) {
    logger.error('Error fetching stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch statistics' 
    });
  }
});

export default router;