// ==UserScript==
// @name         Google Movies/Series → Watch on Stremio + Fullscreen Mobile Modal (عربي)
// @namespace    https://stremio.com
// @version      9.1
// @description  Perfect Stremio launcher with fullscreen mobile modal and Arabic support | مشغل Stremio مع نافذة كاملة الشاشة
// @author       You
// @match        https://www.google.com/*
// @match        https://www.google.*/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_notification
// @grant        GM_xmlhttpRequest
// ==/UserScript==
(function () {
  'use strict';

  /* =====================
     CONFIG WITH ARABIC SUPPORT
     ===================== */
  const DEFAULT_CONFIG = {
    theme: 'dark-liquid-glass',
    language: 'en', // 'auto', 'en', 'ar'
    showIcon: true,
    showSubtext: true,
    animationSpeed: 'premium',
    clickAction: 'direct',
    doubleClickAction: 'new-tab',
    longPressAction: 'context-menu',
    enableHaptics: true,
    enableToasts: false,
    enableMultiPlatform: true,
    enableOMDbAPI: true,
    omdbApiKey: '47bff8ab',
    enableTMDbAPI: true,
    tmdbApiKey: '25f1edc8221255e8beb7a17728fa2c19',
    contextMenuMaxHeight: '680px',
    contextMenuWidth: '420px',
    observerThrottle: 150,
    repositionInterval: 2500,
    toastTime: 2800,
    appOpenTimeout: 12000,
    debugMode: false,
    enableQuickActions: false,
    enableThemeSelector: false,
    enableLanguageSelector: false,
    enablePreview: true
  };

  const CONFIG = { ...DEFAULT_CONFIG };
  Object.keys(DEFAULT_CONFIG).forEach(key => {
    try {
      const saved = GM_getValue ? GM_getValue(key, null) : localStorage.getItem(`stremio_${key}`);
      if (saved !== null) CONFIG[key] = typeof saved === 'string' ? JSON.parse(saved) : saved;
    } catch {}
  });

  // Language detection
  const detectLanguage = () => {
    if (CONFIG.language !== 'auto') return CONFIG.language;

    // Check browser language
    const browserLang = navigator.language || navigator.userLanguage || 'en';
    if (browserLang.startsWith('ar')) return 'ar';

    // Check page content for Arabic
    const pageText = document.body.textContent || '';
    const arabicChars = pageText.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g);
    if (arabicChars && arabicChars.length > 50) return 'ar';

    return 'en';
  };

  const CURRENT_LANG = detectLanguage();
  const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                   (window.innerWidth <= 768 && 'ontouchstart' in window);
  const isRTL = CURRENT_LANG === 'ar';

  const log = (...args) => { if (CONFIG.debugMode) console.debug('[Stremio Fullscreen]', ...args); };

  /* =====================
     ARABIC TRANSLATIONS
     ===================== */
  const TRANSLATIONS = {
    en: {
      // Button
      watchOnStremio: 'Watch on Stremio',
      streamMovie: 'Stream movie',
      streamSeries: 'Stream episodes',
      launching: 'Launching...',

      // Toast messages
      launchingApp: '🚀 Launching Stremio...',
      loadingDetails: '🎬 Loading enhanced details...',
      loadingDetailsMobile: '🎬 Loading details...',
      appLaunched: '✅ Stremio opened successfully!',
      appFailed: '❌ Failed to open Stremio',
      copySuccess: '📋 Copied to clipboard!',
      copyFailed: '❌ Copy failed',
      themeChanged: '🎨 Theme changed to',
      languageChanged: '🌐 Language changed to',
      keyboardShortcut: '⌨️ Keyboard shortcut activated!',
      buttonAdded: '🎬 Stremio button added for',
      openingNewTab: '🔗 Opening Stremio in new window...',
      openingPlatform: '🔗 Opening',
      webFallback: '📱 Opened Stremio Web (app not detected)',
      webFallbackMobile: '📱 Opened Stremio Web',

      // Modal content
      streamingPlatforms: '🚀 Streaming Platforms',
      movieDatabases: '📚 Movie Databases',
      reviewsRatings: '⭐ Reviews & Ratings',
      trackingSocial: '📊 Tracking & Social',

      // Platform descriptions
      streamInstantly: 'Stream instantly',
      movieDatabase: 'Movie database',
      theMovieDB: 'The Movie DB',
      filmDiary: 'Film diary',
      criticScores: 'Critic scores',
      audienceCritics: 'Audience & critics',
      whereToWatch: 'Where to watch',
      trackDiscover: 'Track & discover',
      tvDatabase: 'TV database',

      // Utility actions
      copyImdbId: 'Copy IMDb ID',
      copyStremioLink: 'Copy Stremio Link',
      copyTitle: 'Copy Title',

      // Content types
      movie: 'Movie',
      series: 'TV Series',

      // Theme names
      darkLiquidGlass: 'Dark Liquid Glass',
      cyberNeon: 'Cyber Neon',
      warmSunset: 'Warm Sunset',
      oceanDeep: 'Ocean Deep',
      forestMystique: 'Forest Mystique',

      // Accessibility
      closeDialog: 'Close dialog',
      switchTheme: 'Switch to',
      theme: 'theme',

      // Language
      english: 'English',
      arabic: 'العربية'
    },

    ar: {
      // Button
      watchOnStremio: 'شاهد على Stremio',
      streamMovie: 'شاهد الفيلم',
      streamSeries: 'شاهد المسلسل',
      launching: 'جاري التشغيل...',

      // Toast messages
      launchingApp: '🚀 جاري تشغيل Stremio...',
      loadingDetails: '🎬 جاري تحميل التفاصيل المحسنة...',
      loadingDetailsMobile: '🎬 جاري تحميل التفاصيل...',
      appLaunched: '✅ تم فتح Stremio بنجاح!',
      appFailed: '❌ فشل في فتح Stremio',
      copySuccess: '📋 تم النسخ إلى الحافظة!',
      copyFailed: '❌ فشل النسخ',
      themeChanged: '🎨 تم تغيير المظهر إلى',
      languageChanged: '🌐 تم تغيير اللغة إلى',
      keyboardShortcut: '⌨️ تم تفعيل اختصار لوحة المفاتيح!',
      buttonAdded: '🎬 تم إضافة زر Stremio لـ',
      openingNewTab: '🔗 جاري فتح Stremio في نافذة جديدة...',
      openingPlatform: '🔗 جاري فتح',
      webFallback: '📱 تم فتح Stremio Web (لم يتم اكتشاف التطبيق)',
      webFallbackMobile: '📱 تم فتح Stremio Web',

      // Modal content
      streamingPlatforms: '🚀 منصات البث',
      movieDatabases: '📚 قواعد بيانات الأفلام',
      reviewsRatings: '⭐ المراجعات والتقييمات',
      trackingSocial: '📊 المتابعة والشبكات الاجتماعية',

      // Platform descriptions
      streamInstantly: 'شاهد فوراً',
      movieDatabase: 'قاعدة بيانات الأفلام',
      theMovieDB: 'قاعدة بيانات الأفلام',
      filmDiary: 'مذكرات الأفلام',
      criticScores: 'درجات النقاد',
      audienceCritics: 'الجمهور والنقاد',
      whereToWatch: 'أين تشاهد',
      trackDiscover: 'تابع واكتشف',
      tvDatabase: 'قاعدة بيانات التلفزيون',

      // Utility actions
      copyImdbId: 'انسخ معرف IMDb',
      copyStremioLink: 'انسخ رابط Stremio',
      copyTitle: 'انسخ العنوان',

      // Content types
      movie: 'فيلم',
      series: 'مسلسل تلفزيوني',

      // Theme names
      darkLiquidGlass: 'الزجاج السائل المظلم',
      cyberNeon: 'النيون الإلكتروني',
      warmSunset: 'غروب دافئ',
      oceanDeep: 'أعماق المحيط',
      forestMystique: 'غموض الغابة',

      // Accessibility
      closeDialog: 'إغلاق الحوار',
      switchTheme: 'التبديل إلى',
      theme: 'مظهر',

      // Language
      english: 'English',
      arabic: 'العربية'
    }
  };

  const t = (key) => TRANSLATIONS[CURRENT_LANG][key] || TRANSLATIONS.en[key] || key;

  /* =====================
     THEMES
     ===================== */
  const THEMES = {
    'dark-liquid-glass': {
      name: t('darkLiquidGlass'),
      primary: 'rgba(15, 15, 17, 0.96)',
      secondary: 'rgba(28, 28, 30, 0.92)',
      accent: '#6E56E6',
      accentSecondary: '#8B7AED',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.85)',
      border: 'rgba(255, 255, 255, 0.12)',
      glass: 'rgba(255, 255, 255, 0.08)',
      blur: '28px',
      saturation: '180%',
      gradient: 'linear-gradient(135deg, rgba(110, 86, 230, 0.22), rgba(139, 122, 237, 0.14), rgba(110, 86, 230, 0.08))',
      shadow: '0 6px 24px rgba(110, 86, 230, 0.25), 0 3px 12px rgba(0, 0, 0, 0.15)'
    },
    'cyber-neon': {
      name: t('cyberNeon'),
      primary: 'rgba(5, 5, 15, 0.96)',
      secondary: 'rgba(10, 10, 25, 0.92)',
      accent: '#00FFFF',
      accentSecondary: '#FF0080',
      text: '#ffffff',
      textSecondary: 'rgba(0, 255, 255, 0.8)',
      border: 'rgba(0, 255, 255, 0.25)',
      glass: 'rgba(0, 255, 255, 0.06)',
      blur: '25px',
      saturation: '200%',
      gradient: 'linear-gradient(135deg, rgba(0, 255, 255, 0.18), rgba(255, 0, 128, 0.1), rgba(0, 255, 255, 0.05))',
      shadow: '0 0 16px rgba(0, 255, 255, 0.4), 0 6px 24px rgba(255, 0, 128, 0.25)'
    },
    'warm-sunset': {
      name: t('warmSunset'),
      primary: 'rgba(25, 15, 10, 0.96)',
      secondary: 'rgba(40, 25, 15, 0.92)',
      accent: '#FF6B35',
      accentSecondary: '#FFB347',
      text: '#ffffff',
      textSecondary: 'rgba(255, 180, 120, 0.9)',
      border: 'rgba(255, 107, 53, 0.25)',
      glass: 'rgba(255, 107, 53, 0.08)',
      blur: '28px',
      saturation: '160%',
      gradient: 'linear-gradient(135deg, rgba(255, 107, 53, 0.22), rgba(255, 179, 71, 0.14), rgba(255, 107, 53, 0.08))',
      shadow: '0 6px 24px rgba(255, 107, 53, 0.3), 0 3px 12px rgba(0, 0, 0, 0.15)'
    },
    'ocean-deep': {
      name: t('oceanDeep'),
      primary: 'rgba(5, 20, 35, 0.96)',
      secondary: 'rgba(10, 35, 55, 0.92)',
      accent: '#1E90FF',
      accentSecondary: '#00CED1',
      text: '#ffffff',
      textSecondary: 'rgba(135, 206, 250, 0.9)',
      border: 'rgba(30, 144, 255, 0.25)',
      glass: 'rgba(30, 144, 255, 0.08)',
      blur: '28px',
      saturation: '170%',
      gradient: 'linear-gradient(135deg, rgba(30, 144, 255, 0.22), rgba(0, 206, 209, 0.14), rgba(30, 144, 255, 0.08))',
      shadow: '0 6px 24px rgba(30, 144, 255, 0.3), 0 3px 12px rgba(0, 0, 0, 0.15)'
    },
    'forest-mystique': {
      name: t('forestMystique'),
      primary: 'rgba(10, 25, 15, 0.96)',
      secondary: 'rgba(15, 35, 20, 0.92)',
      accent: '#32CD32',
      accentSecondary: '#98FB98',
      text: '#ffffff',
      textSecondary: 'rgba(152, 251, 152, 0.9)',
      border: 'rgba(50, 205, 50, 0.25)',
      glass: 'rgba(50, 205, 50, 0.08)',
      blur: '28px',
      saturation: '160%',
      gradient: 'linear-gradient(135deg, rgba(50, 205, 50, 0.22), rgba(152, 251, 152, 0.14), rgba(50, 205, 50, 0.08))',
      shadow: '0 6px 24px rgba(50, 205, 50, 0.3), 0 3px 12px rgba(0, 0, 0, 0.15)'
    }
  };

  const CURRENT_THEME = THEMES[CONFIG.theme] || THEMES['dark-liquid-glass'];

  /* =====================
     API SYSTEMS (Same as before - shortened for space)
     ===================== */
  const net = (url) => new Promise((resolve) => {
    if (typeof GM_xmlhttpRequest === 'function') {
      GM_xmlhttpRequest({
        method: 'GET', url, timeout: 10000,
        onload: r => resolve({ ok: true, json: safeJSON(r.responseText) }),
        onerror: () => resolve({ ok: false }),
        ontimeout: () => resolve({ ok: false })
      });
    } else {
      fetch(url, { signal: AbortSignal.timeout(10000) })
        .then(r => r.json()).then(j => resolve({ ok: true, json: j }))
        .catch(() => resolve({ ok: false }));
    }
  });
  const safeJSON = (t) => { try { return JSON.parse(t); } catch { return null; } };

  const omdbAPI = {
    cache: new Map(),
    async getByImdb(imdbId) {
      if (!CONFIG.enableOMDbAPI || !CONFIG.omdbApiKey) return null;
      if (this.cache.has(imdbId)) return this.cache.get(imdbId);
      const url = `https://www.omdbapi.com/?i=${imdbId}&apikey=${CONFIG.omdbApiKey}&plot=short`;
      const { ok, json } = await net(url);
      const data = ok && json && json.Response === 'True' ? json : null;
      if (data) this.cache.set(imdbId, data);
      return data;
    }
  };

  const tmdbAPI = {
    findCache: new Map(), detailsCache: new Map(),
    async findByImdb(imdbId) {
      if (!CONFIG.enableTMDbAPI || !CONFIG.tmdbApiKey) return null;
      if (this.findCache.has(imdbId)) return this.findCache.get(imdbId);
      const url = `https://api.themoviedb.org/3/find/${encodeURIComponent(imdbId)}?api_key=${CONFIG.tmdbApiKey}&external_source=imdb_id`;
      const { ok, json } = await net(url);
      if (!ok || !json) return null;
      const m = (json.movie_results && json.movie_results[0]) || null;
      const tv = (json.tv_results && json.tv_results[0]) || null;
      const res = m ? { type: 'movie', id: m.id, data: m } : tv ? { type: 'tv', id: tv.id, data: tv } : null;
      this.findCache.set(imdbId, res); return res;
    },
    async details(type, id) {
      if (!type || !id) return null; const key = `${type}_${id}`;
      if (this.detailsCache.has(key)) return this.detailsCache.get(key);
      const url = `https://api.themoviedb.org/3/${type}/${id}?api_key=${CONFIG.tmdbApiKey}&language=en-US&append_to_response=credits,videos,similar`;
      const { ok, json } = await net(url); const data = ok && json ? json : null;
      if (data) this.detailsCache.set(key, data); return data;
    },
    img(path, size = 'w500') { return path ? `https://image.tmdb.org/t/p/${size}${path}` : null; }
  };

  const platformUrls = {
    stremio: (imdb, contentType) => `stremio://detail/${contentType}/${imdb}`,
    imdb: (imdb) => `https://www.imdb.com/title/${imdb}/`,
    tmdb: (imdb, contentType, title, tmdbResolved) => {
      if (tmdbResolved && tmdbResolved.id && tmdbResolved.type) {
        return `https://www.themoviedb.org/${tmdbResolved.type === 'tv' ? 'tv' : 'movie'}/${tmdbResolved.id}`;
      }
      const q = encodeURIComponent(title || imdb);
      return `https://www.themoviedb.org/search?query=${q}`;
    },
    letterboxd: (imdb, contentType, title) => contentType === 'movie' ?
      `https://letterboxd.com/imdb/${imdb}/` :
      `https://letterboxd.com/search/${encodeURIComponent(title || imdb)}/`,
    metacritic: (imdb, contentType, title) => {
      const searchTitle = title || imdb;
      const cleaned = searchTitle.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '+');
      return contentType === 'series' ?
        `https://www.metacritic.com/search/?query=${encodeURIComponent(cleaned)}&category=13` :
        `https://www.metacritic.com/search/?query=${encodeURIComponent(cleaned)}&category=2`;
    },
    rottentomatoes: (imdb, _t, title) => `https://www.rottentomatoes.com/search?search=${encodeURIComponent(title || imdb)}`,
    justwatch: (imdb, _t, title) => `https://www.justwatch.com/us/search?q=${encodeURIComponent(title || imdb)}`,
    trakt: (imdb) => `https://trakt.tv/search/imdb/${imdb}`,
    tvdb: (imdb, contentType, title) => contentType === 'series' ? `https://www.thetvdb.com/search?query=${encodeURIComponent(title || imdb)}` : null,
    stremioWebSearch: (titleOrImdb) => `https://web.strem.io/#/search?search=${encodeURIComponent(titleOrImdb)}`
  };

  const platformInfo = {
    stremio: { name: 'Stremio', icon: '🚀', description: t('streamInstantly') },
    imdb: { name: 'IMDb', icon: '🎬', description: t('movieDatabase') },
    tmdb: { name: 'TMDB', icon: '🎭', description: t('theMovieDB') },
    letterboxd: { name: 'Letterboxd', icon: '📽️', description: t('filmDiary') },
    metacritic: { name: 'Metacritic', icon: '⭐', description: t('criticScores') },
    rottentomatoes: { name: 'Rotten Tomatoes', icon: '🍅', description: t('audienceCritics') },
    justwatch: { name: 'JustWatch', icon: '📺', description: t('whereToWatch') },
    trakt: { name: 'Trakt', icon: '📊', description: t('trackDiscover') },
    tvdb: { name: 'TVDB', icon: '📚', description: t('tvDatabase') }
  };

  /* =====================
     FULLSCREEN MOBILE MODAL CSS
     ===================== */
  const generateCSS = (theme) => `
    :root {
      --stremio-primary: ${theme.primary};
      --stremio-secondary: ${theme.secondary};
      --stremio-accent: ${theme.accent};
      --stremio-text: ${theme.text};
      --stremio-text-secondary: ${theme.textSecondary};
      --stremio-border: ${theme.border};
      --stremio-glass: ${theme.glass};
      --stremio-blur: ${theme.blur};
      --stremio-gradient: ${theme.gradient};
      --stremio-shadow: ${theme.shadow};
      --stremio-direction: ${isRTL ? 'rtl' : 'ltr'};
    }

    /* Arabic fonts */
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700;800&display=swap');

    .stremio-rtl { direction: rtl; text-align: right; }
    .stremio-arabic {
      font-family: 'Noto Sans Arabic', -apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif;
      font-feature-settings: "kern" 1, "liga" 1;
      text-rendering: optimizeLegibility;
    }

    /* =================== COMPACT BUTTON =================== */
    .stremio-action-button {
      display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px; margin: 0 6px 0 0;
      background: var(--stremio-gradient); backdrop-filter: blur(var(--stremio-blur)) saturate(180%);
      -webkit-backdrop-filter: blur(var(--stremio-blur)) saturate(180%); border: 1px solid var(--stremio-border);
      border-radius: 18px; font: 600 13px/1.3 ${isRTL ? "'Noto Sans Arabic', " : ""}-apple-system, BlinkMacSystemFont, sans-serif;
      color: var(--stremio-text); cursor: pointer; position: relative; overflow: hidden; z-index: 999;
      min-height: 36px; max-height: 40px; transition: all 220ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
      box-shadow: var(--stremio-shadow), inset 0 1px 0 rgba(255, 255, 255, 0.12);
      -webkit-tap-highlight-color: transparent; touch-action: manipulation; order: -1000;
      animation: stremio-entrance 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      direction: var(--stremio-direction);
      ${isRTL ? 'margin: 0 0 0 6px; flex-direction: row-reverse;' : ''}
    }

    @keyframes stremio-entrance {
      0% { opacity: 0; transform: translateY(15px) scale(0.88); filter: blur(8px); }
      100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
    }

    .stremio-action-button:hover {
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 12px 35px rgba(0, 0, 0, 0.25), var(--stremio-shadow);
      border-color: var(--stremio-accent);
    }

    .stremio-action-button img {
      width: 18px; height: 18px; border-radius: 6px;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25));
      ${isRTL ? 'order: 2;' : ''}
    }

    .stremio-action-label {
      display: flex; flex-direction: column; text-align: ${isRTL ? 'right' : 'left'};
      ${isRTL ? 'order: 1;' : ''}
    }

    .stremio-action-title {
      font-size: ${isRTL ? '12px' : '13px'}; font-weight: 700; color: var(--stremio-text);
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }

    .stremio-action-sub {
      font-size: ${isRTL ? '9px' : '10px'}; font-weight: 500; color: var(--stremio-text-secondary);
      margin-top: 1px;
    }

    /* Button States */
    .stremio-action-button[data-state="loading"] { animation: stremio-loading 1.6s ease-in-out infinite; }
    @keyframes stremio-loading { 0%, 100% { opacity: 0.8; transform: scale(0.97); } 50% { opacity: 1; transform: scale(1.02); } }
    .stremio-action-button[data-state="success"] { background: linear-gradient(135deg, rgba(52, 199, 89, 0.3), rgba(76, 217, 100, 0.2)); border-color: rgba(52, 199, 89, 0.5); }
    .stremio-action-button[data-state="error"] { background: linear-gradient(135deg, rgba(255, 59, 48, 0.3), rgba(255, 99, 71, 0.2)); border-color: rgba(255, 59, 48, 0.5); }

    /* =================== FULLSCREEN MOBILE MODAL =================== */
    .stremio-popup-overlay {
      position: fixed; inset: 0; background: rgba(0, 0, 0, 0.95); z-index: 2147483647;
      backdrop-filter: blur(30px) saturate(130%); -webkit-backdrop-filter: blur(30px) saturate(130%);
      display: flex; align-items: center; justify-content: center; padding: 0;
      animation: stremio-overlay-in 300ms ease-out forwards; touch-action: manipulation;
      -webkit-user-select: none; user-select: none; direction: var(--stremio-direction);
    }

    @keyframes stremio-overlay-in {
      0% { opacity: 0; backdrop-filter: blur(0px); }
      100% { opacity: 1; backdrop-filter: blur(30px) saturate(130%); }
    }

    .stremio-popup-modal {
      background: var(--stremio-primary); backdrop-filter: blur(40px) saturate(200%);
      -webkit-backdrop-filter: blur(40px) saturate(200%); border: none;

      /* FULLSCREEN ON MOBILE, NORMAL ON DESKTOP */
      ${isMobile ? `
        width: 100vw !important;
        height: 100vh !important;
        max-width: 100vw !important;
        max-height: 100vh !important;
        border-radius: 0 !important;
        margin: 0 !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
      ` : `
        border-radius: 24px;
        width: 100%;
        max-width: ${CONFIG.contextMenuWidth};
        max-height: ${CONFIG.contextMenuMaxHeight};
        border: 1.5px solid var(--stremio-border);
      `}

      overflow: hidden; display: flex; flex-direction: column; position: relative;
      box-shadow: ${isMobile ? 'none' : '0 40px 100px rgba(0, 0, 0, 0.6), var(--stremio-shadow)'};
      animation: ${isMobile ? 'stremio-mobile-fullscreen-in' : 'stremio-modal-in'} 350ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      direction: var(--stremio-direction);
    }

    @keyframes stremio-mobile-fullscreen-in {
      0% { opacity: 0; transform: scale(0.95); filter: blur(10px); }
      100% { opacity: 1; transform: scale(1); filter: blur(0); }
    }

    @keyframes stremio-modal-in {
      0% { opacity: 0; transform: scale(0.85) translateY(-20px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }

    /* Enhanced Hero Section */
    .stremio-hero {
      position: relative;
      height: ${isMobile ? '200px' : '220px'};
      background: var(--stremio-gradient); overflow: hidden; flex-shrink: 0;
      ${isMobile ? 'padding-top: env(safe-area-inset-top, 0px);' : ''}
    }

    .stremio-hero::before {
      content: ''; position: absolute; inset: 0; background-image: inherit;
      background-position: center; background-size: cover; opacity: 0.7;
      filter: saturate(130%) contrast(108%); z-index: 1;
    }

    .stremio-hero::after {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.3) 40%, rgba(0, 0, 0, 0.6) 80%, var(--stremio-primary) 100%);
      z-index: 2;
    }

    .stremio-hero-content {
      position: absolute; bottom: 0; left: 0; right: 0;
      padding: ${isMobile ? '24px 20px' : '28px 32px'}; z-index: 3; color: white;
      text-align: ${isRTL ? 'right' : 'left'};
    }

    .stremio-hero-title {
      font-size: ${isMobile ? '24px' : '28px'}; font-weight: ${isRTL ? '700' : '900'};
      line-height: 1.2; margin-bottom: ${isMobile ? '8px' : '10px'};
      text-shadow: 0 4px 12px rgba(0, 0, 0, 0.7); letter-spacing: ${isRTL ? '0' : '-0.6px'};
      ${isRTL ? 'font-family: "Noto Sans Arabic", sans-serif;' : ''}
    }

    .stremio-hero-subtitle {
      font-size: ${isMobile ? '14px' : '16px'}; font-weight: ${isRTL ? '500' : '600'};
      color: rgba(255, 255, 255, 0.95); text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
      line-height: 1.3; ${isRTL ? 'font-family: "Noto Sans Arabic", sans-serif;' : ''}
    }

    /* Enhanced Header with Close */
    .stremio-modal-header {
      padding: ${isMobile ? '16px 20px 12px' : '20px 24px 16px'};
      background: rgba(255, 255, 255, 0.04); border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;
      min-height: ${isMobile ? '64px' : '70px'}; direction: var(--stremio-direction);
    }

    .stremio-modal-header-info {
      font-size: ${isMobile ? '15px' : '17px'}; font-weight: 800; color: var(--stremio-text-secondary);
      ${isRTL ? 'font-family: "Noto Sans Arabic", sans-serif; font-weight: 600;' : ''}
      text-align: ${isRTL ? 'right' : 'left'};
    }

    .stremio-modal-close {
      width: ${isMobile ? '48px' : '40px'}; height: ${isMobile ? '48px' : '40px'};
      border-radius: 50%; background: rgba(255, 255, 255, 0.08); backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.12); color: var(--stremio-text);
      font-size: ${isMobile ? '24px' : '20px'}; font-weight: 700; cursor: pointer;
      display: flex; align-items: center; justify-content: center; transition: all 200ms ease;
      -webkit-tap-highlight-color: transparent; touch-action: manipulation;
      ${isMobile ? 'min-width: 48px; min-height: 48px;' : ''}
    }

    .stremio-modal-close:hover, .stremio-modal-close:active {
      background: rgba(255, 255, 255, 0.15); border-color: rgba(255, 255, 255, 0.2);
      transform: scale(${isMobile ? '0.95' : '1.05'});
    }

    /* Perfect Fullscreen Content */
    .stremio-modal-content {
      flex: 1; overflow-y: auto; overflow-x: hidden;
      padding: ${isMobile ? '16px 20px' : '20px 24px'};
      -webkit-overflow-scrolling: touch !important; touch-action: pan-y !important;
      overscroll-behavior-y: contain !important; scroll-behavior: smooth;
      direction: var(--stremio-direction);

      /* PERFECT FULLSCREEN SCROLLING */
      ${isMobile ? `
        height: calc(100vh - 264px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px));
        -webkit-transform: translateZ(0); transform: translateZ(0);
        will-change: scroll-position;
      ` : ''}
    }

    /* Custom Scrollbar */
    .stremio-modal-content::-webkit-scrollbar { width: ${isMobile ? '4px' : '6px'}; }
    .stremio-modal-content::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.03); border-radius: 2px; }
    .stremio-modal-content::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 2px; }

    /* Categories */
    .stremio-modal-category {
      margin: ${isMobile ? '20px 0 12px' : '22px 0 14px'}; padding: 0 ${isMobile ? '12px' : '16px'};
      direction: var(--stremio-direction);
    }

    .stremio-modal-category-title {
      font-size: ${isMobile ? '13px' : '14px'}; font-weight: ${isRTL ? '700' : '800'};
      color: rgba(255, 255, 255, 0.65); text-transform: ${isRTL ? 'none' : 'uppercase'};
      letter-spacing: ${isRTL ? '0' : '1px'}; margin-bottom: ${isMobile ? '12px' : '14px'};
      padding-bottom: 6px; position: relative; text-align: ${isRTL ? 'right' : 'left'};
      ${isRTL ? 'font-family: "Noto Sans Arabic", sans-serif;' : ''}
    }

    .stremio-modal-category-title::after {
      content: ''; position: absolute; bottom: 0; ${isRTL ? 'right: 0;' : 'left: 0;'}
      width: 32px; height: 2px; background: linear-gradient(90deg, var(--stremio-accent), transparent);
      border-radius: 1px;
    }

    /* PERFECT FULLSCREEN PLATFORM ITEMS */
    .stremio-modal-item {
      padding: ${isMobile ? '18px 20px' : '20px 24px'}; color: var(--stremio-text); cursor: pointer;
      border-radius: ${isMobile ? '16px' : '18px'}; margin: ${isMobile ? '8px 6px' : '8px 8px'};
      background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.06);
      transition: all 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94); font-weight: 600;
      font-size: ${isMobile ? '16px' : '17px'}; display: flex; align-items: center;
      gap: ${isMobile ? '16px' : '18px'}; position: relative; overflow: hidden;
      -webkit-user-select: none !important; user-select: none !important;
      -webkit-tap-highlight-color: transparent !important; touch-action: manipulation !important;
      direction: var(--stremio-direction); min-height: ${isMobile ? '64px' : '68px'};
      ${isRTL ? 'flex-direction: row-reverse;' : ''}
      ${isMobile ? '-webkit-touch-callout: none;' : ''}
    }

    .stremio-modal-item:active {
      transform: scale(0.98); background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.15);
    }

    @media (hover: hover) {
      .stremio-modal-item:hover {
        transform: translateY(-1px) scale(1.01); background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.12); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
      }
    }

    .stremio-platform-icon {
      font-size: ${isMobile ? '24px' : '26px'}; min-width: ${isMobile ? '26px' : '28px'};
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3)); flex-shrink: 0;
    }

    .stremio-platform-info {
      flex: 1; display: flex; flex-direction: column; gap: ${isMobile ? '4px' : '5px'};
      min-width: 0; text-align: ${isRTL ? 'right' : 'left'};
    }

    .stremio-platform-name {
      font-size: ${isMobile ? '16px' : '17px'}; font-weight: 700; line-height: 1.2;
      letter-spacing: ${isRTL ? '0' : '-0.1px'};
      ${isRTL ? 'font-family: "Noto Sans Arabic", sans-serif; font-weight: 600;' : ''}
    }

    .stremio-platform-desc {
      font-size: ${isMobile ? '13px' : '14px'}; opacity: 0.8; font-weight: 500; line-height: 1.3;
      ${isRTL ? 'font-family: "Noto Sans Arabic", sans-serif;' : ''}
    }

    /* Enhanced Footer */
    .stremio-modal-footer {
      border-top: 1px solid rgba(255, 255, 255, 0.08); background: rgba(0, 0, 0, 0.15);
      padding: ${isMobile ? '16px 20px' : '20px 24px'}; flex-shrink: 0; direction: var(--stremio-direction);
      ${isMobile ? 'padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));' : ''}
    }

    .stremio-utility-item {
      padding: ${isMobile ? '16px 18px' : '16px 20px'}; color: rgba(255, 255, 255, 0.92);
      cursor: pointer; border-radius: ${isMobile ? '14px' : '16px'}; margin: ${isMobile ? '6px 4px' : '6px 6px'};
      font-weight: ${isRTL ? '500' : '600'}; font-size: ${isMobile ? '15px' : '15px'};
      display: flex; align-items: center; gap: ${isMobile ? '12px' : '14px'}; transition: all 150ms ease;
      background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.06);
      -webkit-user-select: none; user-select: none; touch-action: manipulation;
      -webkit-tap-highlight-color: transparent; direction: var(--stremio-direction);
      min-height: ${isMobile ? '52px' : '48px'};
      ${isRTL ? 'flex-direction: row-reverse; text-align: right; font-family: "Noto Sans Arabic", sans-serif;' : ''}
    }

    .stremio-utility-item:active {
      background: rgba(255, 255, 255, 0.12); border-color: rgba(255, 255, 255, 0.15);
      transform: scale(0.98);
    }

    /* Language & Theme Selectors - Adjusted for Fullscreen */
    .stremio-language-selector {
      position: fixed; top: ${isMobile ? '24px' : '20px'};
      ${isRTL ? 'left' : 'right'}: ${isMobile ? '16px' : '80px'};
      z-index: 2147483649; background: var(--stremio-primary); backdrop-filter: blur(20px);
      border: 1px solid var(--stremio-border); border-radius: ${isMobile ? '14px' : '16px'};
      padding: ${isMobile ? '8px' : '10px'}; display: flex; gap: ${isMobile ? '6px' : '8px'};
      box-shadow: var(--stremio-shadow); opacity: ${isMobile ? '0.8' : '0.9'};
      transition: all 300ms ease; direction: var(--stremio-direction);
      ${isMobile ? 'top: calc(24px + env(safe-area-inset-top, 0px));' : ''}
    }

    .stremio-language-option {
      width: ${isMobile ? '34px' : '38px'}; height: ${isMobile ? '34px' : '38px'};
      border-radius: ${isMobile ? '10px' : '12px'}; cursor: pointer; transition: all 200ms ease;
      border: 2px solid transparent; -webkit-tap-highlight-color: transparent;
      touch-action: manipulation; display: flex; align-items: center; justify-content: center;
      font-size: ${isMobile ? '12px' : '13px'}; font-weight: 600; color: var(--stremio-text-secondary);
      background: rgba(255, 255, 255, 0.06);
    }

    .stremio-language-option.active {
      border-color: var(--stremio-accent); background: rgba(110, 86, 230, 0.2);
      color: var(--stremio-text); box-shadow: 0 0 8px var(--stremio-accent);
    }

    .stremio-theme-selector {
      position: fixed; top: 50%; ${isRTL ? 'left' : 'right'}: ${isMobile ? '16px' : '20px'};
      transform: translateY(-50%); z-index: 2147483649; background: var(--stremio-primary);
      backdrop-filter: blur(20px); border: 1px solid var(--stremio-border);
      border-radius: ${isMobile ? '14px' : '16px'}; padding: ${isMobile ? '8px' : '10px'};
      display: flex; flex-direction: column; gap: ${isMobile ? '6px' : '8px'};
      box-shadow: var(--stremio-shadow); opacity: ${isMobile ? '0.6' : '0.8'};
      transition: all 300ms ease;
    }

    .stremio-theme-option {
      width: ${isMobile ? '30px' : '34px'}; height: ${isMobile ? '30px' : '34px'};
      border-radius: ${isMobile ? '10px' : '12px'}; cursor: pointer; transition: all 200ms ease;
      border: 2px solid transparent; -webkit-tap-highlight-color: transparent; touch-action: manipulation;
    }

    .stremio-theme-option.active { border-color: var(--stremio-accent); box-shadow: 0 0 8px var(--stremio-accent); }

    /* Theme gradients */
    .stremio-theme-option[data-theme="dark-liquid-glass"] { background: linear-gradient(135deg, #6E56E6, #8B7AED); }
    .stremio-theme-option[data-theme="cyber-neon"] { background: linear-gradient(135deg, #00FFFF, #FF0080); }
    .stremio-theme-option[data-theme="warm-sunset"] { background: linear-gradient(135deg, #FF6B35, #FFB347); }
    .stremio-theme-option[data-theme="ocean-deep"] { background: linear-gradient(135deg, #1E90FF, #00CED1); }
    .stremio-theme-option[data-theme="forest-mystique"] { background: linear-gradient(135deg, #32CD32, #98FB98); }

    /* Toast Notifications */
    .stremio-toast {
      position: fixed; ${isRTL ? 'left' : 'right'}: env(safe-area-inset-right, ${isMobile ? '18px' : '24px'});
      bottom: calc(env(safe-area-inset-bottom, 0px) + ${isMobile ? '22px' : '24px'});
      background: var(--stremio-primary); backdrop-filter: blur(25px) saturate(160%);
      -webkit-backdrop-filter: blur(25px) saturate(160%); color: var(--stremio-text);
      padding: ${isMobile ? '14px 18px' : '16px 20px'}; border-radius: ${isMobile ? '14px' : '16px'};
      border: 1px solid var(--stremio-border); z-index: 2147483650;
      font: 600 ${isMobile ? '13px' : '14px'} ${isRTL ? '"Noto Sans Arabic", ' : ''}-apple-system, sans-serif;
      max-width: min(${isMobile ? '300px' : '350px'}, calc(100vw - ${isMobile ? '36px' : '48px'}));
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3), var(--stremio-shadow);
      animation: stremio-toast-in 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      direction: var(--stremio-direction); text-align: ${isRTL ? 'right' : 'left'};
      ${isMobile ? '-webkit-user-select: none; user-select: none;' : ''}
    }

    @keyframes stremio-toast-in {
      0% { opacity: 0; transform: translateY(${isMobile ? '25px' : '30px'}) scale(0.9); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }

    .stremio-toast.success { background: linear-gradient(135deg, rgba(52, 199, 89, 0.92), rgba(76, 217, 100, 0.88)); }
    .stremio-toast.error { background: linear-gradient(135deg, rgba(255, 59, 48, 0.92), rgba(255, 99, 71, 0.88)); }
    .stremio-toast.warning { background: linear-gradient(135deg, rgba(255, 149, 0, 0.92), rgba(255, 193, 7, 0.88)); }
    .stremio-toast.info { background: linear-gradient(135deg, rgba(10, 132, 255, 0.92), rgba(52, 170, 220, 0.88)); }

    /* Small screen optimizations */
    @media (max-width: 480px) {
      .stremio-hero { height: 180px; }
      .stremio-hero-title { font-size: ${isRTL ? '20px' : '22px'}; }
      .stremio-hero-subtitle { font-size: ${isRTL ? '12px' : '13px'}; }
      .stremio-modal-item { padding: 16px 18px; font-size: 15px; min-height: 60px; }
      .stremio-platform-name { font-size: 15px; }
      .stremio-platform-desc { font-size: 12px; }
    }

    @media (max-width: 360px) {
      .stremio-action-title { font-size: ${isRTL ? '10px' : '11px'}; }
      .stremio-action-sub { font-size: ${isRTL ? '7px' : '9px'}; }
    }

    /* Landscape optimization */
    @media (max-height: 500px) and (orientation: landscape) {
      .stremio-hero { height: 120px; }
      .stremio-hero-title { font-size: ${isRTL ? '18px' : '20px'}; margin-bottom: 4px; }
      .stremio-hero-subtitle { font-size: ${isRTL ? '11px' : '12px'}; }
      .stremio-modal-content { height: calc(100vh - 184px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)); }
    }
  `;

  /* =====================
     UTILITIES & SYSTEMS (Shortened for space)
     ===================== */
  const utils = {
    debounce(fn, delay = CONFIG.observerThrottle) { let timeout; return (...args) => { clearTimeout(timeout); timeout = setTimeout(() => fn(...args), delay); }; },
    el(tag, opts = {}) {
      const element = document.createElement(tag);
      if (opts.className) element.className = opts.className;
      if (opts.innerHTML) element.innerHTML = opts.innerHTML; if (opts.textContent) element.textContent = opts.textContent;
      if (opts.attributes) Object.entries(opts.attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
      if (opts.style) Object.assign(element.style, opts.style); if (isRTL) { element.classList.add('stremio-rtl'); if (opts.textContent || opts.innerHTML) element.classList.add('stremio-arabic'); }
      return element;
    },
    vibrate(pattern = [10, 5, 10]) { if (!CONFIG.enableHaptics) return; try { if (navigator.vibrate) { if (isMobile) navigator.vibrate(pattern.map(v => Math.min(v * 1.2, 50))); else navigator.vibrate(pattern); } } catch (e) { log('Haptic error:', e); } },
    copy: async (text) => { try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; } const textarea = utils.el('textarea', { style: { position: 'fixed', left: '-9999px', opacity: '0' } }); textarea.value = text; document.body.appendChild(textarea); textarea.select(); const result = document.execCommand('copy'); textarea.remove(); return result; } catch (e) { log('Copy error:', e); return false; } },
    title() { const selectors = [".PZPZlf.ssJ7i.B5dxMb[data-attrid='title']", "div[data-attrid='title'][role='heading']", "h2[data-attrid='title']", ".title", "h1", "[data-attrid='title'] span", ".kno-ecr-pt h3", ".DnWOKd", ".LC20lb", ".kno-ecr-pt .qb-b", ".SPZz6b span", ".l2rDZe span"]; for (const selector of selectors) { const element = document.querySelector(selector); if (element && element.textContent.trim()) { let title = element.textContent.trim().replace(/\s*-\s*Google\s*Search.*$/i, '').replace(/\s*\|\s*.*$/i, '').replace(/\s*\(\d{4}\)\s*/g, ' ').replace(/\s+/g, ' ').trim(); if (title && title.length > 1) { log(`📺 Extracted title: "${title}"`); return title; } } } const pageTitle = document.title.replace(/\s*-\s*Google\s*Search.*$/i, '').trim(); if (pageTitle && pageTitle.length > 1) return pageTitle; return null; },
    rating(rating) { const num = parseFloat(rating); return isNaN(num) ? null : num.toFixed(1); },
    formatRuntime(minutes) { if (!minutes) return ''; const hours = Math.floor(minutes / 60); const mins = minutes % 60; return isRTL ? (hours > 0 ? `${hours}س ${mins}د` : `${mins}د`) : (hours > 0 ? `${hours}h ${mins}m` : `${mins}m`); },
    formatGenres(genres) { if (!genres || !Array.isArray(genres)) return ''; return genres.slice(0, 3).map(g => g.name).join(' • '); },
    saveConfig(key, value) { try { CONFIG[key] = value; if (GM_setValue) GM_setValue(key, JSON.stringify(value)); else localStorage.setItem(`stremio_${key}`, JSON.stringify(value)); } catch (e) { log('Config save error:', e); } }
  };

  const themeManager = {
    currentTheme: CONFIG.theme, currentLanguage: CURRENT_LANG,
    init() { this.injectCSS(); if (CONFIG.enableThemeSelector) this.createThemeSelector(); if (CONFIG.enableLanguageSelector) this.createLanguageSelector(); },
    injectCSS() { const theme = THEMES[this.currentTheme] || THEMES['dark-liquid-glass']; const css = generateCSS(theme); try { if (typeof GM_addStyle === 'function') GM_addStyle(css); else { const style = document.createElement('style'); style.textContent = css; style.setAttribute('data-stremio-theme', this.currentTheme); style.setAttribute('data-stremio-lang', this.currentLanguage); (document.head || document.documentElement).appendChild(style); } log(`✨ Theme "${theme.name}" applied for ${isRTL ? 'Arabic RTL' : 'English LTR'} on ${isMobile ? 'FULLSCREEN MOBILE' : 'desktop'}`); } catch (e) { log('❌ CSS injection error:', e); } },
    createThemeSelector() { const selector = utils.el('div', { className: 'stremio-theme-selector' }); Object.entries(THEMES).forEach(([key, theme]) => { const option = utils.el('div', { className: `stremio-theme-option ${key === this.currentTheme ? 'active' : ''}`, attributes: { 'data-theme': key, 'title': theme.name, 'aria-label': `${t('switchTheme')} ${theme.name} ${t('theme')}` } }); option.addEventListener('click', () => this.switchTheme(key)); option.addEventListener('touchend', (e) => { e.preventDefault(); this.switchTheme(key); }); selector.appendChild(option); }); document.body.appendChild(selector); },
    createLanguageSelector() { const selector = utils.el('div', { className: 'stremio-language-selector' }); const languages = [{ code: 'en', name: 'EN', fullName: t('english') }, { code: 'ar', name: 'عر', fullName: t('arabic') }]; languages.forEach(lang => { const option = utils.el('div', { className: `stremio-language-option ${lang.code === CURRENT_LANG ? 'active' : ''}`, textContent: lang.name, attributes: { 'data-lang': lang.code, 'title': lang.fullName, 'aria-label': `Switch to ${lang.fullName}` } }); option.addEventListener('click', () => this.switchLanguage(lang.code)); option.addEventListener('touchend', (e) => { e.preventDefault(); this.switchLanguage(lang.code); }); selector.appendChild(option); }); document.body.appendChild(selector); },
    switchTheme(themeKey) { if (!THEMES[themeKey] || themeKey === this.currentTheme) return; this.currentTheme = themeKey; utils.saveConfig('theme', themeKey); const oldStyle = document.querySelector('[data-stremio-theme]'); if (oldStyle) oldStyle.remove(); THEMES[themeKey].name = t(themeKey.replace(/-([a-z])/g, (g) => g[1].toUpperCase()).replace(/^[a-z]/, g => g.toUpperCase())); this.injectCSS(); document.querySelectorAll('.stremio-theme-option').forEach(opt => opt.classList.toggle('active', opt.dataset.theme === themeKey)); platformInfo.stremio.color = THEMES[themeKey].accent; ui.toast(`${t('themeChanged')} ${THEMES[themeKey].name}`, 'success'); utils.vibrate([12, 6, 18, 6, 12]); log(`🎨 Theme switched to: ${THEMES[themeKey].name}`); },
    switchLanguage(langCode) { if (langCode === CURRENT_LANG) return; utils.saveConfig('language', langCode); ui.toast(`${t('languageChanged')} ${langCode === 'ar' ? 'العربية' : 'English'}`, 'success'); utils.vibrate([15, 8, 20, 8, 15]); setTimeout(() => window.location.reload(), 1500); }
  };

  const detector = {
    cache: new Map(),
    imdb() { const key = `imdb_${location.href}`; if (this.cache.has(key)) return this.cache.get(key); const selectors = ["a[href*='imdb.com/title/']", "[data-imdb]", "[data-imdb-id]", ".imdb-link", "a[href*='/title/tt']"]; for (const selector of selectors) { for (const element of document.querySelectorAll(selector)) { const href = element.href || element.getAttribute('data-imdb') || element.getAttribute('data-imdb-id') || ''; const match = href.match(/(tt\d{5,15})/i); if (match) { this.cache.set(key, match[1]); return match[1]; } } } this.cache.set(key, null); return null; },
type() { 
  const seriesSelectors = [
    "div[data-attrid*='tv_program']", 
    "[data-type='series']", 
    ".tv-series", 
    ".series"
  ]; 
  const movieSelectors = [
    "div[data-attrid*='movie']", 
    "[data-type='movie']", 
    ".movie", 
    ".film"
  ]; 
  for (const selector of seriesSelectors) { 
    if (document.querySelector(selector)) return 'series'; 
  } 
  for (const selector of movieSelectors) { 
    if (document.querySelector(selector)) return 'movie'; 
  } 
  const text = (document.body.textContent || '').toLowerCase().slice(0, 1500); 
  const seriesWords = ['season', 'episode', 'series', 'tv show', 'episodes', 'seasons']; 
  const movieWords = ['movie', 'film', 'runtime', 'director', 'cast']; 
  const seriesCount = seriesWords.reduce((count, word) => count + (text.match(new RegExp(word, 'gi')) || []).length, 0); 
  const movieCount = movieWords.reduce((count, word) => count + (text.match(new RegExp(word, 'gi')) || []).length, 0); 
  return seriesCount > movieCount ? 'series' : 'movie'; 
},
    actions() { const selectors = [".MPG0Z.ycw3p", ".uNnvb.w5mTAe", ".MPG0Z", ".uNnvb", ".otSzTe", "[data-attrid='kc:/common:action bar']", ".action-bar"]; for (const selector of selectors) { const elements = document.querySelectorAll(selector); for (const element of elements) { if (element && element.offsetParent !== null && element.getBoundingClientRect().width > 0) return element; } } return null; },
    watched(container) { if (!container) return null; const selectors = ["div[jscontroller='I5Flqd']", ".bGD07e", "[data-watched]", ".watched-button", ".watch-button", "[aria-label*='watched']"]; for (const selector of selectors) { const element = container.querySelector(selector); if (element) return element; } return null; }
  };

  /* =====================
     FULLSCREEN MOBILE UI SYSTEM
     ===================== */
  const ui = {
    toast(message, type = 'info', duration = CONFIG.toastTime) {
      if (!CONFIG.enableToasts) return;
      const existing = document.querySelector('.stremio-toast');
      if (existing) existing.remove();
      const toast = utils.el('div', {
        className: `stremio-toast ${type}`, textContent: message,
        attributes: { role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' }
      });
      document.body.appendChild(toast);
      const mobileDuration = isMobile ? duration * 0.8 : duration;
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px) scale(0.95)';
        setTimeout(() => toast.remove(), 200);
      }, mobileDuration);
    },

    async popup(imdb, contentType, title) {
      if (!CONFIG.enableMultiPlatform) return;
      const existing = document.querySelector('.stremio-popup-overlay');
      if (existing) existing.remove();

      ui.toast(`${isMobile ? t('loadingDetailsMobile') : t('loadingDetails')}`, 'info', 1200);

      // Prevent body scroll on mobile
      if (isMobile) {
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
      }

      const overlay = utils.el('div', { className: 'stremio-popup-overlay' });
      const modal = utils.el('div', { className: 'stremio-popup-modal' });

      try {
        const [omdbData, tmdbResolved] = await Promise.all([
          omdbAPI.getByImdb(imdb).catch(() => null),
          tmdbAPI.findByImdb(imdb).catch(() => null)
        ]);

        const tmdbDetails = tmdbResolved ? 
          await tmdbAPI.details(tmdbResolved.type, tmdbResolved.id).catch(() => null) : null;

        const movieTitle = tmdbDetails?.title || tmdbDetails?.name || 
                          omdbData?.Title || title || 
                          (contentType === 'series' ? t('series') : t('movie'));

        const year = (tmdbDetails?.release_date || 
                     tmdbDetails?.first_air_date || 
                     omdbData?.Year || '').toString().slice(0, 4);

        const tmdbRating = tmdbDetails?.vote_average ? 
          `⭐ ${tmdbDetails.vote_average.toFixed(1)}` : '';
        const imdbRating = omdbData?.imdbRating ? 
          `🎬 ${utils.rating(omdbData.imdbRating)}` : '';
        const rating = tmdbRating || imdbRating;

        const runtime = tmdbDetails?.runtime ? 
          ` • ${utils.formatRuntime(tmdbDetails.runtime)}` : '';
        const genres = tmdbDetails?.genres ? 
          ` • ${utils.formatGenres(tmdbDetails.genres)}` : '';

        const heroImg = tmdbAPI.img(
          tmdbDetails?.backdrop_path || tmdbDetails?.poster_path, 
          isMobile ? 'w780' : 'w1280'
        );

        // Create enhanced hero section
        const hero = utils.el('div', { className: 'stremio-hero' });
        if (heroImg) {
          hero.style.backgroundImage = `url(${heroImg})`;
        }

        const heroContent = utils.el('div', {
          className: 'stremio-hero-content',
          innerHTML: `
            <div class="stremio-hero-title">${movieTitle}</div>
            <div class="stremio-hero-subtitle">
              ${year}${rating ? ` • ${rating}` : ''}${runtime}${genres}
            </div>
          `
        });
        hero.appendChild(heroContent);

        // Create header with close button
        const header = utils.el('div', {
          className: 'stremio-modal-header',
          innerHTML: `
            <div style="flex: 1; min-width: 0;">
              <div class="stremio-modal-header-info">
                ${imdb} • ${contentType === 'series' ? t('series') : t('movie')}
              </div>
            </div>
            <button class="stremio-modal-close" title="${t('closeDialog')}" aria-label="${t('closeDialog')}">×</button>
          `
        });

        const closeBtn = header.querySelector('.stremio-modal-close');
        const close = () => {
          // Restore body scroll
          if (isMobile) {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
          }
          
          overlay.style.opacity = '0';
          overlay.style.backdropFilter = 'blur(0px)';
          if (isMobile) {
            modal.style.transform = 'scale(0.95)';
          } else {
            modal.style.transform = 'scale(0.9) translateY(20px)';
          }
          setTimeout(() => overlay.remove(), isMobile ? 250 : 220);
          utils.vibrate([6]);
        };

        closeBtn.addEventListener('click', close, { passive: true });
        closeBtn.addEventListener('touchend', (e) => {
          e.preventDefault();
          close();
        }, { passive: true });

        // Create content with enhanced categories
        const content = utils.el('div', { className: 'stremio-modal-content' });

        const categories = [
          { title: t('streamingPlatforms'), platforms: ['stremio', 'justwatch'] },
          { title: t('movieDatabases'), platforms: contentType === 'series' ? ['imdb', 'tmdb', 'tvdb'] : ['imdb', 'tmdb'] },
          { title: t('reviewsRatings'), platforms: contentType === 'movie' ? ['letterboxd', 'metacritic', 'rottentomatoes'] : ['metacritic', 'rottentomatoes'] },
          { title: t('trackingSocial'), platforms: ['trakt'] }
        ];

        categories.forEach(category => {
          const categoryDiv = utils.el('div', {
            className: 'stremio-modal-category',
            innerHTML: `<div class="stremio-modal-category-title">${category.title}</div>`
          });

          category.platforms.forEach(platformKey => {
            const info = platformInfo[platformKey];
            if (!info) return;

            const url = platformUrls[platformKey](imdb, contentType, movieTitle, tmdbResolved);
            if (!url) return;

            const item = utils.el('div', {
              className: 'stremio-modal-item',
              attributes: { 'data-platform': platformKey },
              innerHTML: `
                <span class="stremio-platform-icon">${info.icon}</span>
                <div class="stremio-platform-info">
                  <div class="stremio-platform-name">${info.name}</div>
                  <div class="stremio-platform-desc">${info.description}</div>
                </div>
              `
            });

            const handleClick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              openPlatform(platformKey, url, info.name);
              close();
              utils.vibrate([10, 5, 15, 5, 10]);
            };

            item.addEventListener('click', handleClick);
            item.addEventListener('touchend', (e) => {
              e.preventDefault();
              handleClick(e);
            });
            
            // Prevent scroll on touch
            item.addEventListener('touchstart', (e) => {
              e.stopPropagation();
            }, { passive: true });

            categoryDiv.appendChild(item);
          });

          content.appendChild(categoryDiv);
        });

        // Enhanced footer with quick actions
        const footer = utils.el('div', { className: 'stremio-modal-footer' });
        const utilityItems = [
          { icon: '📋', label: t('copyImdbId'), action: () => copyAction(imdb) },
          { icon: '🔗', label: t('copyStremioLink'), action: () => copyAction(platformUrls.stremio(imdb, contentType)) },
          { icon: '🎬', label: t('copyTitle'), action: () => copyAction(movieTitle) }
        ];

        utilityItems.forEach(item => {
          const element = utils.el('div', {
            className: 'stremio-utility-item',
            innerHTML: `${item.icon} ${item.label}`
          });

          const handleClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            item.action();
            close();
            utils.vibrate([8, 4, 12, 4, 8]);
          };

          element.addEventListener('click', handleClick);
          element.addEventListener('touchend', (e) => {
            e.preventDefault();
            handleClick(e);
          });
          footer.appendChild(element);
        });

        // Assemble modal
        modal.appendChild(hero);
        modal.appendChild(header);
        modal.appendChild(content);
        modal.appendChild(footer);
        overlay.appendChild(modal);

        // Enhanced event listeners
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) close();
        });

        // Mobile-friendly keyboard handler
        const handleKeydown = (e) => {
          if (e.key === 'Escape') {
            close();
            document.removeEventListener('keydown', handleKeydown);
          }
        };
        document.addEventListener('keydown', handleKeydown);

        document.body.appendChild(overlay);
        
        // Enhanced mobile haptic feedback
        utils.vibrate(isMobile ? [18, 10, 30, 10, 18] : [15, 8, 25, 8, 15]);
        
      } catch (error) {
        log('❌ Fullscreen popup error:', error);
        ui.toast('❌ Failed to load details', 'error');
        if (isMobile) {
          document.body.style.overflow = '';
          document.documentElement.style.overflow = '';
        }
        overlay.remove();
      }
    }
  };

  /* =====================
     PLATFORM OPENERS
     ===================== */
  function openPlatform(platform, url, name) {
    try {
      if (platform === 'stremio') {
        openStremio(url);
        ui.toast(`${t('launchingApp')}`, 'info');
        utils.vibrate([12, 6, 18, 6, 12]);
      } else {
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        ui.toast(`${t('openingPlatform')} ${name}...`, 'info');
        utils.vibrate([8, 4, 8]);
      }
    } catch (error) {
      log('❌ Platform open error:', platform, error);
      ui.toast(`❌ ${t('appFailed')} ${name}`, 'error');
      utils.vibrate([25, 10, 25]);
    }
  }

  function openStremio(stremioUri) {
    try {
      const anchor = document.createElement('a');
      anchor.href = stremioUri;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      setTimeout(() => {
        if (document.visibilityState === 'visible' && !document.hidden) {
          const title = utils.title() || '';
          const fallbackUrl = platformUrls.stremioWebSearch(title || stremioUri);
          
          const fallbackAnchor = document.createElement('a');
          fallbackAnchor.href = fallbackUrl;
          fallbackAnchor.target = '_blank';
          fallbackAnchor.rel = 'noopener noreferrer';
          document.body.appendChild(fallbackAnchor);
          fallbackAnchor.click();
          fallbackAnchor.remove();
          
          ui.toast(isMobile ? t('webFallbackMobile') : t('webFallback'), 'warning');
          utils.vibrate([18, 10, 18]);
        }
      }, CONFIG.appOpenTimeout);
    } catch (error) {
      log('❌ Stremio open error:', error);
      ui.toast(t('appFailed'), 'error');
      utils.vibrate([30, 15, 30]);
    }
  }

  async function copyAction(text) {
    try {
      const success = await utils.copy(text);
      const truncatedText = text.length > (isMobile ? 20 : 25) ? text.substring(0, isMobile ? 20 : 25) + '...' : text;
      ui.toast(
        success ? `${t('copySuccess')}` : t('copyFailed'),
        success ? 'success' : 'error'
      );
      utils.vibrate(success ? [10, 5, 15, 5, 10] : [25, 15, 25]);
    } catch (error) {
      log('❌ Copy action error:', error);
      ui.toast(t('copyFailed'), 'error');
      utils.vibrate([25, 15, 25]);
    }
  }

  /* =====================
     BUTTON CREATION & HANDLERS
     ===================== */
  function createButton(imdb, contentType) {
    const title = utils.title();
    
    const button = utils.el('button', {
      className: 'stremio-action-button',
      attributes: {
        type: 'button',
        tabindex: '0',
        'data-imdb': imdb,
        'data-content-type': contentType,
        'data-title': title || '',
        'aria-label': `${t('watchOnStremio')} ${title || (contentType === 'series' ? t('series') : t('movie'))}`,
        role: 'button'
      }
    });

    const subText = contentType === 'series' ? t('streamSeries') : t('streamMovie');
    
    button.innerHTML = `
      ${CONFIG.showIcon ? `
        <img src="https://www.stremio.com/website/stremio-logo-small.png" 
             alt="Stremio" 
             decoding="async" 
             loading="lazy" 
             draggable="false" />
      ` : ''}
      <div class="stremio-action-label">
        <span class="stremio-action-title">${t('watchOnStremio')}</span>
        ${CONFIG.showSubtext ? `<span class="stremio-action-sub">${subText}</span>` : ''}
      </div>
    `;

    // Enhanced mobile interaction state
    const interactionState = {
      longPressTimer: null,
      isLongPress: false,
      lastTap: 0,
      tapCount: 0
    };

    // Enhanced mobile pointer events
    button.addEventListener('pointerdown', (event) => {
      try {
        interactionState.isLongPress = false;
        utils.vibrate(isMobile ? [15, 8, 12] : [12, 6, 10]);
        
        if (event.pointerType === 'touch' && CONFIG.longPressAction !== 'none') {
          interactionState.longPressTimer = setTimeout(() => {
            interactionState.isLongPress = true;
            utils.vibrate([25, 15, 30, 15, 20]);
            ui.popup(imdb, contentType, title);
          }, isMobile ? 600 : 650);
        }
      } catch (error) {
        log('❌ Pointer down error:', error);
      }
    }, { passive: true });

    button.addEventListener('pointerup', () => {
      if (interactionState.longPressTimer) {
        clearTimeout(interactionState.longPressTimer);
        interactionState.longPressTimer = null;
      }
    }, { passive: true });

    // Enhanced mobile click handling
    button.addEventListener('click', (event) => {
      event.preventDefault();
      
      if (interactionState.isLongPress) {
        interactionState.isLongPress = false;
        return;
      }

      const now = Date.now();
      const timeSinceLastTap = now - interactionState.lastTap;

      if (timeSinceLastTap > 0 && timeSinceLastTap < (isMobile ? 350 : 300)) {
        interactionState.tapCount++;
        if (interactionState.tapCount === 2) {
          handleDoubleClick(imdb, contentType, title, event);
          interactionState.tapCount = 0;
          return;
        }
      } else {
        interactionState.tapCount = 1;
      }

      interactionState.lastTap = now;

      setTimeout(() => {
        if (Date.now() - interactionState.lastTap >= (isMobile ? 320 : 280) && 
            interactionState.tapCount === 1) {
          handleSingleClick(button, imdb, contentType, title);
          interactionState.tapCount = 0;
        }
      }, isMobile ? 350 : 320);
    });

    // Context menu for additional options
    button.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      ui.popup(imdb, contentType, title);
    });

    return button;
  }

  function handleSingleClick(button, imdb, contentType, title) {
    try {
      button.setAttribute('data-state', 'loading');
      const subElement = button.querySelector('.stremio-action-sub');
      const originalText = subElement?.textContent || '';
      
      if (subElement) subElement.textContent = t('launching');
      utils.vibrate([15, 8, 20, 8, 15]);

      const stremioUri = platformUrls.stremio(imdb, contentType);
      
      switch (CONFIG.clickAction) {
        case 'confirm':
          if (confirm(`${t('watchOnStremio')} "${title || (contentType === 'series' ? t('series') : t('movie'))}"?`)) {
            openStremio(stremioUri);
          } else {
            button.removeAttribute('data-state');
            if (subElement) subElement.textContent = originalText;
            return;
          }
          break;
        case 'new-tab':
          window.open(stremioUri, '_blank', 'noopener,noreferrer');
          ui.toast(t('openingNewTab'), 'info');
          break;
        default:
          openStremio(stremioUri);
      }

      setTimeout(() => {
        button.removeAttribute('data-state');
        if (subElement) subElement.textContent = originalText;
      }, 3000);

    } catch (error) {
      log('❌ Single click error:', error);
      button.setAttribute('data-state', 'error');
      ui.toast(t('appFailed'), 'error');
      utils.vibrate([30, 20, 30, 20, 30]);
    }
  }

  function handleDoubleClick(imdb, contentType, title, event) {
    if (CONFIG.doubleClickAction === 'none') return;
    
    utils.vibrate([12, 6, 18, 6, 18, 6, 25]);
    
    switch (CONFIG.doubleClickAction) {
      case 'new-tab': {
        const url = platformUrls.stremio(imdb, contentType);
        ui.toast(t('openingNewTab'), 'info');
        window.open(url, '_blank', 'noopener,noreferrer');
        break;
      }
      case 'copy':
        copyAction(platformUrls.stremio(imdb, contentType));
        break;
      case 'context-menu':
        ui.popup(imdb, contentType, title);
        break;
    }
  }

  /* =====================
     PROCESSING ENGINE & MONITORING
     ===================== */
  const processor = {
    isProcessing: false,
    processCount: 0,

    async run() {
      if (this.isProcessing) return;
      this.isProcessing = true;
      this.processCount++;

      try {
        const imdb = detector.imdb();
        if (!imdb) return;

        const actionsContainer = detector.actions();
        if (!actionsContainer) return;

        let existingButton = document.querySelector(`.stremio-action-button[data-imdb="${imdb}"]`);

        if (!existingButton) {
          const contentType = detector.type();
          const title = utils.title();
          const button = createButton(imdb, contentType);
          
          if (this.insertButton(actionsContainer, button)) {
            log(`✨ ${isMobile ? 'Fullscreen Mobile' : 'Desktop'} Button inserted: "${title}" (${imdb}) - Process #${this.processCount}`);
            ui.toast(`${t('buttonAdded')} "${title || (contentType === 'series' ? t('series') : t('movie'))}"`, 'success', 1800);
          }
        } else {
          this.ensurePosition(existingButton, actionsContainer);
        }

      } catch (error) {
        log('❌ Processing error:', error);
      } finally {
        this.isProcessing = false;
      }
    },

    insertButton(container, button) {
      try {
        const watchedButton = detector.watched(container);
        if (watchedButton && watchedButton.parentNode) {
          watchedButton.parentNode.insertBefore(button, watchedButton);
        } else {
          container.insertBefore(button, container.firstChild);
        }
        return true;
      } catch (error) {
        log('❌ Insert button error:', error);
        return false;
      }
    },

    ensurePosition(button, container) {
      try {
        const watchedButton = detector.watched(container);
        if (watchedButton && watchedButton.parentNode &&
            button.nextSibling !== watchedButton && button !== watchedButton) {
          watchedButton.parentNode.insertBefore(button, watchedButton);
        }
        return true;
      } catch (error) {
        return false;
      }
    }
  };

  const monitor = {
    init() {
      this.setupMutationObserver();
      this.setupEventListeners();
      this.startInitialChecks();
      log(`🔍 ${isMobile ? 'Fullscreen Mobile' : 'Desktop'} monitoring initialized`);
    },

    setupMutationObserver() {
      const debouncedProcess = utils.debounce(() => {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => processor.run(), { timeout: 400 });
        } else {
          setTimeout(() => processor.run(), 25);
        }
      }, CONFIG.observerThrottle);

      const observer = new MutationObserver((mutations) => {
        let shouldProcess = false;
        for (const mutation of mutations) {
          if (mutation.addedNodes?.length || mutation.removedNodes?.length) {
            for (const node of [...(mutation.addedNodes || []), ...(mutation.removedNodes || [])]) {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const relevantSelectors = ['.MPG0Z', '.uNnvb', '.otSzTe', '[data-attrid]', '.PZPZlf'];
                const isRelevant = relevantSelectors.some(selector => node.matches?.(selector) || node.querySelector?.(selector));
                if (isRelevant) { shouldProcess = true; break; }
              }
            }
            if (shouldProcess) break;
          }
        }
        if (shouldProcess) debouncedProcess();
      });

      try {
        observer.observe(document.body, {
          childList: true, subtree: true, attributes: true,
          attributeFilter: ['class', 'id', 'data-attrid', 'jscontroller']
        });
      } catch (error) {
        log('❌ Observer setup error:', error);
      }
    },

    setupEventListeners() {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) setTimeout(() => processor.run(), 500);
      });

      let lastUrl = location.href;
      const checkUrlChange = () => {
        const currentUrl = location.href;
        if (currentUrl !== lastUrl) {
          lastUrl = currentUrl;
          detector.cache.clear();
          setTimeout(() => processor.run(), 600);
        }
      };

      window.addEventListener('popstate', checkUrlChange);
      window.addEventListener('hashchange', checkUrlChange);
      setInterval(checkUrlChange, 2000);

      if (CONFIG.enableKeyboardShortcuts && !isMobile) {
        document.addEventListener('keydown', (e) => {
          if (e.ctrlKey && e.shiftKey && e.key === 'S') {
            e.preventDefault();
            const button = document.querySelector('.stremio-action-button');
            if (button) {
              button.click();
              ui.toast(t('keyboardShortcut'), 'info');
            }
          }
        });
      }
    },

    startInitialChecks() {
      const initSequence = isMobile ? [200, 500, 1000, 2000] : [150, 400, 800, 1500, 3000];
      initSequence.forEach((delay, index) => {
        setTimeout(() => processor.run(), delay);
      });

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          setTimeout(() => processor.run(), 300);
        });
      }

      window.addEventListener('load', () => {
        setTimeout(() => processor.run(), 400);
      });

      setInterval(() => processor.run(), CONFIG.repositionInterval);
    }
  };

  /* =====================
     INITIALIZATION
     ===================== */
  function init() {
    try {
      log(`🚀 Initializing Fullscreen Mobile Stremio Button v9.1 for ${isMobile ? 'MOBILE FULLSCREEN' : 'DESKTOP'} - Language: ${isRTL ? 'Arabic RTL' : 'English LTR'}`);
      
      themeManager.init();
      monitor.init();
      
      ui.toast(`🎨 ${CURRENT_THEME.name}`, 'success', 1800);
      
      log('🚀✨ Fullscreen Mobile Stremio Button v9.1 initialized successfully! ✨🚀');
      log(`📱 Platform: ${isMobile ? 'MOBILE FULLSCREEN MODAL' : 'DESKTOP MODAL'}`);
      log('🌐 Features: Arabic Support, RTL Layout, Perfect Mobile Fullscreen');
      log(`🎭 Theme: ${CURRENT_THEME.name} | Language: ${isRTL ? 'العربية' : 'English'}`);
      
      utils.vibrate(isMobile ? [20, 10, 35, 10, 40, 10, 20] : [15, 8, 25, 8, 30, 8, 15]);
      
    } catch (error) {
      log('❌ Initialization error:', error);
      ui.toast('❌ Failed to initialize', 'error');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, isMobile ? 150 : 100);
  }
})();
