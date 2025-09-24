import { useState, useEffect } from 'react';
import { i18nService } from '../services/i18nService';

export function useI18n() {
  const [currentLanguage, setCurrentLanguage] = useState(i18nService.getCurrentLanguage());

  useEffect(() => {
    const handleLanguageChange = (language: string) => {
      setCurrentLanguage(language);
    };

    i18nService.addLanguageListener(handleLanguageChange);

    return () => {
      i18nService.removeLanguageListener(handleLanguageChange);
    };
  }, []);

  const t = (keyPath: string, params?: { [key: string]: string | number }) => {
    return i18nService.t(keyPath, params);
  };

  const changeLanguage = async (languageCode: string) => {
    try {
      await i18nService.changeLanguage(languageCode);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const formatNumber = (number: number) => {
    return i18nService.formatNumber(number);
  };

  const formatDate = (date: Date | string) => {
    return i18nService.formatDate(date);
  };

  const formatRelativeTime = (date: Date | string) => {
    return i18nService.formatRelativeTime(date);
  };

  return {
    t,
    currentLanguage,
    changeLanguage,
    formatNumber,
    formatDate,
    formatRelativeTime,
    supportedLanguages: i18nService.getSupportedLanguages(),
  };
}