import express from 'express';
import emailService from '../services/emailService.js';
import googleSheetsService from '../services/googleSheetsService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Send single email
router.post('/send', async (req, res) => {
  try {
    const { student } = req.body;
    
    if (!student || !student.email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Student email is required' 
      });
    }

    const result = await emailService.sendEmail(student.email, student);
    
    // Update status in Google Sheets
    if (result.success && student.rowIndex) {
      await googleSheetsService.updateStatus(
        student.rowIndex, 
        `sent on ${new Date().toLocaleDateString()}`
      );
    }

    res.json(result);
  } catch (error) {
    logger.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send email' 
    });
  }
});

// Send bulk emails
router.post('/send-bulk', async (req, res) => {
  try {
    const { students, delay = 1000 } = req.body;
    
    if (!students || !students.length) {
      return res.status(400).json({ 
        success: false, 
        error: 'No students provided' 
      });
    }

    // Send emails
    const results = await emailService.sendBulkEmails(students, delay);
    
    // Update statuses in Google Sheets
    for (const success of results.successful) {
      const student = students.find(s => s.email === success.email);
      if (student?.rowIndex) {
        await googleSheetsService.updateStatus(
          student.rowIndex,
          `sent on ${new Date().toLocaleDateString()}`
        );
      }
    }

    for (const failed of results.failed) {
      const student = students.find(s => s.email === failed.email);
      if (student?.rowIndex) {
        await googleSheetsService.updateStatus(
          student.rowIndex,
          'failed'
        );
      }
    }

    res.json({
      success: true,
      summary: {
        total: students.length,
        successful: results.successful.length,
        failed: results.failed.length
      },
      details: results
    });
  } catch (error) {
    logger.error('Error sending bulk emails:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send bulk emails' 
    });
  }
});

// Test email configuration
router.post('/test', async (req, res) => {
  try {
    const { testEmail } = req.body;
    
    const testStudent = {
      studentName: 'Test Student',
      registrationNo: 'TEST001',
      semester: '5',
      cgpa: '8.5',
      credits: '120',
      email: testEmail
    };

    const result = await emailService.sendEmail(testEmail, testStudent);
    res.json(result);
  } catch (error) {
    logger.error('Error sending test email:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send test email' 
    });
  }
});

export default router;