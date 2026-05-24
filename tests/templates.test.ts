import { describe, it, expect } from 'vitest';
import { TEMPLATES, getTemplate } from '../src/lib/templates';

describe('Templates', () => {
  it('should have 6 templates', () => {
    expect(TEMPLATES).toHaveLength(6);
  });

  it('should have required fields on every template', () => {
    for (const t of TEMPLATES) {
      expect(t.id).toBeTruthy();
      expect(t.name).toBeTruthy();
      expect(t.nameId).toBeTruthy();
      expect(t.description).toBeTruthy();
      expect(t.descriptionId).toBeTruthy();
      expect(t.icon).toBeTruthy();
      expect(t.promptHint).toBeTruthy();
      expect(Array.isArray(t.fields)).toBe(true);
      expect(t.fields.length).toBeGreaterThan(0);
    }
  });

  it('every field should have key, label, labelId, type, required', () => {
    for (const t of TEMPLATES) {
      for (const f of t.fields) {
        expect(f.key).toBeTruthy();
        expect(f.label).toBeTruthy();
        expect(f.labelId).toBeTruthy();
        expect(['text', 'number', 'date', 'currency']).toContain(f.type);
        expect(typeof f.required).toBe('boolean');
      }
    }
  });

  it('getTemplate should return template by id', () => {
    const invoice = getTemplate('invoice');
    expect(invoice).toBeDefined();
    expect(invoice!.name).toBe('Invoice');
  });

  it('getTemplate should return undefined for unknown id', () => {
    expect(getTemplate('nonexistent')).toBeUndefined();
  });

  it('each template should have at least one required field', () => {
    for (const t of TEMPLATES) {
      const required = t.fields.filter((f) => f.required);
      expect(required.length).toBeGreaterThanOrEqual(1);
    }
  });
});
