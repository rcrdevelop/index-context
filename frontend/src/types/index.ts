// app/types/index.ts
export interface AnalysisData {
    report: {
      stats: {
        total_files: number
        total_dirs: number
      }
      security_checks: {
        git_repository_found: boolean
        exposed_config_files: string[]
      }
    }
    text_report_url: string
  }