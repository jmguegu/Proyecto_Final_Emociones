import cv2
import numpy as np
from PIL import Image
import io
import base64

def decode_image_from_bytes(image_bytes):
    """
    Decodifica bytes de imagen a un array NumPy (BGR).
    """
    data = np.frombuffer(image_bytes, dtype=np.uint8)
    img_np = cv2.imdecode(data, cv2.IMREAD_COLOR)
    if img_np is None:
        raise ValueError("No se pudo decodificar la imagen. Asegúrate de que es un formato de imagen válido.")
    return img_np

def bgr_to_rgb(image_np):
    """
    Convierte una imagen NumPy de formato BGR a RGB.
    """
    return cv2.cvtColor(image_np, cv2.COLOR_BGR2RGB)

def rgb_to_bgr(image_np):
    """
    Convierte una imagen NumPy de formato RGB a BGR.
    Útil antes de codificar con cv2.imencode para formatos como JPEG/PNG.
    """
    return cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)

def preprocess_emotion_image(image_np, target_size=(224, 224)):
    """
    Preprocesa una imagen NumPy (RGB) para el modelo EfficientNetB0 de emociones.
    Redimensiona y escala los píxeles a [-1, 1].
    Nota: En emotion_detection.py, se usará tf.keras.applications.efficientnet.preprocess_input
    para replicar el cuaderno de Colab, que también escala a [-1, 1].
    """
    # Redimensionar la imagen
    face_resized = cv2.resize(image_np, target_size)
    # Convertir a float32
    image_float = face_resized.astype(np.float32)
    # Escalar de [0, 255] a [-1, 1]
    preprocessed_image = (image_float / 127.5) - 1.0
    # Añadir dimensión de batch
    return np.expand_dims(preprocessed_image, axis=0)

def crop_and_pad_face(image_rgb, x1, y1, x2, y2, padding_x_percent=0.15, padding_y_percent=0.20):
    """
    Recorta una región de la cara de una imagen RGB con padding.
    Asegura que las coordenadas estén dentro de los límites de la imagen.
    """
    img_height, img_width, _ = image_rgb.shape

    padding_x = int((x2 - x1) * padding_x_percent)
    padding_y = int((y2 - y1) * padding_y_percent)

    padded_x1 = max(0, x1 - padding_x)
    padded_y1 = max(0, y1 - padding_y)
    padded_x2 = min(img_width, x2 + padding_x)
    padded_y2 = min(img_height, y2 + padding_y)

    face_roi_rgb = image_rgb[padded_y1:padded_y2, padded_x1:padded_x2]

    if face_roi_rgb.size == 0:
        return None 

    return face_roi_rgb

def encode_image_to_base64(image_np, format='jpeg'):
    """
    Codifica un array NumPy de imagen (BGR) a una cadena base64.
    cv2.imencode espera formato BGR para JPEG/PNG.
    """
    is_success, buffer = cv2.imencode(f".{format}", image_np)
    if not is_success:
        raise ValueError(f"No se pudo codificar la imagen a {format}.")
    return base64.b64encode(buffer).decode('utf-8')