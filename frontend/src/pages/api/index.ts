// app/services/api.ts
import { AnalysisData } from '../../types/index'
export const analyzeZipFile = async (file: File): Promise<AnalysisData> => {
    const formData = new FormData()
    formData.append('file', file)
  
    const response = await fetch('http://localhost:5000/api/analyze-zip', {
      method: 'POST',
      body: formData,
    })
  
    if (!response.ok) {
      const error = await response.text()
      throw new Error(error)
    }
  
    return response.json()
  }