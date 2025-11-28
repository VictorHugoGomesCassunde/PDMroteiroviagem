const DB_NAME = "geoloc-db";
const DB_VERSION = 1;
const STORE_NAME = "locais";

// Abre (ou cria) o banco de dados
function abrirBanco() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = () => {
            const db = req.result;

            // Cria o store caso ainda não exista
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { 
                    keyPath: "id",
                    autoIncrement: true 
                });
            }
        };

        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

// Salva um registro no banco
export async function salvarLocal(nome, lat, lng, criadoEm) {
    const db = await abrirBanco();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);

        const dados = { nome, lat, lng, criadoEm };

        const req = store.add(dados);

        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
    });
}

// Lista todos os registros
export async function listarLocais() {
    const db = await abrirBanco();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();

        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

// Remove um item pelo ID
export async function removerLocal(id) {
    const db = await abrirBanco();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);

        const req = store.delete(id);

        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
    });
}
