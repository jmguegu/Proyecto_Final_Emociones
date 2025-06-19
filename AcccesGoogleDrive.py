import os
import pandas as pd
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

SERVICE_ACCOUNT_KEY_FILE = 'service_account_key.json'
SCOPES = ['https://www.googleapis.com/auth/drive']

ANALYSIS_FOLDER_NAME = 'Mis_Datos_Analisis' 
YOLO_FOLDER_NAME = 'Datos_YOLO' 
EMOTIONS_FOLDER_NAME = 'Emotions' 
VAL_FOLDER_NAME = 'val'
TRAIN_FOLDER_NAME = 'train'
TEST_FOLDER_NAME = 'test'

PROJECT_FINAL_UPGRADE_ID = '1zOahTD-ClWB1fYSCUorBrnmFoXWT9-O7'


def authenticate_and_build_drive_service():
    """
    Autentica la aplicación usando la Cuenta de Servicio y construye el objeto de servicio de Google Drive.
    """
    try:
        creds = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_KEY_FILE, scopes=SCOPES)

        print("Autenticación con cuenta de servicio exitosa y no interactiva.")

        service = build('drive', 'v3', credentials=creds)
        return service

    except Exception as e:
        print(f"Error durante la autenticación de la cuenta de servicio (Directa): {e}")
        print("Asegúrate de que el archivo '{SERVICE_ACCOUNT_KEY_FILE}' está en la misma carpeta y es válido.")
        print("También, verifica que has compartido los permisos necesarios en Google Drive con la dirección de correo electrónico de tu cuenta de servicio.")
        return None

# --- Funciones de Utilidad de Google Drive ---

def find_or_create_folder(drive_service, folder_name, parent_folder_id=None):
    """
    Busca una carpeta por su nombre. Si no existe, la crea. Retorna el ID.
    """
    query = f"mimeType='application/vnd.google-apps.folder' and name='{folder_name}' and trashed=false"
    if parent_folder_id:
        query += f" and '{parent_folder_id}' in parents"
    else: # Si no hay parent_folder_id, busca en la raíz de "My Drive"
        query += " and 'root' in parents"


    results = drive_service.files().list(q=query, fields="files(id, name)").execute()
    items = results.get('files', [])

    if items:
        print(f"Carpeta '{folder_name}' ya existe. ID: {items[0]['id']}")
        return items[0]['id']
    else:
        file_metadata = {
            'name': folder_name,
            'mimeType': 'application/vnd.google-apps.folder'
        }
        if parent_folder_id:
            file_metadata['parents'] = [parent_folder_id]

        folder = drive_service.files().create(body=file_metadata, fields='id').execute()
        print(f"Carpeta '{folder_name}' creada. ID: {folder.get('id')}")
        return folder.get('id')

def upload_file_to_folder(drive_service, local_file_path, folder_id, mime_type=None):
    """
    Sube un archivo local a una carpeta específica en Google Drive.
    Si ya existe un archivo con el mismo nombre en esa carpeta, lo sustituye (actualiza).
    """
    file_name = os.path.basename(local_file_path)
    file_metadata = {'name': file_name, 'parents': [folder_id]}

    if mime_type is None:
        import mimetypes
        mime_type, _ = mimetypes.guess_type(local_file_path)
        if mime_type is None:
            mime_type = 'application/octet-stream'
            print(f"Advertencia: No se pudo inferir el tipo MIME para '{file_name}'. Usando '{mime_type}'.")

    media = MediaFileUpload(local_file_path, mimetype=mime_type)

    try:
        # Primero, intenta encontrar si el archivo ya existe en la carpeta de destino
        existing_file_id = find_file_in_folder(drive_service, file_name, folder_id)

        if existing_file_id:
            # Si el archivo existe, actualízalo
            file = drive_service.files().update(fileId=existing_file_id,
                                                media_body=media,
                                                fields='id').execute()
            print(f"Archivo '{file_name}' actualizado exitosamente en la carpeta. ID: {file.get('id')}")
            return file.get('id')
        else:
            # Si el archivo no existe, créalo
            file = drive_service.files().create(body=file_metadata,
                                                media_body=media,
                                                fields='id').execute()
            print(f"Archivo '{file_name}' subido (creado) exitosamente a la carpeta. ID: {file.get('id')}")
            return file.get('id')
    except Exception as e:
        print(f"Error al subir/actualizar el archivo '{file_name}': {e}")
        return None

