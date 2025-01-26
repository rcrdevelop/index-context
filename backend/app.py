import os
import zipfile
import tempfile
import shutil
from pathlib import Path
from flask import Flask, jsonify, request, send_file, make_response
from werkzeug.utils import secure_filename
from flask_cors import CORS
app = Flask(__name__)
# Habilitar CORS para todas las rutas y orígenes
CORS(app)

# Configuración
MAX_FILE_SIZE = 1024 * 1024 * 100  # 100MB
ALLOWED_EXTENSIONS = {'zip'}
UPLOAD_FOLDER = tempfile.mkdtemp(prefix='zip_analysis_')
BASE_DIR = Path(UPLOAD_FOLDER).resolve()

app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


# Añade estas funciones al inicio de tu código Flask
def list_directory_contents_recursive(path):
    contents = []
    try:
        for root, dirs, files in os.walk(path):
            contents.append({
                'path': root,
                'dirs': [os.path.join(root, d) for d in dirs],
                'files': [os.path.join(root, f) for f in files]
            })
        return contents
    except Exception as e:
        return str(e)

def generate_text_report(report):
    text = []
    
    # Sección de estadísticas
    text.append("=== ESTADÍSTICAS DEL PROYECTO ===")
    text.append(f"Total archivos: {report['stats']['total_files']}")
    text.append(f"Total directorios: {report['stats']['total_dirs']}")
    
    # Sección de seguridad
    text.append("\n=== ADVERTENCIAS DE SEGURIDAD ===")
    if report['security_checks']['git_repository_found']:
        text.append("[!] Repositorio .git expuesto")
    
    # Estructura de directorios
    text.append("\n=== ESTRUCTURA DE DIRECTORIOS ===")
    for item in report['structure']:
        rel_path = os.path.relpath(item['path'], start=report['structure'][0]['path'])
        indent = '  ' * (len(rel_path.split(os.sep)) - 1)
        text.append(f"{indent}📁 {os.path.basename(item['path'])}")
        
        for file in item['files']:
            file_indent = '  ' * len(rel_path.split(os.sep))
            text.append(f"{file_indent}📄 {os.path.basename(file)}")
    
    return '\n'.join(text)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def safe_extract(zip_path, extract_dir):
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        for member in zip_ref.namelist():
            member_path = Path(extract_dir) / member
            if not member_path.resolve().is_relative_to(extract_dir):
                raise ValueError('Intento de path traversal detectado')
        zip_ref.extractall(extract_dir)

def analyze_uploaded_project(zip_path):
    try:
        # Crear directorio temporal único
        extract_dir = tempfile.mkdtemp(dir=BASE_DIR)
        
        # Descomprimir archivo
        safe_extract(zip_path, extract_dir)
        
        # Analizar estructura
        contents = list_directory_contents_recursive(extract_dir)
        
        # Generar informe
        report = {
            'structure': contents,
            'stats': generate_file_stats(extract_dir),
            'security_checks': perform_security_checks(extract_dir)
        }
        
        # Generar versión texto
        text_report = generate_text_report(report)
        
        return report, text_report
    finally:
        # Limpieza segura
        if os.path.exists(zip_path):
            os.remove(zip_path)
        if os.path.exists(extract_dir):
            shutil.rmtree(extract_dir, ignore_errors=True)

def generate_file_stats(root_path):
    stats = {
        'total_files': 0,
        'total_dirs': 0,
        'file_types': {},
        'largest_file': {'path': '', 'size': 0},
        'recent_modified': None
    }
    
    for root, dirs, files in os.walk(root_path):
        stats['total_dirs'] += len(dirs)
        stats['total_files'] += len(files)
        
        for file in files:
            file_path = os.path.join(root, file)
            file_size = os.path.getsize(file_path)
            
            # Tipo de archivo
            _, ext = os.path.splitext(file)
            stats['file_types'][ext.lower()] = stats['file_types'].get(ext.lower(), 0) + 1
            
            # Archivo más grande
            if file_size > stats['largest_file']['size']:
                stats['largest_file'] = {'path': file_path, 'size': file_size}
                
            # Modificación reciente
            mtime = os.path.getmtime(file_path)
            if not stats['recent_modified'] or mtime > stats['recent_modified']:
                stats['recent_modified'] = mtime
                
    return stats

def perform_security_checks(root_path):
    checks = {
        'exposed_config_files': [],
        'git_repository_found': False,
        'env_files': [],
        'suspicious_extensions': []
    }
    
    suspicious_exts = {'.exe', '.dll', '.sh', '.py', '.php', '.js'}
    
    for root, dirs, files in os.walk(root_path):
        if '.git' in dirs:
            checks['git_repository_found'] = True
            
        for file in files:
            _, ext = os.path.splitext(file)
            if ext.lower() in suspicious_exts:
                checks['suspicious_extensions'].append(os.path.join(root, file))
                
            if file.lower() in ['.env', 'config.properties']:
                checks['exposed_config_files'].append(os.path.join(root, file))
                
    return checks

@app.route('/api/analyze-zip', methods=['POST'])
def analyze_zip():
    if 'file' not in request.files:
        return jsonify({'error': 'No se proporcionó archivo'}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Nombre de archivo inválido'}), 400
        
    if not allowed_file(file.filename):
        return jsonify({'error': 'Tipo de archivo no permitido'}), 400

    try:
        # Guardar temporalmente el ZIP
        zip_filename = secure_filename(file.filename)
        zip_path = os.path.join(app.config['UPLOAD_FOLDER'], zip_filename)
        file.save(zip_path)
        
        # Procesar el archivo
        json_report, text_report = analyze_uploaded_project(zip_path)
        
        # Guardar informe de texto
        report_filename = f"report_{os.path.splitext(zip_filename)[0]}.txt"
        report_path = os.path.join(app.config['UPLOAD_FOLDER'], report_filename)
        with open(report_path, 'w') as f:
            f.write(text_report)
            
        return jsonify({
            'status': 'success',
            'report': json_report,
            'text_report_url': f"/download-report/{report_filename}"
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/download-report/<filename>', methods=['GET'])
def download_report(filename):
    report_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    if not os.path.exists(report_path):
        return jsonify({'error': 'Reporte no encontrado'}), 404
        
    return send_file(
        report_path,
        as_attachment=True,
        download_name=filename,
        mimetype='text/plain'
    )

if __name__ == '__main__':
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.run(debug=True, threaded=True)