import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

function Emociones() {
  return (
    <Card sx={{ margin: 2, padding: 2 }} id="emociones">
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Detector de Emociones
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Esta sección contendrá la funcionalidad y visualización para la detección de emociones.
          Este componente es un marcador de posición.
        </Typography>
        <Box sx={{ height: '300px', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 3 }}>
          <Typography variant="h6" color="text.disabled">
            Contenido del Detector de Emociones
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default Emociones;