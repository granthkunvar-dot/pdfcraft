import { StandardFonts } from "pdf-lib";

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
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  detectedFontName?: string;
  
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
  canvasWidth: number;
  canvasHeight: number;
}

export type PageEdit = BoxEdit | PathEdit;

export function getStandardFont(fontFamily: string, bold: boolean, italic: boolean) {
  if (fontFamily.includes('Times') || fontFamily.includes('serif')) {
    if (bold && italic) return StandardFonts.TimesRomanBoldItalic;
    if (bold) return StandardFonts.TimesRomanBold;
    if (italic) return StandardFonts.TimesRomanItalic;
    return StandardFonts.TimesRoman;
  }
  if (fontFamily.includes('Courier') || fontFamily.includes('mono')) {
    if (bold && italic) return StandardFonts.CourierBoldOblique;
    if (bold) return StandardFonts.CourierBold;
    if (italic) return StandardFonts.CourierOblique;
    return StandardFonts.Courier;
  }
  if (bold && italic) return StandardFonts.HelveticaBoldOblique;
  if (bold) return StandardFonts.HelveticaBold;
  if (italic) return StandardFonts.HelveticaOblique;
  return StandardFonts.Helvetica;
}

export function mapPdfFontToCSS(rawFontName: string): string {
  const lower = rawFontName.toLowerCase();
  if (lower.includes('helvetica') || lower.includes('arial')) return 'Helvetica, Arial, sans-serif';
  if (lower.includes('times') || lower.includes('serif')) return 'Times New Roman, serif';
  if (lower.includes('courier') || lower.includes('mono')) return 'Courier New, monospace';
  if (lower.includes('georgia')) return 'Georgia, serif';
  if (lower.includes('verdana')) return 'Verdana, sans-serif';
  if (lower.includes('bold')) return 'Helvetica, Arial, sans-serif'; 
  return 'Helvetica, Arial, sans-serif';
}
