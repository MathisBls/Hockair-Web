import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {
  Box,
  Grid,
  Paper,
  Typography,
  ThemeProvider,
  createTheme,
  Slider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { styled } from '@mui/system';
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Création d'un thème personnalisé
const theme = createTheme({
  palette: {
    primary: {
      main: '#00ffff', // cyan
    },
    secondary: {
      main: '#e94560', // rouge
    },
    background: {
      default: '#121522', // bleu-bg
      paper: '#16213e', // bleu
    },
    text: {
      primary: '#ffffff', // white
      secondary: '#00ffff', // cyan
    },
  },
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.primary,
  background: theme.palette.background.paper,
}));

const ShootingZone = styled(Box)(({ efficiency }) => ({
  width: '100%',
  height: '100%',
  backgroundColor: `rgba(0, 255, 255, ${efficiency / 100})`,
  border: `1px solid ${theme.palette.primary.main}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: `0 0 15px ${theme.palette.primary.main}`,
  },
}));

const SpeedArrow = styled(ArrowForwardIcon)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: '3rem',
  animation: `$pulse 1.5s infinite`,
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
    },
    '50%': {
      transform: 'scale(1.1)',
    },
    '100%': {
      transform: 'scale(1)',
    },
  },
}));

const Stats = () => {
  const shootingData = [
    { zone: 'A1', attempts: 50, made: 30 },
    { zone: 'A2', attempts: 40, made: 28 },
    { zone: 'A3', attempts: 30, made: 15 },
    { zone: 'B1', attempts: 20, made: 12 },
    { zone: 'B2', attempts: 60, made: 45 },
    { zone: 'B3', attempts: 25, made: 10 },
    { zone: 'C1', attempts: 15, made: 5 },
    { zone: 'C2', attempts: 35, made: 20 },
    { zone: 'C3', attempts: 45, made: 25 },
  ];

  const calculateEfficiency = (made, attempts) => {
    return attempts > 0 ? (made / attempts) * 100 : 0;
  };

  const averageGoalSpeed = 95; // km/h

  const exchangeDurationData = [
    { duration: '0-10s', count: 20 },
    { duration: '11-20s', count: 35 },
    { duration: '21-30s', count: 25 },
    { duration: '31-40s', count: 15 },
    { duration: '41+s', count: 5 },
  ];

  const eloHistoryData = [
    { month: 'Jan', elo: 1000, change: 0 },
    { month: 'Feb', elo: 1050, change: 50 },
    { month: 'Mar', elo: 1030, change: -20 },
    { month: 'Apr', elo: 1080, change: 50 },
    { month: 'May', elo: 1100, change: 20 },
    { month: 'Jun', elo: 1150, change: 50 },
  ];

  const matchStats = {
    victories: 65,
    defeats: 30,
    draws: 5,
  };

  const totalMatches =
    matchStats.victories + matchStats.defeats + matchStats.draws;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1, p: 3, backgroundColor: 'background.default' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <StyledPaper>
              <Typography variant='h6'>Zone de tir</Typography>
              <Grid container spacing={1} sx={{ aspectRatio: '1', mt: 2 }}>
                {shootingData.map((zone) => (
                  <Grid item xs={4} key={zone.zone}>
                    <ShootingZone
                      efficiency={calculateEfficiency(zone.made, zone.attempts)}
                    >
                      <Typography variant='body2'>{zone.zone}</Typography>
                      <Typography variant='body2'>
                        {calculateEfficiency(zone.made, zone.attempts).toFixed(
                          1
                        )}
                        %
                      </Typography>
                    </ShootingZone>
                  </Grid>
                ))}
              </Grid>
            </StyledPaper>
          </Grid>

          <Grid item xs={12} md={6}>
            <StyledPaper>
              <Typography variant='h6'>Vitesse moyenne des buts</Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  my: 2,
                }}
              >
                <SpeedArrow />
                <Typography variant='h4' sx={{ ml: 2, color: 'primary.main' }}>
                  {averageGoalSpeed} km/h
                </Typography>
              </Box>
              <Slider
                value={averageGoalSpeed}
                min={60}
                max={140}
                step={1}
                marks={[
                  { value: 60, label: '60 km/h' },
                  { value: 100, label: '100 km/h' },
                  { value: 140, label: '140 km/h' },
                ]}
                sx={{
                  '& .MuiSlider-thumb': {
                    width: 0,
                    height: 0,
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: 'primary.main',
                    border: 'none',
                  },
                }}
              />
            </StyledPaper>
          </Grid>

          <Grid item xs={12} md={6}>
            <StyledPaper>
              <Typography variant='h6'>Durée des échanges</Typography>
              <TableContainer
                component={Paper}
                sx={{ mt: 2, backgroundColor: 'background.paper' }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Durée</TableCell>
                      <TableCell align='right'>Nombre</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {exchangeDurationData.map((row) => (
                      <TableRow key={row.duration}>
                        <TableCell component='th' scope='row'>
                          {row.duration}
                        </TableCell>
                        <TableCell align='right'>{row.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </StyledPaper>
          </Grid>

          <Grid item xs={12} md={6}>
            <StyledPaper>
              <Typography variant='h6'>Évolution de l&apos;ELO</Typography>
              <Box sx={{ height: 300, mt: 2 }}>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={eloHistoryData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='month' />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name, props) => {
                        if (name === 'elo') return [value, 'ELO'];
                        if (name === 'change')
                          return [
                            value > 0 ? `+${value}` : value,
                            'Changement',
                          ];
                      }}
                    />
                    <Bar dataKey='elo' fill='#00ffff' />
                    <Bar
                      dataKey='change'
                      fill={({ change }) =>
                        change > 0 ? '#4caf50' : '#f44336'
                      }
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </StyledPaper>
          </Grid>
          <Grid item xs={12}>
            <StyledPaper>
              <Typography variant='h6'>Résultats des matchs</Typography>
              <Box
                sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}
              >
                {Object.entries(matchStats).map(([key, value]) => (
                  <Box key={key} sx={{ textAlign: 'center', flex: 1 }}>
                    <Typography variant='h4' sx={{ color: 'primary.main' }}>
                      {((value / totalMatches) * 100).toFixed(1)}%
                    </Typography>
                    <Typography variant='body1'>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </StyledPaper>
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
};

export default Stats;
