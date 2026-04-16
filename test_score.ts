import fs from 'fs';
import path from 'path';
import { PDFParse } from 'pdf-parse';
import { calculateATSScore } from './src/lib/atsScoring';

async function test() {
    let parser;
    try {
        const filePath = path.join(process.cwd(), 'public', 'uploads', 'varni_resume_1774935346423.pdf');
        console.log("Reading file:", filePath);
        const buffer = fs.readFileSync(filePath);
        
        parser = new PDFParse({ data: buffer });
        const result = await parser.getText();
        
        const jobDesc = "We are looking for a Full Stack Developer with experience in React, Node.js, and TypeScript.";
        const keywords = ["react", "node", "typescript"];
        
        const score = calculateATSScore(result.text, jobDesc, keywords);
        console.log("Calculated Score:", score);

    } catch (e) {
        console.error("Error:", e);
    } finally {
        if(parser) await parser.destroy();
    }
}
test();
