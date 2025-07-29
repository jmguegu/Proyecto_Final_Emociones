import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import EDA_emociones_pdf from '../documents/EDA_emociones.pdf';

function EDAVisualization() {
  const pdfUrl = EDA_emociones_pdf; 

  return (
    <Card sx={{ margin: 2, padding: 2 }} id="eda">
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Análisis de los datos obtenidos EDA
        </Typography>
        <Box sx={{ width: '100%', height: '70vh', border: '1px solid #ccc', overflow: 'hidden', mt: 2 }}>
          <iframe
            title="Análisis de Datos EDA en PDF"
            width="100%"
            height="100%"
            src={pdfUrl}
            frameBorder="0"
            allowFullScreen={true}
          ></iframe>
        </Box>
      </CardContent>
    </Card>
  );
}

export default EDAVisualization;