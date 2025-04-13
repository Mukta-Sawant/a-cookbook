// indexedDB.js
const DB_NAME = 'ACookbookDB';
const STORE_NAME = 'recipes';
const DB_VERSION = 1;

export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: '_id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveRecipes(recipes) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  recipes.forEach(recipe => store.put(recipe));
}

export async function getStoredRecipes() {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      console.log('[IndexedDB] Retrieved', request.result?.length, 'recipes');
      resolve(request.result || []);
    };
    request.onerror = () => {
      console.error('Error getting from IndexedDB:', request.error);
      reject([]);
    };
  });
}
