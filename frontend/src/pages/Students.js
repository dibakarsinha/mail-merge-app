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
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  Box,
  Tooltip,
  InputAdornment,
  Menu,
  MenuItem,
  Alert,
  Snackbar,
  LinearProgress,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FileUpload as FileUploadIcon,
  FileDownload as FileDownloadIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Email as EmailIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { studentAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

const Students = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [importDialog, setImportDialog] = useState(false);
  const [importData, setImportData] = useState([]);
  const [importPreview, setImportPreview] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  const [formData, setFormData] = useState({
    studentName: '',
    registrationNo: '',
    semester: '',
    cgpa: '',
    credits: '',
    email: ''
  });

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchTerm, students]);

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

  const filterStudents = () => {
    if (!searchTerm) {
      setFilteredStudents(students);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = students.filter(s => 
      (s.studentName?.toLowerCase().includes(term)) ||
      (s.registrationNo?.toLowerCase().includes(term)) ||
      (s.email?.toLowerCase().includes(term))
    );
    setFilteredStudents(filtered);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleOpenDialog = (student = null) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        studentName: student.studentName || '',
        registrationNo: student.registrationNo || '',
        semester: student.semester || '',
        cgpa: student.cgpa || '',
        credits: student.credits || '',
        email: student.email || ''
      });
    } else {
      setEditingStudent(null);
      setFormData({
        studentName: '',
        registrationNo: '',
        semester: '',
        cgpa: '',
        credits: '',
        email: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingStudent(null);
    setFormData({
      studentName: '',
      registrationNo: '',
      semester: '',
      cgpa: '',
      credits: '',
      email: ''
    });
  };

  const handleSaveStudent = async () => {
    // Validate form
    if (!formData.studentName || !formData.registrationNo || !formData.email) {
      toast.error('Name, Registration No, and Email are required');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Invalid email format');
      return;
    }

    setLoading(true);
    try {
      if (editingStudent) {
        // Update existing student
        await studentAPI.update(editingStudent.rowIndex, formData);
        toast.success('Student updated successfully');
      } else {
        // Add new student
        await studentAPI.add(formData);
        toast.success('Student added successfully');
      }
      
      handleCloseDialog();
      loadStudents();
    } catch (error) {
      console.error('Error saving student:', error);
      toast.error('Failed to save student');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    
    setLoading(true);
    try {
      await studentAPI.delete(studentToDelete.rowIndex);
      toast.success('Student deleted successfully');
      loadStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
    } finally {
      setLoading(false);
      setDeleteDialog(false);
      setStudentToDelete(null);
    }
  };

  const handleExport = () => {
    const exportData = filteredStudents.map(s => ({
      'Student Name': s.studentName,
      'Registration No': s.registrationNo,
      'Semester': s.semester,
      'CGPA': s.cgpa,
      'Credits': s.credits,
      'Email': s.email,
      'Status': s.status || 'pending'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, `students_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast.success('Export completed');
  };

  const handleImportClick = () => {
    setImportDialog(true);
    setImportData([]);
    setImportPreview(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet);
      
      // Map column names
      const mappedData = parsedData.map(row => ({
        studentName: row['Student Name'] || row['studentName'] || row['Name'] || '',
        registrationNo: row['Registration No'] || row['registrationNo'] || row['Reg No'] || '',
        semester: row['Semester'] || row['semester'] || '',
        cgpa: row['CGPA'] || row['cgpa'] || '',
        credits: row['Credits'] || row['credits'] || '',
        email: row['Email'] || row['email'] || ''
      })).filter(row => row.studentName && row.email);
      
      setImportData(mappedData);
      setImportPreview(true);
    };
    
    reader.readAsBinaryString(file);
  };

  const handleConfirmImport = async () => {
    setLoading(true);
    try {
      let success = 0;
      let failed = 0;
      
      for (const student of importData) {
        try {
          await studentAPI.add(student);
          success++;
        } catch (error) {
          failed++;
        }
      }
      
      toast.success(`Import completed: ${success} added, ${failed} failed`);
      setImportDialog(false);
      setImportPreview(false);
      loadStudents();
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import students');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, student) => {
    setAnchorEl(event.currentTarget);
    setSelectedStudent(student);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedStudent(null);
  };

  const handleSendEmail = () => {
    handleMenuClose();
    if (selectedStudent) {
      navigate('/send-emails', { state: { selectedStudents: [selectedStudent] } });
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              Student Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Students: {students.length} | Filtered: {filteredStudents.length}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" gap={1} justifyContent="flex-end">
              <TextField
                size="small"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchTerm('')}>
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <Tooltip title="Refresh">
                <IconButton onClick={loadStudents}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export">
                <IconButton onClick={handleExport}>
                  <FileDownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Import">
                <IconButton onClick={handleImportClick}>
                  <FileUploadIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Add Student
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Students Table */}
      <TableContainer component={Paper}>
        {loading && <LinearProgress />}
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'action.hover' }}>
              <TableCell>Student Name</TableCell>
              <TableCell>Registration No</TableCell>
              <TableCell>Semester</TableCell>
              <TableCell>CGPA</TableCell>
              <TableCell>Credits</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No students found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student.rowIndex} hover>
                  <TableCell>{student.studentName || '-'}</TableCell>
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
                    />
                  </TableCell>
                  <TableCell>{student.credits || '-'}</TableCell>
                  <TableCell>{student.email || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={student.status || 'pending'}
                      size="small"
                      color={
                        student.status?.includes('sent') ? 'success' :
                        student.status?.includes('fail') ? 'error' : 'default'
                      }
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(student)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(student)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="More">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, student)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Student Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingStudent ? 'Edit Student' : 'Add New Student'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Student Name *"
                name="studentName"
                value={formData.studentName}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Registration No *"
                name="registrationNo"
                value={formData.registrationNo}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Semester"
                name="semester"
                type="number"
                value={formData.semester}
                onChange={handleInputChange}
                inputProps={{ min: 1, max: 8 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="CGPA"
                name="cgpa"
                type="number"
                value={formData.cgpa}
                onChange={handleInputChange}
                inputProps={{ min: 0, max: 10, step: 0.1 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Credits"
                name="credits"
                type="number"
                value={formData.credits}
                onChange={handleInputChange}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Email *"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveStudent}
            disabled={loading}
          >
            {editingStudent ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {studentToDelete?.studentName}?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialog} onClose={() => setImportDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Import Students</DialogTitle>
        <DialogContent dividers>
          {!importPreview ? (
            <Box textAlign="center" py={3}>
              <input
                accept=".xlsx,.xls,.csv"
                style={{ display: 'none' }}
                id="file-upload"
                type="file"
                onChange={handleFileUpload}
              />
              <label htmlFor="file-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<FileUploadIcon />}
                  size="large"
                >
                  Select Excel File
                </Button>
              </label>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Supported formats: .xlsx, .xls, .csv
              </Typography>
            </Box>
          ) : (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                Found {importData.length} students to import
              </Alert>
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Registration No</TableCell>
                      <TableCell>Email</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {importData.slice(0, 10).map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.studentName}</TableCell>
                        <TableCell>{row.registrationNo}</TableCell>
                        <TableCell>{row.email}</TableCell>
                      </TableRow>
                    ))}
                    {importData.length > 10 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          ... and {importData.length - 10} more
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialog(false)}>Cancel</Button>
          {importPreview && (
            <Button
              variant="contained"
              onClick={handleConfirmImport}
              disabled={loading}
            >
              Import {importData.length} Students
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleSendEmail}>
          <EmailIcon fontSize="small" sx={{ mr: 1 }} />
          Send Email
        </MenuItem>
        <MenuItem onClick={() => {
          handleMenuClose();
          handleOpenDialog(selectedStudent);
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => {
          handleMenuClose();
          handleDeleteClick(selectedStudent);
        }} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => handleOpenDialog()}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default Students;