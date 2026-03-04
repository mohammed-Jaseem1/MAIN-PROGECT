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
  useTheme,
  useMediaQuery,
  alpha,
  Container,
  Paper
} from '@mui/material';
import {
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Notifications as NotificationsIcon,
  MoreVert as MoreVertIcon,
  ArrowUpward as ArrowUpwardIcon,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Book as BookIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  TrendingUp as TrendingUpIcon,
  CreditCard as CreditCardIcon,
  Quiz as QuizIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Custom Styled Components (imitated via sx for simplicity in single file)
const premiumCardStyle = {
  borderRadius: '24px',
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.4)',
  boxShadow: '0 10px 40px -10px rgba(79, 70, 229, 0.12)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 50px -12px rgba(79, 70, 229, 0.2)',
    border: '1px solid rgba(79, 70, 229, 0.2)',
  },
};

const statsCardStyle = {
  ...premiumCardStyle,
  padding: '12px',
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    right: '-50%',
    width: '100%',
    height: '200%',
    background: 'radial-gradient(circle, rgba(79, 70, 229, 0.03) 0%, transparent 70%)',
    zIndex: 0,
  }
};

const Admindash = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [timeRange, setTimeRange] = useState('30days');
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [usersOpen, setUsersOpen] = useState(false);
  const navigate = useNavigate();

  // Add state for recent registrations
  const [registrationData, setRegistrationData] = useState([]);

  const [stats, setStats] = useState({
    totalLearners: 0,
    activeInstructors: 0,
    totalExams: 0,
    examsTaken: 0
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

    // Fetch stats for all metrics
    const fetchStats = async () => {
      try {
        // Fetch all students
        const studentRes = await fetch('http://localhost:5000/api/student');
        const students = studentRes.ok ? await studentRes.json() : [];

        // Fetch all teachers
        const teacherRes = await fetch('http://localhost:5000/api/teacher');
        const teachers = teacherRes.ok ? await teacherRes.json() : [];

        // Fetch all exams
        const examRes = await fetch('http://localhost:5000/api/exams');
        const exams = examRes.ok ? await examRes.json() : [];

        // Fetch all results (exams taken)
        const resultsRes = await fetch('http://localhost:5000/api/exams/results');
        const results = resultsRes.ok ? await resultsRes.json() : [];

        setStats({
          totalLearners: students.length,
          activeInstructors: teachers.length,
          totalExams: exams.length,
          examsTaken: results.length
        });
      } catch (err) {
        console.error('Error fetching admin stats:', err);
        setStats({
          totalLearners: 0,
          activeInstructors: 0,
          totalExams: 0,
          examsTaken: 0
        });
      }
    };

    fetchRecentRegistrations();
    fetchStats();
  }, []);

  // Use fetched stats in statsData
  const statsData = [
    {
      id: 1,
      title: 'Total Learners',
      value: stats.totalLearners,
      icon: <PeopleIcon sx={{ fontSize: 32 }} />,
      change: '+12%',
      isIncrease: true,
      color: '#6366f1', // Indigo
      bg: alpha('#6366f1', 0.1)
    },
    {
      id: 2,
      title: 'Active Instructors',
      value: stats.activeInstructors,
      icon: <SchoolIcon sx={{ fontSize: 32 }} />,
      change: '+5%',
      isIncrease: true,
      color: '#10b981', // Emerald
      bg: alpha('#10b981', 0.1)
    },
    {
      id: 3,
      title: 'Total Exams',
      value: stats.totalExams,
      icon: <QuizIcon sx={{ fontSize: 32 }} />, // Use QuizIcon or similar
      change: '+18%',
      isIncrease: true,
      color: '#f59e0b', // Amber
      bg: alpha('#f59e0b', 0.1)
    },
    {
      id: 4,
      title: 'Exams Taken',
      value: stats.examsTaken,
      icon: <AssignmentIcon sx={{ fontSize: 32 }} />,
      change: '+24%',
      isIncrease: true,
      color: '#8b5cf6', // Violet
      bg: alpha('#8b5cf6', 0.1)
    }
  ];

  const quickActions = [
    { label: 'Add Student', icon: <PersonAddIcon />, color: '#6366f1', path: '/student-management' },
    { label: 'Add Teacher', icon: <SchoolIcon />, color: '#10b981', path: '/teacher-management' },
    { label: 'View Reports', icon: <AssessmentIcon />, color: '#f59e0b', path: '/reports' },
    { label: 'Settings', icon: <SettingsIcon />, color: '#64748b', path: '/settings' },
  ];

  const navItems = [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/admin-dashboard' },
    { label: 'Users', icon: <PersonIcon />, path: '/user-management', hasSub: true },
    { label: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
    { label: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const handleTimeRangeChange = (event, newRange) => {
    if (newRange !== null) {
      setTimeRange(newRange);
    }
  };

  const handleQuickAction = (action) => {
    navigate(action.path);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const handleSidebarNav = (path) => {
    navigate(path);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        height: '100vh',
        bgcolor: '#f3f4f6',
        width: '100vw',
        overflow: 'hidden'
      }}
    >
      {/* Sidebar */}
      <Paper
        elevation={0}
        sx={{
          width: 240,
          minHeight: '100vh',
          bgcolor: '#1e293b', // Dark slate
          color: 'white',
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1200,
          boxShadow: '0 2px 8px rgba(30,41,59,0.08)',
          transition: 'width 0.3s ease',
          overflowY: 'auto'
        }}
      >
        {/* Sidebar header/nav */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44, boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)' }}>
              <SchoolIcon />
            </Avatar>
            <Typography variant="h6" fontWeight="700" sx={{ letterSpacing: 0.5 }}>
              EduAdmin
            </Typography>
          </Box>
          <Box sx={{ px: 2, py: 2 }}>
            <Stack spacing={1}>
              {navItems.map((item, idx) => {
                const isActive = item.label === 'Dashboard';
                if (item.hasSub) {
                  return (
                    <React.Fragment key={item.label}>
                      <Button
                        startIcon={item.icon}
                        sx={{
                          justifyContent: 'flex-start',
                          borderRadius: 3,
                          fontWeight: 600,
                          textTransform: 'none',
                          fontSize: '0.95rem',
                          px: 3,
                          py: 1.5,
                          color: 'white',
                          bgcolor: usersOpen ? alpha(theme.palette.primary.main, 0.2) : 'transparent',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'white'
                          }
                        }}
                        fullWidth
                        onClick={() => setUsersOpen(v => !v)}
                      >
                        {item.label}
                      </Button>
                      {usersOpen && (
                        <Stack spacing={0.5} sx={{ pl: 4 }}>
                          <Button
                            sx={{
                              justifyContent: 'flex-start',
                              borderRadius: 2,
                              fontWeight: 500,
                              textTransform: 'none',
                              fontSize: '0.92rem',
                              px: 2,
                              py: 1,
                              color: 'white',
                              bgcolor: 'transparent',
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                                color: 'white'
                              }
                            }}
                            fullWidth
                            onClick={() => handleSidebarNav('/student-management')}
                          >
                            Student
                          </Button>
                          <Button
                            sx={{
                              justifyContent: 'flex-start',
                              borderRadius: 2,
                              fontWeight: 500,
                              textTransform: 'none',
                              fontSize: '0.92rem',
                              px: 2,
                              py: 1,
                              color: 'white',
                              bgcolor: 'transparent',
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                                color: 'white'
                              }
                            }}
                            fullWidth
                            onClick={() => handleSidebarNav('/teacher-management')}
                          >
                            Teacher
                          </Button>
                        </Stack>
                      )}
                    </React.Fragment>
                  );
                }
                return (
                  <Button
                    key={item.label}
                    startIcon={item.icon}
                    sx={{
                      justifyContent: 'flex-start',
                      borderRadius: 3,
                      fontWeight: isActive ? 600 : 400,
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      px: 3,
                      py: 1.5,
                      color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
                      bgcolor: isActive ? alpha(theme.palette.primary.main, 0.2) : 'transparent',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: 'white'
                      }
                    }}
                    fullWidth
                    onClick={() => handleSidebarNav(item.path)}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Stack>
          </Box>
        </Box>
        {/* Admin Profile Info above logout */}
        <Box sx={{
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          bgcolor: alpha('#334155', 0.25),
          borderRadius: 3
        }}>
          <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 36, height: 36 }}>A</Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight="600" color="white">Admin User</Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.7)">Super Admin</Typography>
          </Box>
        </Box>
        {/* Logout Button at the very bottom */}
        <Box sx={{ px: 3, pb: 3 }}>
          <Button
            variant="contained"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            fullWidth
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '1rem',
              bgcolor: theme.palette.error.main,
              color: 'white',
              boxShadow: '0 2px 12px rgba(220, 38, 38, 0.15)',
              '&:hover': {
                bgcolor: theme.palette.error.dark,
                color: 'white'
              }
            }}
          >
            Log Out
          </Button>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          minHeight: '100vh',
          background: 'radial-gradient(circle at 10% 20%, rgba(79, 70, 229, 0.05) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(124, 58, 237, 0.05) 0%, transparent 40%)',
          p: 0,
          overflowY: 'auto',
          marginLeft: '240px'
        }}
      >
        {/* Topbar */}
        <Box
          sx={{
            py: 4,
            px: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
            position: 'sticky',
            top: 0,
            zIndex: 1100
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isMobile && (
              <IconButton onClick={() => setSidebarOpen(!sidebarOpen)} sx={{ color: 'text.secondary' }}>
                <MenuIcon />
              </IconButton>
            )}
            <Box>
              <Typography variant="h3" fontWeight="800" sx={{
                color: '#1e293b',
                letterSpacing: '-1.5px',
                background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.2
              }}>
                Control Center
              </Typography>
              <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 500, fontSize: '1rem' }}>
                System-wide overview and administrative controls.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <IconButton sx={{
              bgcolor: 'rgba(79, 70, 229, 0.05)',
              color: '#4f46e5',
              '&:hover': { bgcolor: 'rgba(79, 70, 229, 0.1)' }
            }}>
              <NotificationsIcon />
            </IconButton>
          </Box>
        </Box>


        {/* Scrollable Content */}
        <Container
          maxWidth="xl"
          sx={{
            p: 4,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            height: '100%',
            overflowY: 'auto'
          }}
        >
          {/* Stats Grid */}
          <Grid container spacing={4} sx={{ mb: 6 }}>
            {statsData.map((stat) => (
              <Grid item xs={12} sm={6} md={6} lg={3} key={stat.id}>
                <Card sx={statsCardStyle}>
                  <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: '16px',
                          bgcolor: alpha(stat.color, 0.1),
                          color: stat.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {stat.icon}
                      </Box>
                      <Chip
                        label={stat.change}
                        size="small"
                        sx={{
                          height: '24px',
                          bgcolor: stat.isIncrease ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
                          color: stat.isIncrease ? '#059669' : '#dc2626',
                          fontWeight: '800',
                          borderRadius: '8px',
                          fontSize: '0.75rem'
                        }}
                      />
                    </Box>
                    <Typography sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h3" fontWeight="800" sx={{ mt: 1, color: '#1e293b' }}>
                      {stat.value}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={6}>
            {/* Recent Activity */}
            <Grid item xs={12} lg={6}>
              <Card sx={premiumCardStyle}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h6" fontWeight="800" sx={{ color: '#1e293b' }}>
                      RECENT REGISTRATIONS
                    </Typography>
                    <Button variant="text" sx={{ fontWeight: 700 }}>View All</Button>
                  </Box>

                  <List sx={{ p: 0 }}>
                    {registrationData.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 6 }}>
                        <Typography color="text.secondary">No recent registrations found</Typography>
                      </Box>
                    ) : (
                      registrationData.map((user, index) => (
                        <ListItem
                          key={user.id}
                          sx={{
                            p: 2.5,
                            mb: 2,
                            borderRadius: '20px',
                            bgcolor: alpha('#f8fafc', 0.8),
                            border: '1px solid transparent',
                            transition: '0.3s',
                            '&:hover': {
                              bgcolor: '#fff',
                              borderColor: alpha('#4f46e5', 0.2),
                              boxShadow: '0 10px 20px -5px rgba(0,0,0,0.05)',
                              transform: 'scale(1.02)'
                            }
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar
                              sx={{
                                width: 48,
                                height: 48,
                                bgcolor: user.role === 'Teacher' ? alpha('#10b981', 0.1) : alpha('#6366f1', 0.1),
                                color: user.role === 'Teacher' ? '#10b981' : '#6366f1',
                                fontWeight: '800'
                              }}
                            >
                              {user.name?.charAt(0)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={<Typography variant="subtitle1" fontWeight="800" sx={{ color: '#1e293b' }}>{user.name}</Typography>}
                            secondary={
                              <Typography variant="body2" sx={{ color: '#64748b' }}>
                                {user.role} • {user.date}
                              </Typography>
                            }
                          />
                          <Chip
                            label={user.status}
                            sx={{
                              height: 28,
                              borderRadius: '8px',
                              fontSize: '0.7rem',
                              letterSpacing: '0.5px',
                              bgcolor: user.status === 'active' ? alpha('#10b981', 0.1) : alpha('#f59e0b', 0.1),
                              color: user.status === 'active' ? '#059669' : '#d97706',
                              fontWeight: '800'
                            }}
                          />
                        </ListItem>
                      ))
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Quick Actions */}
          <Box sx={{ mt: 8 }}>
            <Typography variant="h5" fontWeight="800" sx={{ mb: 4, color: '#1e293b', letterSpacing: '-0.5px' }}>
              Quick Actions
            </Typography>
            <Grid container spacing={4}>
              {quickActions.map((action) => (
                <Grid item xs={12} sm={6} md={3} key={action.label}>
                  <Card
                    component={Button}
                    onClick={() => handleQuickAction(action)}
                    sx={{
                      ...premiumCardStyle,
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      py: 6,
                      textTransform: 'none',
                      border: '1px solid rgba(255, 255, 255, 0.5)',
                      '&:hover': {
                        transform: 'translateY(-12px)',
                        borderColor: alpha(action.color, 0.4),
                        bgcolor: alpha(action.color, 0.05),
                        boxShadow: `0 20px 40px -10px ${alpha(action.color, 0.2)}`
                      }
                    }}
                  >
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: '24px',
                        bgcolor: alpha(action.color, 0.1),
                        color: action.color,
                        mb: 3,
                        transition: '0.3s',
                        '.MuiButton-root:hover &': {
                          transform: 'scale(1.1) rotate(5deg)',
                          bgcolor: alpha(action.color, 0.2),
                        }
                      }}
                    >
                      {React.cloneElement(action.icon, { sx: { fontSize: 40 } })}
                    </Box>
                    <Typography variant="h6" fontWeight="800" color="text.primary">
                      {action.label}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', mt: 1 }}>
                      Manage {action.label.split(' ')[1]}s
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Admindash;