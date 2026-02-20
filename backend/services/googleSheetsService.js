import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class GoogleSheetsService {
  constructor() {
    this.baseUrl = process.env.GOOGLE_SHEETS_API_URL;
    this.apiKey = process.env.GOOGLE_SHEETS_API_KEY;
  }

  async request(action, method = 'GET', data = null) {
    try {
      const url = `${this.baseUrl}?action=${action}&apiKey=${this.apiKey}`;
      
      const config = {
        method,
        url,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (data && method === 'POST') {
        config.data = { ...data, action, apiKey: this.apiKey };
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error('Google Sheets API Error:', error.response?.data || error.message);
      throw new Error('Failed to communicate with Google Sheets');
    }
  }

  async getStudents() {
    return this.request('getStudents');
  }

  async addStudent(studentData) {
    return this.request('addStudent', 'POST', studentData);
  }

  async updateStudent(rowIndex, updates) {
    return this.request('updateStudent', 'POST', { rowIndex, ...updates });
  }

  async deleteStudent(rowIndex) {
    return this.request('deleteStudent', 'POST', { rowIndex });
  }

  async updateStatus(rowIndex, status) {
    return this.request('updateStatus', 'POST', { rowIndex, status });
  }

  async getStats() {
    return this.request('getStats');
  }
}

export default new GoogleSheetsService();