import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  createEmailBody(student) {
    return {
      subject: `Academic Progress – B.Tech (CSE) - ${student.studentName}`,
      text: `Dear Parent/Guardian,

Greetings from the Department of Computer Science and Engineering.

I hope this message finds you well. I am writing to you in my capacity as the student mentor of your ward, ${student.studentName} (Registration No.: ${student.registrationNo}), who is currently pursuing the ${student.semester} semester of the B.Tech. (CSE) programme.

ACADEMIC SUMMARY:
=================
CGPA: ${student.cgpa}
Total Earned Credits: ${student.credits}

You may also view and monitor your ward's academic performance through the SLCM portal at:
https://mujslcm.jaipur.manipal.edu/

The Department of CSE is extending full academic support to assist students in their academic journey. As the student mentor, I will continue to provide all possible academic guidance and support to your ward.

If you wish to discuss further about his/her academic progress, please feel free to contact me during official working hours (10:00 AM to 5:00 PM).

Thank you for your cooperation and support.

Regards,
${process.env.FROM_NAME}
Department of Computer Science and Engineering`,
      
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a73e8;">Academic Progress Report</h2>
          <p>Dear Parent/Guardian,</p>
          
          <p>Greetings from the Department of Computer Science and Engineering.</p>
          
          <p>I hope this message finds you well. I am writing to you in my capacity as the student mentor of your ward, 
          <strong>${student.studentName}</strong> (Registration No.: <strong>${student.registrationNo}</strong>), 
          who is currently pursuing the <strong>${student.semester}</strong> semester of the B.Tech. (CSE) programme.</p>
          
          <h3>Academic Summary:</h3>
          <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
            <tr style="background: #f8f9fa;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>CGPA</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${student.cgpa}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Total Earned Credits</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${student.credits}</td>
            </tr>
          </table>
          
          <p>You may also view and monitor your ward's academic performance through the SLCM portal at:<br>
          <a href="https://mujslcm.jaipur.manipal.edu/">https://mujslcm.jaipur.manipal.edu/</a></p>
          
          <p>The Department of CSE is extending full academic support to assist students in their academic journey. 
          As the student mentor, I will continue to provide all possible academic guidance and support to your ward.</p>
          
          <p>If you wish to discuss further about his/her academic progress, please feel free to contact me during 
          official working hours (10:00 AM to 5:00 PM).</p>
          
          <p>Thank you for your cooperation and support.</p>
          
          <p>Regards,<br>
          <strong>${process.env.FROM_NAME}</strong><br>
          Department of Computer Science and Engineering</p>
        </div>
      `
    };
  }

  async sendEmail(to, student) {
    try {
      const emailContent = this.createEmailBody(student);
      
      const mailOptions = {
        from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
        to: to,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: info.messageId,
        response: info.response
      };
    } catch (error) {
      console.error('Email sending failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendBulkEmails(students, delay = 1000) {
    const results = {
      successful: [],
      failed: []
    };

    for (const student of students) {
      try {
        const result = await this.sendEmail(student.email, student);
        
        if (result.success) {
          results.successful.push({
            student: student.studentName,
            email: student.email,
            messageId: result.messageId
          });
        } else {
          results.failed.push({
            student: student.studentName,
            email: student.email,
            error: result.error
          });
        }

        // Delay between emails
        await new Promise(resolve => setTimeout(resolve, delay));
      } catch (error) {
        results.failed.push({
          student: student.studentName,
          email: student.email,
          error: error.message
        });
      }
    }

    return results;
  }
}

export default new EmailService();