// Armazenamento local no iPad (IndexedDB): progresso, obras salvas e desenhos adicionados.
let dbp;
function db() {
  if (!dbp) {
    dbp = new Promise((res, rej) => {
      const r = indexedDB.open('atelie', 1);
      r.onupgradeneeded = () => {
        const d = r.result;
        d.createObjectStore('estado');
        d.createObjectStore('obras', { keyPath: 'id', autoIncrement: true });
        d.createObjectStore('paginas', { keyPath: 'id' });
      };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  }
  return dbp;
}

async function tx(store, mode, fn) {
  const d = await db();
  return new Promise((res, rej) => {
    const t = d.transaction(store, mode);
    const req = fn(t.objectStore(store));
    t.oncomplete = () => res(req && req.result);
    t.onerror = () => rej(t.error);
  });
}

export const store = {
  get: (s, k) => tx(s, 'readonly', (o) => o.get(k)).catch(() => undefined),
  put: (s, v, k) => tx(s, 'readwrite', (o) => (k === undefined ? o.put(v) : o.put(v, k))).catch(() => undefined),
  del: (s, k) => tx(s, 'readwrite', (o) => o.delete(k)).catch(() => undefined),
  all: (s) => tx(s, 'readonly', (o) => o.getAll()).catch(() => []),
};
