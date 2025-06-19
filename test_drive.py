from pydrive2.auth import GoogleAuth
from pydrive2.drive import GoogleDrive
import os

def authenticate_and_list_files():
    gauth = GoogleAuth()

    # Las credenciales se guardarán automáticamente en un archivo por defecto
    # (usualmente 'mycreds.txt' o similar) para futuras ejecuciones.
    # La primera vez, esto abrirá una ventana del navegador para la autenticación.
    try:
        gauth.LocalWebserverAuth() # Esto abrirá el navegador y solicitará autenticación
        print("Autenticación exitosa.")
    except Exception as e:
        print(f"Error durante la autenticación: {e}")
        print("Asegúrate de que 'client_secrets.json' está en la misma carpeta y es válido.")
        return

    drive = GoogleDrive(gauth)

    print("\n--- Listando los primeros 10 archivos/carpetas en tu Drive ---")
    try:
        # Listar archivos y carpetas en la raíz de Google Drive (solo los primeros 10)
        # 'trashed=false' excluye los elementos de la papelera
        file_list = drive.ListFile({'q': "'root' in parents and trashed=false"}).GetList()

        if not file_list:
            print("No se encontraron archivos o carpetas en la raíz de tu Google Drive.")
        else:
            for file_item in file_list[:10]: # Limita a los primeros 10 para no sobrecargar la salida
                print(f"Título: {file_item['title']}, ID: {file_item['id']}, Tipo: {file_item['mimeType']}")
    except Exception as e:
        print(f"Error al listar archivos: {e}")
        print("Asegúrate de que tienes los permisos (scopes) correctos configurados en Google Cloud Console.")

    # --- Prueba de escritura: Subir un archivo de prueba ---
    print("\n--- Probando a subir un archivo de prueba ---")
    test_file_name = "test_upload_from_python.txt"
    local_content = "Este es un archivo de prueba subido desde Python.\n" \
                    "Fecha de subida: 2025-06-14 (o fecha actual de ejecución)."

    # Crear un archivo de texto local
    with open(test_file_name, "w") as f:
        f.write(local_content)
    print(f"Archivo local '{test_file_name}' creado para subir.")

    try:
        # Crear un objeto de archivo de Drive
        drive_file = drive.CreateFile({'title': test_file_name})
        drive_file.SetContentFile(test_file_name)
        drive_file.Upload() # Sube el archivo
        print(f"Archivo '{test_file_name}' subido exitosamente a Google Drive. ID: {drive_file['id']}")

        # Opcional: Eliminar el archivo local después de subirlo
        os.remove(test_file_name)
        print(f"Archivo local '{test_file_name}' eliminado.")

    except Exception as e:
        print(f"Error al subir el archivo: {e}")
        print("Verifica tus permisos en Google Drive y la conexión a internet.")

if __name__ == "__main__":
    authenticate_and_list_files()