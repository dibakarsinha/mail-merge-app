import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Chip,
  LinearProgress,
  Box,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Snackbar,
  Tab,
  Tabs,
  Divider
} from '@mui/material';
import {
  Send as SendIcon,
  Preview as PreviewIcon,
  Email as EmailIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { studentAPI, emailAPI } from '../services/api';
import toast from 'react-hot-toast';

// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SendEmails = () => {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewAllOpen, setPreviewAllOpen] = useState(false);
  const [filters, setFilters] = useState({
    semester: 'all',
    cgpaBelow: '',
    status: 'all',
    search: ''
  });
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [emailSettings, setEmailSettings] = useState({
    subject: 'Academic Progress – B.Tech (CSE)',
    delayBetweenEmails: 1500,
    includeCcs: false,
    ccEmails: '',
    includeAttachments: false
  });
  const [scheduledTime, setScheduledTime] = useState('');
  const [scheduleDialog, setScheduleDialog] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await studentAPI.getAll();
      setStudents(data.students || []);
    } catch (error) {
      console.error('Failed to load students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const filteredStudents = getFilteredStudents();
      setSelected(filteredStudents.map(s => s.rowIndex));
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (rowIndex) => {
    setSelected(prev =>
      prev.includes(rowIndex)
        ? prev.filter(id => id !== rowIndex)
        : [...prev, rowIndex]
    );
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setSelected([]); // Clear selection when filters change
  };

  const clearFilters = () => {
    setFilters({
      semester: 'all',
      cgpaBelow: '',
      status: 'all',
      search: ''
    });
  };

  const getFilteredStudents = () => {
    return students.filter(student => {
      // Semester filter
      if (filters.semester !== 'all' && student.semester !== filters.semester) {
        return false;
      }
      
      // CGPA filter
      if (filters.cgpaBelow && parseFloat(student.cgpa) > parseFloat(filters.cgpaBelow)) {
        return false;
      }
      
      // Status filter
      if (filters.status !== 'all') {
        const status = (student.status || '').toLowerCase();
        if (filters.status === 'sent' && !status.includes('sent')) return false;
        if (filters.status === 'pending' && status.includes('sent')) return false;
        if (filters.status === 'failed' && !status.includes('fail')) return false;
      }
      
      // Search filter (name, reg no, email)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const nameMatch = (student.studentName || '').toLowerCase().includes(searchLower);
        const regMatch = (student.registrationNo || '').toLowerCase().includes(searchLower);
        const emailMatch = (student.email || '').toLowerCase().includes(searchLower);
        if (!nameMatch && !regMatch && !emailMatch) return false;
      }
      
      return true;
    });
  };

  const getSelectedStudents = () => {
    const filteredStudents = getFilteredStudents();
    return filteredStudents.filter(s => selected.includes(s.rowIndex));
  };

  const handlePreview = () => {
    const selectedStudents = getSelectedStudents();
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }
    
    if (selectedStudents.length === 1) {
      setPreviewData(selectedStudents[0]);
      setPreviewOpen(true);
    } else {
      setPreviewAllOpen(true);
    }
  };

  const handleSend = async () => {
    const selectedStudents = getSelectedStudents();
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }

    // Validate email addresses
    const invalidEmails = selectedStudents.filter(s => !isValidEmail(s.email));
    if (invalidEmails.length > 0) {
      toast.error(`${invalidEmails.length} student(s) have invalid email addresses`);
      return;
    }

    const confirm = window.confirm(
      `Send emails to ${selectedStudents.length} selected students?\n` +
      `Delay between emails: ${emailSettings.delayBetweenEmails}ms\n` +
      `Subject: ${emailSettings.subject}`
    );
    if (!confirm) return;

    setSending(true);
    setProgress(0);
    setResults(null);

    try {
      const result = await emailAPI.sendBulk(selectedStudents, emailSettings.delayBetweenEmails);
      setResults(result.summary);
      
      if (result.summary.successful > 0) {
        toast.success(`${result.summary.successful} emails sent successfully`);
      }
      if (result.summary.failed > 0) {
        toast.error(`${result.summary.failed} emails failed`);
      }
      
      loadStudents(); // Refresh status
    } catch (error) {
      toast.error('Failed to send emails: ' + error.message);
    } finally {
      setSending(false);
      setProgress(100);
    }
  };

  const handleSchedule = () => {
    const selectedStudents = getSelectedStudents();
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }
    setScheduleDialog(true);
  };

  const scheduleEmails = async () => {
    if (!scheduledTime) {
      toast.error('Please select a scheduled time');
      return;
    }

    const selectedStudents = getSelectedStudents();
    
    // Store in localStorage for demo (in production, this would go to backend)
    const scheduledJobs = JSON.parse(localStorage.getItem('scheduledEmails') || '[]');
    scheduledJobs.push({
      id: Date.now(),
      time: scheduledTime,
      students: selectedStudents.length,
      subject: emailSettings.subject,
      status: 'scheduled'
    });
    localStorage.setItem('scheduledEmails', JSON.stringify(scheduledJobs));

    toast.success(`Emails scheduled for ${new Date(scheduledTime).toLocaleString()}`);
    setScheduleDialog(false);
    setScheduledTime('');
  };

  const handleTestEmail = async () => {
    const testEmail = prompt('Enter your email address for testing:');
    if (!testEmail) return;

    if (!isValidEmail(testEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      await emailAPI.test(testEmail);
      toast.success('Test email sent! Please check your inbox.');
    } catch (error) {
      toast.error('Failed to send test email: ' + error.message);
    }
  };

  const handleExport = () => {
    const selectedStudents = getSelectedStudents();
    if (selectedStudents.length === 0) {
      toast.error('No students selected to export');
      return;
    }

    const csvContent = [
      ['Name', 'Registration No', 'Semester', 'CGPA', 'Credits', 'Email', 'Status'].join(','),
      ...selectedStudents.map(s => 
        [s.studentName, s.registrationNo, s.semester, s.cgpa, s.credits, s.email, s.status || 'pending'].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `selected-students-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const filteredStudents = getFilteredStudents();
  const selectedStudents = getSelectedStudents();

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box display="flex" alignItems="center">
              <EmailIcon sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
              <Box>
                <Typography variant="h5" gutterBottom>
                  Send Academic Progress Emails
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedStudents.length} student(s) selected • {filteredStudents.length} filtered
                </Typography>
              </Box>
            </Box>
            <Box>
              <Tooltip title="Refresh Data">
                <IconButton onClick={loadStudents} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Test Email Configuration">
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleTestEmail}
                  startIcon={<SendIcon />}
                  sx={{ ml: 2 }}
                >
                  Test Email
                </Button>
              </Tooltip>
            </Box>
          </Paper>
        </Grid>

        {/* Tabs */}
        <Grid item xs={12}>
          <Paper sx={{ width: '100%' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="email tabs">
              <Tab label="Send Emails" />
              <Tab label="Settings" />
              <Tab label="Scheduled" />
              <Tab label="History" />
            </Tabs>
          </Paper>
        </Grid>

        {/* Tab 1: Send Emails */}
        <TabPanel value={tabValue} index={0} style={{ width: '100%' }}>
          <Grid container spacing={3}>
            {/* Filters */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Filters
                  </Typography>
                  <Button size="small" onClick={clearFilters} startIcon={<ClearIcon />}>
                    Clear Filters
                  </Button>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Semester</InputLabel>
                      <Select
                        value={filters.semester}
                        onChange={(e) => handleFilterChange('semester', e.target.value)}
                        label="Semester"
                      >
                        <MenuItem value="all">All Semesters</MenuItem>
                        <MenuItem value="1">Semester 1</MenuItem>
                        <MenuItem value="2">Semester 2</MenuItem>
                        <MenuItem value="3">Semester 3</MenuItem>
                        <MenuItem value="4">Semester 4</MenuItem>
                        <MenuItem value="5">Semester 5</MenuItem>
                        <MenuItem value="6">Semester 6</MenuItem>
                        <MenuItem value="7">Semester 7</MenuItem>
                        <MenuItem value="8">Semester 8</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      fullWidth
                      size="small"
                      label="CGPA Below"
                      type="number"
                      value={filters.cgpaBelow}
                      onChange={(e) => handleFilterChange('cgpaBelow', e.target.value)}
                      inputProps={{ min: 0, max: 10, step: 0.1 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        label="Status"
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="sent">Sent</MenuItem>
                        <MenuItem value="failed">Failed</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={5}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Search (Name, Reg No, Email)"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PreviewIcon />}
                  onClick={handlePreview}
                  disabled={selectedStudents.length === 0}
                >
                  Preview {selectedStudents.length > 0 ? `(${selectedStudents.length})` : ''}
                </Button>
                
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<SendIcon />}
                  onClick={handleSend}
                  disabled={selectedStudents.length === 0 || sending}
                >
                  Send {selectedStudents.length > 0 ? `(${selectedStudents.length})` : ''}
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<ScheduleIcon />}
                  onClick={handleSchedule}
                  disabled={selectedStudents.length === 0}
                >
                  Schedule
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleExport}
                  disabled={selectedStudents.length === 0}
                >
                  Export Selected
                </Button>
              </Paper>
            </Grid>

            {/* Progress Bar */}
            {sending && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Sending emails... {Math.round(progress)}%
                  </Typography>
                  <LinearProgress variant="determinate" value={progress} />
                </Paper>
              </Grid>
            )}

            {/* Results Summary */}
            {results && (
              <Grid item xs={12}>
                <Alert 
                  severity={results.failed > 0 ? 'warning' : 'success'}
                  onClose={() => setResults(null)}
                >
                  <Typography variant="subtitle2">Email Summary:</Typography>
                  <Typography variant="body2">
                    Total: {results.total} | 
                    Successful: {results.successful} | 
                    Failed: {results.failed}
                  </Typography>
                </Alert>
              </Grid>
            )}

            {/* Students Table */}
            <Grid item xs={12}>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'action.hover' }}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={selected.length > 0 && selected.length < filteredStudents.length}
                          checked={filteredStudents.length > 0 && selected.length === filteredStudents.length}
                          onChange={handleSelectAll}
                        />
                      </TableCell>
                      <TableCell>Student Name</TableCell>
                      <TableCell>Reg No</TableCell>
                      <TableCell>Sem</TableCell>
                      <TableCell>CGPA</TableCell>
                      <TableCell>Credits</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                          <LinearProgress />
                        </TableCell>
                      </TableRow>
                    ) : filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                          <Typography color="text.secondary">
                            No students found matching the filters
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStudents.map((student) => (
                        <TableRow 
                          key={student.rowIndex}
                          sx={{ 
                            '&:hover': { backgroundColor: 'action.hover' },
                            backgroundColor: selected.includes(student.rowIndex) ? 'action.selected' : 'inherit'
                          }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selected.includes(student.rowIndex)}
                              onChange={() => handleSelect(student.rowIndex)}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {student.studentName || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>{student.registrationNo || '-'}</TableCell>
                          <TableCell>{student.semester || '-'}</TableCell>
                          <TableCell>
                            <Chip
                              label={student.cgpa || '-'}
                              size="small"
                              color={
                                parseFloat(student.cgpa) >= 7.5 ? 'success' :
                                parseFloat(student.cgpa) >= 6.0 ? 'warning' : 'error'
                              }
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>{student.credits || '-'}</TableCell>
                          <TableCell>
                            <Tooltip title={student.email}>
                              <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                {student.email || '-'}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={student.status || 'pending'}
                              size="small"
                              color={
                                student.status?.includes('sent') ? 'success' :
                                student.status?.includes('fail') ? 'error' : 'default'
                              }
                              icon={
                                student.status?.includes('sent') ? <CheckCircleIcon /> :
                                student.status?.includes('fail') ? <ErrorIcon /> : null
                              }
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Preview">
                              <IconButton 
                                size="small" 
                                onClick={() => {
                                  setPreviewData(student);
                                  setPreviewOpen(true);
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {/* Pagination Info */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Showing {filteredStudents.length} of {students.length} students
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selected.length} selected
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 2: Settings */}
        <TabPanel value={tabValue} index={1} style={{ width: '100%' }}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom>
              Email Settings
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Subject"
                  value={emailSettings.subject}
                  onChange={(e) => setEmailSettings({ ...emailSettings, subject: e.target.value })}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Delay Between Emails (ms)"
                  value={emailSettings.delayBetweenEmails}
                  onChange={(e) => setEmailSettings({ 
                    ...emailSettings, 
                    delayBetweenEmails: parseInt(e.target.value) 
                  })}
                  helperText="Recommended: 1000-2000ms"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl>
                  <Typography variant="body2" gutterBottom>Options</Typography>
                  <Box display="flex" gap={2}>
                    <Button 
                      variant={emailSettings.includeCcs ? "contained" : "outlined"}
                      onClick={() => setEmailSettings({ 
                        ...emailSettings, 
                        includeCcs: !emailSettings.includeCcs 
                      })}
                    >
                      Include CC
                    </Button>
                    <Button 
                      variant={emailSettings.includeAttachments ? "contained" : "outlined"}
                      onClick={() => setEmailSettings({ 
                        ...emailSettings, 
                        includeAttachments: !emailSettings.includeAttachments 
                      })}
                    >
                      Include Attachments
                    </Button>
                  </Box>
                </FormControl>
              </Grid>
              
              {emailSettings.includeCcs && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="CC Email Addresses"
                    value={emailSettings.ccEmails}
                    onChange={(e) => setEmailSettings({ ...emailSettings, ccEmails: e.target.value })}
                    helperText="Separate multiple emails with commas"
                  />
                </Grid>
              )}
            </Grid>
          </Paper>
        </TabPanel>

        {/* Tab 3: Scheduled */}
        <TabPanel value={tabValue} index={2} style={{ width: '100%' }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Scheduled Emails
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Schedule ID</TableCell>
                    <TableCell>Scheduled Time</TableCell>
                    <TableCell>Students</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {JSON.parse(localStorage.getItem('scheduledEmails') || '[]').map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>{job.id}</TableCell>
                      <TableCell>{new Date(job.time).toLocaleString()}</TableCell>
                      <TableCell>{job.students}</TableCell>
                      <TableCell>{job.subject}</TableCell>
                      <TableCell>
                        <Chip label={job.status} size="small" color="info" />
                      </TableCell>
                      <TableCell>
                        <Button size="small" color="error">Cancel</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </TabPanel>

        {/* Tab 4: History */}
        <TabPanel value={tabValue} index={3} style={{ width: '100%' }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Email History
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              Email sending history will appear here
            </Typography>
          </Paper>
        </TabPanel>
      </Grid>

      {/* Single Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Email Preview
          <IconButton
            onClick={() => setPreviewOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <ClearIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {previewData && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>To:</Typography>
              <Typography variant="body2" paragraph>{previewData.email}</Typography>
              
              <Typography variant="subtitle2" gutterBottom>Subject:</Typography>
              <Typography variant="body2" paragraph>
                {emailSettings.subject} - {previewData.studentName}
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom>Body:</Typography>
              <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                  {`Dear Parent/Guardian,

Greetings from the Department of Computer Science and Engineering.

I hope this message finds you well. I am writing to you in my capacity as the student mentor of your ward, ${previewData.studentName} (Registration No.: ${previewData.registrationNo}), who is currently pursuing the ${previewData.semester} semester of the B.Tech. (CSE) programme.

ACADEMIC SUMMARY:
=================
CGPA: ${previewData.cgpa}
Total Earned Credits: ${previewData.credits}

You may also view and monitor your ward's academic performance through the SLCM portal at:
https://mujslcm.jaipur.manipal.edu/

The Department of CSE is extending full academic support to assist students in their academic journey. As the student mentor, I will continue to provide all possible academic guidance and support to your ward.

If you wish to discuss further about his/her academic progress, please feel free to contact me during official working hours (10:00 AM to 5:00 PM).

Thank you for your cooperation and support.

Regards,
Student Mentor
Department of Computer Science and Engineering`}
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
          <Button 
            variant="contained" 
            color="success" 
            onClick={() => {
              setPreviewOpen(false);
              handleSend();
            }}
          >
            Send Now
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Preview Dialog */}
      <Dialog open={previewAllOpen} onClose={() => setPreviewAllOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Bulk Email Preview ({selectedStudents.length} emails)
        </DialogTitle>
        <DialogContent dividers>
          <Alert severity="info" sx={{ mb: 2 }}>
            This is a preview of the first email. All {selectedStudents.length} emails will be personalized with student-specific data.
          </Alert>
          {selectedStudents.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>Sample Recipient:</Typography>
              <Typography variant="body2" paragraph>{selectedStudents[0].email}</Typography>
              
              <Typography variant="subtitle2" gutterBottom>Subject:</Typography>
              <Typography variant="body2" paragraph>
                {emailSettings.subject} - [Student Name]
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom>Recipients:</Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Registration No</TableCell>
                      <TableCell>Email</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedStudents.slice(0, 5).map(s => (
                      <TableRow key={s.rowIndex}>
                        <TableCell>{s.studentName}</TableCell>
                        <TableCell>{s.registrationNo}</TableCell>
                        <TableCell>{s.email}</TableCell>
                      </TableRow>
                    ))}
                    {selectedStudents.length > 5 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          ... and {selectedStudents.length - 5} more
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewAllOpen(false)}>Close</Button>
          <Button variant="contained" onClick={() => {
            setPreviewAllOpen(false);
            handleSend();
          }}>
            Send All
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialog} onClose={() => setScheduleDialog(false)}>
        <DialogTitle>Schedule Emails</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="datetime-local"
            label="Schedule Time"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mt: 2 }}
            inputProps={{
              min: new Date().toISOString().slice(0, 16)
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {selectedStudents.length} emails will be scheduled
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={scheduleEmails}>Schedule</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SendEmails;