import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

function PowerBIDashboard() {
  const powerBiEmbedUrl = "https://app.powerbi.com/view?r=eyJrIjoiNDQ1NjBhNWItMGE1OS00YTYyLTg2MjgtZTU3OTFjN2MzNWNmIiwidCI6IjhhZWJkZGI2LTM0MTgtNDNhMS1hMjU1LWI5NjQxODZlY2M2NCIsImMiOjl9"; // ¡CAMBIA ESTO!

  return (
    <Card sx={{ margin: 2, padding: 2 }} id="powerbi">
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Cuadro de Mando Interactivo (Power BI)
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