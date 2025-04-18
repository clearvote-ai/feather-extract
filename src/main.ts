import Tesseract, { createWorker, ImageLike } from 'tesseract.js';
import { pdfToPng } from 'pdf-to-png-converter';

export interface PDFPage extends Tesseract.Page {
  width: number;
  height: number;
  pageNumber: number;
}

export async function extractBlocksFromPDF(pdfPath : string, pagesToProcess?: number[]) : Promise<PDFPage[]> 
{
  const pngPages = await pdfToPng(pdfPath, { // The function accepts PDF file path or a Buffer
    disableFontFace: true, // When `false`, fonts will be rendered using a built-in font renderer that constructs the glyphs with primitive path commands. Default value is true.
    useSystemFonts: false, // When `true`, fonts that aren't embedded in the PDF document will fallback to a system font. Default value is false. 
    viewportScale: 2.0, // The desired scale of PNG viewport. Default value is 1.0 which means to display page on the existing canvas with 100% scale.
    pagesToProcess: pagesToProcess, // Subset of pages to convert (first page = 1), other pages will be skipped if specified.
    strictPagesToProcess: false, // When `true`, will throw an error if specified page number in pagesToProcess is invalid, otherwise will skip invalid page. Default value is false.
    verbosityLevel: 0, // Verbosity level. ERRORS: 0, WARNINGS: 1, I NFOS: 5. Default value is 0.
  });

  const worker = await createWorker('eng', Tesseract.OEM.TESSERACT_LSTM_COMBINED, {},{});

  worker.setParameters({
    tessedit_pageseg_mode: Tesseract.PSM.AUTO_OSD,
    preserve_interword_spaces: "0",
  });

  const pageBlocks : PDFPage[] = [];
  for (let i = 0; i < pngPages.length; i++) {
    console.log(`Processing page ${i + 1} of ${pngPages.length}`);
    const image = pngPages[i].content;
    console.log(pngPages[i].width, pngPages[i].height);
    const { data } = await worker.recognize(image, {
    }, {
      blocks: true,
    });

    //data.width = pngPages[i].width;
    //data.height = pngPages[i].height;

    pageBlocks.push({
      ...data,
      width: pngPages[i].width,
      height: pngPages[i].height,
      pageNumber: pngPages[i].pageNumber,
    } as PDFPage);
  }

  await worker.terminate();

  return pageBlocks;

}

export function extractParagraphsFromPage(page: PDFPage): string {
  const blocks = page.blocks;
  if(!blocks) {
    throw new Error("No blocks found in the page");
  }

  const CONFIDENCE_THRESHOLD = 50;

  const paragraphs = blocks.flatMap((block) => block.paragraphs).filter((paragraph) => {
    //filter out the paragraphs that are low confidence
    paragraph.confidence = paragraph.confidence || 0;
    return paragraph.confidence > CONFIDENCE_THRESHOLD;
  });

  return paragraphs.map((p) => p.text).join('\n');
}

export function extractFullTextFromPDF(pdf: PDFPage[]) : string[]
{
  return pdf.map((page) => {
    const full_text = extractParagraphsFromPage(page);
    return full_text;
  });
}