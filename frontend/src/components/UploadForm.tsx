import React, { FormEvent, ChangeEvent } from 'react';
import { Upload, Loader2, Shield } from 'lucide-react';

interface UploadFormProps {
  onSubmit: (e: FormEvent) => void;
  onFileChange: (file: File) => void;
  loading: boolean;
  fileSelected: boolean;
}

export default function UploadForm({
  onSubmit,
  onFileChange,
  loading,
  fileSelected
}: UploadFormProps) {
  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileChange(file);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex flex-col items-center justify-center w-full">
        <label
          htmlFor="file-upload"
          className={`
            w-full max-w-2xl h-32 px-4 transition-colors duration-200
            border-2 border-dashed rounded-xl
            flex items-center justify-center
            cursor-pointer
            ${fileSelected 
              ? 'border-indigo-600 bg-indigo-50 hover:bg-indigo-100' 
              : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
            }
          `}
        >
          <div className="space-y-2 text-center">
            <Upload className={`
              mx-auto h-8 w-8
              ${fileSelected ? 'text-indigo-600' : 'text-gray-400'}
            `} />
            <div className="text-sm text-gray-600 text-center">
              {fileSelected ? (
                <span className="text-indigo-600 font-medium">
                  Archivo ZIP seleccionado
                </span>
              ) : (
                <>
                  <span className="font-medium text-indigo-600 hover:text-indigo-700">
                    Haz clic para seleccionar
                  </span>
                  {' '}o arrastra y suelta
                </>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Solo archivos ZIP
            </p>
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileInputChange}
            accept=".zip"
            disabled={loading}
          />
        </label>
      </div>
        
      <div className="flex justify-center">
        <button
          type="submit"
          className={`
            inline-flex items-center px-6 py-3 rounded-xl
            font-medium text-white
            transition-all duration-200
            ${loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : fileSelected 
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg' 
                : 'bg-gray-400 cursor-not-allowed'
            }
          `}
          disabled={!fileSelected || loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Analizando...
            </>
          ) : (
            <>
              <Shield className="w-5 h-5 mr-2" />
              Analizar Proyecto
            </>
          )}
        </button>
      </div>
    </form>
  );
}