// src/js/db.js
export function abrirDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('roteiroDB', 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('locais')) {
        db.createObjectStore('locais', { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function salvarLocal(local) {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('locais', 'readwrite');
    const store = tx.objectStore('locais');
    const req = store.add(local);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function listarLocais() {
  const db = await abrirDB();
  return new Promise((resolve) => {
    const store = db.transaction('locais', 'readonly').objectStore('locais');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
  });
}

export async function removerLocal(id) {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('locais', 'readwrite');
    const store = tx.objectStore('locais');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
