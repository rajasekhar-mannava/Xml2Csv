import { parseString } from 'xml2js';
import { logger } from './logger';

export interface FlattenedData {
  value: string;
  order: number;
}

export class XMLParser {
  private orderCounter = 0;

  private flattenObject(obj: any, prefix = ''): Map<string, FlattenedData> {
    const flattened = new Map<string, FlattenedData>();

    const flatten = (current: any, prop: string = '') => {
      if (Array.isArray(current)) {
        current.forEach((item, index) => {
          flatten(item, `${prop}[${index}]`);
        });
      } else if (typeof current === 'object' && current !== null) {
        for (const key in current) {
          if (current[key] !== undefined && current[key] !== null) {
            const newProp = key;
            flatten(current[key], newProp);
          }
        }
      } else {
        const value = current === '' ? '' : String(current);
        flattened.set(prop, { value, order: this.orderCounter++ });
      }
    };

    flatten(obj, prefix);
    return flattened;
  }

  async parse(xmlContent: string): Promise<Map<string, FlattenedData>[]> {
    try {
      return new Promise((resolve, reject) => {
        parseString(xmlContent, {
          trim: true,
          explicitArray: false,
          mergeAttrs: true,
          preserveChildrenOrder: true
        }, (err, result) => {
          if (err) {
            logger.error('Error parsing XML:', err);
            reject(err);
            return;
          }

          try {
            this.orderCounter = 0;
            const dataArray = Array.isArray(result) ? result : [result];
            const flattenedData = dataArray.map(item => this.flattenObject(item));
            resolve(flattenedData);
          } catch (error) {
            logger.error('Error flattening XML data:', error);
            reject(error);
          }
        });
      });
    } catch (error) {
      logger.error('Error in XML parsing:', error);
      throw error;
    }
  }
}