import { stringify } from 'csv-stringify';
import fs from 'fs';
import { logger } from './logger';
import { FlattenedData } from './parser';

export class CSVWriter {
  async write(data: Map<string, FlattenedData>[], outputPath: string): Promise<void> {
    try {
      // Get all unique headers from all objects and sort by their original order
      const headers = Array.from(
        new Set(
          data.reduce((acc: string[], obj) => {
            return [...acc, ...Array.from(obj.keys())];
          }, [])
        )
      ).sort((a, b) => {
        const firstMap = data.find(map => map.has(a));
        const secondMap = data.find(map => map.has(b));
        
        if (!firstMap || !secondMap) return 0;
        
        return (firstMap.get(a)?.order ?? 0) - (secondMap.get(b)?.order ?? 0);
      });

      const stringifier = stringify({
        header: true,
        columns: headers
      });

      const writeStream = fs.createWriteStream(outputPath);

      // Write the data
      for (const row of data) {
        const rowData: Record<string, string> = {};
        headers.forEach(header => {
          rowData[header] = row.get(header)?.value ?? '';
        });
        stringifier.write(rowData);
      }

      stringifier.pipe(writeStream);

      return new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
        stringifier.end();
      });
    } catch (error) {
      logger.error('Error writing CSV:', error);
      throw error;
    }
  }
}