def download_file(drive_service, file_id, local_file_path):
    """
    Descarga un archivo de Google Drive a una ruta local.
    """
    try:
        request = drive_service.files().get_media(fileId=file_id)
        with open(local_file_path, 'wb') as fh:
            response = request.execute()
            fh.write(response)
        print(f"Archivo ID '{file_id}' descargado a '{local_file_path}'.")
        return True
    except Exception as e:
        print(f"Error al descargar el archivo ID '{file_id}': {e}")
        return False

def list_files_in_folder(drive_service, folder_id):
    """
    Lista archivos y carpetas dentro de una carpeta específica.
    Retorna una lista de diccionarios con id, name, mimeType.
    """
    query = f"'{folder_id}' in parents and trashed=false"
    results = drive_service.files().list(q=query, fields="files(id, name, mimeType)").execute()
    items = results.get('files', [])

    if not items:
        print(f"La carpeta ID '{folder_id}' no contiene archivos o carpetas accesibles.")
    return items

def find_file_in_folder(drive_service, file_name, folder_id):
    """
    Busca un archivo por nombre dentro de una carpeta específica.
    Retorna el ID del archivo si lo encuentra, de lo contrario None.
    """
    query = f"name='{file_name}' and '{folder_id}' in parents and trashed=false"
    results = drive_service.files().list(q=query, fields="files(id, name)").execute()
    items = results.get('files', [])
    if items:
        return items[0]['id']
    else:
        return None

# --- Función para procesar carpetas YOLO recursivamente ---
def process_yolo_folder_recursively(drive_service, current_folder_id, local_base_path):
    """
    Recorre carpetas de forma recursiva, descargando imágenes y archivos de texto/yaml.
    Retorna una lista de rutas locales de los archivos descargados.
    """
    downloaded_files_paths = []

    # Asegurarse de que la carpeta local exista
    if not os.path.exists(local_base_path):
        os.makedirs(local_base_path)
        print(f"Creada carpeta local: {local_base_path}")

    items = list_files_in_folder(drive_service, current_folder_id)

    for item in items:
        item_name = item['name']
        item_id = item['id']
        item_mime_type = item['mimeType']

        if item_mime_type == 'application/vnd.google-apps.folder':
            # Es una subcarpeta, la procesamos recursivamente
            print(f"Entrando en subcarpeta: {item_name}")
            new_local_path = os.path.join(local_base_path, item_name)
            downloaded_files_paths.extend(process_yolo_folder_recursively(drive_service, item_id, new_local_path))
        else:
            # Es un archivo, lo descargamos si es relevante para YOLO
            if item_name.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.txt', '.yaml', '.yml', '.cfg')):
                local_file_path = os.path.join(local_base_path, item_name)
                print(f"  Descargando archivo: {item_name}")
                if download_file(drive_service, item_id, local_file_path):
                    downloaded_files_paths.append(local_file_path)
                else:
                    print(f"  ERROR: No se pudo descargar '{item_name}'.")
            else:
                print(f"  Saltando archivo no relevante para YOLO: {item_name} (Tipo: {item_mime_type})")

    return downloaded_files_paths


