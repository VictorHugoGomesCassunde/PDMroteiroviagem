// src/js/main.js
import { salvarLocal, listarLocais, removerLocal } from './db.js';
import { atualizarMapa } from './map.js';

const btn = document.getElementById('localizacao');
const btnSalvar = document.getElementById('salvar');
const lista = document.getElementById('listaLocais');
const nomeLocal = document.getElementById('nome');
const latitudeSpan = document.getElementById('latitude');
const longitudeSpan = document.getElementById('longitude');

let ultimaPos = { lat: null, lon: null };

btn.addEventListener('click', () => {
  if (!navigator.geolocation) return alert('Geolocalização não suportada');
  navigator.geolocation.getCurrentPosition(sucesso, erro, { enableHighAccuracy: true });
});

function sucesso(pos) {
  const lat = pos.coords.latitude;
  const lon = pos.coords.longitude;
  ultimaPos = { lat, lon };
  latitudeSpan.textContent = lat;
  longitudeSpan.textContent = lon;
  atualizarMapa(lat, lon);
}

function erro(e) {
  alert('Erro ao capturar localização: ' + (e.message || e.code));
}

// salvar
btnSalvar.addEventListener('click', async () => {
  const nome = nomeLocal.value.trim();
  if (!nome) return alert('Digite um nome para o local.');
  if (ultimaPos.lat == null) return alert('Capture a localização primeiro.');

  await salvarLocal({ nome, lat: String(ultimaPos.lat), lon: String(ultimaPos.lon), createdAt: Date.now() });
  nomeLocal.value = '';
  carregarLista();
});

// listar e deletar
async function carregarLista() {
  const dados = await listarLocais();
  lista.innerHTML = '';
  dados.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${item.nome}</strong> — (${item.lat}, ${item.lon})
      <button data-id="${item.id}" class="del">Remover</button>
      <button data-lat="${item.lat}" data-lon="${item.lon}" class="ver">Ver no mapa</button>
    `;
    lista.appendChild(li);
  });

  document.querySelectorAll('.del').forEach(btn => {
    btn.addEventListener('click', async e => {
      const id = Number(e.target.dataset.id);
      await removerLocal(id);
      carregarLista();
    });
  });

  document.querySelectorAll('.ver').forEach(btn => {
    btn.addEventListener('click', e => {
      const lat = e.target.dataset.lat;
      const lon = e.target.dataset.lon;
      latitudeSpan.textContent = lat;
      longitudeSpan.textContent = lon;
      atualizarMapa(lat, lon);
    });
  });
}

carregarLista();

// registrar service worker (mantendo type: 'module' caso seu sw.js use imports de módulos)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { type: 'module' })
      .then(reg => console.log('Service Worker registrado', reg))
      .catch(err => console.warn('ERRO reg SW', err));
  });
}
