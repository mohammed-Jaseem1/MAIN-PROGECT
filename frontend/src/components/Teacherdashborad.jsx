import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  Paper,
  Stack,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  alpha
} from '@mui/material';

import {
  School,
  Assignment,
  Quiz,
  Logout,
  Dashboard,
  People
} from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';

const cardStyle = {
  borderRadius: 4,
  boxShadow: '0px 10px 30px rgba(0,0,0,0.04)',
  transition: '0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0px 20px 40px rgba(0,0,0,0.08)',
  },
};

const Teacherdashboard = () => {

  const [submissions, setSubmissions] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);

  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  const getStatusColor = (status) => {
    if (status === 'Submitted') return '#f59e0b';
    if (status === 'Graded') return '#10b981';
    return '#6366f1';
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f3f4f6' }}>

      {/* Sidebar on the left */}
      <Paper
        elevation={0}
        sx={{
          width: 240,
          bgcolor: '#1e293b',
          color: 'white',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'fixed', // Fix sidebar to the left
          left: 0,
          top: 0,
          bottom: 0,
          height: '100vh',
          zIndex: 1000
        }}
      >

        <Box>
          <Stack direction="row" spacing={2} alignItems="center" mb={5}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <School />
            </Avatar>
            <Typography fontWeight="bold">Teacher Panel</Typography>
          </Stack>

          <Stack spacing={1}>

            <Button
              startIcon={<Dashboard />}
              sx={{ color: 'white', justifyContent: 'flex-start' }}
            >
              Dashboard
            </Button>

            <Button
              startIcon={<Assignment />}
              sx={{ color: 'white', justifyContent: 'flex-start' }}
              onClick={() => navigate('/question-paper-management')}
            >
              Question Papers
            </Button>

            <Button
              startIcon={<Quiz />}
              sx={{ color: 'white', justifyContent: 'flex-start' }}
              onClick={() => navigate('/manage-exams')}
            >
              Exams
            </Button>

            <Button
              startIcon={<People />}
              sx={{ color: 'white', justifyContent: 'flex-start' }}
            >
              Students
            </Button>

            <Button
              startIcon={
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>notifications</span>
              }
              sx={{ color: 'white', justifyContent: 'flex-start' }}
              onClick={() => navigate('/teacher-notifications')}
            >
              Notifications
            </Button>

          </Stack>
        </Box>

        <Button
          startIcon={<Logout />}
          variant="contained"
          color="error"
          onClick={handleLogout}
        >
          Logout
        </Button>

      </Paper>

      {/* Main content, with left margin to accommodate sidebar */}
      <Box sx={{ flex: 1, p: 4, ml: '240px', position: 'relative' }}>

        {/* HEADER */}
        <Typography variant="h4" fontWeight="bold" mb={4}>
          Teacher Dashboard
        </Typography>

        {/* ===== Cards for Upcoming Exams, To Grade, Graded (left side, spaced) ===== */}
        <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
          <Card sx={{ ...cardStyle, minWidth: 220 }}>
            <CardContent>
              <Typography color="text.secondary">
                Upcoming Exams
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {upcomingClasses.length}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ ...cardStyle, minWidth: 220 }}>
            <CardContent>
              <Typography color="text.secondary">
                To Grade
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {submissions.filter(s => s.status === 'Submitted').length}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ ...cardStyle, minWidth: 220 }}>
            <CardContent>
              <Typography color="text.secondary">
                Graded
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {submissions.filter(s => s.status === 'Graded').length}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* ===== QUICK ACTION CARDS FIXED AT BOTTOM LEFT ===== */}
        <Box
          sx={{
            position: 'fixed',
            left: 280, // move further right to clear sidebar
            bottom: 32,
            zIndex: 1201,
            display: 'flex',
            gap: 2,
          }}
        >
          <Card
            sx={cardStyle}
            onClick={() => navigate('/question-paper-management')}
            style={{ cursor: 'pointer', minWidth: 180 }}
          >
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Assignment />
                </Avatar>
                <Box>
                  <Typography fontWeight="bold">Question Paper</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create/manage
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
          <Card
            sx={cardStyle}
            onClick={() => navigate('/manage-exams')}
            style={{ cursor: 'pointer', minWidth: 180 }}
          >
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Quiz />
                </Avatar>
                <Box>
                  <Typography fontWeight="bold">Manage Exam</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Schedule/edit
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* ===== Upcoming Exams & Recent Submissions side by side ===== */}
        <Box sx={{ display: 'flex', gap: 4 }}>
          {/* Left: Upcoming Exams */}
          <Box sx={{ flex: 1 }}>
            <Card sx={cardStyle}>
              <CardContent>
                <Typography fontWeight="bold" mb={2}>
                  Upcoming Exams
                </Typography>
                <List>
                  {upcomingClasses.length === 0 ? (
                    <Typography color="text.secondary">
                      upcoming exams
                    </Typography>
                  ) : (
                    upcomingClasses.map((cls) => (
                      <ListItem key={cls.id}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: alpha('#6366f1',0.1), color:'#6366f1'}}>
                            {cls.title?.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={cls.title}
                          secondary={`${cls.date} at ${cls.time}`}
                        />
                      </ListItem>
                    ))
                  )}
                </List>
              </CardContent>
            </Card>
          </Box>

          {/* Right: Recent Submissions */}
          <Box sx={{ flex: 2 }}>
            <Card sx={cardStyle}>
              <CardContent>
                <Typography fontWeight="bold" mb={2}>
                  Recent Submissions
                </Typography>
                <Stack spacing={2}>
                  {submissions.map((submission) => (
                    <Box
                      key={submission.id}
                      sx={{
                        display:'flex',
                        justifyContent:'space-between',
                        alignItems:'center',
                        p:2,
                        borderRadius:2,
                        bgcolor:'#f8fafc'
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar>
                          {submission.student.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography fontWeight="bold">
                            {submission.student}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {submission.assignment}
                          </Typography>
                        </Box>
                      </Stack>
                      <Chip
                        label={submission.status}
                        sx={{
                          bgcolor: alpha(getStatusColor(submission.status),0.1),
                          color: getStatusColor(submission.status),
                          fontWeight:'bold'
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Box>

      </Box>

    </Box>
  );
};

export default Teacherdashboard;
