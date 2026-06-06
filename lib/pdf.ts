// Client-side PDF export helper using html2pdf.js
// Dynamically imports to avoid SSR issues and Node-only modules.

type Html2PdfInstance = {
  set: (opt: Html2PdfOptions) => Html2PdfInstance;
  from: (element: HTMLElement) => Html2PdfInstance;
  save: () => Promise<void>;
};

type Html2PdfFactory = () => Html2PdfInstance;

interface Html2PdfOptions {
  margin?: number | [number, number, number, number];
  filename: string;
  image?: { type: 'jpeg' | 'png'; quality?: number };
  html2canvas?: { scale?: number; useCORS?: boolean; allowTaint?: boolean; backgroundColor?: string | null };
  jsPDF?: { unit?: 'pt' | 'mm' | 'cm' | 'in'; format?: 'a4' | string | [number, number]; orientation?: 'portrait' | 'landscape' };
  pagebreak?: { mode?: Array<'css' | 'legacy' | 'avoid-all'> };
}

export async function exportElementToPdf(element: HTMLElement, filename: string) {
  if (typeof window === 'undefined') {
    throw new Error('PDF export is only available in the browser');
  }

  // Use the browser-compatible library 'html2pdf.js'
  const html2pdfModule = await import('html2pdf.js');
  const html2pdfCandidate = (html2pdfModule as { default?: unknown }).default ?? html2pdfModule;
  const html2pdf = html2pdfCandidate as Html2PdfFactory;

  const opt: Html2PdfOptions = {
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
  const instance = html2pdf();
  return instance.set(opt).from(element).save();
}
