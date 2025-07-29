# backend-emociones/app/detector.py

from flask import Blueprint, request, jsonify
import logging
import cv2
import numpy as np

from services.emotion_detection import EmotionDetectorService
from utils.image_processing import decode_image_from_bytes, bgr_to_rgb, encode_image_to_base64

detector_bp = Blueprint('detector_bp', __name__)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

@detector_bp.route('/predict_emotions', methods=['POST'])
def predict_emotions_endpoint():
    """
    Endpoint para la detección de caras y clasificación de emociones.
    Espera un archivo de imagen en el campo 'image'.
    Devuelve la imagen procesada con las detecciones dibujadas en Base64.
    """
    logging.info("TRAZA: Recibida solicitud POST /predict_emotions.")
    if 'image' not in request.files:
        logging.warning("TRAZA: Solicitud a /predict_emotions sin archivo 'image'.")
        return jsonify({"error": "No se encontró el archivo de imagen."}), 400

    file = request.files['image']
    if file.filename == '':
        logging.warning("TRAZA: Solicitud a /predict_emotions con archivo vacío.")
        return jsonify({"error": "No se seleccionó ningún archivo."}), 400

    try:
        logging.info(f"TRAZA: Nombre del archivo recibido: {file.filename}")
        image_bytes = file.read()
        logging.info(f"TRAZA: Bytes de imagen leídos. Tamaño: {len(image_bytes)} bytes.")
        
        img_np_bgr = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
        logging.info(f"TRAZA: Imagen decodificada a NumPy (BGR). Forma: {img_np_bgr.shape}")
        
        if img_np_bgr is None:
            logging.error("TRAZA: Error al decodificar la imagen. img_np_bgr es None.")
            raise ValueError("No se pudo decodificar la imagen. Asegúrate de que es un archivo de imagen válido.")

        img_rgb = cv2.cvtColor(img_np_bgr, cv2.COLOR_BGR2RGB)
        logging.info("TRAZA: Imagen convertida de BGR a RGB para el servicio de predicción.")

        logging.info("TRAZA: Llamando a EmotionDetectorService.predict_emotions.")
        processed_image_bgr = EmotionDetectorService.predict_emotions(img_rgb)
        logging.info("TRAZA: EmotionDetectorService.predict_emotions completado.")
        
        logging.info("TRAZA: Codificando la imagen procesada a Base64.")
        processed_image_base64 = encode_image_to_base64(processed_image_bgr, format='jpeg')
        logging.info("TRAZA: Imagen procesada y codificada a Base64 exitosamente.")

        return jsonify({"processed_image_base64": processed_image_base64}), 200

    except ValueError as ve:
        logging.error(f"TRAZA: Error de validación de imagen en /predict_emotions: {ve}")
        return jsonify({"error": str(ve)}), 400
    except RuntimeError as re:
        logging.error(f"TRAZA: Error de tiempo de ejecución del modelo en /predict_emotions: {re}")
        return jsonify({"error": str(re)}), 500
    except Exception as e:
        logging.exception("TRAZA: Error inesperado en /predict_emotions:")
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500
