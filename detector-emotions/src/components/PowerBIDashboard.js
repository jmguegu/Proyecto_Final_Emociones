// src/components/PowerBIDashboard.js
import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

function PowerBIDashboard() {
  // Reemplaza esta URL con la URL de incrustación de tu dashboard de Power BI
  const powerBiEmbedUrl = "https://app.powerbi.com/view?r=eyJrIjoiZmFhYmFhYWEtYmFhYi00YWFiLWJiYWFhLWFhYWFhYWFhYWFhYSIsImkiOiJiYWFhYWFhYS1iYWFhLTQ0YWFhLThhYWFhLWFhYWFhYWFhYWFhYSIsImMiOjR9"; // ¡CAMBIA ESTO!

  return (
    <Card sx={{ margin: 2, padding: 2 }} id="powerbi">
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Cuadro de Mando Interactivo (Power BI)
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Explora los principales indicadores y métricas de negocio a través de nuestro dashboard interactivo.
        </Typography>

        <Box sx={{ width: '100%', height: '70vh', border: '1px solid #ccc', overflow: 'hidden' }}>
          <iframe
            title="Power BI Dashboard"
            width="100%"
            height="100%"
            src={powerBiEmbedUrl}
            frameBorder="0"
            allowFullScreen={true}
          ></iframe>
        </Box>
      </CardContent>
    </Card>
  );
}

export default PowerBIDashboard;