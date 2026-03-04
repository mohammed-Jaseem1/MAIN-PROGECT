import React, { useState, useEffect } from 'react';
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
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';

import {
  School,
  Assignment,
  Quiz,
  Logout,
  Dashboard,
  People,
  Close,
  AutoAwesome,
  Psychology
} from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

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

const Teacherdashboard = () => {

  const [submissions, setSubmissions] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [allExams, setAllExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingResult, setViewingResult] = useState(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/exams/results');
        const examsRes = await fetch('http://localhost:5000/api/exams');

        let examsData = [];
        if (examsRes.ok) {
          examsData = await examsRes.json();
          setAllExams(examsData);
          setUpcomingClasses(examsData.slice(0, 5));
        }

        if (response.ok) {
          const data = await response.json();
          setSubmissions(data.map(res => ({
            ...res, // Keep full result object
            id: res._id,
            student: res.studentName,
            assignment: res.examTitle,
            status: 'Graded',
            score: `${res.score}/${res.totalMarks}`,
            aiNotes: res.aiNotes,
            submittedAt: res.submittedAt
          })));
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const handleLogout = () => {
    navigate('/login');
  };

  const getStatusColor = (status) => {
    if (status === 'Submitted') return '#f59e0b';
    if (status === 'Graded') return '#10b981';
    return '#6366f1';
  };

  const handleOpenAnalysis = (submission) => {
    setSelectedAnalysis(submission);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenResult = (submission) => {
    setViewingResult(submission);
    setIsResultModalOpen(true);
  };

  const handleCloseResultModal = () => {
    setIsResultModalOpen(false);
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
      <Box sx={{
        flex: 1,
        p: 6,
        ml: '240px',
        position: 'relative',
        background: 'radial-gradient(circle at 10% 20%, rgba(79, 70, 229, 0.05) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(124, 58, 237, 0.05) 0%, transparent 40%)',
        minHeight: '100vh'
      }}>

        {/* HEADER SECTION */}
        <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h3" fontWeight="800" sx={{
              color: '#1e293b',
              letterSpacing: '-1.5px',
              mb: 1,
              background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Hello, Professor! 👋
            </Typography>
            <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 500 }}>
              Here's what's happening with your classes today.
            </Typography>
          </Box>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: '#4f46e5',
              boxShadow: '0 0 20px rgba(79, 70, 229, 0.3)',
              border: '2px solid #fff'
            }}
          >
            JD
          </Avatar>
        </Box>

        {/* STATS SECTION */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={4}>
            <Card sx={statsCardStyle}>
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Stack direction="row" spacing={3} alignItems="center">
                  <Box sx={{
                    p: 2,
                    borderRadius: '16px',
                    bgcolor: 'rgba(79, 70, 229, 0.1)',
                    color: '#4f46e5'
                  }}>
                    <Quiz fontSize="large" />
                  </Box>
                  <Box>
                    <Typography sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Upcoming Exams
                    </Typography>
                    <Typography variant="h3" fontWeight="800" sx={{ color: '#1e293b' }}>
                      {upcomingClasses.length}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={statsCardStyle}>
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Stack direction="row" spacing={3} alignItems="center">
                  <Box sx={{
                    p: 2,
                    borderRadius: '16px',
                    bgcolor: 'rgba(245, 158, 11, 0.1)',
                    color: '#f59e0b'
                  }}>
                    <Assignment fontSize="large" />
                  </Box>
                  <Box>
                    <Typography sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      To Grade
                    </Typography>
                    <Typography variant="h3" fontWeight="800" sx={{ color: '#1e293b' }}>
                      {submissions.filter(s => s.status === 'Submitted').length}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={statsCardStyle}>
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Stack direction="row" spacing={3} alignItems="center">
                  <Box sx={{
                    p: 2,
                    borderRadius: '16px',
                    bgcolor: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981'
                  }}>
                    <People fontSize="large" />
                  </Box>
                  <Box>
                    <Typography sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Graded
                    </Typography>
                    <Typography variant="h3" fontWeight="800" sx={{ color: '#1e293b' }}>
                      {submissions.filter(s => s.status === 'Graded').length}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ===== QUICK ACTION CARDS FIXED AT BOTTOM LEFT ===== */}
        <Box
          sx={{
            position: 'fixed',
            right: 48,
            bottom: 48,
            zIndex: 1201,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Card
            sx={{
              ...premiumCardStyle,
              cursor: 'pointer',
              minWidth: 220,
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: 'white',
              border: 'none',
              '&:hover': {
                transform: 'scale(1.05) translateY(-5px)',
                boxShadow: '0 20px 40px rgba(79, 70, 229, 0.4)',
              }
            }}
            onClick={() => navigate('/question-paper-management')}
          >
            <CardContent sx={{ py: '12px !important' }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                  <Assignment />
                </Avatar>
                <Box>
                  <Typography fontWeight="bold">Create Paper</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    New Reference Exam
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
          <Card
            sx={{
              ...premiumCardStyle,
              cursor: 'pointer',
              minWidth: 220,
              background: '#fff',
              border: '2px solid #4f46e5',
              '&:hover': {
                transform: 'scale(1.05) translateY(-5px)',
                boxShadow: '0 20px 40px rgba(79, 70, 229, 0.1)',
              }
            }}
            onClick={() => navigate('/manage-exams')}
          >
            <CardContent sx={{ py: '12px !important' }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: alpha('#4f46e5', 0.1), color: '#4f46e5' }}>
                  <Quiz />
                </Avatar>
                <Box>
                  <Typography fontWeight="bold" color="primary">Manage Exams</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Schedule & Edit
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Grid container spacing={4}>
          {/* Upcoming Exams */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ ...premiumCardStyle, height: '100%' }}>
              <CardContent p={3}>
                <Typography variant="h6" fontWeight="800" mb={3} sx={{ color: '#1e293b' }}>
                  UPCOMING EXAMS
                </Typography>
                <List sx={{ px: 0 }}>
                  {upcomingClasses.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="text.secondary">No exams scheduled</Typography>
                    </Box>
                  ) : (
                    upcomingClasses.map((cls) => (
                      <ListItem
                        key={cls.id}
                        sx={{
                          mb: 2,
                          borderRadius: '16px',
                          bgcolor: alpha('#f8fafc', 0.5),
                          transition: '0.2s',
                          '&:hover': { bgcolor: alpha('#4f46e5', 0.05) }
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: alpha('#4f46e5', 0.1), color: '#4f46e5', fontWeight: 'bold' }}>
                            {cls.title?.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={<Typography fontWeight="700">{cls.title}</Typography>}
                          secondary={
                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                              📅 {cls.date} • 🕒 {cls.time}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Submissions */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ ...premiumCardStyle, height: '100%' }}>
              <CardContent p={3}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight="800" sx={{ color: '#1e293b' }}>
                    RECENT SUBMISSIONS
                  </Typography>
                  <Button variant="text" sx={{ fontWeight: 700 }}>View All</Button>
                </Box>
                <Stack spacing={2}>
                  {submissions.map((submission) => (
                    <Box
                      key={submission.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2.5,
                        borderRadius: '20px',
                        bgcolor: alpha('#f8fafc', 0.8),
                        border: '1px solid transparent',
                        transition: '0.2s',
                        '&:hover': {
                          bgcolor: '#fff',
                          borderColor: alpha('#4f46e5', 0.2),
                          boxShadow: '0 10px 20px -5px rgba(0,0,0,0.05)',
                          transform: 'scale(1.01)'
                        }
                      }}
                    >
                      <Stack direction="row" spacing={2.5} alignItems="center">
                        <Avatar sx={{
                          width: 48,
                          height: 48,
                          bgcolor: alpha('#4f46e5', 0.1),
                          color: '#4f46e5',
                          fontWeight: 'bold',
                          fontSize: '1rem'
                        }}>
                          {submission.student.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography fontWeight="800" sx={{ color: '#1e293b', lineHeight: 1.2 }}>
                            {submission.student}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                            {submission.assignment}
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={3} alignItems="center">
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h6" fontWeight="800" color="primary" sx={{ lineHeight: 1 }}>
                            {submission.score}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                            FINAL SCORE
                          </Typography>
                        </Box>

                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleOpenResult(submission)}
                          sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 700,
                            borderColor: alpha('#10b981', 0.3),
                            color: '#10b981',
                            '&:hover': {
                              bgcolor: alpha('#10b981', 0.05),
                              borderColor: '#10b981'
                            }
                          }}
                        >
                          View Result
                        </Button>

                        {submission.aiNotes && (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<AutoAwesome />}
                            onClick={() => handleOpenAnalysis(submission)}
                            sx={{
                              borderRadius: '10px',
                              textTransform: 'none',
                              fontWeight: 700,
                              borderColor: alpha('#4f46e5', 0.3),
                              color: '#4f46e5',
                              '&:hover': {
                                bgcolor: alpha('#4f46e5', 0.05),
                                borderColor: '#4f46e5'
                              }
                            }}
                          >
                            AI Analysis
                          </Button>
                        )}

                        <Chip
                          label={submission.status}
                          sx={{
                            borderRadius: '8px',
                            height: '28px',
                            bgcolor: alpha(getStatusColor(submission.status), 0.1),
                            color: getStatusColor(submission.status),
                            fontWeight: '800',
                            fontSize: '0.7rem',
                            letterSpacing: '0.5px'
                          }}
                        />
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

      </Box>

      {/* AI Analysis Modal */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            padding: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: alpha('#4f46e5', 0.1), color: '#4f46e5' }}>
              <Psychology />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="800" color="#1e293b">
                AI Performance Feedback
              </Typography>
              <Typography variant="body2" color="#64748b">
                Student: {selectedAnalysis?.student} | Exam: {selectedAnalysis?.assignment}
              </Typography>
            </Box>
          </Stack>
          <IconButton
            onClick={handleCloseModal}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <Divider sx={{ mx: 2 }} />
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{
            bgcolor: '#f8fafc',
            borderRadius: '16px',
            p: 3,
            border: '1px solid #e2e8f0',
            '& .markdown-content': {
              color: '#334155',
              lineHeight: 1.7,
              '& h1, h2, h3': {
                color: '#1e293b',
                mb: 2,
                mt: 3
              },
              '& p': { mb: 2 },
              '& ul, ol': { mb: 2, pl: 3 },
              '& blockquote': {
                borderLeft: '4px solid #4f46e5',
                bgcolor: alpha('#4f46e5', 0.05),
                pl: 2,
                py: 1,
                mb: 2
              }
            }
          }}>
            <Box className="markdown-content">
              <ReactMarkdown>{selectedAnalysis?.aiNotes}</ReactMarkdown>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleCloseModal}
            variant="contained"
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              px: 4,
              bgcolor: '#4f46e5',
              '&:hover': { bgcolor: '#4338ca' }
            }}
          >
            Done Reviewing
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Result Modal */}
      <Dialog
        open={isResultModalOpen}
        onClose={handleCloseResultModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            padding: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981' }}>
              <Assignment />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="800" color="#1e293b">
                Detailed Result Review
              </Typography>
              <Typography variant="body2" color="#64748b">
                Student: {viewingResult?.student} | Score: {viewingResult?.score}
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={handleCloseResultModal} sx={{ color: (theme) => theme.palette.grey[500] }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <Divider sx={{ mx: 2 }} />
        <DialogContent sx={{ mt: 2, overflowY: 'auto' }}>
          <Stack spacing={3}>
            {viewingResult?.answers.map((answer, idx) => {
              const exam = allExams.find(e => e._id === viewingResult.examId);
              const question = exam?.questions.find(q => q.id === answer.questionId);

              return (
                <Box key={idx} sx={{
                  p: 3,
                  borderRadius: '16px',
                  bgcolor: answer.isCorrect ? alpha('#10b981', 0.05) : alpha('#ef4444', 0.05),
                  border: '1px solid',
                  borderColor: answer.isCorrect ? alpha('#10b981', 0.2) : alpha('#ef4444', 0.2),
                }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography fontWeight="800" color="#1e293b">Question {idx + 1}</Typography>
                    <Chip
                      icon={answer.isCorrect ? <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span> : <span className="material-symbols-outlined" style={{ fontSize: 18 }}>cancel</span>}
                      label={answer.isCorrect ? "Correct" : "Incorrect"}
                      size="small"
                      sx={{
                        bgcolor: answer.isCorrect ? '#dcfce7' : '#fee2e2',
                        color: answer.isCorrect ? '#166534' : '#991b1b',
                        fontWeight: 'bold'
                      }}
                    />
                  </Stack>

                  {question ? (
                    <>
                      <Typography variant="body1" fontWeight="500" mb={2} color="#334155">{question.text}</Typography>
                      <Grid container spacing={1}>
                        {question.options.map((opt, optIdx) => {
                          let isCorrectOpt = optIdx === question.correctAnswer;
                          let isSelectedOpt = optIdx === answer.selectedOption;
                          let borderColor = '#e2e8f0';
                          let bgcolor = 'white';

                          if (isCorrectOpt) {
                            borderColor = '#10b981';
                            bgcolor = '#f0fdf4';
                          } else if (isSelectedOpt && !answer.isCorrect) {
                            borderColor = '#ef4444';
                            bgcolor = '#fef2f2';
                          }

                          return (
                            <Grid item xs={12} sm={6} key={optIdx}>
                              <Box sx={{
                                p: 1.5,
                                borderRadius: '10px',
                                border: '2px solid',
                                borderColor: borderColor,
                                bgcolor: bgcolor,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                              }}>
                                <Typography variant="body2" sx={{ fontWeight: isSelectedOpt || isCorrectOpt ? 700 : 400 }}>
                                  {String.fromCharCode(65 + optIdx)}. {opt}
                                </Typography>
                                {isCorrectOpt && <span className="material-symbols-outlined" style={{ color: '#10b981', fontSize: 18, marginLeft: 'auto' }}>check_circle</span>}
                                {isSelectedOpt && !answer.isCorrect && <span className="material-symbols-outlined" style={{ color: '#ef4444', fontSize: 18, marginLeft: 'auto' }}>cancel</span>}
                              </Box>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </>
                  ) : (
                    <Typography color="text.secondary">Question details unavailable.</Typography>
                  )}
                </Box>
              );
            })}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseResultModal} variant="contained" sx={{ borderRadius: '12px', bgcolor: '#4f46e5' }}>
            Close Review
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default Teacherdashboard;
