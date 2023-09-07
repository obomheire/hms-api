import * as htmlToText from 'html-to-text';
import PDFKit from 'pdfkit';


// export const generatePdf = async (content: any): Promise<Buffer> => {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();

//   await page.setContent(content);
//   const pdf = await page.pdf({ format: 'A4' });
//   await browser.close();
//   return pdf;
// };

export const generatePdf = async (html: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const pdfDoc = new PDFKit();
    const chunks = [];
    pdfDoc.on('data', (chunk) => chunks.push(chunk));
    pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));

    pdfDoc.on('error', (err) => reject(err));

    pdfDoc.font('Helvetica').fontSize(12);
    const text = htmlToText.fromString(html, {
      wordwrap: 130
  });
    pdfDoc.text(text);
    pdfDoc.end();
  });
}