# --- Función específica para descargar un archivo desde Google Drive ---
def download_file_from_drive(drive_service, gdrive_source_folder_id, file_name, local_destination_path):
    """
    Descarga un archivo específico de una carpeta de Google Drive a una ruta local.

    Args:
        drive_service: Objeto de servicio de Google Drive autenticado.
        gdrive_source_folder_id (str): El ID de la carpeta de Google Drive donde se encuentra el archivo.
        file_name (str): El nombre exacto del archivo a descargar.
        local_destination_path (str): La ruta completa de la carpeta local donde se guardará el archivo.
                                      Si la carpeta no existe, se creará.

    Returns:
        str: La ruta local completa del archivo descargado si tiene éxito, de lo contrario None.
    """
    print(f"\n--- Descargando '{file_name}' de Google Drive a '{local_destination_path}' ---")
    
    # 1. Asegurarse de que la carpeta de destino local exista
    if not os.path.exists(local_destination_path):
        os.makedirs(local_destination_path)
        print(f"Carpeta de destino local '{local_destination_path}' creada.")
    else:
        print(f"Carpeta de destino local '{local_destination_path}' ya existe.")

    # 2. Buscar el archivo por nombre en la carpeta de origen de Google Drive
    file_id = find_file_in_folder(drive_service, file_name, gdrive_source_folder_id)

    if file_id:
        # 3. Construir la ruta local completa para el archivo descargado
        local_file_path = os.path.join(local_destination_path, file_name)
        
        # 4. Descargar el archivo
        if download_file(drive_service, file_id, local_file_path):
            print(f"'{file_name}' descargado exitosamente a '{local_file_path}'.")
            return local_file_path
        else:
            print(f"Error: No se pudo descargar '{file_name}' a '{local_file_path}'.")
            return None
    else:
        print(f"Error: El archivo '{file_name}' no se encontró en la carpeta de Google Drive ID '{gdrive_source_folder_id}'.")
        return None

# --- Función para leer un archivo local ---
def read_local_file(local_folder_path, file_name):
    """
    Lee un archivo desde una ruta local específica.

    Args:
        local_folder_path (str): La ruta completa de la carpeta local donde se encuentra el archivo.
        file_name (str): El nombre exacto del archivo a leer.

    Returns:
        pandas.DataFrame o str: Si es un CSV, retorna un DataFrame. Para otros archivos,
                                retorna el contenido como una cadena. Retorna None si falla.
    """
    full_local_path = os.path.join(local_folder_path, file_name)
    print(f"\n--- Intentando leer el archivo local: '{full_local_path}' ---")

    if not os.path.exists(full_local_path):
        print(f"Error: El archivo no existe en la ruta local: '{full_local_path}'.")
        return None

    try:
        if file_name.lower().endswith('.csv'):
            df = pd.read_csv(full_local_path)
            print(f"CSV '{file_name}' leído exitosamente en un DataFrame.")
            return df
        else:
            with open(full_local_path, 'r', encoding='utf-8') as f:
                content = f.read()
            print(f"Archivo '{file_name}' leído exitosamente como texto.")
            return content
    except Exception as e:
        print(f"Error al leer el archivo '{full_local_path}': {e}")
        return None

# --- Función para leer y procesar un CSV directamente desde Google Drive (temporalmente) ---
def read_csv_from_drive_and_process_temp(drive_service, file_info):
    """
    Descarga temporalmente un archivo CSV desde Google Drive, lo lee en un DataFrame
    y luego elimina el archivo temporal. Útil para procesamiento en memoria sin guardar.

    Args:
        drive_service: Objeto de servicio de Google Drive autenticado.
        file_info (dict): Diccionario con 'id' y 'name' del archivo CSV en Google Drive.

    Returns:
        pandas.DataFrame: El DataFrame si la lectura es exitosa, de lo contrario None.
    """
    file_id = file_info['id']
    csv_file_name = file_info['name']

    local_temp_path = os.path.join(os.getcwd(), f"temp_drive_read_{csv_file_name}")

    print(f"\n--- Descargando temporalmente y leyendo CSV '{csv_file_name}' (ID: {file_id}) ---")
    if download_file(drive_service, file_id, local_temp_path):
        try:
            df = pd.read_csv(local_temp_path)
            print(f"CSV '{csv_file_name}' leído exitosamente con pandas (temporalmente).")
            return df
        except Exception as e:
            print(f"Error al leer el CSV '{csv_file_name}' con pandas: {e}")
        finally:
            if os.path.exists(local_temp_path):
                os.remove(local_temp_path)
                print(f"Archivo temporal '{local_temp_path}' eliminado.")
    return None

