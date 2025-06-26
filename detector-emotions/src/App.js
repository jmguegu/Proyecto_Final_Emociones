import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Presentation from './components/Presentation';
import EDAVisualization from './components/EDAVisualization';
import PowerBIDashboard from './components/PowerBIDashboard';
import CalculoIndiceFelicidad from './components/CalculoIndiceFelicidad';
import Emociones from './components/Emociones';
import { Container, CssBaseline, Box, Typography } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#42a5f5',
      contrastText: '#fff',
    },
    secondary: {
      main: '#ff9800',
    },
    background: {
      default: '#f4f6f8',
      paper: '#fff',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      'Roboto',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  const [currentPage, setCurrentPage] = useState('presentation');

  const renderPage = () => {
    switch (currentPage) {
      case 'presentation':
        return <Presentation />;
      case 'eda':
        return <EDAVisualization />;
      case 'powerbi':
        return <PowerBIDashboard />;
      case 'calculo-felicidad':
        return <CalculoIndiceFelicidad />;
      case 'emociones':
        return <Emociones />;
      default:
        return <Presentation />;
    }
  };

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      
      <Box sx={{
        width: '100%',
        py: 2,
        textAlign: 'center',
        bgcolor: '#FFFDE7',
        color: '#212121',
        boxShadow: 3
      }}>
        <Typography variant="h3" component="h1">
          Plataforma de Análisis de Datos y Emociones
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'flex-start',
          minHeight: 'calc(100vh - 80px - 16px)',
          bgcolor: lightTheme.palette.background.default,
        }}
      >
        <Box sx={{ flexShrink: 0,}}>
          <Navbar onNavigate={setCurrentPage} />
        </Box>

        <Container
          maxWidth="lg"
          sx={{
            flexGrow: 1,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            minHeight: { xs: 'auto', md: '100%' },
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            {renderPage()}
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;