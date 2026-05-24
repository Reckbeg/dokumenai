import { describe, it, expect } from 'vitest';
import { TEMPLATE_LABELS, getTemplateDisplay } from '../src/lib/template-labels';

describe('Template Labels', () => {
  it('should have labels for all 6 template types', () => {
    expect(Object.keys(TEMPLATE_LABELS)).toHaveLength(6);
    expect(TEMPLATE_LABELS.invoice).toBeDefined();
    expect(TEMPLATE_LABELS.receipt).toBeDefined();
    expect(TEMPLATE_LABELS.faktur_pajak).toBeDefined();
    expect(TEMPLATE_LABELS.transfer_proof).toBeDefined();
    expect(TEMPLATE_LABELS.purchase_order).toBeDefined();
    expect(TEMPLATE_LABELS.custom).toBeDefined();
  });

  it('every label should have name and icon', () => {
    for (const [key, val] of Object.entries(TEMPLATE_LABELS)) {
      expect(val.name).toBeTruthy();
      expect(val.icon).toBeTruthy();
    }
  });

  it('getTemplateDisplay should return known template', () => {
    const result = getTemplateDisplay('invoice');
    expect(result.name).toBe('Faktur / Invoice');
    expect(result.icon).toBe('🧾');
  });

  it('getTemplateDisplay should fallback for unknown id', () => {
    const result = getTemplateDisplay('unknown_type');
    expect(result.name).toBe('unknown_type');
    expect(result.icon).toBe('📄');
  });
});
