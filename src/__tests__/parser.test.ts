import { XMLParser } from '../parser';
import fs from 'fs';
import path from 'path';

describe('XMLParser', () => {
  let parser: XMLParser;

  beforeEach(() => {
    parser = new XMLParser();
  });

  test('should parse simple XML correctly and maintain order', async () => {
    const xml = `
      <?xml version="1.0" encoding="utf-8"?>
      <root>
        <first>1</first>
        <second>2</second>
        <third>3</third>
      </root>
    `;

    const result = await parser.parse(xml);
    const firstEntry = result[0];
    
    // Convert Map entries to array for easier testing
    const entries = Array.from(firstEntry.entries());
    
    // Check values
    expect(entries[0][0]).toBe('first');
    expect(entries[0][1].value).toBe('1');
    expect(entries[1][0]).toBe('second');
    expect(entries[1][1].value).toBe('2');
    expect(entries[2][0]).toBe('third');
    expect(entries[2][1].value).toBe('3');
    
    // Check order
    expect(entries[0][1].order).toBeLessThan(entries[1][1].order);
    expect(entries[1][1].order).toBeLessThan(entries[2][1].order);
  });

  test('should handle nested elements and maintain hierarchy', async () => {
    const xml = `
      <?xml version="1.0" encoding="utf-8"?>
      <root>
        <person>
          <name>John</name>
          <address>
            <street>123 Main St</street>
            <city>Boston</city>
          </address>
        </person>
      </root>
    `;

    const result = await parser.parse(xml);
    const data = result[0];
    
    const entries = Array.from(data.entries());
    expect(entries.find(e => e[0] === 'person.name')?.[1].value).toBe('John');
    expect(entries.find(e => e[0] === 'person.address.street')?.[1].value).toBe('123 Main St');
    expect(entries.find(e => e[0] === 'person.address.city')?.[1].value).toBe('Boston');
  });

  test('should handle empty elements', async () => {
    const xml = `
      <?xml version="1.0" encoding="utf-8"?>
      <root>
        <name>Test</name>
        <empty></empty>
        <self-closing/>
      </root>
    `;

    const result = await parser.parse(xml);
    const data = result[0];
    
    const entries = Array.from(data.entries());
    expect(entries.find(e => e[0] === 'name')?.[1].value).toBe('Test');
    expect(entries.find(e => e[0] === 'empty')?.[1].value).toBe('');
    expect(entries.find(e => e[0] === 'self-closing')?.[1].value).toBe('');
  });
});