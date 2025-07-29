// src/App.js
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Presentation from './components/Presentation';
import EDAVisualization from './components/EDAVisualization';
import PowerBIDashboard from './components/PowerBIDashboard';
import CalculoIndiceFelicidad from './components/CalculoIndiceFelicidad';
import Emociones from './components/Emociones';
import { Container, CssBaseline, Box, Typography } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Logo from './logo.png'; // ¡Importa tu logo aquí!

const greenTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4CAF50', // Verde principal (Material Green 500)
      light: '#81C784', // Tono más claro para interacciones, o Navbar
      dark: '#388E3C',  // Tono más oscuro
      contrastText: '#fff', // Texto blanco para contraste
    },
    secondary: {
      main: '#8BC34A', // Verde secundario (Material Light Green 500)
      light: '#AED581',
      dark: '#689F38',
      contrastText: '#fff',
    },
    background: {
      default: '#E8F5E9', // Verde muy claro para el fondo general de la aplicación (Green 50)
      paper: '#F1F8E9',   // Verde claro para fondos de componentes como Card (Light Green 50)
    },
    text: {
      primary: '#212121', // Texto oscuro para buena legibilidad
      secondary: '#424242',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      'Roboto',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#F1F8E9',
          borderRadius: '12px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
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

  const navbarWidth = '240px'; 

  return (
    <ThemeProvider theme={greenTheme}>
      <CssBaseline />

      <Box
        sx={{
          display: 'grid',
          gridTemplateRows: 'auto 1fr', 
          gridTemplateColumns: { xs: '1fr', md: `${navbarWidth} 1fr` },
          minHeight: '100vh',
          width: '100vw',
          overflow: 'hidden',
          bgcolor: greenTheme.palette.background.default,
        }}
      >
        {/* Área del Encabezado: Contenedor con altura mínima para el logo grande */}
        <Box
          sx={{
            gridRow: '1',
            gridColumn: '1 / -1',
            width: '100%',
            // Ajustamos el padding vertical para controlar la altura total de la caja.
            // Con un logo de 150px, un py de 2 (16px) en cada lado sumaría 32px + 150px = 182px de altura mínima.
            // Si el texto del título es más grande, la caja crecerá automáticamente.
            py: 2, // Mantenemos un padding vertical para un poco de espacio
            
            display: 'flex',
            alignItems: 'center', // Centra verticalmente el logo y el texto
            justifyContent: 'center',
            px: 2, // Padding horizontal
            
            bgcolor: '#DCEDC8',
            color: greenTheme.palette.text.primary,
            boxShadow: 3,
            zIndex: 1100,
          }}
        >
          {/* Logo - Vuelve a 150px de altura */}
          <Box
            component="img"
            src={Logo}
            alt="Logo"
            sx={{
              height: '150px', // **Altura del logo a 150px, como solicitaste**
              marginRight: 2,
              flexShrink: 0,
            }}
          />
          
          {/* Título */}
          <Typography variant="h3" component="h1" sx={{ flexGrow: 1, textAlign: 'center' }}>
            Plataforma de Análisis de Datos y Emociones
          </Typography>
        </Box>

        {/* Contenedor de la Navbar: Menú Lateral */}
        <Box
          sx={{
            gridRow: { xs: '2', md: '2' },
            gridColumn: { xs: '1', md: '1' },
            width: { xs: '100%', md: navbarWidth },
            height: { xs: 'auto', md: '100%' },
            bgcolor: greenTheme.palette.primary.light,
            boxShadow: { md: 2 },
            overflowY: 'auto', 
          }}
        >
          <Navbar onNavigate={setCurrentPage} />
        </Box>

        {/* Contenedor de las Páginas */}
        <Container
          disableGutters
          maxWidth={false} // <--- CAMBIO REALIZADO AQUÍ: Deshabilita la limitación de ancho máximo
          sx={{
            gridRow: { xs: '3', md: '2' },
            gridColumn: { xs: '1', md: '2' },
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',
            bgcolor: greenTheme.palette.background.paper,
            overflowY: 'auto',
          }}
        >
          <Box sx={{ flexGrow: 1, p: 2, width: '100%' }}>
            {renderPage()}
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
