import React from 'react';
import FileUploader from '../components/FileUploader';
import { FileText } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <FileText className="w-12 h-12 text-indigo-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Analizador de Proyectos ZIP
          </h1>
          <p className="text-gray-600">
            Analiza la estructura y seguridad de tus proyectos en formato ZIP
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <FileUploader />
        </div>
      </div>
    </div>
  </div>
  );
}