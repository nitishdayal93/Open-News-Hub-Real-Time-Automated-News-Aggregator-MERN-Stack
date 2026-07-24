import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    app_name: 'NewsHub',
    home: 'Home',
    bookmarks: 'Bookmarks',
    history: 'History',
    admin_dashboard: 'Admin',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    profile: 'Profile',
    breaking_news: 'Breaking News',
    trending_news: 'Trending News',
    search_placeholder: 'Search articles using smart query...',
    no_articles: 'No articles found matching filters.',
    load_more: 'Load More Articles',
    read_more: 'Read Full Article',
    ai_summary: 'Summary',
    ai_tags: 'Tags',
    related_articles: 'Related Articles',
    categories: 'Categories',
    sources: 'Sources',
    date: 'Date',
    all: 'All',
    today: 'Today',
    this_week: 'This Week',
    this_month: 'This Month',
    followed_categories: 'Followed Categories',
    follow: 'Follow',
    following: 'Following',
    total_users: 'Total Users',
    total_articles: 'Total Articles',
    total_sources: 'Total Sources',
    feed_health: 'RSS Feeds Health Status',
    refresh_button: 'Manual Sync Feeds',
    error_logs: 'Failed RSS Fetch Logs',
    role: 'Role',
    actions: 'Actions',
    user_management: 'User Management',
    category_management: 'Category Management',
    analytics: 'Analytics',
    liked: 'Liked',
    bookmarked: 'Bookmarked',
    clear_history: 'Clear Reading History',
  },
  es: {
    app_name: 'NewsHub',
    home: 'Inicio',
    bookmarks: 'Marcadores',
    history: 'Historial',
    admin_dashboard: 'Administrador',
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    logout: 'Cerrar Sesión',
    profile: 'Perfil',
    breaking_news: 'Noticias de Última Hora',
    trending_news: 'Noticias de Tendencia',
    search_placeholder: 'Buscar artículos usando consulta inteligente...',
    no_articles: 'No se encontraron artículos que coincidan con los filtros.',
    load_more: 'Cargar más artículos',
    read_more: 'Leer artículo completo',
    ai_summary: 'Resumen',
    ai_tags: 'Etiquetas',
    related_articles: 'Artículos Relacionados',
    categories: 'Categorías',
    sources: 'Fuentes',
    date: 'Fecha',
    all: 'Todo',
    today: 'Hoy',
    this_week: 'Esta Semana',
    this_month: 'Este Mes',
    followed_categories: 'Categorías Seguidas',
    follow: 'Seguir',
    following: 'Siguiendo',
    total_users: 'Usuarios Totales',
    total_articles: 'Artículos Totales',
    total_sources: 'Fuentes Totales',
    feed_health: 'Estado de Salud de RSS',
    refresh_button: 'Sincronizar Fuentes Manualmente',
    error_logs: 'Registros de Errores de RSS',
    role: 'Rol',
    actions: 'Acciones',
    user_management: 'Gestión de Usuarios',
    category_management: 'Gestión de Categorías',
    analytics: 'Analítica',
    liked: 'Me gusta',
    bookmarked: 'Guardado',
    clear_history: 'Limpiar Historial de Lectura',
  },
  hi: {
    app_name: 'न्यूज़हब',
    home: 'होम',
    bookmarks: 'बुकमार्क',
    history: 'इतिहास',
    admin_dashboard: 'एडमिन',
    login: 'लॉगिन',
    register: 'रजिस्टर',
    logout: 'लॉगआउट',
    profile: 'प्रोफ़ाइल',
    breaking_news: 'ब्रेकिंग न्यूज़',
    trending_news: 'ट्रेंडिंग न्यूज़',
    search_placeholder: 'स्मार्ट खोज का उपयोग करके लेख खोजें...',
    no_articles: 'फिल्टर से मेल खाने वाले कोई लेख नहीं मिले।',
    load_more: 'और लेख लोड करें',
    read_more: 'पूरा लेख पढ़ें',
    ai_summary: 'सारांश',
    ai_tags: 'टैग',
    related_articles: 'संबंधित लेख',
    categories: 'श्रेणियां',
    sources: 'स्रोत',
    date: 'तिथि',
    all: 'सभी',
    today: 'आज',
    this_week: 'इस सप्ताह',
    this_month: 'इस महीने',
    followed_categories: 'फॉलो की गई श्रेणियां',
    follow: 'फॉलो करें',
    following: 'फॉलो कर रहे हैं',
    total_users: 'कुल उपयोगकर्ता',
    total_articles: 'कुल लेख',
    total_sources: 'कुल स्रोत',
    feed_health: 'आरएसएस फीड स्वास्थ्य स्थिति',
    refresh_button: 'मैन्युअल सिंक फीड',
    error_logs: 'विफल आरएसएस फ़ेच लॉग',
    role: 'भूमिका',
    actions: 'कार्रवाई',
    user_management: 'उपयोगकर्ता प्रबंधन',
    category_management: 'श्रेणी प्रबंधन',
    analytics: 'विश्लेषण',
    liked: 'पसंद किया',
    bookmarked: 'बुकमार्क किया',
    clear_history: 'पढ़ने का इतिहास साफ़ करें',
  },
  fr: {
    app_name: 'NewsHub',
    home: 'Accueil',
    bookmarks: 'Signets',
    history: 'Historique',
    admin_dashboard: 'Admin',
    login: 'Connexion',
    register: 'S\'inscrire',
    logout: 'Déconnexion',
    profile: 'Profil',
    breaking_news: 'Dernières Minutes',
    trending_news: 'Actualités Tendances',
    search_placeholder: 'Rechercher des articles via requête intelligente...',
    no_articles: 'Aucun article trouvé pour ces critères.',
    load_more: 'Charger plus d\'articles',
    read_more: 'Lire l\'article complet',
    ai_summary: 'Résumé',
    ai_tags: 'Tags',
    related_articles: 'Articles Similaires',
    categories: 'Catégories',
    sources: 'Sources',
    date: 'Date',
    all: 'Tout',
    today: 'Aujourd\'hui',
    this_week: 'Cette Semaine',
    this_month: 'Ce Mois',
    followed_categories: 'Catégories Suivies',
    follow: 'Suivre',
    following: 'Suivi',
    total_users: 'Total Utilisateurs',
    total_articles: 'Total Articles',
    total_sources: 'Total Sources',
    feed_health: 'Statut de Santé RSS',
    refresh_button: 'Synchroniser Manuellement',
    error_logs: 'Logs d\'échecs de fetch RSS',
    role: 'Rôle',
    actions: 'Actions',
    user_management: 'Gestion des Utilisateurs',
    category_management: 'Gestion des Catégories',
    analytics: 'Analyses',
    liked: 'Aimé',
    bookmarked: 'Enregistré',
    clear_history: 'Effacer l\'historique',
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const changeLanguage = (newLang) => {
    if (translations[newLang]) {
      setLang(newLang);
    }
  };

  const t = (key) => {
    return translations[lang][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
