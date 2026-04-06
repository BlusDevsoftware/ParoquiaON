// Configurações globais para os testes
import '@testing-library/jest-dom';

// Mock do localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock do sessionStorage
const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
};
global.sessionStorage = sessionStorageMock;

// Mock do fetch
global.fetch = jest.fn();

// Mock do console
global.console = {
    ...console,
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn()
};

// Limpar todos os mocks antes de cada teste
beforeEach(() => {
    jest.clearAllMocks();
});

// Configurações de timeout
jest.setTimeout(10000);

// Mock do window.alert
window.alert = jest.fn();

// Mock do window.confirm
window.confirm = jest.fn();

// Mock do window.prompt
window.prompt = jest.fn();

// Mock do window.location
delete window.location;
window.location = {
    href: '',
    reload: jest.fn(),
    replace: jest.fn()
};

// Mock do window.history
window.history = {
    pushState: jest.fn(),
    replaceState: jest.fn(),
    back: jest.fn(),
    forward: jest.fn()
};

// Mock do window.document
document.body.innerHTML = '';
document.head.innerHTML = '';

// Mock do window.matchMedia
window.matchMedia = jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
})); 