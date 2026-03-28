export const isValidPDF = (buffer: ArrayBuffer) => {
  const uint8Array = new Uint8Array(buffer);
  return uint8Array.length > 5 && 
         uint8Array[0] === 0x25 && // %
         uint8Array[1] === 0x50 && // P
         uint8Array[2] === 0x44 && // D
         uint8Array[3] === 0x46 && // F
         uint8Array[4] === 0x2d;   // -
};

export const downloadBlob = (data: Uint8Array, filename: string, type = "application/pdf") => {
  const blob = new Blob([data.buffer as ArrayBuffer], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
