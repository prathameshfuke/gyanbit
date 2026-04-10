/**
 * GyanBit User Manual PDF Generator
 * Converts user_manual.html to PDF using Puppeteer
 */

import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const HTML_PATH = join(__dirname, 'user_manual.html');
const PDF_PATH = join(__dirname, 'GyanBit_User_Manual.pdf');

async function generatePDF() {
  console.log('🚀 Launching browser...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Load the HTML file
    const fileUrl = 'file:///' + HTML_PATH.replace(/\\/g, '/');
    console.log(`📄 Loading HTML from: ${fileUrl}`);

    await page.goto(fileUrl, {
      waitUntil: 'networkidle0',
      timeout: 60000
    });

    // Wait for fonts and styles to load
    console.log('⏳ Waiting for fonts to load...');
    await page.waitForTimeout(3000);

    // Generate PDF
    console.log('📑 Generating PDF...');
    await page.pdf({
      path: PDF_PATH,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm'
      },
      preferCSSPageSize: true
    });

    console.log('✅ PDF generated successfully!');
    console.log(`📁 Saved to: ${PDF_PATH}`);

  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Run the generator
generatePDF();
