import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

// --- IMPORTACIONES DE TEXTOS (estas no cambian) ---
import { firstLine as origenDatosFirstLine, restOfContent as origenDatosRestContent } from '../presentation/data_presentation/00_origen_datos.js';
import { firstLine as poblacionFirstLine, restOfContent as poblacionRestContent } from '../presentation/data_presentation/01_poblacion_por_comunidad.js';
import { firstLine as actividadFisicaFirstLine, restOfContent as actividadFisicaRestContent } from '../presentation/data_presentation/02_actividad_fisica.js';
import { firstLine as asistenciaEventosFirstLine, restOfContent as asistenciaEventosRestContent } from '../presentation/data_presentation/03_asistencia_eventos.js';
import { firstLine as calidadAireFirstLine, restOfContent as calidadAireRestContent } from '../presentation/data_presentation/04_calidad_aire.js';
import { firstLine as criminalidadFirstLine, restOfContent as criminalidadRestContent } from '../presentation/data_presentation/05_criminalidad.js';
import { firstLine as edadesFirstLine, restOfContent as edadesRestContent } from '../presentation/data_presentation/06_edades.js';
import { firstLine as estudiosFirstLine, restOfContent as estudiosRestContent } from '../presentation/data_presentation/07_estudios.js';
import { firstLine as estadoCivilFirstLine, restOfContent as estadoCivilRestContent } from '../presentation/data_presentation/08_estado_civil.js';
import { firstLine as horasTrabajadasFirstLine, restOfContent as horasTrabajadasRestContent } from '../presentation/data_presentation/09_horas_trabajadas.js';
import { firstLine as salarioFirstLine, restOfContent as salarioRestContent } from '../presentation/data_presentation/10_salario.js';
import { firstLine as sanidadFirstLine, restOfContent as sanidadRestContent } from '../presentation/data_presentation/11_sanidad.js';


