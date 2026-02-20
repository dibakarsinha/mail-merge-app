import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Divider,
  Switch,
  FormControlLabel,
  Alert,
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar
} from '@mui/material';
import {
  Save as SaveIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Backup as BackupIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Refresh as RefreshIcon,
  TestTube as TestIcon
} from '@mui/icons-material';
import { settingsAPI, emailAPI } from '../services/api';
import toast from 'react-hot-toast';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Settings = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({});
  
  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    fromEmail: 'mentor@university.edu',
    fromName: 'Student Mentor',
    encryption: 'tls',
    dailyLimit: 500,
    delayBetweenEmails: 1500,
    maxRetries: 3,
    retryDelay: 60000
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    sendOnSuccess: true,
    sendOnFailure: true,
    dailyReport: false,
    weeklyReport: true,
    lowCgpaAlert: true,
    alertThreshold: 6.0
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    ipWhitelist: [],
    apiKey: '',
    requireApproval: false
  });

  // Backup Settings
  const [backupSettings, setBackupSettings] = useState({
    autoBackup: false,
    backupFrequency: 'weekly',
    backupTime: '00:00',
    keepBackups: 30
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await settingsAPI.get();
      setEmailSettings(data.emailSettings || emailSettings);
      setNotificationSettings(data.notificationSettings || notificationSettings);
      setSecuritySettings(data.securitySettings || securitySettings);
      setBackupSettings(data.backupSettings || backupSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEmailChange = (field, value) => {
    setEmailSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field, value) => {
    setNotificationSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSecurityChange = (field, value) => {
    setSecuritySettings(prev => ({ ...prev, [field]: value }));
  };

  const handleBackupChange = (field, value) => {
    setBackupSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveAll = async () => {
    setLoading(true);
    try {
      await settingsAPI.update({
        emailSettings,
        notificationSettings,
        securitySettings,
        backupSettings
      });
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setLoading(true);
    try {
      await settingsAPI.testConnection();
      toast.success('Connection test successful!');
    } catch (error) {
      console.error('Connection test failed:', error);
      toast.error('Connection test failed. Please check your settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    setLoading(true);
    try {
      await emailAPI.test(emailSettings.fromEmail);
      toast.success('Test email sent successfully!');
    } catch (error) {
      console.error('Test email failed:', error);
      toast.error('Failed to send test email');
    } finally {
      setLoading(false);
    }
  };

  const generateApiKey = () => {
    const key = `MK_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setSecuritySettings(prev => ({ ...prev, apiKey: key }));
  };

  const SettingSection = ({ title, icon, children }) => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 32, height: 32 }}>
            {icon}
          </Avatar>
          <Typography variant="h6">{title}</Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        {children}
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" gutterBottom>
              Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure your application settings
            </Typography>
          </Box>
          <Box>
            <Tooltip title="Refresh">
              <IconButton onClick={loadSettings} sx={{ mr: 1 }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveAll}
              disabled={loading}
            >
              Save All
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Settings Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable">
          <Tab icon={<EmailIcon />} label="Email" />
          <Tab icon={<NotificationsIcon />} label="Notifications" />
          <Tab icon={<SecurityIcon />} label="Security" />
          <Tab icon={<BackupIcon />} label="Backup" />
        </Tabs>

        {/* Email Settings Tab */}
        <TabPanel value={tabValue} index={0}>
          <SettingSection title="SMTP Configuration" icon={<EmailIcon />}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SMTP Host"
                  value={emailSettings.smtpHost}
                  onChange={(e) => handleEmailChange('smtpHost', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Port"
                  type="number"
                  value={emailSettings.smtpPort}
                  onChange={(e) => handleEmailChange('smtpPort', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Encryption</InputLabel>
                  <Select
                    value={emailSettings.encryption}
                    onChange={(e) => handleEmailChange('encryption', e.target.value)}
                    label="Encryption"
                  >
                    <MenuItem value="none">None</MenuItem>
                    <MenuItem value="tls">TLS</MenuItem>
                    <MenuItem value="ssl">SSL</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SMTP Username"
                  value={emailSettings.smtpUser}
                  onChange={(e) => handleEmailChange('smtpUser', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SMTP Password"
                  type={showPassword.smtp ? 'text' : 'password'}
                  value={emailSettings.smtpPass}
                  onChange={(e) => handleEmailChange('smtpPass', e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword({ ...showPassword, smtp: !showPassword.smtp })}
                          edge="end"
                        >
                          {showPassword.smtp ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Test Connection
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<TestIcon />}
                  onClick={handleTestConnection}
                  sx={{ mr: 2 }}
                >
                  Test SMTP Connection
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<EmailIcon />}
                  onClick={handleTestEmail}
                >
                  Send Test Email
                </Button>
              </Grid>
            </Grid>
          </SettingSection>

          <SettingSection title="Email Settings" icon={<EmailIcon />}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="From Email"
                  value={emailSettings.fromEmail}
                  onChange={(e) => handleEmailChange('fromEmail', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="From Name"
                  value={emailSettings.fromName}
                  onChange={(e) => handleEmailChange('fromName', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Daily Email Limit"
                  type="number"
                  value={emailSettings.dailyLimit}
                  onChange={(e) => handleEmailChange('dailyLimit', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Delay Between Emails (ms)"
                  type="number"
                  value={emailSettings.delayBetweenEmails}
                  onChange={(e) => handleEmailChange('delayBetweenEmails', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Max Retries"
                  type="number"
                  value={emailSettings.maxRetries}
                  onChange={(e) => handleEmailChange('maxRetries', e.target.value)}
                />
              </Grid>
            </Grid>
          </SettingSection>
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={tabValue} index={1}>
          <SettingSection title="Notification Preferences" icon={<NotificationsIcon />}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                    />
                  }
                  label="Enable Email Notifications"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.sendOnSuccess}
                      onChange={(e) => handleNotificationChange('sendOnSuccess', e.target.checked)}
                      disabled={!notificationSettings.emailNotifications}
                    />
                  }
                  label="Notify on successful email sends"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.sendOnFailure}
                      onChange={(e) => handleNotificationChange('sendOnFailure', e.target.checked)}
                      disabled={!notificationSettings.emailNotifications}
                    />
                  }
                  label="Notify on email failures"
                />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Reports
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.dailyReport}
                      onChange={(e) => handleNotificationChange('dailyReport', e.target.checked)}
                    />
                  }
                  label="Send daily summary report"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.weeklyReport}
                      onChange={(e) => handleNotificationChange('weeklyReport', e.target.checked)}
                    />
                  }
                  label="Send weekly summary report"
                />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Alerts
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.lowCgpaAlert}
                      onChange={(e) => handleNotificationChange('lowCgpaAlert', e.target.checked)}
                    />
                  }
                  label="Alert on low CGPA students"
                />
              </Grid>
              {notificationSettings.lowCgpaAlert && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="CGPA Alert Threshold"
                    type="number"
                    value={notificationSettings.alertThreshold}
                    onChange={(e) => handleNotificationChange('alertThreshold', e.target.value)}
                    inputProps={{ min: 0, max: 10, step: 0.1 }}
                  />
                </Grid>
              )}
            </Grid>
          </SettingSection>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={tabValue} index={2}>
          <SettingSection title="Security Settings" icon={<SecurityIcon />}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={securitySettings.twoFactorAuth}
                      onChange={(e) => handleSecurityChange('twoFactorAuth', e.target.checked)}
                    />
                  }
                  label="Enable Two-Factor Authentication"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Session Timeout (minutes)"
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => handleSecurityChange('sessionTimeout', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={securitySettings.requireApproval}
                      onChange={(e) => handleSecurityChange('requireApproval', e.target.checked)}
                    />
                  }
                  label="Require approval for bulk emails"
                />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  API Key
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="API Key"
                  value={securitySettings.apiKey}
                  onChange={(e) => handleSecurityChange('apiKey', e.target.value)}
                  type={showPassword.apiKey ? 'text' : 'password'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword({ ...showPassword, apiKey: !showPassword.apiKey })}
                          edge="end"
                        >
                          {showPassword.apiKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="outlined" onClick={generateApiKey}>
                  Generate New API Key
                </Button>
              </Grid>
            </Grid>
          </SettingSection>
        </TabPanel>

        {/* Backup Tab */}
        <TabPanel value={tabValue} index={3}>
          <SettingSection title="Backup Settings" icon={<BackupIcon />}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={backupSettings.autoBackup}
                      onChange={(e) => handleBackupChange('autoBackup', e.target.checked)}
                    />
                  }
                  label="Enable Automatic Backups"
                />
              </Grid>
              {backupSettings.autoBackup && (
                <>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Backup Frequency</InputLabel>
                      <Select
                        value={backupSettings.backupFrequency}
                        onChange={(e) => handleBackupChange('backupFrequency', e.target.value)}
                        label="Backup Frequency"
                      >
                        <MenuItem value="daily">Daily</MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Backup Time"
                      type="time"
                      value={backupSettings.backupTime}
                      onChange={(e) => handleBackupChange('backupTime', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Keep Last N Backups"
                      type="number"
                      value={backupSettings.keepBackups}
                      onChange={(e) => handleBackupChange('keepBackups', e.target.value)}
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Manual Backup
                </Typography>
                <Button variant="contained" startIcon={<BackupIcon />}>
                  Create Backup Now
                </Button>
              </Grid>
            </Grid>
          </SettingSection>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default Settings;