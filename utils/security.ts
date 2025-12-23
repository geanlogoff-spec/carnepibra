/**
 * Security utilities for input validation and sanitization
 */

/**
 * Sanitize HTML to prevent XSS attacks
 */
export const sanitizeHTML = (input: string): string => {
    const map: { [key: string]: string } = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        "/": '&#x2F;',
    };
    const reg = /[&<>"'/]/ig;
    return input.replace(reg, (match) => map[match]);
};

/**
 * Validate CPF/CNPJ format
 */
export const validateDocument = (doc: string): boolean => {
    const cleaned = doc.replace(/\D/g, '');

    // CPF: 11 digits
    if (cleaned.length === 11) {
        return validateCPF(cleaned);
    }

    // CNPJ: 14 digits
    if (cleaned.length === 14) {
        return validateCNPJ(cleaned);
    }

    return false;
};

const validateCPF = (cpf: string): boolean => {
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) {
        sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;

    return true;
};

const validateCNPJ = (cnpj: string): boolean => {
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;

    let length = cnpj.length - 2;
    let numbers = cnpj.substring(0, length);
    const digits = cnpj.substring(length);
    let sum = 0;
    let pos = length - 7;

    for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers.charAt(length - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;

    length = length + 1;
    numbers = cnpj.substring(0, length);
    sum = 0;
    pos = length - 7;

    for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers.charAt(length - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;

    return true;
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

/**
 * Validate PIX key format
 */
export const validatePixKey = (key: string): boolean => {
    const cleaned = key.trim();

    // CPF/CNPJ
    if (/^\d+$/.test(cleaned.replace(/\D/g, ''))) {
        return validateDocument(cleaned);
    }

    // Email
    if (cleaned.includes('@')) {
        return validateEmail(cleaned);
    }

    // Phone
    if (/^\+?55/.test(cleaned)) {
        const phone = cleaned.replace(/\D/g, '');
        return phone.length >= 12 && phone.length <= 13;
    }

    // Random key (UUID)
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleaned)) {
        return true;
    }

    return false;
};

/**
 * Validate monetary amount
 */
export const validateAmount = (amount: number): boolean => {
    return amount > 0 && amount <= 999999.99 && Number.isFinite(amount);
};

/**
 * Rate limiting helper
 */
export class RateLimiter {
    private attempts: Map<string, number[]> = new Map();
    private maxAttempts: number;
    private windowMs: number;

    constructor(maxAttempts: number = 5, windowMs: number = 60000) {
        this.maxAttempts = maxAttempts;
        this.windowMs = windowMs;
    }

    check(key: string): boolean {
        const now = Date.now();
        const attempts = this.attempts.get(key) || [];

        // Remove old attempts
        const recentAttempts = attempts.filter(time => now - time < this.windowMs);

        if (recentAttempts.length >= this.maxAttempts) {
            return false;
        }

        recentAttempts.push(now);
        this.attempts.set(key, recentAttempts);

        return true;
    }

    reset(key: string): void {
        this.attempts.delete(key);
    }
}

/**
 * Simple hash function for client-side (NOT for production passwords!)
 */
export const simpleHash = async (text: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Encrypt data for localStorage (basic XOR encryption - for demo only)
 */
export const encryptData = (data: string, key: string): string => {
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
        encrypted += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(encrypted);
};

/**
 * Decrypt data from localStorage
 */
export const decryptData = (encrypted: string, key: string): string => {
    try {
        const decoded = atob(encrypted);
        let decrypted = '';
        for (let i = 0; i < decoded.length; i++) {
            decrypted += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return decrypted;
    } catch {
        return '';
    }
};

/**
 * Secure storage wrapper
 */
export class SecureStorage {
    private key: string;

    constructor(key: string = 'carnepib-secure-key') {
        this.key = key;
    }

    setItem(itemKey: string, value: any): void {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        const encrypted = encryptData(stringValue, this.key);
        localStorage.setItem(itemKey, encrypted);
    }

    getItem(itemKey: string): any {
        const encrypted = localStorage.getItem(itemKey);
        if (!encrypted) return null;

        const decrypted = decryptData(encrypted, this.key);
        if (!decrypted) return null;

        try {
            return JSON.parse(decrypted);
        } catch {
            return decrypted;
        }
    }

    removeItem(itemKey: string): void {
        localStorage.removeItem(itemKey);
    }

    clear(): void {
        localStorage.clear();
    }
}
