class DatabaseManager {
    constructor() {
        this._db = undefined;
    }

    create() {
        const req = window.indexedDB.open('ygo-duels', 1);
        req.addEventListener('upgradeneeded', (event) => {
            console.info('Upgrade needed');
            console.log(event);

            let db = event.target.result;
            let objStore = db.createObjectStore('cards', {keyPath: 'id'});
            objStore.createIndex('name', 'name', {unique: true});
        });

        return new Promise((resolve, reject) => {
            req.addEventListener('success', (event) => {
                this._db = event.target.result;
                resolve(event.target.result);
            });
            req.addEventListener('error', () => {
                reject(req.errorCode);
            });
        });
    }

    insert(tableName, obj) {
        let transaction = this._db.transaction([tableName], "readwrite");
        let store = transaction.objectStore(tableName);
        store.add(obj);
        return new Promise((resolve, reject) => {
            transaction.addEventListener('complete', (event) => {
                resolve(event.target.result);
            });
            transaction.addEventListener('error', () => {
                reject(transaction.errorCode);
            });
        });
    }

    remove(tableName, id) {
        let transaction = this._db.transaction([tableName], "readwrite");
        let store = transaction.objectStore(tableName);
        store.delete(id);
        return new Promise((resolve, reject) => {
            transaction.addEventListener('complete', (event) => {
                resolve(event.target.result);
            });
            transaction.addEventListener('error', () => {
                reject(transaction.errorCode);
            });
        });
    }

    getById(tableName, id) {
        let transaction = this._db.transaction([tableName], "readonly");
        let store = transaction.objectStore(tableName);
        store.get(id);
        return new Promise((resolve, reject) => {
            transaction.addEventListener('complete', (event) => {
                resolve(event.target.result);
            });
            transaction.addEventListener('error', () => {
                reject(transaction.errorCode);
            });
        });
    }

    getByName(tableName, name) {
        let transaction = this._db.transaction([tableName], "readonly");
        let index = transaction.objectStore(tableName).index('name');
        index.get(name);
        return new Promise((resolve, reject) => {
            transaction.addEventListener('complete', (event) => {
                resolve(event.target.result);
            });
            transaction.addEventListener('error', () => {
                reject(transaction.errorCode);
            });
        });
    }
}

export {DatabaseManager};
