// Client-side PDF export helper using html2pdf.js
// Dynamically imports to avoid SSR issues and Node-only modules.

export async function exportElementToPdf(element: HTMLElement, filename: string) {
  if (typeof window === 'undefined') {
    throw new Error('PDF export is only available in the browser');
  }

  // Use the browser-compatible library 'html2pdf.js'
  const html2pdfModule = await import('html2pdf.js');
  const html2pdf = (html2pdfModule as any).default || (html2pdfModule as any);

  const opt = {
    margin: [24, 24, 24, 24],
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, allowTaint: true, backgroundColor: null },
    jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['css', 'legacy'] },
  };

  // Ensure element is present and has layout
  if (!element) throw new Error('PDF element not found');

  // html2pdf returns a promise when save() is called
  return (html2pdf as any)().set(opt).from(element).save();
}
