from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import sys
import logging

import config

from app.detector import detector_bp
from app.felicidad import felicidad_bp

from services.emotion_detection import EmotionDetectorService
from services.happiness_prediction import HappinessPredictionService

load_dotenv()

logging.basicConfig(level=logging.INFO, stream=sys.stdout, format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": config.CORS_ORIGINS}})

app.register_blueprint(detector_bp)
app.register_blueprint(felicidad_bp)

with app.app_context():
    logging.info("TRAZA: Iniciando carga de modelos de detección de emociones en el contexto de la aplicación Flask...")
    
    base_backend_dir = os.path.abspath(os.path.dirname(__file__)) 
    
    absolute_yolo_path = os.path.join(base_backend_dir, config.YOLO_MODEL_RELATIVE_PATH)
    absolute_emotion_path = os.path.join(base_backend_dir, config.EMOTION_MODEL_RELATIVE_PATH)
    
    absolute_happiness_model_path = os.path.join(base_backend_dir, config.HAPPINESS_MODEL_RELATIVE_PATH)

    logging.info(f"TRAZA: Ruta absoluta YOLO: {absolute_yolo_path}")
    logging.info(f"TRAZA: Ruta absoluta Emociones: {absolute_emotion_path}")

    EmotionDetectorService.load_models(
        yolo_model_path=absolute_yolo_path,
        emotion_model_path=absolute_emotion_path,
        emotion_labels=config.EMOTION_LABELS,
        img_width_emo=config.IMG_WIDTH_EMO,
        img_height_emo=config.IMG_HEIGHT_EMO,
        yolo_input_size=config.YOLO_INPUT_SIZE,
        yolo_face_class_id=config.YOLO_FACE_CLASS_ID,
        yolo_conf_threshold=config.YOLO_CONF_THRESHOLD,
        padding_x_percent=config.PADDING_X_PERCENT,
        padding_y_percent=config.PADDING_Y_PERCENT
    )
    logging.info("TRAZA: Carga de modelos de detección de emociones completada en el contexto de la aplicación.")

    logging.info("TRAZA: Iniciando carga de modelos de predicción de felicidad...")
    HappinessPredictionService.load_models(
        happiness_model_path=absolute_happiness_model_path
    )
    logging.info("TRAZA: Carga de modelos de predicción de felicidad completada.")


@app.route('/status', methods=['GET'])
def status():
    logging.info("TRAZA: Recibida solicitud GET /status.")
    yolo_loaded = EmotionDetectorService._yolo_model is not None
    emotion_loaded = EmotionDetectorService._emotion_model is not None
    happiness_model_loaded = HappinessPredictionService._model is not None
    preprocessor_loaded = HappinessPredictionService._preprocessor is not None
    mean_df_loaded = HappinessPredictionService._mean_df_by_comunidad is not None

    status_message = "Backend funcionando."
    if not yolo_loaded:
        status_message += " Advertencia: Modelo YOLO no cargado."
    if not emotion_loaded:
        status_message += " Advertencia: Modelo de Emociones no cargado."
    if not happiness_model_loaded:
        status_message += " Advertencia: Modelo de Felicidad no cargado."
    if not preprocessor_loaded:
        status_message += " Advertencia: Preprocesador de Felicidad no cargado."
    if not mean_df_loaded:
        status_message += " Advertencia: DataFrame de medias de Felicidad no cargado."

    logging.info(f"TRAZA: Estado del backend: {status_message}")
    return jsonify({
        "status": status_message,
        "yolo_model_loaded": yolo_loaded,
        "emotion_model_loaded": emotion_loaded,
        "happiness_model_loaded": happiness_model_loaded,
        "preprocessor_loaded": preprocessor_loaded,
        "mean_df_loaded": mean_df_loaded
    }), 200


if __name__ == '__main__':
    logging.info(f"TRAZA: Iniciando servidor Flask en http://{config.FLASK_HOST}:{config.FLASK_PORT}")
    app.run(debug=config.FLASK_DEBUG, host=config.FLASK_HOST, port=config.FLASK_PORT)