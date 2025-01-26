import React, { useState } from 'react';
import AnalysisResults from './AnalysisResults';
import UploadForm from './UploadForm';
import ErrorMessage from './ErrorMessage';
import { FileText } from 'lucide-react';
import type { AnalysisData } from '../types';

const API_URL = 'http://localhost:5000';

export default function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (selectedFile: File) => {
    if (selectedFile?.type === 'application/zip' || selectedFile?.name.endsWith('.zip')) {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Por favor, sube un archivo ZIP válido');
      setFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/api/analyze-zip`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al analizar el archivo');
      }

      const data = await response.json();
      setAnalysis(data);
      setError('');
    } catch (err: any) {
      setError(`Error al analizar el archivo: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <UploadForm
        onSubmit={handleSubmit}
        onFileChange={handleFileChange}
        loading={loading}
        fileSelected={!!file}
      />

      {file && !analysis && (
        <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-indigo-600 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-indigo-900">Archivo seleccionado</h3>
              <p className="text-sm text-indigo-700">{file.name}</p>
            </div>
          </div>
        </div>
      )}

      <ErrorMessage message={error} />

      {analysis && <AnalysisResults analysis={analysis} />}
    </div>
  );
}