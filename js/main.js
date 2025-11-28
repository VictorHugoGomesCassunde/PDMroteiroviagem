// Importa as funções do banco de dados
import { salvarLocal, listarLocais, removerLocal } from "./indexeddb.js";

// Pegando elementos do HTML
const btnCapturar = document.getElementById("btnCapturar");
const btnSalvar = document.getElementById("btnSalvar");
const btnAdicionar = document.getElementById("btnAdicionar");

const campoNome = document.getElementById("nome");
const campoLat = document.getElementById("lat");
const campoLng = document.getElementById("lng");

const listaEl = document.getElementById("lista");

// Variáveis globais do mapa
let mapa;
let camadaMarcadores;

// Inicializa o mapa do Leaflet
function iniciarMapa() {
    // Posição inicial genérica (Brasil)
    mapa = L.map("mapa").setView([-23.5, -46.6], 5);

    // Camada onde ficarão os marcadores
    camadaMarcadores = L.layerGroup().addTo(mapa);

    // Carrega tiles do OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap"
    }).addTo(mapa);
}

// Quando a geolocalização funciona corretamente
function sucessoLocalizacao(pos) {
    const { latitude, longitude } = pos.coords;

    // Preenche os campos
    campoLat.value = latitude.toFixed(6);
    campoLng.value = longitude.toFixed(6);

    // Remove marcadores antigos
    camadaMarcadores.clearLayers();

    // Marca a posição atual no mapa
    L.marker([latitude, longitude])
        .addTo(camadaMarcadores)
        .bindPopup("Você está aqui")
        .openPopup();

    // Centraliza o mapa no ponto
    mapa.setView([latitude, longitude], 15);
}

// Quando a geolocalização falha
function erroLocalizacao() {
    alert("Não foi possível capturar sua localização.");
}

// Botão: capturar localização atual
btnCapturar.addEventListener("click", () => {
    if (!navigator.geolocation) {
        return alert("Seu navegador não suporta geolocalização.");
    }

    // Solicita localização ao navegador
    navigator.geolocation.getCurrentPosition(sucessoLocalizacao, erroLocalizacao);
});

// Botão: salvar ponto no banco
btnSalvar.addEventListener("click", async () => {
    const nome = campoNome.value.trim();
    const lat = Number(campoLat.value);
    const lng = Number(campoLng.value);

    // Verificação simples
    if (!nome || !lat || !lng) {
        return alert("Preencha o nome, latitude e longitude.");
    }

    // Salva no IndexedDB
    await salvarLocal(nome, lat, lng, Date.now());

    campoNome.value = ""; // limpa o campo nome

    carregarLista();
});

// Botão: adicionar apenas no mapa (não salva no banco)
btnAdicionar.addEventListener("click", () => {
    const lat = Number(campoLat.value);
    const lng = Number(campoLng.value);
    const nome = campoNome.value.trim() || "Local manual";

    if (!lat || !lng) {
        return alert("Latitude e longitude inválidas.");
    }

    if (!mapa) iniciarMapa();

    // Adiciona marcador no mapa
    L.marker([lat, lng])
        .addTo(camadaMarcadores)
        .bindPopup(nome)
        .openPopup();

    mapa.setView([lat, lng], 15);
});

// Atualiza a lista de locais e desenha todos no mapa
async function carregarLista() {
    const locais = await listarLocais();

    listaEl.innerHTML = ""; // limpa lista

    if (!mapa) iniciarMapa();
    camadaMarcadores.clearLayers();

    locais.forEach(item => {
        // Cria item da lista
        const li = document.createElement("li");
        li.className = "lista-item";
        li.textContent = `${item.nome} (${item.lat.toFixed(6)}, ${item.lng.toFixed(6)})`;

        // Botão de excluir
        const btnExcluir = document.createElement("button");
        btnExcluir.textContent = "Excluir";
        btnExcluir.className = "btn-excluir";

        // Ação do botão
        btnExcluir.onclick = async () => {
            await removerLocal(item.id);
            carregarLista(); // recarrega tudo
        };

        li.appendChild(btnExcluir);
        listaEl.appendChild(li);

        // Adiciona marcador no mapa
        L.marker([item.lat, item.lng])
            .addTo(camadaMarcadores)
            .bindPopup(item.nome);
    });
}

// Carrega locais ao iniciar
carregarLista();

// Registra o Service Worker se disponível
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
}
