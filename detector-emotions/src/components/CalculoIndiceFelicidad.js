import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import * as tf from '@tensorflow/tfjs';

function CalculoIndiceFelicidad() {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const modelUrl = 'https://tfhub.dev/tensorflow/tfjs-model/simple-regression-model/1/model.json?tfjs-format=file';

    const loadModel = async () => {
      try {
        setLoading(true);
        const loadedModel = await tf.loadGraphModel(modelUrl);
        setModel(loadedModel);
        console.log('Modelo de regresión de felicidad cargado con éxito:', loadedModel);
      } catch (err) {
        console.error('Error al cargar el modelo de regresión de felicidad:', err);
        setError('Error al cargar el modelo de regresión. Por favor, verifica la URL.');
      } finally {
        setLoading(false);
      }
    };

    loadModel();
  }, []);

  return (
    <Card sx={{ margin: 2, padding: 2 }} id="calculo-felicidad">
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Cálculo del Índice de Felicidad
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Esta sección cargará un modelo de Machine Learning de **regresión**, entrenado para tomar 4-5 parámetros y devolver un valor numérico que represente el índice de felicidad.
        </Typography>

        <Box sx={{ height: '300px', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 3 }}>
          {loading && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>Cargando modelo de felicidad...</Typography>
            </Box>
          )}
          {error && (
            <Typography color="error">{error}</Typography>
          )}
          {model && !loading && !error && (
            <Typography variant="h6" color="text.primary">
              ¡Modelo de regresión de felicidad cargado! Listo para usar.
            </Typography>
          )}
          {!model && !loading && !error && (
            <Typography variant="h6" color="text.disabled">
              Contenido del Cálculo del Índice de Felicidad
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default CalculoIndiceFelicidad;