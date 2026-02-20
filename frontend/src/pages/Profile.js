import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Avatar,
  Box,
  Divider,
  Card,
  CardContent,
  IconButton,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'faculty@university.edu',
    department: 'Computer Science Engineering',
    designation: 'Professor',
    employeeId: 'EMP001',
    phone: '+91 9876543210',
    joinDate: '2020-01-15',
    bio: 'Experienced faculty member with expertise in Computer Science.'
  });

  const [formData, setFormData] = useState({ ...profileData });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      // In production, fetch from API
      // const data = await authAPI.getProfile();
      // setProfileData(data);
      // setFormData(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setFormData({ ...profileData });
    setEditing(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // In production, call API
      // await authAPI.updateProfile(formData);
      
      setProfileData({ ...formData });
      setEditing(false);
      setShowSuccess(true);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const InfoRow = ({ label, value }) => (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid item xs={4}>
        <Typography variant="body2" color="text.secondary">
          {label}:
        </Typography>
      </Grid>
      <Grid item xs={8}>
        <Typography variant="body1">{value || '-'}</Typography>
      </Grid>
    </Grid>
  );

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                fontSize: 32,
                mr: 2
              }}
            >
              {profileData.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h5">{profileData.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {profileData.designation} • {profileData.department}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Employee ID: {profileData.employeeId}
              </Typography>
            </Box>
          </Box>
          {!editing ? (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Edit Profile
            </Button>
          ) : (
            <Box>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={loading}
                sx={{ mr: 1 }}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Profile Information */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Info
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <InfoRow label="Department" value={profileData.department} />
              <InfoRow label="Designation" value={profileData.designation} />
              <InfoRow label="Employee ID" value={profileData.employeeId} />
              <InfoRow label="Join Date" value={profileData.joinDate} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {editing ? (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Bio"
                      name="bio"
                      multiline
                      rows={4}
                      value={formData.bio}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </Grid>
              ) : (
                <Box>
                  <InfoRow label="Full Name" value={profileData.name} />
                  <InfoRow label="Email" value={profileData.email} />
                  <InfoRow label="Phone" value={profileData.phone} />
                  <InfoRow label="Bio" value={profileData.bio} />
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Button
                variant="outlined"
                color="primary"
                sx={{ mr: 2 }}
                onClick={() => {
                  // Handle password change
                  toast.success('Password reset email sent');
                }}
              >
                Change Password
              </Button>
              
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  // Handle 2FA setup
                  toast.success('2FA settings updated');
                }}
              >
                Setup Two-Factor Authentication
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setShowSuccess(false)}>
          Profile updated successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile;