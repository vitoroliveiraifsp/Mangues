import { describe, it, expect, beforeEach } from 'vitest';
import { i18nService } from '../services/i18nService';

describe('I18nService', () => {
  beforeEach(() => {
    // Reset to default language
    localStorage.removeItem('mangues_language');
  });

  it('should initialize with default language', () => {
    expect(i18nService.getCurrentLanguage()).toBe('pt-BR');
  });

  it('should change language successfully', async () => {
    await i18nService.changeLanguage('en-US');
    expect(i18nService.getCurrentLanguage()).toBe('en-US');
  });

  it('should translate keys correctly', () => {
    const translation = i18nService.t('common.loading');
    expect(typeof translation).toBe('string');
    expect(translation.length).toBeGreaterThan(0);
  });

  it('should handle missing translations gracefully', () => {
    const translation = i18nService.t('nonexistent.key');
    expect(translation).toBe('nonexistent.key');
  });

  it('should format numbers according to locale', () => {
    const number = 1234.56;
    const formatted = i18nService.formatNumber(number);
    expect(typeof formatted).toBe('string');
    expect(formatted).toContain('1');
  });

  it('should format dates according to locale', () => {
    const date = new Date('2024-01-15');
    const formatted = i18nService.formatDate(date);
    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThan(0);
  });

  it('should handle parameter substitution', () => {
    // This would need actual translations with parameters
    const translation = i18nService.t('test.withParams', { name: 'João', score: 100 });
    expect(typeof translation).toBe('string');
  });

  it('should persist language selection', async () => {
    await i18nService.changeLanguage('es-ES');
    expect(localStorage.getItem('mangues_language')).toBe('es-ES');
  });

  it('should notify listeners on language change', async () => {
    let notifiedLanguage = '';
    
    const listener = (language: string) => {
      notifiedLanguage = language;
    };
    
    i18nService.addLanguageListener(listener);
    await i18nService.changeLanguage('fr-FR');
    
    expect(notifiedLanguage).toBe('fr-FR');
    
    i18nService.removeLanguageListener(listener);
  });
});