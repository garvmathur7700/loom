interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}

export default function LanguageSelector({ currentLanguage, onLanguageChange }: LanguageSelectorProps) {
  const languages = [
    'javascript', 'typescript', 'python', 'java', 'cpp', 'csharp', 
    'html', 'css', 'json', 'markdown', 'sql'
  ];

  return (
    <select value={currentLanguage} onChange={(e) => onLanguageChange(e.target.value)}>
      {languages.map(lang => (
        <option key={lang} value={lang}>{lang.toUpperCase()}</option>
      ))}
    </select>
  );
}