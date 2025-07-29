import logging
import sys
import numpy as np
import pandas as pd
import tensorflow as tf
import joblib
import os

logging.basicConfig(level=logging.INFO, stream=sys.stdout, format='%(asctime)s - %(levelname)s - %(message)s')

class HappinessPredictionService:
    _model = None
    _preprocessor = None
    _mean_df_by_comunidad = None

    @classmethod
    def load_models(cls, happiness_model_path):
        """
        Carga el modelo de felicidad (SavedModel), el preprocesador y el dataframe de medias.
        Se llama una vez al iniciar la aplicación.
        Las rutas del preprocesador y del dataframe de medias se infieren
        del directorio del modelo de felicidad.
        """
        preprocessor_path = os.path.join(happiness_model_path, 'preprocessor.pkl')
        mean_df_path = os.path.join(happiness_model_path, 'mean_df_by_comunidad.csv')

        if cls._model is None:
            try:
                logging.info(f"Cargando modelo de felicidad SavedModel desde: {happiness_model_path}")
                cls._model = tf.saved_model.load(happiness_model_path)
                logging.info("Modelo de felicidad SavedModel cargado con éxito.")
            except Exception as e:
                logging.error(f"Error al cargar el modelo de felicidad SavedModel: {e}")
                cls._model = None

        if cls._preprocessor is None:
            try:
                logging.info(f"Cargando preprocesador desde: {preprocessor_path}")
                cls._preprocessor = joblib.load(preprocessor_path)
                logging.info("Preprocesador cargado con éxito.")
            except Exception as e:
                logging.error(f"Error al cargar el preprocesador: {e}")
                cls._preprocessor = None
        
        if cls._mean_df_by_comunidad is None:
            try:
                logging.info(f"Cargando mean_df_by_comunidad desde: {mean_df_path}")
                cls._mean_df_by_comunidad = pd.read_csv(mean_df_path)
                if 'comunidad_autonoma' in cls._mean_df_by_comunidad.columns:
                    cls._mean_df_by_comunidad = cls._mean_df_by_comunidad.set_index('comunidad_autonoma')
                logging.info("mean_df_by_comunidad cargado con éxito.")
            except Exception as e:
                logging.error(f"Error al cargar mean_df_by_comunidad: {e}")
                cls._mean_df_by_comunidad = None


    @classmethod
    def predict_happiness(cls, data):
        """
        Calcula el índice de felicidad basado en los datos de entrada usando el modelo cargado.
        Args:
            data (dict): Diccionario con los parámetros de entrada del frontend.
                         Ahora se espera que las variables categóricas sean strings.
        Returns:
            float: El índice de felicidad predicho.
        """
        if not cls._model or not cls._preprocessor or cls._mean_df_by_comunidad is None:
            raise RuntimeError("Los modelos o el preprocesador/dataframe de medias no están cargados en el backend.")

        try:
            input_df = pd.DataFrame([{
                "edad": data['edad'],
                "genero": data['genero'],
                "estado_civil": data['estado_civil'],
                "comunidad_autonoma": data['comunidad_autonoma'],
                "actividad_fisica": data['actividad_fisica'],
                "estudios": data['nivel_educacion'],
                "horasTrabajadas_mes": data['horas_trabajadas_mes'],
                "salario_anual": data['salario_bruto_anual'],
                "asistencia_cine": data['asistencia_cine'],
                "asistencia_directos": data['asistencia_directos'],
                "asistencia_cultural": data['asistencia_cultural'],
                "asistencia_deporte": data['asistencia_deporte'],
                "satisf_hospitales": data['satisf_hospitales'],
                "satisf_dentistas": data['satisf_dentistas'],
                "satisf_especialistas": data['satisf_especialistas'],
                "satisf_medGeneral": data['satisf_medGeneral'],
            }])
            
            comunidad_autonoma_str = input_df['comunidad_autonoma'].iloc[0]

            if comunidad_autonoma_str in cls._mean_df_by_comunidad.index:
                input_df['dias_alta_contaminacion'] = cls._mean_df_by_comunidad.loc[comunidad_autonoma_str, 'dias_alta_contaminacion']
                input_df['percepcion_seguridad'] = cls._mean_df_by_comunidad.loc[comunidad_autonoma_str, 'percepcion_seguridad']
            else:
                logging.warning(f"Comunidad autónoma '{comunidad_autonoma_str}' no encontrada en mean_df. Usando medias globales.")
                input_df['dias_alta_contaminacion'] = cls._mean_df_by_comunidad['dias_alta_contaminacion'].mean()
                input_df['percepcion_seguridad'] = cls._mean_df_by_comunidad['percepcion_seguridad'].mean()

            expected_columns = [
                "comunidad_autonoma", "edad", "genero", "actividad_fisica", "asistencia_cine",
                "asistencia_directos", "asistencia_cultural", "asistencia_deporte",
                "dias_alta_contaminacion", "estudios", "estado_civil", "horasTrabajadas_mes",
                "salario_anual", "satisf_hospitales", "satisf_dentistas",
                "satisf_especialistas", "satisf_medGeneral", "percepcion_seguridad"
            ]
            
            input_df = input_df[expected_columns]

            preprocessed_data = cls._preprocessor.transform(input_df).toarray()

            input_tensor = tf.constant(preprocessed_data, dtype=tf.float32)
            
            prediction_output = cls._model.signatures['serving_default'](input_tensor)
            
            if isinstance(prediction_output, dict):
                output_tensor_key = list(prediction_output.keys())[0] 
                prediction_value = prediction_output[output_tensor_key].numpy()[0][0]
            else:
                prediction_value = prediction_output.numpy()[0][0]


            happiness_index = prediction_value

            logging.info(f"Predicción de felicidad para input: {data} -> {happiness_index:.2f}")
            return float(happiness_index)

        except KeyError as ke:
            raise ValueError(f"Faltan datos requeridos en la entrada o nombre de clave incorrecto: {ke}. Asegúrate de que todos los campos del formulario estén presentes y con los nombres de clave correctos.")
        except ValueError as ve:
            raise ValueError(f"Error en los datos de entrada o mapeo: {ve}")
        except Exception as e:
            logging.error(f"Error inesperado en la predicción de felicidad: {e}", exc_info=True)
            raise RuntimeError("Error interno al calcular el índice de felicidad.")