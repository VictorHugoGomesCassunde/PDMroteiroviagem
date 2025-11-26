module.exports = {
  globDirectory: "dist/",
  globPatterns: [
    "**/*.{html,js,css,png,svg,jpg}"
  ],
  swDest: "dist/sw.js",
  runtimeCaching: [
    {
      urlPattern: ({url}) => url.origin.includes("tile.openstreetmap.org"),
      handler: "CacheFirst",
      options: {
        cacheName: "map-tiles",
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 7 // 7 dias
        }
      }
    },
    {
      urlPattern: ({request}) => request.destination === "script",
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "js-cache"
      }
    },
    {
      urlPattern: ({request}) => request.destination === "style",
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "css-cache"
      }
    },
    {
      urlPattern: ({request}) => request.destination === "document",
      handler: "NetworkFirst",
      options: {
        cacheName: "html-cache"
      }
    }
  ]
};
