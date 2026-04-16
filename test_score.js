const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');
const { calculateATSScore } = require('./src/lib/atsScoring.ts'); // Need ts-node or just rewrite to js

