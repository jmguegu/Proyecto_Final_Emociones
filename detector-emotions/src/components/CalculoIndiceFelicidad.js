import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Tooltip,
  Alert,
  Stack
} from '@mui/material';
import axios from 'axios';
import { green } from '@mui/material/colors'; 

function CalculoIndiceFelicidad() {
  const [loadingBackend, setLoadingBackend] = useState(false);
  const [error, setError] = useState(null);
  const [edad, setEdad] = useState('');
  const [genero, setGenero] = useState('');
  const [estadoCivil, setEstadoCivil] = useState('');
  const [comunidadAutonoma, setComunidadAutonoma] = useState('');
  const [actividadFisica, setActividadFisica] = useState('');
  const [nivelEducacion, setNivelEducacion] = useState('');
  const [horasTrabajadasMes, setHorasTrabajadasMes] = useState('');
  const [salarioBrutoAnual, setSalarioBrutoAnual] = useState('');
  const [predictionResult, setPredictionResult] = useState(null);
  const [asistenciaCine, setAsistenciaCine] = useState('');
  const [asistenciaDirectos, setAsistenciaDirectos] = useState('');
  const [asistenciaCultural, setAsistenciaCultural] = useState('');
  const [asistenciaDeporte, setAsistenciaDeporte] = useState('');
  const [satisfHospitales, setSatisfHospitales] = useState('');
  const [satisfDentistas, setSatisfDentistas] = useState('');
  const [satisfEspecialistas, setSatisfEspecialistas] = useState('');
  const [satisfMedGeneral, setSatisfMedGeneral] = useState('');


  const [edadError, setEdadError] = useState('');
  const [horasTrabajadasError, setHorasTrabajadasError] = useState('');
  const [salarioError, setSalarioError] = useState('');

  // URL del endpoint
  const backendUrl = 'http://127.0.0.1:5000/predict_happiness_index';

  const comunidadAutonomaOptions = {
    "Andalucía": "Andalucía",
    "Aragón": "Aragón",
    "Principado de Asturias": "Asturias. Principado de",
    "Islas Baleares": "Balears. Illes",
    "Canarias": "Canarias",
    "Cantabria": "Cantabria",
    "Castilla - La Mancha": "Castilla - La Mancha",
    "Castilla y León": "Castilla y León",
    "Cataluña": "Cataluña",
    "Ceuta": "Ceuta",
    "Comunidad Valenciana": "Comunitat Valenciana",
    "Extremadura": "Extremadura",
    "Galicia": "Galicia",
    "Comunidad de Madrid": "Madrid. Comunidad de",
    "Melilla": "Melilla",
    "Región de Murcia": "Murcia. Región de",
    "Comunidad Foral de Navarra": "Navarra. Comunidad Foral de",
    "País Vasco": "País Vasco",
    "La Rioja": "Rioja. La"
  };

  const satisfaccionSaludOptions = {
    "Muy insatisfecho/a": "muy_insatisfecho/a",
    "Insatisfecho/a": "insatisfecho/a",
    "Neutral": "neutral",
    "Satisfecho/a": "satisfecho/a",
    "Muy satisfecho/a": "muy_satisfecho/a"
  };

  const generoOptions = {
    "Hombre": "hombre",
    "Mujer": "mujer"
  };

  const actividadFisicaOptions = {
    "Nivel alto": "nivel_alto",
    "Nivel moderado": "nivel_moderado",
    "Nivel bajo": "nivel_bajo"
  };

  const asistenciaOptions = {
    "No puede": "no_puede",
    "No": "no",
    "Sí": "si"
  };

  const nivelesEducacionOptions = {
    "Sin estudios": "analfabetos",
    "Estudios primarios incompletos": "estudios_primarios_incompletos",
    "Primaria": "primaria",
    "Primer ciclo de Secundaria": "primero_secundaria",
    "Segundo ciclo de Secundaria (General)": "segundo_secundaria_general",
    "Segundo ciclo de Secundaria (Profesional)": "segundo_secundaria_profesional",
    "Educación superior": "educacion_superior"
  };

  const estadoCivilOptions = {
    "Soltero/a": "soltero/a",
    "Casado/a": "casado/a",
    "Divorciado/a": "divorciado/a",
    "Viudo/a": "viudo/a"
  };


  /**
   * Valida un valor numérico contra un rango.
   * @param {string} value El valor a validar.
   * @param {number} min El valor mínimo permitido.
   * @param {number} max El valor máximo permitido.
   * @returns {string} Mensaje de error si el valor está fuera de rango, o cadena vacía si es válido.
   */
  const validateRange = (value, min, max, fieldName) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return '';
    }
    if (numValue < min || numValue > max) {
      return `El valor de ${fieldName} debe estar entre ${min} y ${max}.`;
    }
    return '';
  };

  /**
   * Determina el color verde basado en el índice de felicidad (0-10).
   * Más oscuro para valores altos, más claro para valores bajos.
   * @param {number} index El índice de felicidad.
   * @returns {string} El código de color hexadecimal.
   */
  const getHappinessColor = (index) => {
    if (index === null || isNaN(parseFloat(index))) return 'text.primary'; // Color por defecto si no hay predicción o es inválida

    const value = parseFloat(index);
    const shadeIndex = Math.round((value / 10) * 8); 
    const shades = [green[50], green[100], green[200], green[300], green[400], green[500], green[600], green[700], green[800], green[900]];
    
    const finalShadeIndex = Math.min(shades.length - 1, Math.max(0, shadeIndex));
    
    return shades[finalShadeIndex];
  };


  const handlePredict = async () => {
    setEdadError('');
    setHorasTrabajadasError('');
    setSalarioError('');
    setError('');
    setPredictionResult(null);

    const edadValidation = validateRange(edad, 10, 110, 'Edad');
    const horasValidation = validateRange(horasTrabajadasMes, 0, 300, 'Horas Trabajadas al mes');
    const salarioValidation = validateRange(salarioBrutoAnual, 0, 50000, 'Salario Bruto Anual');

    if (edadValidation) { setEdadError(edadValidation); return; }
    if (horasValidation) { setHorasTrabajadasError(horasValidation); return; }
    if (salarioValidation) { setSalarioError(salarioValidation); return; }

    const requiredFields = [
      edad, genero, estadoCivil, comunidadAutonoma, actividadFisica,
      nivelEducacion, horasTrabajadasMes, salarioBrutoAnual, asistenciaCine,
      asistenciaDirectos, asistenciaCultural, asistenciaDeporte,
      satisfHospitales, satisfDentistas, satisfEspecialistas, satisfMedGeneral
    ];

    const allFieldsFilled = requiredFields.every(field => field !== '' && field !== null);

    if (!allFieldsFilled) {
      setError('Por favor, rellena todos los campos para calcular el índice.');
      return;
    }

    setLoadingBackend(true); 

    try {
      const inputData = {
        edad: parseFloat(edad),
        genero: genero,
        estado_civil: estadoCivil,
        comunidad_autonoma: comunidadAutonoma,
        actividad_fisica: actividadFisica,
        nivel_educacion: nivelEducacion,
        horas_trabajadas_mes: parseFloat(horasTrabajadasMes),
        salario_bruto_anual: parseFloat(salarioBrutoAnual),
        asistencia_cine: asistenciaCine,
        asistencia_directos: asistenciaDirectos,
        asistencia_cultural: asistenciaCultural,
        asistencia_deporte: asistenciaDeporte,
        satisf_hospitales: satisfHospitales,
        satisf_dentistas: satisfDentistas,
        satisf_especialistas: satisfEspecialistas,
        satisf_medGeneral: satisfMedGeneral,
      };

      console.log('Enviando datos al backend:', inputData);

      const response = await axios.post(backendUrl, inputData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const { happiness_index } = response.data;

      if (happiness_index !== undefined && happiness_index !== null) {
        setPredictionResult(happiness_index.toFixed(2));
      } else {
        setError('El backend no devolvió un índice de felicidad válido.');
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
      setLoadingBackend(false);
    }
  };

  return (
    <Card sx={{ margin: 2, padding: 2, textAlign: 'center' }} id="calculo-felicidad">
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Cálculo del Índice de Felicidad
        </Typography>

        <Box sx={{ mt: 3, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
          {loadingBackend && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>Calculando índice de felicidad ..</Typography>
            </Box>
          )}
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {!loadingBackend && (
            <>
              <Typography variant="h6" gutterBottom>
                Introduce los parámetros:
              </Typography>
              <Stack spacing={2} sx={{ mb: 3 }}>
                <Tooltip title="Edad del individuo (entre 10 y 110 años)">
                  <TextField
                    label="Edad"
                    type="number"
                    value={edad}
                    onChange={(e) => setEdad(e.target.value)}
                    fullWidth
                    inputProps={{ min: 10, max: 110 }}
                    error={!!edadError}
                    helperText={edadError}
                  />
                </Tooltip>

                <Tooltip title="Género del individuo">
                  <FormControl fullWidth>
                    <InputLabel id="genero-label">Género</InputLabel>
                    <Select
                      labelId="genero-label"
                      id="genero-select"
                      value={genero}
                      label="Género"
                      onChange={(e) => setGenero(e.target.value)}
                    >
                      {Object.keys(generoOptions).map((displayKey) => (
                        <MenuItem key={generoOptions[displayKey]} value={generoOptions[displayKey]}>{displayKey}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Tooltip>

                <Tooltip title="Estado civil actual del individuo">
                  <FormControl fullWidth>
                    <InputLabel id="estado-civil-label">Estado Civil</InputLabel>
                    <Select
                      labelId="estado-civil-label"
                      id="estado-civil-select"
                      value={estadoCivil}
                      label="Estado Civil"
                      onChange={(e) => setEstadoCivil(e.target.value)}
                    >
                      {Object.keys(estadoCivilOptions).map((displayKey) => (
                        <MenuItem key={estadoCivilOptions[displayKey]} value={estadoCivilOptions[displayKey]}>{displayKey}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Tooltip>

                <Tooltip title="Comunidad Autónoma de residencia">
                  <FormControl fullWidth>
                    <InputLabel id="comunidad-autonoma-label">Comunidad Autónoma</InputLabel>
                    <Select
                      labelId="comunidad-autonoma-label"
                      id="comunidad-autonoma-select"
                      value={comunidadAutonoma}
                      label="Comunidad Autónoma"
                      onChange={(e) => setComunidadAutonoma(e.target.value)}
                    >
                      {Object.keys(comunidadAutonomaOptions).map((displayKey) => (
                        <MenuItem key={comunidadAutonomaOptions[displayKey]} value={comunidadAutonomaOptions[displayKey]}>{displayKey}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Tooltip>

                <Tooltip title="Nivel de actividad física del individuo">
                  <FormControl fullWidth>
                    <InputLabel id="actividad-fisica-label">Actividad Física</InputLabel>
                    <Select
                      labelId="actividad-fisica-label"
                      id="actividad-fisica-select"
                      value={actividadFisica}
                      label="Actividad Física"
                      onChange={(e) => setActividadFisica(e.target.value)}
                    >
                      {Object.keys(actividadFisicaOptions).map((displayKey) => (
                        <MenuItem key={actividadFisicaOptions[displayKey]} value={actividadFisicaOptions[displayKey]}>{displayKey}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Tooltip>

                <Tooltip title="Nivel más alto de educación completado">
                  <FormControl fullWidth>
                    <InputLabel id="nivel-educacion-label">Nivel de Educación</InputLabel>
                    <Select
                      labelId="nivel-educacion-label"
                      id="nivel-educacion-select"
                      value={nivelEducacion}
                      label="Nivel de Educación"
                      onChange={(e) => setNivelEducacion(e.target.value)}
                    >
                      {Object.keys(nivelesEducacionOptions).map((displayKey) => (
                        <MenuItem key={nivelesEducacionOptions[displayKey]} value={nivelesEducacionOptions[displayKey]}>{displayKey}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Tooltip>

                <Tooltip title="Número de horas trabajadas al mes (entre 0 y 300)">
                  <TextField
                    label="Horas Trabajadas al mes"
                    type="number"
                    value={horasTrabajadasMes}
                    onChange={(e) => setHorasTrabajadasMes(e.target.value)}
                    fullWidth
                    inputProps={{ min: 0, max: 300 }}
                    error={!!horasTrabajadasError}
                    helperText={horasTrabajadasError}
                  />
                </Tooltip>
                <Tooltip title="Salario bruto anual en euros (entre 0 y 50000)">
                  <TextField
                    label="Salario Bruto Anual"
                    type="number"
                    value={salarioBrutoAnual}
                    onChange={(e) => setSalarioBrutoAnual(e.target.value)}
                    fullWidth
                    inputProps={{ min: 0, max: 50000 }}
                    error={!!salarioError}
                    helperText={salarioError}
                  />
                </Tooltip>

                <Tooltip title="Frecuencia de asistencia al cine.">
                  <FormControl fullWidth>
                    <InputLabel id="asistencia-cine-label">Asistencia al Cine</InputLabel>
                    <Select
                      labelId="asistencia-cine-label"
                      id="asistencia-cine-select"
                      value={asistenciaCine}
                      label="Asistencia al Cine"
                      onChange={(e) => setAsistenciaCine(e.target.value)}
                    >
                      {Object.keys(asistenciaOptions).map((displayKey) => (
                        <MenuItem key={asistenciaOptions[displayKey]} value={asistenciaOptions[displayKey]}>{displayKey}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Tooltip>

                <Tooltip title="Frecuencia de asistencia a espectáculos en directo (conciertos, teatro, etc.).">
                  <FormControl fullWidth>
                    <InputLabel id="asistencia-directos-label">Asistencia a Espectáculos en Directo</InputLabel>
                    <Select
                      labelId="asistencia-directos-label"
                      id="asistencia-directos-select"
                      value={asistenciaDirectos}
                      label="Asistencia a Espectáculos en Directo"
                      onChange={(e) => setAsistenciaDirectos(e.target.value)}
                    >
                      {Object.keys(asistenciaOptions).map((displayKey) => (
                        <MenuItem key={asistenciaOptions[displayKey]} value={asistenciaOptions[displayKey]}>{displayKey}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Tooltip>

                <Tooltip title="Frecuencia de asistencia a eventos culturales (museos, exposiciones, etc.).">
                  <FormControl fullWidth>
                    <InputLabel id="asistencia-cultural-label">Asistencia a Eventos Culturales</InputLabel>
                    <Select
                      labelId="asistencia-cultural-label"
                      id="asistencia-cultural-select"
                      value={asistenciaCultural}
                      label="Asistencia a Eventos Culturales"
                      onChange={(e) => setAsistenciaCultural(e.target.value)}
                    >
                      {Object.keys(asistenciaOptions).map((displayKey) => (
                        <MenuItem key={asistenciaOptions[displayKey]} value={asistenciaOptions[displayKey]}>{displayKey}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Tooltip>

                <Tooltip title="Frecuencia de asistencia a eventos deportivos.">
                  <FormControl fullWidth>
                    <InputLabel id="asistencia-deporte-label">Asistencia a Eventos Deportivos</InputLabel>
                    <Select
                      labelId="asistencia-deporte-label"
                      id="asistencia-deporte-select"
                      value={asistenciaDeporte}
                      label="Asistencia a Eventos Deportivos"
                      onChange={(e) => setAsistenciaDeporte(e.target.value)}
                    >
                      {Object.keys(asistenciaOptions).map((displayKey) => (
                        <MenuItem key={asistenciaOptions[displayKey]} value={asistenciaOptions[displayKey]}>{displayKey}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Tooltip>

                <Tooltip title="Nivel de satisfacción con los hospitales públicos/privados.">
                  <FormControl fullWidth>
                    <InputLabel id="satisf-hospitales-label">Satisfacción Hospitales</InputLabel>
                    <Select
                      labelId="satisf-hospitales-label"
                      id="satisf-hospitales-select"
                      value={satisfHospitales}
                      label="Satisfacción Hospitales"
                      onChange={(e) => setSatisfHospitales(e.target.value)}
                    >
                      {Object.keys(satisfaccionSaludOptions).map((displayKey) => (
                        <MenuItem key={satisfaccionSaludOptions[displayKey]} value={satisfaccionSaludOptions[displayKey]}>{displayKey}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Tooltip>

                <Tooltip title="Nivel de satisfacción con los servicios de dentistas.">
                  <FormControl fullWidth>
                    <InputLabel id="satisf-dentistas-label">Satisfacción Dentistas</InputLabel>
                    <Select
                      labelId="satisf-dentistas-label"
                      id="satisf-dentistas-select"
                      value={satisfDentistas}
                      label="Satisfacción Dentistas"
                      onChange={(e) => setSatisfDentistas(e.target.value)}
                    >
                      {Object.keys(satisfaccionSaludOptions).map((displayKey) => (
                        <MenuItem key={satisfaccionSaludOptions[displayKey]} value={satisfaccionSaludOptions[displayKey]}>{displayKey}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Tooltip>

                <Tooltip title="Nivel de satisfacción con los médicos especialistas.">
                  <FormControl fullWidth>
                    <InputLabel id="satisf-especialistas-label">Satisfacción Especialistas</InputLabel>
                    <Select
                      labelId="satisf-especialistas-label"
                      id="satisf-especialistas-select"
                      value={satisfEspecialistas}
                      label="Satisfacción Especialistas"
                      onChange={(e) => setSatisfEspecialistas(e.target.value)}
                    >
                      {Object.keys(satisfaccionSaludOptions).map((displayKey) => (
                        <MenuItem key={satisfaccionSaludOptions[displayKey]} value={satisfaccionSaludOptions[displayKey]}>{displayKey}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Tooltip>

                <Tooltip title="Nivel de satisfacción con el médico de cabecera/general.">
                  <FormControl fullWidth>
                    <InputLabel id="satisf-med-general-label">Satisfacción Médico General</InputLabel>
                    <Select
                      labelId="satisf-med-general-label"
                      id="satisf-med-general-select"
                      value={satisfMedGeneral}
                      label="Satisfacción Médico General"
                      onChange={(e) => setSatisfMedGeneral(e.target.value)}
                    >
                      {Object.keys(satisfaccionSaludOptions).map((displayKey) => (
                        <MenuItem key={satisfaccionSaludOptions[displayKey]} value={satisfaccionSaludOptions[displayKey]}>{displayKey}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Tooltip>

              </Stack>
              <Button
                variant="contained"
                color="primary"
                onClick={handlePredict}
                fullWidth
                disabled={
                  !edad || edadError ||
                  !genero || !estadoCivil || !comunidadAutonoma || !actividadFisica || !nivelEducacion ||
                  !horasTrabajadasMes || horasTrabajadasError ||
                  !salarioBrutoAnual || salarioError ||
                  !asistenciaCine || !asistenciaDirectos || !asistenciaCultural || !asistenciaDeporte ||
                  !satisfHospitales || !satisfDentistas || !satisfEspecialistas || !satisfMedGeneral
                }
              >
                Calcular Índice de Felicidad
              </Button>
              {predictionResult !== null && (
                <Typography
                  variant="h6"
                  sx={{
                    mt: 3,
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: getHappinessColor(predictionResult),
                  }}
                >
                  Índice de Felicidad: {predictionResult}
                </Typography>
              )}
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default CalculoIndiceFelicidad;