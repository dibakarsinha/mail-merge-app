import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Button,
  Tooltip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Email as EmailIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';
import { dashboardAPI, studentAPI, emailAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    emailsSent: 0,
    pendingEmails: 0,
    failedEmails: 0,
    scheduledEmails: 0,
    averageCGPA: 0,
    lowCGPAStudents: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [],
    sent: [],
    pending: []
  });
  const [semesterDistribution, setSemesterDistribution] = useState([]);
  const [cgpaDistribution, setCgpaDistribution] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load all dashboard data in parallel
      const [statsData, recentActivityData, chartDataResult, studentsData] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentActivity(),
        dashboardAPI.getChartData('week'),
        studentAPI.getAll()
      ]);

      // Update stats
      setStats(statsData);

      // Update recent activity
      setRecentActivity(recentActivityData);

      // Update chart data
      setChartData({
        labels: chartDataResult.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        sent: chartDataResult.sent || [5, 10, 15, 20, 25, 30, 35],
        pending: chartDataResult.pending || [20, 15, 10, 5, 8, 12, 7]
      });

      // Calculate distributions
      if (studentsData.students) {
        // Semester distribution
        const semCount = {};
        studentsData.students.forEach(s => {
          const sem = s.semester || 'Unknown';
          semCount[sem] = (semCount[sem] || 0) + 1;
        });
        setSemesterDistribution(Object.entries(semCount).map(([sem, count]) => ({ sem, count })));

        // CGPA distribution
        const cgpaRanges = {
          '9.0-10.0': 0,
          '8.0-8.9': 0,
          '7.0-7.9': 0,
          '6.0-6.9': 0,
          'Below 6.0': 0
        };
        studentsData.students.forEach(s => {
          const cgpa = parseFloat(s.cgpa) || 0;
          if (cgpa >= 9.0) cgpaRanges['9.0-10.0']++;
          else if (cgpa >= 8.0) cgpaRanges['8.0-8.9']++;
          else if (cgpa >= 7.0) cgpaRanges['7.0-7.9']++;
          else if (cgpa >= 6.0) cgpaRanges['6.0-6.9']++;
          else cgpaRanges['Below 6.0']++;
        });
        setCgpaDistribution(Object.entries(cgpaRanges).map(([range, count]) => ({ range, count })));

        // Recent students (last 5)
        setRecentStudents(studentsData.students.slice(-5).reverse());
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Chart configurations
  const lineChartData = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Emails Sent',
        data: chartData.sent,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Pending Emails',
        data: chartData.pending,
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const doughnutData = {
    labels: cgpaDistribution.map(d => d.range),
    datasets: [
      {
        data: cgpaDistribution.map(d => d.count),
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(255, 99, 132, 0.8)'
        ],
        borderWidth: 1
      }
    ]
  };

  const StatCard = ({ title, value, icon, color, subtitle, onClick }) => (
    <Card 
      sx={{ 
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: 4
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography color="text.secondary" variant="subtitle2">
            {title}
          </Typography>
          <Avatar sx={{ bgcolor: color, width: 40, height: 40 }}>
            {icon}
          </Avatar>
        </Box>
        <Typography variant="h4" component="div" gutterBottom>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
        <Typography align="center" sx={{ mt: 2 }}>
          Loading dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Tooltip title="Refresh Data">
          <IconButton onClick={loadDashboardData}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={<PeopleIcon />}
            color="#1976d2"
            subtitle="Enrolled students"
            onClick={() => navigate('/students')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Emails Sent"
            value={stats.emailsSent}
            icon={<CheckCircleIcon />}
            color="#2e7d32"
            subtitle="Successfully delivered"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending"
            value={stats.pendingEmails}
            icon={<ScheduleIcon />}
            color="#ed6c02"
            subtitle="Awaiting delivery"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Low CGPA (<6.0)"
            value={stats.lowCGPAStudents}
            icon={<WarningIcon />}
            color="#d32f2f"
            subtitle="Need attention"
            onClick={() => navigate('/students?cgpaBelow=6.0')}
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Email Activity (Last 7 Days)
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line 
                data={lineChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              CGPA Distribution
            </Typography>
            <Box sx={{ height: 250, display: 'flex', justifyContent: 'center' }}>
              <Doughnut 
                data={doughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Second Row */}
      <Grid container spacing={3}>
        {/* Semester Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Students by Semester
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Semester</TableCell>
                    <TableCell align="right">Count</TableCell>
                    <TableCell align="right">Percentage</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {semesterDistribution.map((item) => (
                    <TableRow key={item.sem}>
                      <TableCell>Semester {item.sem}</TableCell>
                      <TableCell align="right">{item.count}</TableCell>
                      <TableCell align="right">
                        {((item.count / stats.totalStudents) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Details</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentActivity.slice(0, 5).map((activity, index) => (
                    <TableRow key={index}>
                      <TableCell>{activity.time}</TableCell>
                      <TableCell>{activity.action}</TableCell>
                      <TableCell>{activity.details}</TableCell>
                      <TableCell>
                        <Chip
                          label={activity.status}
                          size="small"
                          color={
                            activity.status === 'Success' ? 'success' :
                            activity.status === 'Pending' ? 'warning' : 'error'
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Recent Students */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recently Added Students
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Registration No</TableCell>
                    <TableCell>Semester</TableCell>
                    <TableCell>CGPA</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentStudents.map((student) => (
                    <TableRow key={student.rowIndex}>
                      <TableCell>{student.studentName}</TableCell>
                      <TableCell>{student.registrationNo}</TableCell>
                      <TableCell>{student.semester}</TableCell>
                      <TableCell>
                        <Chip
                          label={student.cgpa}
                          size="small"
                          color={
                            parseFloat(student.cgpa) >= 7.5 ? 'success' :
                            parseFloat(student.cgpa) >= 6.0 ? 'warning' : 'error'
                          }
                        />
                      </TableCell>
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
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => navigate(`/students?view=${student.rowIndex}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;