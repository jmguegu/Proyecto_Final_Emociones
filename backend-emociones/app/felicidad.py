from flask import Blueprint, request, jsonify
import logging

from services.happiness_prediction import HappinessPredictionService

felicidad_bp = Blueprint('felicidad_bp', __name__)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

@felicidad_bp.route('/predict_happiness_index', methods=['POST'])
def predict_happiness_index_endpoint():
    logging.info("TRAZA: Recibida solicitud POST /predict_happiness_index.")
    data = request.get_json()
    if not data:
        logging.warning("TRAZA: Solicitud a /predict_happiness_index sin datos JSON.")
        return jsonify({"error": "No se recibieron datos JSON válidos."}), 400

    try:
        happiness_index = HappinessPredictionService.predict_happiness(data)
        logging.info(f"TRAZA: Índice de felicidad calculado: {happiness_index:.2f}")
        return jsonify({"happiness_index": happiness_index}), 200
    except ValueError as ve:
        logging.error(f"TRAZA: Error de validación de datos para felicidad: {ve}")
        return jsonify({"error": str(ve)}), 400
    except RuntimeError as re:
        logging.error(f"TRAZA: Error de tiempo de ejecución para felicidad: {re}")
        return jsonify({"error": str(re)}), 500
    except Exception as e:
        logging.exception("TRAZA: Error inesperado en /predict_happiness_index:")
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500