# --- Función Principal ---
def main():
    drive_service = authenticate_and_build_drive_service()
    if drive_service is None:
        return
    
    if not PROJECT_FINAL_UPGRADE_ID or PROJECT_FINAL_UPGRADE_ID == 'TU_ID_DE_PROYECTO_FINAL_UPGRADE':
        print("\nERROR: Por favor, actualiza la constante 'PROJECT_FINAL_UPGRADE_ID' en el código con el ID real de tu carpeta 'Proyecto_Final_Upgrade' en Google Drive.")
        return

    analysis_folder_id = find_or_create_folder(drive_service, ANALYSIS_FOLDER_NAME, parent_folder_id=PROJECT_FINAL_UPGRADE_ID)
    if not analysis_folder_id:
        print("No se pudo obtener la ID de la carpeta 'Mis_Datos_Analisis'. Asegúrate de que existe bajo 'Proyecto_Final_Upgrade' y que el ID de 'Proyecto_Final_Upgrade' es correcto. Saliendo del flujo de análisis.")
        return


    yolo_folder_id = find_or_create_folder(drive_service, YOLO_FOLDER_NAME, parent_folder_id=PROJECT_FINAL_UPGRADE_ID)
    if not yolo_folder_id:
        print("No se pudo obtener la ID de la carpeta 'Datos_YOLO'. Asegúrate de que existe bajo 'Proyecto_Final_Upgrade' y que el ID de 'Proyecto_Final_Upgrade' es correcto. Saliendo del flujo YOLO.")
        return
    
    files_in_analysis_folder = list_files_in_folder(drive_service, analysis_folder_id)
    csv_to_process_temp = next((f for f in files_in_analysis_folder if f['name'].lower().endswith('.csv')), None)

    if csv_to_process_temp:
        df_temp = read_csv_from_drive_and_process_temp(drive_service, csv_to_process_temp)
        if df_temp is not None:
            print(f"\nPrimeras 5 filas del CSV '{csv_to_process_temp['name']}' leído temporalmente desde Drive:")
            print(df_temp.head())
    else:
        print("No se encontró ningún CSV para leer temporalmente en la carpeta de análisis.")


    print("\n--- Fin: Flujo para Análisis de Datos (CSVs) ---\n")

    # --- 2. Flujo para Carga de Datos YOLO ---
    print("--- Inicio: Flujo para Carga de Datos YOLO ---")

    local_yolo_images_base_path = os.path.join(os.getcwd(), 'Yolo', 'data_images')

    emotions_folder_id = find_or_create_folder(drive_service, EMOTIONS_FOLDER_NAME, yolo_folder_id)
    if not emotions_folder_id:
        print(f"No se pudo obtener la ID de la carpeta '{EMOTIONS_FOLDER_NAME}'. Saliendo del flujo YOLO.")
        return

    for subfolder_name in [VAL_FOLDER_NAME, TRAIN_FOLDER_NAME, TEST_FOLDER_NAME]:
        subfolder_id = find_or_create_folder(drive_service, subfolder_name, emotions_folder_id)
        if not subfolder_id:
            print(f"No se pudo obtener la ID de la carpeta '{subfolder_name}'. Saltando esta carpeta.")
            continue
        
        current_local_yolo_path = os.path.join(local_yolo_images_base_path, subfolder_name)
        downloaded_yolo_files = process_yolo_folder_recursively(drive_service, subfolder_id, current_local_yolo_path)

        if downloaded_yolo_files:
            print(f"\nArchivos YOLO descargados en '{current_local_yolo_path}':")
            for path in downloaded_yolo_files:
                print(f"  - {path}")
        else:
            print(f"No se descargó ningún archivo YOLO de '{subfolder_name}'.")



if __name__ == "__main__":
    main()