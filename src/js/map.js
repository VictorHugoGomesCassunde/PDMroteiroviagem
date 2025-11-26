// src/js/map.js
export function atualizarMapa(lat, lon) {
  const iframe = document.getElementById('mapa');
  if (!lat || !lon) {
    iframe.src = '';
    return;
  }
  iframe.src = `https://maps.google.com/maps?q=${lat},${lon}&z=15&output=embed`;
}
