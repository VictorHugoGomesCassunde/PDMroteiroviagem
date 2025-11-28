// Nome do banco, versão e nome da "tabela" (Object Store)
const DB_NAME = "geoloc-db";
const DB_VERSION = 1;
const STORE_NAME = "locais";

// Função para abrir o banco, criando se não existir
function abrirBanco() {
    return new Promise((resolve, reject) => {

        // Abre (ou cria) o banco IndexedDB
        const req = indexedDB.open(DB_NAME, DB_VERSION);

        // Executa quando o banco precisa ser criado ou atualizado
        req.onupgradeneeded = () => {
            const db = req.result;

            // Cria o Object Store caso ele ainda não exista
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, {
                    keyPath: "id",      // chave primária
                    autoIncrement: true // gera IDs automaticamente
                });
            }
        };

        // Sucesso ao abrir o banco
        req.onsuccess = () => resolve(req.result);

        // Erro ao abrir o banco
        req.onerror = () => reject(req.error);
    });
}

// Salva um novo local no banco
export async function salvarLocal(nome, lat, lng, criadoEm) {
    const db = await abrirBanco();

    return new Promise((resolve, reject) => {
        // Inicia transação de escrita
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);

        // Dados que serão salvos
        const dados = { nome, lat, lng, criadoEm };

        const req = store.add(dados);

        // Sucesso ao inserir
        req.onsuccess = () => resolve(true);

        // Erro ao inserir
        req.onerror = () => reject(req.error);
    });
}

// Retorna todos os registros salvos
export async function listarLocais() {
    const db = await abrirBanco();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);

        // Pega todos os itens de uma vez
        const req = store.getAll();

        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

// Remove um local pelo ID
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
