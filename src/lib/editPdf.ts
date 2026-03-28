export type EditTool = 'select' | 'text' | 'highlight' | 'draw' | 'image' | 'shape' | 'find';

export interface BaseEdit {
  id: string;
  pageIndex: number;
}

export interface BoxEdit extends BaseEdit {
  type: 'text' | 'image' | 'highlight' | 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  
  // Text specific
  text?: string;
  fontSize?: number;
  colorHex?: string;
  fontFamily?: string;
  
  // Image specific
  dataUrl?: string;
  
  // Shape specific
  shapeType?: 'rect' | 'line';
  strokeWidth?: number;
  strokeColor?: string;
  fillColor?: string;
}

export interface PathEdit extends BaseEdit {
  type: 'draw';
  points: { x: number; y: number }[];
  strokeWidth: number;
  colorHex: string;
  canvasWidth: number;   // To scale points properly
  canvasHeight: number;  // To scale points properly
}

export type PageEdit = BoxEdit | PathEdit;
