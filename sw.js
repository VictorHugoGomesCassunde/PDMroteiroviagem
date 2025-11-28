// Instalado quando o navegador registra o Service Worker
self.addEventListener("install", () => {
    console.log("Service Worker instalado");
});

// Ativado após instalação — útil para limpar caches antigos
self.addEventListener("activate", () => {
    console.log("Service Worker ativado");
});

// Obs: o Workbox gera o resto automático no build,
// então essa versão aqui é mínima.
