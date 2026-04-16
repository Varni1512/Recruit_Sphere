const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

async function test() {
    let parser;
    try {
        const filePath = path.join(process.cwd(), 'public', 'uploads', 'varni_resume_1774935346423.pdf');
        console.log("Reading file:", filePath);
        const buffer = fs.readFileSync(filePath);
        
        parser = new PDFParse({ data: buffer });
        const result = await parser.getText();
        console.log("Extracted text length:", result.text.length);
        console.log("Extracted Text Start:", result.text.substring(0, 100));
    } catch (e) {
        console.error("Error:", e);
    } finally {
        if(parser) await parser.destroy();
    }
}
test();
