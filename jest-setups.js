const TSDI = require("tsdi").TSDI;

class LocalStorageMock {
    constructor() {
        this.clear();
    }

    clear() {
        this.store = {};
    }

    getItem(key) {
        return this.store[key];
    }

    setItem(key, value) {
        this.store[key] = value.toString();
    }

    removeItem(key) {
        delete this.store[key];
    }
}
window.localStorage = new LocalStorageMock();

baseUrl = "example.com";
window.requestAnimationFrame = (callback, element) => {
    setTimeout(() => callback(10), 10);
};

beforeEach(() => {
    tsdi = new TSDI();
    tsdi.enableComponentScanner();
});

afterEach(() => {
    tsdi.close();
});
