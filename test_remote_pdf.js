const { PDFParse } = require('pdf-parse');

async function testRemotePDF() {
    let parser;
    try {
        console.log("Fetching Remote PDF...");
        const response = await fetch("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf");
        
        console.log("Response status:", response.status, response.headers.get("content-type"));
        
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        console.log("Buffer created. Length:", buffer.length);
        
        parser = new PDFParse({ data: buffer });
        const result = await parser.getText();
        console.log("Extracted text length:", result.text.length);
        console.log("Start text:", result.text.substring(0, 50));
    } catch (e) {
        console.error("Test failed:", e);
    } finally {
        if(parser) await parser.destroy();
    }
}

testRemotePDF();
