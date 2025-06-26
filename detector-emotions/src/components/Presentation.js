import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

function Presentation() {
  return (
    <Card sx={{ margin: 2, padding: 2, textAlign: 'center' }} id="presentation">
      <CardContent>
        <Typography variant="h4" component="div" gutterBottom>
          ¡Bienvenido a nuestro Proyecto de Análisis de Datos!
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Explora las diferentes secciones de nuestra aplicación para descubrir análisis de datos,
          cuadros de mando interactivos, y modelos de Machine Learning.
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" component="h3">
            Navega usando los botones de la barra superior.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default Presentation;