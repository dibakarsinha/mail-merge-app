import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Pages
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import SendEmails from './pages/SendEmails';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1a73e8',
      light: '#4b9eff',
      dark: '#0d47a1',
    },
    secondary: {
      main: '#0f9d58',
      light: '#4caf50',
      dark: '#0b8043',
    },
    error: {
      main: '#d93025',
    },
    warning: {
      main: '#f4b400',
    },
    info: {
      main: '#1a73e8',
    },
    success: {
      main: '#0f9d58',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  // For demo purposes - in production, implement proper auth
  const isAuthenticated = localStorage.getItem('authToken');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/students" element={
            <PrivateRoute>
              <Layout>
                <Students />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/send-emails" element={
            <PrivateRoute>
              <Layout>
                <SendEmails />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/settings" element={
            <PrivateRoute>
              <Layout>
                <Settings />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/profile" element={
            <PrivateRoute>
              <Layout>
                <Profile />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '8px',
            background: '#333',
            color: '#fff',
          },
        }}
      />
    </ThemeProvider>
  );
}

export default App;