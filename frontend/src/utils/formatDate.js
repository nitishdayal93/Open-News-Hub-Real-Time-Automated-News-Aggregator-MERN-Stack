export const formatRelativeTime = (dateString, lang = 'en') => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  // Localization strings
  const locales = {
    en: { just_now: 'just now', mins: 'm ago', hrs: 'h ago', days: 'd ago' },
    es: { just_now: 'hace un momento', mins: 'm atrás', hrs: 'h atrás', days: 'd atrás' },
    hi: { just_now: 'अभी-अभी', mins: 'मिनट पहले', hrs: 'घंटे पहले', days: 'दिन पहले' },
    fr: { just_now: 'à l\'instant', mins: 'm ago', hrs: 'h ago', days: 'j ago' }
  };

  const l = locales[lang] || locales.en;

  if (diffSec < 60) return l.just_now;
  if (diffMin < 60) return `${diffMin}${lang === 'hi' ? ' ' : ''}${l.mins}`;
  if (diffHr < 24) return `${diffHr}${lang === 'hi' ? ' ' : ''}${l.hrs}`;
  return `${diffDay}${lang === 'hi' ? ' ' : ''}${l.days}`;
};

export const formatFullDate = (dateString, lang = 'en') => {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  try {
    return date.toLocaleDateString(lang, options);
  } catch (e) {
    return date.toLocaleDateString('en-US', options);
  }
};
