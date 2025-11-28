import { salvarLocal, listarLocais, removerLocal } from "./indexeddb.js";

// Elementos da interface
const btnCapturar = document.getElementById("btnCapturar");
const btnSalvar = document.getElementById("btnSalvar");
const btnAdicionar = document.getElementById("btnAdicionar");

const campoNome = document.getElementById("nome");
const campoLat = document.getElementById("lat");
const campoLng = document.getElementById("lng");

const listaEl = document.getElementById("lista");

let mapa;
let camadaMarcadores;

// Cria e configura o mapa
function iniciarMapa() {
    mapa = L.map("mapa").setView([-23.5, -46.6], 5);
    camadaMarcadores = L.layerGroup().addTo(mapa);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap"
    }).addTo(mapa);
}

// Callback de sucesso da geolocalização
function sucessoLocalizacao(pos) {
    const { latitude, longitude } = pos.coords;

    campoLat.value = latitude.toFixed(6);
    campoLng.value = longitude.toFixed(6);

    camadaMarcadores.clearLayers();
    L.marker([latitude, longitude])
        .addTo(camadaMarcadores)
        .bindPopup("Você está aqui")
        .openPopup();

    mapa.setView([latitude, longitude], 15);
}

// Callback de erro
function erroLocalizacao() {
    alert("Não foi possível capturar sua localização.");
}

// Capturar localização atual
btnCapturar.addEventListener("click", () => {
    if (!navigator.geolocation) {
        return alert("Seu navegador não suporta geolocalização.");
    }

    navigator.geolocation.getCurrentPosition(sucessoLocalizacao, erroLocalizacao);
});

// Salvar ponto no banco
btnSalvar.addEventListener("click", async () => {
    const nome = campoNome.value.trim();
    const lat = Number(campoLat.value);
    const lng = Number(campoLng.value);

    if (!nome || !lat || !lng) {
        return alert("Preencha o nome, latitude e longitude.");
    }

    await salvarLocal(nome, lat, lng, Date.now());
    campoNome.value = "";

    carregarLista();
});

// Adicionar apenas no mapa (sem salvar)
btnAdicionar.addEventListener("click", () => {
    const lat = Number(campoLat.value);
    const lng = Number(campoLng.value);
    const nome = campoNome.value.trim() || "Local manual";

    if (!lat || !lng) {
        return alert("Latitude e longitude inválidas.");
    }

    if (!mapa) iniciarMapa();

    L.marker([lat, lng])
        .addTo(camadaMarcadores)
        .bindPopup(nome)
        .openPopup();

    mapa.setView([lat, lng], 15);
});

// Carrega todos os itens já salvos
async function carregarLista() {
    const locais = await listarLocais();

    listaEl.innerHTML = "";

    if (!mapa) iniciarMapa();
    camadaMarcadores.clearLayers();

    locais.forEach(item => {
        const li = document.createElement("li");
        li.className = "lista-item";
        li.textContent = `${item.nome} (${item.lat.toFixed(6)}, ${item.lng.toFixed(6)})`;

        const btnExcluir = document.createElement("button");
        btnExcluir.textContent = "Excluir";
        btnExcluir.className = "btn-excluir";

        btnExcluir.onclick = async () => {
            await removerLocal(item.id);
            carregarLista();
        };

        li.appendChild(btnExcluir);
        listaEl.appendChild(li);

        L.marker([item.lat, item.lng])
            .addTo(camadaMarcadores)
            .bindPopup(item.nome);
    });
}

// Inicializa lista + mapa
carregarLista();

// Service Worker
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
}
