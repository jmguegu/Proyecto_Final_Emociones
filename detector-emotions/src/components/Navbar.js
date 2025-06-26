import React from 'react';
import { Box, Button } from '@mui/material';

function Navbar({ onNavigate }) {
  return (
    <Box
      sx={{
        py: 1,
        px: 1,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          borderRadius: 2,
          boxShadow: 3,
          p: 1,
          width: 'fit-content',
          minWidth: '180px', 
        }}
      >
        <Button color="inherit" onClick={() => onNavigate('presentation')} sx={{ justifyContent: 'flex-start', py: 1 }}>Presentación</Button>
        <Button color="inherit" onClick={() => onNavigate('eda')} sx={{ justifyContent: 'flex-start', py: 1 }}>Análisis EDA</Button>
        <Button color="inherit" onClick={() => onNavigate('powerbi')} sx={{ justifyContent: 'flex-start', py: 1 }}>Power BI</Button>
        <Button color="inherit" onClick={() => onNavigate('calculo-felicidad')} sx={{ justifyContent: 'flex-start', py: 1 }}>Cálculo Índice Felicidad</Button>
        <Button color="inherit" onClick={() => onNavigate('emociones')} sx={{ justifyContent: 'flex-start', py: 1 }}>Emociones</Button>
      </Box>
    </Box>
  );
}

export default Navbar;