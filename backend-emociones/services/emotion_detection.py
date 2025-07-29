import tensorflow as tf
from ultralytics import YOLO
import numpy as np 
import os
import sys
import logging
import cv2
from typing import Tuple

from tensorflow.keras.applications.efficientnet import preprocess_input

from utils.image_processing import crop_and_pad_face, rgb_to_bgr

logging.basicConfig(level=logging.INFO, stream=sys.stdout, format='%(asctime)s - %(levelname)s - %(message)s')

class EmotionDetectorService:
    _yolo_model = None
    _emotion_model = None
    _emotion_labels = None
    _img_width_emo = None
    _img_height_emo = None
    _yolo_input_size = None
    _yolo_face_class_id = 0
    _yolo_conf_threshold = 0.35
    _padding_x_percent = 0.15
    _padding_y_percent = 0.20


    @classmethod
    def load_models(cls, yolo_model_path, emotion_model_path, emotion_labels, img_width_emo, img_height_emo, yolo_input_size,
                    yolo_face_class_id, yolo_conf_threshold, padding_x_percent, padding_y_percent): # Asegúrate de que estos parámetros se pasen
        """
        Carga los modelos YOLO y de clasificación de emociones (SavedModel).
        Se llama una vez al iniciar la aplicación.
        """
        logging.info("TRAZA: Iniciando carga de modelos en EmotionDetectorService.load_models...")

        if cls._yolo_model is None:
            try:
                logging.info(f"TRAZA: Cargando modelo YOLO desde: {yolo_model_path}")
                cls._yolo_model = YOLO(yolo_model_path)
                logging.info("TRAZA: Modelo YOLO cargado con éxito.")
            except Exception as e:
                logging.error(f"TRAZA: Error al cargar el modelo YOLO: {e}")
                cls._yolo_model = None

        if cls._emotion_model is None:
            try:
                logging.info(f"TRAZA: Cargando modelo de emociones SavedModel desde: {emotion_model_path}")
                cls._emotion_model = tf.saved_model.load(emotion_model_path)
                logging.info("TRAZA: Modelo de emociones SavedModel cargado con éxito.")
            except Exception as e:
                logging.error(f"TRAZA: Error al cargar el modelo de emociones SavedModel: {e}")
                logging.error(f"TRAZA: Detalle del error de carga SavedModel: {e}")
                cls._emotion_model = None
        else:
            logging.info("TRAZA: Modelo de emociones ya cargado, saltando recarga.")

        cls._emotion_labels = emotion_labels
        cls._img_width_emo = img_width_emo
        cls._img_height_emo = img_height_emo
        cls._yolo_input_size = yolo_input_size
        cls._yolo_face_class_id = yolo_face_class_id
        cls._yolo_conf_threshold = yolo_conf_threshold
        cls._padding_x_percent = padding_x_percent
        cls._padding_y_percent = padding_y_percent
        logging.info("TRAZA: Carga de modelos en EmotionDetectorService completada.")


    @classmethod
    def _get_emotion_color(cls, emotion: str) -> Tuple[int, int, int]:
        """Obtener color para cada emoción (formato BGR para OpenCV)."""
        colors = {
            'happy': (0, 255, 0),
            'sad': (255, 0, 0),
            'angry': (0, 0, 255),
            'fear': (128, 0, 128),
            'surprise': (0, 255, 255),
            'disgust': (0, 128, 0),
            'neutral': (128, 128, 128)
        }
        return colors.get(emotion, (255, 255, 255))

    @classmethod
    def predict_emotions(cls, frame): # 'frame' aquí es la imagen RGB
        """
        Función Principal: Procesamiento de Frame para Mostrar.
        Realiza la detección de caras con YOLO y la clasificación de emociones.
        Dibuja los resultados directamente en la imagen y la devuelve.
        Args:
            frame (np.array): Imagen de entrada en formato NumPy (RGB).
        Returns:
            np.array: La imagen original con las detecciones y emociones dibujadas (en formato BGR).
        """
        logging.info("TRAZA: Iniciando predict_emotions.")
        if cls._yolo_model is None or cls._emotion_model is None or cls._emotion_labels is None:
            logging.error("TRAZA: Modelos o etiquetas de emoción no cargados correctamente. La inferencia no puede continuar.")
            return rgb_to_bgr(frame) 

        display_frame = rgb_to_bgr(frame.copy())
        logging.info("TRAZA: Imagen de entrada convertida a BGR para dibujar.")
        h, w, _ = display_frame.shape
        logging.info(f"TRAZA: Dimensiones de la imagen: {h}x{w}")

        logging.info(f"TRAZA: Realizando detección de caras con YOLO. Umbral de confianza: {cls._yolo_conf_threshold}")
        results = cls._yolo_model(frame, conf=cls._yolo_conf_threshold, classes=[cls._yolo_face_class_id], verbose=False)
        logging.info(f"TRAZA: Detección YOLO completada. Resultados: {len(results)}.")

        for r in results:
            boxes = r.boxes
            logging.info(f"TRAZA: Procesando {len(boxes)} cajas detectadas.")
            for box in boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                cls_id = int(box.cls[0])
                logging.info(f"TRAZA: Caja detectada: ({x1},{y1},{x2},{y2}), Clase ID: {cls_id}")
                
                if cls_id == cls._yolo_face_class_id:
                    logging.info("TRAZA: Clase detectada es 'face'.")
                    padded_x1 = max(0, x1 - int((x2 - x1) * cls._padding_x_percent))
                    padded_y1 = max(0, y1 - int((y2 - y1) * cls._padding_y_percent))
                    padded_x2 = min(w, x2 + int((x2 - x1) * cls._padding_x_percent))
                    padded_y2 = min(h, y2 + int((y2 - y1) * cls._padding_y_percent))
                    logging.info(f"TRAZA: ROI ajustado con padding: ({padded_x1},{padded_y1},{padded_x2},{padded_y2})")

                    face_roi = frame[padded_y1:padded_y2, padded_x1:padded_x2]

                    if face_roi.shape[0] > 0 and face_roi.shape[1] > 0:
                        logging.info("TRAZA: ROI de cara válido. Redimensionando para clasificador de emociones.")
                        face_roi_resized = cv2.resize(face_roi, (cls._img_width_emo, cls._img_height_emo))

                        if len(face_roi_resized.shape) == 2:
                            face_roi_rgb_3ch = cv2.cvtColor(face_roi_resized, cv2.COLOR_GRAY2BGR)
                            logging.info("TRAZA: ROI de cara convertido a 3 canales (BGR).")
                        else:
                            face_roi_rgb_3ch = face_roi_resized
                            logging.info("TRAZA: ROI de cara ya en 3 canales (RGB).")

                        face_roi_batch = np.expand_dims(face_roi_rgb_3ch, axis=0)
                        logging.info(f"TRAZA: ROI de cara con dimensión de batch añadida. Forma: {face_roi_batch.shape}")

                        logging.info("TRAZA: Aplicando preprocess_input de EfficientNetB0.")
                        face_roi_preprocessed = preprocess_input(face_roi_batch)
                        
                        face_roi_preprocessed_float32 = face_roi_preprocessed.astype(np.float32)

                        logging.info(f"TRAZA: ROI preprocesado. Forma: {face_roi_preprocessed_float32.shape}, Rango de valores: [{np.min(tf.constant(face_roi_preprocessed_float32))}, {np.max(tf.constant(face_roi_preprocessed_float32))}]")

                        logging.info("TRAZA: Realizando predicción de emoción con el SavedModel.")

                        predictions_tensor = cls._emotion_model(tf.constant(face_roi_preprocessed_float32)) 
                        predictions = predictions_tensor.numpy()[0]
                        logging.info(f"TRAZA: Predicciones de emoción obtenidas: {predictions}")

                        emotion_index = np.argmax(predictions)
                        emotion_label = cls._emotion_labels.get(emotion_index, "Desconocido")
                        emotion_confidence = predictions[emotion_index] * 100
                        logging.info(f"TRAZA: Emoción predicha: {emotion_label} con confianza: {emotion_confidence:.2f}%")

                        current_color = cls._get_emotion_color(emotion_label)
                        logging.info(f"TRAZA: Color para la emoción {emotion_label}: {current_color}")

                        thickness_rectangle = 3
                        cv2.rectangle(display_frame, (x1, y1), (x2, y2), current_color, thickness_rectangle)
                        logging.info(f"TRAZA: Cuadro delimitador dibujado en ({x1},{y1}) a ({x2},{y2}).")

                        font_scale = 1.0
                        thickness_text = 3

                        text = f"{emotion_label}: {emotion_confidence:.0f}%"
                        logging.info(f"TRAZA: Texto a dibujar: '{text}'")

                        (text_width, text_height), baseline = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, font_scale, thickness_text)
                        text_x = x1
                        text_y = y1 - 10
                        if text_y < text_height + 5:
                            text_y = y2 + text_height + 10
                        logging.info(f"TRAZA: Posición del texto calculada: ({text_x}, {text_y})")

                        cv2.rectangle(display_frame, (text_x, text_y - text_height - baseline),
                                      (text_x + text_width, text_y + baseline),
                                      current_color, cv2.FILLED)
                        logging.info("TRAZA: Rectángulo de fondo para el texto dibujado.")
                        
                        cv2.putText(display_frame, text, (text_x, text_y), cv2.FONT_HERSHEY_SIMPLEX, font_scale,
                                    (0, 0, 0), thickness_text, cv2.LINE_AA)
                        logging.info("TRAZA: Texto de emoción dibujado.")
                    else:
                        logging.warning("TRAZA: ROI de cara vacío o inválido después del recorte. Saltando.")
                else:
                    logging.info(f"TRAZA: Clase detectada ({cls_id}) no es 'face'. Saltando.")

        logging.info("TRAZA: predict_emotions finalizado. Devolviendo frame modificado.")
        return display_frame