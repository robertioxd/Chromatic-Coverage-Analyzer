export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface ColorCluster {
  color: RGB;
  hex: string;
  count: number;
  percentage: number;
}

export interface AnalysisResult {
  clusters: ColorCluster[];
  totalPixels: number;
  processingTime: number;
}

export enum AnalysisState {
  IDLE = 'IDLE',
  LOADING_IMAGE = 'LOADING_IMAGE',
  PROCESSING = 'PROCESSING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}