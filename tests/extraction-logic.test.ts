import { describe, it, expect } from 'vitest';

// Test the confidence calculation logic extracted from extraction.ts
// We test the logic directly since the function isn't exported

describe('Confidence Calculation Logic', () => {
  // Recreate the logic from calculateConfidence
  function calculateConfidence(
    data: Record<string, unknown>,
    fields: Array<{ key: string; required: boolean }>,
  ): number {
    const requiredFields = fields.filter((f) => f.required);
    const filledRequired = requiredFields.filter(
      (f) => data[f.key] != null && data[f.key] !== '',
    );
    const optionalFields = fields.filter((f) => !f.required);
    const filledOptional = optionalFields.filter(
      (f) => data[f.key] != null && data[f.key] !== '',
    );

    const requiredScore =
      requiredFields.length > 0
        ? (filledRequired.length / requiredFields.length) * 70
        : 70;
    const optionalScore =
      optionalFields.length > 0
        ? (filledOptional.length / optionalFields.length) * 30
        : 30;

    return Math.round(requiredScore + optionalScore);
  }

  it('should return 100 when all fields filled', () => {
    const fields = [
      { key: 'name', required: true },
      { key: 'date', required: true },
      { key: 'notes', required: false },
    ];
    const data = { name: 'Test', date: '2024-01-01', notes: 'Some note' };
    expect(calculateConfidence(data, fields)).toBe(100);
  });

  it('should return 70 when all required but no optional filled', () => {
    const fields = [
      { key: 'name', required: true },
      { key: 'date', required: true },
      { key: 'notes', required: false },
    ];
    const data = { name: 'Test', date: '2024-01-01' };
    expect(calculateConfidence(data, fields)).toBe(70);
  });

  it('should return 30 when no required fields filled (optional default)', () => {
    const fields = [
      { key: 'name', required: true },
      { key: 'date', required: true },
    ];
    // No optional fields → optionalScore defaults to 30
    expect(calculateConfidence({}, fields)).toBe(30);
  });

  it('should handle all-optional fields', () => {
    const fields = [
      { key: 'a', required: false },
      { key: 'b', required: false },
    ];
    const data = { a: 'x' };
    expect(calculateConfidence(data, fields)).toBe(85); // 70 (no required) + 15 (half optional)
  });

  it('should handle null and empty string as unfilled', () => {
    const fields = [{ key: 'name', required: true }];
    // No optional fields → optionalScore defaults to 30
    expect(calculateConfidence({ name: null }, fields)).toBe(30);
    expect(calculateConfidence({ name: '' }, fields)).toBe(30);
    expect(calculateConfidence({ name: 'value' }, fields)).toBe(100);
  });
});

describe('JSON Parsing from LLM Response', () => {
  // Recreate the JSON extraction logic from extractStructuredData
  function parseLLMJson(content: string): Record<string, unknown> {
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [
      null,
      content,
    ];
    const jsonStr = jsonMatch[1]?.trim() || content.trim();

    try {
      return JSON.parse(jsonStr);
    } catch {
      const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        return JSON.parse(objectMatch[0]);
      }
      return { _error: 'Gagal parse response AI', _raw: content };
    }
  }

  it('should parse plain JSON', () => {
    const result = parseLLMJson('{"name": "Test", "date": "2024-01-01"}');
    expect(result.name).toBe('Test');
    expect(result.date).toBe('2024-01-01');
  });

  it('should parse JSON wrapped in code block', () => {
    const input = '```json\n{"name": "Test"}\n```';
    const result = parseLLMJson(input);
    expect(result.name).toBe('Test');
  });

  it('should parse JSON wrapped in code block without language tag', () => {
    const input = '```\n{"name": "Test"}\n```';
    const result = parseLLMJson(input);
    expect(result.name).toBe('Test');
  });

  it('should extract JSON from surrounding text', () => {
    const input = 'Here is the extracted data: {"name": "Test"} done.';
    const result = parseLLMJson(input);
    expect(result.name).toBe('Test');
  });

  it('should return error object for unparseable content', () => {
    const result = parseLLMJson('this is not json at all');
    expect(result._error).toBe('Gagal parse response AI');
  });
});
