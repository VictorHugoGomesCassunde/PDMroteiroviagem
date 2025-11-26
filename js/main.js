import { salvarLocal, listarLocais, removerLocal } from "./indexeddb.js";

const btnCapturar = document.getElementById("btnCapturar");
const btnSalvar = document.getElementById("btnSalvar");
const nomeInput = document.getElementById("nome");
const latInput = document.getElementById("lat");
const lngInput = document.getElementById("lng");
const listaEl = document.getElementById("lista");

let mapa;
let camadaMarcadores;

// ==============================
// Iniciar mapa
// ==============================
function iniciarMapa() {
    mapa = L.map('mapa').setView([-23.5, -46.6], 5);
    camadaMarcadores = L.layerGroup().addTo(mapa);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(mapa);
}

// ==============================
// Capturar GPS
// ==============================
const sucesso = (pos) => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    latInput.value = lat.toFixed(6);
    lngInput.value = lng.toFixed(6);

    camadaMarcadores.clearLayers();
    L.marker([lat, lng]).addTo(camadaMarcadores).bindPopup("Você está aqui").openPopup();
    mapa.setView([lat, lng], 15);
};

const erro = () => alert("Erro ao capturar localização");

btnCapturar.addEventListener("click", () => {
    if (!navigator.geolocation) return alert("Navegador não suporta geolocalização.");
    navigator.geolocation.getCurrentPosition(sucesso, erro);
});

// ==============================
// Salvar dados
// ==============================
btnSalvar.addEventListener("click", async () => {
    const nome = nomeInput.value.trim();
    const lat = Number(latInput.value.trim());
    const lng = Number(lngInput.value.trim());

    if (!nome || !lat || !lng) return alert("Preencha nome, lat e lng!");

    await salvarLocal(nome, lat, lng, Date.now());

    nomeInput.value = "";
    carregarLista();
});

// ==============================
// Carregar locais salvos
// ==============================
async function carregarLista() {
    const itens = await listarLocais();
    listaEl.innerHTML = "";

    if (!mapa) iniciarMapa();
    camadaMarcadores.clearLayers();

    itens.forEach(i => {
        // Lista
        const li = document.createElement("li");
        li.textContent = `${i.nome} (${i.lat.toFixed(6)}, ${i.lng.toFixed(6)})`;

        const btnExcluir = document.createElement("button");
        btnExcluir.textContent = "Excluir";
        btnExcluir.onclick = async () => {
            await removerLocal(i.id);
            carregarLista();
        };

        li.appendChild(btnExcluir);
        listaEl.appendChild(li);

        // Marcador no mapa
        L.marker([i.lat, i.lng])
            .addTo(camadaMarcadores)
            .bindPopup(i.nome);
    });
}

carregarLista();

// ==============================
// Registrar Service Worker
// ==============================
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
}
