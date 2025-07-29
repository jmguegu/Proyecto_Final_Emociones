import React, { useEffect, useState, useRef } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Button,
  Alert,
  Stack 
} from '@mui/material';
import axios from 'axios';


function Emociones() {

  const [loadingBackend, setLoadingBackend] = useState(false); 
  const [error, setError] = useState(null); 

  const [selectedFile, setSelectedFile] = useState(null);
  const [imageDisplayUrl, setImageDisplayUrl] = useState(null); 
  const [imageObject, setImageObject] = useState(null);

  const [processing, setProcessing] = useState(false);

  const canvasRef = useRef(null);

  // URL del endpoint
  const backendUrl = 'http://127.0.0.1:5000/predict_emotions'; 

  useEffect(() => {
    if (imageObject && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = imageObject.width;
      canvas.height = imageObject.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height); 
      ctx.drawImage(imageObject, 0, 0, imageObject.width, imageObject.height);
    }
  }, [imageObject]);


  /**
   * Maneja el evento cuando el usuario selecciona un archivo de imagen.
   * Almacena el archivo seleccionado y crea una URL de vista previa para el canvas.
   * @param {Event} event Evento de cambio del input de archivo (input type="file").
   */
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageDisplayUrl(e.target.result);
        const img = new Image();
        img.onload = () => {
          setImageObject(img);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setImageDisplayUrl(null);
      setImageObject(null);
      setError(null);
    }
  };

  const processImage = async () => {
    if (!selectedFile || !imageObject) {
      setError('Por favor, selecciona una imagen para procesar.');
      return;
    }
    if (!canvasRef.current) {
      setError('Error: Canvas no disponible para procesamiento.');
      return;
    }

    setProcessing(true);
    setLoadingBackend(true);
    setError(null);


    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await axios.post(backendUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { processed_image_base64 } = response.data; 

      if (processed_image_base64) {
        const newImageSrc = `data:image/jpeg;base64,${processed_image_base64}`;
        setImageDisplayUrl(newImageSrc);

        const img = new Image();
        img.onload = () => {
          setImageObject(img);
        };
        img.src = newImageSrc;
      } else {
        setError('El backend no devolvió una imagen procesada válida.');
      }

    } catch (err) {
      console.error('Error al comunicarse con el backend:', err);
      if (err.response) {
        setError(`Error del servidor: ${err.response.status} - ${err.response.data.error || 'Respuesta desconocida'}`);
      } else if (err.request) {
        setError('No se pudo conectar con el backend. Asegúrate de que el servidor Flask esté corriendo en ' + backendUrl);
      } else {
        setError('Error desconocido: ' + err.message);
      }
    } finally {
      setProcessing(false);
      setLoadingBackend(false);
    }
  };

  return (
    <Card sx={{ margin: 2, padding: 2 }} id="emociones">
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Detector de Emociones
        </Typography>
        <Stack direction="column" spacing={2} sx={{ mb: 3 }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="raised-button-file"
            type="file"
            onChange={handleImageUpload}
          />
          <label htmlFor="raised-button-file">
            <Button variant="contained" component="span" fullWidth>
              Seleccionar Imagen
            </Button>
          </label>

          <Button
            variant="contained"
            color="secondary"
            onClick={processImage}

            disabled={!selectedFile || processing}
            fullWidth
          >
            {processing ? 'Enviando al Backend...' : 'Detectar Emociones'} 
          </Button>
        </Stack>


        <Box sx={{ minHeight: '300px', border: '1px dashed #ccc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mt: 3, p: 2 }}>
          {loadingBackend && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>
                Procesando imagen en el backend...
              </Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {imageDisplayUrl && (
            <Box sx={{ maxWidth: '100%', maxHeight: '60vh', overflow: 'auto', mt: 2 }}>
              <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto', display: 'block' }} />
            </Box>
          )}

          {!imageDisplayUrl && !loadingBackend && !error && (
            <Typography variant="h6" color="text.disabled">
              Selecciona una imagen para empezar.
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default Emociones;