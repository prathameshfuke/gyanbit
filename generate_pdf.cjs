const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generatePDF() {
    console.log('--- GYANBIT ENGINEERING MANUAL GENERATOR v3.0 ---');
    
    let browser;
    try {
        console.log('Launching browser (Headless)...');
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-web-security',
                '--allow-file-access-from-files'
            ]
        });
        
        const page = await browser.newPage();
        
        // Absolute file path
        const htmlPath = 'file://' + path.resolve(__dirname, 'user_manual.html');
        console.log(`Loading manual from: ${htmlPath}`);
        
        await page.goto(htmlPath, {
            waitUntil: 'networkidle0',
            timeout: 60000
        });

        // Add a slight delay for fonts and complex CSS scanlines to settle
        console.log('Waiting for assets to settle...');
        await new Promise(r => setTimeout(r, 2000));

        console.log('Generating PDF (Strict A4)...');
        const outputPath = path.resolve(__dirname, 'GyanBit_User_Manual.pdf');
        
        await page.pdf({
            path: outputPath,
            format: 'A4',
            printBackground: true,
            displayHeaderFooter: false,
            preferCSSPageSize: true, // Crucial for A4 strictness
            margin: {
                top: '0px',
                right: '0px',
                bottom: '0px',
                left: '0px'
            }
        });

        console.log(`\nSUCCESS!`);
        console.log(`-------------------------------------------`);
        console.log(`PDF: ${outputPath}`);
        
        const stats = fs.statSync(outputPath);
        console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`-------------------------------------------`);

    } catch (error) {
        console.error('ERROR GENERATING PDF:', error);
        process.exit(1);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

generatePDF();
