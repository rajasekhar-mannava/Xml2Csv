import { XMLParser } from './parser';
import { CSVWriter } from './writer';
import { logger } from './logger';
import fs from 'fs';
import path from 'path';

async function main() {
  try {
    const inputFile = process.argv[2];
    if (!inputFile) {
      throw new Error('Please provide an input XML file path');
    }

    const outputFile = process.argv[3] || 'output.csv';

    logger.info(`Processing XML file: ${inputFile}`);
    const xmlContent = fs.readFileSync(inputFile, 'utf-8');

    const parser = new XMLParser();
    const flattenedData = await parser.parse(xmlContent);

    const writer = new CSVWriter();
    await writer.write(flattenedData, outputFile);

    logger.info(`Successfully converted XML to CSV: ${outputFile}`);
  } catch (error) {
    logger.error('Error processing XML file:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}