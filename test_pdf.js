const fs = require('fs');
const { PDFParse } = require('pdf-parse');

async function test() {
    let parser;
    try {
        console.log("Fetching sample PDF...");
        const response = await fetch("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf");
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        parser = new PDFParse({ data: buffer });
        const result = await parser.getText();
        console.log("PDF Text length:", result.text.length);
        console.log("First 50 chars:", result.text.substring(0, 50));
    } catch (error) {
        console.error("Parse failed:", error);
    } finally {
        if (parser) {
            await parser.destroy();
        }
    }
}

test();
