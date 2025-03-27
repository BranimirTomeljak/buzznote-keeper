
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { t, setLanguage, getLanguage } from '@/utils/translations';
import { Language } from '@/types';

const LanguageSelector: React.FC = () => {
  const [currentLanguage, setCurrentLanguage] = React.useState<Language>(getLanguage());

  const handleLanguageChange = (language: Language) => {
    setLanguage(language);
    setCurrentLanguage(language);
    window.location.reload(); // Refresh to apply translations
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label={t('language')}>
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleLanguageChange('hr')}
          className={currentLanguage === 'hr' ? 'bg-accent' : ''}
        >
          {t('languageHr')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLanguageChange('en')}
          className={currentLanguage === 'en' ? 'bg-accent' : ''}
        >
          {t('languageEn')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
