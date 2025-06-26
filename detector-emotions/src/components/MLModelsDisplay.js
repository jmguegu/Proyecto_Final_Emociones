// src/components/MLModelsDisplay.js
import React from 'react';
import { Card, CardContent, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

// Métricas de clasificación de ejemplo
const classificationMetricsExample = {
  accuracy: 0.88,
  precision: 0.85,
  recall: 0.92,
  f1: 0.88
};

// Métricas de regresión de ejemplo
const regressionMetricsExample = {
  mae: 125.7,
  mse: 28000.5,
  rmse: 167.3,
  r2: 0.81
};

function MLModelsDisplay() {
  return (
    <Card sx={{ margin: 2, padding: 2 }} id="ml-models">
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Modelos de Machine Learning
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Detalles y métricas de rendimiento de nuestros modelos predictivos.
        </Typography>

        {/* Sección de Clasificación */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" component="h3" gutterBottom>
            Modelo de Clasificación
          </Typography>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 400 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Métrica</TableCell>
                  <TableCell align="right">Valor</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(classificationMetricsExample).map(([metric, value]) => (
                  <TableRow key={metric}>
                    <TableCell component="th" scope="row">
                      {metric.charAt(0).toUpperCase() + metric.slice(1).replace('_', ' ')}
                    </TableCell>
                    <TableCell align="right">{value.toFixed(3)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            *Las métricas pueden incluir Precisión, Recall, F1-Score, y Accuracy.
          </Typography>
        </Box>

        {/* Sección de Regresión */}
        <Box>
          <Typography variant="h6" component="h3" gutterBottom>
            Modelo de Regresión
          </Typography>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 400 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Métrica</TableCell>
                  <TableCell align="right">Valor</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(regressionMetricsExample).map(([metric, value]) => (
                  <TableRow key={metric}>
                    <TableCell component="th" scope="row">
                      {metric.toUpperCase()}
                    </TableCell>
                    <TableCell align="right">{value.toFixed(3)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            *Las métricas pueden incluir MAE, MSE, RMSE, y R².
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default MLModelsDisplay;