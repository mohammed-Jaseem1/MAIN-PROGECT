// Admindash.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  AccessTime as AccessTimeIcon,
  PendingActions as PendingActionsIcon,
  Notifications as NotificationsIcon,
  MoreVert as MoreVertIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Book as BookIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const Admindash = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [timeRange, setTimeRange] = useState('30days');
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const navigate = useNavigate();

  // Add state for recent registrations
  const [registrationData, setRegistrationData] = useState([]);

  // Add state for stats
  const [stats, setStats] = useState({
    totalLearners: 0,
    activeInstructors: 0,
  });

  useEffect(() => {
    // Fetch recent students and teachers
    const fetchRecentRegistrations = async () => {
      try {
        // Fetch students
        const studentRes = await fetch('http://localhost:5000/api/student/recent');
        const students = studentRes.ok ? await studentRes.json() : [];
        // Fetch teachers
        const teacherRes = await fetch('http://localhost:5000/api/teacher/recent');
        const teachers = teacherRes.ok ? await teacherRes.json() : [];

        // Normalize and combine
        const studentMapped = students.map(s => ({
          id: s._id || s.student_id,
          name: s.full_name,
          email: s.email,
          date: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '',
          role: 'Student',
          status: s.account_status ? 'active' : 'inactive',
        }));
        const teacherMapped = teachers.map(t => ({
          id: t._id,
          name: `${t.firstName} ${t.lastName}`,
          email: t.email,
          date: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '',
          role: 'Teacher',
          status: t.status && t.status.toLowerCase() === 'active' ? 'active' : 'inactive',
        }));

        // Sort by date descending, show latest 6
        const combined = [...studentMapped, ...teacherMapped]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 6);

        setRegistrationData(combined);
      } catch {
        setRegistrationData([]);
      }
    };

    // Fetch stats for learners and instructors
    const fetchStats = async () => {
      try {
        // Fetch all students
        const studentRes = await fetch('http://localhost:5000/api/student');
        const students = studentRes.ok ? await studentRes.json() : [];
        // Fetch all teachers
        const teacherRes = await fetch('http://localhost:5000/api/teacher');
        const teachers = teacherRes.ok ? await teacherRes.json() : [];

        setStats({
          totalLearners: students.length,
          activeInstructors: teachers.filter(t =>
            t.status && t.status.toLowerCase() === 'active'
          ).length,
        });
      } catch {
        setStats({
          totalLearners: 0,
          activeInstructors: 0,
        });
      }
    };

    fetchRecentRegistrations();
    fetchStats();
  }, []);

  // Use fetched stats in statsData
  const statsData = [
    { id: 1, title: 'Total Learners', value: stats.totalLearners, icon: <PeopleIcon />, change: '', color: theme.palette.primary.main },
    { id: 2, title: 'Active Instructors', value: stats.activeInstructors, icon: <PersonIcon />, change: '', color: theme.palette.success.main },
  ];

  const quickActions = [
    { label: 'Student Management', icon: <PersonAddIcon />, color: 'primary' },
    { label: 'Teacher Management', icon: <SchoolIcon />, color: 'secondary' },
    { label: 'Generate Report', icon: <AssessmentIcon />, color: 'info' },
    { label: 'Send Notification', icon: <NotificationsIcon />, color: 'warning' },
  ];

  const navItems = [
    { label: 'Dashboard', icon: <DashboardIcon /> },
    { label: 'Users', icon: <PersonIcon /> },
    { label: 'Courses', icon: <BookIcon /> },
    { label: 'Reports', icon: <AssessmentIcon /> },
    { label: 'Settings', icon: <SettingsIcon /> },
  ];

  const handleTimeRangeChange = (event, newRange) => {
    if (newRange !== null) {
      setTimeRange(newRange);
    }
  };

  const handleQuickAction = (action) => {
    if (action === 'Student Management') {
      navigate('/student-management');
      return;
    }
    if (action === 'Teacher Management') {
      navigate('/teacher-management');
      return;
    }
    console.log(`Action: ${action}`);
    // Implement action logic here
  };

  const handleLogout = () => {
    // Implement logout logic here (e.g., clear tokens, redirect)
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      <Paper
        elevation={3}
        sx={{
          width: sidebarOpen ? 280 : 0,
          flexShrink: 0,
          display: { xs: sidebarOpen ? 'block' : 'none', md: 'block' },
          borderRight: 1,
          borderColor: 'divider',
          overflow: 'hidden',
          transition: 'width 0.3s',
          position: 'relative', // Ensure relative for absolute footer
        }}
      >
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
              <SchoolIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                EduPlatform
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Admin Console
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ p: 2 }}>
          <Stack spacing={1}>
            {navItems.map((item, idx) => (
              <Button
                key={item.label}
                startIcon={item.icon}
                variant={idx === 0 ? "contained" : "text"}
                color={idx === 0 ? "primary" : "inherit"}
                sx={{
                  justifyContent: 'flex-start',
                  borderRadius: 2,
                  fontWeight: idx === 0 ? 'bold' : 'normal',
                  textTransform: 'none',
                  pl: 2,
                  py: 1.5,
                }}
                fullWidth
                onClick={() => handleSidebarNav(item.label)}
              >
                {item.label}
              </Button>
            ))}
          </Stack>
        </Box>

        {/* Admin info at the bottom */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            borderTop: 1,
            borderColor: 'divider',
            p: 3,
            bgcolor: 'background.paper',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'secondary.main' }}>A</Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight="medium">
                Admin
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Administrator
              </Typography>
            </Box>
            <IconButton size="small" sx={{ ml: 'auto' }}>
              <MoreVertIcon />
            </IconButton>
          </Box>
          {/* Logout Button */}
          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              mt: 2,
              width: '100%',
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Logout
          </Button>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <Paper
          elevation={1}
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isMobile && (
              <IconButton onClick={() => setSidebarOpen(!sidebarOpen)}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h5" fontWeight="bold">
              Dashboard Overview
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search data..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 250 }}
            />
            {/* Removed Create New button */}
            <IconButton>
              <NotificationsIcon />
            </IconButton>
          </Box>
        </Paper>

        {/* Main Content */}
        <Box sx={{ p: 3, flex: 1 }}>
          {/* Welcome Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Welcome back! 
            </Typography>
            <Typography variant="body1" color="text.secondary">
             
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {statsData.map((stat) => (
              <Grid item xs={12} sm={6} md={3} key={stat.id}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    borderLeft: 4,
                    borderLeftColor: stat.color,
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {stat.title}
                      </Typography>
                      <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                    </Box>
                    
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                      {stat.value}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {stat.change === 'Needs Review' ? (
                        <Chip
                          label={stat.change}
                          size="small"
                          color="warning"
                          sx={{ borderRadius: 1 }}
                        />
                      ) : (
                        <>
                          <ArrowUpwardIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          <Typography variant="caption" color="success.main">
                            {stat.change}
                          </Typography>
                        </>
                      )}
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                        From last week
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Charts and Recent Registrations */}
          <Grid container spacing={3}>
            {/* User Activity Chart */}
            <Grid item xs={12} lg={8}>
              <Card sx={{ borderRadius: 3, height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        User Activity
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Daily active users over the last 30 days
                      </Typography>
                    </Box>
                    <ToggleButtonGroup
                      value={timeRange}
                      exclusive
                      onChange={handleTimeRangeChange}
                      size="small"
                    >
                      <ToggleButton value="7days">7 Days</ToggleButton>
                      <ToggleButton value="30days">30 Days</ToggleButton>
                      <ToggleButton value="90days">90 Days</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc', borderRadius: 2 }}>
                    <Typography color="text.secondary" variant="subtitle1">
                      No data available
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Registrations */}
            <Grid item xs={12} lg={4}>
              <Card sx={{ borderRadius: 3, height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold">
                      Recent Registrations
                    </Typography>
                    <Button size="small" color="primary">
                      View All
                    </Button>
                  </Box>

                  <List sx={{ pt: 0 }}>
                    {registrationData.length === 0 ? (
                      <Typography color="text.secondary" sx={{ px: 2, py: 2 }}>
                        No recent registrations found.
                      </Typography>
                    ) : (
                      registrationData.map((user) => (
                        <React.Fragment key={user.id}>
                          <ListItem
                            sx={{
                              px: 0,
                              py: 2,
                              '&:hover': { bgcolor: 'action.hover' },
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: user.role === 'Teacher' ? 'secondary.light' : 'primary.light' }}>
                                {user.name?.charAt(0)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="subtitle2" fontWeight="medium">
                                  {user.name}
                                </Typography>
                              }
                              secondary={
                                <>
                                  <Typography variant="caption" display="block" color="text.secondary">
                                    {user.email}
                                  </Typography>
                                  <Typography variant="caption" display="block" color="text.secondary">
                                    {user.date}
                                  </Typography>
                                </>
                              }
                            />
                            <Box sx={{ textAlign: 'right' }}>
                              <Chip
                                label={user.role}
                                size="small"
                                color={user.role === 'Teacher' ? 'secondary' : 'primary'}
                                sx={{ mb: 1 }}
                              />
                              <br />
                              <Chip
                                label={user.status}
                                size="small"
                                color={user.status === 'active' ? 'success' : 'warning'}
                                variant="outlined"
                              />
                            </Box>
                          </ListItem>
                          <Divider />
                        </React.Fragment>
                      ))
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Quick Actions */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              {quickActions.map((action) => (
                <Grid item xs={12} sm={6} md={3} key={action.label}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={action.icon}
                    onClick={() => handleQuickAction(action.label)}
                    sx={{
                      height: 80,
                      borderRadius: 3,
                      borderWidth: 2,
                      borderColor: `${action.color}.light`,
                      color: `${action.color}.main`,
                      '&:hover': {
                        borderWidth: 2,
                        bgcolor: `${action.color}.light`,
                      },
                    }}
                  >
                    {action.label}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Admindash;