const { PDFParse } = require('pdf-parse');

async function testFetch() {
    try {
        const url = 'https://res.cloudinary.com/dtavy8ear/raw/upload/v1776381412/recruit_sphere_uploads/varni_resume_1776381411375.pdf';
        console.log("Fetching url:", url);
        const response = await fetch(url);
        console.log("Response status:", response.status, response.headers.get("content-type"));
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        console.log("Buffer size:", buffer.length);

        const parser = new PDFParse({ data: buffer });
        const result = await parser.getText();
        console.log("Extracted text length:", result.text.length);
        console.log("Text preview:", result.text.substring(0, 100));
        await parser.destroy();
    } catch(e) {
        console.error("Test failed:", e);
    }
}
testFetch();
