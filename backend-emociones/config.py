import os

YOLO_MODEL_RELATIVE_PATH = os.path.join('models', 'detector', 'yolov8n-face.pt')
EMOTION_MODEL_RELATIVE_PATH = os.path.join('models', 'detector', 'emotion_classifier_efficientnetb0_saved_model') 

# Rutas completas a los modelos de Predicción de Felicidad
HAPPINESS_MODEL_RELATIVE_PATH = os.path.join('models', 'felicidad', 'happiness_level_saved_model')

# Parámetros de imagen para el modelo de emociones
IMG_WIDTH_EMO = 224
IMG_HEIGHT_EMO = 224
YOLO_INPUT_SIZE = 640 

EMOTION_LABELS = { 
    0: 'angry',
    1: 'disgust',
    2: 'fear',
    3: 'happy',
    4: 'neutral',
    5: 'sad',
    6: 'surprise',
}

YOLO_FACE_CLASS_ID = 0
YOLO_CONF_THRESHOLD = 0.60

PADDING_X_PERCENT = 0.15
PADDING_Y_PERCENT = 0.20

# Configuración de Flask
FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
FLASK_HOST = os.getenv('FLASK_HOST', '127.0.0.1')
FLASK_PORT = int(os.getenv('FLASK_PORT', 5000))

# Orígenes permitidos para CORS (tu frontend React)
CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
