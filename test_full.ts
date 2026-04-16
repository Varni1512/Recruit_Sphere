import fs from 'fs';
import path from 'path';
import { PDFParse } from 'pdf-parse';
import { calculateATSScore } from './src/lib/atsScoring';

async function testFull() {
    let parser;
    try {
        const url = 'https://res.cloudinary.com/dtavy8ear/raw/upload/v1776381412/recruit_sphere_uploads/varni_resume_1776381411375.pdf';
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        parser = new PDFParse({ data: buffer });
        const result = await parser.getText();
        
        const jobDesc = "Full Stack Developer. (Imagine 1858 bytes of job desc).";
        const keywords = [ 'React', 'MongoDB', 'Express', 'Node', 'Next', 'GitHub', 'Tailwind', 'JavaScript', 'MySQL', 'REST', 'IAM', 'EC2', 'HTML', 'CSS' ];
        
        const score = calculateATSScore(result.text, jobDesc, keywords);
        console.log("TEST FINAL ATS SCORE:", score);
    } catch(e) {
        console.error(e);
    } finally {
        if(parser) await parser.destroy();
    }
}
testFull();
