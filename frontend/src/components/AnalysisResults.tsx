import React from 'react';
import { FileArchive, Folder, Shield, Download, AlertTriangle } from 'lucide-react';
import type { AnalysisData } from '../types';

const API_URL = 'http://localhost:5000';

interface AnalysisResultsProps {
  analysis: AnalysisData;
}

export default function AnalysisResults({ analysis }: AnalysisResultsProps) {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center">
        <Shield className="w-6 h-6 mr-2 text-indigo-600" />
        Resultados del Análisis
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <StatCard 
            icon={<FileArchive className="w-5 h-5 text-indigo-600" />}
            title="Archivos Totales" 
            value={analysis.report.stats.total_files}
            className="bg-indigo-50 hover:bg-indigo-100"
          />
          <StatCard 
            icon={<Folder className="w-5 h-5 text-purple-600" />}
            title="Directorios" 
            value={analysis.report.stats.total_dirs}
            className="bg-purple-50 hover:bg-purple-100"
          />
        </div>

        <SecurityCheckList securityChecks={analysis.report.security_checks} />
      </div>

      <div className="flex justify-center">
        <a
          href={`${API_URL}/${analysis.text_report_url}`}
          className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors duration-200 shadow-md hover:shadow-lg"
          download
        >
          <Download className="w-5 h-5 mr-2" />
          Descargar Reporte Completo
        </a>
      </div>
    </div>
  );
}

const StatCard = ({ 
  icon, 
  title, 
  value, 
  className 
}: { 
  icon: React.ReactNode;
  title: string; 
  value: number;
  className?: string;
}) => (
  <div className={`rounded-xl p-6 transition-all duration-200 ${className}`}>
    <div className="flex items-center mb-2">
      {icon}
      <div className="ml-3 text-gray-600 font-medium">{title}</div>
    </div>
    <div className="text-3xl font-bold text-gray-800">{value}</div>
  </div>
);

const SecurityCheckList = ({ 
  securityChecks 
}: {
  securityChecks: AnalysisData['report']['security_checks']
}) => (
  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
    <div className="flex items-center mb-4">
      <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
      <h3 className="text-lg font-semibold text-gray-800">Verificaciones de Seguridad</h3>
    </div>
    <ul className="space-y-3">
      {securityChecks.git_repository_found && (
        <li className="flex items-center text-red-600 bg-red-50 p-3 rounded-xl">
          <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
          Repositorio .git expuesto
        </li>
      )}
      {securityChecks.exposed_config_files.map((file, i) => (
        <li 
          key={i} 
          className="flex items-center text-amber-600 bg-amber-50 p-3 rounded-xl"
        >
          <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
          Configuración expuesta: {file}
        </li>
      ))}
      {!securityChecks.git_repository_found && securityChecks.exposed_config_files.length === 0 && (
        <li className="text-green-600 bg-green-50 p-3 rounded-xl flex items-center">
          <Shield className="w-4 h-4 mr-2 flex-shrink-0" />
          No se encontraron problemas de seguridad
        </li>
      )}
    </ul>
  </div>
);