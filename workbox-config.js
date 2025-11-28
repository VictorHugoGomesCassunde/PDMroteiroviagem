module.exports = {
  // Pasta final gerada pelo Vite
  globDirectory: "dist/",

  // Quais tipos de arquivos devem ir para o cache
  globPatterns: [
    "**/*.{html,js,css,png,svg,jpg}"
  ],

  // Local onde o SW final será criado
  swDest: "dist/sw.js",

  // Regras de cache em tempo real (runtime)
  runtimeCaching: [
    {
      // Cache dos tiles do OpenStreetMap
      urlPattern: ({ url }) =>
        url.origin.includes("tile.openstreetmap.org"),

      handler: "CacheFirst", // usa cache sempre que possível

      options: {
        cacheName: "map-tiles",
        expiration: {
          maxEntries: 200,                   // quantidade máxima
          maxAgeSeconds: 60 * 60 * 24 * 7    // 7 dias
        }
      }
    },

    {
      // Scripts da aplicação
      urlPattern: ({ request }) =>
        request.destination === "script",

      handler: "StaleWhileRevalidate",

      options: {
        cacheName: "js-cache"
      }
    },

    {
      // Arquivos CSS
      urlPattern: ({ request }) =>
        request.destination === "style",

      handler: "StaleWhileRevalidate",

      options: {
        cacheName: "css-cache"
      }
    },

    {
      // Páginas HTML
      urlPattern: ({ request }) =>
        request.destination === "document",

      handler: "NetworkFirst", // tenta rede primeiro

      options: {
        cacheName: "html-cache"
      }
    }
  ]
};
