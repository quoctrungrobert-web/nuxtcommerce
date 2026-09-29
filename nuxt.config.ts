// nuxt.config.ts
import pkg from "./package.json";

export default defineNuxtConfig({
  devtools: { enabled: false },

  modules: ["@vueuse/nuxt", "@nuxt/ui", "@nuxt/image", "notivue/nuxt", "@nuxtjs/i18n", "@nuxtjs/sitemap", "@nuxtjs/robots"],

  i18n: {
    defaultLocale: "en",
    strategy: "prefix_except_default",
    langDir: "locales",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "root",
      alwaysRedirect: true,
    },
    locales: [
      { code: "en", iso: "en-GB", file: "en-GB.json", name: "🇬🇧 English" },
      { code: "nb", iso: "nb-NO", file: "nb-NO.json", name: "🇳🇴 Norsk (Bokmål)" },
      { code: "nl", iso: "nl-NL", file: "nl-NL.json", name: "🇳🇱 Nederlands" },
      { code: "de", iso: "de-DE", file: "de-DE.json", name: "🇩🇪 Deutsch" },
    ],
  },

  image: {
    format: ['webp'],
    quality: 80,
    provider: 'ipx', 
    // In production, you can switch this to 'cloudflare' or 'vercel' if deployed there
  },

  notivue: {
    position: "top-center",
    limit: 3,
    notifications: { global: { duration: 3000 } },
  },

  css: ["notivue/notification.css", "notivue/animations.css"],

  runtimeConfig: {
    public: {
      version: pkg.version,
      backendUrl: process.env.BACKEND_URL || "http://localhost:4000",
    },
  },

  routeRules: {
    "/": { ssr: false },
    "/categories": { ssr: false },
    "/favorites": { ssr: false },
  },


  nitro: {
    preset: "node-server",
  },

  site: {
    url: "https://caros.services",
    name: "Caros Services",
  },

  compatibilityDate: "2025-01-01",
});