function Presentation() {
  const [contentBlocks, setContentBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- DEFINICIÓN DE LA ESTRUCTURA DE CONTENIDO con las RUTAS DIRECTAS a public/img ---
  // Las rutas de las imágenes ahora apuntan directamente a la carpeta /img en la raíz pública.
  const contentStructure = useMemo(() => {
    const structure = [
      { id: '00_origen', firstLine: origenDatosFirstLine, restContent: origenDatosRestContent, images: [] },
      { id: '01_poblacion', firstLine: poblacionFirstLine, restContent: poblacionRestContent, images: ['/img/01_01_poblacion_por_comunidad.png', '/img/01_02_poblacion_por_comunidad.png'] },
      { id: '02_actividad_fisica', firstLine: actividadFisicaFirstLine, restContent: actividadFisicaRestContent, images: ['/img/02_01_actividad_fisica.png'] },
      { id: '03_asistencia_eventos', firstLine: asistenciaEventosFirstLine, restContent: asistenciaEventosRestContent, images: ['/img/03_01_asistencia_eventos.png', '/img/03_02_asistencia_eventos.png', '/img/03_03_asistencia_eventos.png', '/img/03_04_asistencia_eventos.png'] },
      { id: '04_calidad_aire', firstLine: calidadAireFirstLine, restContent: calidadAireRestContent, images: ['/img/04_01_calidad_aire.png'] },
      { id: '05_criminalidad', firstLine: criminalidadFirstLine, restContent: criminalidadRestContent, images: ['/img/05_01_criminalidad.png', '/img/05_02_criminalidad.png'] },
      { id: '06_edades', firstLine: edadesFirstLine, restContent: edadesRestContent, images: ['/img/06_01_edades.png'] },
      { id: '07_estudios', firstLine: estudiosFirstLine, restContent: estudiosRestContent, images: ['/img/07_01_estudios.png'] },
      { id: '08_estado_civil', firstLine: estadoCivilFirstLine, restContent: estadoCivilRestContent, images: ['/img/08_01_estado_civil.png'] },
      { id: '09_horas_trabajadas', firstLine: horasTrabajadasFirstLine, restContent: horasTrabajadasRestContent, images: ['/img/09_01_horas_trabajadas.png'] },
      { id: '10_salario', firstLine: salarioFirstLine, restContent: salarioRestContent, images: ['/img/10_01_salario.png', '/img/10_02_salario.png'] },
      { id: '11_sanidad', firstLine: sanidadFirstLine, restContent: sanidadRestContent, images: ['/img/11_01_sanidad.png', '/img/11_02_sanidad.png', '/img/11_03_sanidad.png', '/img/11_04_sanidad.png'] },
    ];
    
    return structure;
  }, []); 

  // Efecto para manejar la carga inicial del contenido.
  useEffect(() => {
    if (contentStructure.length > 0 && contentStructure[0].firstLine) {
      setLoading(false);
      setContentBlocks(contentStructure);
    } else {
      setError("No se pudieron cargar los contenidos. Verifica si la 'contentStructure' está bien definida o si los archivos .js exportan 'firstLine' y 'restOfContent'.");
      setLoading(false);
    }
  }, [contentStructure]);

  // Renderizado condicional si está cargando.
  if (loading) {
    return (
      <Card sx={{ margin: 2, padding: 2, textAlign: 'center' }} id="presentation">
        <CardContent>
          <Typography variant="h5" component="div">Cargando contenido del proyecto...</Typography>
        </CardContent>
      </Card>
    );
  }

  // Renderizado condicional si hay un error.
  if (error) {
    return (
      <Card sx={{ margin: 2, padding: 2, textAlign: 'center' }} id="presentation">
        <CardContent>
          <Typography variant="h5" component="div" color="error">
            Error al cargar el contenido: {error}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            **Revisa la consola de tu TERMINAL (donde ejecutaste `npm start`)**
            para ver errores de `Module not found` o de sintaxis.
            Asegúrate de que los archivos de texto renombrados a `.js`
            contengan `export const firstLine = \`...\`;` y `export const restOfContent = \`...\`;` con backticks,
            y que no tengan `export default`.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Renderizado principal del componente Presentation.
  return (
    <Card sx={{ margin: 2, padding: 2, textAlign: 'center' }} id="presentation">
      <CardContent>
        <Typography variant="h4" component="div" gutterBottom>
          ¡Bienvenido a nuestro Proyecto de Análisis de Datos!
        </Typography>
        
        <Box sx={{ mt: 6 }}>
          {/* Mapea y renderiza cada bloque de contenido (texto + imágenes) */}
          {contentBlocks.map((block, index) => (
            <Box key={block.id || index} sx={{ mb: 6 }}>
              {/* Renderiza la primera línea en negrita si existe */}
              {block.firstLine && (
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 'bold',
                    whiteSpace: 'pre-wrap',
                    textAlign: 'left',
                    mb: 1,
                    lineHeight: 1.6,
                  }}
                  paragraph
                >
                  {block.firstLine}
                </Typography>
              )}

              {/* Renderiza el resto del contenido si existe */}
              {block.restContent && (
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    textAlign: 'left',
                    mb: 2,
                    lineHeight: 1.6,
                  }}
                  paragraph
                >
                  {block.restContent}
                </Typography>
              )}

              {/* Renderiza las imágenes si el bloque tiene imágenes */}
              {block.images && block.images.length > 0 && (
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                  alignItems: 'center',
                  mt: 2,
                }}>
                  {block.images.map((imageSource, imgIndex) => (
                    <Box key={`${block.id || index}-${imgIndex}`} sx={{ width: '100%', maxWidth: '900px', mx: 'auto' }}>
                      <img
                        src={imageSource} // Aquí se usa la ruta directa desde public/img
                        alt={`Visualización ${block.id || 'del proyecto'} - ${imgIndex + 1}`}
                        // Estilos mínimos para asegurar la visualización y no afectar la carga
                        style={{
                          maxWidth: '100%',
                          height: 'auto',
                          display: 'block', // Asegura que la imagen sea un bloque
                          // Quitamos borderRadius y boxShadow para la máxima simplicidad en la depuración de carga
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              )}

              {/* Línea divisoria entre bloques, excepto después del último */}
              {index < contentBlocks.length - 1 && (
                <hr style={{ margin: '60px auto', width: '60%', border: '0', borderTop: '1px dashed #cfd8dc' }} />
              )}
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

export default Presentation;